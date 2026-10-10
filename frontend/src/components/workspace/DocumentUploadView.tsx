import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react';
import { DocumentInfo } from '../../types';
import { api } from '../../services/api';

interface DocumentUploadViewProps {
  activeDocument: DocumentInfo | null;
  setActiveDocument: (doc: DocumentInfo | null) => void;
  onNavigateToNotes: () => void;
  onNavigateToChat: () => void;
  onNavigateToQuiz: () => void;
}

export const DocumentUploadView: React.FC<DocumentUploadViewProps> = ({
  activeDocument,
  setActiveDocument,
  onNavigateToNotes,
  onNavigateToChat,
  onNavigateToQuiz,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validation
    if (!file.name.match(/\.(pdf|txt|md)$/i)) {
      setUploadError('Please upload a PDF (.pdf), Markdown (.md), or text (.txt) file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25MB limit.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const doc = await api.uploadDocument(file);
      setActiveDocument(doc);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to extract text from document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 sm:p-10 text-[#344536]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-1">
            <Layers className="w-4 h-4 text-[#89966A]" /> Document Grounding & PDF Extraction
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#344536]">
            Study Material & Textbook Analyzer
          </h2>
          <p className="text-sm text-[#596B3D] mt-1 max-w-xl">
            Upload your university lecture slides, research papers, or syllabus PDFs. CRYPTON extracts the content, breaks it into overlapping conceptual chunks, and grounds your notes and AI tutoring.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#89966A] bg-[#DCE8D5]/50 scale-[1.01]'
              : 'border-[#DCE8D5] hover:border-[#89966A] bg-white/80 hover:bg-white shadow-xs backdrop-blur-md'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[#DCE8D5]/50 border border-[#DCE8D5] flex items-center justify-center text-[#596B3D] mb-4 shadow-xs">
              {uploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="font-display font-bold text-lg text-[#344536] mb-1">
              {uploading ? 'Extracting Text with PyMuPDF Engine...' : 'Drop your PDF textbook or lecture notes here'}
            </h3>
            <p className="text-xs text-[#596B3D] max-w-sm mb-4">
              Supports text-based PDF, Markdown, and TXT (up to 25MB). Auto-chunked with context preservation.
            </p>

            <button
              type="button"
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Error message */}
        {uploadError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Active Uploaded Document Card */}
        {activeDocument && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 border border-[#DCE8D5] shadow-xs space-y-6 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8D5]/50 border border-[#89966A]/40 flex items-center justify-center text-[#596B3D]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#596B3D]">Active Grounding Source</div>
                  <h4 className="font-display font-bold text-lg text-[#344536]">{activeDocument.filename}</h4>
                </div>
              </div>

              <button
                onClick={() => setActiveDocument(null)}
                className="px-3 py-1.5 rounded-lg border border-[#DCE8D5] hover:border-rose-300 hover:bg-rose-50 text-[#89966A] hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Remove document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* Document Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5]">
                <div className="text-xs text-[#596B3D] font-medium">Pages Extracted</div>
                <div className="font-display font-bold text-xl text-[#344536] mt-1">{activeDocument.page_count}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5]">
                <div className="text-xs text-[#596B3D] font-medium">Total Words</div>
                <div className="font-display font-bold text-xl text-[#344536] mt-1">
                  {activeDocument.word_count.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5]">
                <div className="text-xs text-[#596B3D] font-medium">Overlapping Chunks</div>
                <div className="font-display font-bold text-xl text-[#344536] mt-1">{activeDocument.chunk_count}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5]">
                <div className="text-xs text-[#596B3D] font-medium">Document State</div>
                <div className="font-display font-semibold text-xs text-[#596B3D] mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#596B3D]" /> Grounded & Ready
                </div>
              </div>
            </div>

            {/* Warning if scanned */}
            {activeDocument.is_scanned && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Notice: This PDF contains very little digital text and appears to be a scanned image. For full understanding, please upload a text-searchable PDF or export from your lecture software.
                </span>
              </div>
            )}

            {/* Extracted Preview Snippet */}
            {activeDocument.preview_snippet && (
              <div>
                <div className="text-xs font-semibold text-[#344536] mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#596B3D]" /> Extracted Text Preview
                </div>
                <div className="p-4 rounded-2xl bg-[#FAFAF4] border border-[#DCE8D5] font-mono text-xs text-[#344536] leading-relaxed max-h-40 overflow-y-auto">
                  {activeDocument.preview_snippet}...
                </div>
              </div>
            )}

            {/* What to do next */}
            <div className="pt-4 border-t border-[#DCE8D5]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-3">
                Next Actions with this Material:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onNavigateToNotes}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#DCE8D5]/40 border border-[#DCE8D5] text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#596B3D]" />
                    <div>
                      <div className="text-xs font-bold text-[#344536]">Make Exam Notes</div>
                      <div className="text-[10px] text-[#596B3D]">10-mark, 5-mark, viva</div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#89966A]" />
                </button>

                <button
                  onClick={onNavigateToChat}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#DCE8D5]/40 border border-[#DCE8D5] text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-[#596B3D]" />
                    <div>
                      <div className="text-xs font-bold text-[#344536]">Chat with PDF</div>
                      <div className="text-[10px] text-[#596B3D]">Ask questions on content</div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#89966A]" />
                </button>

                <button
                  onClick={onNavigateToQuiz}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#DCE8D5]/40 border border-[#DCE8D5] text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-[#596B3D]" />
                    <div>
                      <div className="text-xs font-bold text-[#344536]">Test with Quiz</div>
                      <div className="text-[10px] text-[#596B3D]">Multiple choice check</div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#89966A]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
