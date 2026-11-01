import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, X, ExternalLink, Sparkles } from 'lucide-react';
import { playUiClick, playHoverTick } from '../utils/audio';

interface HellModeDevModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
}

export const HellModeDevModal: React.FC<HellModeDevModalProps> = ({
  isOpen,
  onClose,
  soundEnabled = true,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    playUiClick(soundEnabled);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
        {/* Animated Background Fiery Red/Purple Aura */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#1c0f18] via-[#120812] to-[#0a040b] rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(239,68,68,0.4)] border-2 border-red-600/60 text-white overflow-hidden"
        >
          {/* Top Decorative Sheen */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 via-purple-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />

          {/* Close X Button */}
          <button
            onClick={handleClose}
            onMouseEnter={() => playHoverTick(soundEnabled)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer z-20"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Banner */}
          <div className="flex flex-col items-center text-center mb-3">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 via-purple-700 to-red-950 p-0.5 shadow-[0_0_20px_rgba(239,68,68,0.6)] border-2 border-red-400 flex items-center justify-center">
                <div className="w-full h-full bg-black/60 rounded-[10px] flex items-center justify-center">
                  <Flame className="w-8 h-8 text-amber-400 fill-amber-500 animate-bounce" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-300 shadow-md flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span>HOT</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-amber-300 text-[11px] font-black tracking-wider uppercase mb-1.5 shadow-inner">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>CẬP NHẬT TÍNH NĂNG</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-amber-200 to-purple-300 tracking-tight leading-tight">
              TÍNH NĂNG ĐANG CẬP NHẬT
            </h2>
          </div>

          {/* Description Text */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 mb-3 text-center">
            <p className="text-xs sm:text-sm font-bold text-red-100 leading-relaxed">
              Tính năng <span className="text-amber-300 font-extrabold">Chế độ Địa Ngục 18+</span> hiện đang trong quá trình phát triển & cập nhật. Vui lòng ghé lại sau nhé! 🔥✨
            </p>
          </div>

          {/* Attached Image from Link: https://ibb.co/pvJMhyKR */}
          <div className="relative my-2 rounded-xl overflow-hidden border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)] bg-black/60 p-1 group">
            <img
              src="https://i.ibb.co/tM8vLX2x/b487428eef0151d642786224529b2d7f.jpg"
              onError={(e) => {
                // Fallback direct image links from imgbb
                const target = e.currentTarget;
                if (!target.dataset.tried) {
                  target.dataset.tried = '1';
                  target.src = 'https://i.ibb.co/67pYcZ3/from-Pix-AI.png';
                }
              }}
              alt="Tính năng đang cập nhật"
              className="w-full max-h-[180px] sm:max-h-[220px] object-contain rounded-lg mx-auto transition-transform group-hover:scale-[1.01]"
            />
            <a
              href="https://ibb.co/pvJMhyKR"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => playHoverTick(soundEnabled)}
              className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-amber-300 hover:text-amber-200 text-[11px] font-black border border-amber-400/60 flex items-center gap-1 backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Xem ảnh</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Button */}
          <div className="mt-3">
            <button
              onClick={handleClose}
              onMouseEnter={() => playHoverTick(soundEnabled)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(239,68,68,0.6)] border-t border-red-300 border-b-2 border-red-900 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 transform hover:scale-[1.02]"
            >
              <span>Quay lại Trang Chủ</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
