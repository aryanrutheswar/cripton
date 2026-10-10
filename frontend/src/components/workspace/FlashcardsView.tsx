import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  RotateCw, 
  Check, 
  Bookmark, 
  Layers,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Flashcard, DocumentInfo } from '../../types';
import { api } from '../../services/api';

interface FlashcardsViewProps {
  initialTopic?: string;
  activeDocument: DocumentInfo | null;
  onOpenSettings: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  initialTopic = 'Core Cryptography Terminology',
  activeDocument,
  onOpenSettings,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: 1,
      front: "What is a Nonce in Cryptography?",
      back: "A 'Number used ONCE' — an arbitrary pseudo-random number used in cryptographic authentication protocols to prevent replay attacks.",
      category: "Cryptography"
    },
    {
      id: 2,
      front: "What is the primary difference between Symmetric and Asymmetric encryption?",
      back: "Symmetric uses the same single shared key for both encryption and decryption (fast, AES). Asymmetric uses a mathematically linked key pair: Public for encryption and Private for decryption (RSA, ECC).",
      category: "Cryptography"
    },
    {
      id: 3,
      front: "What is the role of an Initialization Vector (IV)?",
      back: "A non-secret random input value used with a secret key in block cipher modes (like CBC) to ensure that encrypting identical plaintexts produces completely different ciphertexts.",
      category: "Block Ciphers"
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTopic && initialTopic !== 'Core Cryptography Terminology') {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());

    try {
      const docId = activeDocument ? activeDocument.document_id : undefined;
      const res = await api.generateFlashcards(topic.trim(), 6, docId);
      setCards(res.cards);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = () => {
    const currentId = cards[currentIndex]?.id;
    if (!currentId) return;
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(currentId)) {
        next.delete(currentId);
      } else {
        next.add(currentId);
      }
      return next;
    });
  };

  const currentCard = cards[currentIndex];
  const isMastered = currentCard && masteredIds.has(currentCard.id);

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 sm:p-10 text-[#344536]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header & Controls */}
        <div className="bg-white/85 p-6 rounded-3xl border border-[#DCE8D5] shadow-xs space-y-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#596B3D] mb-1">
                <Layers className="w-4 h-4 text-[#89966A]" /> Rapid Spaced Repetition
              </div>
              <h2 className="font-display font-bold text-2xl text-[#344536]">
                Cybersecurity 3D Flashcards
              </h2>
            </div>

            <div className="text-xs text-[#596B3D] font-medium">
              Mastered: <span className="font-bold text-[#344536]">{masteredIds.size}</span> / {cards.length}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter flashcard topic (e.g. OSI Model Attacks, Hash Functions)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCE8D5] focus:border-[#89966A] focus:ring-2 focus:ring-[#B7E4A5]/30 text-sm text-[#344536] placeholder:text-[#89966A]/60 focus:outline-none bg-white"
            />
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || loading}
              className="px-6 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B7E4A5]" />
                  <span>Generate Cards</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              onClick={onOpenSettings}
              className="px-3 py-1 rounded-lg bg-[#596B3D] text-white font-semibold cursor-pointer"
            >
              Settings
            </button>
          </div>
        )}

        {/* 3D Flashcard Display */}
        {currentCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-[#596B3D] px-2">
              <span className="font-semibold text-[#344536]">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="p-1.5 rounded-lg border border-[#DCE8D5] hover:bg-[#FAFAF4] text-[#344536] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Shuffle deck"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#89966A]" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* The 3D Flip Card Container */}
            <div
              onClick={handleFlip}
              className="relative w-full h-80 cursor-pointer flashcard-perspective select-none"
            >
              <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
                {/* Front Side */}
                <div className="flashcard-face flashcard-face-front p-8 sm:p-10 flex flex-col justify-between bg-white/95 border border-[#DCE8D5] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#596B3D] px-3 py-1 rounded-full bg-[#DCE8D5]/50 border border-[#DCE8D5]">
                      {currentCard.category || 'Concept'}
                    </span>
                    <span className="text-xs text-[#89966A]">Click to flip</span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#344536] leading-snug">
                      {currentCard.front}
                    </h3>
                  </div>

                  <div className="text-center text-xs text-[#89966A] font-medium">
                    Tap spacebar or card to reveal answer
                  </div>
                </div>

                {/* Back Side */}
                <div className="flashcard-face flashcard-face-back p-8 sm:p-10 flex flex-col justify-between bg-white border border-[#89966A] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#596B3D] px-3 py-1 rounded-full bg-[#DCE8D5]/60 border border-[#DCE8D5]">
                      Explanation & Exam Cue
                    </span>
                    <span className="text-xs text-[#89966A]">Answer</span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-base sm:text-lg text-[#344536] leading-relaxed font-normal">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="text-center text-xs text-[#596B3D] font-semibold">
                    Click to flip back
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Mastery Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-[#DCE8D5] hover:bg-white text-xs font-semibold text-[#344536] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#89966A]" />
                <span>Previous</span>
              </button>

              <button
                onClick={toggleMastered}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMastered
                    ? 'bg-[#DCE8D5]/60 text-[#344536] border border-[#89966A]'
                    : 'bg-white border border-[#DCE8D5] hover:border-[#89966A] text-[#344536]'
                }`}
              >
                {isMastered ? <CheckCircle2 className="w-4 h-4 text-[#596B3D]" /> : <Check className="w-4 h-4 text-[#89966A]" />}
                <span>{isMastered ? 'Mastered!' : 'Mark Mastered'}</span>
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl bg-[#596B3D] hover:bg-[#4A5A30] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
