import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Play, Sparkles, Heart, Zap, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Maruko3DRunner } from './Maruko3DRunner';
import { startRunningSoundLoop, stopRunningSoundLoop } from '../utils/audio';

interface RobloxLoadingScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterGame?: () => void;
  soundEnabled: boolean;
  onPlayClickSound: () => void;
  onPlayVictorySound: () => void;
}

export const RobloxLoadingScreen: React.FC<RobloxLoadingScreenProps> = ({
  isOpen,
  onClose,
  onEnterGame,
  soundEnabled,
  onPlayClickSound,
  onPlayVictorySound,
}) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Dynamic server stage step texts
  const currentStatusText = useMemo(() => {
    if (progress < 20) return '🚀 Đang kết nối mạng máy chủ Thiên Đình...';
    if (progress < 45) return '✨ Đang nạp dữ liệu Ổ Nghiện Roblox & hình ảnh...';
    if (progress < 70) return '💖 Đang triệu hồi dàn chồng quốc dân & lồng tiếng...';
    if (progress < 90) return '👑 Ngọc Hoàng đang kiểm duyệt dung nhan & kịch bản...';
    if (progress < 100) return '🌈 Đang mở cổng không gian vào thế giới mơ màng...';
    return '🎉 Máy chủ đã sẵn sàng! Chúc con dân chơi game vui vẻ!';
  }, [progress]);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setIsCompleted(false);

      // Start the cute running footstep sound effect
      startRunningSoundLoop(soundEnabled);

      // Smooth realistic loading progress sequence
      const startTime = Date.now();
      const totalDuration = 3800; // 3.8 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const rawProgress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));

        setProgress((prev) => {
          if (rawProgress >= 100) {
            clearInterval(interval);
            setIsCompleted(true);
            stopRunningSoundLoop();
            onPlayVictorySound();
            try {
              confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.55 },
                colors: ['#22c55e', '#4ade80', '#fbbf24', '#38bdf8', '#f472b6'],
              });
            } catch {}
            return 100;
          }
          return Math.max(prev, rawProgress);
        });
      }, 65);

      return () => {
        clearInterval(interval);
        stopRunningSoundLoop();
      };
    } else {
      stopRunningSoundLoop();
    }
  }, [isOpen, soundEnabled, onPlayVictorySound]);

  const handleRestart = () => {
    onPlayClickSound();
    setProgress(0);
    setIsCompleted(false);

    // Restart running footstep sound
    startRunningSoundLoop(soundEnabled);

    const startTime = Date.now();
    const totalDuration = 3500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));

      setProgress((prev) => {
        if (rawProgress >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          stopRunningSoundLoop();
          onPlayVictorySound();
          try {
            confetti({
              particleCount: 90,
              spread: 75,
              origin: { y: 0.55 },
              colors: ['#22c55e', '#4ade80', '#fbbf24', '#38bdf8', '#f472b6'],
            });
          } catch {}
          return 100;
        }
        return Math.max(prev, rawProgress);
      });
    }, 65);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none font-dessert">
      {/* ========================================================================= */}
      {/* 1. DYNAMIC CELESTIAL SKY BACKGROUND (GPU-Optimized, Zero CPU Lag) */}
      {/* ========================================================================= */}
      {/* Primary Vibrant Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0284c7] via-[#38bdf8] to-[#93c5fd] z-0" />

      {/* Radiant Sunburst Rays from Top-Center */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-b from-yellow-300/35 via-amber-200/20 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Rotating Sun Rays Illusion */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] opacity-15 pointer-events-none will-change-transform"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg 20deg, rgba(255,255,255,0.7) 20deg 40deg, transparent 40deg 60deg, rgba(255,255,255,0.7) 60deg 80deg, transparent 80deg 100deg, rgba(255,255,255,0.7) 100deg 120deg, transparent 120deg 140deg, rgba(255,255,255,0.7) 140deg 160deg, transparent 160deg 180deg, rgba(255,255,255,0.7) 180deg 200deg, transparent 200deg 220deg, rgba(255,255,255,0.7) 220deg 240deg, transparent 240deg 260deg, rgba(255,255,255,0.7) 260deg 280deg, transparent 280deg 300deg, rgba(255,255,255,0.7) 300deg 320deg, transparent 320deg 340deg, rgba(255,255,255,0.7) 340deg 360deg)',
        }}
      />

      {/* Gentle Cyber Grid Pattern Overlay on Sky */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* FLOATING DRIFTING CLOUDS (Layers with parallax drift) */}
      <motion.div
        animate={{ x: [-80, 80, -80] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 left-10 w-48 sm:w-64 h-16 bg-white/40 rounded-full blur-md pointer-events-none"
      />
      <motion.div
        animate={{ x: [60, -60, 60] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 right-12 w-56 sm:w-80 h-20 bg-white/35 rounded-full blur-md pointer-events-none"
      />
      <motion.div
        animate={{ x: [-50, 50, -50] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-1/4 w-72 sm:w-96 h-24 bg-white/30 rounded-full blur-lg pointer-events-none"
      />

      {/* FLOATING SPARKLING PARTICLES & CELESTIAL STUDS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '15%', left: '18%', delay: 0, size: 'w-4 h-4', color: 'text-yellow-200' },
          { top: '25%', right: '20%', delay: 1.2, size: 'w-5 h-5', color: 'text-pink-200' },
          { top: '65%', left: '12%', delay: 0.7, size: 'w-4 h-4', color: 'text-sky-100' },
          { top: '75%', right: '15%', delay: 2.1, size: 'w-6 h-6', color: 'text-amber-300' },
          { top: '45%', left: '6%', delay: 1.8, size: 'w-3.5 h-3.5', color: 'text-white' },
          { top: '50%', right: '8%', delay: 0.4, size: 'w-5 h-5', color: 'text-yellow-100' },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0.2, scale: 0.7 }}
            animate={{
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.2, 0.8],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + idx * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className={`absolute ${item.color}`}
            style={{ top: item.top, left: item.left, right: item.right }}
          >
            <Sparkles className={item.size} />
          </motion.div>
        ))}

        {/* Floating 3D Roblox Stud Cubes */}
        <motion.div
          animate={{
            y: [0, -16, 0],
            rotate: [0, 25, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[15%] hidden md:flex w-10 h-10 rounded-lg bg-white/25 border-2 border-white/50 backdrop-blur-xs shadow-md items-center justify-center text-xs font-black text-white/90"
        >
          <div className="w-4 h-4 rounded-full bg-white/40" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -30, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-24 right-[12%] hidden md:flex w-11 h-11 rounded-lg bg-pink-400/25 border-2 border-pink-200/50 backdrop-blur-xs shadow-md items-center justify-center text-xs font-black text-white/90"
        >
          <Heart className="w-5 h-5 fill-pink-300/80 text-pink-300" />
        </motion.div>
      </div>

      {/* Close button (top right) */}
      <button
        onClick={() => {
          stopRunningSoundLoop();
          onPlayClickSound();
          onClose();
        }}
        className="absolute top-5 right-5 sm:top-7 sm:right-7 z-30 p-2.5 sm:p-3 rounded-full bg-white/20 hover:bg-rose-500/80 text-white border-2 border-white/40 backdrop-blur-sm transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
        title="Đóng màn hình load"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* ========================================================================= */}
      {/* 2. DELUXE CENTRAL SERVER LOADING CONTAINER */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 25 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="relative z-10 w-full max-w-2xl px-5 sm:px-12 py-8 sm:py-12 rounded-[32px] sm:rounded-[42px] bg-slate-950/40 backdrop-blur-xl border-2 sm:border-3 border-white/35 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden"
      >
        {/* Subtle internal neon edge shine */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80" />
        <div className="absolute -inset-px bg-gradient-to-b from-white/15 to-transparent rounded-[32px] sm:rounded-[42px] pointer-events-none" />

        {/* LOADING TITLE & BIG PROGRESS NUMBER */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-white text-2xl sm:text-4xl md:text-[42px] font-black tracking-tight leading-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)]">
            Đang load server Chơi Roblox khum...
          </h2>
          <div className="mt-2 text-emerald-300 font-black text-2xl sm:text-3xl drop-shadow-[0_2px_8px_rgba(34,197,94,0.6)] flex items-center justify-center gap-2">
            <span>{progress}%</span>
            {isCompleted && (
              <span className="text-sm sm:text-base px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold animate-bounce">
                HOÀN TẤT 🎉
              </span>
            )}
          </div>
        </div>

        {/* DYNAMIC PROGRESS STATUS STEP TEXT (Changes in real-time) */}
        <div className="min-h-[28px] sm:min-h-[32px] flex items-center justify-center px-3 mb-2">
          <motion.p
            key={currentStatusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sky-100/90 text-xs sm:text-sm md:text-base font-bold drop-shadow flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 shrink-0 animate-pulse" />
            <span>{currentStatusText}</span>
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* 3. PROGRESS BAR WITH ANIMATED RUNNING MARUKO CHARACTER & DUST TRAIL FX */}
        {/* ========================================================================= */}
        <div className="relative w-full max-w-xl mx-auto my-4 sm:my-6 pt-14 sm:pt-16 pb-2">
          {/* THE SLEEK HORIZONTAL PROGRESS BAR */}
          <div className="relative w-full h-8 sm:h-9 bg-slate-950/80 rounded-full p-1 border-3 border-white/70 shadow-[inset_0_3px_10px_rgba(0,0,0,0.8),0_8px_20px_rgba(0,0,0,0.4)]">
            
            {/* ANIMATED NPC RUNNING DIRECTLY ON TOP OF PROGRESS BAR LEADING EDGE */}
            <div
              className="absolute bottom-[calc(100%-2px)] transform -translate-x-1/2 transition-[left] duration-75 ease-linear pointer-events-none z-20 will-change-[left]"
              style={{
                left: `${Math.max(4, Math.min(96, progress))}%`,
              }}
            >
              {/* Running Dust Trail Behind Maruko (CSS Accelerated) */}
              {!isCompleted && (
                <div className="absolute -left-4 bottom-1 pointer-events-none flex items-center gap-1 opacity-70">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/80 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200/80" />
                </div>
              )}

              <Maruko3DRunner isCompleted={isCompleted} />
            </div>

            {/* Glowing Green Progress Fill (Hardware accelerated CSS width transition) */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-[#4ade80] rounded-full relative shadow-[0_0_16px_rgba(74,222,128,0.8)] overflow-hidden transition-[width] duration-75 ease-linear will-change-[width]"
              style={{ width: `${progress}%` }}
            >
              {/* High-gloss 3D Shimmer Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/10 to-transparent rounded-full pointer-events-none" />
              
              {/* Leading Sparkle Head */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/90 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. COMPLETION ACTION BUTTONS & WITTY TIP BOX */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isCompleted ? (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 18 }}
              className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center"
            >
              <button
                onClick={() => {
                  onPlayClickSound();
                  if (onEnterGame) {
                    onEnterGame();
                  } else {
                    onClose();
                  }
                }}
                className="relative group w-full sm:w-auto px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-b from-[#4ade80] via-[#22c55e] to-[#15803d] hover:from-[#86efac] hover:to-[#16a34a] text-white font-black text-lg sm:text-xl shadow-[0_10px_25px_rgba(34,197,94,0.5)] border-t-2 border-white/60 border-b-4 border-[#14532d] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden"
              >
                {/* Shine Sweep FX */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <Play className="w-6 h-6 fill-white stroke-none drop-shadow" />
                <span>Chơi Ngay</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base border-2 border-white/30 backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Chạy Lại</span>
              </button>
            </motion.div>
          ) : (
            /* Witty Celestial Tip Box during loading */
            <div className="mt-4 sm:mt-6 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90 text-xs sm:text-sm font-semibold backdrop-blur-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Mẹo: Bấm vào ảnh đại diện của nhân vật để nghe giọng nói độc quyền!</span>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
