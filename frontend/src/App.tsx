import React, { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicIntro } from './components/intro/CinematicIntro';
import { LandingPage } from './components/home/LandingPage';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { WarpTransformation } from './components/common/WarpTransformation';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'landing' | 'workspace'>('landing');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    if (currentMode !== 'landing') return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize smooth scrolling with Lenis integrated with GSAP ScrollTrigger
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', handleScroll);

    const handleTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(handleTicker);
    gsap.ticker.lagSmoothing(0);

    // Refresh after DOM layout settling
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      lenis.destroy();
      gsap.ticker.remove(handleTicker);
    };
  }, [currentMode]);

  const handleEnterWorkspace = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
  };

  const handleMidpoint = () => {
    setCurrentMode('workspace');
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

  const handleComplete = () => {
    setIsTransitioning(false);
  };

  const handleBackToHome = () => {
    setCurrentMode('landing');
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

  return (
    <>
      {/* High-Tech Cybernetic Warp Transformation Overlay */}
      <WarpTransformation
        isActive={isTransitioning}
        onMidpoint={handleMidpoint}
        onComplete={handleComplete}
      />

      {currentMode === 'workspace' ? (
        <WorkspaceLayout onBackToHome={handleBackToHome} />
      ) : (
        <div className="w-full min-h-screen bg-[#FAFAF4]">
          {/* 1. Cinematic Intro: Centered CRYPTON typography with scroll zoom into letter P */}
          <CinematicIntro onEnterApp={handleEnterWorkspace} />

          {/* 2. Landing Page & Product Overview */}
          <LandingPage 
            onStartLearning={handleEnterWorkspace} 
            isTransitioning={isTransitioning}
          />
        </div>
      )}
    </>
  );
};

export default App;

