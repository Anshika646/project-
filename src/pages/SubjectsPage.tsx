import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ListOrdered,
} from 'lucide-react';
import { academicService } from '../services/academicService';
import { Subject, Chapter } from '../types/database.types';

export const SubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-math');
  const [activeDepartment, setActiveDepartment] = useState<string>('All');

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDept, setNewSubDept] = useState('Mathematics & Computing');
  const [newSubCredits, setNewSubCredits] = useState('4.0');
  const [newSubElective, setNewSubElective] = useState(false);

  // Chapter Form
  const [newChNumber, setNewChNumber] = useState('1');
  const [newChTitle, setNewChTitle] = useState('');
  const [newChDesc, setNewChDesc] = useState('');
  const [newChPeriods, setNewChPeriods] = useState('10');

  useEffect(() => {
    loadData();
  }, [institutionId]);

  const loadData = async () => {
    const subList = await academicService.getSubjects(institutionId);
    setSubjects(subList);
    const chList = await academicService.getChapters();
    setChapters(chList);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCode) return;

    await academicService.addSubject({
      institution_id: institutionId,
      name: newSubName,
      code: newSubCode.toUpperCase(),
      department: newSubDept,
      credits: parseFloat(newSubCredits) || 3.0,
      is_elective: newSubElective,
    });

    await loadData();
    setIsAddSubjectOpen(false);
    setNewSubName('');
    setNewSubCode('');
    setToastMessage(`Subject "${newSubName}" successfully added to curriculum!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove subject "${name}"?`)) return;
    await academicService.deleteSubject(id);
    await loadData();
    setToastMessage(`Subject "${name}" removed from active catalog.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChTitle || !selectedSubjectId) return;

    await academicService.addChapter({
      institution_id: institutionId,
      subject_id: selectedSubjectId,
      class_id: 'class-10',
      chapter_number: parseInt(newChNumber, 10) || 1,
      title: newChTitle,
      description: newChDesc,
      total_periods: parseInt(newChPeriods, 10) || 10,
    });

    await loadData();
    setIsAddChapterOpen(false);
    setNewChTitle('');
    setNewChDesc('');
    setToastMessage(`Chapter "${newChTitle}" added to syllabus!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const departments = ['All', 'Foundational', 'Primary Languages', 'Primary Sciences', 'Natural Sciences', 'Social Sciences', 'Science Stream', 'Commerce Stream', 'Humanities Stream'];

  const filteredSubjects = subjects.filter((s) => {
    if (activeDepartment === 'All') return true;
    return s.department?.toLowerCase().includes(activeDepartment.toLowerCase());
  });

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectChapters = chapters.filter((c) => c.subject_id === selectedSubject?.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight flex items-center gap-2">
            <BookOpen className="text-[#DA5FCE]" size={28} />
            <span>Curriculum Subjects & Chapter Syllabus</span>
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Configure subject catalogs across all academic streams and manage chapter-wise learning objectives
          </p>
        </div>

        <button
          onClick={() => setIsAddSubjectOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} />
          <span>Add New Subject</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-[#DA5FCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Department Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-black/5 dark:border-white/5 scrollbar-none">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveDepartment(dept)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeDepartment === dept
                ? 'bg-[#DA5FCE] text-white shadow-sm'
                : 'text-[#566859] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Main Split View: Subject Catalog + Chapter Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subjects List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667768] dark:text-[#9FB1A2]">
              Subjects Catalog ({filteredSubjects.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredSubjects.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              const chCount = chapters.filter((c) => c.subject_id === sub.id).length;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#DA5FCE] text-white border-[#DA5FCE] shadow-md shadow-[#DA5FCE]/20'
                      : 'glass-card border-white/70 dark:border-white/10 hover:border-[#8DA390]/40 text-[#252D26] dark:text-[#EAEFEA]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#8DA390]/15 text-[#303E33] dark:text-[#D1E0D3]'
                        }`}
                      >
                        {sub.code}
                      </span>
                      {sub.is_elective && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${isSelected ? 'bg-white/15 text-white/90' : 'bg-[#E8B4B8]/20 text-[#A64B56]'}`}>
                          Elective
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm mt-1.5 leading-tight">{sub.name}</h4>
                    <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[#728374]'}`}>
                      {sub.department} • {chCount} Chapters Listed
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(sub.id, sub.name);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#9AA89C] hover:text-[#A64B56]'
                    }`}
                    title="Remove Subject"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Chapter Syllabus Builder for Selected Subject */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-white/70 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DA5FCE] dark:text-[#A3B899]">
                  Chapter-Wise Syllabus Breakdown
                </span>
                <h3 className="text-xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] mt-0.5">
                  {selectedSubject?.name} ({selectedSubject?.code})
                </h3>
                <p className="text-xs text-[#667768] dark:text-[#9FB1A2]">
                  Department: {selectedSubject?.department} • Credits: {selectedSubject?.credits}
                </p>
              </div>

              <button
                onClick={() => {
                  setNewChNumber(String(subjectChapters.length + 1));
                  setIsAddChapterOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA] transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Chapter</span>
              </button>
            </div>

            {/* Chapters list */}
            <div className="space-y-3 mt-5">
              {subjectChapters.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-xs text-[#778879]">
                  No chapters defined yet for this subject. Click "Add Chapter" above to enter learning units.
                </div>
              ) : (
                subjectChapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-4 rounded-2xl glass-card border border-white/70 dark:border-white/10 hover:shadow-sm transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-[#DA5FCE]/10 text-[#DA5FCE] font-bold text-xs flex items-center justify-center">
                          {ch.chapter_number}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#232F25] dark:text-[#F0F5F1]">
                          {ch.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#DA5FCE] dark:text-[#A3B899]">
                        <Clock size={12} />
                        <span>{ch.total_periods || 8} Periods</span>
                      </div>
                    </div>

                    {ch.description && (
                      <p className="text-xs text-[#556757] dark:text-[#B6C8B8] leading-relaxed pl-9">
                        {ch.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-lg text-[#232F25] dark:text-[#F0F5F1]">
                Add Curriculum Subject
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-xs text-[#667768]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Environmental Biotechnology"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BIO-12"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Academic Department</label>
                <select
                  value={newSubDept}
                  onChange={(e) => setNewSubDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="Foundational">Foundational</option>
                  <option value="Primary Languages">Primary Languages</option>
                  <option value="Primary Sciences">Primary Sciences</option>
                  <option value="Natural Sciences">Natural Sciences</option>
                  <option value="Mathematics & Computing">Mathematics & Computing</option>
                  <option value="Social Sciences">Social Sciences</option>
                  <option value="Science Stream">Science Stream (Classes 11-12)</option>
                  <option value="Commerce Stream">Commerce Stream (Classes 11-12)</option>
                  <option value="Humanities Stream">Humanities Stream (Classes 11-12)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="electiveCheck"
                  checked={newSubElective}
                  onChange={(e) => setNewSubElective(e.target.checked)}
                  className="rounded text-[#DA5FCE] focus:ring-[#DA5FCE]"
                />
                <label htmlFor="electiveCheck" className="text-xs font-semibold text-[#C64EBA]">
                  Elective / Optional Subject
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#DA5FCE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {isAddChapterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-extrabold text-lg text-[#232F25] dark:text-[#F0F5F1]">
                Add Chapter to {selectedSubject?.name}
              </h3>
              <button onClick={() => setIsAddChapterOpen(false)} className="text-xs text-[#667768]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChapter} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Ch. Number</label>
                  <input
                    type="number"
                    value={newChNumber}
                    onChange={(e) => setNewChNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-bold"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Total Teaching Periods</label>
                  <input
                    type="number"
                    value={newChPeriods}
                    onChange={(e) => setNewChPeriods(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Chapter Title</label>
                <input
                  type="text"
                  placeholder="e.g. Differential Equations & Modelling"
                  value={newChTitle}
                  onChange={(e) => setNewChTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#C64EBA] block mb-1">Syllabus Outline & Key Topics</label>
                <textarea
                  rows={3}
                  placeholder="Summary of formulas, experimental setups, and board questions..."
                  value={newChDesc}
                  onChange={(e) => setNewChDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddChapterOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#DA5FCE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DA5FCE] text-white hover:bg-[#C64EBA]"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
