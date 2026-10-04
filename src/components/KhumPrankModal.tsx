import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, AlertCircle, X, ArrowRight, HeartHandshake } from 'lucide-react';
import avatarImg from '../assets/images/roblox_avatar_1787046368767.jpg';

interface KhumPrankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptPlay: () => void;
  soundEnabled: boolean;
  onPlayClickSound: () => void;
  onPlayBoingSound: () => void;
}

const MEME_REASONS = [
  '⚡ Đang có sự kiện x2 EXP toàn server!',
  '🎁 Tặng miễn phí Code quà tặng tân thủ cực xịn!',
  '🤝 Bạn bè của bạn đang online đông đủ kìa!',
  '🍕 Có tiệm Pizza và Voxel City siêu vui đang chờ!',
];

export const KhumPrankModal: React.FC<KhumPrankModalProps> = ({
  isOpen,
  onClose,
  onAcceptPlay,
  soundEnabled,
  onPlayClickSound,
  onPlayBoingSound,
}) => {
  const [persistedCount, setPersistedCount] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative w-full max-w-md bg-slate-900 border-4 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white text-center"
      >
        {/* Decorative background circle (Single-pass GPU Radial Gradient) */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[radial-gradient(circle,_rgba(244,63,94,0.3)_0%,_transparent_70%)] pointer-events-none transform-gpu" />

        {/* Close Button */}
        <button
          onClick={() => {
            onPlayClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar expression */}
        <div className="relative inline-block mb-3">
          <img
            src={avatarImg}
            alt="Roblox Avatar Shocked"
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl mx-auto border-3 border-rose-400 shadow-lg object-cover"
          />
          <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-2xl font-roblox text-rose-400 drop-shadow mb-1">
          Ủa Alo? Thật Sự Khum Chơi Á?! 🥺
        </h3>
        <p className="text-slate-300 text-sm mb-4">
          Roblox đang vui muốn xỉu luôn á! Xem qua mấy lý do này nè:
        </p>

        {/* Bullet reasons */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 mb-6 text-left space-y-2 text-xs sm:text-sm text-slate-200">
          {MEME_REASONS.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-2 font-medium">
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onPlayClickSound();
              onClose();
              onAcceptPlay();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-emerald-400 to-green-600 hover:from-emerald-300 hover:to-green-500 font-roblox text-lg tracking-wide text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <HeartHandshake className="w-5 h-5" />
            Nghĩ Lại Rồi, Chơi Ngay!
          </button>

          <button
            onClick={() => {
              onPlayBoingSound();
              setPersistedCount((c) => c + 1);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs transition-colors"
          >
            {persistedCount === 0
              ? 'Vẫn muốn bấm Khum... 🙈'
              : persistedCount === 1
              ? 'Nút Khum bị kẹt rồi, không bấm được đâu! 😜'
              : persistedCount === 2
              ? 'Thôi mà, vào chơi 5 phút thui! 🎮'
              : 'Chịu thua bạn luôn á! 😂 (Thử bấm nút xanh xem sao!)'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
