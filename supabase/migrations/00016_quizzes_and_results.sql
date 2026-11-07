-- ==============================================================================
-- EDUNEXA MIGRATION 00016: QUIZZES & LEADERBOARD
-- Timed Assessments, Anti-Tamper Score Engine & Leaderboard Analytics
-- ==============================================================================

BEGIN;

-- 1. Quizzes Master
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  total_marks INTEGER NOT NULL DEFAULT 10,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Quiz Questions & Secure Options (Correct answer hidden from student SELECT queries)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL DEFAULT 1,
  question_type VARCHAR(30) NOT NULL DEFAULT 'mcq',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,             -- Array of string choices: ["A", "B", "C", "D"]
  correct_option_index INTEGER NOT NULL DEFAULT 0,        -- Securely inspected only during submission grading
  correct_answer TEXT,
  explanation TEXT,
  marks NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Student Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES student_session_enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  total_possible NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',      -- 'in_progress' | 'completed' | 'abandoned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_quiz_att_status CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- 4. Quiz Attempt Answers (Student responses recorded per question)
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  marks_awarded NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- 5. Trusted Database Scoring Function (Prevents Client-Side Score Forgery)
CREATE OR REPLACE FUNCTION submit_and_grade_quiz(
  p_attempt_id UUID,
  p_answers JSONB -- [{ "question_id": "...", "selected_index": 2 }, ...]
)
RETURNS TABLE (
  total_score NUMERIC(5, 2),
  total_possible NUMERIC(5, 2),
  percentage NUMERIC(5, 2)
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_attempt RECORD;
  v_answer JSONB;
  v_question RECORD;
  v_score NUMERIC(5, 2) := 0.00;
  v_total NUMERIC(5, 2) := 0.00;
  v_pct NUMERIC(5, 2) := 0.00;
  v_is_correct BOOLEAN;
  v_marks NUMERIC(4, 2);
BEGIN
  SELECT * INTO v_attempt FROM quiz_attempts WHERE id = p_attempt_id AND status = 'in_progress';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz attempt is either invalid or already submitted';
  END IF;

  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
    SELECT * INTO v_question FROM quiz_questions WHERE id = (v_answer->>'question_id')::UUID;
    IF FOUND THEN
      v_total := v_total + v_question.marks;
      IF (v_answer->>'selected_index')::INTEGER = v_question.correct_option_index THEN
        v_is_correct := true;
        v_marks := v_question.marks;
        v_score := v_score + v_marks;
      ELSE
        v_is_correct := false;
        v_marks := 0.00;
      END IF;

      INSERT INTO quiz_attempt_answers (institution_id, attempt_id, question_id, selected_option_index, is_correct, marks_awarded)
      VALUES (v_attempt.institution_id, p_attempt_id, v_question.id, (v_answer->>'selected_index')::INTEGER, v_is_correct, v_marks);
    END IF;
  END LOOP;

  IF v_total > 0 THEN
    v_pct := ROUND((v_score / v_total) * 100, 2);
  END IF;

  UPDATE quiz_attempts SET
    score = v_score,
    total_possible = v_total,
    percentage = v_pct,
    status = 'completed',
    submitted_at = NOW(),
    time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = p_attempt_id;

  RETURN QUERY SELECT v_score, v_total, v_pct;
END;
$$;

COMMIT;
