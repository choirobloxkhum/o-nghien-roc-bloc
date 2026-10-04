import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Skull, FastForward, Zap } from 'lucide-react';
import {
  playHellTransitionShatter,
  playHellFlameSwoosh,
  playFallingScreamSound,
} from '../utils/audio';

interface HellFallingOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  soundEnabled?: boolean;
}

const marukoFaceImg = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

export const HellFallingOverlay: React.FC<HellFallingOverlayProps> = ({
  isActive,
  onComplete,
  soundEnabled = true,
}) => {
  const [phase, setPhase] = useState<'shatter' | 'falling_celestial' | 'transforming' | 'falling_demon' | 'impact'>('shatter');
  
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    if (!isActive) return;

    // Phase 0 (0ms): Screen Glass Shatter & Reality Tear
    setPhase('shatter');
    playHellTransitionShatter(soundEnabledRef.current);

    // Phase 1 (500ms): Free-falling from the Celestial Heavens in panic
    const t1 = setTimeout(() => {
      setPhase('falling_celestial');
      playFallingScreamSound(soundEnabledRef.current);
    }, 500);

    // Phase 2 (1600ms): Mid-air fiery corruption shockwave & metamorphosis
    const t2 = setTimeout(() => {
      setPhase('transforming');
      playHellFlameSwoosh(soundEnabledRef.current);
    }, 1600);

    // Phase 3 (2300ms): Demonic Queen / Yama diving rapidly into the Underworld
    const t3 = setTimeout(() => {
      setPhase('falling_demon');
    }, 2300);

    // Phase 4 (3200ms): Hellfire Lava Impact & Flash
    const t4 = setTimeout(() => {
      setPhase('impact');
      playHellTransitionShatter(soundEnabledRef.current);
    }, 3200);

    // Phase 5 (3700ms): Finish and reveal Hell Mode
    const t5 = setTimeout(() => {
      onCompleteRef.current();
    }, 3700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isActive]);

  if (!isActive) return null;

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteRef.current();
  };

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-[100] overflow-hidden select-none pointer-events-auto cursor-pointer bg-black"
      title="Chạm bất kỳ đâu để vào Địa Ngục ngay"
    >
      {/* Quick Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-[110] px-3.5 py-2 rounded-xl bg-black/85 hover:bg-black text-red-300 hover:text-white text-xs font-black border border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
      >
        <span>Vào Địa Ngục ngay</span>
        <FastForward className="w-3.5 h-3.5 animate-pulse" />
      </button>

      {/* 1. SCREEN SHATTER & DIMENSIONAL CRACK */}
      {phase === 'shatter' && (
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [0, 1, 0.95],
            x: [0, -16, 16, -10, 10, -5, 0],
            y: [0, 12, -12, 8, -8, 4, 0],
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-red-950/80 backdrop-blur-xs z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Cracked Reality Lines */}
          <svg className="w-full h-full text-red-500/90 stroke-current stroke-2 filter drop-shadow-[0_0_16px_rgba(239,68,68,1)]">
            <line x1="50%" y1="50%" x2="0%" y2="10%" strokeWidth="3" />
            <line x1="50%" y1="50%" x2="15%" y2="0%" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="80%" y2="0%" strokeWidth="3" />
            <line x1="50%" y1="50%" x2="100%" y2="35%" strokeWidth="4" />
            <line x1="50%" y1="50%" x2="95%" y2="90%" strokeWidth="2" />
            <line x1="50%" y1="50%" x2="35%" y2="100%" strokeWidth="3" />
            <line x1="50%" y1="50%" x2="0%" y2="70%" strokeWidth="3" />
            <circle cx="50%" cy="50%" r="70" fill="none" strokeWidth="3" />
            <circle cx="50%" cy="50%" r="140" fill="none" strokeWidth="2" strokeDasharray="8 6" />
          </svg>
          <div className="absolute text-center flex flex-col items-center">
            <motion.div
              animate={{ scale: [0.8, 1.15, 1], rotate: [-2, 2, 0] }}
              className="px-6 py-3 rounded-2xl bg-black/90 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.9)]"
            >
              <h1 className="text-3xl sm:text-5xl font-black text-red-500 tracking-wider uppercase">
                ⚠️ KHÔNG GIAN BỊ RÁCH TOẠC ⚠️
              </h1>
              <p className="text-amber-300 font-bold text-xs sm:text-sm mt-1">
                Rơi tự do từ Thiên Đình xuống cõi Vực Sâu Địa Ngục...
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* 2. DYNAMIC SKY-TO-HELL ATMOSPHERIC GRADIENT & SPEED TUNNEL */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {phase === 'falling_celestial' || phase === 'shatter' ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e] via-[#4c0519] to-[#1c0202] transition-colors duration-700" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#3b0764] via-[#450a0a] to-[#000000] transition-colors duration-700" />
        )}

        {/* Radial Depth Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
      </div>

      {/* Rushing Speed Streak Lines (Simulating Terminal Velocity Fall) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ['110vh', '-110vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.28 + (i % 5) * 0.06,
              repeat: Infinity,
              ease: 'linear',
              delay: (i * 0.04) % 0.25,
            }}
            className={`absolute rounded-full ${
              phase === 'falling_demon' || phase === 'transforming'
                ? 'bg-gradient-to-t from-transparent via-red-500 to-amber-300 shadow-[0_0_8px_#ef4444]'
                : 'bg-gradient-to-t from-transparent via-sky-300 to-white shadow-[0_0_8px_#38bdf8]'
            }`}
            style={{
              left: `${(i * 100) / 24 + ((i * 7) % 5)}%`,
              width: `${1.5 + (i % 3)}px`,
              height: `${160 + (i % 6) * 80}px`,
            }}
          />
        ))}
      </div>

      {/* Fiery Magma Sparks & Celestial Stardust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(26)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            animate={{
              y: ['105vh', '-25vh'],
              x: [0, (i % 2 === 0 ? 40 : -40) * ((i % 3) + 1)],
              opacity: [0, 0.9, 0],
              scale: [0.4, 1.6, 0.2],
              rotate: [0, 180],
            }}
            transition={{
              duration: 0.9 + (i % 4) * 0.3,
              repeat: Infinity,
              delay: (i * 0.08) % 0.9,
              ease: 'easeOut',
            }}
            className={`absolute rounded-full ${
              phase === 'falling_celestial'
                ? 'w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-t from-sky-400 to-yellow-200 shadow-[0_0_12px_#38bdf8]'
                : 'w-2.5 h-2.5 sm:w-4 sm:h-4 bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_16px_#f97316]'
            }`}
            style={{
              left: `${(i * 100) / 26}%`,
            }}
          />
        ))}
      </div>

      {/* 3. MAIN CHARACTER PHYSICS & RIGGED ANIMATION */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <AnimatePresence mode="wait">
          {/* STAGE A: CELESTIAL MASCOT GIRL (Realistic Panicked Free-Fall with Ribbon Physics) */}
          {(phase === 'falling_celestial' || phase === 'shatter') && (
            <motion.div
              key="celestial-girl"
              initial={{ y: '-75vh', scale: 0.6, rotate: -20 }}
              animate={{
                y: ['-65vh', '-10vh', '15vh'],
                rotate: [-20, 16, -14, 12, -8],
                scale: [0.7, 1.15, 1.45],
              }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Comic Scream Bubble with Trembling Vibration */}
              <motion.div
                animate={{
                  scale: [1, 1.12, 0.96, 1.1],
                  rotate: [-5, 5, -4, 4],
                  x: [-3, 3, -2, 2],
                }}
                transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-24 sm:-top-28 px-4 py-2.5 bg-white rounded-2xl border-3 border-black text-slate-900 font-black text-xs sm:text-base shadow-[0_8px_0_#000] whitespace-nowrap z-50 flex items-center gap-1.5"
              >
                <span>😱 Á Á Á CỨU NGỌC HOÀNG VỚIII!</span>
                <span className="text-sky-500 animate-bounce">💦</span>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-black" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[9px] border-t-white" />
              </motion.div>

              {/* Zero-G Panic Tears flying upwards in the wind */}
              <div className="absolute -top-6 inset-x-0 flex justify-between px-3 pointer-events-none z-40">
                <motion.div
                  animate={{ y: [0, -35], x: [-5, -20], opacity: [1, 0], scale: [1, 0.3] }}
                  transition={{ duration: 0.25, repeat: Infinity }}
                  className="w-2.5 h-3 bg-sky-300 rounded-full border border-sky-600 shadow-sm"
                />
                <motion.div
                  animate={{ y: [0, -35], x: [5, 20], opacity: [1, 0], scale: [1, 0.3] }}
                  transition={{ duration: 0.25, repeat: Infinity, delay: 0.1 }}
                  className="w-2.5 h-3 bg-sky-300 rounded-full border border-sky-600 shadow-sm"
                />
              </div>

              {/* RIGGED CELESTIAL AVATAR */}
              <div className="relative flex flex-col items-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
                {/* Celestial Crown & Golden Halo Ring */}
                <div className="absolute -top-12 w-28 h-12 flex items-center justify-center z-40">
                  <motion.div
                    animate={{ rotate: [-6, 6, -6], y: [-2, 2, -2] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="relative flex flex-col items-center"
                  >
                    <div className="w-22 h-6 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 rounded-full border-2 border-amber-600 shadow-[0_0_20px_#fde047] flex items-center justify-center">
                      <span className="text-[10px] font-black text-amber-950">👑 THIÊN ĐÌNH</span>
                    </div>
                    {/* Halo ring */}
                    <div className="absolute -top-4 w-28 h-7 rounded-full border-3 border-yellow-300/90 shadow-[0_0_25px_#facc15] blur-xs animate-pulse" />
                  </motion.div>
                </div>

                {/* Head with dynamic hair bun tilt */}
                <motion.div
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                  className="relative z-30 mb-[-6px] flex flex-col items-center"
                >
                  {/* Hair roller */}
                  <div className="w-9 h-3.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full border border-black/80 shadow-xs mb-[-5px] z-10" />
                  {/* Face circle */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-black shadow-xl bg-amber-100 relative">
                    <img
                      src={marukoFaceImg}
                      alt="Maruko Roblox Celestial Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-110 object-[center_28%]"
                    />
                  </div>
                </motion.div>

                {/* Torso & Natural Humanoid Roblox Body with ARMS RAISED HIGH UP INTO THE SKY */}
                <div className="relative z-20 flex flex-col items-center justify-center">
                  {/* LEFT ARM (Raised straight UP into the sky above the head, flailing in wind) */}
                  <motion.div
                    animate={{
                      rotate: [-25, -10, -30, -12],
                      x: [-2, -6, -2],
                      y: [-4, 3, -4],
                    }}
                    transition={{ duration: 0.16, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-4 sm:w-5 h-16 sm:h-18 bg-gradient-to-t from-white via-white to-[#fed7aa] rounded-t-full border-2 border-black origin-bottom absolute -left-5 sm:-left-6 -top-14 sm:-top-16 shadow-lg flex flex-col justify-between items-center p-0.5 z-30"
                  >
                    {/* Roblox Hand at the VERY TOP reaching into the sky */}
                    <div className="w-4 h-4 bg-[#fed7aa] rounded-full border-2 border-black shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1 bg-amber-400/80 rounded-full" />
                    </div>
                    {/* Sleeve cuff near wrist */}
                    <div className="w-full h-1.5 bg-yellow-400 border-y border-black/40" />
                    {/* Shoulder base connector */}
                    <div className="w-full h-2 bg-white" />
                  </motion.div>

                  {/* RIGHT ARM (Raised straight UP into the sky above the head, flailing in wind) */}
                  <motion.div
                    animate={{
                      rotate: [25, 10, 30, 12],
                      x: [2, 6, 2],
                      y: [3, -4, 3],
                    }}
                    transition={{ duration: 0.16, repeat: Infinity, ease: 'easeInOut', delay: 0.05 }}
                    className="w-4 sm:w-5 h-16 sm:h-18 bg-gradient-to-t from-white via-white to-[#fed7aa] rounded-t-full border-2 border-black origin-bottom absolute -right-5 sm:-right-6 -top-14 sm:-top-16 shadow-lg flex flex-col justify-between items-center p-0.5 z-30"
                  >
                    {/* Roblox Hand at the VERY TOP reaching into the sky */}
                    <div className="w-4 h-4 bg-[#fed7aa] rounded-full border-2 border-black shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1 bg-amber-400/80 rounded-full" />
                    </div>
                    {/* Sleeve cuff near wrist */}
                    <div className="w-full h-1.5 bg-yellow-400 border-y border-black/40" />
                    {/* Shoulder base connector */}
                    <div className="w-full h-2 bg-white" />
                  </motion.div>

                  {/* Roblox Character Torso with Humanoid Proportion */}
                  <motion.div
                    animate={{ scaleY: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="w-18 h-18 sm:w-22 sm:h-22 bg-gradient-to-b from-sky-100 via-amber-50 to-yellow-100 rounded-xl border-3 border-black p-2 flex flex-col items-center justify-between shadow-lg relative overflow-hidden z-20"
                  >
                    {/* Upper chest detail & collar */}
                    <div className="w-full flex items-center justify-center pt-0.5">
                      <div className="w-7 h-2 bg-yellow-400 rounded-b-md border-b-2 border-black/80 flex items-center justify-center">
                        <div className="w-2 h-1 bg-amber-600 rounded-full" />
                      </div>
                    </div>

                    <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />

                    {/* Belt / Waist boundary */}
                    <div className="w-full h-2.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 border-t-2 border-black/80 flex items-center justify-center">
                      <div className="w-4 h-1.5 bg-amber-700 rounded-xs border border-black/60" />
                    </div>
                  </motion.div>
                </div>

                {/* Realistic Humanoid Roblox Legs & Shoes (R15 Style with Knees & Ankles) */}
                <div className="flex gap-2 -mt-1 z-10">
                  {/* Left Leg */}
                  <motion.div
                    animate={{
                      rotate: [-25, 20, -30, 15],
                      y: [-1, 3, -1],
                    }}
                    transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-4.5 h-14 bg-gradient-to-b from-[#fed7aa] via-white to-white rounded-b-md border-2 border-black origin-top shadow-md flex flex-col justify-end items-center overflow-hidden"
                  >
                    {/* Knee shadow */}
                    <div className="w-full h-1 bg-black/15 mb-2" />
                    {/* Sock */}
                    <div className="w-full h-2 bg-sky-200 border-t border-black/30" />
                    {/* Cute Red Roblox Sneaker */}
                    <div className="w-full h-3.5 bg-gradient-to-b from-[#dc2626] to-[#991b1b] border-t-2 border-black flex flex-col justify-between p-0.5">
                      <div className="w-full h-0.5 bg-white/80 rounded-full" />
                      <div className="w-full h-1 bg-black/80 rounded-b-xs" />
                    </div>
                  </motion.div>

                  {/* Right Leg */}
                  <motion.div
                    animate={{
                      rotate: [25, -20, 30, -15],
                      y: [3, -1, 3],
                    }}
                    transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut', delay: 0.08 }}
                    className="w-4.5 h-14 bg-gradient-to-b from-[#fed7aa] via-white to-white rounded-b-md border-2 border-black origin-top shadow-md flex flex-col justify-end items-center overflow-hidden"
                  >
                    {/* Knee shadow */}
                    <div className="w-full h-1 bg-black/15 mb-2" />
                    {/* Sock */}
                    <div className="w-full h-2 bg-sky-200 border-t border-black/30" />
                    {/* Cute Red Roblox Sneaker */}
                    <div className="w-full h-3.5 bg-gradient-to-b from-[#dc2626] to-[#991b1b] border-t-2 border-black flex flex-col justify-between p-0.5">
                      <div className="w-full h-0.5 bg-white/80 rounded-full" />
                      <div className="w-full h-1 bg-black/80 rounded-b-xs" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE B: CORRUPTION METAMORPHOSIS & HELLFIRE BURST */}
          {phase === 'transforming' && (
            <motion.div
              key="transforming-flash"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.6, 2.2, 2.8], opacity: [0.9, 1, 0.95] }}
              exit={{ opacity: 0, scale: 3 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              {/* Fiery Metamorphosis Vortex Core (Single-pass GPU Radial Gradient) */}
              <div className="w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full bg-[radial-gradient(circle,_rgba(239,68,68,0.7)_0%,_rgba(244,63,94,0.5)_35%,_rgba(251,191,36,0.3)_60%,_transparent_75%)] animate-spin transform-gpu will-change-transform" />
              
              {/* Expanding Shockwave Ring */}
              <motion.div
                animate={{ scale: [0.5, 3.5], opacity: [1, 0] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute w-64 h-64 rounded-full border-4 border-amber-300 shadow-[0_0_50px_#f59e0b]"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-36 h-36 sm:w-56 sm:h-56 text-white fill-red-500 animate-pulse drop-shadow-[0_0_30px_#ef4444]" />
              </div>
              
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-3xl sm:text-6xl font-black text-white drop-shadow-[0_0_25px_#dc2626] uppercase tracking-wider">
                  🔥 BIẾN THÂN MA VƯƠNG! 🔥
                </span>
                <span className="text-xs sm:text-base text-amber-200 font-bold mt-2 px-3 py-1 bg-black/80 rounded-full border border-red-500">
                  Hắc Hóa Cực Hạn • Tức Thì Thức Tỉnh
                </span>
              </div>
            </motion.div>
          )}

          {/* STAGE C: DEMON QUEEN / YAMA (High-Speed Aerodynamic Diving with Flapping Wings & Demon Robe) */}
          {(phase === 'falling_demon' || phase === 'impact') && (
            <motion.div
              key="demon-girl"
              initial={{ y: '-25vh', scale: 0.95, rotate: 12 }}
              animate={{
                y: ['-15vh', '20vh', '75vh'],
                rotate: [8, -10, 8, -6],
                scale: [1.1, 1.6, 2.3],
              }}
              transition={{ duration: 1.1, ease: [0.35, 0, 0.25, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Domineering Demon Queen Speech Bubble */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], y: [0, -3, 0] }}
                transition={{ duration: 0.25, repeat: Infinity }}
                className="absolute -top-24 sm:-top-28 px-4 py-2.5 bg-black rounded-2xl border-3 border-red-500 text-red-400 font-black text-xs sm:text-base shadow-[0_0_30px_rgba(239,68,68,0.9)] whitespace-nowrap z-50 flex items-center gap-1.5"
              >
                <span>HỨ... ĐỊA NGỤC NÀY LÀ CỦA BỔN TỌA! 😈🔥</span>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-red-500" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[9px] border-t-black" />
              </motion.div>

              {/* RIGGED DEMONIC QUEEN AVATAR */}
              <div className="relative flex flex-col items-center filter drop-shadow-[0_0_35px_rgba(239,68,68,1)]">
                {/* Glowing Crimson Devil Horns */}
                <div className="absolute -top-12 inset-x-0 flex justify-between px-1.5 z-40">
                  <motion.div
                    animate={{ rotate: [-28, -22, -28] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="w-7 h-12 bg-gradient-to-t from-red-900 via-red-600 to-red-400 rounded-t-full border-2 border-black shadow-[0_0_20px_#ef4444]"
                  />
                  <motion.div
                    animate={{ rotate: [28, 22, 28] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="w-7 h-12 bg-gradient-to-t from-red-900 via-red-600 to-red-400 rounded-t-full border-2 border-black shadow-[0_0_20px_#ef4444]"
                  />
                </div>

                {/* Dark Obsidian Halo */}
                <div className="absolute -top-8 w-26 h-7 rounded-full border-2 border-red-500 shadow-[0_0_25px_#ef4444] bg-red-950/80 flex items-center justify-center z-30">
                  <span className="text-[9px] font-black text-red-200 tracking-wider">💀 DIÊM VƯƠNG</span>
                </div>

                {/* Head with Crimson Hue & Hair Strands billowing upwards */}
                <div className="relative z-30 mb-[-6px] flex flex-col items-center">
                  <div className="w-9 h-3.5 bg-gradient-to-r from-red-600 via-rose-700 to-red-950 rounded-full border border-black shadow-xs mb-[-5px] z-10" />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-red-500 shadow-[0_0_25px_#ef4444] bg-red-950 relative">
                    <img
                      src={marukoFaceImg}
                      alt="Maruko Roblox Demon Queen Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-110 object-[center_28%] filter hue-rotate-[320deg] contrast-125 saturate-150"
                    />
                  </div>
                </div>

                {/* Realistic Flapping Gothic Bat Wings (Cánh Dơi Hắc Ám) */}
                <div className="absolute top-8 -inset-x-20 flex justify-between z-10 pointer-events-none">
                  <motion.div
                    animate={{
                      rotate: [-20, 25, -20],
                      scaleX: [1, 0.85, 1],
                      scaleY: [1, 1.15, 1],
                    }}
                    transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-22 h-18 bg-gradient-to-br from-red-950 via-black to-red-900 rounded-tl-[50px] border-2 border-red-500 shadow-[0_0_20px_#ef4444] origin-right flex items-center justify-start p-1"
                  >
                    <Zap className="w-4 h-4 text-red-400 fill-red-500" />
                  </motion.div>

                  <motion.div
                    animate={{
                      rotate: [20, -25, 20],
                      scaleX: [1, 0.85, 1],
                      scaleY: [1, 1.15, 1],
                    }}
                    transition={{ duration: 0.18, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-22 h-18 bg-gradient-to-bl from-red-950 via-black to-red-900 rounded-tr-[50px] border-2 border-red-500 shadow-[0_0_20px_#ef4444] origin-left flex items-center justify-end p-1"
                  >
                    <Zap className="w-4 h-4 text-red-400 fill-red-500" />
                  </motion.div>
                </div>

                {/* Aerodynamic Diving Arms & Obsidian Robe */}
                <div className="relative z-20 flex flex-col items-center justify-center">
                  {/* Left Demon Arm */}
                  <motion.div
                    animate={{ rotate: [-25, -10, -25], y: [-1, 2, -1] }}
                    transition={{ duration: 0.25, repeat: Infinity }}
                    className="w-4 h-14 bg-gradient-to-b from-black via-red-950 to-red-600 rounded-b-md border-2 border-red-500 origin-top absolute -left-5 -top-1 shadow-[0_0_12px_#ef4444] flex flex-col justify-end items-center p-0.5 z-30"
                  >
                    <div className="w-3.5 h-3 bg-red-900 rounded-full border border-red-400" />
                  </motion.div>
                  {/* Right Demon Arm */}
                  <motion.div
                    animate={{ rotate: [25, 10, 25], y: [1, -2, 1] }}
                    transition={{ duration: 0.25, repeat: Infinity }}
                    className="w-4 h-14 bg-gradient-to-b from-black via-red-950 to-red-600 rounded-b-md border-2 border-red-500 origin-top absolute -right-5 -top-1 shadow-[0_0_12px_#ef4444] flex flex-col justify-end items-center p-0.5 z-30"
                  >
                    <div className="w-3.5 h-3 bg-red-900 rounded-full border border-red-400" />
                  </motion.div>

                  {/* Obsidian Gothic Robe Body with Humanoid Roblox Chest & Belt */}
                  <div className="w-18 h-18 sm:w-22 sm:h-22 bg-gradient-to-b from-black via-red-950 to-black rounded-xl border-3 border-red-500 p-2 flex flex-col items-center justify-between shadow-[0_0_25px_rgba(239,68,68,0.7)] relative overflow-hidden z-20">
                    <div className="w-full flex items-center justify-center pt-0.5">
                      <div className="w-7 h-2 bg-red-600 rounded-b-md border-b-2 border-red-300 flex items-center justify-center" />
                    </div>
                    <Skull className="w-6 h-6 text-red-500 animate-pulse" />
                    <div className="w-full h-2.5 bg-gradient-to-r from-red-700 via-rose-600 to-red-700 border-t-2 border-red-400 flex items-center justify-center">
                      <div className="w-4 h-1.5 bg-yellow-400 rounded-xs border border-black/80" />
                    </div>
                  </div>
                </div>

                {/* Trailing Demon Legs & Armored Boots (Humanoid Roblox Proportions) */}
                <div className="flex gap-2 -mt-1 z-10">
                  <motion.div
                    animate={{ rotate: [-15, 15, -15], y: [-1, 2, -1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="w-4.5 h-13 bg-gradient-to-b from-red-950 via-black to-black rounded-b-md border-2 border-red-500 shadow-md flex flex-col justify-end items-center overflow-hidden"
                  >
                    <div className="w-full h-3.5 bg-gradient-to-b from-red-600 to-black border-t-2 border-red-400" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: [15, -15, 15], y: [2, -1, 2] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="w-4.5 h-13 bg-gradient-to-b from-red-950 via-black to-black rounded-b-md border-2 border-red-500 shadow-md flex flex-col justify-end items-center overflow-hidden"
                  >
                    <div className="w-full h-3.5 bg-gradient-to-b from-red-600 to-black border-t-2 border-red-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. BOTTOM MAGMA IMPACT EXPLOSION & FLASH */}
      {phase === 'impact' && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: [0, 1, 0.95], y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-red-600 via-orange-600 to-transparent z-40 flex flex-col items-center justify-end pb-12"
        >
          <motion.div
            animate={{ scale: [0.9, 1.05, 1], y: [0, -4, 0] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="text-center px-4"
          >
            <h2 className="text-3xl sm:text-6xl font-black text-yellow-300 drop-shadow-[0_0_30px_#f97316] uppercase tracking-wider">
              🔥 ĐÃ GIÁNG LÂM ĐỊA NGỤC 18+ 🔥
            </h2>
            <p className="text-white text-xs sm:text-base font-extrabold mt-2 drop-shadow-md">
              Khai mở toàn bộ dàn chồng hắc ám cấm kỵ...
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
