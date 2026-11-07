import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
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
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <BookOpen className="text-[#6D28D9]" size={28} />
            <span>Curriculum Subjects & Chapter Syllabus</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#64748B] mt-0.5">
            Configure subject catalogs across all academic streams and manage chapter-wise learning objectives
          </p>
        </div>

        <button
          onClick={() => setIsAddSubjectOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} />
          <span>Add New Subject</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6FE] text-[#0F172A] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#6D28D9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Department Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E4DF]">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveDepartment(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeDepartment === dept
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#0F172A] hover:bg-[#FFFFFF] border border-[#E8E4DF]'
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
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
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
                      ? 'bg-[#FFFFFF] text-[#0F172A] border-[#6D28D9] shadow-xs'
                      : 'bg-white border-[#E8E4DF] hover:bg-[#FAF8F5] text-[#0F172A]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-stat font-extrabold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-[#6D28D9] text-white' : 'bg-[#FFFFFF] text-[#6D28D9]'
                        }`}
                      >
                        {sub.code}
                      </span>
                      {sub.is_elective && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-[#FAF8F5] text-[#0F172A] border border-[#E8E4DF]">
                          Elective
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm mt-1.5 leading-tight text-[#0F172A]">{sub.name}</h4>
                    <span className="text-[11px] font-semibold text-[#64748B]">
                      {sub.department} • {chCount} Chapters Listed
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(sub.id, sub.name);
                    }}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#6D28D9] transition-colors"
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
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8E4DF] shadow-[0_4px_20px_-4px_rgba(15, 23, 42, 0.03)]">
            <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6D28D9]">
                  Chapter-Wise Syllabus Breakdown
                </span>
                <h3 className="font-heading text-xl font-extrabold text-[#0F172A] mt-0.5">
                  {selectedSubject?.name} ({selectedSubject?.code})
                </h3>
                <p className="text-xs font-semibold text-[#64748B]">
                  Department: {selectedSubject?.department} • Credits: {selectedSubject?.credits}
                </p>
              </div>

              <button
                onClick={() => {
                  setNewChNumber(String(subjectChapters.length + 1));
                  setIsAddChapterOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Chapter</span>
              </button>
            </div>

            {/* Chapters list */}
            <div className="space-y-3 mt-5">
              {subjectChapters.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-[#E8E4DF] text-xs font-semibold text-[#64748B]">
                  No chapters defined yet for this subject. Click "Add Chapter" above to enter learning units.
                </div>
              ) : (
                subjectChapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-4 rounded-xl bg-white border border-[#E8E4DF] hover:shadow-xs transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#FFFFFF] text-[#6D28D9] font-extrabold text-xs flex items-center justify-center">
                          {ch.chapter_number}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#0F172A]">
                          {ch.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#6D28D9] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DF]">
                        <Clock size={12} />
                        <span>{ch.total_periods || 8} Periods</span>
                      </div>
                    </div>

                    {ch.description && (
                      <p className="text-xs font-semibold text-[#64748B] leading-relaxed pl-10">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-[#E8E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
                Add Curriculum Subject
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Environmental Biotechnology"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BIO-12"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-stat font-extrabold text-[#6D28D9] uppercase focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Academic Department</label>
                <select
                  value={newSubDept}
                  onChange={(e) => setNewSubDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
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
                  className="rounded text-[#6D28D9] border-[#E8E4DF] focus:ring-[#6D28D9]"
                />
                <label htmlFor="electiveCheck" className="text-xs font-bold text-[#0F172A]">
                  Elective / Optional Subject
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-[#E8E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
                Add Chapter to {selectedSubject?.name}
              </h3>
              <button onClick={() => setIsAddChapterOpen(false)} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChapter} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Ch. Number</label>
                  <input
                    type="number"
                    value={newChNumber}
                    onChange={(e) => setNewChNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-stat font-extrabold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Total Teaching Periods</label>
                  <input
                    type="number"
                    value={newChPeriods}
                    onChange={(e) => setNewChPeriods(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Chapter Title</label>
                <input
                  type="text"
                  placeholder="e.g. Differential Equations & Modelling"
                  value={newChTitle}
                  onChange={(e) => setNewChTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Syllabus Outline & Key Topics</label>
                <textarea
                  rows={3}
                  placeholder="Summary of formulas, experimental setups, and board questions..."
                  value={newChDesc}
                  onChange={(e) => setNewChDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DF] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#6D28D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  onClick={() => setIsAddChapterOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-xs"
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
