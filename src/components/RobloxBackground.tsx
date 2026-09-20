import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

export const RobloxBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* ========================================================================= */}
      {/* 1. SKY & SUN WITH GLOWING ROTATING SUNBEAMS                               */}
      {/* ========================================================================= */}
      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1d7bf8] via-[#52a7ff] to-[#a2d8ff]" />

      {/* Radiant Sunburst Rays (Desktop/Tablet only for max 60FPS mobile performance) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-24 -left-24 w-[600px] h-[600px] opacity-20 pointer-events-none hidden md:block"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg 15deg, rgba(255,255,255,0.7) 15deg 30deg, transparent 30deg 45deg, rgba(255,255,255,0.7) 45deg 60deg, transparent 60deg 75deg, rgba(255,255,255,0.7) 75deg 90deg, transparent 90deg 105deg, rgba(255,255,255,0.7) 105deg 120deg, transparent 120deg 135deg, rgba(255,255,255,0.7) 135deg 150deg, transparent 150deg 165deg, rgba(255,255,255,0.7) 165deg 180deg, transparent 180deg 195deg, rgba(255,255,255,0.7) 195deg 210deg, transparent 210deg 225deg, rgba(255,255,255,0.7) 225deg 240deg, transparent 240deg 255deg, rgba(255,255,255,0.7) 255deg 270deg, transparent 270deg 285deg, rgba(255,255,255,0.7) 285deg 300deg, transparent 300deg 315deg, rgba(255,255,255,0.7) 315deg 330deg, transparent 330deg 345deg, rgba(255,255,255,0.7) 345deg 360deg)',
        }}
      />

      {/* Sun with intense glow and rays */}
      <div className="absolute top-8 left-8 sm:top-14 sm:left-14 w-28 h-28 sm:w-40 sm:h-40 bg-yellow-200 rounded-full blur-[1px] opacity-95 shadow-[0_0_40px_15px_rgba(253,224,71,0.5)] md:shadow-[0_0_90px_35px_rgba(253,224,71,0.65)]">
        {/* Sun inner core */}
        <div className="absolute inset-3 bg-gradient-to-tr from-amber-300 via-yellow-100 to-white rounded-full blur-xs" />
      </div>

      {/* ========================================================================= */}
      {/* 2. FAINT DREAMY CELESTIAL RAINBOW                                         */}
      {/* ========================================================================= */}
      <div className="absolute -top-16 right-[5%] sm:right-[15%] w-[450px] sm:w-[650px] h-[300px] sm:h-[400px] opacity-25 pointer-events-none">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
              <stop offset="20%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 20 200 A 180 180 0 0 1 380 200"
            fill="none"
            stroke="url(#rainbowGrad)"
            strokeWidth="24"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 3. FLOATING ROBLOX HOT AIR BALLOON (Drifts smoothly in background)        */}
      {/* ========================================================================= */}
      <motion.div
        animate={{
          x: [-30, 40, -30],
          y: [-15, 10, -15],
          rotate: [-2, 3, -2],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[12%] sm:right-[20%] hidden md:flex flex-col items-center z-1 opacity-80 scale-90 sm:scale-100"
      >
        {/* Balloon Body */}
        <div className="relative w-16 h-20 bg-gradient-to-b from-rose-500 via-amber-400 to-sky-500 rounded-[50%_50%_45%_45%] shadow-lg border-2 border-white/80 overflow-hidden flex items-center justify-center">
          {/* Vertical Color Stripes */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full bg-red-500/80" />
            <div className="w-1/3 h-full bg-yellow-400/80 border-x border-white/50" />
            <div className="w-1/3 h-full bg-blue-500/80" />
          </div>
          {/* Roblox 'R' Logo on Balloon */}
          <div className="relative z-10 w-6 h-6 rounded-md bg-white/90 shadow flex items-center justify-center rotate-12">
            <span className="font-black text-[11px] text-slate-900 leading-none">R</span>
          </div>
          {/* Balloon Shine */}
          <div className="absolute top-1 left-2 w-4 h-8 bg-white/40 rounded-full blur-[1px]" />
        </div>
        {/* Balloon Ropes */}
        <div className="w-6 h-3 flex justify-between px-1">
          <div className="w-0.5 h-full bg-amber-900/60" />
          <div className="w-0.5 h-full bg-amber-900/60" />
        </div>
        {/* Basket */}
        <div className="w-6 h-4 bg-amber-800 rounded-sm border border-amber-950 shadow-sm" />
      </motion.div>

      {/* ========================================================================= */}
      {/* 4. FLOATING 3D ROBLOX STUDS & SPARKLE GEMS (Whimsical bobbing)            */}
      {/* ========================================================================= */}
      {/* Floating Yellow Stud */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-36 left-[8%] hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-lg items-center justify-center"
      >
        <div className="w-4 h-4 rounded-full bg-white/80 shadow-xs" />
      </motion.div>

      {/* Floating Cyan Stud */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -25, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-52 right-[8%] hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 border-2 border-white shadow-lg items-center justify-center"
      >
        <div className="w-4 h-4 rounded-full bg-white/80 shadow-xs" />
      </motion.div>

      {/* Floating Pink Heart Gem */}
      <motion.div
        animate={{ y: [0, -14, 0], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-40 left-[18%] hidden sm:flex w-8 h-8 rounded-full bg-pink-400/80 border-2 border-white shadow-md items-center justify-center text-white"
      >
        <Heart className="w-4 h-4 fill-white text-white" />
      </motion.div>

      {/* Floating Twinkle Sparkles */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 left-[35%] text-yellow-200 pointer-events-none"
      >
        <Sparkles className="w-6 h-6 fill-yellow-200" />
      </motion.div>

      <motion.div
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-44 right-[30%] text-white pointer-events-none"
      >
        <Sparkles className="w-5 h-5 fill-white" />
      </motion.div>

      {/* ========================================================================= */}
      {/* 5. FLOATING DETAILED FLUFFY CLOUDS                                        */}
      {/* ========================================================================= */}
      {/* Cloud 1 (Large, left) */}
      <motion.div
        animate={{ x: [-20, 25, -20] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-24 left-[12%] opacity-85"
      >
        <div className="relative w-52 h-16 bg-white rounded-full backdrop-blur-xs shadow-[0_12px_24px_rgba(2,132,199,0.15)] border-2 border-white/60">
          <div className="absolute -top-7 left-6 w-18 h-18 bg-white rounded-full border-t border-white" />
          <div className="absolute -top-11 left-18 w-26 h-26 bg-white rounded-full border-t border-white" />
          <div className="absolute -top-5 right-8 w-16 h-16 bg-white rounded-full border-t border-white" />
        </div>
      </motion.div>

      {/* Cloud 2 (Huge, right) */}
      <motion.div
        animate={{ x: [25, -25, 25] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-14 left-[58%] opacity-75"
      >
        <div className="relative w-68 h-20 bg-white rounded-full backdrop-blur-xs shadow-[0_14px_28px_rgba(2,132,199,0.15)] border-2 border-white/60">
          <div className="absolute -top-11 left-10 w-26 h-26 bg-white rounded-full border-t border-white" />
          <div className="absolute -top-16 left-26 w-34 h-34 bg-white rounded-full border-t border-white" />
          <div className="absolute -top-9 right-12 w-22 h-22 bg-white rounded-full border-t border-white" />
        </div>
      </motion.div>

      {/* Cloud 3 (Small, far right) */}
      <motion.div
        animate={{ x: [-15, 20, -15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-52 right-[4%] opacity-70"
      >
        <div className="relative w-40 h-12 bg-white rounded-full shadow-[0_8px_16px_rgba(2,132,199,0.12)] border border-white/60">
          <div className="absolute -top-6 left-5 w-14 h-14 bg-white rounded-full" />
          <div className="absolute -top-9 left-14 w-18 h-18 bg-white rounded-full" />
        </div>
      </motion.div>

      {/* Cloud 4 (Small, far left) */}
      <motion.div
        animate={{ x: [10, -15, 10] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-64 -left-6 opacity-60"
      >
        <div className="relative w-44 h-14 bg-white rounded-full shadow-[0_8px_16px_rgba(2,132,199,0.1)] border border-white/60">
          <div className="absolute -top-7 left-9 w-18 h-18 bg-white rounded-full" />
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 6. GREEN ROLLING HILLS & DISTANT MOUNTAINS                                */}
      {/* ========================================================================= */}
      {/* Far Distant Mountains / Hills */}
      <div className="absolute bottom-[80px] sm:bottom-[100px] left-[-200px] w-[800px] sm:w-[1000px] h-[400px] sm:h-[500px] bg-[#3b8a40] rounded-[100%_100%_0_0] rotate-[-8deg] opacity-60 blur-[1px]" />
      <div className="absolute bottom-[70px] sm:bottom-[90px] right-[-250px] w-[900px] sm:w-[1100px] h-[450px] sm:h-[550px] bg-[#2d7331] rounded-[100%_100%_0_0] rotate-[5deg] opacity-70 blur-[1px]" />

      {/* Mid Rolling Hills */}
      <div className="absolute bottom-[30px] sm:bottom-[40px] left-[-100px] w-[700px] sm:w-[900px] h-[320px] sm:h-[400px] bg-[#66bb6a] rounded-[100%_100%_0_0] rotate-[-4deg] shadow-[inset_0_-20px_50px_rgba(0,0,0,0.1)] border-t border-white/20" />
      <div className="absolute bottom-[20px] sm:bottom-[30px] right-[-150px] w-[800px] sm:w-[1000px] h-[350px] sm:h-[420px] bg-[#4caf50] rounded-[100%_100%_0_0] rotate-[3deg] shadow-[inset_0_-20px_50px_rgba(0,0,0,0.1)] border-t border-white/20" />

      {/* Foreground Grass Field with enhanced details & Flowers */}
      <div className="absolute bottom-0 w-full h-[110px] sm:h-[140px] bg-[#2e7d32] border-t-4 border-[#1b5e20] shadow-[0_-10px_40px_rgba(0,0,0,0.25)]">
        {/* Bright rim highlight for grass */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-b from-[#4ade80] to-transparent opacity-60" />
        {/* Subtle Roblox Stud pattern overlay */}
        <div className="absolute inset-0 roblox-stud-pattern opacity-15" />

        {/* Animated cute flower 1 (left) */}
        <motion.div
          animate={{ rotate: [-4, 6, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 left-[8%] flex items-center justify-center"
        >
          <div className="w-5 h-5 rounded-full bg-rose-400 border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-300" />
          </div>
          <div className="absolute top-5 w-1 h-5 bg-[#1b5e20] rounded-full" />
        </motion.div>

        {/* Animated cute flower 2 (right) */}
        <motion.div
          animate={{ rotate: [5, -5, 5] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-5 right-[14%] flex items-center justify-center"
        >
          <div className="w-5 h-5 rounded-full bg-amber-300 border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-700" />
          </div>
          <div className="absolute top-5 w-1 h-6 bg-[#1b5e20] rounded-full" />
        </motion.div>

        {/* Animated cute flower 3 (mid right) */}
        <motion.div
          animate={{ rotate: [-6, 4, -6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-7 right-[32%] hidden sm:flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-sky-300 border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </motion.div>

        {/* Foreground Decorative Details (Grass blades) */}
        <div className="absolute top-4 left-[15%] w-3 h-8 bg-[#4caf50] rounded-t-full rotate-[-15deg] blur-[0.5px]" />
        <div className="absolute top-6 left-[16%] w-2 h-6 bg-[#66bb6a] rounded-t-full rotate-[10deg] blur-[0.5px]" />

        <div className="absolute top-3 right-[22%] w-4 h-10 bg-[#388e3c] rounded-t-full rotate-[20deg] blur-[0.5px]" />
        <div className="absolute top-5 right-[20%] w-3 h-7 bg-[#4caf50] rounded-t-full rotate-[-5deg] blur-[0.5px]" />

        <div className="absolute top-8 left-[50%] w-3 h-9 bg-[#2e7d32] rounded-t-full rotate-[-5deg] brightness-150 blur-[0.5px]" />
      </div>
    </div>
  );
};
