import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, Flame, ChevronDown, Trophy, Star, Volume2, Skull, RefreshCw, Zap } from 'lucide-react';
import { RPCharacter } from '../types';
import { useCharacterVoice } from '../utils/characterVoice';

interface RPRichLeaderboardProps {
  topCharacters: RPCharacter[];
  votedIds?: string[];
  onPlay: (character: RPCharacter) => void;
  onReadPlot: (character: RPCharacter) => void;
  onDonateRobux: (characterId: string) => void;
  isHellMode?: boolean;
  remainingHours?: number;
  onRefreshLeaderboard?: () => void;
  reducedMotion?: boolean;
}

export const RPRichLeaderboard: React.FC<RPRichLeaderboardProps> = ({
  topCharacters,
  isHellMode = false,
  remainingHours = 24,
  onRefreshLeaderboard,
  reducedMotion = false,
}) => {
  const { playingId, playVoice, stopVoice } = useCharacterVoice();

  // Format current/latest update timestamp to be fixed at 00:00 every day
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `00:00 - ${day}/${month}/${year}`;
  });

  // Update time periodically to keep it current with the day rollover
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setLastUpdated(`00:00 - ${day}/${month}/${year}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const scrollToChar = (characterId: string) => {
    const el = document.getElementById(`char-${characterId}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });

      el.classList.add('ring-4', isHellMode ? 'ring-red-500' : 'ring-pink-500', 'ring-offset-2', 'transition-all', 'duration-300');
      setTimeout(() => {
        el.classList.remove('ring-4', isHellMode ? 'ring-red-500' : 'ring-pink-500', 'ring-offset-2');
      }, 1500);
    }
  };

  const medals = isHellMode
    ? [
        {
          rank: 1,
          name: 'Diêm Vương Tối Cao',
          badgeClass: 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white border-amber-300 shadow-md',
          borderClass: 'border-amber-400 ring-4 ring-red-500/80 shadow-[0_0_30px_rgba(220,38,38,0.8)]',
          crownIcon: '👑',
          crownColor: 'text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.9)]',
          stepHeight: 'h-40 sm:h-52 md:h-60',
          orderClass: 'order-2 z-10',
          stepBg: 'bg-gradient-to-t from-black via-purple-950 to-red-800 border-t-4 border-amber-400 shadow-[0_0_25px_rgba(220,38,38,0.6)]',
          podiumCapBg: 'bg-gradient-to-r from-red-600 via-amber-400 to-purple-600 border-b-2 border-red-950',
          numColor: 'text-amber-400/40',
          avatarSize: 'w-22 h-22 sm:w-28 sm:h-28 md:w-34 md:h-34',
          isChampion: true,
          rankTitle: 'DIÊM VƯƠNG QUÁN QUÂN',
          btnGradient: 'from-red-600 via-purple-600 to-amber-500 hover:from-red-500 hover:to-purple-500 text-white border-amber-200 shadow-[0_4px_15px_rgba(220,38,38,0.7)]',
        },
        {
          rank: 2,
          name: 'Phán Quan Hắc Ám',
          badgeClass: 'bg-gradient-to-r from-purple-900 via-red-950 to-purple-900 text-purple-200 border-purple-400/60 shadow-md',
          borderClass: 'border-purple-400 ring-2 ring-red-500/60 shadow-[0_0_20px_rgba(168,85,247,0.6)]',
          crownIcon: '⚖️',
          crownColor: 'text-purple-300 drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)]',
          stepHeight: 'h-28 sm:h-38 md:h-46',
          orderClass: 'order-3',
          stepBg: 'bg-gradient-to-t from-black via-[#1c0828] to-purple-800 border-t-4 border-purple-400',
          podiumCapBg: 'bg-gradient-to-r from-purple-800 via-red-700 to-purple-800 border-b-2 border-black',
          numColor: 'text-purple-400/35',
          avatarSize: 'w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28',
          isChampion: false,
          rankTitle: 'PHÁN QUAN Á QUÂN',
          btnGradient: 'from-purple-800 via-red-800 to-purple-800 hover:from-purple-700 hover:to-red-700 text-purple-100 border-purple-400 shadow-[0_4px_12px_rgba(168,85,247,0.4)]',
        },
        {
          rank: 3,
          name: 'Vô Thường Huyết Ma',
          badgeClass: 'bg-gradient-to-r from-red-950 via-purple-950 to-rose-950 text-rose-200 border-red-600 shadow-md',
          borderClass: 'border-rose-500 ring-2 ring-purple-500/50 shadow-[0_0_18px_rgba(220,38,38,0.5)]',
          crownIcon: '🏮',
          crownColor: 'text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.7)]',
          stepHeight: 'h-20 sm:h-28 md:h-36',
          orderClass: 'order-1',
          stepBg: 'bg-gradient-to-t from-black via-purple-950 to-red-900 border-t-4 border-rose-500',
          podiumCapBg: 'bg-gradient-to-r from-rose-700 via-purple-700 to-red-800 border-b-2 border-black',
          numColor: 'text-rose-400/35',
          avatarSize: 'w-16 h-16 sm:w-22 sm:h-22 md:w-26 md:h-26',
          isChampion: false,
          rankTitle: 'VÔ THƯỜNG HẠNG 3',
          btnGradient: 'from-red-700 via-purple-700 to-rose-700 hover:from-red-600 hover:to-purple-600 text-white border-rose-300 shadow-[0_4px_12px_rgba(220,38,38,0.4)]',
        },
      ]
    : [
        {
          rank: 1,
          name: 'Vua Robux',
          badgeClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-amber-200 shadow-md',
          borderClass: 'border-yellow-400 ring-4 ring-amber-300/60 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
          crownIcon: '👑',
          crownColor: 'text-amber-500 drop-shadow-[0_4px_8px_rgba(245,158,11,0.7)]',
          stepHeight: 'h-40 sm:h-52 md:h-60',
          orderClass: 'order-2 z-10',
          stepBg: 'bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 border-t-4 border-yellow-200',
          podiumCapBg: 'bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 border-b-2 border-amber-500/40',
          numColor: 'text-amber-950/35',
          avatarSize: 'w-22 h-22 sm:w-28 sm:h-28 md:w-34 md:h-34',
          isChampion: true,
          rankTitle: 'QUÁN QUÂN',
          btnGradient: 'from-amber-500 via-orange-400 to-amber-500 hover:from-amber-400 hover:to-orange-300 text-amber-950 border-amber-200 shadow-[0_4px_15px_rgba(245,158,11,0.5)]',
        },
        {
          rank: 2,
          name: 'Á Quân Phú Hào',
          badgeClass: 'bg-gradient-to-r from-slate-200 via-white to-slate-300 text-slate-800 border-slate-200 shadow-md',
          borderClass: 'border-slate-300 ring-2 ring-slate-200/80 shadow-[0_0_18px_rgba(148,163,184,0.4)]',
          crownIcon: '🥈',
          crownColor: 'text-slate-400 drop-shadow-[0_2px_6px_rgba(148,163,184,0.6)]',
          stepHeight: 'h-28 sm:h-38 md:h-46',
          orderClass: 'order-3',
          stepBg: 'bg-gradient-to-t from-slate-500 via-slate-300 to-slate-100 border-t-4 border-white',
          podiumCapBg: 'bg-gradient-to-r from-slate-100 via-white to-slate-200 border-b-2 border-slate-400/40',
          numColor: 'text-slate-700/30',
          avatarSize: 'w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28',
          isChampion: false,
          rankTitle: 'Á QUÂN',
          btnGradient: 'from-sky-500 via-indigo-500 to-sky-500 hover:from-sky-400 hover:to-indigo-400 text-white border-sky-200 shadow-[0_4px_12px_rgba(14,165,233,0.4)]',
        },
        {
          rank: 3,
          name: 'Quý Tộc Robux',
          badgeClass: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-100 border-amber-500 shadow-md',
          borderClass: 'border-amber-600 ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(180,83,9,0.35)]',
          crownIcon: '🥉',
          crownColor: 'text-amber-700 drop-shadow-[0_2px_6px_rgba(180,83,9,0.6)]',
          stepHeight: 'h-20 sm:h-28 md:h-36',
          orderClass: 'order-1',
          stepBg: 'bg-gradient-to-t from-amber-900 via-amber-700 to-amber-500 border-t-4 border-amber-300',
          podiumCapBg: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 border-b-2 border-amber-800/40',
          numColor: 'text-amber-950/30',
          avatarSize: 'w-16 h-16 sm:w-22 sm:h-22 md:w-26 md:h-26',
          isChampion: false,
          rankTitle: 'HẠNG 3',
          btnGradient: 'from-pink-500 via-rose-500 to-pink-500 hover:from-pink-400 hover:to-rose-400 text-white border-pink-200 shadow-[0_4px_12px_rgba(244,63,94,0.4)]',
        },
      ];

  const rank1 = topCharacters[0];
  const rank2 = topCharacters[1];
  const rank3 = topCharacters[2];

  const podiumArray = [
    { character: rank3, medal: medals[2] },
    { character: rank1, medal: medals[0] },
    { character: rank2, medal: medals[1] },
  ];

  return (
    <section className="w-full relative overflow-hidden">
      {/* Decorative Floating Elements in Background */}
      <div className={`absolute top-2 left-6 opacity-60 pointer-events-none ${!reducedMotion ? 'animate-twinkle' : ''} ${isHellMode ? 'text-purple-400' : 'text-amber-300'}`}>
        {isHellMode ? <Sparkles className="w-6 h-6 fill-purple-400" /> : <Sparkles className="w-6 h-6" />}
      </div>
      <div className={`absolute top-8 right-8 opacity-70 pointer-events-none ${!reducedMotion ? 'animate-twinkle-delay' : ''} ${isHellMode ? 'text-amber-400' : 'text-yellow-400'}`}>
        {isHellMode ? <Flame className="w-5 h-5 fill-amber-400" /> : <Star className="w-5 h-5 fill-yellow-300" />}
      </div>

      {/* Section Header with Ranking Banner & Timestamp */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-10 pb-3 border-b ${isHellMode ? 'border-purple-900/50' : 'border-amber-100/60'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white border-2 border-white ring-2 ${
                isHellMode
                  ? 'bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 shadow-lg shadow-purple-600/40 ring-purple-400/60'
                  : 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 shadow-lg shadow-amber-500/35 ring-amber-300/50'
              }`}
            >
              {isHellMode ? (
                <Flame className="w-6 h-6 fill-white stroke-none drop-shadow-sm" />
              ) : (
                <Trophy className="w-6 h-6 fill-white stroke-none drop-shadow-sm" />
              )}
            </div>
            {/* Mini crown/skull badge */}
            <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-xs ${isHellMode ? 'bg-[#0b0517] border border-purple-400' : 'bg-rose-500'}`}>
              {isHellMode ? '👑' : '👑'}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={`text-lg sm:text-2xl font-black tracking-tight flex items-center gap-1.5 ${isHellMode ? 'text-purple-100' : 'text-slate-900'}`}>
                {isHellMode ? 'Đại Ma Vương Robux' : 'Chồng Giàu Robux'}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs border flex items-center gap-1 ${
                  isHellMode
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-amber-950 border-yellow-200'
                }`}
              >
                <Flame className={`w-3 h-3 ${isHellMode ? 'fill-amber-300 text-amber-300' : 'fill-amber-900 text-amber-900'}`} />
                {isHellMode ? 'TOP 3 MA TÔN DẠ NGỤC' : 'TOP 3 PHÚ HÀO'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isHellMode ? 'text-purple-200/80' : 'text-slate-500'}`}>
              {isHellMode
                ? 'Bảng phong thần ma vương thu nạp nhiều Robux cúng tế nhất (+1 R$/lượt)'
                : 'Bảng vàng vinh danh theo số lượng Robux được người chơi cúng dường (+1 R$/lượt)'}
            </p>
          </div>
        </div>

        {/* Updated Timestamp Badge & Real-Time Sync Status */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-white text-xs font-bold shadow-md border backdrop-blur-xs ${
              isHellMode
                ? 'bg-[#0a0416]/90 border-purple-700/80 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/90 border-slate-700/80'
            }`}
          >
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHellMode ? 'bg-purple-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isHellMode ? 'bg-purple-400' : 'bg-emerald-400'}`} />
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              Real-time
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Clock className={`w-3.5 h-3.5 ${isHellMode ? 'text-purple-300' : 'text-amber-400'}`} />
              Chốt vị trí: <span className="text-amber-300 font-bold">24h</span> (còn ~{remainingHours}h)
            </span>
          </div>

          {onRefreshLeaderboard && (
            <button
              id="btn-refresh-leaderboard-order"
              onClick={onRefreshLeaderboard}
              title="Cập nhật lại thứ hạng Top 3 ngay lập tức"
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isHellMode
                  ? 'bg-purple-950/80 hover:bg-purple-900 border-purple-700 text-purple-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Cập nhật hạng</span>
            </button>
          )}
        </div>
      </div>

      {/* Podium Layout */}
      <div className="flex items-end justify-center w-full max-w-4xl mx-auto px-1 sm:px-4 mt-6 sm:mt-10">
        {podiumArray.map((item, idx) => {
          if (!item.character) return <div key={idx} className="flex-1" />;

          const { character, medal } = item;

          return (
            <div key={character.id} className={`flex flex-col items-center flex-1 w-1/3 ${medal.orderClass} relative`}>
              {/* Champion Radiant Light / Flame Glow (Rank 1 Only) */}
              {medal.isChampion && (
                <div className="absolute -top-16 inset-x-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                  <div
                    className={`w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-md ${!reducedMotion ? 'animate-slow-spin' : ''} ${
                      isHellMode
                        ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/35 via-purple-600/25 to-transparent'
                        : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/40 via-yellow-200/20 to-transparent'
                    }`}
                  />
                  <div className={`absolute w-36 h-36 sm:w-52 sm:h-52 rounded-full blur-2xl pointer-events-none ${isHellMode ? 'bg-purple-600/25' : 'bg-yellow-300/30'}`} />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (4 - medal.rank) * 0.15, type: 'spring', stiffness: 100 }}
                className={`relative flex flex-col items-center w-full mb-3 sm:mb-4 px-1 ${
                  medal.isChampion && !reducedMotion ? 'animate-champion-float' : ''
                }`}
              >
                {/* Crown / Flame Indicator */}
                <div className={`absolute -top-8 sm:-top-11 z-20 flex flex-col items-center ${medal.crownColor}`}>
                  <span className="text-3xl sm:text-5xl filter drop-shadow-md select-none transform hover:scale-110 transition-transform">
                    {medal.crownIcon}
                  </span>
                </div>

                {/* Avatar Ring with Metallic / Flame Bevel */}
                <div
                  onClick={() => {
                    if (!character.voiceUrl) return;
                    if (playingId === character.id) {
                      stopVoice();
                    } else {
                      playVoice(character);
                    }
                  }}
                  title={
                    character.voiceUrl
                      ? playingId === character.id
                        ? 'Bấm để dừng giọng nói'
                        : `🎙️ Bấm nghe giọng của ${character.name}`
                      : character.name
                  }
                  className={`relative ${medal.avatarSize} rounded-full border-4 ${
                    playingId === character.id
                      ? 'border-red-500 ring-4 ring-red-400 ring-offset-2 animate-pulse'
                      : medal.borderClass
                  } ${isHellMode ? 'bg-black' : 'bg-white'} flex items-center justify-center z-10 p-0.5 sm:p-1 transition-transform hover:scale-105 cursor-pointer group/avatar`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-slate-900">
                    {character.avatarUrl ? (
                      <img
                        src={character.avatarUrl}
                        alt={character.name}
                        className="w-full h-full object-cover object-[center_15%]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Sparkles className="m-auto w-6 h-6 text-slate-500 mt-4" />
                    )}

                    {/* Speaking / Audio Overlay on Podium */}
                    {character.voiceUrl && (
                      <div
                        className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                          playingId === character.id
                            ? 'opacity-100'
                            : 'opacity-0 group-hover/avatar:opacity-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                          <Volume2 className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    )}

                    {/* Robux Count Pill Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-yellow-300 text-[10px] sm:text-xs font-black text-center pt-2 pb-0.5 flex items-center justify-center gap-1 drop-shadow-sm z-10">
                      <span className="text-orange-400 font-extrabold text-[11px] sm:text-[13px]">
                        {isHellMode ? '🔥' : '💎'}
                      </span>
                      <span>{character.robuxDonations} R$</span>
                    </div>
                  </div>
                </div>

                {/* Character Name */}
                <div className="mt-2.5 sm:mt-3.5 text-center px-1 w-full flex flex-col items-center">
                  <h3 className={`font-black text-xs sm:text-sm md:text-base leading-tight line-clamp-2 w-full drop-shadow-2xs ${isHellMode ? 'text-purple-100' : 'text-slate-900'}`}>
                    {character.name}
                  </h3>
                </div>

                {/* CTA Button: "Tới ngay" */}
                <button
                  onClick={() => scrollToChar(character.id)}
                  className={`mt-2 sm:mt-3 px-2 sm:px-4 py-1.5 sm:py-2 w-[95%] sm:w-[85%] max-w-[140px] rounded-full bg-gradient-to-r ${medal.btnGradient} border font-black text-[11px] sm:text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 group cursor-pointer`}
                >
                  <span className="truncate">Tới ngay</span>
                  <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform shrink-0 stroke-[3]" />
                </button>
              </motion.div>

              {/* 3D Podium Block Base */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                className={`w-[95%] sm:w-[90%] rounded-t-2xl sm:rounded-t-3xl flex flex-col items-center pt-2 sm:pt-3 shadow-lg ${medal.stepBg} ${medal.stepHeight} relative overflow-hidden origin-bottom border-x border-white/20`}
              >
                {/* Shiny Top Cap */}
                <div className={`absolute top-0 inset-x-0 h-3 sm:h-4.5 ${medal.podiumCapBg} shadow-sm z-20 flex items-center justify-center`}>
                  <div className="w-12 sm:w-20 h-0.5 bg-white/60 rounded-full" />
                </div>

                {/* Animated Light Gleam across Podium */}
                {!reducedMotion && (
                  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-podium-gleam" />
                  </div>
                )}

                {/* Giant 3D Rank Number */}
                <div className="mt-3 sm:mt-5 z-10 flex flex-col items-center">
                  <span className={`text-5xl sm:text-7xl md:text-8xl font-black ${medal.numColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] leading-none select-none`}>
                    {medal.rank}
                  </span>

                  {/* Stars / Skulls */}
                  <div className="flex items-center gap-1 mt-1 sm:mt-2 opacity-60">
                    {Array.from({ length: 4 - medal.rank }).map((_, sIdx) =>
                      isHellMode ? (
                        <Sparkles key={sIdx} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-300 text-amber-300" />
                      ) : (
                        <Star key={sIdx} className="w-3 h-3 sm:w-4 sm:h-4 fill-white text-white drop-shadow-2xs" />
                      )
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-4 bg-black/40 pointer-events-none" />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
