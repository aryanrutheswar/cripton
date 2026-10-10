import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Bookmark, 
  Edit3, 
  Eye, 
  RefreshCw, 
  GraduationCap, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  FileText,
  BookmarkCheck
} from 'lucide-react';
import { NoteFormat, DocumentInfo, StudyNote } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { api } from '../../services/api';

interface NoteGeneratorViewProps {
  initialTopic?: string;
  activeDocument: DocumentInfo | null;
  onOpenSettings: () => void;
  onGenerateQuizFromNote: (topic: string, text: string) => void;
  onGenerateFlashcardsFromNote: (topic: string, text: string) => void;
}

export const NoteGeneratorView: React.FC<NoteGeneratorViewProps> = ({
  initialTopic = '',
  activeDocument,
  onOpenSettings,
  onGenerateQuizFromNote,
  onGenerateFlashcardsFromNote,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [format, setFormat] = useState<NoteFormat>('UNIVERSITY EXAM ANSWER');
  const [detailLevel, setDetailLevel] = useState('comprehensive');
  const [sourceText, setSourceText] = useState('');
  const [useUploadedDoc, setUseUploadedDoc] = useState(!!activeDocument);

  const [generatedNote, setGeneratedNote] = useState<string>('');
  const [currentTopicTitle, setCurrentTopicTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [revising, setRevising] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const availableFormats: { key: NoteFormat; label: string; desc: string }[] = [
    { key: 'UNIVERSITY EXAM ANSWER', label: 'University Exam Model', desc: 'Standard university paper answer structure' },
    { key: '10-MARK ANSWER', label: '10-Mark Blueprint', desc: 'In-depth theory, diagrams, pros/cons, and conclusion' },
    { key: '5-MARK ANSWER', label: '5-Mark Concise', desc: 'Definition, key mechanism points, and example' },
    { key: '2-MARK ANSWER', label: '2-Mark Definition', desc: 'Exact exam keywords and crisp definitions' },
    { key: 'DETAILED STUDY NOTES', label: 'Detailed Study Notes', desc: 'Comprehensive textbook-style notes with diagrams' },
    { key: 'QUICK REVISION', label: 'Quick Revision', desc: 'High-yield memory points and comparison tables' },
    { key: 'LAST-MINUTE REVISION', label: 'Last-Minute Cheat Sheet', desc: 'Bullet points, formulas, and common exam traps' },
    { key: 'VIVA PREPARATION', label: 'Viva Voce Q&A', desc: 'Professor questions, direct answers, and follow-ups' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setIsEditing(false);
    setSavedSuccess(false);

    try {
      const docId = (useUploadedDoc && activeDocument) ? activeDocument.document_id : undefined;
      const res = await api.generateNotes(
        topic.trim(),
        format,
        detailLevel,
        sourceText.trim() || undefined,
        docId
      );

      setGeneratedNote(res.content);
      setCurrentTopicTitle(res.topic);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate study notes. Please check API key in Settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevise = async (instruction: string) => {
    if (!generatedNote || revising) return;
    setRevising(true);
    try {
      const res = await api.reviseNotes(generatedNote, instruction);
      setGeneratedNote(res.content);
    } catch (err: any) {
      alert(err.message || 'Revision failed');
    } finally {
      setRevising(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${(currentTopicTitle || topic || 'cybersecurity-notes')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')}.md`;
    const blob = new Blob([generatedNote], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToLibrary = async () => {
    if (!generatedNote) return;
    try {
      await api.saveNote({
        title: currentTopicTitle || topic,
        topic: topic,
        format: format,
        content: generatedNote,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-transparent text-[#344536]">
      {/* Left Configuration Panel */}
      <div className="w-full lg:w-[480px] xl:w-[540px] bg-white/85 border-r border-[#DCE8D5] p-6 sm:p-7 overflow-y-auto flex flex-col justify-between no-print shrink-0 backdrop-blur-md">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-1">
              <Zap className="w-4 h-4 text-[#89966A]" /> Academic Note Generator
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#344536]">
              Generate Exam Notes
            </h2>
            <p className="text-xs text-[#596B3D] mt-1">
              Produce structured 2-mark, 5-mark, 10-mark, or viva notes in seconds.
            </p>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-[#344536] mb-1.5">
              Cybersecurity Topic <span className="text-[#89966A]">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. RSA Encryption, Buffer Overflow, IDS vs IPS"
              className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8D5] focus:border-[#89966A] focus:ring-2 focus:ring-[#B7E4A5]/30 text-sm text-[#344536] placeholder:text-[#89966A]/60 focus:outline-none transition-all shadow-xs bg-white"
            />
          </div>

          {/* Format Selector - Clean 2-column grid without inner clipping */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#344536]">
                Academic Output Format
              </label>
              <span className="text-[11px] font-semibold text-[#596B3D]">
                8 Academic Formats
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableFormats.map((fmt) => (
                <div
                  key={fmt.key}
                  onClick={() => setFormat(fmt.key)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    format === fmt.key
                      ? 'border-[#89966A] bg-[#DCE8D5]/50 text-[#344536] shadow-xs ring-1 ring-[#89966A]/40'
                      : 'border-[#DCE8D5] hover:border-[#89966A] hover:bg-[#FAFAF4] bg-white text-[#4A5A38]'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between gap-1.5 mb-1">
                    <span className="truncate leading-snug">{fmt.label}</span>
                    {format === fmt.key ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#596B3D] shrink-0 shadow-[0_0_8px_#B7E4A5]" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-[#DCE8D5] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#596B3D]/80 leading-relaxed line-clamp-2">{fmt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Depth */}
          <div>
            <label className="block text-xs font-semibold text-[#344536] mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#89966A]" /> Detail Depth
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['concise', 'standard', 'comprehensive'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDetailLevel(lvl)}
                  className={`py-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                    detailLevel === lvl
                      ? 'border-[#596B3D] bg-[#596B3D] text-white shadow-xs font-semibold'
                      : 'border-[#DCE8D5] hover:border-[#89966A] text-[#4A5A38] bg-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Active document grounding toggle if available */}
          {activeDocument && (
            <div className="p-3.5 rounded-xl bg-[#DCE8D5]/35 border border-[#DCE8D5] text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#344536]">
                <input
                  type="checkbox"
                  checked={useUploadedDoc}
                  onChange={(e) => setUseUploadedDoc(e.target.checked)}
                  className="rounded text-[#596B3D] focus:ring-[#89966A]"
                />
                <span>Ground on: {activeDocument.filename}</span>
              </label>
            </div>
          )}

          {/* Optional raw source notes */}
          <div>
            <label className="block text-xs font-semibold text-[#344536] mb-1.5">
              Paste Rough Lecture Notes (Optional)
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste raw textbook text or professor slides to convert into exam notes..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8D5] focus:border-[#89966A] focus:ring-2 focus:ring-[#B7E4A5]/30 text-xs text-[#344536] placeholder:text-[#89966A]/60 focus:outline-none resize-none bg-white"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-6">
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || loading}
            className="w-full py-3.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 text-white font-semibold text-sm shadow-md shadow-[#596B3D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Academic Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#B7E4A5]" />
                <span>Generate Study Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Content / Note Display Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        {/* Action Toolbar on Top of Notes */}
        {generatedNote && (
          <div className="px-6 py-3 bg-white/80 border-b border-[#DCE8D5] flex flex-wrap items-center justify-between gap-3 no-print backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#344536] font-display">
                {currentTopicTitle || topic}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8D5]/60 text-[#596B3D] font-semibold border border-[#DCE8D5]">
                {format}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Edit Mode Toggle */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                  isEditing
                    ? 'bg-[#596B3D] text-white border-[#596B3D]'
                    : 'bg-white text-[#344536] border-[#DCE8D5] hover:bg-[#FAFAF4]'
                }`}
                title="Toggle Markdown Edit"
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Preview' : 'Edit Note'}</span>
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE8D5] hover:bg-[#FAFAF4] text-xs font-medium text-[#344536] flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy note"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Download MD */}
              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE8D5] hover:bg-[#FAFAF4] text-xs font-medium text-[#344536] flex items-center gap-1 transition-colors cursor-pointer"
                title="Download Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.MD</span>
              </button>

              {/* Print / Save PDF */}
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE8D5] hover:bg-[#FAFAF4] text-xs font-medium text-[#344536] flex items-center gap-1 transition-colors cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              {/* Save to Library */}
              <button
                onClick={handleSaveToLibrary}
                className="px-3 py-1.5 rounded-lg bg-[#DCE8D5]/40 hover:bg-[#DCE8D5]/70 border border-[#DCE8D5] text-xs font-medium text-[#596B3D] flex items-center gap-1 transition-colors cursor-pointer"
                title="Save to My Notes"
              >
                {savedSuccess ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
              </button>

              {/* Quick Actions to Quiz / Flashcards */}
              <button
                onClick={() => onGenerateQuizFromNote(currentTopicTitle || topic, generatedNote)}
                className="px-3 py-1.5 rounded-lg bg-[#FAFAF4] hover:bg-[#DCE8D5]/50 border border-[#DCE8D5] text-xs font-medium text-[#596B3D] flex items-center gap-1 transition-colors cursor-pointer"
                title="Turn note into quiz"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Test Quiz</span>
              </button>
            </div>
          </div>
        )}

        {/* Note Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 print-only-container bg-transparent">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 text-xs no-print">
              <div>
                <p className="font-semibold text-amber-950 mb-0.5">Configuration Notice</p>
                <p>{errorMessage}</p>
              </div>
              <button
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-lg bg-[#596B3D] text-white font-semibold shrink-0 cursor-pointer"
              >
                Configure Settings
              </button>
            </div>
          )}

          {!generatedNote && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-[#89966A] py-16">
              <div className="w-16 h-16 rounded-3xl bg-white border border-[#DCE8D5] flex items-center justify-center text-[#596B3D] mb-4 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#344536] mb-1">
                No Notes Generated Yet
              </h3>
              <p className="text-xs text-[#596B3D] leading-relaxed">
                Enter a cybersecurity concept on the left, pick your target exam format (e.g. 10-Mark Blueprint or Quick Revision), and click Generate Study Notes.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-[#DCE8D5]/50 border border-[#DCE8D5] flex items-center justify-center text-[#596B3D] mb-4 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-base text-[#344536] mb-1">
                Synthesizing Structured Academic Note...
              </h4>
              <p className="text-xs text-[#596B3D] max-w-sm">
                Structuring definitions, technical steps, Mermaid architectural charts, and university examination marking points.
              </p>
            </div>
          )}

          {generatedNote && (
            <div className="max-w-4xl mx-auto">
              {isEditing ? (
                <div className="no-print">
                  <div className="text-xs font-semibold text-[#596B3D] mb-2">
                    Markdown Editor (Directly customize your note):
                  </div>
                  <textarea
                    value={generatedNote}
                    onChange={(e) => setGeneratedNote(e.target.value)}
                    rows={28}
                    className="w-full p-6 rounded-2xl border border-[#DCE8D5] font-mono text-xs text-[#344536] leading-relaxed focus:outline-none focus:border-[#89966A] bg-white shadow-inner"
                  />
                </div>
              ) : (
                <div className="p-8 sm:p-12 rounded-3xl bg-white/90 border border-[#DCE8D5] shadow-xs backdrop-blur-md">
                  <MarkdownRenderer content={generatedNote} />

                  {/* AI Quick Revision Action Toolbar at Bottom */}
                  <div className="mt-12 pt-6 border-t border-[#DCE8D5] no-print">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#89966A]" />
                      Refine or Expand This Note with AI
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Simplify for Beginners', prompt: 'Simplify this note further using clear real-world analogies and simple language.' },
                        { label: 'Add 5 Viva Questions', prompt: 'Append 5 likely examiner viva voce questions with direct answers to the end of this note.' },
                        { label: 'Deep Dive Technical Details', prompt: 'Expand the technical mechanism section with deeper protocol packet fields, flags, and algorithms.' },
                        { label: 'Add Real-World Incident Case', prompt: 'Add a section discussing a real-world cybersecurity breach or case study illustrating this concept.' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          disabled={revising}
                          onClick={() => handleRevise(item.prompt)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#DCE8D5]/50 border border-[#DCE8D5] hover:border-[#89966A] text-xs font-medium text-[#344536] hover:text-[#596B3D] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {revising ? <RefreshCw className="w-3 h-3 animate-spin text-[#596B3D]" /> : <Sparkles className="w-3 h-3 text-[#89966A]" />}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
