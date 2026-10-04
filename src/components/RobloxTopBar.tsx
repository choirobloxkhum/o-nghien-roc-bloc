import React from 'react';
import { Maximize2, Sparkles, Zap } from 'lucide-react';

interface RobloxTopBarProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
}

export const RobloxTopBar: React.FC<RobloxTopBarProps> = ({
  reducedMotion = false,
  onToggleReducedMotion,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="relative z-30 w-full px-2 sm:px-8 py-1.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3 backdrop-blur-md bg-black/20 border-b border-white/25 shadow-md font-dessert">
      {/* Sleek Branding Elements (Far Left) */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
        <div className="relative group cursor-pointer shrink-0">
          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 p-1 sm:p-1.5 border sm:border-2 border-yellow-300">
            {/* Iconic Roblox tilted square block with centered hollow square cutout */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full text-black drop-shadow-xs"
            >
              <path
                d="M5.16 0L0 19.34 18.84 24l5.16-19.34L5.16 0zm9.4 14.65l-4.71-1.16 1.16-4.71 4.71 1.16-1.16 4.71z"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 text-yellow-300 animate-pulse pointer-events-none">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-300" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-white text-sm sm:text-2xl font-black tracking-tight app-title-3d uppercase truncate">
            Ổ NGHIỆN ROBLOX
          </span>
          <span className="hidden xs:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-400 text-sky-950 text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs shrink-0">
            GAME APP
          </span>
        </div>
      </div>

      {/* Right Controls: Reduced Motion & Fullscreen */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Nút gạt Giảm effect */}
        {onToggleReducedMotion && (
          <button
            id="btn-toggle-reduced-motion-home"
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={onToggleReducedMotion}
            title={
              reducedMotion
                ? 'Giảm effect: Đang bật (Đã tắt các hạt bay & chuyển động nền để máy mượt hơn)'
                : 'Bật Giảm effect (Tắt hạt bay & chuyển động nền cho máy yếu)'
            }
            className={`group relative flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-2xl border transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
              reducedMotion
                ? 'bg-emerald-500 hover:bg-emerald-600 border-white text-white shadow-[0_2px_12px_rgba(16,185,129,0.45)]'
                : 'bg-white/20 hover:bg-white/30 border-white/40 text-white'
            }`}
          >
            <Zap
              className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 transition-transform ${
                reducedMotion ? 'fill-current scale-110 text-yellow-300' : ''
              }`}
            />

            <span className="text-[9px] sm:text-xs font-bold sm:font-black tracking-tight whitespace-nowrap">
              Giảm effect
            </span>

            {/* Mini Switch Track & Thumb */}
            <div
              className={`w-5 sm:w-8 h-3 sm:h-4.5 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                reducedMotion
                  ? 'bg-white justify-end'
                  : 'bg-black/35 justify-start'
              }`}
            >
              <div
                className={`w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-full transition-transform duration-200 ${
                  reducedMotion
                    ? 'bg-emerald-600 shadow-xs'
                    : 'bg-white/90 shadow-xs'
                }`}
              />
            </div>
          </button>
        )}

        {/* Fullscreen button */}
        <button
          id="btn-fullscreen-toggle"
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md text-white border border-white/30 flex items-center justify-center transition-all shadow-sm focus:outline-none cursor-pointer active:scale-95 shrink-0"
          title="Toàn màn hình"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};


