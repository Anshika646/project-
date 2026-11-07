export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'college_admin'
  | 'college_faculty'
  | 'college_student';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'school' | 'college';
  logo_url?: string | null;
  banner_url?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  academic_session: string;
  is_active: boolean;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Profile {
  id: string;
  institution_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface ClassItem {
  id: string;
  institution_id: string;
  name: string;
  stage?: string | null;
  grade_level?: number | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Section {
  id: string;
  institution_id: string;
  class_id: string;
  name: string;
  room_number?: string | null;
  capacity?: number;
  class_teacher_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Subject {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  department?: string | null;
  credits?: number;
  is_elective: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Chapter {
  id: string;
  institution_id: string;
  subject_id: string;
  class_id: string;
  chapter_number: number;
  title: string;
  description?: string | null;
  total_periods?: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Student {
  id: string;
  institution_id: string;
  profile_id: string;
  admission_number: string;
  roll_number?: string | null;
  class_id: string;
  section_id: string;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
  address?: string | null;
  admission_date?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  profile?: Profile;
  class?: ClassItem;
  section?: Section;
}

export interface Teacher {
  id: string;
  institution_id: string;
  profile_id: string;
  employee_code: string;
  designation?: string;
  qualification?: string | null;
  specialization?: string | null;
  date_of_joining: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  profile?: Profile;
}

export interface Parent {
  id: string;
  institution_id: string;
  profile_id: string;
  occupation?: string | null;
  relationship: string;
  address?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  profile?: Profile;
}

export interface ParentStudentLink {
  id: string;
  institution_id: string;
  parent_id: string;
  student_id: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  student?: Student;
}

export interface TimetableSlot {
  id: string;
  institution_id: string;
  timetable_id: string;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_id: string;
  teacher_id: string;
  room_number?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  subject?: Subject;
  teacher?: Profile;
}

export interface AttendanceRecord {
  id: string;
  institution_id: string;
  student_id: string;
  class_id: string;
  section_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'excused';
  marked_by: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  student?: Student;
}

export interface Exam {
  id: string;
  institution_id: string;
  name: string;
  academic_session: string;
  term?: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface ExamSubject {
  id: string;
  institution_id: string;
  exam_id: string;
  class_id: string;
  subject_id: string;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  max_marks: number;
  pass_marks: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  subject?: Subject;
  class?: ClassItem;
}

export interface Mark {
  id: string;
  institution_id: string;
  exam_subject_id: string;
  student_id: string;
  theory_marks?: number;
  practical_marks?: number;
  internal_marks?: number;
  total_marks: number;
  grade?: string;
  is_absent: boolean;
  remarks?: string | null;
  graded_by?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  student?: Student;
  exam_subject?: ExamSubject;
}

export interface ReportCard {
  id: string;
  institution_id: string;
  exam_id: string;
  student_id: string;
  total_obtained: number;
  total_maximum: number;
  percentage: number;
  grade: string;
  rank_in_class?: number;
  attendance_percentage?: number;
  teacher_remarks?: string;
  principal_remarks?: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface NoteItem {
  id: string;
  institution_id: string;
  class_id: string;
  subject_id: string;
  chapter_id?: string | null;
  title: string;
  description?: string | null;
  content?: string | null;
  file_url?: string | null;
  file_type?: string;
  is_published: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // joined fields
  subject?: Subject;
  class?: ClassItem;
  uploader?: Profile;
}

export interface HomeworkItem {
  id: string;
  institution_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  title: string;
  instructions?: string;
  attachment_url?: string | null;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface SubmissionItem {
  id: string;
  institution_id: string;
  homework_id: string;
  student_id: string;
  submission_text?: string;
  attachment_url?: string | null;
  submitted_at: string;
  marks_obtained?: number;
  feedback?: string;
  status: 'submitted' | 'evaluated' | 'resubmit';
  evaluated_by?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface QuizItem {
  id: string;
  institution_id: string;
  class_id: string;
  subject_id: string;
  chapter_id?: string | null;
  title: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  question_count?: number;
}

export interface QuizQuestionItem {
  id: string;
  institution_id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  marks: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface QuizAttemptItem {
  id: string;
  institution_id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  answers: Record<string, string>;
  time_spent_seconds?: number;
  attempted_at: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  student?: Student;
}

export interface NoticeItem {
  id: string;
  institution_id: string;
  title: string;
  content: string;
  target_audience: 'all' | 'teachers' | 'students' | 'parents' | 'class_specific';
  target_class_id?: string | null;
  priority: 'low' | 'normal' | 'urgent';
  attachment_url?: string | null;
  published_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ActivityLogItem {
  id: string;
  institution_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export type CurriculumBoard = 'CBSE' | 'ICSE' | 'State Board' | 'Cambridge / IB' | 'Custom';

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  head_of_department: string;
  student_count: number;
  faculty_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollegeCourse {
  id: string;
  institution_id: string;
  department_id: string;
  name: string;
  code: string;
  degree_level: 'Undergraduate' | 'Postgraduate' | 'Diploma';
  total_semesters: number;
  total_credits: number;
  created_at: string;
  updated_at: string;
}

export interface CollegeStudentSemester {
  id: string;
  student_id: string;
  course_id: string;
  semester_number: number;
  sgpa: number;
  cgpa: number;
  credits_earned: number;
  backlogs: number;
  status: 'Passed' | 'Appearing' | 'Backlog';
  term_session: string;
}

export interface PTMBooking {
  id: string;
  institution_id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string;
  parent_name: string;
  teacher_name: string;
  student_name: string;
  booking_date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  agenda?: string;
  teacher_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  student_name: string;
  class_name: string;
  score: number;
  points: number;
  streak_days: number;
  badges: string[];
  quizzes_completed: number;
}

