import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Skull, Flame, ScrollText, Cloud } from 'lucide-react';

interface AnnouncementBannerProps {
  onClick: () => void;
  soundEnabled?: boolean;
  isHellMode?: boolean;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  onClick,
  isHellMode = false,
}) => {
  const normalText =
    'Chào mừng các con yêu đã đến với Ổ nghiện Roblox. Bấm vào đây để nhận thông báo từ Ngọc Hoàng (Chơi Roblox Khum)...';
  const hellText =
    'Chào mừng các yêu đã đến với Ổ nghiện Roblox. Bấm vào đây để nhận lá thư bị ám từ Diêm Vương (Chơi Roblox Khum).';

  const announcementText = isHellMode ? hellText : normalText;

  return (
    <div className="w-full mb-3 sm:mb-4">
      <motion.button
        id={isHellMode ? 'btn-diem-vuong-announcement-ticker' : 'btn-ngoc-hoang-announcement-ticker'}
        onClick={onClick}
        whileHover={{ scale: 1.012 }}
        whileTap={{ scale: 0.985 }}
        title={
          isHellMode
            ? 'Bấm để mở lá thư bị ám từ Diêm Vương (Chơi Roblox Khum) 📜💀'
            : 'Bấm để mở thông báo chỉ dụ từ Ngọc Hoàng ☁️👑'
        }
        className={`w-full relative group overflow-hidden rounded-xl sm:rounded-2xl p-0.5 transition-all duration-300 cursor-pointer block text-left shadow-lg ${
          isHellMode
            ? 'bg-gradient-to-r from-[#7f1d1d] via-[#b45309] to-[#831843] hover:from-[#991b1b] hover:via-[#d97706] hover:to-[#9d174d] shadow-[0_6px_20px_rgba(180,83,9,0.35)]'
            : 'bg-gradient-to-r from-yellow-300 via-amber-400 to-sky-300 hover:from-yellow-400 hover:via-amber-500 hover:to-sky-400 shadow-[0_4px_15px_rgba(245,158,11,0.25)]'
        }`}
      >
        {/* Inner Capsule Container - Cursed Parchment (Màu vàng da cổ & Nâu đất) in Hell Mode */}
        <div
          className={`relative flex items-center gap-2 sm:gap-3.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[10px] sm:rounded-[14px] overflow-hidden border shadow-sm ${
            isHellMode
              ? 'bg-[#fffbeb] border-[#fde68a] text-stone-900 shadow-inner'
              : 'bg-white border-amber-200'
          }`}
        >
          {/* Decorative Corner Accents */}
          {isHellMode ? (
            <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-amber-500/15 via-red-500/10 to-transparent pointer-events-none" />
          ) : (
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-amber-400/10 to-transparent pointer-events-none" />
          )}

          {/* Left Icon Pill / Badge */}
          {isHellMode ? (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black shrink-0 shadow-xs border bg-gradient-to-r from-[#7f1d1d] via-[#92400e] to-[#78350f] text-amber-100 border-amber-500/60 shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
              <Skull className="w-3.5 h-3.5 animate-pulse text-amber-300 stroke-[2.5]" />
              <span className="hidden xs:inline">THƯ BỊ ÁM</span>
              <span className="xs:hidden">QUỶ THƯ</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black shrink-0 shadow-xs border bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-900" />
              <span>BẢN TIN</span>
            </div>
          )}

          {/* Scrolling Marquee Container */}
          <div className="relative flex-1 overflow-hidden h-5 sm:h-6 flex items-center mask-marquee">
            {/* Seamless Double Content for continuous infinite marquee */}
            <div className="flex shrink-0 animate-marquee items-center gap-8 whitespace-nowrap group-hover:[animation-play-state:paused]">
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm md:text-[15px] font-extrabold ${
                  isHellMode ? 'text-stone-900' : 'text-slate-800'
                }`}
              >
                <span className={isHellMode ? 'text-red-600 font-black' : ''}>{isHellMode ? '📜' : '☁️'}</span>
                <span>{announcementText}</span>
                {isHellMode ? (
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                )}
              </div>
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm md:text-[15px] font-extrabold ${
                  isHellMode ? 'text-stone-900' : 'text-slate-800'
                }`}
              >
                <span className={isHellMode ? 'text-red-600 font-black' : ''}>{isHellMode ? '📜' : '☁️'}</span>
                <span>{announcementText}</span>
                {isHellMode ? (
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                )}
              </div>
            </div>

            <div
              className="flex shrink-0 animate-marquee items-center gap-8 whitespace-nowrap group-hover:[animation-play-state:paused]"
              aria-hidden="true"
            >
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm md:text-[15px] font-extrabold ${
                  isHellMode ? 'text-stone-900' : 'text-slate-800'
                }`}
              >
                <span className={isHellMode ? 'text-red-600 font-black' : ''}>{isHellMode ? '📜' : '☁️'}</span>
                <span>{announcementText}</span>
                {isHellMode ? (
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                )}
              </div>
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm md:text-[15px] font-extrabold ${
                  isHellMode ? 'text-stone-900' : 'text-slate-800'
                }`}
              >
                <span className={isHellMode ? 'text-red-600 font-black' : ''}>{isHellMode ? '📜' : '☁️'}</span>
                <span>{announcementText}</span>
                {isHellMode ? (
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                )}
              </div>
            </div>
          </div>

          {/* Right Action Hint Button */}
          {isHellMode ? (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black shrink-0 transition-colors shadow-xs border bg-gradient-to-r from-amber-100 to-amber-200 text-red-950 hover:from-amber-200 hover:to-amber-300 border-amber-400/80 shadow-xs">
              <ScrollText className="w-3.5 h-3.5 text-red-700 animate-bounce" />
              <span className="hidden sm:inline">Mở thư bị ám</span>
              <span className="sm:hidden">Mở thư</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black shrink-0 transition-colors shadow-xs border bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200">
              <Cloud className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Mở thông báo</span>
              <span className="sm:hidden">Xem</span>
            </div>
          )}
        </div>

        {/* Ambient Top Glow Line */}
        <div
          className={`absolute inset-x-0 top-0 h-[1px] ${
            isHellMode
              ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90'
              : 'bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-80'
          }`}
        />
      </motion.button>
    </div>
  );
};
