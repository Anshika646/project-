import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle2,
  Calendar,
  Download,
  Save,
} from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { academicService } from '../services/academicService';
import { studentService } from '../services/studentService';
import { exportToExcel } from '../utils/exportUtils';
import { ClassItem, Section, Student, AttendanceRecord } from '../types/database.types';

export const AttendancePage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Filter state
  const [selectedClassId, setSelectedClassId] = useState('class-10');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-class10-a');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Attendance state for current roster
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord['status']>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, [institutionId]);

  useEffect(() => {
    loadSections();
  }, [selectedClassId]);

  useEffect(() => {
    loadRosterAndAttendance();
  }, [selectedClassId, selectedSectionId, selectedDate]);

  const loadClasses = async () => {
    const list = await academicService.getClasses(institutionId);
    setClasses(list);
  };

  const loadSections = async () => {
    const list = await academicService.getSections(selectedClassId);
    setSections(list);
    if (list.length > 0) {
      setSelectedSectionId(list[0].id);
    }
  };

  const loadRosterAndAttendance = async () => {
    const res = await studentService.getStudents({
      institutionId,
      classId: selectedClassId,
      sectionId: selectedSectionId,
      pageSize: 50,
    });
    setStudents(res.students);

    // Fetch existing attendance for this date
    const existing = await attendanceService.getAttendanceByClassAndDate(
      selectedClassId,
      selectedSectionId,
      selectedDate
    );

    const initialMap: Record<string, AttendanceRecord['status']> = {};
    const initialRemarks: Record<string, string> = {};

    res.students.forEach((s) => {
      const match = existing.find((r) => r.student_id === s.id);
      initialMap[s.id] = match ? match.status : 'present';
      initialRemarks[s.id] = match?.remarks || '';
    });

    setAttendanceMap(initialMap);
    setRemarksMap(initialRemarks);
  };

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, AttendanceRecord['status']> = {};
    students.forEach((s) => {
      allPresent[s.id] = 'present';
    });
    setAttendanceMap(allPresent);
    setToastMessage('Marked all students as Present!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveAttendance = async () => {
    const records = students.map((s) => ({
      institution_id: institutionId,
      student_id: s.id,
      class_id: selectedClassId,
      section_id: selectedSectionId,
      date: selectedDate,
      status: attendanceMap[s.id] || 'present',
      marked_by: user?.profile?.full_name || 'Ms. Priya Verma',
      remarks: remarksMap[s.id] || null,
    }));

    await attendanceService.markBatchAttendance(records);
    setToastMessage(`Daily attendance for ${selectedDate} saved to database!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportAttendance = () => {
    const exportData = students.map((s) => ({
      'Roll Number': s.roll_number || 'N/A',
      'Student Name': s.profile?.full_name || 'Student',
      'Admission No': s.admission_number,
      'Date': selectedDate,
      'Attendance Status': (attendanceMap[s.id] || 'present').toUpperCase(),
      'Remarks': remarksMap[s.id] || '',
    }));

    exportToExcel(exportData, `Attendance_${selectedDate}_Class.xlsx`);
    setToastMessage('Attendance spreadsheet exported successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present' || s === 'late').length;
  const totalCount = students.length;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  const canMark = ['teacher', 'school_admin', 'college_faculty', 'college_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <CheckCircle2 className="text-[#6D28D9]" size={28} />
            <span>Daily Attendance & Roll Call</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Class-wise attendance tracking across Nursery to Class 12 with real-time audit logs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {canMark && (
            <>
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#0F172A] border border-[#E8E4DF] shadow-xs transition-all"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Save Attendance</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportAttendance}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#0F172A] border border-[#E8E4DF] shadow-xs flex items-center gap-1.5 transition-all"
            title="Export to Excel"
          >
            <Download size={14} className="text-[#6D28D9]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#0F172A] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#6D28D9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Filters Bar in Cream Pink */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DF] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0F172A]">Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stage})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0F172A]">Section:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name} ({s.room_number || 'Room TBD'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0F172A]">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
            />
          </div>
        </div>

        {/* Live Stat Indicator */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="px-3 py-1 rounded-xl bg-white border border-[#E8E4DF] text-[#0F172A]">
            Present: {presentCount} / {totalCount}
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#6D28D9] text-white shadow-xs font-extrabold">
            Rate: {attendancePercentage}%
          </span>
        </div>
      </div>

      {/* Roll Call Table */}
      <div className="rounded-2xl bg-white overflow-hidden border border-[#E8E4DF] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#0F172A] font-extrabold border-b border-[#E8E4DF]">
              <tr>
                <th className="p-3.5 pl-6">Roll #</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Admission Number</th>
                <th className="p-3.5">Attendance Status</th>
                <th className="p-3.5 pr-6">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs font-semibold text-[#64748B]">
                    No students currently allocated to this class and section.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student.id] || 'present';

                  return (
                    <tr key={student.id} className="hover:bg-[#FFFFFF]/60 transition-colors">
                      <td className="p-3.5 pl-6 font-stat font-bold text-[#0F172A]">
                        {student.roll_number || '1'}
                      </td>
                      <td className="p-3.5 font-extrabold text-[#0F172A]">
                        {student.profile?.full_name}
                      </td>
                      <td className="p-3.5 font-stat font-extrabold text-[#6D28D9]">
                        {student.admission_number}
                      </td>
                      <td className="p-3.5">
                        {canMark ? (
                          <div className="flex items-center gap-1.5">
                            {[
                              { id: 'present', label: 'P', active: 'bg-[#6D28D9] text-white shadow-xs' },
                              { id: 'absent', label: 'A', active: 'bg-[#0F172A] text-white shadow-xs' },
                              { id: 'late', label: 'L', active: 'bg-[#8B5CF6] text-white shadow-xs' },
                              { id: 'half_day', label: 'HD', active: 'bg-[#DDD6FE] text-[#0F172A] shadow-xs' },
                            ].map((btn) => (
                              <button
                                key={btn.id}
                                type="button"
                                onClick={() => handleStatusChange(student.id, btn.id as any)}
                                className={`w-8 h-7 rounded-lg text-[11px] font-extrabold transition-all ${
                                  currentStatus === btn.id
                                    ? btn.active
                                    : 'bg-[#FAF8F5] text-[#64748B] hover:bg-[#FFFFFF]'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              currentStatus === 'present'
                                ? 'bg-[#FFFFFF] text-[#6D28D9]'
                                : currentStatus === 'absent'
                                ? 'bg-[#0F172A] text-white'
                                : 'bg-[#FAF8F5] text-[#8B5CF6]'
                            }`}
                          >
                            {currentStatus}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 pr-6">
                        {canMark ? (
                          <input
                            type="text"
                            placeholder="Optional reason for absence or tardiness..."
                            value={remarksMap[student.id] || ''}
                            onChange={(e) =>
                              setRemarksMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                            }
                            className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                          />
                        ) : (
                          <span className="text-[#64748B] font-semibold">{remarksMap[student.id] || '—'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
