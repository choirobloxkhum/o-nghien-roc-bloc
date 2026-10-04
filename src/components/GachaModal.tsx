import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Dices, Play, BookOpen, RotateCcw, X, Flame, ChevronRight, Check, Heart, ExternalLink, Volume2, Lock } from 'lucide-react';
import { RPCharacter } from '../types';
import { playGachaSpinTick, playGachaRevealFanfare, playUiClick } from '../utils/audio';
import { useCharacterVoice } from '../utils/characterVoice';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: RPCharacter[];
  soundEnabled: boolean;
  onSelectCharacter: (char: RPCharacter) => void;
  onPlay: (char: RPCharacter) => void;
  onReadPlot: (char: RPCharacter) => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  characters,
  soundEnabled,
  onSelectCharacter,
  onPlay,
  onReadPlot,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedChar, setSelectedChar] = useState<RPCharacter | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const spinIntervalRef = useRef<number | null>(null);
  const { playingId, playVoice, stopVoice } = useCharacterVoice();

  const startGachaSpin = () => {
    if (characters.length === 0) return;
    setIsSpinning(true);
    setSelectedChar(null);
    setShowConfetti(false);

    // Pick a winner in advance
    const winnerIndex = Math.floor(Math.random() * characters.length);
    const winner = characters[winnerIndex];

    let speed = 45; // Initial fast rolling speed (ms)
    let totalTicks = 0;
    const maxTicks = 26 + Math.floor(Math.random() * 8); // Spin length

    let currentIndex = Math.floor(Math.random() * characters.length);

    const step = () => {
      currentIndex = (currentIndex + 1) % characters.length;
      setDisplayIndex(currentIndex);
      totalTicks++;

      playGachaSpinTick(totalTicks % 12, soundEnabled);

      if (totalTicks >= maxTicks) {
        // Stop on the chosen winner
        setDisplayIndex(winnerIndex);
        setSelectedChar(winner);
        setIsSpinning(false);
        setShowConfetti(true);
        playGachaRevealFanfare(soundEnabled);
      } else {
        // Decelerate as we approach the end
        if (totalTicks > maxTicks - 10) {
          speed += 28;
        } else if (totalTicks > maxTicks - 5) {
          speed += 45;
        }
        spinIntervalRef.current = window.setTimeout(step, speed);
      }
    };

    step();
  };

  useEffect(() => {
    if (isOpen) {
      startGachaSpin();
    } else {
      if (spinIntervalRef.current) {
        clearTimeout(spinIntervalRef.current);
      }
      setIsSpinning(false);
      setSelectedChar(null);
      setShowConfetti(false);
    }
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDisplay = characters[displayIndex] || characters[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSpinning) onClose();
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#2d124d] via-[#1b0a33] to-[#0f041e] border-2 sm:border-3 border-amber-400 rounded-3xl sm:rounded-[32px] p-4 sm:p-7 shadow-[0_0_50px_rgba(234,179,8,0.4)] text-white z-10 overflow-hidden"
        >
          {/* Glowing background rays & studs */}
          <div className="absolute inset-0 roblox-stud-pattern opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.22)_0%,_transparent_70%)] pointer-events-none transform-gpu" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.22)_0%,_transparent_70%)] pointer-events-none transform-gpu" />

          {/* Close button */}
          <button
            onClick={() => {
              playUiClick(soundEnabled);
              onClose();
            }}
            disabled={isSpinning}
            className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer z-20 ${
              isSpinning ? 'opacity-40 cursor-not-allowed' : 'active:scale-90'
            }`}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Header Title */}
          <div className="text-center mb-4 sm:mb-5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-spin [animation-duration:4s]" />
              <span>{isSpinning ? 'Đang quay số định mệnh...' : '✨ Chồng may mắn của hôm nay! ✨'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
              {isSpinning ? '🎲 ĐANG CHỌN CHỒNG...' : '🎉 BẠN ĐÃ TRÚNG ANH XÃ! 🎉'}
            </h3>
          </div>

          {/* Character Roulette Card Box */}
          <div
            onClick={() => {
              if (isSpinning) return;
              const targetChar = selectedChar || currentDisplay;
              if (!targetChar?.voiceUrl) return;
              if (playingId === targetChar.id) {
                stopVoice();
              } else {
                playVoice(targetChar);
              }
            }}
            title={
              (selectedChar || currentDisplay)?.voiceUrl
                ? !isSpinning && playingId === (selectedChar || currentDisplay).id
                  ? 'Bấm để dừng giọng nói'
                  : `🎙️ Bấm để nghe giọng của ${(selectedChar || currentDisplay).name}`
                : undefined
            }
            className={`relative w-full aspect-[16/11] sm:aspect-[16/10] rounded-2xl overflow-hidden border-2 sm:border-3 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-slate-900 mb-4 sm:mb-5 group ${
              !isSpinning && (selectedChar || currentDisplay)?.voiceUrl ? 'cursor-pointer' : ''
            }`}
          >
            {/* Spinning Indicator Border Glow */}
            <div
              className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ${
                isSpinning
                  ? 'border-4 border-yellow-400 animate-pulse shadow-[inset_0_0_20px_rgba(250,204,21,0.6)]'
                  : !isSpinning && playingId === (selectedChar || currentDisplay)?.id
                  ? 'border-4 border-pink-500 ring-2 ring-pink-400 animate-pulse'
                  : 'border-2 border-amber-300/60'
              }`}
            />

            {/* Character Image */}
            <img
              src={currentDisplay.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
              alt={currentDisplay.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-[center_15%] transition-transform duration-300 ${
                isSpinning
                  ? 'scale-105 blur-[1px]'
                  : !isSpinning && playingId === (selectedChar || currentDisplay)?.id
                  ? 'scale-105'
                  : 'scale-100 group-hover:scale-105'
              }`}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

            {/* Voice Pill overlay on Gacha card */}
            {!isSpinning && (selectedChar || currentDisplay)?.voiceUrl && (
              <div
                className={`absolute top-3 right-3 z-30 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg transition-all ${
                  playingId === (selectedChar || currentDisplay)?.id
                    ? 'bg-pink-500 text-white animate-bounce'
                    : 'bg-black/60 backdrop-blur-md text-amber-300 border border-amber-300/40 group-hover:bg-pink-600 group-hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  {playingId === (selectedChar || currentDisplay)?.id ? 'Đang phát giọng' : 'Nghe giọng 🎙️'}
                </span>
              </div>
            )}

            {/* Character Name & Plot at bottom */}
            <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4 z-20">
              <h4 className="text-white font-black text-lg sm:text-2xl drop-shadow-md truncate">
                {currentDisplay.name}
              </h4>
              <p className="text-white/80 text-[11px] sm:text-xs font-medium line-clamp-2 mt-0.5 leading-snug">
                {currentDisplay.plotSummary || currentDisplay.tagline || 'Nhân vật roleplay siêu hot trên Roblox!'}
              </p>
            </div>

            {/* Spinning Motion Blur Line Effect */}
            {isSpinning && (
              <div className="absolute inset-0 z-15 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Tags List */}
          {currentDisplay.tags && currentDisplay.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
              {currentDisplay.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-purple-900/60 border border-purple-400/30 text-purple-200 text-[10px] sm:text-xs font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 relative z-10">
            {/* Primary Action: Tới xem ngay */}
            <button
              onClick={() => {
                if (selectedChar || currentDisplay) {
                  playUiClick(soundEnabled);
                  onSelectCharacter(selectedChar || currentDisplay);
                  onClose();
                }
              }}
              disabled={isSpinning}
              className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-400 hover:to-rose-400 border-2 border-pink-300 text-white font-black text-sm sm:text-base shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSpinning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span>Tới xem ngay trong danh sách</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            </button>

            {/* Row 2: Chơi & Đọc plot (Normal mode) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (selectedChar || currentDisplay) {
                    onPlay(selectedChar || currentDisplay);
                  }
                }}
                disabled={isSpinning}
                className={`py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] border-t border-white/40 border-b-2 border-[#15803d] text-white font-black text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSpinning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {(selectedChar || currentDisplay)?.id === 'char-11-lucifer' || (selectedChar || currentDisplay)?.password ? (
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                    <span>Chơi</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (selectedChar || currentDisplay) {
                    onReadPlot(selectedChar || currentDisplay);
                  }
                }}
                disabled={isSpinning}
                className={`py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#0284c7] to-[#0369a1] hover:from-[#38bdf8] hover:to-[#0284c7] border-t border-white/40 border-b-2 border-[#075985] text-white font-black text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSpinning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Đọc plot</span>
              </button>
            </div>

            {/* Row 3: Quay lại */}
            <button
              onClick={() => {
                playUiClick(soundEnabled);
                startGachaSpin();
              }}
              disabled={isSpinning}
              className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 border border-amber-200 text-amber-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSpinning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RotateCcw className={`w-4 h-4 stroke-[3] ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay...' : 'Quay lại em khác! 🎲'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
