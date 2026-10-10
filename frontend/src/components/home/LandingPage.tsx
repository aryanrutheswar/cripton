import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles, Leaf } from 'lucide-react';
import { BotanicalAmbiance } from '../common/BotanicalAmbiance';

interface LandingPageProps {
  onStartLearning: () => void;
  isTransitioning?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartLearning, isTransitioning = false }) => {
  return (
    <div 
      id="home-content" 
      className="relative w-full min-h-screen bg-[#FAFAF4] text-[#344536] flex flex-col justify-between items-center overflow-hidden px-6 sm:px-12 py-12 sm:py-16 select-none"
    >
      {/* Serene Botanical Ambiance & Atmospheric Lighting */}
      <BotanicalAmbiance showWaterSurface={true} intensity="workspace" />

      {/* Top spacer for balanced centering */}
      <div className="w-full h-4 sm:h-8" />

      {/* Main Expansive Center Content */}
      <main className="relative z-10 max-w-6xl w-full flex flex-col items-center text-center my-auto">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 border border-[#DCE8D5] shadow-xs text-[#596B3D] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-md">
          <Leaf className="w-4 h-4 text-[#89966A]" />
          <span>The Dedicated Cybersecurity AI Education Platform</span>
        </div>

        {/* Grand Headline */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[6.2vw] font-extrabold tracking-[-0.04em] text-[#344536] leading-[1.04] max-w-5xl">
          Cybersecurity, Finally Made{' '}
          <span className="text-[#596B3D] drop-shadow-[0_2px_18px_rgba(183,228,165,0.45)]">
            Understandable.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 sm:mt-8 text-lg sm:text-2xl text-[#4A5A38] max-w-3xl font-normal leading-relaxed">
          Ask anything. Understand everything. Turn complex security concepts, cryptographic algorithms, and networking protocols into exceptional study notes in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <button
            onClick={onStartLearning}
            disabled={isTransitioning}
            className="px-9 sm:px-11 py-4 sm:py-5 rounded-2xl bg-[#596B3D] hover:bg-[#4A5A30] text-white font-bold text-base sm:text-lg shadow-md shadow-[#596B3D]/25 hover:shadow-lg hover:shadow-[#596B3D]/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer group disabled:opacity-80 disabled:pointer-events-none"
          >
            {isTransitioning ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-white" />
                <span>Entering Botanical Lab...</span>
              </>
            ) : (
              <>
                <span>Start Learning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button
            onClick={onStartLearning}
            disabled={isTransitioning}
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white/85 hover:bg-[#FAFAF4] text-[#344536] font-bold text-base sm:text-lg border-2 border-[#DCE8D5] hover:border-[#89966A] shadow-xs hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md transition-all cursor-pointer disabled:opacity-80 disabled:pointer-events-none"
          >
            Explore the AI
          </button>
        </div>
      </main>

      {/* Bottom spacer for balanced centering */}
      <div className="w-full h-4 sm:h-8" />
    </div>
  );
};

export default LandingPage;
