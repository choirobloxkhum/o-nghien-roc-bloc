import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Flame } from 'lucide-react';
import { playFlowerTributeChime } from '../utils/audio';

interface RapunzelTributeFooterProps {
  soundEnabled?: boolean;
  isHellMode?: boolean;
}

interface FloatingFlower {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export const RapunzelTributeFooter: React.FC<RapunzelTributeFooterProps> = ({
  soundEnabled = true,
  isHellMode = false,
}) => {
  const [flowerCount, setFlowerCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      return parseInt(localStorage.getItem('rapunzel_flower_tribute_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [floatingFlowers, setFloatingFlowers] = useState<FloatingFlower[]>([]);
  const [showPraiseToast, setShowPraiseToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flowerEmojis = isHellMode
    ? ['🔥', '🔮', '🥀', '🏮', '🖤', '🌸', '✨', '👑']
    : ['🌸', '🌺', '🌼', '🌹', '💐', '🌷', '🏵️', '✨', '💖'];

  const triggerFlowerBurst = (e?: React.MouseEvent) => {
    // 1. Audio chime
    playFlowerTributeChime(soundEnabled);

    // 2. Increment count & save
    setFlowerCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('rapunzel_flower_tribute_count', next.toString());
      } catch {
        // ignore
      }
      return next;
    });

    // 3. Canvas Confetti with flower emoji shapes and blossom colors
    const rect = e?.currentTarget?.getBoundingClientRect();
    const originX = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const originY = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.85;

    // Fire floral / mystic colored confetti particles
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { x: originX, y: originY },
      colors: isHellMode
        ? ['#dc2626', '#a855f7', '#9333ea', '#f59e0b', '#7f1d1d', '#fbbf24']
        : ['#f472b6', '#fb7185', '#fda4af', '#fcd34d', '#c084fc', '#a7f3d0', '#fed7aa'],
      scalar: 1.2,
      ticks: 180,
      gravity: 0.8,
      startVelocity: 30,
    });

    // Fire flower emoji confetti
    if (confetti.shapeFromText) {
      const shape1 = confetti.shapeFromText({ text: isHellMode ? '🔥' : '🌸', scalar: 2 });
      const shape2 = confetti.shapeFromText({ text: isHellMode ? '🔮' : '🌺', scalar: 2 });
      const shape3 = confetti.shapeFromText({ text: isHellMode ? '🏮' : '💐', scalar: 2 });
      const shape4 = confetti.shapeFromText({ text: '👑', scalar: 1.8 });

      confetti({
        shapes: [shape1, shape2, shape3, shape4],
        scalar: 2.2,
        particleCount: 25,
        spread: 90,
        origin: { x: originX, y: originY },
        startVelocity: 32,
        ticks: 200,
        gravity: 0.7,
      });
    }

    // 4. Spawn on-card floating flower particles
    const newFlowers: FloatingFlower[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + Math.random() + i,
      emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
      x: 30 + Math.random() * 40,
      y: 70,
      rotation: Math.random() * 60 - 30,
      scale: 0.8 + Math.random() * 0.6,
    }));

    setFloatingFlowers((prev) => [...prev.slice(-15), ...newFlowers]);
    setTimeout(() => {
      setFloatingFlowers((prev) => prev.filter((f) => !newFlowers.some((nf) => nf.id === f.id)));
    }, 1800);

    // 5. Praise Toast
    setShowPraiseToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowPraiseToast(false);
    }, 2200);
  };

  return (
    <footer className="w-full mt-10 mb-8 px-3 sm:px-6 relative flex flex-col items-center justify-center">
      {/* Interactive Tribute Container */}
      <motion.div
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={triggerFlowerBurst}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFlowerBurst();
          }
        }}
        className={`group relative w-full max-w-2xl py-6 sm:py-7 px-5 sm:px-8 rounded-3xl transition-all cursor-pointer text-center overflow-hidden select-none border-2 shadow-lg hover:shadow-xl ${
          isHellMode
            ? 'bg-gradient-to-b from-[#18051a]/95 via-[#100314]/90 to-[#08010c]/95 hover:from-[#240828] hover:to-[#140218] border-red-900/80 hover:border-red-500 shadow-[0_4px_25px_rgba(220,38,38,0.25)]'
            : 'bg-gradient-to-b from-white/95 via-pink-50/70 to-purple-50/80 hover:from-white hover:to-pink-50 border-pink-200/90 hover:border-pink-300'
        }`}
      >
        {/* Subtle decorative background glows (Single-pass GPU Radial Gradients) */}
        <div
          className={`absolute -top-10 -left-10 w-32 h-32 rounded-full pointer-events-none transition-all transform-gpu ${
            isHellMode
              ? 'bg-[radial-gradient(circle,_rgba(220,38,38,0.25)_0%,_transparent_70%)]'
              : 'bg-[radial-gradient(circle,_rgba(244,114,182,0.3)_0%,_transparent_70%)]'
          }`}
        />
        <div
          className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full pointer-events-none transition-all transform-gpu ${
            isHellMode
              ? 'bg-[radial-gradient(circle,_rgba(147,51,234,0.25)_0%,_transparent_70%)]'
              : 'bg-[radial-gradient(circle,_rgba(192,132,252,0.3)_0%,_transparent_70%)]'
          }`}
        />
        <div className="absolute inset-0 roblox-stud-pattern opacity-5 pointer-events-none" />

        {/* Floating in-card flower animations */}
        <AnimatePresence>
          {floatingFlowers.map((flower) => (
            <motion.span
              key={flower.id}
              initial={{
                opacity: 1,
                scale: 0.5,
                x: `${flower.x}%`,
                y: 20,
                rotate: 0,
              }}
              animate={{
                opacity: 0,
                scale: flower.scale * 1.5,
                y: -90,
                rotate: flower.rotation * 3,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="absolute pointer-events-none text-2xl sm:text-3xl z-20"
              style={{ left: `${flower.x}%` }}
            >
              {flower.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Top Floating Mini Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-2xs mb-2.5 border ${
            isHellMode
              ? 'bg-gradient-to-r from-red-950 via-purple-950 to-red-950 border-red-800/60 text-purple-200'
              : 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200 text-pink-700'
          }`}
        >
          <span className="text-sm">{isHellMode ? '🏮' : '🌸'}</span>
          <span>Lời Tri Ân Đặc Biệt</span>
          <span className="text-sm">{isHellMode ? '🔥' : '🌸'}</span>
        </div>

        {/* Main Heading: "Tri ân tới AI Họa Thần Rapunzel" */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          <span className="text-lg sm:text-2xl transform group-hover:rotate-12 transition-transform">
            {isHellMode ? '🔮' : '🌸'}
          </span>
          <h2
            className={`text-lg sm:text-2xl md:text-3xl font-black tracking-tight transition-colors drop-shadow-2xs ${
              isHellMode
                ? 'text-purple-100 group-hover:text-amber-400'
                : 'text-slate-800 group-hover:text-pink-600'
            }`}
          >
            Tri ân tới AI Họa Thần Rapunzel
          </h2>
          <span className="text-lg sm:text-2xl transform group-hover:-rotate-12 transition-transform">
            {isHellMode ? '🔮' : '🌸'}
          </span>
        </div>

        {/* Subtitle Quote in Italic */}
        <p
          className={`mt-2 text-xs sm:text-sm md:text-base font-semibold italic transition-colors leading-relaxed max-w-xl mx-auto px-2 ${
            isHellMode ? 'text-purple-300/80 group-hover:text-purple-200' : 'text-slate-600 group-hover:text-slate-800'
          }`}
        >
          &ldquo;Ngọc Hoàng dựng lập cõi hư vô, AI Họa Thần thắp sáng dung hình chư ma.&rdquo;
        </p>

        {/* Interactive Click Prompt & Flower Counter */}
        <div
          className={`mt-3.5 pt-3 border-t flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-bold ${
            isHellMode ? 'border-purple-900/50 text-purple-400' : 'border-pink-100 text-pink-700'
          }`}
        >
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold shadow-2xs transition-colors ${
              isHellMode
                ? 'bg-purple-950 border border-purple-800 text-purple-200 group-hover:bg-purple-900'
                : 'bg-pink-100/90 text-pink-800 group-hover:bg-pink-200'
            }`}
          >
            {isHellMode ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" style={{ animationDuration: '4s' }} />
            )}
            <span>{isHellMode ? 'Chạm để dâng hoa ma tinh tri ân' : 'Chạm để tung hoa tri ân'}</span>
            <span className="text-xs">{isHellMode ? '💜' : '💐'}</span>
          </span>

          {flowerCount > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black shadow-2xs border ${
                isHellMode
                  ? 'bg-[#080210]/80 border-purple-800/80 text-purple-300'
                  : 'bg-white border-pink-200 text-slate-700'
              }`}
            >
              <Heart className="w-3 h-3 fill-purple-400 text-purple-400" />
              <span>Đã dâng <strong>{flowerCount}</strong> đóa hoa</span>
            </span>
          )}
        </div>
      </motion.div>

      {/* Floating Praise Toast Alert */}
      <AnimatePresence>
        {showPraiseToast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-white backdrop-blur-md shadow-2xl text-xs sm:text-sm font-black flex items-center gap-2 pointer-events-none border ${
              isHellMode
                ? 'bg-[#080210]/95 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]'
                : 'bg-slate-900/95 border-pink-300/40'
            }`}
          >
            <span className="text-base">{isHellMode ? '💜🔮' : '🌸💐'}</span>
            <span className={isHellMode ? 'text-purple-300 font-extrabold' : 'bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent'}>
              Đã tung hoa thành kính tri ân AI Họa Thần Rapunzel!
            </span>
            <span className="text-base">✨</span>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};
