import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Download, Plus, Sparkles, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { DEMO_NOTES } from '../services/mockData';
import { exportToPDF } from '../utils/exportUtils';

export const NotesPage: React.FC = () => {
  const { role } = useAuth();
  const [notes, setNotes] = useState(DEMO_NOTES);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'generate' | 'upload'>('generate');

  // Form states
  const [chapterTitle, setChapterTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canAuthor = ['teacher', 'school_admin', 'college_faculty', 'college_admin'].includes(role || '');

  const handleGenerateAI = () => {
    if (!chapterTitle) {
      setToastMessage('Please enter a chapter name to generate notes');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent(
        `# ${chapterTitle} — Comprehensive Study Notes\n\n## 1. Key Concepts\n- Core definitions and theoretical framework for ${chapterTitle}.\n- Practical applications and real-world institutional examples.\n\n## 2. Essential Formulas & Derivations\n- Standard proof steps\n- Step-by-step solved sample problem\n\n## 3. Review Questions\n1. Explain the primary theorem with illustrative diagram.\n2. Calculate the standard deviation and variance for sample set.`
      );
    }, 1000);
  };

  const handlePublishNote = () => {
    if (!chapterTitle) return;
    const newNote = {
      id: `note-${Date.now()}`,
      institution_id: notes[0].institution_id,
      class_id: 'class-10',
      subject_id: 'sub-math',
      title: chapterTitle,
      description: `Comprehensive chapter study guide for ${chapterTitle}.`,
      content: generatedContent || 'Chapter reference guide and formulas.',
      file_type: modalMode === 'generate' ? 'generated' : 'pdf',
      is_published: true,
      uploaded_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setModalOpen(false);
    setChapterTitle('');
    setGeneratedContent('');
    setToastMessage('Notes successfully approved and published to the Student Library!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownload = (title: string, desc: string, content?: string | null) => {
    exportToPDF(
      title,
      [
        { header: 'Section', dataKey: 'sec' },
        { header: 'Content', dataKey: 'text' },
      ],
      [
        { sec: 'Overview', text: desc },
        { sec: 'Study Guide', text: content ? content.replace(/[#*`]/g, '') : 'Detailed classroom notes.' },
      ],
      `${title.replace(/\s+/g, '_')}.pdf`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#232F25] dark:text-[#F0F5F1] tracking-tight">
            Study Material & Notes Library
          </h1>
          <p className="text-xs md:text-sm text-[#667768] dark:text-[#9FB1A2] mt-0.5">
            Chapter-wise revision notes, uploaded lecture slides, and PDF downloads
          </p>
        </div>

        {canAuthor && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                setModalMode('generate');
                setModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#5B6E5E] text-white hover:bg-[#4A5B4D] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Chapter Notes Generator</span>
            </button>
            <button
              onClick={() => {
                setModalMode('upload');
                setModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card hover:bg-white/90 text-[#324234] dark:text-[#D1E0D3] border border-white/70 dark:border-white/10 shadow-sm flex items-center gap-1.5"
            >
              <Upload size={14} className="text-[#5B6E5E]" />
              <span>Upload Notes File</span>
            </button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-[#8DA390]/20 border border-[#8DA390]/40 text-[#213123] dark:text-[#E2ECE4] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#5B6E5E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl glass-card p-5 border border-white/70 dark:border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8DA390]/20 text-[#2B3B2E] dark:text-[#E2ECE4] uppercase">
                  {note.file_type}
                </span>
                <span className="text-[10px] font-semibold text-[#5B6E5E]">
                  Class 10
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#232F25] dark:text-[#F0F5F1] mt-3">
                {note.title}
              </h3>
              <p className="text-xs text-[#637466] dark:text-[#95A597] line-clamp-3 mt-1.5">
                {note.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-[#7A8A7C]">Published</span>
              <button
                onClick={() => handleDownload(note.title, note.description || '', note.content)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#5B6E5E] text-white hover:bg-[#4A5B4D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Creation / Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-3xl glass-panel border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#232F25] dark:text-[#F0F5F1]">
              {modalMode === 'generate' ? 'Generate Chapter Notes' : 'Upload Study Notes'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#303E33] dark:text-[#D1E0D3] mb-1">
                  Chapter Name / Topic
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g. Arithmetic Progressions or Optics"
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#303E33] dark:text-[#D1E0D3] mb-1">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#303E33] dark:text-[#D1E0D3] mb-1">
                    Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-black/20 border border-[#8DA390]/30"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                  </select>
                </div>
              </div>

              {modalMode === 'generate' && (
                <div>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-[#8DA390]/20 text-[#253628] dark:text-[#E2ECE4] border border-[#8DA390]/30 hover:bg-[#8DA390]/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>{isGenerating ? 'Synthesizing Curriculum Notes...' : 'Generate Notes Content'}</span>
                  </button>

                  {generatedContent && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-[#303E33] dark:text-[#D1E0D3] mb-1">
                        Preview & Edit
                      </label>
                      <textarea
                        rows={5}
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs glass-input font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {modalMode === 'upload' && (
                <div className="p-6 border-2 border-dashed border-[#8DA390]/40 rounded-2xl text-center">
                  <Upload size={24} className="mx-auto text-[#5B6E5E] mb-2" />
                  <p className="text-xs font-semibold text-[#253227] dark:text-[#E2ECE4]">
                    Drag & drop handwritten scans or PDFs here
                  </p>
                  <p className="text-[10px] text-[#637466] dark:text-[#95A597] mt-1">
                    Supports PDF, PNG, JPG (up to 25MB)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#566859] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishNote}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#5B6E5E] hover:bg-[#4A5B4D]"
              >
                Publish to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
