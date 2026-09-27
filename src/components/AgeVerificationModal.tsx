import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Flame, ShieldAlert, ArrowLeft, CheckCircle2, Skull } from 'lucide-react';
import { playUiClick, playHoverTick } from '../utils/audio';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  soundEnabled?: boolean;
  title?: string;
  badgeText?: string;
  questionText?: string;
  descriptionText?: React.ReactNode;
  subNoteText?: string;
  confirmButtonText?: string;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  soundEnabled = true,
  title = 'CẢNH BÁO ĐỘ TUỔI',
  badgeText = 'CAUTION: 18+ CONTENT / HELL REALM',
  questionText = 'Bạn đã đủ 18 tuổi để tiến vào Địa Ngục chưa?',
  descriptionText = (
    <>
      Khu vực <span className="text-orange-400 font-bold">Địa Ngục 18+ (Hell Realm)</span> chứa các kịch bản hắc ám, ngược tâm, nội dung trưởng thành và giao diện u tối huyền bí.
    </>
  ),
  subNoteText = 'Bạn có thể chuyển về Hạ Giới (Theme gốc) bất cứ lúc nào.',
  confirmButtonText = 'Xác nhận (18+)',
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
        {/* Animated Background Fiery Aura */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px]" />
        </div>

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#1c0f0f] via-[#120808] to-[#0a0404] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.35)] border-2 border-red-600/60 text-white overflow-hidden"
        >
          {/* Glowing Top Frame Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />

          {/* Background Demonic Silhouette Icon */}
          <div className="absolute -right-6 -bottom-6 text-red-950/40 pointer-events-none select-none">
            <Skull className="w-48 h-48 stroke-[1]" />
          </div>

          {/* Header Warning Banner */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-red-950 p-0.5 shadow-[0_0_30px_rgba(239,68,68,0.6)] border-2 border-red-400 flex items-center justify-center">
                <div className="w-full h-full bg-black/60 rounded-[14px] flex items-center justify-center">
                  <Flame className="w-9 h-9 sm:w-11 sm:h-11 text-red-400 fill-orange-500 animate-bounce" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-red-300 shadow-md">
                18+
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-black tracking-wider uppercase mb-2 shadow-inner">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-orange-200 to-red-400 tracking-tight leading-tight">
              {title}
            </h2>
          </div>

          {/* Query Body Text */}
          <div className="space-y-4 mb-8 text-center sm:text-left relative z-10">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/40 space-y-2">
              <p className="text-base sm:text-lg font-black text-red-100 text-center leading-snug">
                {questionText}
              </p>
              <div className="text-xs sm:text-sm text-red-300/80 text-center font-medium leading-relaxed">
                {descriptionText}
              </div>
            </div>

            {subNoteText && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400/90 font-semibold">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{subNoteText}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 relative z-10">
            <button
              onClick={() => {
                playUiClick(soundEnabled);
                onClose();
              }}
              onMouseEnter={() => playHoverTick(soundEnabled)}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-black text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Quay lại</span>
            </button>

            <button
              onClick={() => {
                playUiClick(soundEnabled);
                onConfirm();
              }}
              onMouseEnter={() => playHoverTick(soundEnabled)}
              className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(239,68,68,0.7)] border-t border-red-300 border-b-2 border-red-900 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 transform hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
