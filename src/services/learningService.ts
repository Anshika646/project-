import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  NoteItem,
  QuizItem,
  QuizQuestionItem,
  QuizAttemptItem,
  NoticeItem,
  ActivityLogItem,
  HomeworkItem,
  PTMBooking,
  LeaderboardEntry,
  Department,
  CollegeCourse,
  CollegeStudentSemester,
} from '../types/database.types';
import {
  DEMO_NOTES,
  DEMO_QUIZZES,
  DEMO_QUIZ_QUESTIONS,
  DEMO_QUIZ_ATTEMPTS,
  DEMO_LEADERBOARD,
  DEMO_HOMEWORK,
  DEMO_PTM_BOOKINGS,
  DEMO_DEPARTMENTS,
  DEMO_COLLEGE_COURSES,
  DEMO_COLLEGE_SEMESTERS,
  DEMO_PLACEMENTS,
  DEMO_TENANT_INSTITUTIONS,
  DEMO_SUBSCRIPTION_PLANS,
  DEMO_NOTICES,
  DEMO_RECENT_ACTIVITIES,
} from './mockData';

const NOTES_KEY = 'edunexa_notes_db';
const QUIZZES_KEY = 'edunexa_quizzes_db';
const QUESTIONS_KEY = 'edunexa_questions_db';
const ATTEMPTS_KEY = 'edunexa_attempts_db';
const HOMEWORK_KEY = 'edunexa_homework_db';
const PTM_KEY = 'edunexa_ptm_db';
const NOTICES_KEY = 'edunexa_notices_db';
const INSTITUTIONS_KEY = 'edunexa_institutions_db';

