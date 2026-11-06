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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-[#8B5CF6]">
              <CalendarDays size={22} />
            </div>
            <span>Parent-Teacher Meeting (PTM) Portal</span>
          </h1>
          <p className="text-xs md:text-sm text-[#625C60] mt-1 font-medium">
            Book one-on-one discussion slots, review meeting agendas, and log academic remarks
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={14} />
            <span>Book PTM Slot</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E9D5FF] text-[#171417] text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bookings.map((booking, i) => (
          <div
            key={booking.id}
            className={`p-6 rounded-2xl border border-[#E9D5FF] shadow-sm space-y-4 flex flex-col justify-between transition-all hover:border-[#8B5CF6]/50 ${
              i % 2 === 0 ? 'bg-[#F5F3FF]' : 'bg-[#FAF5FF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#171417] flex items-center gap-1.5">
                  <Clock size={12} className="text-[#8B5CF6]" />
                  <span>{booking.time_slot}</span>
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    booking.status === 'confirmed'
                      ? 'bg-[#F3E8FF] text-[#8B5CF6] border-[#8B5CF6]/30'
                      : booking.status === 'completed'
                      ? 'bg-white text-[#171417] border-[#E9D5FF]'
                      : 'bg-[#FDFBFF] text-[#A78BFA] border-[#E9D5FF]'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#171417] mt-3">
                {booking.student_name}
              </h3>
              <p className="text-xs text-[#8B5CF6] font-bold">
                With: {booking.teacher_name}
              </p>

              {booking.agenda && (
                <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E9D5FF] text-xs text-[#171417]">
                  <span className="font-extrabold block text-[10px] uppercase text-[#625C60] mb-0.5">
                    Meeting Agenda:
                  </span>
                  <p className="font-medium text-[#171417]">{booking.agenda}</p>
                </div>
              )}

              {booking.teacher_notes && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] text-xs text-[#171417]">
                  <span className="font-extrabold block text-[10px] uppercase text-[#8B5CF6] mb-0.5">
                    Teacher Follow-up Remarks:
                  </span>
                  <p className="font-medium text-[#171417]">{booking.teacher_notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E9D5FF] flex items-center justify-between">
              <span className="text-[11px] text-[#625C60] font-medium">
                Date: <strong className="text-[#171417]">{booking.booking_date}</strong>
              </span>

              {isTeacher && booking.status !== 'completed' && (
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'completed', 'Discussed board revision schedule and time management.')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-[#E9D5FF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
              <h3 className="font-extrabold text-lg text-[#171417]">
                Book PTM Discussion Slot
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-[#625C60] hover:text-[#171417]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Select Faculty / Subject Head
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
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
                  <label className="text-xs font-bold text-[#171417] block mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171417] block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
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
                <label className="text-xs font-bold text-[#171417] block mb-1">
                  Discussion Topics & Agenda
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mathematics question paper analysis, science lab work..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#625C60] hover:text-[#171417]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm"
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
