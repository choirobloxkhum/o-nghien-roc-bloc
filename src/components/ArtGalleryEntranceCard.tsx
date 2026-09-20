import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, ChevronRight } from 'lucide-react';
import { playSparkleSound, playHellFlameSwoosh, playUiClick } from '../utils/audio';
import phongTranhBannerBg from '../assets/images/phong_tranh_banner_bg_1789877954673.jpg';

interface ArtGalleryEntranceCardProps {
  onOpenGallery: () => void;
  isHellMode?: boolean;
  soundEnabled?: boolean;
}

export const ArtGalleryEntranceCard: React.FC<ArtGalleryEntranceCardProps> = ({
  onOpenGallery,
  isHellMode = false,
  soundEnabled = true,
}) => {
  const handleClick = () => {
    playUiClick(soundEnabled);
    if (isHellMode) {
      playHellFlameSwoosh(soundEnabled);
    } else {
      playSparkleSound(soundEnabled);
    }
    onOpenGallery();
  };

  return (
    <div className="w-full">
      <motion.button
        id="btn-phong-tranh-entrance"
        onClick={handleClick}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className={`w-full group relative overflow-hidden rounded-2xl sm:rounded-3xl p-1 transition-all duration-300 cursor-pointer block ${
          isHellMode
            ? 'shadow-[0_0_30px_rgba(220,38,38,0.45)] hover:shadow-[0_0_40px_rgba(239,68,68,0.7)]'
            : 'shadow-[0_8px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)]'
        }`}
      >
        {/* Glowing border rim */}
        <div
          className={`absolute inset-0 rounded-2xl sm:rounded-3xl animate-pulse ${
            isHellMode
              ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-600 opacity-90'
              : 'bg-gradient-to-r from-sky-400 via-amber-300 to-emerald-400 opacity-95'
          }`}
        />

        {/* Shimmer sweep effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-30" />

        {/* Main Banner Container */}
        <div
          className={`relative rounded-[14px] sm:rounded-[22px] overflow-hidden min-h-[145px] sm:min-h-[200px] flex items-center justify-center border-2 transition-all ${
            isHellMode
              ? 'border-red-500/70 text-purple-100 bg-[#160219]'
              : 'border-white/80 text-white bg-sky-950'
          }`}
        >
          {/* 1. High-Resolution Roblox Meadow Landscape Background - Clear & Visible */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={phongTranhBannerBg}
              alt="Phong Tranh Roblox Scenery"
              className={`w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none ${
                isHellMode ? 'filter brightness-60 contrast-125 hue-rotate-[290deg]' : ''
              }`}
            />

            {/* 2. Very Gentle Overlay (Giảm làm mờ tối đa để thấy rõ thảo nguyên đằng sau) */}
            <div
              className={`absolute inset-0 transition-colors ${
                isHellMode
                  ? 'bg-gradient-to-b from-[#18031d]/75 via-[#230527]/60 to-[#130117]/80'
                  : 'bg-gradient-to-b from-black/20 via-black/35 to-black/55 backdrop-blur-[1px]'
              }`}
            />

            {/* Light vignette around edges */}
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* 3. Centered Content: Title in Vivaldi font, Slogan, and Button underneath */}
          <div className="relative z-10 w-full px-2.5 sm:px-8 py-3.5 sm:py-7 flex flex-col items-center justify-center text-center">
            {/* Tiêu đề Phòng Tranh với font chữ Vivaldi kẹp giữa 2 biểu tượng ngôi sao lấp lánh */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              <Sparkles
                className={`w-4 h-4 sm:w-8 sm:h-8 shrink-0 animate-pulse ${
                  isHellMode
                    ? 'text-amber-300 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                    : 'text-yellow-300 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                }`}
              />
              <h2
                style={{
                  fontFamily: "'Vivaldi', 'Great Vibes', 'Brush Script MT', 'Dancing Script', cursive",
                }}
                className={`text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-normal tracking-wide leading-tight drop-shadow-[0_3px_14px_rgba(0,0,0,0.95)] px-0.5 sm:px-1 whitespace-nowrap ${
                  isHellMode ? 'text-amber-300' : 'text-[#FFD700]'
                }`}
              >
                Phòng Tranh
              </h2>
              <Sparkles
                className={`w-4 h-4 sm:w-8 sm:h-8 shrink-0 animate-pulse ${
                  isHellMode
                    ? 'text-amber-300 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                    : 'text-yellow-300 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                }`}
              />
            </div>

            {/* Slogan 2 câu thơ ở giữa với font chữ Byron */}
            <div
              style={{
                fontFamily: "'Byron', 'Cormorant Garamond', 'EB Garamond', 'Playfair Display', 'Cinzel', 'Great Vibes', 'Nunito', serif, cursive",
              }}
              className={`mt-1.5 sm:mt-3 text-xs sm:text-base md:text-lg font-semibold tracking-wide leading-snug sm:leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-sm sm:max-w-xl px-1 ${
                isHellMode ? 'text-purple-100' : 'text-white'
              }`}
            >
              <p className="italic">"Gửi trao một mối chân tình,</p>
              <p className="italic font-bold text-amber-200">
                Đổi về trọn vẹn bóng hình người thương."
              </p>
            </div>

            {/* Nút Vào Thưởng Lãm đặt ngay dưới câu slogan */}
            <div className="mt-2.5 sm:mt-5">
              <div
                className={`px-3.5 sm:px-7 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-black tracking-wider uppercase shadow-xl border flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all group-hover:scale-105 ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 via-purple-700 to-amber-600 text-white border-red-300 shadow-red-950/90'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-white shadow-[0_6px_20px_rgba(245,158,11,0.6)]'
                }`}
              >
                <span>Vào Thưởng Lãm</span>
                <div
                  className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border transition-transform group-hover:translate-x-1 ${
                    isHellMode
                      ? 'bg-red-900/70 text-red-100 border-red-400'
                      : 'bg-slate-950/20 text-slate-950 border-slate-950/20'
                  }`}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};
