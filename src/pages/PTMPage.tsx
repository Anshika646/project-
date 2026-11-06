import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarDays,
  Clock,
  Plus,
  CheckCircle2,
  Users,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { teacherService } from '../services/teacherService';
import { PTMBooking, Teacher } from '../types/database.types';

export const PTMPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [bookings, setBookings] = useState<PTMBooking[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState('user-teacher-1');
  const [bookingDate, setBookingDate] = useState('2025-04-26');
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 10:45 AM');
  const [agenda, setAgenda] = useState('');

  useEffect(() => {
    loadData();
  }, [institutionId, role, user?.id]);

  const loadData = async () => {
    const list = await learningService.getPTMBookings(institutionId, role || undefined, user?.id);
    setBookings(list);
    const teachs = await teacherService.getTeachers(institutionId);
    setTeachers(teachs);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacherObj = teachers.find((t) => t.profile_id === selectedTeacherId);

    await learningService.createPTMBooking({
      institution_id: institutionId,
      parent_id: user?.id || 'par-rajesh-1',
      teacher_id: selectedTeacherId,
      student_id: 'stud-aarav-1',
      parent_name: user?.profile?.full_name || 'Mr. Rajesh Patel',
      teacher_name: teacherObj?.profile?.full_name || 'Ms. Priya Verma',
      student_name: 'Aarav Patel (Class 10-A)',
      booking_date: bookingDate,
      time_slot: timeSlot,
      status: 'confirmed',
      agenda: agenda || 'Term-end performance discussion.',
    });

    await loadData();
    setIsModalOpen(false);
    setAgenda('');
    setToastMessage('PTM slot booked successfully! Meeting confirmed on schedule.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateStatus = async (id: string, status: PTMBooking['status'], notes?: string) => {
    await learningService.updatePTMStatus(id, status, notes);
    await loadData();
    setToastMessage(`PTM status updated to ${status}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isParent = role === 'parent';
  const isTeacher = ['teacher', 'school_admin'].includes(role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <CalendarDays className="text-[#DA5FCE]" size={28} />
            <span>Parent-Teacher Meeting (PTM) Portal</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Book one-on-one discussion slots, review meeting agendas, and log academic remarks
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={14} />
            <span>Book PTM Slot</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-5 rounded-3xl glass-card border border-white/70 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3] flex items-center gap-1">
                  <Clock size={11} />
                  <span>{booking.time_slot}</span>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-[#8DA390]/25 text-[#253A27]'
                      : booking.status === 'completed'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-[#E8B4B8]/30 text-[#8C3B44]'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#232F25] dark:text-[#F0F5F1] mt-2">
                {booking.student_name}
              </h3>
              <p className="text-xs text-[#DA5FCE] dark:text-[#A3B899] font-medium">
                With: {booking.teacher_name}
              </p>

              {booking.agenda && (
                <div className="mt-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-[#526354] dark:text-[#BACBBF]">
                  <span className="font-bold block text-[10px] uppercase text-[#667768] mb-0.5">
                    Meeting Agenda:
                  </span>
                  {booking.agenda}
                </div>
              )}

              {booking.teacher_notes && (
                <div className="mt-2 p-3 rounded-xl bg-[#8DA390]/15 border border-[#8DA390]/30 text-xs text-[#2A3B2D] dark:text-[#CFE0D2]">
                  <span className="font-bold block text-[10px] uppercase text-[#DA5FCE] mb-0.5">
                    Teacher Follow-up Remarks:
                  </span>
                  {booking.teacher_notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-[#718273]">
                Date: {booking.booking_date}
              </span>

              {isTeacher && booking.status !== 'completed' && (
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'completed', 'Discussed board revision schedule and time management.')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Book PTM Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-lg text-[#232F25] dark:text-[#F0F5F1]">
                Book PTM Discussion Slot
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xs text-[#667768]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Select Faculty / Subject Head
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                >
                  {teachers.map((t) => (
                    <option key={t.profile_id} value={t.profile_id}>
                      {t.profile?.full_name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="09:30 AM - 09:45 AM">09:30 AM - 09:45 AM</option>
                    <option value="10:00 AM - 10:15 AM">10:00 AM - 10:15 AM</option>
                    <option value="10:30 AM - 10:45 AM">10:30 AM - 10:45 AM</option>
                    <option value="11:00 AM - 11:15 AM">11:00 AM - 11:15 AM</option>
                    <option value="11:30 AM - 11:45 AM">11:30 AM - 11:45 AM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">
                  Discussion Topics & Agenda
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mathematics question paper analysis, science lab work..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#DA5FCE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
