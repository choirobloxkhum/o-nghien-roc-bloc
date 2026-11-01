import React from 'react';
import { Flame, CalendarCheck, HelpCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { playUiClick } from '../utils/audio';

interface DailyCheckInBarProps {
  isHellMode?: boolean;
  damRobux: number;
  isCheckedInToday: boolean;
  isClaiming: boolean;
  onClaimCheckIn: () => void;
  onOpenInfoModal: () => void;
  soundEnabled?: boolean;
  isAdmin?: boolean;
}

export const DailyCheckInBar: React.FC<DailyCheckInBarProps> = ({
  isHellMode = false,
  damRobux = 0,
  isCheckedInToday = false,
  isClaiming = false,
  onClaimCheckIn,
  onOpenInfoModal,
  soundEnabled = true,
  isAdmin = false,
}) => {
  if (!isHellMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-3 sm:mt-4 mb-4 sm:mb-6"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-gradient-to-r from-[#24061a] via-[#380927] to-[#1d0317] border-2 border-red-600/70 shadow-[0_0_30px_rgba(220,38,38,0.35)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Subtle Ambient Fiery Background Blur */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Left Info: Robux Dăm balance & Info trigger */}
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 justify-between sm:justify-start">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Fiery Emblem */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-amber-300 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-black/70 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold text-red-300/80 uppercase tracking-wider">
                  ĐIỂM DANH ĐỊA NGỤC
                </span>
                <span className="px-1.5 py-0.2 rounded bg-red-950/80 text-amber-400 text-[9px] font-extrabold border border-red-700/50">
                  CHỈ CÓ TẠI 18+
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-950/90 text-purple-300 text-[9px] font-black border border-purple-500/60 shadow-xs">
                    👑 ADMIN ACCESS
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm text-white font-bold">Số Robux "Dăm":</span>
                <span className="text-sm sm:text-lg font-black text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  {damRobux} R$ Dăm
                </span>
              </div>
            </div>
          </div>

          {/* Info Button */}
          <button
            type="button"
            onClick={() => {
              playUiClick(soundEnabled);
              onOpenInfoModal();
            }}
            title="Xem giới thiệu & quy tắc điểm danh"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-red-200 border border-white/20 transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 text-xs font-bold"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">Giới thiệu</span>
          </button>
        </div>

        {/* Right Action: Daily Check-In Button */}
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
          {isCheckedInToday ? (
            <div className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đã điểm danh hôm nay (+1 R$ Dăm)</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isClaiming}
              onClick={() => {
                playUiClick(soundEnabled);
                onClaimCheckIn();
              }}
              className="w-full sm:w-auto group relative px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm border-2 border-amber-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] hover:shadow-[0_0_30px_rgba(239,68,68,1)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400 to-red-500 opacity-70 blur-xs group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
              <span className="relative z-10 flex items-center gap-2">
                {isClaiming ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <CalendarCheck className="w-4 h-4 text-amber-200" />
                )}
                <span>Điểm Danh Hôm Nay (+1 R$ Dăm) ✨</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
