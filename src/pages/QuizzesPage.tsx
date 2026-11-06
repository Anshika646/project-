import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Award,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  Flame,
  Trophy,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { academicService } from '../services/academicService';
import {
  QuizItem,
  QuizQuestionItem,
  LeaderboardEntry,
  Subject,
} from '../types/database.types';

export const QuizzesPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [activeTab, setActiveTab] = useState<'available' | 'leaderboard' | 'create'>('available');
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'daily' | 'weekly' | 'class' | 'school'>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; totalMarks: number; percentage: number } | null>(null);

  // Teacher Create Quiz State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newClassId, setNewClassId] = useState('class-10');
  const [newSubId, setNewSubId] = useState('sub-math');
  const [newDuration, setNewDuration] = useState('10');
  const [newTotalMarks, setNewTotalMarks] = useState('5');
  const [draftQuestions, setDraftQuestions] = useState<Array<{
    text: string;
    type: 'mcq' | 'true_false' | 'short';
    options: string[];
    correct: string;
    explanation: string;
  }>>([
    {
      text: 'What is the sum of the zeroes of quadratic polynomial ax² + bx + c?',
      type: 'mcq',
      options: ['-b/a', 'c/a', '-c/a', 'b/a'],
      correct: '-b/a',
      explanation: 'For any quadratic polynomial ax² + bx + c, the sum of roots is -b/a and the product of roots is c/a.',
    },
    {
      text: 'Every real number is an irrational number.',
      type: 'true_false',
      options: ['True', 'False'],
      correct: 'False',
      explanation: 'Real numbers include both rational and irrational numbers. For example, 2 is a real number but it is rational.',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [institutionId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeQuiz && timeLeft > 0 && !isSubmitted) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (activeQuiz && timeLeft === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [activeQuiz, timeLeft, isSubmitted]);

  const loadData = async () => {
    const qList = await learningService.getQuizzes(institutionId);
    setQuizzes(qList);
    const subList = await academicService.getSubjects(institutionId);
    setSubjects(subList);
    const lb = await learningService.getLeaderboard(leaderboardPeriod);
    setLeaderboard(lb);
  };

  const handlePeriodChange = async (period: 'daily' | 'weekly' | 'class' | 'school') => {
    setLeaderboardPeriod(period);
    const lb = await learningService.getLeaderboard(period);
    setLeaderboard(lb);
  };

  const handleStartQuiz = async (quiz: QuizItem) => {
    const qList = await learningService.getQuizQuestions(quiz.id);
    if (!qList || qList.length === 0) {
      setToastMessage('No questions loaded for this quiz yet.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setActiveQuiz(quiz);
    setQuestions(qList);
    setCurrentQIndex(0);
    setAnswers({});
    setTimeLeft((quiz.duration_minutes || 10) * 60);
    setIsSubmitted(false);
    setResult(null);
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitted(true);

    const timeSpent = (activeQuiz.duration_minutes * 60) - timeLeft;
    const res = await learningService.submitQuizAttempt({
      quizId: activeQuiz.id,
      studentId: user?.id || 'stud-aarav-1',
      studentName: user?.profile?.full_name || 'Aarav Patel',
      className: 'Class 10-A',
      institutionId,
      answers,
      timeSpentSeconds: timeSpent,
    });

    setResult(res);
    // Reload leaderboard
    const lb = await learningService.getLeaderboard(leaderboardPeriod);
    setLeaderboard(lb);
  };

  const handleAddDraftQuestion = () => {
    setDraftQuestions([
      ...draftQuestions,
      {
        text: 'New Question Text Here',
        type: 'mcq',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 'Option A',
        explanation: 'Detailed concept explanation.',
      },
    ]);
  };

  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    await learningService.createQuiz(
      {
        institution_id: institutionId,
        class_id: newClassId,
        subject_id: newSubId,
        title: newTitle,
        description: newDesc || 'Daily topic assessment.',
        duration_minutes: parseInt(newDuration, 10) || 10,
        total_marks: parseInt(newTotalMarks, 10) || 5,
        is_published: true,
        created_by: user?.id || 'user-teacher-1',
      },
      draftQuestions.map((q) => ({
        institution_id: institutionId,
        question_text: q.text,
        question_type: q.type,
        options: q.options,
        correct_answer: q.correct,
        explanation: q.explanation,
        marks: 1,
      }))
    );

    await loadData();
    setActiveTab('available');
    setNewTitle('');
    setNewDesc('');
    setToastMessage('New daily quiz successfully published to students!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isTeacher = ['teacher', 'school_admin', 'college_faculty', 'college_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6]">
              <Trophy size={22} />
            </div>
            <span>Daily Quizzes & Leaderboard</span>
          </h1>
          <p className="text-xs md:text-sm text-[#625C60] mt-1 font-medium">
            Real-time timed concept checks, daily learning streaks, and institution rankings
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-[#FAF5FF] p-1.5 rounded-2xl border border-[#E9D5FF] self-start md:self-auto shadow-sm">
          <button
            onClick={() => {
              setActiveQuiz(null);
              setActiveTab('available');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'available'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            Quizzes
          </button>
          <button
            onClick={() => {
              setActiveQuiz(null);
              setActiveTab('leaderboard');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[#171417] hover:bg-[#F5F3FF]'
            }`}
          >
            <Flame size={14} className={activeTab === 'leaderboard' ? 'text-white' : 'text-[#8B5CF6]'} />
            <span>Leaderboard</span>
          </button>
          {isTeacher && (
            <button
              onClick={() => {
                setActiveQuiz(null);
                setActiveTab('create');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#171417] hover:bg-[#F5F3FF]'
              }`}
            >
              <Plus size={14} />
              <span>Create Quiz</span>
            </button>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] text-[#171417] text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 1. ACTIVE PLAYING QUIZ MODAL / VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {activeQuiz && (
        <div className="bg-[#F5F3FF] p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm space-y-6">
          {/* Quiz Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9D5FF] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6]">
                Live Concept Check
              </span>
              <h2 className="text-xl font-extrabold text-[#171417] mt-0.5">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {!isSubmitted && (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#E9D5FF] font-mono text-xs font-bold text-[#8B5CF6] shadow-sm">
                  <Clock size={14} />
                  <span>
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#625C60] hover:text-[#171417] hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>

          {/* Results Summary if submitted */}
          {isSubmitted && result && (
            <div className="p-6 rounded-2xl bg-white border border-[#E9D5FF] space-y-4 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center mx-auto shadow-sm">
                <Trophy size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#171417]">
                  Quiz Completed!
                </h3>
                <p className="text-xs text-[#625C60] mt-1 font-medium">
                  You scored <span className="font-extrabold text-[#171417]">{result.score}</span> out of {result.totalMarks} marks ({result.percentage}%)
                </p>
              </div>

              <div className="flex justify-center gap-3 text-xs font-bold">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-[#171417]">
                  Accuracy: {result.percentage}%
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] text-[#8B5CF6]">
                  Streak: +1 Day Active
                </span>
              </div>
            </div>
          )}

          {/* Question Stepper */}
          {questions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-[#625C60] font-bold">
                <span className="text-[#171417]">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#8B5CF6]">Marks: {questions[currentQIndex]?.marks || 1}</span>
              </div>

              {/* Question Text */}
              <div className="p-5 rounded-2xl bg-white border border-[#E9D5FF] shadow-sm">
                <h3 className="text-base font-bold text-[#171417] leading-relaxed">
                  {questions[currentQIndex]?.question_text}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions[currentQIndex]?.options?.map((opt, idx) => {
                  const isChosen = answers[questions[currentQIndex].id] === opt;
                  const isCorrect = questions[currentQIndex].correct_answer === opt;

                  let optClass = 'bg-white border-[#E9D5FF] hover:border-[#8B5CF6] text-[#171417] font-semibold';
                  if (isSubmitted) {
                    if (isCorrect) {
                      optClass = 'bg-[#F3E8FF] border-[#8B5CF6] text-[#171417] font-bold shadow-sm';
                    } else if (isChosen && !isCorrect) {
                      optClass = 'bg-[#FAF5FF] border-[#A78BFA] text-[#858087] line-through';
                    }
                  } else if (isChosen) {
                    optClass = 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectAnswer(questions[currentQIndex].id, opt)}
                      className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && isCorrect && <CheckCircle2 size={16} className="text-[#8B5CF6]" />}
                      {isSubmitted && isChosen && !isCorrect && <XCircle size={16} className="text-[#A78BFA]" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when submitted) */}
              {isSubmitted && questions[currentQIndex]?.explanation && (
                <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs text-[#171417] space-y-1">
                  <span className="font-extrabold uppercase tracking-wider block text-[10px] text-[#8B5CF6]">
                    Concept Explanation:
                  </span>
                  <p className="leading-relaxed text-[#625C60] font-medium">{questions[currentQIndex].explanation}</p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E9D5FF]">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#171417] bg-white border border-[#E9D5FF] hover:bg-[#FAF5FF] disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm"
                  >
                    Next Question
                  </button>
                ) : !isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#171417] text-white hover:bg-black shadow-sm"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                  >
                    Return to Library
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 2. AVAILABLE QUIZZES LIST */}
      {/* ---------------------------------------------------------------------- */}
      {!activeQuiz && activeTab === 'available' && (
        <div className="space-y-4">
          {/* Subject Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubjectFilter === 'all'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'bg-[#FAF5FF] text-[#171417] border border-[#E9D5FF] hover:bg-[#F5F3FF]'
              }`}
            >
              All Subjects
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectFilter(sub.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubjectFilter === sub.id
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[#FAF5FF] text-[#171417] border border-[#E9D5FF] hover:bg-[#F5F3FF]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quizzes
              .filter((q) => selectedSubjectFilter === 'all' || q.subject_id === selectedSubjectFilter)
              .map((quiz, i) => (
                <div
                  key={quiz.id}
                  className={`rounded-2xl p-5 border border-[#E9D5FF] shadow-sm flex flex-col justify-between transition-all hover:border-[#8B5CF6]/50 ${
                    i % 3 === 0 ? 'bg-[#F5F3FF]' : i % 3 === 1 ? 'bg-[#FAF5FF]' : 'bg-[#FDFBFF]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#171417]">
                        {quiz.duration_minutes} Mins • {quiz.question_count || 5} Questions
                      </span>
                      <span className="text-[10px] font-bold text-[#8B5CF6] flex items-center gap-1 bg-[#F3E8FF] px-2 py-0.5 rounded-md">
                        <Flame size={12} />
                        <span>Daily Live</span>
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#171417] mt-3">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-[#625C60] mt-1.5 leading-relaxed line-clamp-2 font-medium">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E9D5FF] flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#171417]">
                      Total: <span className="text-[#8B5CF6]">{quiz.total_marks} Marks</span>
                    </span>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Start Quiz</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 3. REAL LEADERBOARD VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {!activeQuiz && activeTab === 'leaderboard' && (
        <div className="space-y-5">
          {/* Period selector */}
          <div className="flex items-center gap-2 border-b border-[#E9D5FF] pb-3">
            {[
              { id: 'daily', label: 'Daily Leaderboard' },
              { id: 'weekly', label: 'Weekly Sprint' },
              { id: 'class', label: 'Class 10-A Standings' },
              { id: 'school', label: 'School-Wide Champions' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  leaderboardPeriod === p.id
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[#FAF5FF] text-[#171417] border border-[#E9D5FF] hover:bg-[#F5F3FF]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="bg-[#F5F3FF] p-6 rounded-3xl border border-[#E9D5FF] shadow-sm space-y-3">
            {leaderboard.map((entry) => {
              const isTop3 = entry.rank <= 3;
              return (
                <div
                  key={entry.student_id}
                  className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isTop3
                      ? 'bg-white border-2 border-[#8B5CF6]/30 shadow-sm'
                      : 'bg-white/80 border border-[#E9D5FF]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center ${
                        entry.rank === 1
                          ? 'bg-[#F3E8FF] text-[#8B5CF6] border border-[#8B5CF6]/40 shadow-sm'
                          : entry.rank === 2
                          ? 'bg-[#FAF5FF] text-[#171417] border border-[#E9D5FF]'
                          : entry.rank === 3
                          ? 'bg-[#FDFBFF] text-[#A78BFA] border border-[#E9D5FF]'
                          : 'bg-[#FAF5FF] text-[#625C60]'
                      }`}
                    >
                      #{entry.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#171417]">
                          {entry.student_name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF5FF] border border-[#E9D5FF] text-[#625C60] font-bold">
                          {entry.class_name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {entry.badges.map((b, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#8B5CF6] border border-[#E9D5FF]"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#171417] block">
                        {entry.points} pts
                      </span>
                      <span className="text-[10px] text-[#625C60] font-medium">
                        {entry.quizzes_completed} Quizzes
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] text-xs font-bold border border-[#E9D5FF]">
                      <Flame size={14} />
                      <span>{entry.streak_days}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. TEACHER CREATE QUIZ VIEW */}
      {/* ---------------------------------------------------------------------- */}
      {!activeQuiz && activeTab === 'create' && isTeacher && (
        <div className="bg-[#F5F3FF] p-6 md:p-8 rounded-3xl border border-[#E9D5FF] shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-[#171417]">
              Author Daily Quiz & Assessment
            </h2>
            <p className="text-xs text-[#625C60] mt-0.5 font-medium">
              Select class, subject, and add MCQ, True/False or Short Answer questions
            </p>
          </div>

          <form onSubmit={handlePublishQuiz} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily Math Sprint: Quadratic Equations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Subject
                </label>
                <select
                  value={newSubId}
                  onChange={(e) => setNewSubId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={newTotalMarks}
                  onChange={(e) => setNewTotalMarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#171417] block mb-1">
                Description / Learning Target
              </label>
              <textarea
                rows={2}
                placeholder="Key concepts, syllabus scope, or instruction to students..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            {/* Questions Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B5CF6]">
                  Questions ({draftQuestions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddDraftQuestion}
                  className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add Another Question</span>
                </button>
              </div>

              {draftQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[#E9D5FF] space-y-2 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#171417]">Q{idx + 1}. Type: {q.type.toUpperCase()}</span>
                    <span className="text-[#8B5CF6] font-extrabold">1 Mark</span>
                  </div>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => {
                      const updated = [...draftQuestions];
                      updated[idx].text = e.target.value;
                      setDraftQuestions(updated);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-semibold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <div className="text-[11px] text-[#625C60]">
                    Correct Answer: <span className="font-bold text-[#171417]">{q.correct}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('available')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#625C60] hover:text-[#171417]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm"
              >
                Publish Daily Quiz
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
