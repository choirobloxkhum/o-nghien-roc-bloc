import React from 'react';
import { ArrowLeft, Maximize2, Sparkles, Gamepad2, Flame, SunMedium, Skull } from 'lucide-react';
import { playUiClick } from '../utils/audio';

interface RPTopNavBarProps {
  onBackToWelcome?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  votedCount?: number;
  totalCharacters?: number;
  isHellMode?: boolean;
  onOpenAgeVerification?: () => void;
  onReturnToEarth?: () => void;
}

export const RPTopNavBar: React.FC<RPTopNavBarProps> = ({
  onBackToWelcome,
  soundEnabled = true,
  isHellMode = false,
  onOpenAgeVerification,
  onReturnToEarth,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-500 backdrop-blur-md ${
        isHellMode
          ? 'bg-gradient-to-r from-[#190312] via-[#2c092c] to-[#16031b] border-b-4 border-red-700/80 shadow-[0_6px_30px_rgba(220,38,38,0.45)]'
          : 'bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] border-b-4 border-[#075985] shadow-[0_6px_25px_rgba(2,132,199,0.45)]'
      }`}
    >
      {/* Subtle Roblox stud texture and top gloss shine */}
      <div className="absolute inset-0 roblox-stud-pattern opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />

      <div className="relative w-full px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto">
        {/* Left Section: Back button & App Title */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          {onBackToWelcome && (
            <button
              onClick={onBackToWelcome}
              title="Quay lại trang chính"
              className={`group relative p-2 sm:p-2.5 rounded-2xl border-2 text-white transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center shrink-0 ${
                isHellMode
                  ? 'bg-gradient-to-br from-red-950 to-purple-950 hover:from-red-900 hover:to-purple-900 border-red-500/50'
                  : 'bg-sky-800/90 hover:bg-sky-700 border-sky-300/40'
              }`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* App Branding & Title */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* 3D Emblem Box */}
            <div className="relative group cursor-pointer shrink-0">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl p-0.5 border-2 border-white flex items-center justify-center transform group-hover:rotate-6 group-hover:scale-105 transition-all ${
                  isHellMode
                    ? 'bg-gradient-to-br from-red-600 via-purple-600 to-amber-500 shadow-[0_0_20px_rgba(220,38,38,0.8)]'
                    : 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_15px_rgba(253,224,71,0.6)]'
                }`}
              >
                <div
                  className={`w-full h-full rounded-[13px] flex items-center justify-center p-1.5 sm:p-2 ${
                    isHellMode ? 'bg-[#0f0312]' : 'bg-sky-950'
                  }`}
                >
                  {isHellMode ? (
                    <Skull className="w-full h-full text-red-400 drop-shadow-sm animate-pulse" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full text-yellow-300 drop-shadow-sm"
                    >
                      <path
                        d="M5.16 0L0 19.34 18.84 24l5.16-19.34L5.16 0zm9.4 14.65l-4.71-1.16 1.16-4.71 4.71 1.16-1.16 4.71z"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {/* Sparkle or Flame pinned on badge */}
              <div
                className={`absolute -top-1.5 -right-1.5 pointer-events-none animate-pulse ${
                  isHellMode ? 'text-amber-400' : 'text-yellow-200'
                }`}
              >
                {isHellMode ? (
                  <Flame className="w-4 h-4 fill-red-500 text-purple-300" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-yellow-300" />
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-white app-title-3d uppercase truncate">
                  {isHellMode ? 'DIÊM LA ĐIỆN ROBLOX' : 'Ổ NGHIỆN ROBLOX'}
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm border animate-pulse shrink-0 ${
                    isHellMode
                      ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                      : 'bg-yellow-300 text-sky-950 border-yellow-100'
                  }`}
                >
                  {isHellMode ? <Flame className="w-3 h-3 fill-amber-400 text-red-300" /> : <Gamepad2 className="w-3 h-3" />}
                  {isHellMode ? 'DIÊM VƯƠNG REALM 18+' : 'APP HUB'}
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-xs font-bold tracking-tight drop-shadow-sm flex items-center gap-1 truncate ${
                  isHellMode ? 'text-purple-200' : 'text-sky-100'
                }`}
              >
                <span>{isHellMode ? 'Khu vực cấm Diêm La Địa Ngục 18+ 🔥🔮' : 'Ổ lưu giữ các chìu ông💖'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Fullscreen Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toàn màn hình"
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-md flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
