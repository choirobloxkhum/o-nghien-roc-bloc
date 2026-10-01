import React from 'react';
import { Home, Terminal } from 'lucide-react';
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
      className="sticky top-[52px] sm:top-[61px] z-30 w-full transition-all duration-300 py-2 sm:py-2.5 flex items-center justify-center bg-transparent pointer-events-none"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-center">
        {/* Dual Tab Segmented Control - Đặt chính giữa */}
        <div
          className={`pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-2xl backdrop-blur-md border shadow-lg transition-all ${
            isHellMode
              ? 'bg-[#190318]/90 border-red-900/60 shadow-[0_4px_20px_rgba(220,38,38,0.3)]'
              : 'bg-white/85 border-white shadow-[0_4px_20px_rgba(2,132,199,0.15)]'
          }`}
        >
          {/* TAB 1: Trang Chủ */}
          <button
            id="tab-btn-home"
            type="button"
            onClick={() => handleSelectTab('home')}
            className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer select-none active:scale-95 ${
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
            className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer select-none active:scale-95 ${
              activeTab === 'commands'
                ? 'text-white'
                : isHellMode
                ? 'text-purple-300 hover:text-white hover:bg-white/10'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            {activeTab === 'commands' && (
              <motion.div
                layoutId="activeSubTabIndicator"
                className={`absolute inset-0 rounded-xl shadow-md ${
                  isHellMode
                    ? 'bg-gradient-to-r from-amber-600 to-red-600 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                    : 'bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 border border-sky-400/50 shadow-[0_2px_12px_rgba(2,132,199,0.4)]'
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
      </div>
    </nav>
  );
};
