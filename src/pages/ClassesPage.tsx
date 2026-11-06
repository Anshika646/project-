import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Layers,
  Plus,
  Users,
  BookOpen,
  Settings,
  CheckCircle2,
  Edit2,
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <School className="text-[#5B6E5E]" size={28} />
            <span>Academic Classes & Sections</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Complete institutional structure: Nursery to Class 12, sections A–D, and curriculum boards
          </p>
        </div>

        {/* Board Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto glass-card px-3 py-1.5 rounded-xl border border-white/70 dark:border-white/10">
          <span className="text-[11px] font-semibold text-[#5B6E5E] dark:text-[#A3B899] uppercase tracking-wider">
            Board:
          </span>
          {(['CBSE', 'ICSE', 'State Board', 'Custom'] as CurriculumBoard[]).map((b) => (
            <button
              key={b}
              onClick={() => handleBoardChange(b)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                board === b
                  ? 'bg-[#5B6E5E] text-white shadow-sm'
                  : 'text-[#4F6052] dark:text-[#BACBBF] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#5B6E5E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-black/5 dark:border-white/5 scrollbar-none">
        {stages.map((stg) => (
          <button
            key={stg}
            onClick={() => setSelectedStage(stg)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStage === stg
                ? 'bg-[#5B6E5E] text-white shadow-sm'
                : 'text-[#566859] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {stg}
          </button>
        ))}
      </div>

      {/* Main Grid: Class Sidebar + Section Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classes List (15 classes Nursery to 12) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667768] dark:text-[#9FB1A2]">
              Classes ({filteredClasses.length})
            </span>
            <span className="text-[11px] font-medium text-[#5B6E5E] dark:text-[#A3B899]">
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
                      ? 'bg-[#5B6E5E] text-white border-[#5B6E5E] shadow-md shadow-[#5B6E5E]/20'
                      : 'glass-card border-white/70 dark:border-white/10 hover:border-[#8DA390]/50 text-[#252D26] dark:text-[#EAEFEA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#8DA390]/15 text-[#303E33] dark:text-[#D1E0D3]'
                      }`}
                    >
                      {cls.name.replace('Class ', '')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{cls.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isSelected ? 'bg-white/15 text-white/90' : 'bg-black/5 dark:bg-white/5 text-[#667768]'
                          }`}
                        >
                          {cls.stage}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#88988A]'}`}>
                          {count} Sections (A–{String.fromCharCode(64 + count)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-white' : 'text-[#8DA390]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Management for Selected Class */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-white/70 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6E5E] dark:text-[#A3B899]">
                  Class Overview & Allocations
                </span>
                <h3 className="text-xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] mt-0.5">
                  {activeClass?.name} ({activeClass?.stage} Stage)
                </h3>
              </div>

              <button
                onClick={() => {
                  setNewSectionName(String.fromCharCode(65 + activeSections.length));
                  setIsSectionModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#5B6E5E] text-white hover:bg-[#4A5B4D] transition-colors shadow-sm flex items-center gap-1.5"
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
                    className="p-4 rounded-2xl glass-card border border-white/70 dark:border-white/10 hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#5B6E5E]/10 text-[#5B6E5E] font-black text-lg flex items-center justify-center">
                          {sec.name}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#232F25] dark:text-[#F0F5F1]">
                            Section {sec.name}
                          </h4>
                          <span className="text-[11px] text-[#667768] dark:text-[#9FB1A2]">
                            {sec.room_number || 'Room TBD'} • Cap: {sec.capacity || 35}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8DA390]/20 text-[#303E33] dark:text-[#D1E0D3]">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                      <span className="text-[10px] uppercase font-semibold text-[#8DA390] block mb-1">
                        Class Teacher:
                      </span>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#5B6E5E]" />
                        <span className="text-xs font-bold text-[#303E33] dark:text-[#D1E0D3]">
                          {classTeacher?.profile?.full_name || 'Not yet assigned'}
                        </span>
                      </div>
                      {classTeacher?.designation && (
                        <span className="text-[10px] text-[#718273] block ml-5">
                          {classTeacher.designation}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Curriculum info card */}
            <div className="mt-6 p-4 rounded-2xl bg-[#E8B4B8]/15 border border-[#E8B4B8]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#A64B56] dark:text-[#E8B4B8]" size={20} />
                <div>
                  <h5 className="font-bold text-xs text-[#232F25] dark:text-[#F0F5F1]">
                    Active Framework: {board} Standards
                  </h5>
                  <p className="text-[11px] text-[#667768] dark:text-[#9FB1A2]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-lg text-[#232F25] dark:text-[#F0F5F1]">
                Add Section to {activeClass?.name}
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="text-xs text-[#667768] hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#4A5B4D] block mb-1">
                  Section Name (e.g. A, B, C, D, E)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A5B4D] block mb-1">
                  Assigned Classroom / Room Number
                </label>
                <input
                  type="text"
                  value={newSectionRoom}
                  onChange={(e) => setNewSectionRoom(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A5B4D] block mb-1">
                  Assign Class Teacher
                </label>
                <select
                  value={newSectionTeacher}
                  onChange={(e) => setNewSectionTeacher(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="">-- Select Class Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.profile_id} value={t.profile_id}>
                      {t.profile?.full_name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6E5E] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#5B6E5E] text-white hover:bg-[#4A5B4D] shadow-sm"
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
