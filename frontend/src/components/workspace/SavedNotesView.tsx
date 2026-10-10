import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StudyNote, NoteFormat } from '../../types';
import { api } from '../../services/api';

interface SavedNotesViewProps {
  onOpenNote: (note: StudyNote) => void;
}

export const SavedNotesView: React.FC<SavedNotesViewProps> = ({ onOpenNote }) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const list = await api.getSavedNotes();
      setNotes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved study note?')) {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleCopy = (id: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = notes.filter((n) => {
    const matchSearch = (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        (n.topic || '').toLowerCase().includes(search.toLowerCase());
    const matchFormat = filterFormat === 'ALL' || n.format === filterFormat;
    return matchSearch && matchFormat;
  });

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 sm:p-10 text-[#344536]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-1">
              <Bookmark className="w-4 h-4 text-[#89966A]" /> Your Personal Archive
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#344536]">
              Saved Study Notes ({notes.length})
            </h2>
            <p className="text-sm text-[#596B3D] mt-1">
              Access your generated examination blueprints, definitions, and revisions anytime.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white/85 border border-[#DCE8D5] shadow-xs flex flex-wrap items-center gap-3 backdrop-blur-md">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#89966A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic title or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DCE8D5] text-xs text-[#344536] focus:outline-none focus:border-[#89966A] bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#89966A]">Format:</span>
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#DCE8D5] text-xs font-medium text-[#344536] bg-white focus:outline-none focus:border-[#89966A]"
            >
              <option value="ALL">All Formats</option>
              <option value="10-MARK ANSWER">10-Mark Blueprint</option>
              <option value="5-MARK ANSWER">5-Mark Concise</option>
              <option value="2-MARK ANSWER">2-Mark Definition</option>
              <option value="UNIVERSITY EXAM ANSWER">Exam Model</option>
              <option value="QUICK REVISION">Quick Revision</option>
              <option value="VIVA PREPARATION">Viva Prep</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="text-center py-20 text-[#89966A] text-xs">
            Loading saved notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white/80 border border-[#DCE8D5] max-w-md mx-auto space-y-3 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-[#DCE8D5]/50 text-[#596B3D] flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-base text-[#344536]">No Saved Notes Found</h3>
            <p className="text-xs text-[#596B3D] max-w-xs mx-auto">
              Generate notes in the Note Generator and click Save to store them in your permanent library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onOpenNote(note)}
                className="p-6 rounded-3xl bg-white/85 hover:bg-white border border-[#DCE8D5] hover:border-[#89966A] shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#DCE8D5]/50 text-[#596B3D] border border-[#DCE8D5]">
                      {note.format}
                    </span>
                    <span className="text-[11px] text-[#89966A] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#344536] mb-2 group-hover:text-[#596B3D] transition-colors line-clamp-1">
                    {note.title || note.topic}
                  </h3>

                  <p className="text-xs text-[#4A5A38] line-clamp-3 leading-relaxed font-mono bg-[#FAFAF4] p-2.5 rounded-xl border border-[#DCE8D5]">
                    {note.content.substring(0, 200)}...
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#DCE8D5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#596B3D] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Note</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopy(note.id, note.content, e)}
                      className="p-1.5 rounded-lg hover:bg-[#FAFAF4] text-[#89966A] hover:text-[#344536] transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-[#89966A] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
