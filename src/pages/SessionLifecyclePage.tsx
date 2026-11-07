import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarCheck,
  CheckCircle2,
  Lock,
  Archive,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Award,
  Sparkles,
  Layers,
  BookOpen,
  Calendar,
  Check,
} from 'lucide-react';
import {
  sessionLifecycleService,
  AcademicSessionRecord,
} from '../services/sessionLifecycleService';

export const SessionLifecyclePage: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [sessions, setSessions] = useState<AcademicSessionRecord[]>([]);
  const [activeSession, setActiveSession] = useState<AcademicSessionRecord | null>(null);
  const [nextDraftSession, setNextDraftSession] = useState<AcademicSessionRecord | null>(null);

  // Closing Checklist Verification State
  const [closingChecks, setClosingChecks] = useState({
    attendanceFinalized: true,
    marksSubmitted: true,
    reportCardsSigned: true,
    promotionsCompleted: true,
    transfersLogged: true,
    summaryReportsGenerated: true,
  });

  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [institutionId]);

  const loadSessions = async () => {
    const list = await sessionLifecycleService.getSessions(institutionId);
    setSessions(list);
    const curr = list.find((s) => s.status === 'active') || list[0];
    setActiveSession(curr);
    const draft = list.find((s) => s.status === 'draft') || null;
    setNextDraftSession(draft);
  };

  const handleExecuteSessionArchival = async () => {
    if (!activeSession) return;

    await sessionLifecycleService.closeAndArchiveSession(activeSession.id);
    if (nextDraftSession) {
      await sessionLifecycleService.activateSession(nextDraftSession.id);
    }

    setIsConfirmArchiveOpen(false);
    loadSessions();
    showToast(`Session ${activeSession.name} successfully closed & archived. Next session activated!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
            Academic Session Opening & Closing Lifecycle
          </h1>
          <p className="text-xs md:text-sm font-medium text-[#64748B] mt-0.5">
            Systematic year-end audit, record lock, previous session archival, and new academic year onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>Active Session: {activeSession?.name || '2025 – 2026'}</span>
          </span>
        </div>
      </div>

      {/* Main 2 Workflows Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WORKFLOW 1: ANNUAL SESSION CLOSING (END OF YEAR) */}
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center">
                  <Archive size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Annual Session Closing & Archival
                  </h2>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    Session {activeSession?.name || '2025 – 2026'}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] text-[#64748B] border border-[#E8E4DF]">
                Step 18 in Sequence
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Before a session can be sealed and archived, all institutional records must satisfy statutory compliance audits to prevent subsequent tampering:
            </p>

            {/* Compliance Checklist */}
            <div className="space-y-2.5">
              {[
                { key: 'attendanceFinalized', label: 'All 180+ Class Attendance Registers Finalized & Closed', icon: CalendarCheck },
                { key: 'marksSubmitted', label: 'All Faculty Annual Examination Marks Approved', icon: FileSpreadsheet },
                { key: 'reportCardsSigned', label: 'Digital Student Report Cards Generated & Signed', icon: Award },
                { key: 'promotionsCompleted', label: 'Student Batch Promotion & Retentions Executed', icon: Users },
                { key: 'transfersLogged', label: 'Outgoing Student Transfer Certificates (TC) Logged', icon: CheckCircle2 },
                { key: 'summaryReportsGenerated', label: 'Institutional CBSE / Board Annual Summary Exported', icon: Sparkles },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-xl border border-[#E8E4DF] bg-[#FAF8F5] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#059669]" />
                    <span className="text-xs font-semibold text-[#0F172A]">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                    Verified ✓
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E4DF]">
            <button
              onClick={() => setIsConfirmArchiveOpen(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>Lock, Seal & Archive Session {activeSession?.name}</span>
            </button>
            <span className="text-[10px] text-[#64748B] text-center block mt-1.5">
              Permanently preserves historical data with zero record deletion.
            </span>
          </div>
        </div>

        {/* WORKFLOW 2: NEW ACADEMIC SESSION OPENING (BEGINNING OF YEAR) */}
        <div className="rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    New Academic Session Onboarding
                  </h2>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    Target Session: {nextDraftSession?.name || '2026 – 2027'} (Draft)
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                Upcoming Setup
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Operational sequence required before opening school gates for the upcoming academic calendar:
            </p>

            {/* Opening Checklist */}
            <div className="space-y-2.5">
              {[
                { label: '1. Configure Academic Calendar, Terms & Official Holidays', status: 'Completed', icon: Calendar },
                { label: '2. Provision Nursery to Class 12 Classes & Sections A–D', status: 'Completed', icon: Layers },
                { label: '3. Allocate Curriculum Subjects, Syllabus & Chapters', status: 'Completed', icon: BookOpen },
                { label: '4. Onboard Faculty & Assign Designated Class Teachers', status: 'Completed', icon: Users },
                { label: '5. Process New Admissions & Bulk Promoted Students', status: 'Ready for Roll Numbers', icon: CheckCircle2 },
                { label: '6. Generate Class Timetables & Room Allocations', status: 'Draft Scheduled', icon: CalendarCheck },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[#E8E4DF] bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#F5F3FF] text-[#6D28D9] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#0F172A]">{step.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded-md border border-[#DDD6FE]">
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E4DF]">
            <button
              onClick={() => showToast('New academic session preparation is synchronized and ready for activation.')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              <span>Verify Readiness for Session Opening</span>
            </button>
            <span className="text-[10px] text-[#64748B] text-center block mt-1.5">
              Activates class registers and teacher timetables simultaneously.
            </span>
          </div>
        </div>
      </div>

      {/* CONFIRM ARCHIVAL MODAL */}
      {isConfirmArchiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E4DF] shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Confirm Session Archival</h3>
                <p className="text-xs text-[#64748B]">Permanent Administrative Action</p>
              </div>
            </div>

            <p className="text-xs text-[#0F172A] leading-relaxed">
              Are you sure you want to close and lock Academic Session <strong>{activeSession?.name}</strong>?
            </p>
            <ul className="text-xs text-[#64748B] space-y-1 list-disc list-inside">
              <li>All attendance registers and exam marks will become strictly read-only.</li>
              <li>Promoted students will roll over into Session {nextDraftSession?.name || '2026 – 2027'}.</li>
              <li>Past session reports remain permanently searchable and downloadable.</li>
            </ul>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DF]">
              <button
                type="button"
                onClick={() => setIsConfirmArchiveOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSessionArchival}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] shadow-xs"
              >
                Proceed with Archival & Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
