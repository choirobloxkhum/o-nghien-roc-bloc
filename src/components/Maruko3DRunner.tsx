import React from 'react';

const marukoFaceImg = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

interface Maruko3DRunnerProps {
  isCompleted?: boolean;
}

export const Maruko3DRunner: React.FC<Maruko3DRunnerProps> = ({ isCompleted = false }) => {
  return (
    <div className="relative flex flex-col items-center justify-end select-none pointer-events-none">
      {/* Dynamic Runner Container with Forward Lean and Stride Bobbing */}
      <div
        className={`relative flex flex-col items-center origin-bottom filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] ${
          isCompleted ? 'maruko-completed' : 'maruko-run-body'
        }`}
      >
        {/* === 1. HEAD (The girl with yellow roller & Roblox woman face) === */}
        <div className="relative z-30 mb-[-4px] flex flex-col items-center">
          {/* Yellow Roller Curler on top */}
          <div className="w-5 h-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full border border-black/80 shadow-xs mb-[-3px] z-10 flex items-center justify-center">
            <div className="w-full flex justify-around px-0.5">
              <span className="w-0.5 h-1 bg-black/40 rounded-full" />
              <span className="w-0.5 h-1 bg-black/40 rounded-full" />
              <span className="w-0.5 h-1 bg-black/40 rounded-full" />
            </div>
          </div>

          {/* Circular Cutout Head Frame */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-black/80 shadow-sm bg-amber-100/90 relative">
            <img
              src={marukoFaceImg}
              alt="Maruko Roblox Girl"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-110 object-[center_28%]"
            />
          </div>
        </div>

        {/* === 2. 3D BLOCKY TORSO & ARMS === */}
        <div className="relative z-20 flex items-center justify-center">
          {/* BACK/LEFT ARM (Swings opposite to Right Arm) */}
          <div
            className={`w-2.5 h-6 bg-gradient-to-b from-white via-white to-[#fecaca] rounded-md border-[1.5px] border-black/80 origin-top absolute -left-2 top-0.5 shadow-sm -z-10 ${
              isCompleted ? '' : 'maruko-run-arm-l'
            }`}
          >
            {/* Hand */}
            <div className="w-2.5 h-2 bg-[#fed7aa] rounded-full border-t border-black/60 absolute bottom-0" />
          </div>

          {/* 3D BLOCKY TORSO (Red Pinafore Dress over White Top) */}
          <div className="w-8 sm:w-9 h-7 sm:h-8 rounded-md bg-gradient-to-b from-white via-[#dc2626] to-[#b91c1c] border-[1.5px] border-black/90 shadow-md relative overflow-hidden flex flex-col items-center">
            {/* White Shirt Collar */}
            <div className="w-4 h-1.5 bg-white rounded-b-sm border-b border-black/60 z-10" />
            {/* Red Pinafore Straps */}
            <div className="w-full flex justify-between px-1 mt-[-1px] z-10">
              <div className="w-1.5 h-3 bg-[#b91c1c] border border-black/40 rounded-xs" />
              <div className="w-1.5 h-3 bg-[#b91c1c] border border-black/40 rounded-xs" />
            </div>
            {/* 3D Blocky Side Shading */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/20" />
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/20" />
          </div>

          {/* FRONT/RIGHT ARM (Swings with running motion) */}
          <div
            className={`w-2.5 h-6 bg-gradient-to-b from-white via-white to-[#fecaca] rounded-md border-[1.5px] border-black/80 origin-top absolute -right-2 top-0.5 shadow-sm z-30 ${
              isCompleted ? '' : 'maruko-run-arm-r'
            }`}
          >
            {/* Hand */}
            <div className="w-2.5 h-2 bg-[#fed7aa] rounded-full border-t border-black/60 absolute bottom-0" />
          </div>
        </div>

        {/* === 3. 3D BLOCKY RUNNING LEGS (Alternating realistic sprint stride) === */}
        <div className="relative z-10 flex gap-1 mt-[-2px]">
          {/* LEFT LEG (Back stride) */}
          <div
            className={`w-3 h-6 bg-gradient-to-b from-[#fed7aa] via-white to-[#dc2626] rounded-b-sm border-[1.5px] border-black/90 origin-top shadow-sm flex flex-col justify-end items-center ${
              isCompleted ? '' : 'maruko-run-leg-l'
            }`}
          >
            {/* Red Sneaker/Shoe */}
            <div className="w-3.5 h-2.5 bg-[#991b1b] rounded-sm border-t border-black/60 relative -right-0.5 shadow-inner" />
          </div>

          {/* RIGHT LEG (Front stride - Opposite phase) */}
          <div
            className={`w-3 h-6 bg-gradient-to-b from-[#fed7aa] via-white to-[#dc2626] rounded-b-sm border-[1.5px] border-black/90 origin-top shadow-sm flex flex-col justify-end items-center ${
              isCompleted ? '' : 'maruko-run-leg-r'
            }`}
          >
            {/* Red Sneaker/Shoe */}
            <div className="w-3.5 h-2.5 bg-[#991b1b] rounded-sm border-t border-black/60 relative -right-0.5 shadow-inner" />
          </div>
        </div>
      </div>

      {/* === 4. RUNNING SPEED PARTICLES ON PROGRESS BAR === */}
      {!isCompleted && (
        <div className="absolute -bottom-0.5 -left-4 flex items-center gap-0.5 pointer-events-none opacity-80">
          <span className="text-[10px] text-white/90 font-bold animate-pulse">
            💨
          </span>
          <div className="w-2.5 h-1 bg-white/50 rounded-full" />
        </div>
      )}
    </div>
  );
};
