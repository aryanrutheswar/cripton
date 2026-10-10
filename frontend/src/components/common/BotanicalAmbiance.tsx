import React from 'react';

interface BotanicalAmbianceProps {
  showWaterSurface?: boolean;
  intensity?: 'intro' | 'workspace' | 'subtle';
}

export const BotanicalAmbiance: React.FC<BotanicalAmbianceProps> = ({
  showWaterSurface = true,
  intensity = 'intro',
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Base atmospheric warm ivory & soft sage gradients */}
      <div className="absolute inset-0 bg-[#FAFAF4]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-[radial-gradient(ellipse_at_top,rgba(220,232,213,0.55)_0%,rgba(247,249,245,0.4)_50%,transparent_80%)]" />
      <div className="absolute -top-32 -left-32 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(183,228,165,0.22)_0%,rgba(220,232,213,0.1)_55%,transparent_75%)] blur-3xl" />
      <div className="absolute top-1/4 -right-32 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(220,232,213,0.35)_0%,rgba(250,250,244,0)_70%)] blur-3xl" />

      {/* 2. Soft morning sunlight filtering down from top-left */}
      <div 
        className="absolute -top-20 -left-10 w-[70vw] h-[95vh] opacity-40 bg-[radial-gradient(ellipse_at_15%_10%,rgba(255,255,255,0.95)_0%,rgba(235,245,230,0.45)_35%,rgba(183,228,165,0.15)_65%,transparent_85%)] blur-2xl transform -rotate-12 animate-sunlight" 
      />

      {/* 3. Subtle drifting botanical shadow pattern (breeze effect) */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none animate-breeze">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1000 1000">
          <path d="M 50 100 C 150 150, 200 250, 300 180 C 400 110, 500 220, 650 160 C 800 100, 900 240, 950 180" fill="none" stroke="#596B3D" strokeWidth="18" strokeLinecap="round" />
          <path d="M 120 400 C 220 460, 320 380, 480 430 C 640 480, 780 390, 880 460" fill="none" stroke="#596B3D" strokeWidth="14" strokeLinecap="round" />
        </svg>
      </div>

      {/* 4. Delicate Botanical Branches entering subtly from the edges */}
      {/* Top-Left Branch with leaves */}
      <div className="absolute -top-6 -left-6 w-72 sm:w-96 md:w-[32rem] opacity-[0.42] transform origin-top-left animate-breeze">
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Main Stem */}
          <path d="M 0 0 C 80 50, 160 80, 260 110 C 330 130, 380 170, 395 210" stroke="#89966A" strokeWidth="3" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M 90 55 C 110 30, 145 35, 140 65 C 135 95, 100 80, 90 55 Z" fill="#B7E4A5" fillOpacity="0.5" stroke="#89966A" strokeWidth="1.2" />
          <path d="M 170 82 C 195 55, 230 65, 220 95 C 210 120, 180 105, 170 82 Z" fill="#DCE8D5" fillOpacity="0.65" stroke="#89966A" strokeWidth="1.2" />
          <path d="M 245 105 C 275 85, 305 95, 295 125 C 285 150, 255 130, 245 105 Z" fill="#B7E4A5" fillOpacity="0.45" stroke="#596B3D" strokeWidth="1.2" />
          <path d="M 320 135 C 350 120, 375 135, 365 160 C 355 185, 330 165, 320 135 Z" fill="#DCE8D5" fillOpacity="0.6" stroke="#89966A" strokeWidth="1.2" />
          <path d="M 380 180 C 405 175, 415 195, 400 215 C 385 230, 370 205, 380 180 Z" fill="#B7E4A5" fillOpacity="0.4" stroke="#89966A" strokeWidth="1" />
        </svg>
      </div>

      {/* Top-Right Branch entering gracefully */}
      <div className="absolute -top-8 -right-8 w-64 sm:w-80 md:w-[28rem] opacity-[0.38] transform origin-top-right scale-x-[-1] animate-breeze" style={{ animationDelay: '2.5s' }}>
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M 0 0 C 90 40, 180 70, 270 95 C 340 120, 380 160, 390 190" stroke="#89966A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 100 45 C 125 25, 155 35, 145 60 C 135 85, 110 70, 100 45 Z" fill="#DCE8D5" fillOpacity="0.6" stroke="#89966A" strokeWidth="1.2" />
          <path d="M 190 72 C 215 50, 245 60, 235 88 C 225 110, 200 95, 190 72 Z" fill="#B7E4A5" fillOpacity="0.45" stroke="#596B3D" strokeWidth="1.2" />
          <path d="M 280 98 C 305 80, 330 95, 320 120 C 310 142, 290 120, 280 98 Z" fill="#DCE8D5" fillOpacity="0.55" stroke="#89966A" strokeWidth="1.2" />
        </svg>
      </div>

      {/* 5. Translucent pastel-green glass spheres floating slowly with subtle specular highlights */}
      {/* Sphere 1: Top Right */}
      <div 
        className="absolute top-24 right-[12vw] w-14 h-14 sm:w-20 sm:h-20 rounded-full glass-sphere animate-float-slow opacity-85"
        style={{ animationDuration: '9s' }}
      >
        {/* Specular glint */}
        <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-white/70 blur-[0.5px]" />
      </div>

      {/* Sphere 2: Mid-Left Floating */}
      <div 
        className="absolute top-[48vh] left-[6vw] w-10 h-10 sm:w-16 sm:h-16 rounded-full glass-sphere animate-float-reverse opacity-75"
        style={{ animationDuration: '11s', animationDelay: '1.5s' }}
      >
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-white/80 blur-[0.5px]" />
      </div>

      {/* Sphere 3: Lower Right Near Water */}
      <div 
        className="absolute bottom-28 right-[18vw] w-12 h-12 sm:w-16 sm:h-16 rounded-full glass-sphere animate-float-slow opacity-80"
        style={{ animationDuration: '10s', animationDelay: '3s' }}
      >
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-white/75 blur-[0.5px]" />
      </div>

      {/* 6. Slowly Drifting Organic Leaves / Petals */}
      <div className="absolute top-0 left-[25vw] w-5 h-7 opacity-50 animate-leaf-drift" style={{ animationDuration: '15s', animationDelay: '0s' }}>
        <svg viewBox="0 0 20 28" fill="#B7E4A5" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10 0 C 18 8, 18 20, 10 28 C 2 20, 2 8, 10 0 Z" fillOpacity="0.55" stroke="#89966A" strokeWidth="0.8" />
        </svg>
      </div>
      <div className="absolute top-0 right-[30vw] w-4 h-6 opacity-40 animate-leaf-drift" style={{ animationDuration: '19s', animationDelay: '5s' }}>
        <svg viewBox="0 0 20 28" fill="#DCE8D5" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10 0 C 18 8, 18 20, 10 28 C 2 20, 2 8, 10 0 Z" fillOpacity="0.6" stroke="#89966A" strokeWidth="0.8" />
        </svg>
      </div>

      {/* 7. Reflective Calm Water-like Surface near the bottom */}
      {showWaterSurface && (
        <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 bg-water-surface backdrop-blur-xs flex flex-col justify-end overflow-hidden">
          {/* Subtle water caustics / gentle ripple waves */}
          <div className="w-full h-full relative opacity-40">
            <div className="absolute bottom-6 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B7E4A5]/70 to-transparent blur-[0.5px]" />
            <div className="absolute bottom-12 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[0.5px]" />
            <div className="absolute bottom-2 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#DCE8D5]/60 to-transparent" />
          </div>
          {/* Water reflection soft gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#DCE8D5]/35 via-[#FAFAF4]/10 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default BotanicalAmbiance;
