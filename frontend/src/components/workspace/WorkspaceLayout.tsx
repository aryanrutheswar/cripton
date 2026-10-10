import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  UploadCloud, 
  GraduationCap, 
  Layers, 
  Bookmark, 
  Settings, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  ArrowLeft,
  FileText,
  Leaf,
  Home,
  History
} from 'lucide-react';
import { DocumentInfo, StudyNote, ChatSession } from '../../types';
import { BotanicalAmbiance } from '../common/BotanicalAmbiance';
import { BotanicalHubView } from './BotanicalHubView';
import { ChatView } from './ChatView';
import { NoteGeneratorView } from './NoteGeneratorView';
import { DocumentUploadView } from './DocumentUploadView';
import { QuizView } from './QuizView';
import { FlashcardsView } from './FlashcardsView';
import { SavedNotesView } from './SavedNotesView';
import { ChatHistoryView } from './ChatHistoryView';
import { SettingsModal } from './SettingsModal';
import { api } from '../../services/api';

type WorkspaceTab = 'dashboard' | 'chat' | 'notes' | 'document' | 'quiz' | 'flashcards' | 'saved' | 'history';

interface WorkspaceLayoutProps {
  onBackToHome: () => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [activeDocument, setActiveDocument] = useState<DocumentInfo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-view state transfer
  const [currentTopic, setCurrentTopic] = useState<string>('RSA Encryption');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    checkHealth();
    loadChatSessions();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await api.getHealth();
      setHasApiKey(health.has_api_key);
    } catch {
      // ignore
    }
  };

  const loadChatSessions = async () => {
    try {
      const sessions = await api.getChatSessions();
      setChatSessions(sessions);
    } catch {
      // ignore
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: 'Overview' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 'Tutor' },
    { id: 'notes', label: 'Notes', icon: BookOpen, badge: '8 Formats' },
    { id: 'quiz', label: 'Quiz', icon: GraduationCap },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'document', label: 'PDF Upload', icon: UploadCloud, badge: activeDocument ? 'Active' : undefined },
    { id: 'saved', label: 'Saved Notes', icon: Bookmark },
    { id: 'history', label: 'Chat History', icon: History, badge: chatSessions.length ? `${chatSessions.length}` : undefined },
  ];

  const handleResumeChat = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setActiveTab('chat');
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setActiveTab('chat');
  };

  const handleOpenSavedNote = (note: StudyNote) => {
    setCurrentTopic(note.topic || note.title);
    setActiveTab('notes');
  };

  const handleNavigateToNotesWithTopic = (topic: string) => {
    setCurrentTopic(topic);
    setActiveTab('notes');
  };

  const handleNavigateToChatWithQuestion = (question: string) => {
    setCurrentTopic(question);
    setActiveTab('chat');
  };

  const handleNavigateToQuizWithTopic = (topic: string) => {
    setCurrentTopic(topic);
    setActiveTab('quiz');
  };

  const handleNavigateToFlashcardsWithTopic = (topic: string) => {
    setCurrentTopic(topic);
    setActiveTab('flashcards');
  };

  const handleGenerateQuizFromNote = (topic: string, text: string) => {
    setCurrentTopic(topic);
    setActiveTab('quiz');
  };

  const handleGenerateFlashcardsFromNote = (topic: string, text: string) => {
    setCurrentTopic(topic);
    setActiveTab('flashcards');
  };

  return (
    <div data-lenis-prevent className="flex h-screen w-screen overflow-hidden bg-[#FAFAF4] text-[#344536]">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/85 border-r border-[#DCE8D5] p-4 justify-between shrink-0 no-print backdrop-blur-md">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#596B3D] to-[#89966A] flex items-center justify-center text-white shadow-sm shadow-[#596B3D]/25 group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-[#B7E4A5]" />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg text-[#344536] tracking-tight block leading-none">
                  CRYPTON
                </span>
                <span className="text-[10px] text-[#596B3D] font-semibold uppercase tracking-wider">
                  Education AI
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as WorkspaceTab)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#DCE8D5]/60 text-[#344536] border border-[#89966A]/40 shadow-xs'
                      : 'text-[#4A5A38] hover:text-[#344536] hover:bg-[#FAFAF4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#596B3D]' : 'text-[#89966A]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-[#FAFAF4] text-[#596B3D] border border-[#DCE8D5]' : 'bg-[#FAFAF4] text-[#89966A]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Recent Conversations in Sidebar */}
          {chatSessions.length > 0 && (
            <div className="pt-3 border-t border-[#DCE8D5]/70 space-y-1.5">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-[#596B3D]">
                <span className="flex items-center gap-1.5">
                  <History className="w-3 h-3 text-[#89966A]" />
                  Recent Chats
                </span>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-[10px] text-[#89966A] hover:text-[#596B3D] transition-colors font-medium lowercase cursor-pointer"
                >
                  view all
                </button>
              </div>

              <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                {chatSessions.slice(0, 4).map((s) => (
                  <button
                    key={s.session_id}
                    onClick={() => handleResumeChat(s.session_id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] text-[#4A5A38] hover:text-[#344536] hover:bg-[#FAFAF4] transition-all flex items-center gap-2 group truncate cursor-pointer"
                    title={s.title || s.first_question}
                  >
                    <MessageSquare className="w-3 h-3 text-[#89966A] group-hover:text-[#596B3D] shrink-0" />
                    <span className="truncate flex-1 font-medium">{s.title || s.first_question}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4 border-t border-[#DCE8D5]">
          {/* Active document indicator */}
          {activeDocument && (
            <div className="p-2.5 rounded-xl bg-[#DCE8D5]/30 border border-[#DCE8D5] text-[11px] text-[#344536] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#596B3D] shrink-0" />
              <span className="truncate">{activeDocument.filename}</span>
            </div>
          )}

          {/* Engine Status & Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full px-3 py-2 rounded-xl border border-[#DCE8D5] hover:border-[#89966A] bg-white/80 hover:bg-white text-xs text-[#344536] flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-medium">{hasApiKey ? 'Gemini Active' : 'Settings'}</span>
            </div>
            <Settings className="w-3.5 h-3.5 text-[#89966A]" />
          </button>

          <button
            onClick={onBackToHome}
            className="w-full px-3 py-1.5 text-[#89966A] hover:text-[#344536] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAF4] relative">
        {/* Serene Botanical Ambiance for all workspace views */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <BotanicalAmbiance showWaterSurface={false} intensity="subtle" />
        </div>

        {/* Top Mobile Bar */}
        <header className="md:hidden px-4 py-3 bg-white/90 border-b border-[#DCE8D5] flex items-center justify-between no-print backdrop-blur-md relative z-20">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Leaf className="w-5 h-5 text-[#596B3D]" />
            <span className="font-display font-bold text-base text-[#344536]">CRYPTON</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#344536] hover:bg-[#FAFAF4]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-white border-b border-[#DCE8D5] space-y-2 no-print z-40 relative">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as WorkspaceTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                  activeTab === item.id ? 'bg-[#DCE8D5]/60 text-[#344536]' : 'text-[#4A5A38]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                setIsSettingsOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl text-xs font-semibold text-[#4A5A38] flex items-center gap-3 border-t border-[#DCE8D5]"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* Dynamic Workspace Content */}
        <main className="flex-1 h-full overflow-hidden relative z-10">
          {activeTab === 'dashboard' && (
            <BotanicalHubView
              onNavigateToNotes={handleNavigateToNotesWithTopic}
              onNavigateToChat={handleNavigateToChatWithQuestion}
              onNavigateToQuiz={handleNavigateToQuizWithTopic}
              onNavigateToFlashcards={handleNavigateToFlashcardsWithTopic}
              onNavigateToUpload={() => setActiveTab('document')}
            />
          )}

          {activeTab === 'notes' && (
            <NoteGeneratorView
              initialTopic={currentTopic}
              activeDocument={activeDocument}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onGenerateQuizFromNote={handleGenerateQuizFromNote}
              onGenerateFlashcardsFromNote={handleGenerateFlashcardsFromNote}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              activeDocument={activeDocument}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onNavigateToNotes={handleNavigateToNotesWithTopic}
              initialSessionId={currentSessionId}
              onOpenHistory={() => setActiveTab('history')}
              onSessionUpdated={loadChatSessions}
            />
          )}

          {activeTab === 'history' && (
            <ChatHistoryView
              onResumeChat={handleResumeChat}
              onNavigateToChat={handleNewChat}
              onNavigateToNotes={handleNavigateToNotesWithTopic}
            />
          )}

          {activeTab === 'document' && (
            <DocumentUploadView
              activeDocument={activeDocument}
              setActiveDocument={setActiveDocument}
              onNavigateToNotes={() => setActiveTab('notes')}
              onNavigateToChat={() => setActiveTab('chat')}
              onNavigateToQuiz={() => setActiveTab('quiz')}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              initialTopic={currentTopic}
              activeDocument={activeDocument}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              initialTopic={currentTopic}
              activeDocument={activeDocument}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'saved' && (
            <SavedNotesView
              onOpenNote={handleOpenSavedNote}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyConfigured={() => {
          checkHealth();
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
};

