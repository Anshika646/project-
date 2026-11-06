import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Calendar,
  Flame,
  Download,
  CheckCircle,
  FileText,
  Clock,
} from 'lucide-react';
import {
  DEMO_NOTES,
  DEMO_TODAYS_TIMETABLE,
  DEMO_UPCOMING_EXAMS,
  DEMO_MARKS,
} from '../../services/mockData';
import { exportToPDF } from '../../utils/exportUtils';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

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

  const handleDownloadReportCard = () => {
    exportToPDF(
      'Edunexa Report Card — Aarav Patel (Class 10-A)',
      [
        { header: 'Subject', dataKey: 'subject' },
        { header: 'Theory', dataKey: 'theory' },
        { header: 'Practical', dataKey: 'practical' },
        { header: 'Total Marks', dataKey: 'total' },
        { header: 'Grade', dataKey: 'grade' },
      ],
      [
        { subject: 'Mathematics', theory: '74/80', practical: '20/20', total: '94/100', grade: 'A1' },
        { subject: 'Science', theory: '70/80', practical: '18/20', total: '88/100', grade: 'A2' },
        { subject: 'English', theory: '76/80', practical: '15/20', total: '91/100', grade: 'A1' },
      ],
      'Aarav-Patel-Report-Card.pdf'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Hi, {user?.profile.full_name || 'Student'}!
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Class 10-A • Roll #14 • Springfield International School
          </p>
        </div>

        <button
          onClick={handleDownloadReportCard}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-2 self-start md:self-auto"
        >
          <Award size={15} className="text-[#DA5FCE]" />
          <span>Download Term Report Card (PDF)</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value="92%"
          change="Safe (> 75%)"
          isPositive={true}
          icon={CalendarCheck}
          variant="sage"
        />
        <StatCard
          title="Academic Rank"
          value="#3"
          change="Top 5% of Class"
          isPositive={true}
          icon={Award}
          variant="olive"
        />
        <StatCard
          title="Daily Quiz Streak"
          value="7 Days"
          change="🔥 Top Contender"
          isPositive={true}
          icon={Flame}
          variant="pink"
        />
        <StatCard
          title="Study Material"
          value="24 Files"
          change="All Free to Download"
          isPositive={true}
          icon={BookOpen}
          variant="sage"
        />
      </div>

      {/* Middle Grid: Interactive Quiz + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Quiz & Practice Challenge */}
        <div className="lg:col-span-7 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#E8B4B8]" />
                <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                  Daily Math Quiz Sprint
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#DA5FCE]">
                {quizFinished ? 'Completed' : `Question ${activeQuizQuestion + 1} of ${sampleQuiz.length}`}
              </span>
            </div>

            {!quizFinished ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm font-semibold text-[#253227] dark:text-[#E2ECE4]">
                  {sampleQuiz[activeQuizQuestion].q}
                </p>

                <div className="space-y-2">
                  {sampleQuiz[activeQuizQuestion].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                        selectedOption === opt
                          ? 'bg-[#8DA390]/25 border-[#DA5FCE] text-[#1E2922] dark:text-white font-semibold'
                          : 'bg-white/60 dark:bg-white/5 border-white/60 dark:border-white/10 text-[#435345] dark:text-[#C5D3C6] hover:bg-white/90'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === opt && <CheckCircle size={15} className="text-[#DA5FCE]" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 rounded-xl bg-[#8DA390]/15 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#DA5FCE] text-white flex items-center justify-center mb-2">
                  <Award size={24} />
                </div>
                <h4 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1]">
                  Quiz Sprint Completed!
                </h4>
                <p className="text-xs text-[#5E6F60] dark:text-[#9FB1A2] mt-1">
                  You scored {quizScore} / {sampleQuiz.length} points • 100 XP added to Leaderboard!
                </p>
              </div>
            )}
          </div>

          {!quizFinished && (
            <button
              onClick={handleNextQuizQuestion}
              disabled={!selectedOption}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#DA5FCE] hover:bg-[#C64EBA] disabled:opacity-40 transition-colors shadow-sm"
            >
              {activeQuizQuestion + 1 === sampleQuiz.length ? 'Submit Quiz' : 'Next Question'}
            </button>
          )}
        </div>

        {/* Today's Timetable Schedule */}
        <div className="lg:col-span-5 rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#DA5FCE] dark:text-[#A3B899]" />
              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
                Today's Classes
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#DA5FCE]">Class 10-A</span>
          </div>

          <div className="space-y-2.5 mt-3">
            {DEMO_TODAYS_TIMETABLE.map((slot) => (
              <div
                key={slot.id}
                className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#232F25] dark:text-[#F0F5F1]">
                    {slot.period_number === 1 ? 'Mathematics' : slot.period_number === 2 ? 'Science (Physics)' : slot.period_number === 3 ? 'English Literature' : 'Computer Science'}
                  </p>
                  <p className="text-[10px] text-[#637466] dark:text-[#95A597]">
                    {slot.start_time} - {slot.end_time} • {slot.room_number}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#8DA390]/15 text-[#3E5241] dark:text-[#C2D8C2]">
                  P{slot.period_number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Published Notes & Downloads */}
      <div className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#DA5FCE] dark:text-[#A3B899]" />
            <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1]">
              Study Material & Notes for Class 10
            </h3>
          </div>
          <span className="text-xs text-[#637466] dark:text-[#95A597]">
            Instant Free Download
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DEMO_NOTES.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/5 flex flex-col justify-between"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3]">
                  {note.file_type?.toUpperCase()} Format
                </span>
                <h4 className="text-xs font-bold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                  {note.title}
                </h4>
                <p className="text-[11px] text-[#637466] dark:text-[#95A597] line-clamp-2 mt-1">
                  {note.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] text-[#78897B]">Uploaded by Faculty</span>
                <button
                  onClick={() => {
                    exportToPDF(
                      note.title,
                      [{ header: 'Section', dataKey: 'sec' }, { header: 'Details', dataKey: 'det' }],
                      [
                        { sec: 'Overview', det: note.description || '' },
                        { sec: 'Key Topics', det: 'Formulas, Derivations, and Sample Problems' },
                      ],
                      `${note.title.replace(/\s+/g, '_')}.pdf`
                    );
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
