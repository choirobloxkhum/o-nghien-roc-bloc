import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Lock, Sparkles, AlertTriangle, CheckCircle2, Loader2, CalendarCheck } from 'lucide-react';
import { RPCharacter } from '../types';
import { getCharacterAvatar } from '../data/rpCharacters';
import { getCharacterHellCost } from '../services/damRobuxApi';
import { playUiClick } from '../utils/audio';

interface UnlockHellCharModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: RPCharacter | null;
  damRobux: number;
  isCheckedInToday: boolean;
  onConfirmUnlock: (characterId: string) => Promise<boolean>;
  onClaimCheckIn?: () => void;
  soundEnabled?: boolean;
}

export const UnlockHellCharModal: React.FC<UnlockHellCharModalProps> = ({
  isOpen,
  onClose,
  character,
  damRobux = 0,
  isCheckedInToday = false,
  onConfirmUnlock,
  onClaimCheckIn,
  soundEnabled = true,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !character) return null;

  const cost = getCharacterHellCost(character.id);
  const hasEnough = damRobux >= cost;
  const missingAmount = Math.max(0, cost - damRobux);

  const handleUnlockClick = async () => {
    playUiClick(soundEnabled);
    setIsUnlocking(true);
    setErrorMessage(null);

    const success = await onConfirmUnlock(character.id);
    setIsUnlocking(false);

    if (success) {
      onClose();
    } else {
      setErrorMessage(`Không thể mở khóa. Vui lòng kiểm tra lại số Robux "Dăm"!`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#24061a] via-[#1a0413] to-[#0f020b] rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.5)] border-2 border-red-600/70 text-white overflow-hidden"
        >
          {/* Top Decorative Rim */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

          {/* Close button */}
          <button
            onClick={() => {
              playUiClick(soundEnabled);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-red-300/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="relative mb-3">
              <img
                src={getCharacterAvatar(character, true)}
                alt={character.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
              />
              <div className="absolute -bottom-2 -right-2 bg-red-950 text-amber-300 p-1.5 rounded-xl border border-amber-400/80 shadow-md">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mở Khóa Nhân Vật Địa Ngục
            </h3>
            <p className="text-sm font-bold text-amber-300 mt-0.5">
              {character.name}
            </p>
          </div>

          {/* Cost Details Card */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 space-y-3 mb-5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-red-200/90 font-medium">Yêu cầu mở khóa:</span>
              <span className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400 text-red-500" />
                {cost} Robux "Dăm"
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-red-900/50">
              <span className="text-red-200/90 font-medium">Số dư hiện tại của bạn:</span>
              <span className={`font-black text-sm sm:text-base ${hasEnough ? 'text-emerald-300' : 'text-rose-400'}`}>
                {damRobux} Robux "Dăm"
              </span>
            </div>

            {!hasEnough && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs font-medium leading-relaxed flex items-start gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Bạn còn thiếu <strong className="text-amber-300 font-bold">{missingAmount} R$ Dăm</strong>. Hãy tích lũy bằng cách điểm danh mỗi ngày nhé!
                </span>
              </div>
            )}
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {hasEnough ? (
              <button
                type="button"
                disabled={isUnlocking}
                onClick={handleUnlockClick}
                className="w-full py-3 px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white border-2 border-amber-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang mở khóa...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Mở Khóa Vĩnh Viễn (Dùng {cost} R$ Dăm)</span>
                  </>
                )}
              </button>
            ) : (
              <>
                {!isCheckedInToday && onClaimCheckIn && (
                  <button
                    type="button"
                    onClick={() => {
                      playUiClick(soundEnabled);
                      onClaimCheckIn();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 mb-1"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Điểm Danh Hôm Nay (+1 R$ Dăm) ✨</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playUiClick(soundEnabled);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                >
                  Đã hiểu
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
