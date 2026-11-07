import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Users,
  CheckCircle2,
  ChevronRight,
  School,
  Sparkles,
} from 'lucide-react';
import { academicService } from '../services/academicService';
import { teacherService } from '../services/teacherService';
import { ClassItem, Section, Teacher, CurriculumBoard } from '../types/database.types';

export const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-10');
  const [board, setBoard] = useState<CurriculumBoard>('CBSE');

  // Modals
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('E');
  const [newSectionRoom, setNewSectionRoom] = useState('Room 305');
  const [newSectionTeacher, setNewSectionTeacher] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [institutionId]);

  const loadData = async () => {
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
    const secList = await academicService.getSections();
    setSections(secList);
    const teachList = await teacherService.getTeachers(institutionId);
    setTeachers(teachList);
    setBoard(academicService.getCurriculumBoard());
  };

  const handleBoardChange = (newBoard: CurriculumBoard) => {
    setBoard(newBoard);
    academicService.setCurriculumBoard(newBoard);
    setToastMessage(`Curriculum framework updated to ${newBoard} standards!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName || !selectedClassId) return;

    await academicService.addSection({
      institution_id: institutionId,
      class_id: selectedClassId,
      name: newSectionName.toUpperCase(),
      room_number: newSectionRoom,
      capacity: 35,
      class_teacher_id: newSectionTeacher || null,
    });

    await loadData();
    setIsSectionModalOpen(false);
    setToastMessage(`Section ${newSectionName.toUpperCase()} successfully added!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const stages = ['All', 'Foundational', 'Primary', 'Middle', 'Secondary', 'Senior Secondary'];

  const filteredClasses = classes.filter((c) => {
    if (selectedStage === 'All') return true;
    return c.stage === selectedStage;
  });

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const activeSections = sections.filter((s) => s.class_id === activeClass?.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <School className="text-[#6D28D9]" size={28} />
            <span>Academic Classes & Sections</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Complete institutional structure: Nursery to Class 12, sections A–D, and curriculum boards
          </p>
        </div>

        {/* Board Switcher */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-[#FAF8F5] px-3 py-1.5 rounded-2xl border border-[#E8E4DF] shadow-xs">
          <span className="text-[11px] font-extrabold text-[#6D28D9] uppercase tracking-wider">
            Board:
          </span>
          {(['CBSE', 'ICSE', 'State Board', 'Custom'] as CurriculumBoard[]).map((b) => (
            <button
              key={b}
              onClick={() => handleBoardChange(b)}
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${
                board === b
                  ? 'bg-[#6D28D9] text-white shadow-xs'
                  : 'text-[#0F172A] hover:bg-[#FFFFFF]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#0F172A] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#6D28D9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E4DF]">
        {stages.map((stg) => (
          <button
            key={stg}
            onClick={() => setSelectedStage(stg)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedStage === stg
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#0F172A] hover:bg-[#FFFFFF] border border-[#E8E4DF]'
            }`}
          >
            {stg}
          </button>
        ))}
      </div>

      {/* Main Grid: Class Sidebar + Section Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
              Classes ({filteredClasses.length})
            </span>
            <span className="text-[11px] font-bold text-[#6D28D9]">
              Active Session: 2025–2026
            </span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredClasses.map((cls) => {
              const count = sections.filter((s) => s.class_id === cls.id).length;
              const isSelected = cls.id === selectedClassId;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#FFFFFF] text-[#0F172A] border-[#6D28D9] shadow-xs'
                      : 'bg-white border-[#E8E4DF] hover:bg-[#FAF8F5] text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs ${
                        isSelected
                          ? 'bg-[#6D28D9] text-white shadow-xs'
                          : 'bg-[#FFFFFF] text-[#6D28D9]'
                      }`}
                    >
                      {cls.name.replace('Class ', '')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm leading-tight text-[#0F172A]">{cls.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-[#FAF8F5] text-[#6D28D9] border border-[#E8E4DF]">
                          {cls.stage}
                        </span>
                        <span className="text-[10px] font-semibold text-[#64748B]">
                          {count} Sections (A–{String.fromCharCode(64 + count)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`transition-transform group-hover:translate-x-1 ${
                      isSelected ? 'text-[#6D28D9]' : 'text-[#94A3B8]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Management for Selected Class */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)]">
            <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9]">
                  Class Overview & Allocations
                </span>
                <h3 className="font-heading text-xl font-extrabold text-[#0F172A] mt-0.5">
                  {activeClass?.name} ({activeClass?.stage} Stage)
                </h3>
              </div>

              <button
                onClick={() => {
                  setNewSectionName(String.fromCharCode(65 + activeSections.length));
                  setIsSectionModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Section</span>
              </button>
            </div>

            {/* Sections in this class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {activeSections.map((sec) => {
                const classTeacher = teachers.find((t) => t.profile_id === sec.class_teacher_id);
                return (
                  <div
                    key={sec.id}
                    className="p-4 rounded-xl bg-white border border-[#E8E4DF] hover:shadow-xs transition-shadow relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] text-[#6D28D9] border border-[#DDD6FE]/40 font-extrabold text-base flex items-center justify-center">
                          {sec.name}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0F172A]">
                            Section {sec.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#64748B]">
                            {sec.room_number || 'Room TBD'} • Cap: {sec.capacity || 35}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#6D28D9] border border-[#E8E4DF]">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8E4DF]">
                      <span className="text-[10px] uppercase font-extrabold text-[#94A3B8] block mb-1">
                        Class Teacher:
                      </span>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#6D28D9]" />
                        <span className="text-xs font-bold text-[#0F172A]">
                          {classTeacher?.profile?.full_name || 'Not yet assigned'}
                        </span>
                      </div>
                      {classTeacher?.designation && (
                        <span className="text-[10px] font-semibold text-[#64748B] block ml-5">
                          {classTeacher.designation}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Curriculum info card */}
            <div className="mt-6 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#6D28D9]" size={20} />
                <div>
                  <h5 className="font-extrabold text-xs text-[#0F172A]">
                    Active Framework: {board} Standards
                  </h5>
                  <p className="text-[11px] font-semibold text-[#64748B]">
                    Chapter outcomes and grading scales conform to {board} pedagogical specifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-[#E8E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
                Add Section to {activeClass?.name}
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Section Name (e.g. A, B, C, D, E)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-stat font-extrabold text-[#0F172A] uppercase focus:outline-none focus:border-[#6D28D9]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Assigned Classroom / Room Number
                </label>
                <input
                  type="text"
                  value={newSectionRoom}
                  onChange={(e) => setNewSectionRoom(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Assign Class Teacher
                </label>
                <select
                  value={newSectionTeacher}
                  onChange={(e) => setNewSectionTeacher(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                >
                  <option value="">-- Select Class Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.profile_id} value={t.profile_id}>
                      {t.profile?.full_name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
