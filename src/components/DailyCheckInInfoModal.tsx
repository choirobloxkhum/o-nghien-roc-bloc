import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Sparkles } from 'lucide-react';
import { playUiClick } from '../utils/audio';

interface DailyCheckInInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
}

export const DailyCheckInInfoModal: React.FC<DailyCheckInInfoModalProps> = ({
  isOpen,
  onClose,
  soundEnabled = true,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg flex flex-col bg-gradient-to-b from-[#24061a] via-[#1a0413] to-[#0f020b] rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.4)] border-2 border-red-600/70 text-white overflow-hidden"
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
          <div className="flex flex-col items-center text-center mb-4 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-0.5 mb-2.5 shadow-[0_0_20px_rgba(239,68,68,0.6)] border border-amber-300">
              <div className="w-full h-full bg-black/70 rounded-[14px] flex items-center justify-center">
                <Flame className="w-8 h-8 text-amber-300 fill-amber-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-amber-200 to-red-400 tracking-tight">
              TÍNH NĂNG ĐIỂM DANH & ROBUX "DĂM"
            </h3>
            <p className="text-xs text-red-300/80 font-semibold mt-1">
              Chỉ áp dụng dành riêng cho Chế độ Địa Ngục 🔞
            </p>
          </div>

          {/* Guide Body */}
          <div className="space-y-4 text-xs sm:text-sm text-red-100/90 leading-relaxed font-medium">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-red-950/50 border border-red-700/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Quy tắc nhận Robux "Dăm":</span>
              </div>
              <ul className="list-disc list-inside space-y-2 text-red-200/90 pl-1">
                <li>
                  Mỗi ngày khi đăng nhập vào hệ thống và bấm nút <strong className="text-amber-300 font-bold">"Điểm Danh Hôm Nay"</strong> ở Chế độ Địa Ngục, bạn sẽ được tặng <strong className="text-amber-300 font-bold">1 Robux "Dăm"</strong> (<strong className="text-emerald-300 font-bold">tối đa 1 lần/ngày/tài khoản</strong>).
                </li>
                <li>
                  Tài khoản đăng nhập giúp hệ thống <strong className="text-white font-bold">lưu trữ cố định vĩnh viễn</strong> số lượng Robux "Dăm" mà bạn đang sở hữu.
                </li>
                <li>
                  Robux "Dăm" tích lũy được dùng để <strong className="text-amber-300 font-bold">mở khóa chế độ "Chơi"</strong> (Roleplay session) với các nhân vật hắc ám ở Địa Ngục. Mở khóa 1 lần sẽ được chơi <strong className="text-emerald-300 font-bold">vĩnh viễn</strong>!
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-4 pt-3 border-t border-red-900/60 flex justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                playUiClick(soundEnabled);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer active:scale-95 transition-all"
            >
              Đã hiểu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
