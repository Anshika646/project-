import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  FileText,
  ChevronRight,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  DEMO_NOTES,
  DEMO_TODAYS_TIMETABLE,
  DEMO_NOTICES,
} from '../../services/mockData';
import { exportToPDF } from '../../utils/exportUtils';

interface AssignmentItem {
  id: string;
  subject: string;
  title: string;
  due: string;
  status: 'pending' | 'submitted';
  points: number;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive Quiz State
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Assignment submission interactive state
  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: 'asg-1',
      subject: 'Mathematics',
      title: 'Chapter 4: Quadratic Equations Problem Set',
      due: 'Tomorrow, 5:00 PM',
      status: 'pending',
      points: 25,
    },
    {
      id: 'asg-2',
      subject: 'Physics',
      title: 'Ray Optics & Refraction Lab Observations',
      due: 'Monday, 11:59 PM',
      status: 'pending',
      points: 30,
    },
    {
      id: 'asg-3',
      subject: 'English Literature',
      title: 'Character Sketch of Julius Caesar Essay',
      due: 'Nov 12, 4:00 PM',
      status: 'submitted',
      points: 20,
    },
  ]);

  const [activeSubmissionModal, setActiveSubmissionModal] = useState<AssignmentItem | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const sampleQuiz = [
    {
      q: 'What is the value of sin²(30°) + cos²(30°)?',
      options: ['0', '1', '1/2', '√3/2'],
      correct: '1',
      explanation: 'From the Pythagorean identity sin²θ + cos²θ = 1 for all real angles θ.',
    },
    {
      q: 'If the discriminant D = b² - 4ac > 0, the quadratic equation has:',
      options: ['Two real and distinct roots', 'Equal real roots', 'No real roots', 'Zero roots'],
      correct: 'Two real and distinct roots',
      explanation: 'A strictly positive discriminant guarantees two distinct real solutions.',
    },
    {
      q: 'Which organelle is famously known as the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
      correct: 'Mitochondria',
      explanation: 'Mitochondria generate most of the chemical energy needed to power biochemical reactions.',
    },
  ];

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
  };

  const handleNextQuizQuestion = () => {
    if (selectedOption === sampleQuiz[activeQuizQuestion].correct) {
      setQuizScore((prev) => prev + 1);
    }
    if (activeQuizQuestion + 1 < sampleQuiz.length) {
      setActiveQuizQuestion((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setActiveQuizQuestion(0);
    setSelectedOption(null);
    setQuizFinished(false);
    setQuizScore(0);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionModal) return;

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === activeSubmissionModal.id ? { ...a, status: 'submitted' } : a
      )
    );
    setSubmissionFeedback(`Assignment "${activeSubmissionModal.title}" submitted successfully!`);
    setActiveSubmissionModal(null);
    setSubmissionText('');
    setTimeout(() => setSubmissionFeedback(null), 4000);
  };

  const handleDownloadReportCard = () => {
    exportToPDF(
      'Edunexa Student Report Card — Aarav Patel (Class 10-A)',
      [
        { header: 'Subject', dataKey: 'subject' },
        { header: 'Theory (80)', dataKey: 'theory' },
        { header: 'Internal (20)', dataKey: 'internal' },
        { header: 'Total (100)', dataKey: 'total' },
        { header: 'Grade', dataKey: 'grade' },
      ],
      [
        { subject: 'Mathematics', theory: '74', internal: '20', total: '94', grade: 'A1' },
        { subject: 'Science (Physics/Chem)', theory: '70', internal: '18', total: '88', grade: 'A2' },
        { subject: 'English Literature', theory: '76', internal: '15', total: '91', grade: 'A1' },
        { subject: 'Social Science', theory: '72', internal: '19', total: '91', grade: 'A1' },
        { subject: 'Computer Applications', theory: '78', internal: '20', total: '98', grade: 'A1' },
      ],
      'Aarav-Patel-Term-ReportCard.pdf'
    );
  };

  const studentName = user?.profile.full_name || 'Aarav Patel';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Friendly Page Heading & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Good morning, {studentName}! 👋
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
            Class 10-A • Roll #14 • Springfield International School
          </p>
        </div>

        {/* Date & Primary Download CTA */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] shadow-2xs">
            <Calendar size={14} className="text-[#6D28D9]" />
            <span>Saturday, Nov 7, 2026</span>
          </div>

          <button
            onClick={handleDownloadReportCard}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-2"
          >
            <Download size={14} />
            <span>Term Report Card</span>
          </button>
        </div>
      </div>

      {/* Submission Feedback Toast */}
      {submissionFeedback && (
        <div className="p-3.5 rounded-xl bg-white border border-[#DDD6FE] text-[#0F172A] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#6D28D9]" />
            <span>{submissionFeedback}</span>
          </div>
          <button
            onClick={() => setSubmissionFeedback(null)}
            className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Row of Key Stats in Pure White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value="94.2%"
          change="Safe (> 75% threshold)"
          isPositive={true}
          icon={CalendarCheck}
        />
        <StatCard
          title="Class Standing"
          value="#2"
          change="Top 5% of Class 10-A"
          isPositive={true}
          icon={Award}
        />
        <StatCard
          title="Pending Homework"
          value="2 Due"
          change="Maths due tomorrow"
          isPositive={true}
          icon={FileText}
        />
        <StatCard
          title="Upcoming Exams"
          value="2 Tests"
          change="Maths in 4 days"
          isPositive={true}
          icon={Clock}
        />
      </div>

      {/* Main Grid: Schedule & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Schedule in Rounded White Card */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-5 border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Today's Classes & Schedule
                  </h2>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    4 sessions scheduled today
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/timetable')}
                className="text-xs font-semibold text-[#6D28D9] hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5 mt-4">
              {DEMO_TODAYS_TIMETABLE.map((slot, index) => {
                const isCurrent = index === 1;
                const isDone = index === 0;

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#FAF8F5] border-[#DDD6FE]'
                        : 'bg-white border-[#E8E4DF] hover:border-[#DDD6FE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-[#6D28D9] text-white shadow-2xs'
                            : 'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider">Per</span>
                        <span>{slot.period_number}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#0F172A]">
                            {slot.period_number === 1
                              ? 'Mathematics (Algebra)'
                              : slot.period_number === 2
                              ? 'Science (Physics: Optics)'
                              : slot.period_number === 3
                              ? 'English Literature'
                              : 'Computer Science & Python'}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded-md border border-[#DDD6FE]">
                              Active Now
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                          {slot.start_time} - {slot.end_time} • Room {slot.room_number} • Faculty: {slot.period_number === 1 ? 'Ms. Priya Verma' : 'Dr. Sharma'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-medium text-[#64748B]">
                        {isDone ? 'Completed' : isCurrent ? 'In Session' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E4DF] flex items-center justify-between text-xs text-[#64748B]">
            <span>Next break: 1:00 PM – Lunch Intermission</span>
            <span className="font-semibold text-[#0F172A]">Classroom 10-A, North Wing</span>
          </div>
        </div>

        {/* Assignments & Deadlines Card */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Assignments & Homework
                  </h2>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    2 tasks requiring your submission
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/homework')}
                className="text-xs font-semibold text-[#6D28D9] hover:underline flex items-center gap-1"
              >
                <span>All Tasks</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E8E4DF] bg-white hover:border-[#DDD6FE] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider">
                      {item.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.status === 'submitted'
                          ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                          : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                      }`}
                    >
                      {item.status === 'submitted' ? 'Submitted' : 'Pending'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#0F172A] leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-2.5 pt-2 border-t border-[#E8E4DF] flex items-center justify-between text-xs">
                    <span className="text-[#64748B] text-[11px]">
                      Due: <strong className="text-[#0F172A] font-semibold">{item.due}</strong>
                    </span>

                    {item.status === 'pending' ? (
                      <button
                        onClick={() => setActiveSubmissionModal(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-colors"
                      >
                        Submit Work
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#059669] flex items-center gap-1">
                        <CheckCircle size={13} />
                        <span>Grading Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E4DF] text-center">
            <button
              onClick={() => navigate('/homework')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline"
            >
              Browse completed assignment history →
            </button>
          </div>
        </div>
      </div>

      {/* Lower Row: Announcements + Interactive Daily Quiz + Notes Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* School Announcements Card */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Announcements
                </h2>
              </div>
              <button
                onClick={() => navigate('/notices')}
                className="text-xs font-semibold text-[#6D28D9] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {DEMO_NOTICES.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => navigate('/notices')}
                  className="p-3 rounded-xl border border-[#E8E4DF] hover:border-[#DDD6FE] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 text-[10px] text-[#64748B] mb-1">
                    <span className="font-bold text-[#6D28D9]">
                      {notice.priority === 'urgent' ? '🚨 Urgent' : '📢 Circular'}
                    </span>
                    <span>·</span>
                    <span>{notice.created_at ? new Date(notice.created_at).toLocaleDateString() : 'Today'}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] line-clamp-1">
                    {notice.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-medium line-clamp-2 mt-1">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E4DF] text-xs text-[#64748B] text-center">
            Updated regularly by Academic Administration
          </div>
        </div>

        {/* Interactive Daily Quiz Sprint */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Daily Quiz Sprint
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded-md border border-[#DDD6FE]">
                {quizFinished ? 'Score Recorded' : `Q ${activeQuizQuestion + 1}/${sampleQuiz.length}`}
              </span>
            </div>

            {!quizFinished ? (
              <div className="mt-4 space-y-3.5">
                <p className="text-xs font-bold text-[#0F172A] leading-relaxed">
                  {sampleQuiz[activeQuizQuestion].q}
                </p>

                <div className="space-y-2">
                  {sampleQuiz[activeQuizQuestion].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                        selectedOption === opt
                          ? 'bg-[#F5F3FF] border-[#6D28D9] text-[#0F172A]'
                          : 'bg-white border-[#E8E4DF] text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === opt && (
                        <CheckCircle size={15} className="text-[#6D28D9]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#6D28D9] flex items-center justify-center mb-2 border border-[#DDD6FE]">
                  <Award size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Sprint Completed!
                </h3>
                <p className="text-xs text-[#64748B] font-medium mt-1">
                  You scored <strong className="text-[#0F172A]">{quizScore} / {sampleQuiz.length}</strong> points. 50 XP has been credited!
                </p>
                <button
                  onClick={handleResetQuiz}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>

          {!quizFinished && (
            <button
              onClick={handleNextQuizQuestion}
              disabled={!selectedOption}
              className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-40 transition-all shadow-xs"
            >
              {activeQuizQuestion + 1 === sampleQuiz.length ? 'Finish & Submit' : 'Next Question →'}
            </button>
          )}
        </div>

        {/* Study Notes & Quick Downloads */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Study Material & Notes
                </h2>
              </div>
              <button
                onClick={() => navigate('/notes')}
                className="text-xs font-semibold text-[#6D28D9] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5 mt-4">
              {DEMO_NOTES.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl border border-[#E8E4DF] bg-white flex items-center justify-between hover:border-[#DDD6FE] transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] font-bold text-[#6D28D9] uppercase tracking-wider">
                      {note.subject_id === 'sub-1' ? 'Maths' : note.subject_id === 'sub-2' ? 'Physics' : 'English'}
                    </span>
                    <h3 className="text-xs font-bold text-[#0F172A] truncate">
                      {note.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      exportToPDF(
                        note.title,
                        [{ header: 'Item', dataKey: 'item' }, { header: 'Description', dataKey: 'desc' }],
                        [
                          { item: 'Topic', desc: note.title },
                          { item: 'Summary', desc: note.description || 'Curated formulas and derivations.' },
                          { item: 'Class', desc: 'Class 10-A Secondary' },
                        ],
                        `${note.title.replace(/\s+/g, '_')}.pdf`
                      );
                    }}
                    className="p-2 rounded-lg bg-[#FAF8F5] text-[#6D28D9] hover:bg-[#F5F3FF] border border-[#E8E4DF] transition-colors shrink-0"
                    title="Download Note PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E4DF] text-center">
            <button
              onClick={() => navigate('/notes')}
              className="text-xs font-semibold text-[#6D28D9] hover:underline"
            >
              Access all 24 uploaded documents →
            </button>
          </div>
        </div>
      </div>

      {/* Submit Assignment Modal */}
      {activeSubmissionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-2xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E4DF] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                  {activeSubmissionModal.subject}
                </span>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Submit Assignment
                </h3>
              </div>
              <button
                onClick={() => setActiveSubmissionModal(null)}
                className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#0F172A]">
                {activeSubmissionModal.title}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Due: {activeSubmissionModal.due} • {activeSubmissionModal.points} marks
              </p>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Your Answer or Solution Note
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your response, working steps, or paste your project GitHub / drive URL here..."
                  className="w-full p-3 text-xs rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setActiveSubmissionModal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] flex items-center gap-1.5 shadow-xs"
                >
                  <Send size={13} />
                  <span>Submit to Teacher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
