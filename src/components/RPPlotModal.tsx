import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, MessageSquare, Sparkles, Play, ShieldAlert, Heart, Tag, Lock } from 'lucide-react';
import { RPCharacter } from '../types';

interface RPPlotModalProps {
  character: RPCharacter | null;
  hasVoted?: boolean;
  onClose: () => void;
  onPlay: (character: RPCharacter) => void;
  onDonateRobux: (characterId: string) => void;
}

export const RPPlotModal: React.FC<RPPlotModalProps> = ({
  character,
  hasVoted = false,
  onClose,
  onPlay,
  onDonateRobux,
}) => {
  if (!character) return null;

  const isReduced =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('reduced-motion-mode');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md">
      <motion.div
        initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
        animate={isReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        transition={isReduced ? { duration: 0.1, ease: 'linear' } : { duration: 0.25 }}
        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Character Banner Image & Centered Art */}
        <div className="relative h-56 sm:h-64 bg-slate-950 overflow-hidden shrink-0">
          {character.avatarUrl && (
            <>
              {/* Blurred background filling the full width banner */}
              <img
                src={character.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-[center_20%] filter blur-lg brightness-40 scale-110"
              />
              {/* Clear centered portrait frame that preserves 100% of the face and art */}
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  referrerPolicy="no-referrer"
                  className="h-full max-w-[240px] sm:max-w-[280px] object-contain rounded-2xl filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                />
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Character Main Header Info */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {(character.isNew || character.cornerTag) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-white text-xs font-black shadow-sm flex items-center gap-1 border border-white/40">
                    <Sparkles className="w-3 h-3 fill-yellow-200 text-yellow-200" />
                    <span>{character.cornerTag || 'MỚI'}</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-xs font-bold shadow-sm">
                  {character.roleTag}
                </span>
                {character.gender && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                    {character.gender}
                  </span>
                )}
                {character.age && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                    {character.age}
                  </span>
                )}
              </div>
              <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                {character.name}
              </h2>
            </div>

            {/* Quick Robux Donation Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDonateRobux(character.id)}
              disabled={hasVoted}
              className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                hasVoted
                  ? 'bg-amber-200 text-amber-900 border border-amber-300 opacity-90'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <span>💰</span>
              <span>{character.robuxDonations} R$</span>
              <span className="text-[10px] bg-amber-700 text-white px-1.5 py-0.5 rounded-full">
                {hasVoted ? 'Đã thả' : '+1 R$'}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Scrollable Plot Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800">
          {/* Plot Title & Summary */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
            <div className="flex items-center gap-2 text-sky-800 font-extrabold text-base sm:text-lg mb-1">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>{character.plotTitle || 'Cốt Truyện RP Chính'}</span>
            </div>
            <p className="text-sky-950 text-sm leading-relaxed">
              {character.plotSummary || character.tagline}
            </p>
          </div>

          {/* Personality Traits */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tính Cách & Đặc Điểm</span>
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
              {character.personality || 'Chưa cập nhật tính cách.'}
            </p>
          </div>

          {/* Full Plot Lore */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-500" />
              <span>Chi Tiết Bối Cảnh & Kịch Bản Roleplay</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
              {character.fullPlot || 'Chưa có cốt truyện chi tiết. Bạn có thể tự do sáng tạo RP theo cách của mình!'}
            </div>
          </div>

          {/* Sample Dialogues */}
          {character.sampleDialogue && character.sampleDialogue.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Câu Thoại Tiêu Biểu</span>
              </h4>
              <div className="space-y-2">
                {character.sampleDialogue.map((quote, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs sm:text-sm font-semibold italic"
                  >
                    {quote}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs cursor-pointer transition-all"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDonateRobux(character.id)}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-t border-white/40 border-b-2 ${
                hasVoted
                  ? 'bg-amber-200 text-amber-950 border-amber-300 opacity-90'
                  : 'bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95 border-amber-600'
              }`}
            >
              <span>💰</span>
              <span>{character.robuxDonations} R$</span>
              {hasVoted ? (
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">Đã thả 1 R$</span>
              ) : (
                <span className="text-xs bg-amber-800 text-yellow-200 px-1.5 py-0.5 rounded-full font-black">+1 R$</span>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onPlay(character);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-b from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] border-t border-white/40 border-b-2 border-[#15803d] text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {character.id === 'char-11-lucifer' || character.password ? (
                <>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>Mở Khóa Để Chơi</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white stroke-none" />
                  <span>Chơi Ngay Với {character.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
