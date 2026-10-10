import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShieldCheck, Sparkles, Leaf, Cpu } from 'lucide-react';

interface WarpTransformationProps {
  isActive: boolean;
  onMidpoint: () => void;
  onComplete: () => void;
}

// Gentle serene botanical chime at transition midpoint
const playBotanicalChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 1. Warm harmonic fundamental (528 Hz serenity tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.16, now + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // 2. High crystalline bell overtone (1056 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1056, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 1.35);
  } catch {
    // Fail silently if browser blocks audio autoplay
  }
};

export const WarpTransformation: React.FC<WarpTransformationProps> = ({
  isActive,
  onMidpoint,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const ring3Ref = useRef<HTMLDivElement>(null);
  const hudTextRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lightWashRef = useRef<HTMLDivElement>(null);

  const onMidpointRef = useRef(onMidpoint);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onMidpointRef.current = onMidpoint;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!isActive) return;

    playBotanicalChime();

    const container = containerRef.current;
    const core = coreRef.current;
    const ring1 = ring1Ref.current;
    const ring2 = ring2Ref.current;
    const ring3 = ring3Ref.current;
    const hudText = hudTextRef.current;
    const progressBar = progressBarRef.current;
    const lightWash = lightWashRef.current;

    if (!container || !core) return;

    // Reset initial states
    gsap.set(container, { display: 'flex', opacity: 0 });
    gsap.set(core, { scale: 0.6, opacity: 0 });
    gsap.set([ring1, ring2, ring3], { scale: 0.3, opacity: 0 });
    gsap.set(hudText, { opacity: 0, y: 16 });
    gsap.set(progressBar, { width: '0%' });
    gsap.set(lightWash, { opacity: 0, scale: 0.6 });

    const tl = gsap.timeline({
      onComplete: () => {
        onCompleteRef.current();
      },
    });

    // 1. Soft warm ivory & sage overlay fade-in (0.0 -> 0.35s)
    tl.to(container, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
    }, 0);

    // 2. Translucent Sage Rings gently bloom outward (0.08 -> 0.7s)
    tl.to([ring1, ring2, ring3], {
      opacity: 0.75,
      scale: 1,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power2.out',
    }, 0.08);

    // 3. Central Botanical Shield pops gently (0.12 -> 0.65s)
    tl.to(core, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.4)',
    }, 0.12);

    // 4. Status text and progress bar fill smoothly (0.15 -> 0.75s)
    tl.to(hudText, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, 0.15);

    tl.to(progressBar, {
      width: '100%',
      duration: 0.62,
      ease: 'power1.inOut',
    }, 0.18);

    // 5. Soft sage-green light wash expands through center (0.65 -> 0.85s)
    tl.to(lightWash, {
      opacity: 0.95,
      scale: 2.2,
      duration: 0.22,
      ease: 'power2.in',
    }, 0.65);

    // 6. Midpoint trigger: Switch page behind the light wash (t = 0.82s)
    tl.call(() => {
      onMidpointRef.current();
    }, [], 0.82);

    // 7. Light wash blooms and reveals the workspace smoothly (0.82 -> 1.4s)
    tl.to([ring1, ring2, ring3], {
      scale: 3.2,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.inOut',
    }, 0.82);

    tl.to(core, {
      scale: 1.8,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in',
    }, 0.82);

    tl.to(hudText, {
      opacity: 0,
      y: -16,
      duration: 0.28,
      ease: 'power2.in',
    }, 0.82);

    tl.to(lightWash, {
      opacity: 0,
      scale: 3.5,
      duration: 0.52,
      ease: 'power2.out',
    }, 0.85);

    tl.to(container, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, 0.95);

    return () => {
      tl.kill();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col items-center justify-center bg-[#FAFAF4]/95 backdrop-blur-xl overflow-hidden select-none"
      style={{ display: 'none' }}
    >
      {/* Soft sage-green and warm ivory atmospheric gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,232,213,0.75)_0%,rgba(250,250,244,0.92)_55%,rgba(250,250,244,0.99)_100%)] pointer-events-none" />

      {/* Floating translucent sage spheres */}
      <div className="absolute w-64 h-64 rounded-full bg-[#B7E4A5]/20 blur-3xl pointer-events-none top-1/4 -left-12" />
      <div className="absolute w-72 h-72 rounded-full bg-[#DCE8D5]/35 blur-3xl pointer-events-none bottom-1/4 -right-12" />

      {/* Blossoming Translucent Sage Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={ring1Ref}
          className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-[#89966A]/40 shadow-[0_0_30px_rgba(183,228,165,0.4)]"
        />
        <div
          ref={ring2Ref}
          className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-dashed border-[#89966A]/30 animate-spin"
          style={{ animationDuration: '32s' }}
        />
        <div
          ref={ring3Ref}
          className="absolute w-96 h-96 sm:w-[30rem] sm:h-[30rem] rounded-full border border-[#DCE8D5]/60"
        />
      </div>

      {/* Soft Sage-Green Light Wash */}
      <div
        ref={lightWashRef}
        className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(220,232,213,0.9)_45%,rgba(183,228,165,0.3)_75%,transparent_100%)] pointer-events-none blur-xl"
      />

      {/* Central Botanical Shield Emblem */}
      <div ref={coreRef} className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full border border-dashed border-[#89966A]/30 animate-spin" style={{ animationDuration: '18s' }} />
          <div className="absolute -inset-8 rounded-full border border-[#DCE8D5]" />

          {/* Botanical Glass Shield */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/80 p-1 shadow-lg shadow-[#596B3D]/15 border border-[#DCE8D5] flex items-center justify-center backdrop-blur-md">
            <div className="w-full h-full rounded-[20px] bg-gradient-to-tr from-[#FAFAF4] to-[#DCE8D5]/40 flex flex-col items-center justify-center gap-1">
              <ShieldCheck className="w-10 h-10 text-[#596B3D]" />
              <Leaf className="w-4 h-4 text-[#89966A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Serene Progress & Status */}
      <div ref={hudTextRef} className="relative z-10 mt-8 text-center flex flex-col items-center max-w-md px-4">
        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 border border-[#DCE8D5] text-[#596B3D] text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#596B3D] animate-spin" style={{ animationDuration: '6s' }} />
          <span>ENTERING BOTANICAL STUDY LAB</span>
        </div>

        {/* Headline */}
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#344536] tracking-tight">
          Awakening Education AI
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#596B3D] font-medium mt-1">
          Preparing Academic Examination Laboratory • Gemini 3.5 Active
        </p>

        {/* Progress Bar */}
        <div className="w-56 sm:w-72 h-1.5 rounded-full bg-[#DCE8D5]/80 border border-[#DCE8D5] mt-5 overflow-hidden p-0.5 shadow-inner">
          <div
            ref={progressBarRef}
            className="h-full rounded-full bg-gradient-to-r from-[#B7E4A5] via-[#89966A] to-[#596B3D]"
          />
        </div>
      </div>
    </div>
  );
};

export default WarpTransformation;
