import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Crown,
  Quote,
  Flame,
  Skull,
  ScrollText,
  Zap,
} from 'lucide-react';
import {
  playHellFlameSwoosh,
  playUiClick,
  playSparkleSound,
} from '../utils/audio';

const marukoFaceImg = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

interface NgocHoangCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
  isHellMode?: boolean;
}

export const NgocHoangCloudModal: React.FC<NgocHoangCloudModalProps> = ({
  isOpen,
  onClose,
  soundEnabled = true,
  isHellMode = false,
}) => {
  // Play appropriate sound effect on modal open
  useEffect(() => {
    if (isOpen) {
      if (isHellMode) {
        playHellFlameSwoosh(soundEnabled);
      } else {
        playSparkleSound(soundEnabled);
      }
    }
  }, [isOpen, isHellMode, soundEnabled]);

  if (!isOpen) return null;

  const handleClose = () => {
    playUiClick(soundEnabled);
    onClose();
  };

  const handleAvatarClick = () => {
    if (isHellMode) {
      playHellFlameSwoosh(soundEnabled);
    } else {
      playSparkleSound(soundEnabled);
    }
  };

  const handleConfirm = () => {
    if (isHellMode) {
      playHellFlameSwoosh(soundEnabled);
    } else {
      playSparkleSound(soundEnabled);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className={`fixed inset-0 backdrop-blur-md transition-opacity ${
            isHellMode ? 'bg-black/85' : 'bg-black/60'
          }`}
        />

        {/* Ambient floating particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
          {isHellMode ? (
            /* Hell Mode Embers */
            [...Array(16)].map((_, i) => (
              <motion.div
                key={`ember-${i}`}
                animate={{
                  y: ['105vh', '-10vh'],
                  x: [0, (i % 2 === 0 ? 30 : -30) * ((i % 3) + 1)],
                  opacity: [0, 0.8, 0],
                  scale: [0.6, 1.4, 0.4],
                }}
                transition={{
                  duration: 2.2 + (i % 4) * 0.5,
                  repeat: Infinity,
                  delay: (i * 0.15) % 1.5,
                  ease: 'easeOut',
                }}
                className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_12px_#ef4444]"
                style={{ left: `${(i * 100) / 16}%` }}
              />
            ))
          ) : (
            /* Normal Mode Celestial Star Dust */
            [...Array(14)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                animate={{
                  y: ['100vh', '-10vh'],
                  x: [0, (i % 2 === 0 ? 20 : -20) * ((i % 3) + 1)],
                  opacity: [0, 0.9, 0],
                  scale: [0.5, 1.2, 0.3],
                }}
                transition={{
                  duration: 3 + (i % 4) * 0.6,
                  repeat: Infinity,
                  delay: (i * 0.2) % 2,
                  ease: 'linear',
                }}
                className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_10px_#fde047]"
                style={{ left: `${(i * 100) / 14}%` }}
              />
            ))
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL MAIN CONTENT CONTAINER (SWITCHES ACCORDING TO MODE)                 */}
        {/* ========================================================================= */}
        {isHellMode ? (
          /* ========================================================================= */
          /* 1. HELL MODE: HAUNTED CURSED PARCHMENT LETTER (DIÊM VƯƠNG)                */
          /* ========================================================================= */
          <motion.div
            key="hell-letter"
            initial={{ opacity: 0, scale: 0.82, rotate: -2, y: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, rotate: 2, y: 25 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl z-20 my-auto select-none p-1 sm:p-2"
          >
            {/* Demonic Flame & Obsidian Aura Behind Letter (Single-pass GPU Radial Gradient) */}
            <div className="absolute -inset-4 sm:-inset-10 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.45)_0%,_rgba(159,18,57,0.3)_45%,_rgba(217,119,6,0.25)_70%,_transparent_100%)] rounded-3xl opacity-90 pointer-events-none transform-gpu" />

            {/* The Cursed Parchment Manuscript */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#fdf6e2] text-stone-900 border-4 border-[#78350f] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(220,38,38,0.6)] overflow-hidden">
              {/* Burnt Scorched Edges Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(69,10,10,0.45)_85%,rgba(28,2,2,0.85)_100%)] z-10" />

              {/* Singed top and bottom burnt ash borders */}
              <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black via-red-950/80 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-black via-red-950/80 to-transparent pointer-events-none z-10" />

              {/* Blood-red Wax Seal with Skull at Top-Right Corner */}
              <div className="absolute top-3 right-12 sm:right-16 z-30 flex items-center justify-center pointer-events-none">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#580000] via-[#990000] to-[#dc2626] border-2 border-red-950 shadow-[0_0_15px_rgba(220,38,38,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center">
                  <Skull className="w-6 h-6 sm:w-7 sm:h-7 text-amber-200 fill-red-950 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-900/90" />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                title="Đóng lá thư bị ám"
                className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/80 hover:bg-red-900 text-amber-200 hover:text-white flex items-center justify-center border border-red-500/80 shadow-md active:scale-90 transition-all z-40 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              {/* MAIN LETTER INNER CONTENT */}
              <div className="relative z-20 p-5 sm:p-8 md:p-10 flex flex-col items-center">
                {/* HEADER: DIÊM VƯƠNG DEMONIC AVATAR */}
                <div className="flex flex-col items-center text-center pb-2 w-full">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarClick}
                    title="Bấm vào Diêm Vương để nhận quỷ hỏa 🔥"
                    className="relative cursor-pointer mb-2.5"
                  >
                    <div className="absolute -inset-3 bg-gradient-to-tr from-red-600 via-rose-700 to-amber-500 rounded-full blur-md opacity-85 animate-pulse" />

                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                      <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-black via-red-950 to-black text-red-400 font-black text-[10px] sm:text-xs shadow-md border border-red-500 flex items-center gap-1">
                        <Skull className="w-3 h-3 text-red-500 fill-red-500" />
                        <span>DIÊM VƯƠNG</span>
                      </div>
                    </div>

                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-red-600 via-black to-red-900 shadow-2xl border-3 border-red-500">
                      {/* Devil Horns */}
                      <div className="absolute -top-2.5 inset-x-0 flex justify-between px-1 pointer-events-none z-40">
                        <div className="w-3.5 h-6 bg-gradient-to-t from-red-900 to-red-500 rounded-t-full border border-black -rotate-20 shadow-[0_0_8px_#ef4444]" />
                        <div className="w-3.5 h-6 bg-gradient-to-t from-red-900 to-red-500 rounded-t-full border border-black rotate-20 shadow-[0_0_8px_#ef4444]" />
                      </div>

                      {/* Dark Curler on Hair */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-gradient-to-r from-red-700 via-rose-600 to-red-950 rounded-full border border-black z-20 flex items-center justify-around px-0.5 shadow-xs">
                        <span className="w-0.5 h-1 bg-black/60 rounded-full" />
                        <span className="w-0.5 h-1 bg-black/60 rounded-full" />
                      </div>

                      <div className="w-full h-full rounded-full overflow-hidden bg-red-950 relative">
                        <img
                          src={marukoFaceImg}
                          alt="Diêm Vương Chơi Roblox Khum"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover scale-110 object-[center_28%] filter hue-rotate-[325deg] contrast-125 saturate-140"
                        />
                      </div>

                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black text-red-400 flex items-center justify-center shadow-md border-2 border-red-500">
                        <Flame className="w-4 h-4 text-red-500 fill-amber-400 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Subtitle Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-black via-red-950 to-black text-red-200 text-[10px] sm:text-xs font-black shadow-md mb-1.5 border border-red-600/80">
                    <ScrollText className="w-3.5 h-3.5 text-red-400" />
                    <span>📜 LÁ THƯ BỊ ÁM TỪ DIÊM LA ĐIỆN 🩸</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>

                  <h3 className="text-stone-950 text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center gap-2">
                    <span>Diêm Vương (Chơi Roblox Khum)</span>
                    <span className="text-red-600 text-lg sm:text-2xl">💀</span>
                  </h3>
                </div>

                {/* LETTER BODY */}
                <div className="relative my-3 sm:my-4 w-full max-w-xl mx-auto">
                  <div className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#fefcf3]/90 backdrop-blur-xs border-2 border-[#d97706]/40 shadow-inner">
                    <Quote className="absolute top-2 left-2 w-8 h-8 text-amber-800/20 rotate-180 -scale-y-100 pointer-events-none" />
                    <Quote className="absolute bottom-2 right-2 w-8 h-8 text-amber-800/20 pointer-events-none" />

                    <p className="relative z-10 text-stone-900 text-sm sm:text-base md:text-[17px] font-bold leading-relaxed text-justify">
                      "hỡi các con dăm của ta, chào mừng các con đã sa ngã vào Diêm La Điện Roblox! các con PHẢI có được khoảnh khắc sa vào dâm tình cùng với dàn chồng hư hỏng của ta! Ha ha ha!"
                    </p>

                    <div className="relative z-10 mt-4 pt-3 border-t border-stone-300/80 flex flex-col items-end">
                      <p className="text-red-950 text-xs sm:text-sm md:text-[15px] font-bold italic text-right tracking-wide flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-red-600 fill-amber-500 shrink-0 inline" />
                        <span>“khoảnh khắc chạm đến Địa ngục, nó khiến ta không muốn quay đầu”</span>
                      </p>
                      <span className="text-[10px] sm:text-xs text-red-700 font-black mt-1">
                        — Trích quỷ huấn Diêm Vương 💀🔥
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTION */}
                <div className="mt-3 sm:mt-5 w-full flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleConfirm}
                    className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#450a0a] via-[#7f1d1d] to-[#450a0a] hover:from-[#991b1b] hover:via-[#dc2626] hover:to-[#991b1b] border-2 border-red-500/80 text-amber-100 hover:text-white font-black text-xs sm:text-sm md:text-base shadow-[0_0_25px_rgba(220,38,38,0.7)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse shrink-0" />
                    <span>💀 TUÂN LỆNH DIÊM VƯƠNG! (Khắc Huyết Vào Sổ Sinh Tử 🩸)</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* 2. NORMAL MODE: CELESTIAL FLOATING CLOUD (NGỌC HOÀNG THIÊN ĐÌNH)         */
          /* ========================================================================= */
          <motion.div
            key="celestial-cloud"
            initial={{ opacity: 0, scale: 0.75, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="relative w-full max-w-lg sm:max-w-2xl md:max-w-3xl z-20 my-auto select-none p-2 sm:p-4"
          >
            {/* Ambient Golden Cloud Halo Glow (Single-pass GPU Radial Gradient) */}
            <div className="absolute -inset-4 sm:-inset-8 bg-[radial-gradient(ellipse_at_center,_rgba(253,224,71,0.4)_0%,_rgba(251,191,36,0.25)_45%,_rgba(56,189,248,0.2)_70%,_transparent_100%)] rounded-full opacity-85 pointer-events-none transform-gpu" />

            {/* THE CLOUD CONTAINER (SVG Puffy Cloud Background Shape & Card) */}
            <div className="relative w-full rounded-[36px] sm:rounded-[48px] bg-gradient-to-b from-[#ffffff] via-[#fffdf0] to-[#fef8d8] text-slate-800 border-4 sm:border-6 border-[#fef08a] shadow-[0_20px_50px_rgba(234,179,8,0.3),0_10px_25px_rgba(0,0,0,0.15)] overflow-hidden">
              {/* Outer Cloud Puffs SVG Details */}
              <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/70 blur-xs pointer-events-none" />
              <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-white/70 blur-xs pointer-events-none" />
              <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full bg-yellow-100/60 blur-xs pointer-events-none" />
              <div className="absolute -bottom-16 -right-10 w-48 h-48 rounded-full bg-yellow-100/60 blur-xs pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                title="Đóng chỉ dụ"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100/90 hover:bg-amber-200 text-amber-900 flex items-center justify-center border-2 border-amber-300 shadow-md active:scale-90 transition-all z-30 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* CLOUD INNER CONTENT */}
              <div className="relative z-10 p-6 sm:p-9 md:p-11 flex flex-col items-center">
                {/* HEADER: NGỌC HOÀNG AVATAR & CROWN */}
                <div className="flex flex-col items-center text-center pb-2 w-full">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarClick}
                    title="Bấm vào Ngọc Hoàng để nhận phúc lộc ✨"
                    className="relative cursor-pointer mb-3"
                  >
                    {/* Glowing Golden Aura Behind Avatar */}
                    <div className="absolute -inset-3 bg-gradient-to-tr from-yellow-400 via-amber-300 to-sky-300 rounded-full blur-md opacity-90 animate-pulse" />

                    {/* Royal Crown on Top of Avatar */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                      <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-lg border-2 border-yellow-200 flex items-center gap-1.5 animate-bounce">
                        <Crown className="w-4 h-4 text-amber-950 fill-amber-400" />
                        <span>NGỌC HOÀNG</span>
                      </div>
                    </div>

                    {/* Avatar Frame with Curler Hair Aesthetic */}
                    <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-300 shadow-xl border-3 border-amber-400">
                      {/* Curler on Hair */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-9 h-3.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full border border-black/80 z-20 flex items-center justify-around px-0.5 shadow-sm">
                        <span className="w-0.5 h-1 bg-black/60 rounded-full" />
                        <span className="w-0.5 h-1 bg-black/60 rounded-full" />
                        <span className="w-0.5 h-1 bg-black/60 rounded-full" />
                      </div>

                      <div className="w-full h-full rounded-full overflow-hidden bg-amber-100 relative">
                        <img
                          src={marukoFaceImg}
                          alt="Ngọc Hoàng Chơi Roblox Khum"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover scale-110 object-[center_28%]"
                        />
                      </div>

                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md border-2 border-white">
                        <Sparkles className="w-4 h-4 fill-amber-950 animate-spin" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Subtitle Pill Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-black shadow-xs mb-1.5 border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>☁️ CHỈ DỤ TỪ THIÊN ĐÌNH CAO XANH 👑</span>
                  </div>

                  <h3 className="text-slate-900 text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center gap-2">
                    <span>Ngọc Hoàng (Chơi Roblox Khum)</span>
                    <span className="text-amber-500 text-lg sm:text-2xl">✨</span>
                  </h3>
                </div>

                {/* CLOUD MESSAGE BODY CONTAINER */}
                <div className="relative my-3 sm:my-4 w-full max-w-xl mx-auto">
                  <div className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-xs border-2 border-amber-200/90 shadow-sm">
                    <Quote className="absolute top-2 left-2 w-8 h-8 text-amber-400/20 rotate-180 -scale-y-100 pointer-events-none" />
                    <Quote className="absolute bottom-2 right-2 w-8 h-8 text-amber-400/20 pointer-events-none" />

                    <p className="relative z-10 text-slate-800 text-sm sm:text-base md:text-[17px] font-bold leading-relaxed text-justify">
                      "hỡi các con yêu của ta, chào mừng các con đã đến với Ổ nghiện Roblox! Chúc các con dân tìm được những khoảnh khắc vấn vương tơ tình cùng với dàn chồng quốc dân &lt;3"
                    </p>

                    <div className="relative z-10 mt-4 pt-3 border-t border-amber-100 flex flex-col items-end">
                      <p className="text-amber-900 text-xs sm:text-sm md:text-[15px] font-bold italic text-right tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 inline" />
                        <span>“khoảnh khắc chạm đến Thiên đường, nó khiến ta ngừng thở”</span>
                      </p>
                      <span className="text-[10px] sm:text-xs text-amber-700 font-bold mt-1">
                        — Trích lời dạy của Ngọc Hoàng ✨
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTION */}
                <div className="mt-3 sm:mt-5 w-full flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleConfirm}
                    className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 border-2 border-amber-200 text-amber-950 font-black text-xs sm:text-sm md:text-base shadow-lg shadow-amber-300/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950 fill-amber-300 animate-bounce shrink-0" />
                    <span>👑 DẠ NGỌC HOÀNG MUÔN NĂM! (ĐÃ ĐỌC CHỈ DỤ)</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
