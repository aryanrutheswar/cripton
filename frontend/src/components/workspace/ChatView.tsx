import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  Bot,
  User,
  ExternalLink,
  BookOpen,
  History
} from 'lucide-react';
import { ChatMessage, DocumentInfo } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { api } from '../../services/api';

interface ChatViewProps {
  activeDocument: DocumentInfo | null;
  onOpenSettings: () => void;
  onNavigateToNotes: (topic: string) => void;
  initialSessionId?: string | null;
  onOpenHistory?: () => void;
  onSessionUpdated?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  activeDocument, 
  onOpenSettings,
  onNavigateToNotes,
  initialSessionId,
  onOpenHistory,
  onSessionUpdated
}) => {
  const [sessionId, setSessionId] = useState<string>(initialSessionId || `session-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const starterQuestions = [
    "Explain SQL injection like I am a beginner.",
    "What is the difference between IDS and IPS?",
    "Explain RSA encryption with a simple example.",
    "Convert this topic into a 10-mark university answer.",
    "What are the 6 stages of incident response?",
    "Ask me five viva questions about digital forensics."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId);
      loadSessionMessages(initialSessionId);
    }
  }, [initialSessionId]);

  const loadSessionMessages = async (sid: string) => {
    setLoading(true);
    try {
      const msgs = await api.getChatSessionMessages(sid);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load session messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || loading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newHistory.map(m => ({ role: m.role, content: m.content }));
      const response = await api.sendChatMessage(
        apiMessages,
        sessionId,
        activeDocument?.document_id
      );

      const aiMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        follow_ups: response.follow_ups,
      };

      const updatedHistory = [...newHistory, aiMsg];
      setMessages(updatedHistory);

      // Auto-save session
      const firstUserMsg = updatedHistory.find(m => m.role === 'user')?.content || textToSend;
      const title = firstUserMsg.length > 55 ? firstUserMsg.slice(0, 55) + '...' : firstUserMsg;
      api.saveLocalChatSession({
        session_id: sessionId,
        title,
        first_question: firstUserMsg,
        last_message: response.reply.slice(0, 120),
        message_count: updatedHistory.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, updatedHistory);
      onSessionUpdated?.();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate response. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setSessionId(`session-${Date.now()}`);
    setMessages([]);
    setErrorMessage(null);
    onSessionUpdated?.();
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[#344536]">
      {/* Top Banner / Active Document Info */}
      <div className="px-6 py-3.5 bg-white/85 border-b border-[#DCE8D5] flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DCE8D5]/50 border border-[#DCE8D5] flex items-center justify-center text-[#596B3D]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#344536] font-display flex items-center gap-2">
              CRYPTON AI Study Agent
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE8D5]/60 text-[#596B3D] font-semibold border border-[#DCE8D5]">
                Cybersecurity Specialized
              </span>
            </h2>
            <p className="text-xs text-[#596B3D]">
              {activeDocument 
                ? `Grounding on document: ${activeDocument.filename}`
                : "Ask any cybersecurity question for clear, structured explanations"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#DCE8D5] hover:bg-[#FAFAF4] text-[#344536] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View all past conversations"
            >
              <History className="w-3.5 h-3.5 text-[#89966A]" />
              <span>History</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#DCE8D5] hover:bg-[#FAFAF4] text-[#344536] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#89966A]" />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
            <div className="w-16 h-16 rounded-3xl bg-white border border-[#DCE8D5] flex items-center justify-center text-[#596B3D] mb-6 shadow-xs">
              <Sparkles className="w-8 h-8 text-[#596B3D]" />
            </div>
            <h3 className="font-display font-bold text-2xl text-[#344536] mb-2">
              How can CRYPTON help you today?
            </h3>
            <p className="text-sm text-[#596B3D] mb-8 max-w-md">
              Ask university exam concepts, cryptographic math, network protocols, or viva questions in plain English.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="p-3.5 rounded-2xl bg-white/80 border border-[#DCE8D5] hover:border-[#89966A] hover:bg-white text-xs font-medium text-[#344536] hover:text-[#596B3D] shadow-xs transition-all flex items-start justify-between group cursor-pointer"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#89966A] group-hover:text-[#596B3D] shrink-0 mt-0.5 ml-2 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-[#596B3D]">
                  {msg.role === 'user' ? 'You' : 'CRYPTON Agent'}
                </span>
                <span className="text-[10px] text-[#89966A]">{msg.timestamp}</span>
              </div>

              {msg.role === 'user' ? (
                /* User Message */
                <div className="max-w-2xl px-5 py-3.5 rounded-2xl rounded-tr-sm bg-[#596B3D] text-white font-medium text-sm shadow-xs leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                /* AI Response */
                <div className="max-w-3xl w-full p-6 rounded-2xl rounded-tl-sm bg-white/90 border border-[#DCE8D5] shadow-xs relative group backdrop-blur-md">
                  {/* Action bar on message */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1.5 rounded-lg bg-[#FAFAF4] hover:bg-[#DCE8D5]/60 text-[#344536] transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onNavigateToNotes(messages.find(m => m.role === 'user')?.content || "Cybersecurity Topic")}
                      className="px-2 py-1 rounded-lg bg-[#DCE8D5]/40 hover:bg-[#DCE8D5]/70 text-[11px] font-semibold text-[#596B3D] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Convert to exam notes"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Make Notes</span>
                    </button>
                  </div>

                  <MarkdownRenderer content={msg.content} />

                  {/* Follow-up question chips */}
                  {msg.follow_ups && msg.follow_ups.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[#DCE8D5]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#596B3D] mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#89966A]" />
                        Explore Next
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.follow_ups.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSend(fu)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAFAF4] hover:bg-white border border-[#DCE8D5] hover:border-[#89966A] text-xs font-medium text-[#344536] hover:text-[#596B3D] transition-all text-left cursor-pointer"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start max-w-xl">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-[#596B3D]">CRYPTON Agent</span>
              <span className="text-[10px] text-[#89966A]">Structuring cybersecurity answer...</span>
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-white border border-[#DCE8D5] shadow-xs flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#596B3D] animate-ping" />
              <div className="text-xs text-[#344536] font-medium">
                Analyzing protocols, security architecture & formatting answer...
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-950 mb-1">AI Request Notice</p>
                <p>{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-lg bg-[#596B3D] hover:bg-[#4A5A30] text-white font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Configure Settings
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 sm:p-6 bg-white/85 border-t border-[#DCE8D5] backdrop-blur-md">
        <div className="relative rounded-2xl border border-[#DCE8D5] focus-within:border-[#89966A] focus-within:ring-2 focus-within:ring-[#B7E4A5]/30 transition-all bg-white shadow-xs">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a cybersecurity question, request a university exam answer, or paste an error..."
            rows={2}
            className="w-full px-4 pt-3 pb-12 rounded-2xl resize-none text-sm text-[#344536] placeholder:text-[#89966A]/60 focus:outline-none"
          />

          <div className="absolute bottom-2.5 left-4 right-2.5 flex items-center justify-between pointer-events-none">
            <div className="text-[11px] text-[#89966A] font-mono">
              Press <kbd className="px-1 py-0.5 rounded bg-[#FAFAF4] border border-[#DCE8D5] text-[#344536]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-[#FAFAF4] border border-[#DCE8D5] text-[#344536]">Shift+Enter</kbd> for line
            </div>

            <button
              type="button"
              disabled={!input.trim() || loading}
              onClick={() => handleSend()}
              className="pointer-events-auto px-4 py-2 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 disabled:hover:bg-[#596B3D] text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
