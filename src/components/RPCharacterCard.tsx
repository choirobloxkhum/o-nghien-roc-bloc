import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, BookOpen, Sparkles, Crown, Check, Volume2, Flame, Lock } from 'lucide-react';
import { RPCharacter } from '../types';
import { useCharacterVoice } from '../utils/characterVoice';
import { RPCharacterComments } from './RPCharacterComments';

interface RPCharacterCardProps {
  character: RPCharacter;
  hasVoted?: boolean;
  onPlay: (character: RPCharacter) => void;
  onReadPlot: (character: RPCharacter) => void;
  onDonateRobux: (characterId: string) => void;
  isHellMode?: boolean;
  commentCount?: number;
  rankBadge?: {
    rank: number;
    label: string;
    color: string;
  };
}

const RPCharacterCardComponent: React.FC<RPCharacterCardProps> = ({
  character,
  hasVoted = false,
  onPlay,
  onReadPlot,
  onDonateRobux,
  isHellMode = false,
  commentCount = 0,
  rankBadge,
}) => {
  const [floatingPuffs, setFloatingPuffs] = useState<{ id: number; text: string; isWarning?: boolean }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const { playingId, playVoice, stopVoice } = useCharacterVoice();

  const isSpeaking = playingId === character.id;
  const isLuciferLocked = character.id === 'char-11-lucifer' || character.name.toLowerCase().includes('lucifer') || Boolean(character.password);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!character.voiceUrl) return;

    if (isSpeaking) {
      stopVoice();
    } else {
      playVoice(character);
    }
  };

  const handleRobuxClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasVoted) {
      const warningPuff = {
        id: Date.now() + Math.random(),
        text: 'Đã thả 1 R$ (Tối đa 1 R$)',
        isWarning: true,
      };
      setFloatingPuffs((prev) => [...prev.slice(-2), warningPuff]);
      setTimeout(() => {
        setFloatingPuffs((prev) => prev.filter((p) => p.id !== warningPuff.id));
      }, 1500);
      return;
    }

    onDonateRobux(character.id);

    const nextTotal = (character.robuxDonations || 0) + 1;
    const newPuff = {
      id: Date.now() + Math.random(),
      text: `+1 R$ (Tổng ${nextTotal})`,
      isWarning: false,
    };
    setFloatingPuffs((prev) => [...prev.slice(-2), newPuff]);

    setTimeout(() => {
      setFloatingPuffs((prev) => prev.filter((p) => p.id !== newPuff.id));
    }, 1300);
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0.8, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id={`char-${character.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 md:p-4 transition-all duration-300 transform hover:-translate-y-1 group gpu-accelerated content-auto ${
        isHellMode
          ? 'bg-gradient-to-b from-[#18051a] via-[#100312] to-[#09010b] border border-red-900/60 sm:border-2 shadow-[0_4px_20px_rgba(0,0,0,0.7)] hover:shadow-[0_16px_36px_rgba(220,38,38,0.35)] hover:border-red-500/80'
          : 'bg-white border border-slate-100 sm:border-2 shadow-[0_4px_16px_rgba(0,0,0,0.05)] sm:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(2,132,199,0.14)] hover:border-sky-300'
      }`}
    >
      {/* 1. TOP SQUARE PLACEHOLDER AREA (FRAMED 1:1 IMAGE BOX) */}
      <div
        onClick={handleImageClick}
        title={
          character.voiceUrl
            ? isSpeaking
              ? 'Bấm để dừng giọng nói'
              : `🎙️ Bấm để nghe giọng nói của ${character.name}`
            : character.name
        }
        className={`relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer select-none transition-all duration-300 ${
          isHellMode
            ? 'bg-black border border-red-900/80 shadow-inner'
            : 'bg-slate-100 border border-slate-200/80 shadow-inner'
        } ${
          isSpeaking
            ? isHellMode
              ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-black scale-[1.02]'
              : 'ring-4 ring-pink-500 ring-offset-2 scale-[1.02]'
            : 'group-hover:shadow-md'
        }`}
      >
        {character.avatarUrl ? (
          <img
            src={character.avatarUrl}
            alt={character.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-[center_15%] sm:object-center transition-transform duration-500 will-change-transform ${
              isSpeaking ? 'scale-110' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2 text-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-slate-800 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold">Ảnh</span>
          </div>
        )}

        {/* 1.1 Smooth Gradient Fade-In Overlay (Higher reach in Hell mode, subtle gradient only on hover/active in normal mode so image is NOT obscured) */}
        <div
          className={`absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-300 z-5 flex flex-col justify-end pb-2.5 ${
            isHellMode
              ? `h-[58%] bg-gradient-to-t from-black via-black/85 via-35% via-black/35 via-65% to-transparent ${isHovered || isSpeaking ? 'opacity-45' : 'opacity-95'}`
              : `h-1/3 bg-gradient-to-t from-black/50 to-transparent ${isHovered || isSpeaking ? 'opacity-100' : 'opacity-0'}`
          }`}
        >
          {/* Subtle Censor Tape / Restricted Strip in Hell Mode near bottom */}
          {isHellMode && (
            <div className="w-[85%] mx-auto py-0.5 rounded bg-black/90 border-y border-red-500/60 flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,0,0,0.95)] mb-0.5 transition-opacity duration-300 group-hover:opacity-75">
              <span className="text-[7.5px] sm:text-[8.5px] font-black tracking-widest text-red-400 uppercase select-none flex items-center gap-1">
                <span className="text-amber-400 text-[9px]">🔞</span> CENSORED 18+
              </span>
            </div>
          )}
        </div>

        {/* Subtle Ambient Focus Ring on Active Voice */}
        <div
          className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 pointer-events-none ${
            isHellMode
              ? 'from-black/30 via-transparent to-transparent'
              : 'from-black/20 via-transparent to-transparent'
          } ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Voice Play Indicator Pill Badge on Image */}
        {character.voiceUrl && (
          <div
            className={`absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md transition-all duration-300 pointer-events-none ${
              isSpeaking
                ? isHellMode
                  ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white animate-pulse shadow-red-500/50'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white animate-pulse shadow-pink-500/50'
                : isHellMode
                ? 'bg-black/85 border border-purple-500/40 text-purple-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                : 'bg-black/75 text-white/95 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
            }`}
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span className="truncate">Đang phát giọng...</span>
                <div className="flex items-end gap-0.5 h-3 ml-0.5">
                  <span className="w-0.5 bg-white rounded-full animate-[bounce_0.6s_infinite_alternate]" style={{ height: '80%' }} />
                  <span className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_infinite_alternate_0.2s]" style={{ height: '100%' }} />
                  <span className="w-0.5 bg-white rounded-full animate-[bounce_0.5s_infinite_alternate_0.4s]" style={{ height: '60%' }} />
                </div>
              </>
            ) : (
              <>
                <Volume2 className={`w-3 h-3 ${isHellMode ? 'text-amber-400' : 'text-pink-300'} stroke-[2.5]`} />
                <span className="truncate">Bấm nghe giọng 🎙️</span>
              </>
            )}
          </div>
        )}

        {/* Top-Right NEW / Custom Tag Badge */}
        {(character.isNew || character.cornerTag) && (
          <div
            className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[9px] sm:text-[10px] tracking-wide shadow-md border select-none ${
              isHellMode
                ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white border-red-300 shadow-[0_0_10px_rgba(220,38,38,0.7)]'
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white border-white/60 shadow-[0_2px_10px_rgba(244,63,94,0.55)]'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 fill-yellow-200 text-yellow-200 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{character.cornerTag || 'MỚI'}</span>
          </div>
        )}

        {/* Top-Left Voice Icon Pill when speaking */}
        {isSpeaking && (
          <div
            className={`absolute top-2 left-2 w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg animate-bounce pointer-events-none z-10 ${
              isHellMode ? 'bg-red-600' : 'bg-pink-500'
            }`}
          >
            <Volume2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* 2. TITLE AREA WITH CHARACTER NAME & DETAILS */}
      <div className="flex flex-col flex-1 mt-2 sm:mt-3 px-0.5">
        <div className="flex items-center gap-2">
          <h3
            className={`font-extrabold text-sm sm:text-base md:text-lg truncate tracking-tight transition-colors ${
              isHellMode
                ? 'text-purple-100 group-hover:text-amber-400'
                : 'text-slate-900 group-hover:text-sky-600'
            }`}
          >
            {character.name}
          </h3>
          {rankBadge && !isHellMode && (
            <div
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded-full font-black text-[10px] shadow-sm shrink-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950"
            >
              <Crown className="w-2.5 h-2.5 fill-current" />
              <span>#{rankBadge.rank}</span>
            </div>
          )}
        </div>
        <p className={`text-[10px] sm:text-xs line-clamp-2 mt-0.5 leading-snug ${isHellMode ? 'text-purple-300/70' : 'text-slate-500'}`}>
          {character.plotSummary || character.tagline || 'Nhân vật Roleplay Roblox'}
        </p>

        {/* Tag Pills */}
        <div className="mt-1.5 sm:mt-2.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {character.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`text-[8.5px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full ${
                isHellMode
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-800/60'
                  : 'bg-sky-50 text-sky-700 border border-sky-100/80'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. ACTION BUTTONS:
          - Hell Mode: Single full-width '"Chơi"' button (or Lock icon for Lucifer)
          - Normal Mode: "Chơi" (or Lock icon for Lucifer) on top, then "Đọc plot" + "Robux" in bottom row
      */}
      {isHellMode ? (
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-red-900/50 flex">
          {/* Play Button in Hell Mode */}
          <button
            onClick={() => onPlay(character)}
            title={isLuciferLocked ? 'Nhập mật khẩu để mở khóa' : '"Chơi"'}
            aria-label={isLuciferLocked ? 'Mật khẩu' : '"Chơi"'}
            className="w-full py-2 sm:py-2.5 px-2 rounded-xl text-white font-extrabold text-sm sm:text-base shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-gradient-to-b from-[#dc2626] via-[#991b1b] to-[#7f1d1d] hover:from-[#ef4444] hover:to-[#991b1b] border-t border-red-300/50 border-b-2 border-[#450a0a] shadow-red-950"
          >
            {isLuciferLocked ? (
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white stroke-none" />
                <span>"Chơi"</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2">
          {/* Play Button in Normal Mode (no quotes) */}
          <button
            onClick={() => onPlay(character)}
            title={isLuciferLocked ? 'Nhập mật khẩu để mở khóa' : 'Chơi'}
            aria-label={isLuciferLocked ? 'Mật khẩu' : 'Chơi'}
            className="w-full py-1.5 sm:py-2.5 px-2 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] border-t border-white/40 border-b-2 border-[#15803d] hover:shadow-green-500/20"
          >
            {isLuciferLocked ? (
              <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white stroke-none" />
                <span>Chơi</span>
              </>
            )}
          </button>

          {/* Bottom row in Normal Mode: "Đọc plot" + "Robux" */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 relative">
            {/* Read Plot Button */}
            <button
              onClick={() => onReadPlot(character)}
              className="w-full py-1.5 sm:py-2 px-1 rounded-xl text-white font-extrabold text-[10px] sm:text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer truncate bg-gradient-to-b from-[#0284c7] to-[#0369a1] hover:from-[#38bdf8] hover:to-[#0284c7] border-t border-white/40 border-b-2 border-[#075985] hover:shadow-sky-500/20"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">Đọc plot</span>
            </button>

            {/* Robux Button */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleRobuxClick}
                title={hasVoted ? 'Thiết bị này đã thả 1 R$ cho nhân vật này (tối đa 1 R$/chồng)' : 'Thả 1 Robux (+1 R$)'}
                className={`w-full py-1.5 sm:py-2 px-1 rounded-xl font-black text-[10px] sm:text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer border-t border-b-2 truncate ${
                  hasVoted
                    ? 'bg-gradient-to-b from-amber-200 to-amber-300 border-t-white/40 border-b-amber-400 text-amber-950 opacity-95'
                    : 'bg-gradient-to-b from-[#fbbf24] to-[#f59e0b] hover:from-[#fcd34d] hover:to-[#fbbf24] border-t-white/40 border-b-[#d97706] text-amber-950 hover:shadow-amber-400/20'
                }`}
              >
                {/* Robux Coin Icon */}
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full font-black text-[8px] sm:text-[9px] flex items-center justify-center shrink-0 shadow-2xs bg-amber-900 text-yellow-300">
                  {hasVoted ? <Check className="w-2.5 h-2.5 text-emerald-300 stroke-[3]" /> : 'R$'}
                </div>
                <span className="truncate">{character.robuxDonations} R$</span>
                {hasVoted ? (
                  <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded-xs font-black bg-emerald-700/20 text-emerald-900">
                    Đã thả
                  </span>
                ) : (
                  <span className="text-[8.5px] sm:text-[10px] px-0.5 sm:px-1 rounded-xs font-black bg-amber-800/20 text-amber-950">
                    +1
                  </span>
                )}
              </motion.button>

              {/* Floating Robux Particle Feedback */}
              <AnimatePresence>
                {floatingPuffs.map((puff) => (
                  <motion.div
                    key={puff.id}
                    initial={{ opacity: 1, y: 0, scale: 0.7 }}
                    animate={{ opacity: 0, y: -24, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85, ease: 'easeOut' }}
                    className={`absolute right-1 -top-5 pointer-events-none text-[10px] sm:text-xs font-black drop-shadow-xs whitespace-nowrap z-30 px-1.5 py-0.5 rounded-full shadow-md ${
                      puff.isWarning
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-400 text-amber-950 border border-amber-200'
                    }`}
                  >
                    {puff.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* 4. PUBLIC COMMENT / REVIEW MODAL TRIGGER */}
      <RPCharacterComments
        characterId={character.id}
        characterName={character.name}
        characterAvatar={character.avatarUrl}
        characterRole={character.roleTag}
        isHellMode={isHellMode}
        commentCount={commentCount}
      />
    </motion.div>
  );
};

export const RPCharacterCard = React.memo(RPCharacterCardComponent, (prev, next) => {
  return (
    prev.character.id === next.character.id &&
    prev.character.robuxDonations === next.character.robuxDonations &&
    prev.character.avatarUrl === next.character.avatarUrl &&
    prev.character.name === next.character.name &&
    prev.hasVoted === next.hasVoted &&
    prev.commentCount === next.commentCount &&
    prev.isHellMode === next.isHellMode &&
    prev.rankBadge?.rank === next.rankBadge?.rank
  );
});
