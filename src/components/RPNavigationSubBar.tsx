import React from 'react';
import { Home, Terminal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { playUiClick } from '../utils/audio';

export type MainSubTab = 'home' | 'commands';

interface RPNavigationSubBarProps {
  activeTab: MainSubTab;
  onTabChange: (tab: MainSubTab) => void;
  isHellMode?: boolean;
  soundEnabled?: boolean;
  totalCommands?: number;
  totalCharacters?: number;
}

export const RPNavigationSubBar: React.FC<RPNavigationSubBarProps> = ({
  activeTab,
  onTabChange,
  isHellMode = false,
  soundEnabled = true,
  totalCommands = 20,
  totalCharacters = 15,
}) => {
  const handleSelectTab = (tab: MainSubTab) => {
    if (tab !== activeTab) {
      playUiClick(soundEnabled);
      onTabChange(tab);
    }
  };

  return (
    <nav
      id="rp-navigation-subbar"
      aria-label="Điều hướng chính"
      className={`sticky top-[52px] sm:top-[61px] z-30 w-full transition-all duration-300 backdrop-blur-md border-b relative overflow-hidden ${
        isHellMode
          ? 'bg-gradient-to-r from-[#190318] via-[#2a0422] to-[#160216] border-red-900/60 shadow-[0_4px_20px_rgba(220,38,38,0.25)]'
          : 'bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] border-[#075985]/70 shadow-[0_4px_20px_rgba(2,132,199,0.35)]'
      }`}
    >
      {/* Vân gai tròn Lego/Roblox mờ */}
      <div className="absolute inset-0 roblox-stud-pattern opacity-15 pointer-events-none" />

      {/* Ánh bóng kính cao cấp (Glass glossy shine & highlight) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-black/15 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-1.5 sm:py-2 flex items-center justify-between gap-2">
        {/* Dual Tab Segmented Control */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 shadow-inner">
          {/* TAB 1: Trang Chủ */}
          <button
            id="tab-btn-home"
            type="button"
            onClick={() => handleSelectTab('home')}
            className={`relative px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer select-none active:scale-95 ${
              activeTab === 'home'
                ? 'text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {activeTab === 'home' && (
              <motion.div
                layoutId="activeSubTabIndicator"
                className={`absolute inset-0 rounded-xl shadow-md ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 to-purple-600 border border-red-400/60 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                    : 'bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500 border border-white/50 shadow-[0_2px_12px_rgba(255,255,255,0.3)]'
                }`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="tracking-wide">Trang Chủ</span>
            </span>
          </button>

          {/* TAB 2: Kho Lệnh */}
          <button
            id="tab-btn-commands"
            type="button"
            onClick={() => handleSelectTab('commands')}
            className={`relative px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer select-none active:scale-95 ${
              activeTab === 'commands'
                ? 'text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {activeTab === 'commands' && (
              <motion.div
                layoutId="activeSubTabIndicator"
                className={`absolute inset-0 rounded-xl shadow-md ${
                  isHellMode
                    ? 'bg-gradient-to-r from-amber-600 to-red-600 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                    : 'bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-500 border border-white/50 shadow-[0_2px_12px_rgba(255,255,255,0.3)]'
                }`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="tracking-wide">Kho Lệnh</span>
            </span>
          </button>
        </div>

        {/* Right Info Tag */}
        <div className="hidden sm:flex items-center gap-2 text-white/95 text-xs font-bold px-3 py-1 rounded-xl bg-black/15 backdrop-blur-xs border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span>
            {activeTab === 'home'
              ? 'Khám phá dàn chồng Roblox & Bảng vàng Robux'
              : 'Tổng hợp các lệnh của đầu bếp Roblox'}
          </span>
        </div>
      </div>
    </nav>
  );
};
