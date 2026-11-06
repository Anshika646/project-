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
} from 'lucide-react';
import {
  DEMO_NOTES,
  DEMO_TODAYS_TIMETABLE,
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
    <div className="space-y-6 max-w-7xl mx-auto bg-white">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight">
            Hi, {user?.profile.full_name || 'Aarav Patel'}!
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#625C60] mt-0.5">
            Class 10-A • Roll #14 • Springfield International School
          </p>
        </div>

        <button
          onClick={handleDownloadReportCard}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F5F3FF] hover:bg-[#F3E8FF] text-[#8B5CF6] border border-[#C4B5FD] shadow-xs flex items-center gap-2 self-start md:self-auto transition-all"
        >
          <Award size={15} className="text-[#8B5CF6]" />
          <span>Download Term Report Card (PDF)</span>
        </button>
      </div>

      {/* 4 Stat Cards in Light Pink & Cream */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value="94.2%"
          change="Safe (> 75%)"
          isPositive={true}
          icon={CalendarCheck}
          variant="pink"
        />
        <StatCard
          title="Academic Rank"
          value="#2"
          change="Top 5% of Class"
          isPositive={true}
          icon={Award}
          variant="cream"
        />
        <StatCard
          title="Daily Quiz Streak"
          value="7 Days"
          change="🔥 Top Contender"
          isPositive={true}
          icon={Flame}
          variant="rose"
        />
        <StatCard
          title="Study Material"
          value="24 Files"
          change="All Free to Download"
          isPositive={true}
          icon={BookOpen}
          variant="blush"
        />
      </div>

      {/* Middle Grid: Interactive Quiz + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Quiz Sprint in Light Pink Card */}
        <div className="lg:col-span-7 rounded-2xl bg-[#F5F3FF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#8B5CF6]" />
                <h3 className="font-heading text-sm font-extrabold text-[#171417]">
                  Daily Math Quiz Sprint
                </h3>
              </div>
              <span className="text-xs font-bold text-[#8B5CF6] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full">
                {quizFinished ? 'Completed' : `Question ${activeQuizQuestion + 1} of ${sampleQuiz.length}`}
              </span>
            </div>

            {!quizFinished ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm font-bold text-[#171417]">
                  {sampleQuiz[activeQuizQuestion].q}
                </p>

                <div className="space-y-2">
                  {sampleQuiz[activeQuizQuestion].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                        selectedOption === opt
                          ? 'bg-white border-[#8B5CF6] text-[#171417] shadow-xs'
                          : 'bg-white/80 border-[#E9D5FF] text-[#171417] hover:bg-white hover:border-[#C4B5FD]'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === opt && <CheckCircle size={16} className="text-[#8B5CF6]" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 rounded-2xl bg-white border border-[#E9D5FF] text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] border border-[#C4B5FD]/40 text-[#8B5CF6] flex items-center justify-center mb-2 shadow-xs">
                  <Award size={24} />
                </div>
                <h4 className="font-heading text-base font-extrabold text-[#171417]">
                  Quiz Sprint Completed!
                </h4>
                <p className="text-xs font-semibold text-[#625C60] mt-1">
                  You scored {quizScore} / {sampleQuiz.length} points • 100 XP added to your School Rank!
                </p>
              </div>
            )}
          </div>

          {!quizFinished && (
            <button
              onClick={handleNextQuizQuestion}
              disabled={!selectedOption}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 transition-all shadow-sm"
            >
              {activeQuizQuestion + 1 === sampleQuiz.length ? 'Submit Quiz' : 'Next Question'}
            </button>
          )}
        </div>

        {/* Today's Timetable Schedule in Cream Pink */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FAF5FF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#8B5CF6]" />
              <h3 className="font-heading text-sm font-extrabold text-[#171417]">
                Today's Classes
              </h3>
            </div>
            <span className="text-xs font-bold text-[#8B5CF6] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full">
              Class 10-A
            </span>
          </div>

          <div className="space-y-2.5 mt-3">
            {DEMO_TODAYS_TIMETABLE.map((slot) => (
              <div
                key={slot.id}
                className="p-2.5 rounded-xl bg-white border border-[#E9D5FF] flex items-center justify-between text-xs hover:border-[#C4B5FD] transition-colors"
              >
                <div>
                  <p className="font-extrabold text-[#171417]">
                    {slot.period_number === 1 ? 'Mathematics' : slot.period_number === 2 ? 'Science (Physics)' : slot.period_number === 3 ? 'English Literature' : 'Computer Science'}
                  </p>
                  <p className="text-[10px] font-semibold text-[#625C60]">
                    {slot.start_time} - {slot.end_time} • {slot.room_number}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3E8FF] text-[#8B5CF6]">
                  P{slot.period_number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Published Notes & Downloads in Cream Card */}
      <div className="rounded-2xl bg-[#FDFBFF] p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#8B5CF6]" />
            <h3 className="font-heading text-sm font-extrabold text-[#171417]">
              Study Material & Notes for Class 10
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8B5CF6]">
            Instant Free Download
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DEMO_NOTES.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white border border-[#E9D5FF] flex flex-col justify-between hover:border-[#C4B5FD] transition-colors"
            >
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3E8FF] text-[#8B5CF6] border border-[#C4B5FD]/40">
                  {note.file_type?.toUpperCase()} Format
                </span>
                <h4 className="text-xs font-extrabold text-[#171417] mt-2">
                  {note.title}
                </h4>
                <p className="text-[11px] font-medium text-[#625C60] line-clamp-2 mt-1">
                  {note.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E9D5FF]">
                <span className="text-[10px] font-semibold text-[#858087]">Uploaded by Faculty</span>
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all flex items-center gap-1.5 shadow-xs"
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
