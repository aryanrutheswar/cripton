import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  MessageSquare, 
  GraduationCap, 
  Layers, 
  ArrowRight, 
  Leaf, 
  ShieldCheck, 
  Clock, 
  Bookmark, 
  UploadCloud,
  FileText
} from 'lucide-react';

interface BotanicalHubViewProps {
  onNavigateToNotes: (topic: string) => void;
  onNavigateToChat: (question: string) => void;
  onNavigateToQuiz: (topic: string) => void;
  onNavigateToFlashcards: (topic: string) => void;
  onNavigateToUpload: () => void;
}

export const BotanicalHubView: React.FC<BotanicalHubViewProps> = ({
  onNavigateToNotes,
  onNavigateToChat,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onNavigateToUpload,
}) => {
  const [query, setQuery] = useState('');

  // Personalized dynamic greeting based on scholar's local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSend = () => {
    if (!query.trim()) return;
    // Default to Chat for open questions, or Notes if explicitly requested
    onNavigateToChat(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      id: 'chat',
      title: 'Ask AI',
      subtitle: 'Ask questions & get instant structured explanations',
      icon: MessageSquare,
      action: () => onNavigateToChat(query.trim() || 'Explain RSA Encryption simply'),
      tag: 'Interactive',
    },
    {
      id: 'notes',
      title: 'Generate Notes',
      subtitle: '2-mark, 5-mark, 10-mark & university exam formats',
      icon: BookOpen,
      action: () => onNavigateToNotes(query.trim() || 'RSA Encryption'),
      tag: '8 Formats',
    },
    {
      id: 'quiz',
      title: 'Create Quiz',
      subtitle: 'Self-assessment with verified explanations',
      icon: GraduationCap,
      action: () => onNavigateToQuiz(query.trim() || 'Network Security Fundamentals'),
      tag: 'Practice',
    },
    {
      id: 'flashcards',
      title: 'Make Flashcards',
      subtitle: 'Active recall cards with 3D flip animation',
      icon: Layers,
      action: () => onNavigateToFlashcards(query.trim() || 'Core Cryptography Terminology'),
      tag: 'Memory',
    },
  ];

  const recentTopics = [
    {
      topic: 'RSA Encryption',
      category: 'Asymmetric Cryptography',
      detail: 'Prime factorization, Euler totient, and private key derivation.',
      format: '10-Mark Blueprint',
    },
    {
      topic: 'TLS 1.3 Handshake',
      category: 'Network Security',
      detail: 'Diffie-Hellman key exchange, 1-RTT setup, and forward secrecy.',
      format: '5-Mark Concise',
    },
    {
      topic: 'SQL Injection Defense',
      category: 'Web Security',
      detail: 'Prepared statements, input sanitization, and blind SQLi vectors.',
      format: 'Viva Voce Q&A',
    },
    {
      topic: 'Zero-Knowledge Proofs',
      category: 'Advanced Cryptography',
      detail: 'Completeness, soundness, zero-knowledge, and zk-SNARKs.',
      format: 'Quick Revision',
    },
    {
      topic: 'Buffer Overflow Mitigations',
      category: 'System Security',
      detail: 'Stack canaries, ASLR, non-executable stack (DEP/NX).',
      format: 'Exam Cheat Sheet',
    },
    {
      topic: 'Diffie-Hellman Key Exchange',
      category: 'Key Management',
      detail: 'Discrete logarithm problem and man-in-the-middle vulnerability.',
      format: 'University Model',
    },
  ];

  return (
    <div className="relative w-full h-full overflow-y-auto bg-transparent select-none flex flex-col justify-between">
      <div className="relative z-10 max-w-5xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 space-y-10 my-auto">
        {/* 1. Friendly Personalized Scholar Greeting */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#DCE8D5] shadow-xs text-[#596B3D] text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Leaf className="w-3.5 h-3.5 text-[#89966A]" />
            <span>Botanical Education Laboratory</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#344536] tracking-tight">
            {getGreeting()}, <span className="text-[#596B3D]">Scholar.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#596B3D] max-w-xl mx-auto font-normal leading-relaxed">
            Welcome to your peaceful study workspace. Understand complex cybersecurity concepts, craft exam notes, and master every syllabus topic.
          </p>
        </div>

        {/* 2. Clean AI Question Input */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative flex items-center rounded-2xl bg-white/85 border border-[#DCE8D5] focus-within:border-[#89966A] focus-within:ring-2 focus-within:ring-[#B7E4A5]/40 shadow-xs backdrop-blur-md transition-all p-1.5 sm:p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any cybersecurity concept, exam question, or attack mechanism..."
              className="w-full bg-transparent px-4 py-3 sm:py-3.5 text-sm sm:text-base text-[#344536] placeholder:text-[#89966A]/70 focus:outline-none"
            />

            <div className="flex items-center gap-2 pr-1">
              <button
                onClick={handleSend}
                disabled={!query.trim()}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 disabled:hover:bg-[#596B3D] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Input helper tags */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#89966A] flex-wrap">
            <span className="font-medium">Try:</span>
            {['RSA Key Generation', 'Diffie-Hellman Math', 'SQLi Defense', 'Zero Trust Architecture'].map((tag, i) => (
              <button
                key={i}
                onClick={() => setQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-[#DCE8D5] text-[#344536] hover:text-[#596B3D] transition-colors text-[11px]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Quick Actions Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#596B3D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#89966A]" />
              Quick Academic Actions
            </h2>
            <span className="text-[11px] text-[#89966A]">AI-Powered Tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="p-5 rounded-2xl bg-white/80 hover:bg-white border border-[#DCE8D5] hover:border-[#89966A] shadow-xs hover:shadow-md hover:shadow-[#596B3D]/10 transition-all cursor-pointer group flex flex-col justify-between backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[#DCE8D5]/50 flex items-center justify-center text-[#596B3D] group-hover:bg-[#596B3D] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAFAF4] border border-[#DCE8D5] text-[#596B3D]">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-[#344536] group-hover:text-[#596B3D] transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#89966A] leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DCE8D5]/60 flex items-center justify-between text-[11px] font-semibold text-[#596B3D] group-hover:translate-x-0.5 transition-transform">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Recent Learning Topics Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#596B3D] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#89966A]" />
              Recent Learning Topics
            </h2>
            <span className="text-[11px] text-[#89966A]">Click topic to study</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/75 hover:bg-white border border-[#DCE8D5] hover:border-[#89966A] shadow-xs transition-all flex flex-col justify-between backdrop-blur-md group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#89966A] mb-1.5">
                    <span className="font-medium truncate">{item.category}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#DCE8D5]/50 text-[#596B3D] font-semibold">
                      {item.format}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-[#344536] group-hover:text-[#596B3D] transition-colors">
                    {item.topic}
                  </h3>

                  <p className="text-xs text-[#4A5A38] mt-1 line-clamp-2 leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#DCE8D5]/60 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => onNavigateToNotes(item.topic)}
                    className="font-semibold text-[#596B3D] hover:underline flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Generate Notes</span>
                  </button>
                  <button
                    onClick={() => onNavigateToQuiz(item.topic)}
                    className="font-semibold text-[#89966A] hover:text-[#596B3D] flex items-center gap-1"
                  >
                    <GraduationCap className="w-3 h-3" />
                    <span>Test Quiz</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotanicalHubView;
