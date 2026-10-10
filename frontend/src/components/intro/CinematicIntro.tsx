import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles } from 'lucide-react';
import { BotanicalAmbiance } from '../common/BotanicalAmbiance';

gsap.registerPlugin(ScrollTrigger);

interface CinematicIntroProps {
  onEnterApp?: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = () => {
  const introContainerRef = useRef<HTMLDivElement>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const letterPRef = useRef<HTMLSpanElement>(null);
  const otherLettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const portalGlowRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const brandTagRef = useRef<HTMLDivElement>(null);
  const foliageLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const container = introContainerRef.current;
    const letterP = letterPRef.current;
    const portal = portalGlowRef.current;
    const subtitle = subtitleRef.current;
    const brandTag = brandTagRef.current;
    const foliage = foliageLayerRef.current;

    if (!container || !letterP || !portal) return;

    const ctx = gsap.context(() => {
      const leftLetters = [
        otherLettersRef.current[0],
        otherLettersRef.current[1],
        otherLettersRef.current[2],
      ].filter(Boolean);

      const rightLetters = [
        otherLettersRef.current[3],
        otherLettersRef.current[4],
        otherLettersRef.current[5],
      ].filter(Boolean);

      gsap.set(letterP, { transformOrigin: '50% 50%', willChange: 'transform, opacity' });
      gsap.set([leftLetters, rightLetters], { willChange: 'transform, opacity' });

      // Snappy, linear ScrollTrigger timeline for 100% smooth bidirectional scrubbing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=90%',
          pin: true,
          scrub: 0.15,
          invalidateOnRefresh: true,
        }
      });

      // 1. Brand Tag & Subtitle fade out gently
      tl.to([subtitle, brandTag].filter(Boolean), {
        opacity: 0,
        y: -25,
        duration: 0.25,
        ease: 'power1.out',
      }, 0);

      // 2. Parallax drift on botanical foliage layer
      if (foliage) {
        tl.to(foliage, {
          yPercent: -15,
          scale: 1.05,
          duration: 0.6,
          ease: 'power1.inOut',
        }, 0);
      }

      // 3. Left letters (C, R, Y) part to the left smoothly
      tl.to(leftLetters, {
        opacity: 0,
        xPercent: -80,
        duration: 0.45,
        ease: 'power1.inOut',
      }, 0.05);

      // 4. Right letters (T, O, N) part to the right smoothly
      tl.to(rightLetters, {
        opacity: 0,
        xPercent: 80,
        duration: 0.45,
        ease: 'power1.inOut',
      }, 0.05);

      // 5. Center letter P zooms smoothly forward into the botanical portal
      tl.to(letterP, {
        scale: 14,
        color: '#89966A',
        duration: 0.75,
        ease: 'power1.inOut',
      }, 0.1);

      // 6. Soft sage-green light wash opens smoothly through P
      tl.to(portal, {
        opacity: 1,
        scale: 1.2,
        duration: 0.45,
        ease: 'power1.inOut',
      }, 0.3);

      // 7. Seamlessly dissolve into the landing page
      tl.to(container, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.2,
        ease: 'none',
      }, 0.8);

    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={introContainerRef}
      className="relative w-full h-screen overflow-hidden bg-[#FAFAF4] select-none flex flex-col items-center justify-center will-change-[opacity]"
    >
      {/* 1. Serene Botanical Ambiance & Atmospheric Lighting */}
      <div ref={foliageLayerRef} className="absolute inset-0 pointer-events-none">
        <BotanicalAmbiance showWaterSurface={true} intensity="intro" />
      </div>

      {/* 2. Top Brand Tag */}
      <div 
        ref={brandTagRef}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/75 border border-[#DCE8D5] shadow-xs backdrop-blur-md"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#596B3D] animate-spin" style={{ animationDuration: '8s' }} />
        <span className="text-xs font-semibold tracking-widest uppercase text-[#344536]">
          AI Cybersecurity Study Agent
        </span>
      </div>

      {/* 3. The Central Word: C R Y P T O N (PRESERVED TYPOGRAPHY & LETTER POSITIONS) */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          ref={wordContainerRef}
          className="font-display font-extrabold tracking-[-0.04em] text-center text-[17vw] sm:text-[19vw] md:text-[21vw] leading-none text-[#344536] flex items-center justify-center select-none"
        >
          {/* C */}
          <span
            ref={(el) => {
              otherLettersRef.current[0] = el;
            }}
            className="inline-block"
          >
            C
          </span>
          {/* R */}
          <span
            ref={(el) => {
              otherLettersRef.current[1] = el;
            }}
            className="inline-block"
          >
            R
          </span>
          {/* Y */}
          <span
            ref={(el) => {
              otherLettersRef.current[2] = el;
            }}
            className="inline-block"
          >
            Y
          </span>

          {/* P — THE FOCAL PORTAL LETTER */}
          <span
            ref={letterPRef}
            id="intro-letter-p"
            className="inline-block relative text-[#596B3D]"
          >
            P
          </span>

          {/* T */}
          <span
            ref={(el) => {
              otherLettersRef.current[3] = el;
            }}
            className="inline-block"
          >
            T
          </span>
          {/* O */}
          <span
            ref={(el) => {
              otherLettersRef.current[4] = el;
            }}
            className="inline-block"
          >
            O
          </span>
          {/* N */}
          <span
            ref={(el) => {
              otherLettersRef.current[5] = el;
            }}
            className="inline-block"
          >
            N
          </span>
        </div>

        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="mt-6 text-center max-w-lg px-6"
        >
          <p className="text-sm md:text-base font-medium text-[#475631] tracking-wide">
            Understand Cybersecurity. <span className="text-[#253327] font-semibold">Master Every Concept.</span>
          </p>
        </div>
      </div>

      {/* 4. Soft Sage-Green Light Wash through P */}
      <div
        ref={portalGlowRef}
        className="pointer-events-none absolute inset-0 z-20 opacity-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98)_0%,rgba(220,232,213,0.88)_35%,rgba(183,228,165,0.45)_70%,transparent_100%)] flex items-center justify-center"
      >
        <div className="w-[45vw] h-[45vw] rounded-full bg-[#DCE8D5]/50 blur-3xl" />
      </div>
    </div>
  );
};

export default CinematicIntro;
