import React from 'react';
import robloxGalleryHallBg from '../assets/images/roblox_art_gallery_hall_bg_1789878886935.jpg';

interface RobloxDoodleBackgroundProps {
  isHellMode?: boolean;
}

export const RobloxDoodleBackground: React.FC<RobloxDoodleBackgroundProps> = ({
  isHellMode = false,
}) => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. High-Resolution 3D Roblox Museum Exhibition Hall Interior Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={robloxGalleryHallBg}
          alt="Roblox Museum Exhibition Hall"
          className={`w-full h-full object-cover object-center transition-all duration-700 select-none pointer-events-none ${
            isHellMode
              ? 'filter brightness-50 contrast-125 hue-rotate-[290deg]'
              : 'filter brightness-95'
          }`}
        />
      </div>

      {/* 2. Soft Semi-Transparent Overlays (Optimized: Replaced heavy backdrop-filter with lightweight rgba layers) */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isHellMode
            ? 'bg-gradient-to-b from-[#18031d]/95 via-[#230527]/85 to-[#130117]/95'
            : 'bg-gradient-to-b from-white/70 via-amber-50/60 to-amber-100/70'
        }`}
      />

      {/* 3. Subtle Museum Ambient Track Light Cones & Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/20 pointer-events-none" />

      {/* 4. Atmospheric Light Spots */}
      {isHellMode ? (
        <>
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[450px] h-[350px] bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full h-48 bg-amber-900/10 blur-2xl pointer-events-none" />
        </>
      )}
    </div>
  );
};
