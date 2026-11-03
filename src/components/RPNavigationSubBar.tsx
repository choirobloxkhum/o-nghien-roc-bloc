import React, { useState, useEffect } from 'react';
import { Home, Terminal, Flame, SunMedium, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { playUiClick } from '../utils/audio';
import { subscribeHasNewConfessions, markConfessionsAsViewed } from '../services/confessionsService';

export type MainSubTab = 'home' | 'commands' | 'confessions';

interface RPNavigationSubBarProps {
  activeTab: MainSubTab;
  onTabChange: (tab: MainSubTab) => void;
  isHellMode?: boolean;
  soundEnabled?: boolean;
  totalCommands?: number;
  totalCharacters?: number;
  onOpenAgeVerification?: () => void;
  onReturnToEarth?: () => void;
}

export const RPNavigationSubBar: React.FC<RPNavigationSubBarProps> = ({
  activeTab,
  onTabChange,
  isHellMode = false,
  soundEnabled = true,
  onOpenAgeVerification,
  onReturnToEarth,
}) => {
  const [hasNewConfessions, setHasNewConfessions] = useState(false);

  // Monitor incoming confessions in real-time from Firebase snapshots
  useEffect(() => {
    if (activeTab === 'confessions') {
      markConfessionsAsViewed();
      setHasNewConfessions(false);
      return;
    }

    const unsub = subscribeHasNewConfessions((hasNew) => {
      if (activeTab !== 'confessions') {
        setHasNewConfessions(hasNew);
      }
    });

    return () => unsub();
  }, [activeTab]);

  const handleSelectTab = (tab: MainSubTab) => {
    if (tab !== activeTab) {
      if (tab === 'confessions') {
        markConfessionsAsViewed();
        setHasNewConfessions(false);
      }
      playUiClick(soundEnabled);
      onTabChange(tab);
    }
  };

  return (
    <nav
      id="rp-navigation-subbar"
      aria-label="Điều hướng chính"
      className="sticky top-[52px] sm:top-[61px] z-30 w-full transition-all duration-300 py-1.5 sm:py-2.5 flex items-center justify-center bg-transparent pointer-events-none"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 md:px-8 flex items-center justify-center">
        {/* Navigation Control Bar: Trang Chủ | Kho Lệnh | Tâm Thư | Chế độ Địa Ngục (Wrapped in one unified capsule) */}
        <div
          className={`pointer-events-auto flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl backdrop-blur-md border shadow-lg transition-all max-w-full ${
            isHellMode
              ? 'bg-[#190318]/90 border-red-900/60 shadow-[0_4px_25px_rgba(220,38,38,0.35)]'
              : 'bg-white/85 border-white shadow-[0_4px_25px_rgba(2,132,199,0.18)]'
          }`}
        >
          {/* TAB 1: Trang Chủ */}
          <button
            id="tab-btn-home"
            type="button"
            onClick={() => handleSelectTab('home')}
            className={`relative flex-1 sm:flex-initial shrink-0 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer select-none active:scale-95 whitespace-nowrap ${
              activeTab === 'home'
                ? 'text-white'
                : isHellMode
                ? 'text-purple-300 hover:text-white hover:bg-white/10'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            {activeTab === 'home' && (
              <motion.div
                layoutId="activeSubTabIndicator"
                className={`absolute inset-0 rounded-xl shadow-md ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 to-purple-600 border border-red-400/60 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                    : 'bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 border border-sky-400/50 shadow-[0_2px_12px_rgba(2,132,199,0.4)]'
                }`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="tracking-wide">Trang Chủ</span>
            </span>
          </button>

          {/* TAB 2: Kho Lệnh (Ẩn ở Chế độ Địa Ngục) */}
          {!isHellMode && (
            <button
              id="tab-btn-commands"
              type="button"
              onClick={() => handleSelectTab('commands')}
              className={`relative flex-1 sm:flex-initial shrink-0 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer select-none active:scale-95 whitespace-nowrap ${
                activeTab === 'commands'
                  ? 'text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {activeTab === 'commands' && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute inset-0 rounded-xl shadow-md bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 border border-sky-400/50 shadow-[0_2px_12px_rgba(2,132,199,0.4)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="tracking-wide">Kho Lệnh</span>
              </span>
            </button>
          )}

          {/* TAB 3: Tâm Thư (Chỉ hiển thị ở Hạ Giới, Địa Ngục không có) */}
          {!isHellMode && (
            <button
              id="tab-btn-confessions"
              type="button"
              onClick={() => handleSelectTab('confessions')}
              className={`relative flex-1 sm:flex-initial shrink-0 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none active:scale-95 whitespace-nowrap ${
                activeTab === 'confessions'
                  ? 'text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {activeTab === 'confessions' && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute inset-0 rounded-xl shadow-md bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 border border-sky-400/50 shadow-[0_2px_12px_rgba(2,132,199,0.4)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                <span className="relative flex items-center">
                  <Send className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform ${hasNewConfessions ? 'animate-bounce text-amber-300 scale-110' : ''}`} />
                  {hasNewConfessions && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-rose-600 border border-white" />
                    </span>
                  )}
                </span>
                <span className="tracking-wide">Tâm Thư</span>
                {hasNewConfessions && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-rose-500 to-red-600 text-white uppercase tracking-wider animate-pulse shadow-sm border border-white/80">
                    MỚI
                  </span>
                )}
              </span>
            </button>
          )}

          {/* NÚT CHUYỂN ĐỔI: Chế độ Địa Ngục 18+ / Về Hạ Giới (Nằm chung trong khung trắng điều hướng) */}
          {isHellMode ? (
            <button
              id="tab-btn-hell-mode"
              type="button"
              onClick={() => {
                playUiClick(soundEnabled);
                onReturnToEarth?.();
              }}
              title="Đang trong cõi Địa Ngục 18+. Nhấp để trở về Hạ Giới tươi sáng"
              className="group relative shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none active:scale-95 whitespace-nowrap bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white border-2 border-white shadow-[0_0_20px_rgba(56,189,248,0.7)] hover:shadow-[0_0_30px_rgba(56,189,248,0.9)] hover:scale-105"
            >
              <SunMedium className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-200 group-hover:rotate-90 transition-transform duration-300" />
              <span className="tracking-wide drop-shadow-sm whitespace-nowrap">Về Hạ Giới 🌤️</span>
            </button>
          ) : (
            <button
              id="tab-btn-hell-mode"
              type="button"
              onClick={() => {
                playUiClick(soundEnabled);
                onOpenAgeVerification?.();
              }}
              title="Khám phá Chế độ Địa Ngục 18+ (Hell Realm)"
              className="group relative shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none active:scale-95 whitespace-nowrap bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:via-rose-500 hover:to-amber-400 text-white border-2 border-amber-300 shadow-[0_0_22px_rgba(239,68,68,0.75),0_0_12px_rgba(245,158,11,0.6)] hover:shadow-[0_0_32px_rgba(239,68,68,0.95),0_0_18px_rgba(245,158,11,0.85)] hover:scale-105"
            >
              {/* Lớp hào quang lửa nhấp nháy phát sáng */}
              <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500 via-amber-400 to-red-500 opacity-70 blur-xs group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

              <span className="relative z-10 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 fill-amber-300 animate-bounce" />
                <span className="tracking-wide font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap">
                  Địa Ngục
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-amber-300 text-[10px] sm:text-[11px] font-black tracking-wider border border-amber-400/60 shadow-inner flex items-center gap-0.5 whitespace-nowrap">
                  18+ 🔥
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
