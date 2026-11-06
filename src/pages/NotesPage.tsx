import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Download,
  Plus,
  Sparkles,
  Upload,
  CheckCircle2,
  Trash2,
  Eye,
} from 'lucide-react';
import { learningService } from '../services/learningService';
import { academicService } from '../services/academicService';
import { exportToPDF } from '../utils/exportUtils';
import { NoteItem, ClassItem, Subject, Chapter } from '../types/database.types';

export const NotesPage: React.FC = () => {
  const { role, user } = useAuth();
  const institutionId = user?.institution?.id || 'e8b070c0-dacd-4772-85df-0ce93748524c';

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Filter State
  const [selectedClassId, setSelectedClassId] = useState<string>('class-10');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-math');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'generate' | 'upload'>('generate');

  // Preview Note Modal
  const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);

  // Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTopic, setNoteTopic] = useState('');
  const [noteFormat, setNoteFormat] = useState<'Summary' | 'Formula Sheet' | 'Comprehensive Guide'>('Comprehensive Guide');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'handwritten' | 'image' | 'generated'>('generated');
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, [institutionId]);

  useEffect(() => {
    loadNotes();
  }, [selectedClassId, selectedSubjectId, selectedChapterId]);

  const loadMetadata = async () => {
    const clsList = await academicService.getClasses(institutionId);
    setClasses(clsList);
    const subList = await academicService.getSubjects(institutionId);
    setSubjects(subList);
    const chList = await academicService.getChapters();
    setChapters(chList);
  };

  const loadNotes = async () => {
    const list = await learningService.getNotes(
      institutionId,
      selectedClassId === 'all' ? undefined : selectedClassId,
      selectedSubjectId === 'all' ? undefined : selectedSubjectId
    );
    setNotes(list);
  };

  const handleGenerateNotes = () => {
    if (!noteTitle) {
      setToastMessage('Please enter a chapter name to generate notes');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const subObj = subjects.find((s) => s.id === selectedSubjectId);
      const clsObj = classes.find((c) => c.id === selectedClassId);

      const generated = `# ${clsObj?.name || 'Class 10'} ${subObj?.name || 'Mathematics'}: ${noteTitle}
${noteTopic ? `## Topic Focus: ${noteTopic}\n` : ''}
### 1. Conceptual Framework & Definitions
- Core theoretical principles underlying ${noteTitle}.
- Standard notation, units, and baseline axioms.
- Real-world institutional and engineering applications.

### 2. Fundamental Theorems & Formulas
1. First Principle Formulation: Derivation of the primary state relation.
2. Step-by-Step Solved Problem:
   - *Given*: Input conditions and boundary constraints.
   - *Method*: Apply algebraic substitutions.
   - *Result*: Exact solution verified with dimensional analysis.

### 3. Exam Tips & High-Yield Common Mistakes
- Watch out for sign conventions and boundary conversions.
- Ensure all intermediate units are explicitly stated in calculations.

### 4. Practice Check Questions
1. Formulate the core proof for standard conditions.
2. Solve the numerical problem using Pythagorean identities.`;

      setNoteContent(generated);
      setNoteDescription(`Chapter revision notes on ${noteTitle} (${noteFormat})`);
      setToastMessage('Notes generated! You can preview, edit, and publish below.');
      setTimeout(() => setToastMessage(null), 3000);
    }, 800);
  };

  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.name.endsWith('.pdf')) {
        setFileType('pdf');
      } else if (file.name.match(/\.(jpg|jpeg|png)$/i)) {
        setFileType('handwritten');
      }
      setNoteTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      setNoteDescription(`Teacher uploaded study document: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      setNoteContent(`[Uploaded Document Attachment]\nFile Name: ${file.name}\nType: ${file.type || 'Document'}\nSize: ${Math.round(file.size / 1024)} KB\nStatus: Verified and ready for student distribution.`);
    }
  };

  const handlePublishNote = async () => {
    if (!noteTitle) return;

    await learningService.saveNote({
      institution_id: institutionId,
      class_id: selectedClassId,
      subject_id: selectedSubjectId,
      chapter_id: selectedChapterId === 'all' ? undefined : selectedChapterId,
      title: noteTitle,
      description: noteDescription || 'Classroom study reference.',
      content: noteContent || 'Key learning objectives and solved problems.',
      file_type: modalMode === 'generate' ? 'generated' : fileType,
      file_url: fileName ? `https://example.com/uploads/${fileName}` : null,
      is_published: true,
      uploaded_by: user?.profile?.full_name || 'Ms. Priya Verma',
    });

    await loadNotes();
    setModalOpen(false);
    setNoteTitle('');
    setNoteTopic('');
    setNoteContent('');
    setFileName('');
    setToastMessage('Notes successfully approved and published to the Student Library!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove notes for "${title}"?`)) return;
    await learningService.deleteNote(id);
    await loadNotes();
    setToastMessage(`Note "${title}" removed.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPDF = (note: NoteItem) => {
    exportToPDF(
      note.title,
      [
        { header: 'Section', dataKey: 'sec' },
        { header: 'Content & Key Details', dataKey: 'text' },
      ],
      [
        { sec: 'Overview', text: note.description || 'Institutional Study Material' },
        { sec: 'Study Guide', text: note.content ? note.content.replace(/[#*`]/g, '') : 'Detailed classroom notes.' },
        { sec: 'Author & Publisher', text: `Published by ${note.uploaded_by} • Springfield International School` },
      ],
      `${note.title.replace(/\s+/g, '_')}.pdf`
    );
    setToastMessage(`PDF downloaded: ${note.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canAuthor = ['teacher', 'school_admin', 'college_faculty', 'college_admin'].includes(role || '');

  const filteredNotes = notes.filter((n) => {
    if (selectedChapterId !== 'all' && n.chapter_id) {
      return n.chapter_id === selectedChapterId;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#171417] tracking-tight flex items-center gap-2">
            <BookOpen className="text-[#8B5CF6]" size={28} />
            <span>Study Material & Notes Library</span>
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#625C60] mt-0.5">
            Two options: AI-generated chapter notes or teacher-uploaded handwritten/PDF notes
          </p>
        </div>

        {canAuthor && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                setModalMode('generate');
                setNoteTitle('');
                setNoteContent('');
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Option 1: Generate Notes</span>
            </button>

            <button
              onClick={() => {
                setModalMode('upload');
                setNoteTitle('');
                setNoteContent('');
                setModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF5FF] hover:bg-[#F5F3FF] text-[#171417] border border-[#E9D5FF] shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Upload size={14} className="text-[#8B5CF6]" />
              <span>Option 2: Upload Own Notes</span>
            </button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#C4B5FD] text-[#171417] text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-[#8B5CF6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Class & Subject Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#171417]">Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#171417]">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-[#8B5CF6] bg-[#F3E8FF] px-3 py-1 rounded-xl">
          Available Notes: {filteredNotes.length} items in library
        </span>
      </div>

      {/* Notes Grid in Light Pink and Cream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note, idx) => {
          const isPdf = note.file_type === 'pdf';
          const isHandwritten = note.file_type === 'handwritten';
          const cardBg = idx % 2 === 0 ? 'bg-[#F5F3FF]' : 'bg-[#FAF5FF]';

          return (
            <div
              key={note.id}
              className={`rounded-2xl ${cardBg} p-5 border border-[#E9D5FF] shadow-[0_4px_20px_-4px_rgba(139, 92, 246,0.05)] hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#8B5CF6] border border-[#E9D5FF]">
                    {isHandwritten
                      ? 'Handwritten / Scanned'
                      : isPdf
                      ? 'Uploaded PDF'
                      : 'Structured Notes'}
                  </span>

                  <span className="text-[10px] font-bold text-[#625C60]">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-heading text-base font-extrabold text-[#171417] mt-3">
                  {note.title}
                </h3>
                <p className="text-xs font-semibold text-[#625C60] mt-1 leading-relaxed line-clamp-3">
                  {note.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9D5FF] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#171417]">
                  By: {note.uploaded_by}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="p-1.5 rounded-lg bg-white border border-[#E9D5FF] hover:bg-[#F3E8FF] text-[#8B5CF6] transition-colors"
                    title="Preview Notes"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(note)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all shadow-xs flex items-center gap-1"
                    title="Download PDF"
                  >
                    <Download size={12} />
                    <span>PDF</span>
                  </button>

                  {canAuthor && (
                    <button
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      className="p-1.5 rounded-lg text-[#858087] hover:text-[#8B5CF6] transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 border border-[#E9D5FF] shadow-2xl max-h-[85vh] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-[#8B5CF6]">
                  Study Document Preview
                </span>
                <h3 className="font-heading font-extrabold text-lg text-[#171417]">
                  {previewNote.title}
                </h3>
              </div>
              <button onClick={() => setPreviewNote(null)} className="text-xs font-bold text-[#625C60] hover:text-[#171417]">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-2 space-y-3 text-xs leading-relaxed text-[#171417]">
              <div className="p-4 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] whitespace-pre-wrap font-sans font-medium">
                {previewNote.content}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E9D5FF] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#625C60]">
                Author: {previewNote.uploaded_by}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewNote(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#625C60] hover:bg-[#FAF5FF]"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPDF(previewNote)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={13} />
                  <span>Download as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authoring Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 border border-[#E9D5FF] shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B5CF6]">
                  {modalMode === 'generate' ? 'Option 1: AI Generator' : 'Option 2: Document Uploader'}
                </span>
                <h3 className="font-heading font-extrabold text-lg text-[#171417]">
                  {modalMode === 'generate' ? 'Generate Chapter Notes' : 'Upload Handwritten / PDF Notes'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-xs font-bold text-[#625C60] hover:text-[#171417]">
                ✕
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="flex gap-2 p-1 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF]">
              <button
                type="button"
                onClick={() => setModalMode('generate')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  modalMode === 'generate' ? 'bg-[#8B5CF6] text-white shadow-xs' : 'text-[#171417]'
                }`}
              >
                Generate Chapter Notes
              </button>
              <button
                type="button"
                onClick={() => setModalMode('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  modalMode === 'upload' ? 'bg-[#8B5CF6] text-white shadow-xs' : 'text-[#171417]'
                }`}
              >
                Upload Handwritten / Scanned Notes
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#171417] block mb-1">Target Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171417] block mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* OPTION 1: GENERATE FIELDS */}
              {modalMode === 'generate' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-[#171417] block mb-1">
                      Chapter Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Introduction to Trigonometric Identities"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#171417] block mb-1">
                        Topic Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Derivation of sin²θ + cos²θ = 1"
                        value={noteTopic}
                        onChange={(e) => setNoteTopic(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#171417] block mb-1">
                        Notes Format
                      </label>
                      <select
                        value={noteFormat}
                        onChange={(e) => setNoteFormat(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                      >
                        <option value="Formula Sheet">Formula Sheet</option>
                        <option value="Summary">Exam Revision Summary</option>
                        <option value="Comprehensive Guide">Comprehensive Study Guide</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleGenerateNotes}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles size={13} />
                      <span>{isGenerating ? 'Synthesizing...' : 'Generate Notes Content'}</span>
                    </button>
                  </div>
                </>
              )}

              {/* OPTION 2: UPLOAD OWN NOTES */}
              {modalMode === 'upload' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-[#171417] block mb-1">
                      Attach Handwritten / Scanned / PDF File
                    </label>
                    <div className="p-6 border-2 border-dashed border-[#C4B5FD] bg-[#FAF5FF] rounded-2xl text-center hover:bg-[#F5F3FF] transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileUploadSimulated}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload size={24} className="mx-auto text-[#8B5CF6] mb-2" />
                      <p className="text-xs font-extrabold text-[#171417]">
                        {fileName ? fileName : 'Click or Drag to Upload Notes File'}
                      </p>
                      <p className="text-[11px] font-semibold text-[#625C60] mt-0.5">
                        Supports Handwritten notes, Scanned pages, PDFs, JPG, PNG (up to 25 MB)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#171417] block mb-1">
                      Chapter / Note Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 4 Quadratic Formula Derivations"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-bold text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </>
              )}

              {/* Editable Content Preview */}
              {noteContent && (
                <div>
                  <label className="text-xs font-bold text-[#171417] block mb-1">
                    Editable Content Preview & Annotations
                  </label>
                  <textarea
                    rows={6}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs font-mono font-medium text-[#171417] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9D5FF]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#625C60] hover:bg-[#FAF5FF]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishNote}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-xs"
                >
                  Approve & Publish to Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