function getStored<T>(key: string, fallback: T[]): T[] {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveStored<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

// ============================================================================
// 1. NOTES SERVICE (GENERATED & UPLOADED)
// ============================================================================
export const learningService = {
  async getNotes(institutionId: string, classId?: string, subjectId?: string): Promise<NoteItem[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('notes').select('*').eq('institution_id', institutionId);
      if (classId) query = query.eq('class_id', classId);
      if (subjectId) query = query.eq('subject_id', subjectId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as NoteItem[]) || [];
    }

    let all = getStored(NOTES_KEY, DEMO_NOTES);
    if (classId) all = all.filter((n) => n.class_id === classId);
    if (subjectId) all = all.filter((n) => n.subject_id === subjectId);
    return all;
  },

  async saveNote(note: Omit<NoteItem, 'id' | 'created_at' | 'updated_at'>): Promise<NoteItem> {
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notes').insert(newNote).select().single();
      if (error) throw new Error(error.message);
      return data as NoteItem;
    }

    const list = getStored(NOTES_KEY, DEMO_NOTES);
    list.unshift(newNote);
    saveStored(NOTES_KEY, list);
    return newNote;
  },

  async deleteNote(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const list = getStored(NOTES_KEY, DEMO_NOTES);
    const filtered = list.filter((n) => n.id !== id);
    saveStored(NOTES_KEY, filtered);
  },

  // ============================================================================
  // 2. QUIZZES & REAL LEADERBOARD
  // ============================================================================
  async getQuizzes(institutionId: string, classId?: string): Promise<QuizItem[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('quizzes').select('*').eq('institution_id', institutionId);
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as QuizItem[]) || [];
    }

    let all = getStored(QUIZZES_KEY, DEMO_QUIZZES);
    if (classId) all = all.filter((q) => q.class_id === classId);
    return all;
  },

  async getQuizQuestions(quizId: string): Promise<QuizQuestionItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId);
      if (error) throw new Error(error.message);
      return (data as QuizQuestionItem[]) || [];
    }

    const all = getStored(QUESTIONS_KEY, DEMO_QUIZ_QUESTIONS);
    return all.filter((q) => q.quiz_id === quizId);
  },

  async createQuiz(
    quiz: Omit<QuizItem, 'id' | 'created_at' | 'updated_at'>,
    questions: Array<Omit<QuizQuestionItem, 'id' | 'quiz_id' | 'created_at' | 'updated_at'>>
  ): Promise<QuizItem> {
    const quizId = `quiz-${Date.now()}`;
    const newQuiz: QuizItem = {
      ...quiz,
      id: quizId,
      question_count: questions.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newQuestions: QuizQuestionItem[] = questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`,
      quiz_id: quizId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quizzes').insert(newQuiz).select().single();
      if (error) throw new Error(error.message);
      await supabase.from('quiz_questions').insert(newQuestions);
      return data as QuizItem;
    }

    const quizzes = getStored(QUIZZES_KEY, DEMO_QUIZZES);
    quizzes.unshift(newQuiz);
    saveStored(QUIZZES_KEY, quizzes);

    const storedQuestions = getStored(QUESTIONS_KEY, DEMO_QUIZ_QUESTIONS);
    storedQuestions.push(...newQuestions);
    saveStored(QUESTIONS_KEY, storedQuestions);

    return newQuiz;
  },

  async submitQuizAttempt(attempt: {
    quizId: string;
    studentId: string;
    studentName: string;
    className: string;
    institutionId: string;
    answers: Record<string, string>;
    timeSpentSeconds: number;
  }): Promise<{ score: number; totalMarks: number; percentage: number }> {
    const questions = await this.getQuizQuestions(attempt.quizId);
    let score = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      totalMarks += q.marks || 1;
      const studentAns = attempt.answers[q.id];
      if (studentAns && studentAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
        score += q.marks || 1;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    const attemptRecord: QuizAttemptItem = {
      id: `att-${Date.now()}`,
      institution_id: attempt.institutionId,
      quiz_id: attempt.quizId,
      student_id: attempt.studentId,
      score,
      total_marks: totalMarks,
      percentage,
      answers: attempt.answers,
      time_spent_seconds: attempt.timeSpentSeconds,
      attempted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from('quiz_attempts').insert(attemptRecord);
    } else {
      const attempts = getStored(ATTEMPTS_KEY, DEMO_QUIZ_ATTEMPTS);
      attempts.unshift(attemptRecord);
      saveStored(ATTEMPTS_KEY, attempts);
    }

    return { score, totalMarks, percentage };
  },

  async getLeaderboard(
    period: 'daily' | 'weekly' | 'class' | 'school',
    classId?: string
  ): Promise<LeaderboardEntry[]> {
    // Dynamic leaderboard calculated from demo base + saved attempts
    let entries = [...DEMO_LEADERBOARD];

    if (period === 'class' && classId) {
      entries = entries.filter((e) => e.class_name.toLowerCase().includes('10'));
    } else if (period === 'daily') {
      entries = entries.map((e) => ({ ...e, points: Math.round(e.points / 3) }));
    }

    return entries.sort((a, b) => b.score - a.score || b.points - a.points);
  },

  // ============================================================================
  // 3. HOMEWORK & ASSIGNMENTS
  // ============================================================================
  async getHomework(institutionId: string, classId?: string): Promise<HomeworkItem[]> {
    let all = getStored(HOMEWORK_KEY, DEMO_HOMEWORK);
    if (classId) all = all.filter((h) => h.class_id === classId);
    return all;
  },

  async addHomework(homework: Omit<HomeworkItem, 'id' | 'created_at' | 'updated_at'>): Promise<HomeworkItem> {
    const newHw: HomeworkItem = {
      ...homework,
      id: `hw-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const list = getStored(HOMEWORK_KEY, DEMO_HOMEWORK);
    list.unshift(newHw);
    saveStored(HOMEWORK_KEY, list);
    return newHw;
  },

  // ============================================================================
  // 4. PTM BOOKINGS
  // ============================================================================
  async getPTMBookings(institutionId: string, role?: string, userId?: string): Promise<PTMBooking[]> {
    const all = getStored(PTM_KEY, DEMO_PTM_BOOKINGS);
    if (role === 'parent') {
      return all.filter((p) => p.parent_id === 'par-rajesh-1' || p.parent_id === userId);
    }
    if (role === 'teacher') {
      return all.filter((p) => p.teacher_id === 'user-teacher-1' || p.teacher_id === userId);
    }
    return all;
  },

  async createPTMBooking(booking: Omit<PTMBooking, 'id' | 'created_at' | 'updated_at'>): Promise<PTMBooking> {
    const newBooking: PTMBooking = {
      ...booking,
      id: `ptm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const list = getStored(PTM_KEY, DEMO_PTM_BOOKINGS);
    list.unshift(newBooking);
    saveStored(PTM_KEY, list);
    return newBooking;
  },

  async updatePTMStatus(id: string, status: PTMBooking['status'], teacherNotes?: string): Promise<void> {
    const list = getStored(PTM_KEY, DEMO_PTM_BOOKINGS);
    const item = list.find((b) => b.id === id);
    if (item) {
      item.status = status;
      if (teacherNotes) item.teacher_notes = teacherNotes;
      item.updated_at = new Date().toISOString();
      saveStored(PTM_KEY, list);
    }
  },

  // ============================================================================
  // 5. COLLEGE MODULE WORKFLOWS
  // ============================================================================
  async getDepartments(): Promise<Department[]> {
    return DEMO_DEPARTMENTS;
  },

  async getCollegeCourses(): Promise<CollegeCourse[]> {
    return DEMO_COLLEGE_COURSES;
  },

  async getStudentCollegeSemesters(studentId: string): Promise<CollegeStudentSemester[]> {
    return DEMO_COLLEGE_SEMESTERS.filter((s) => s.student_id === studentId || s.student_id === 'user-college-student-1');
  },

  async getCollegePlacements() {
    return DEMO_PLACEMENTS;
  },

  // ============================================================================
  // 6. SUPER ADMIN SAAS PORTAL
  // ============================================================================
  async getTenantInstitutions() {
    return getStored(INSTITUTIONS_KEY, DEMO_TENANT_INSTITUTIONS);
  },

  async toggleInstitutionStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    const list = getStored(INSTITUTIONS_KEY, DEMO_TENANT_INSTITUTIONS);
    const inst = list.find((i) => i.id === id);
    if (inst) {
      inst.status = status;
      saveStored(INSTITUTIONS_KEY, list);
    }
  },

  async approveInstitution(id: string): Promise<void> {
    const list = getStored(INSTITUTIONS_KEY, DEMO_TENANT_INSTITUTIONS);
    const inst = list.find((i) => i.id === id);
    if (inst) {
      inst.status = 'active';
      saveStored(INSTITUTIONS_KEY, list);
    }
  },

  async getSubscriptionPlans() {
    return DEMO_SUBSCRIPTION_PLANS;
  },
};

// ============================================================================
// 7. NOTICES & ACTIVITY LOGS
// ============================================================================
export const communicationService = {
  async getNotices(institutionId: string): Promise<NoticeItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('institution_id', institutionId)
        .order('published_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data as NoticeItem[]) || [];
    }
    return getStored(NOTICES_KEY, DEMO_NOTICES);
  },

  async createNotice(notice: Omit<NoticeItem, 'id' | 'created_at' | 'updated_at'>): Promise<NoticeItem> {
    const newNotice: NoticeItem = {
      ...notice,
      id: `not-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const list = getStored(NOTICES_KEY, DEMO_NOTICES);
    list.unshift(newNotice);
    saveStored(NOTICES_KEY, list);
    return newNotice;
  },

  async getActivityLogs(institutionId: string): Promise<ActivityLogItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return (data as ActivityLogItem[]) || [];
    }
    return DEMO_RECENT_ACTIVITIES;
  },
};
