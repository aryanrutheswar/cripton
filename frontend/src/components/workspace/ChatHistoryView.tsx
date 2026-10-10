import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Plus, 
  RotateCcw,
  Clock
} from 'lucide-react';
import { ChatSession } from '../../types';
import { api } from '../../services/api';

interface ChatHistoryViewProps {
  onResumeChat: (sessionId: string) => void;
  onNavigateToChat: () => void;
  onNavigateToNotes: (topic: string) => void;
}

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  onResumeChat,
  onNavigateToChat,
  onNavigateToNotes,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getChatSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation from your history?')) {
      await api.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    }
  };

  const handleClearAll = async () => {
    if (sessions.length === 0) return;
    if (confirm('Are you sure you want to clear your entire chat history? This cannot be undone.')) {
      await api.clearAllChatSessions();
      setSessions([]);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const query = search.toLowerCase();
    const matchTitle = (s.title || '').toLowerCase().includes(query);
    const matchFirst = (s.first_question || '').toLowerCase().includes(query);
    const matchLast = (s.last_message || '').toLowerCase().includes(query);
    return matchTitle || matchFirst || matchLast;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Recent';
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 sm:p-10 text-[#344536]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-1">
              <History className="w-4 h-4 text-[#89966A]" /> Dialogue Archive
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#344536]">
              Chat History ({sessions.length})
            </h2>
            <p className="text-sm text-[#596B3D] mt-1">
              Review and resume past tutoring conversations, technical inquiries, and exam explanations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-xl border border-[#DCE8D5] hover:border-rose-300 hover:bg-rose-50/70 text-xs font-medium text-[#89966A] hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}

            <button
              onClick={onNavigateToChat}
              className="px-4 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>
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
              placeholder="Search dialogues by question or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DCE8D5] text-xs text-[#344536] focus:outline-none focus:border-[#89966A] bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#89966A] font-medium">
            <span>Showing {filteredSessions.length} {filteredSessions.length === 1 ? 'conversation' : 'conversations'}</span>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-20 text-[#89966A] text-xs">
            Loading dialogue archive...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white/80 border border-[#DCE8D5] max-w-md mx-auto space-y-4 backdrop-blur-md p-8">
            <div className="w-14 h-14 rounded-2xl bg-[#DCE8D5]/50 text-[#596B3D] flex items-center justify-center mx-auto shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#344536]">
                {search ? 'No Matching Dialogues' : 'No Chat History Yet'}
              </h3>
              <p className="text-xs text-[#596B3D] max-w-xs mx-auto mt-1 leading-relaxed">
                {search 
                  ? 'Try different keywords or clear your search query.'
                  : 'Ask any cybersecurity question in the Chat Tutor, and your conversations will be automatically saved here.'}
              </p>
            </div>
            {!search && (
              <button
                onClick={onNavigateToChat}
                className="px-5 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] text-white font-semibold text-xs shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B7E4A5]" />
                <span>Ask AI Tutor Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => (
              <div
                key={session.session_id}
                onClick={() => onResumeChat(session.session_id)}
                className="p-6 rounded-3xl bg-white/85 hover:bg-white border border-[#DCE8D5] hover:border-[#89966A] shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#DCE8D5]/50 text-[#596B3D] border border-[#DCE8D5] flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#596B3D]" />
                      <span>{session.message_count ? `${session.message_count} msgs` : 'Dialogue'}</span>
                    </span>

                    <span className="text-[11px] text-[#89966A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(session.updated_at || session.created_at)}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-[#344536] group-hover:text-[#596B3D] transition-colors leading-snug line-clamp-2">
                    {session.title || session.first_question || 'Untitled Conversation'}
                  </h3>

                  {session.last_message && (
                    <p className="text-xs text-[#596B3D]/80 mt-2.5 line-clamp-2 leading-relaxed font-normal">
                      {session.last_message}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#DCE8D5]/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToNotes(session.first_question || session.title);
                      }}
                      className="text-[11px] font-medium text-[#89966A] hover:text-[#596B3D] flex items-center gap-1 transition-colors"
                      title="Convert to exam notes"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Make Notes</span>
                    </button>

                    <button
                      onClick={(e) => handleDeleteSession(session.session_id, e)}
                      className="p-1 rounded-lg text-[#89966A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs font-semibold text-[#596B3D] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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

export default ChatHistoryView;
