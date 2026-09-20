import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Sparkles, Send, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playKissSound, playUiClick, playSparkleSound } from '../utils/audio';

interface MongCheSecretLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHellMode?: boolean;
  soundEnabled?: boolean;
}

const NGOC_HOANG_AVATAR = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

interface FlyingHeart {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  emoji: string;
}

export const MongCheSecretLetterModal: React.FC<MongCheSecretLetterModalProps> = ({
  isOpen,
  onClose,
  isHellMode = false,
  soundEnabled = true,
}) => {
  const [kissCount, setKissCount] = useState(0);
  const [isKissZooming, setIsKissZooming] = useState(false);
  const [flyingHearts, setFlyingHearts] = useState<FlyingHeart[]>([]);

  useEffect(() => {
    if (isOpen) {
      setKissCount(0);
      setIsKissZooming(false);
      setFlyingHearts([]);
      playSparkleSound(soundEnabled);
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const handleReceiveKiss = () => {
    playKissSound(soundEnabled);
    setKissCount((prev) => prev + 1);
    setIsKissZooming(true);

    // Fire romantic heart confetti
    try {
      confetti({
        particleCount: 45,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700', '#ff85a2'],
      });
    } catch {
      // Ignore confetti errors
    }

    // Spawn floating heart particles
    const emojis = ['💖', '💗', '💓', '💋', '✨', '💕', '🥰'];
    const newHearts: FlyingHeart[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 260,
      y: (Math.random() - 0.5) * 260,
      scale: 0.8 + Math.random() * 0.8,
      rotation: (Math.random() - 0.5) * 45,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    setFlyingHearts((prev) => [...prev.slice(-16), ...newHearts]);

    // Reset zoom animation state after trigger
    setTimeout(() => {
      setIsKissZooming(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Backdrop with dreamy romantic tint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playUiClick(soundEnabled);
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Secret Letter Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border-2 z-10 my-auto overflow-hidden text-center ${
            isHellMode
              ? 'bg-gradient-to-b from-[#2a0429] via-[#1c021f] to-[#120114] border-pink-500/80 text-pink-100 shadow-[0_0_60px_rgba(236,72,153,0.5)]'
              : 'bg-gradient-to-b from-pink-50 via-white to-amber-50/70 border-pink-300 text-slate-800 shadow-[0_15px_50px_rgba(244,114,182,0.35)]'
          }`}
        >
          {/* Shimmering Rainbow Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-rose-500 via-amber-400 to-pink-500 animate-pulse" />

          {/* Close Button */}
          <button
            onClick={() => {
              playUiClick(soundEnabled);
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-pink-100 dark:bg-pink-950/80 hover:bg-pink-200 dark:hover:bg-pink-900 text-pink-600 dark:text-pink-300 transition-all cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating animated sparkles around card */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-white text-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>LÁ THƯ BÍ MẬT TỪ MỘNG CHÈ</span>
            <Sparkles className="w-3.5 h-3.5 fill-white text-white animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          {/* Avatar of Ngọc Hoàng with glowing rainbow ring and crown */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4">
            {/* Glowing animated halo */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-rose-500 animate-spin opacity-75 blur-xs" style={{ animationDuration: '3s' }} />
            
            <div className="relative w-full h-full rounded-full p-1 bg-white dark:bg-slate-900 shadow-xl overflow-hidden border-2 border-pink-400">
              <img
                src={NGOC_HOANG_AVATAR}
                alt="Mộng chè - Ngọc Hoàng"
                className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Crown Badge */}
            <div className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg text-sm font-black border border-white">
              👑
            </div>

            {/* Heart Badge */}
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md text-xs">
              💖
            </div>
          </div>

          {/* Letter Envelope / Parchment Content Box */}
          <div
            className={`relative rounded-2xl p-4 sm:p-5 border-2 shadow-inner mb-5 text-left leading-relaxed ${
              isHellMode
                ? 'bg-[#26052b]/90 border-pink-500/80 text-pink-50 shadow-[0_0_15px_rgba(244,114,182,0.2)]'
                : 'bg-gradient-to-br from-white via-pink-50/90 to-rose-50/90 border-pink-300 shadow-sm'
            }`}
          >
            {/* Watermark Heart */}
            <div className="absolute top-2 right-3 text-2xl sm:text-3xl opacity-25 pointer-events-none select-none">
              💌
            </div>

            <p className="text-xs sm:text-sm md:text-[15px] font-bold italic text-[#831843] dark:text-pink-100 leading-relaxed font-sans">
              "oiiii, tui ìu bồ nhiều quá. Không ngờ có một ngày mình sẽ được tặng tranh vẽ như này. Cảm ơn bồ vì đã dành nhiều tình yêu thiệt to bự dành cho chiếc ổ nhỏ và trên hết là cho con mộng chè này, xin được tri ân bằng một nụ hôn thật tooo 💗✨"
            </p>

            <div className="mt-3 pt-2.5 border-t border-pink-300/80 dark:border-pink-700/80 flex items-center justify-between text-xs text-[#9d174d] dark:text-pink-200 font-black">
              <span>Gửi từ: Mộng chè (Chơi Roblox Khum)</span>
              <span>Dành riêng cho bồ 🌸</span>
            </div>
          </div>

          {/* MAIN INTERACTIVE BUTTON: "Nhận nụ hôn" */}
          <div className="relative flex flex-col items-center justify-center gap-3">
            <motion.button
              id="btn-receive-mongche-kiss"
              onClick={handleReceiveKiss}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="relative group px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white shadow-[0_8px_25px_rgba(244,63,94,0.45)] border-2 border-pink-200 cursor-pointer flex items-center gap-2 transition-all"
            >
              {/* Pulse glow background */}
              <div className="absolute inset-0 rounded-2xl bg-pink-400 opacity-40 animate-ping pointer-events-none" />
              
              <span className="text-xl sm:text-2xl animate-bounce">💋</span>
              <span className="tracking-wide">Nhận nụ hôn</span>
              <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
            </motion.button>

            {kissCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs sm:text-sm font-black text-[#9d174d] dark:text-pink-200 flex items-center gap-1"
              >
                <span>Bồ đã nhận được {kissCount} nụ hôn ngọt ngào từ Mộng chè!</span>
                <span>💕</span>
              </motion.div>
            )}

            {/* Close / Return button */}
            <button
              onClick={() => {
                playUiClick(soundEnabled);
                onClose();
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-purple-300/80 dark:hover:text-white underline cursor-pointer mt-1"
            >
              Đóng thư và ngắm tranh tiếp 🎨
            </button>
          </div>

          {/* GIANT KISS ZOOMING & LOVE BURST EFFECT OVERLAY */}
          <AnimatePresence>
            {isKissZooming && (
              <motion.div
                initial={{ opacity: 0, scale: 0.1, rotate: -25 }}
                animate={{ opacity: 1, scale: [0.2, 1.8, 2.5, 2.2], rotate: [ -25, 0, 10, 0 ] }}
                exit={{ opacity: 0, scale: 3, filter: 'blur(10px)' }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-pink-500/10 backdrop-blur-[1px]"
              >
                {/* Giant Kiss Lips */}
                <div className="relative text-7xl sm:text-9xl drop-shadow-[0_10px_35px_rgba(244,63,94,0.8)] select-none">
                  💋
                </div>

                {/* Love banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-rose-600 dark:text-pink-300 font-black text-sm sm:text-base shadow-2xl border-2 border-pink-400"
                >
                  ✨ CHỤTTTT! MWAHHH! 💖
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Heart Particles */}
          {flyingHearts.map((fh) => (
            <motion.div
              key={fh.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
              animate={{
                opacity: 0,
                x: fh.x,
                y: fh.y - 120,
                scale: fh.scale,
                rotate: fh.rotation,
              }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-2xl sm:text-3xl select-none"
            >
              {fh.emoji}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
