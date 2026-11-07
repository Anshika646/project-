import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Building,
  Calendar,
  Layers,
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  Plus,
  Edit,
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  sessionLifecycleService,
  AcademicSessionRecord,
} from '../services/sessionLifecycleService';

export const AcademicSetupPage: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [activeTab, setActiveTab] = useState<'sessions' | 'boards' | 'streams' | 'grading'>('sessions');
  const [sessions, setSessions] = useState<AcademicSessionRecord[]>([]);

  // Selected Board
  const [selectedBoard, setSelectedBoard] = useState<'CBSE' | 'ICSE' | 'State Board' | 'Cambridge / IB'>('CBSE');
  const [passingPercentage, setPassingPercentage] = useState<number>(33);
  const [internalWeightage, setInternalWeightage] = useState<number>(20);

  // New Session Modal
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('2027 – 2028');
  const [newSessionStart, setNewSessionStart] = useState('2027-04-01');
  const [newSessionEnd, setNewSessionEnd] = useState('2028-03-31');
  const [newSessionStatus, setNewSessionStatus] = useState<'draft' | 'active'>('draft');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [institutionId]);

  const loadSessions = async () => {
    const list = await sessionLifecycleService.getSessions(institutionId);
    setSessions(list);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await sessionLifecycleService.createSession({
      institution_id: institutionId,
      name: newSessionName,
      start_date: newSessionStart,
      end_date: newSessionEnd,
      status: newSessionStatus,
      terms_count: 2,
      total_working_days: 222,
    });
    setIsNewSessionModalOpen(false);
    loadSessions();
    showToast(`Academic session "${newSessionName}" created.`);
  };

  const handleActivateSession = async (sessionId: string, name: string) => {
    await sessionLifecycleService.activateSession(sessionId);
    loadSessions();
    showToast(`Session "${name}" is now the ACTIVE academic year.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const gradingBands = [
    { grade: 'A1', min: 91, max: 100, desc: 'Outstanding / Exceptional Mastery', points: 10 },
    { grade: 'A2', min: 81, max: 90, desc: 'Excellent / Distinction', points: 9 },
    { grade: 'B1', min: 71, max: 80, desc: 'Very Good / High Proficiency', points: 8 },
    { grade: 'B2', min: 61, max: 70, desc: 'Good / Above Average', points: 7 },
    { grade: 'C1', min: 51, max: 60, desc: 'Satisfactory / Competent', points: 6 },
    { grade: 'C2', min: 41, max: 50, desc: 'Average / Developing', points: 5 },
    { grade: 'D', min: 33, max: 40, desc: 'Marginal Pass / Needs Attention', points: 4 },
    { grade: 'E', min: 0, max: 32, desc: 'Essential Repeat / Below Threshold', points: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-white border border-[#DDD6FE] text-[#0F172A] text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[#6D28D9]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Academic Setup & Configuration
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
            Configure academic sessions lifecycle, affiliation boards, streams, terms, and institutional grading scales.
          </p>
        </div>

        {activeTab === 'sessions' && (
          <button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={15} />
            <span>Create New Session</span>
          </button>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E8E4DF] w-fit shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'sessions' ? 'bg-[#6D28D9] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Academic Sessions Lifecycle
        </button>
        <button
          onClick={() => setActiveTab('boards')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'boards' ? 'bg-[#6D28D9] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Affiliation Boards & Curriculum
        </button>
        <button
          onClick={() => setActiveTab('streams')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'streams' ? 'bg-[#6D28D9] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Class 11 & 12 Streams
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'grading' ? 'bg-[#6D28D9] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Grading Scale & Assessment
        </button>
      </div>

      {/* TAB 1: ACADEMIC SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions.map((ses) => (
              <div
                key={ses.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  ses.status === 'active'
                    ? 'bg-white border-[#6D28D9] shadow-md ring-2 ring-[#6D28D9]/10'
                    : ses.status === 'closed'
                    ? 'bg-[#FAF8F5] border-[#E8E4DF] opacity-90'
                    : 'bg-white border-[#E8E4DF] shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        ses.status === 'active'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : ses.status === 'closed'
                          ? 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}
                    >
                      {ses.status === 'active' ? '● Active Session' : ses.status === 'closed' ? 'Archived / Closed' : 'Draft / Upcoming'}
                    </span>
                    {ses.is_locked && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#64748B]">
                        <Lock size={12} />
                        <span>Records Locked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Academic Year {ses.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 font-medium">
                    Duration: {ses.start_date} to {ses.end_date}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#E8E4DF] space-y-1.5 text-xs text-[#64748B]">
                    <div className="flex items-center justify-between">
                      <span>Terms / Semesters:</span>
                      <strong className="text-[#0F172A]">{ses.terms_count} Formal Terms</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Working Days:</span>
                      <strong className="text-[#0F172A]">{ses.total_working_days} Days</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E8E4DF]">
                  {ses.status === 'draft' ? (
                    <button
                      onClick={() => handleActivateSession(ses.id, ses.name)}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors"
                    >
                      Activate this Session
                    </button>
                  ) : ses.status === 'active' ? (
                    <div className="text-center py-1.5 text-xs font-bold text-[#059669] bg-[#ECFDF5] rounded-xl border border-[#A7F3D0]">
                      Current Operational Session ✓
                    </div>
                  ) : (
                    <div className="text-center py-1.5 text-xs font-medium text-[#64748B] bg-white rounded-xl border border-[#E8E4DF]">
                      Archived for Historical Record
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E8E4DF] text-xs text-[#64748B]">
            <strong className="text-[#0F172A]">Academic Session Isolation Rule:</strong> Historical student report cards, attendance registers, and exam marks for closed sessions remain permanently preserved and immutable. Opening a new session promotes students without deleting past academic achievements.
          </div>
        </div>
      )}

      {/* TAB 2: AFFILIATION BOARDS */}
      {activeTab === 'boards' && (
        <div className="rounded-2xl bg-white border border-[#E8E4DF] p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Affiliation Board Selection</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select your institution's governing education board to align assessment weighting and promotion criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'CBSE', title: 'Central Board (CBSE)', desc: 'Continuous Comprehensive Assessment with 80% Theory + 20% Internal Assessment' },
              { id: 'ICSE', title: 'CISCE / ICSE Board', desc: 'In-depth application curriculum with comprehensive project work and practical exams' },
              { id: 'State Board', title: 'State Secondary Board', desc: 'Prescribed regional state board curriculum with localized language integration' },
              { id: 'Cambridge / IB', title: 'Cambridge / IB World', desc: 'Inquiry-based international curriculum with internal oral & portfolio moderation' },
            ].map((board) => (
              <div
                key={board.id}
                onClick={() => {
                  setSelectedBoard(board.id as any);
                  showToast(`Curriculum framework set to ${board.title}`);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBoard === board.id
                    ? 'border-[#6D28D9] bg-[#F5F3FF] shadow-xs'
                    : 'border-[#E8E4DF] bg-white hover:border-[#DDD6FE]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#0F172A]">{board.title}</h4>
                  {selectedBoard === board.id && (
                    <CheckCircle2 size={16} className="text-[#6D28D9]" />
                  )}
                </div>
                <p className="text-xs text-[#64748B]">{board.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8E4DF] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Minimum Annual Passing Percentage (%)
              </label>
              <input
                type="number"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">Standard CBSE/ICSE mandate is 33% aggregate.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Internal Assessment Weightage (%)
              </label>
              <input
                type="number"
                value={internalWeightage}
                onChange={(e) => setInternalWeightage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">Split as 80% Final Examination + 20% Periodic / Portfolio.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STREAMS */}
      {activeTab === 'streams' && (
        <div className="rounded-2xl bg-white border border-[#E8E4DF] p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Senior Secondary Streams (Classes 11 & 12)</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Configure elective combinations and compulsory subject baskets for Higher Secondary students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] space-y-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                Science Stream
              </span>
              <h4 className="text-sm font-bold text-[#0F172A]">Medical / Non-Medical (PCM / PCB)</h4>
              <ul className="text-xs text-[#64748B] space-y-1.5 list-disc list-inside">
                <li>Compulsory: English Core</li>
                <li>Compulsory: Physics</li>
                <li>Compulsory: Chemistry</li>
                <li>Core Elective: Mathematics or Biology</li>
                <li>5th Subject: Computer Science / Physical Education</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] space-y-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                Commerce Stream
              </span>
              <h4 className="text-sm font-bold text-[#0F172A]">Finance & Business Administration</h4>
              <ul className="text-xs text-[#64748B] space-y-1.5 list-disc list-inside">
                <li>Compulsory: English Core</li>
                <li>Compulsory: Accountancy</li>
                <li>Compulsory: Business Studies</li>
                <li>Compulsory: Economics</li>
                <li>5th Subject: Applied Mathematics / Informatics Practices</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] space-y-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                Humanities & Arts
              </span>
              <h4 className="text-sm font-bold text-[#0F172A]">Liberal Arts & Social Sciences</h4>
              <ul className="text-xs text-[#64748B] space-y-1.5 list-disc list-inside">
                <li>Compulsory: English Core</li>
                <li>Compulsory: History</li>
                <li>Compulsory: Political Science</li>
                <li>Electives: Psychology or Sociology</li>
                <li>5th Subject: Geography / Legal Studies</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GRADING MATRIX */}
      {activeTab === 'grading' && (
        <div className="rounded-2xl bg-white border border-[#E8E4DF] p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Official 9-Point Grading Scale Matrix</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Grade mapping for Term examinations and automated student report card generation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E4DF] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Marks Range</th>
                  <th className="py-2.5 px-3">Grade Point</th>
                  <th className="py-2.5 px-3">Qualitative Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {gradingBands.map((band) => (
                  <tr key={band.grade} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-extrabold text-[#6D28D9]">
                      <span className="w-7 h-7 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center font-bold">
                        {band.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#0F172A]">
                      {band.min}% – {band.max}%
                    </td>
                    <td className="py-3 px-3 text-[#0F172A] font-semibold">
                      {band.points}.0
                    </td>
                    <td className="py-3 px-3 text-[#64748B] font-medium">
                      {band.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE SESSION MODAL */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E4DF] shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="text-base font-bold text-[#0F172A]">Create Academic Session</h3>
              <button onClick={() => setIsNewSessionModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Session Title *</label>
                <input
                  required
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. 2026 – 2027"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={newSessionStart}
                    onChange={(e) => setNewSessionStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">End Date *</label>
                  <input
                    required
                    type="date"
                    value={newSessionEnd}
                    onChange={(e) => setNewSessionEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Initial Status</label>
                <select
                  value={newSessionStatus}
                  onChange={(e) => setNewSessionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-semibold text-[#0F172A] focus:outline-none"
                >
                  <option value="draft">Draft (Prepare timetable, curriculum before activation)</option>
                  <option value="active">Active (Immediate operational activation)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-xs"
                >
                  Save Academic Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
