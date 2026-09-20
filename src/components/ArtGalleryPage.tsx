import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  Plus,
  ShieldCheck,
  Sparkles,
  Flame,
  X,
  Palette,
  Eye,
  Check,
  Maximize2,
  Calendar,
  User,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { RPCharacter, Artwork } from '../types';
import { MONG_CHE_CHARACTER } from '../data/rpCharacters';
import { RobloxDoodleBackground } from './RobloxDoodleBackground';
import { ArtworkSubmissionModal } from './ArtworkSubmissionModal';
import { MongCheSecretLetterModal } from './MongCheSecretLetterModal';
import { subscribeToArtworks } from '../services/artworksApi';
import { playUiClick, playSparkleSound, playHoverTick } from '../utils/audio';

interface ArtGalleryPageProps {
  onBackToHub: () => void;
  characters: RPCharacter[];
  isHellMode?: boolean;
  soundEnabled?: boolean;
}

const NGOC_HOANG_AVATAR = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

export const ArtGalleryPage: React.FC<ArtGalleryPageProps> = ({
  onBackToHub,
  characters,
  isHellMode = false,
  soundEnabled = true,
}) => {
  // Combine Mộng chè at the very top of all husband filters
  const allCharacters: RPCharacter[] = [
    MONG_CHE_CHARACTER,
    ...characters.filter((c) => c.id !== MONG_CHE_CHARACTER.id),
  ];

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSecretLetterOpen, setIsSecretLetterOpen] = useState(false);
  const [activeLightboxArtwork, setActiveLightboxArtwork] = useState<Artwork | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount when character filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCharacterId]);

  // Subscribe to real-time artworks
  useEffect(() => {
    const unsubscribe = subscribeToArtworks((data) => {
      setArtworks(data);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  // Filter artworks based on selected character
  const filteredArtworks = selectedCharacterId
    ? artworks.filter((item) => item.characterId === selectedCharacterId)
    : artworks;

  const selectedCharacter = allCharacters.find((c) => c.id === selectedCharacterId);

  const handleSelectCharacter = (charId: string | null) => {
    playUiClick(soundEnabled);
    setSelectedCharacterId(charId);
    setIsDropdownOpen(false);
  };

  const handleOpenLightbox = (artwork: Artwork) => {
    playUiClick(soundEnabled);
    playSparkleSound(soundEnabled);
    setActiveLightboxArtwork(artwork);
  };

  const handleArtworkSubmitted = (newArtwork: Artwork) => {
    setArtworks((prev) => [newArtwork, ...prev.filter((a) => a.id !== newArtwork.id)]);
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden select-none font-dessert"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. Dynamic Blurred Roblox Doodle Background */}
      <RobloxDoodleBackground isHellMode={isHellMode} />

      {/* 2. Top Navigation Bar for Phòng Tranh */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b-2 shadow-lg ${
          isHellMode
            ? 'bg-[#140118]/98 border-red-800/80 text-purple-100 shadow-[0_4px_30px_rgba(220,38,38,0.35)]'
            : 'bg-gradient-to-r from-amber-50/98 via-white/98 to-sky-50/98 border-amber-300/80 text-slate-800 shadow-[0_4px_25px_rgba(245,158,11,0.18)]'
        }`}
      >
        {/* Subtle decorative top shimmer highlight bar */}
        <div
          className={`h-0.5 w-full ${
            isHellMode
              ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
              : 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
          }`}
        />

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left: Sleek "Quay lại" Button */}
          <button
            onClick={() => {
              playUiClick(soundEnabled);
              onBackToHub();
            }}
            title="Quay lại Hub chính"
            className={`group px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm border flex items-center gap-1 sm:gap-2 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
              isHellMode
                ? 'bg-gradient-to-r from-red-950 to-purple-950 hover:from-red-900 hover:to-purple-900 border-red-700/60 text-red-200 hover:text-white'
                : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-sky-400 text-white shadow-sky-500/20'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
            <span className="whitespace-nowrap">Quay lại</span>
          </button>

          {/* Center: Luxury Vivaldi Font Title with Sparkling Flanks */}
          <div className="flex items-center justify-center min-w-0 flex-1 px-0.5 text-center">
            <div className="flex flex-col items-center justify-center min-w-0">
              <div className="flex items-center justify-center gap-1 sm:gap-3">
                <Sparkles
                  className={`w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 animate-pulse ${
                    isHellMode
                      ? 'text-amber-300 fill-amber-400'
                      : 'text-amber-500 fill-amber-400'
                  }`}
                />
                <h1
                  style={{
                    fontFamily: "'Vivaldi', 'Great Vibes', 'Brush Script MT', 'Dancing Script', cursive",
                  }}
                  className={`text-xl sm:text-3xl md:text-4xl font-normal tracking-wide leading-none truncate px-0.5 sm:px-1 ${
                    isHellMode
                      ? 'text-amber-300 drop-shadow-[0_2px_12px_rgba(239,68,68,0.7)]'
                      : 'text-[#d97706] drop-shadow-[0_2px_8px_rgba(217,119,6,0.3)]'
                  }`}
                >
                  Phòng Tranh
                </h1>
                <Sparkles
                  className={`w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 animate-pulse ${
                    isHellMode
                      ? 'text-amber-300 fill-amber-400'
                      : 'text-amber-500 fill-amber-400'
                  }`}
                />
              </div>
              <span className="hidden sm:inline text-[11px] font-bold text-slate-500 dark:text-purple-300/80 truncate mt-0.5">
                Không gian trưng bày tranh vẽ các anh chồng
              </span>
            </div>
          </div>

          {/* Right: Invisible balance spacer so title remains perfectly centered */}
          <div className="w-[74px] sm:w-[100px] shrink-0 pointer-events-none" aria-hidden="true" />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 py-3 sm:py-6">
        {/* 3. HEADER ANNOUNCEMENT BANNER WITH NGỌC HOÀNG */}
        <div className="w-full mb-4 sm:mb-8">
          <div
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 border-2 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center gap-3 sm:gap-6 ${
              isHellMode
                ? 'bg-gradient-to-r from-[#200524]/90 via-[#2f082e]/85 to-[#1c041f]/90 border-red-700/80 text-purple-100 shadow-[0_0_30px_rgba(220,38,38,0.35)]'
                : 'bg-gradient-to-r from-white/95 via-sky-50/90 to-amber-50/95 border-amber-300/80 text-slate-800 shadow-[0_6px_25px_rgba(245,158,11,0.25)]'
            }`}
          >
            {/* Left: Avatar of Ngọc Hoàng with Crown/Sparkle */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 border-2 shadow-lg relative ${
                  isHellMode
                    ? 'bg-gradient-to-br from-red-600 via-purple-600 to-amber-500 border-red-300'
                    : 'bg-gradient-to-br from-yellow-300 via-amber-400 to-sky-300 border-white'
                }`}
              >
                <img
                  src={NGOC_HOANG_AVATAR}
                  alt="Ngọc Hoàng"
                  className="w-full h-full object-cover rounded-[10px] sm:rounded-[12px] select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                {/* Crown / Sparkle badge */}
                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md text-[10px] sm:text-xs">
                  👑
                </div>
              </div>
            </div>

            {/* Right: Notice & Strict Anti-AI Rules */}
            <div className="flex-1 text-center md:text-left space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider border shadow-xs mb-0.5 sm:mb-1 bg-amber-400/20 text-amber-800 dark:text-amber-300 border-amber-300/60">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-500" />
                <span>CHỈ DỤ TỪ NGỌC HOÀNG (CHƠI ROBLOX KHUM)</span>
              </div>

              {/* Requirement 3 text lines */}
              <h2
                className={`text-xs sm:text-base md:text-lg font-black leading-snug ${
                  isHellMode ? 'text-amber-200' : 'text-sky-950'
                }`}
              >
                "Nơi các bé iu nhà Roblox thỏa sức sáng tạo và chia sẻ tranh vẽ về các anh chồng! 🎨"
              </h2>

              <p
                className={`text-[11px] sm:text-sm font-bold flex items-center justify-center md:justify-start gap-1 sm:gap-1.5 leading-tight ${
                  isHellMode ? 'text-red-400' : 'text-red-600'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
                <span>CẤM TUYỆT ĐỐI MỌI HÀNH VI FEED AI</span>
              </p>
            </div>

            {/* Anti-AI Stamp Shield */}
            <div
              className={`hidden lg:flex flex-col items-center justify-center p-3 rounded-2xl border-2 text-center shrink-0 ${
                isHellMode
                  ? 'bg-red-950/60 border-red-600/70 text-red-200'
                  : 'bg-red-50/90 border-red-300 text-red-700'
              }`}
            >
              <ShieldCheck className="w-7 h-7 text-red-500 mb-0.5 stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-wider">BẢO VỆ TÁC QUYỀN</span>
              <span className="text-[9px] font-bold">100% ANTI FEED AI</span>
            </div>
          </div>
        </div>

        {/* 5. CHARACTER FILTER & SEARCH (SELECTABLE DROPDOWN LIST - TYPING DISABLED) */}
        <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-8" ref={dropdownRef}>
          <div className="relative">
            <div className="text-[11px] sm:text-xs font-black text-slate-500 dark:text-purple-300 mb-1 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-500" />
                <span>Tìm kiếm theo Chồng:</span>
              </span>
              {selectedCharacterId && (
                <button
                  onClick={() => handleSelectCharacter(null)}
                  className="text-sky-600 hover:text-sky-700 dark:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>

            {/* Search Trigger Bar (Typing is DISABLED as instructed) */}
            <button
              id="btn-search-husband-dropdown"
              type="button"
              onClick={() => {
                playHoverTick(soundEnabled);
                setIsDropdownOpen((prev) => !prev);
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 shadow-lg backdrop-blur-md flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer ${
                selectedCharacterId === MONG_CHE_CHARACTER.id
                  ? 'bg-gradient-to-r from-pink-100/95 via-purple-100/95 to-amber-100/95 dark:from-[#2a0429] dark:via-[#1c021f] dark:to-[#18031d] border-pink-400 dark:border-pink-500 shadow-[0_0_20px_rgba(244,114,182,0.35)]'
                  : isHellMode
                  ? 'bg-[#18031d]/90 hover:bg-[#200525] border-red-900/80 text-purple-100'
                  : 'bg-white/95 hover:bg-white border-white hover:border-sky-300 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedCharacter ? (
                  <>
                    <div className="relative shrink-0 w-7 h-7 sm:w-8 sm:h-8">
                      {selectedCharacter.id === MONG_CHE_CHARACTER.id && (
                        <div
                          className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-rose-500 animate-spin opacity-85 blur-2xs"
                          style={{ animationDuration: '3s' }}
                        />
                      )}
                      <img
                        src={selectedCharacter.avatarUrl}
                        alt={selectedCharacter.name}
                        className={`relative w-full h-full rounded-full object-cover border-2 shrink-0 ${
                          selectedCharacter.id === MONG_CHE_CHARACTER.id
                            ? 'border-white'
                            : 'border-amber-400'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      {selectedCharacter.id === MONG_CHE_CHARACTER.id && (
                        <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
                      )}
                    </div>
                    <div className="truncate">
                      <span
                        className={`text-xs sm:text-sm font-black block truncate ${
                          selectedCharacter.id === MONG_CHE_CHARACTER.id
                            ? 'text-pink-600 dark:text-pink-300 flex items-center gap-1'
                            : 'text-amber-600 dark:text-amber-300'
                        }`}
                      >
                        {selectedCharacter.name}
                        {selectedCharacter.id === MONG_CHE_CHARACTER.id && (
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0 inline" />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-purple-300/70 block truncate">
                        {selectedCharacter.roleTag || 'Chồng Roblox'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-purple-300/60 truncate">
                      Bấm để chọn anh chồng hoặc Mộng chè cần xem tranh...
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedCharacterId && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border ${
                      selectedCharacterId === MONG_CHE_CHARACTER.id
                        ? 'bg-pink-500 text-white border-pink-300'
                        : 'bg-amber-400/20 text-amber-800 dark:text-amber-200 border-amber-300/50'
                    }`}
                  >
                    {selectedCharacterId === MONG_CHE_CHARACTER.id ? '👑 Mộng Chè' : 'Đang lọc'}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Selectable Dropdown Menu of All Characters */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border-2 shadow-2xl z-50 max-h-80 overflow-y-auto p-2 backdrop-blur-xl ${
                    isHellMode
                      ? 'bg-[#18031d]/98 border-red-800 text-purple-100'
                      : 'bg-white/98 border-sky-300 text-slate-800'
                  }`}
                >
                  {/* Option 0: All Characters */}
                  <button
                    onClick={() => handleSelectCharacter(null)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      selectedCharacterId === null
                        ? 'bg-amber-400/20 text-amber-900 dark:text-amber-300 font-black'
                        : 'hover:bg-slate-100 dark:hover:bg-purple-950/50 font-bold text-xs sm:text-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">✨</span>
                      <span>Tất cả các chồng ({artworks.length} tranh)</span>
                    </div>
                    {selectedCharacterId === null && <Check className="w-4 h-4 text-amber-500" />}
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-purple-900/40" />

                  {/* Character list with Mộng chè at index 0 */}
                  {allCharacters.map((char) => {
                    const count = artworks.filter((a) => a.characterId === char.id).length;
                    const isSelected = selectedCharacterId === char.id;
                    const isMongChe = char.id === MONG_CHE_CHARACTER.id;

                    return (
                      <button
                        key={char.id}
                        onClick={() => handleSelectCharacter(char.id)}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer mb-1 ${
                          isMongChe
                            ? isSelected
                              ? 'bg-gradient-to-r from-pink-500/25 to-amber-500/25 border-2 border-pink-400 dark:border-pink-500 text-pink-700 dark:text-pink-200 font-black shadow-sm'
                              : 'bg-gradient-to-r from-pink-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-amber-500/20 border border-pink-300/60 dark:border-pink-500/40 text-pink-700 dark:text-pink-300 font-bold'
                            : isSelected
                            ? 'bg-sky-100 dark:bg-red-950/80 text-sky-950 dark:text-red-200 font-black'
                            : 'hover:bg-slate-100 dark:hover:bg-purple-950/50 font-bold text-xs sm:text-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0 w-7 h-7">
                            {isMongChe && (
                              <div
                                className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-rose-500 animate-spin opacity-85 blur-2xs"
                                style={{ animationDuration: '3s' }}
                              />
                            )}
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              loading="lazy"
                              decoding="async"
                              className={`relative w-full h-full rounded-full object-cover border shrink-0 ${
                                isMongChe ? 'border-white' : 'border-amber-300'
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            {isMongChe && (
                              <span className="absolute -top-1 -right-1 text-[9px]">👑</span>
                            )}
                          </div>
                          <div className="truncate">
                            <span
                              className={`block truncate ${
                                isMongChe
                                  ? 'text-pink-600 dark:text-pink-300 font-black flex items-center gap-1'
                                  : ''
                              }`}
                            >
                              {char.name}
                              {isMongChe && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 inline" />}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block truncate">
                              {isMongChe ? 'Ngọc Hoàng / Chơi Roblox Khum 🌸' : char.roleTag || 'Chồng Roblox'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isMongChe && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs">
                              ĐẶC BIỆT
                            </span>
                          )}
                          {count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                              {count} tranh
                            </span>
                          )}
                          {isSelected && (
                            <Check
                              className={`w-4 h-4 ${isMongChe ? 'text-pink-600 dark:text-pink-300' : 'text-sky-500'}`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4. ARTWORK SHOWCASE GRID (Optimized with Chunked Rendering & Lazy Loading) */}
        {filteredArtworks.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredArtworks.slice(0, visibleCount).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative rounded-xl sm:rounded-3xl p-2 sm:p-3 border-2 shadow-md sm:shadow-lg flex flex-col justify-between overflow-hidden transition-all gpu-accelerated content-auto ${
                    isHellMode
                      ? 'bg-[#18031d]/95 border-red-900/70 hover:border-red-500 hover:shadow-[0_8px_30px_rgba(220,38,38,0.4)]'
                      : 'bg-white/95 border-white hover:border-amber-300 hover:shadow-[0_8px_25px_rgba(245,158,11,0.25)]'
                  }`}
                >
                  {/* Visual Picture Frame Wrapper */}
                  <div className="relative w-full aspect-square rounded-lg sm:rounded-2xl overflow-hidden bg-black/10 mb-2 sm:mb-3 border">
                    {/* The Actual Artwork Image with Lazy Loading */}
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title || artwork.characterName}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105 will-change-transform"
                      style={{
                        WebkitTouchCallout: 'none',
                        userSelect: 'none',
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Transparent Protective Shield Overlay */}
                    <div
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleOpenLightbox(artwork)}
                      className="absolute inset-0 z-20 select-none cursor-pointer bg-transparent pointer-events-auto"
                      title="Bấm để xem chi tiết tranh"
                      style={{
                        WebkitTouchCallout: 'none',
                        userSelect: 'none',
                      }}
                    />

                    {/* Corner Badge: Character Name */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 pointer-events-none">
                      <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black bg-black/75 text-white border border-white/30 shadow-xs flex items-center gap-1">
                        <span className="truncate max-w-[85px] sm:max-w-none">{artwork.characterName}</span>
                      </span>
                    </div>

                    {/* Anti-AI Protected Seal Watermark */}
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black bg-red-900/80 text-red-200 border border-red-400/50 flex items-center gap-0.5 sm:gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
                        <span>NO AI</span>
                      </span>
                    </div>

                    {/* Hover Quick View Pill */}
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35">
                      <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black bg-white text-slate-900 shadow-lg flex items-center gap-1 sm:gap-1.5 transform scale-90 group-hover:scale-100 transition-transform">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
                        <span>Xem tranh</span>
                      </span>
                    </div>
                  </div>

                  {/* Artwork Metadata */}
                  <div className="space-y-0.5 sm:space-y-1 text-left px-0.5 sm:px-1">
                    {artwork.title && (
                      <h3
                        className={`text-[11px] sm:text-sm font-black truncate leading-tight ${
                          isHellMode ? 'text-amber-200' : 'text-slate-800'
                        }`}
                        title={artwork.title}
                      >
                        {artwork.title}
                      </h3>
                    )}

                    {artwork.message && (
                      <p
                        className={`text-[10px] sm:text-[11px] line-clamp-1 sm:line-clamp-2 italic font-medium ${
                          isHellMode ? 'text-purple-300/80' : 'text-slate-500'
                        }`}
                        title={artwork.message}
                      >
                        "{artwork.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-0.5 sm:pt-1">
                      {/* Artist name */}
                      <div className="flex items-center gap-1 min-w-0 text-slate-500 dark:text-purple-300">
                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />
                        <span className="truncate font-bold max-w-[70px] sm:max-w-none">{artwork.authorName}</span>
                      </div>

                      {/* Formatted Date */}
                      <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">
                        {new Date(artwork.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Pagination Button */}
            {filteredArtworks.length > visibleCount && (
              <div className="flex justify-center pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    playUiClick(soundEnabled);
                    setVisibleCount((prev) => prev + 12);
                  }}
                  className={`px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2 ${
                    isHellMode
                      ? 'bg-gradient-to-r from-red-900 via-purple-900 to-black hover:from-red-800 hover:to-purple-800 border-red-500 text-red-200 hover:text-white shadow-red-950/60'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-amber-300 text-white shadow-amber-500/30'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Xem thêm tranh ({filteredArtworks.length - visibleCount} tác phẩm còn lại)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div
            className={`w-full py-12 sm:py-16 px-4 rounded-2xl sm:rounded-3xl border-2 text-center backdrop-blur-md max-w-md mx-auto ${
              isHellMode
                ? 'bg-[#1b0320]/80 border-red-900/70 text-purple-200'
                : 'bg-white/85 border-amber-200 text-slate-700'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-400/20 text-amber-600 flex items-center justify-center mx-auto mb-3 text-xl sm:text-2xl">
              🎨
            </div>
            <h3 className="text-sm sm:text-lg font-black mb-1">
              {selectedCharacter
                ? `Chưa có tranh nào cho ${selectedCharacter.name}!`
                : 'Phòng tranh hiện đang trống!'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mb-4 max-w-xs mx-auto leading-normal">
              Hãy là người đầu tiên gửi gắm nét vẽ và lời nhắn yêu thương dành cho các anh chồng nhé!
            </p>
            <button
              onClick={() => {
                playUiClick(soundEnabled);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md active:scale-95 transition-all cursor-pointer hover:from-amber-600 hover:to-orange-600"
            >
              Đăng tranh đầu tiên 🎨
            </button>
          </div>
        )}
      </main>

      {/* 6. FLOATING CIRCULAR UPLOAD BUTTON AT BOTTOM-RIGHT */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          id="btn-floating-upload-artwork"
          onClick={() => {
            playUiClick(soundEnabled);
            setIsUploadModalOpen(true);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          title="Đăng tranh mới vào Phòng Tranh"
          className={`relative group w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl border-2 cursor-pointer transition-all ${
            isHellMode
              ? 'bg-gradient-to-br from-red-600 via-purple-700 to-amber-600 text-white border-amber-300 shadow-red-950/80'
              : 'bg-gradient-to-br from-amber-400 via-orange-500 to-sky-500 text-white border-white shadow-orange-500/50'
          }`}
        >
          {/* Glowing pulse ring */}
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
              isHellMode ? 'bg-red-500' : 'bg-amber-400'
            }`}
          />
          <Plus className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />

          {/* Floating Tooltip */}
          <span className="hidden sm:block absolute right-full mr-3 px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Đăng tranh mới 🎨
          </span>
        </motion.button>
      </div>

      {/* 7. ARTWORK SUBMISSION MODAL */}
      <ArtworkSubmissionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        characters={allCharacters}
        initialSelectedCharId={selectedCharacterId || undefined}
        isHellMode={isHellMode}
        soundEnabled={soundEnabled}
        onArtworkSubmitted={handleArtworkSubmitted}
        onSecretLetterTriggered={() => setIsSecretLetterOpen(true)}
      />

      {/* 8. MỘNG CHÈ SECRET LETTER & KISS EFFECT MODAL */}
      <MongCheSecretLetterModal
        isOpen={isSecretLetterOpen}
        onClose={() => setIsSecretLetterOpen(false)}
        isHellMode={isHellMode}
        soundEnabled={soundEnabled}
      />

      {/* 9. LIGHTBOX / HIGH-RES ARTWORK INSPECTION MODAL (WITH STRICT ANTI-DOWNLOAD SHIELD) */}
      <AnimatePresence>
        {activeLightboxArtwork && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playUiClick(soundEnabled);
                setActiveLightboxArtwork(null);
              }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl"
            />

            {/* Lightbox Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full z-10 flex flex-col items-center my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playUiClick(soundEnabled);
                  setActiveLightboxArtwork(null);
                }}
                className="absolute -top-10 sm:-top-12 right-0 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Picture Frame Container */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-amber-300/80 shadow-2xl bg-black max-h-[72vh] flex items-center justify-center">
                {/* High-res image */}
                <img
                  src={activeLightboxArtwork.imageUrl}
                  alt={activeLightboxArtwork.title || activeLightboxArtwork.characterName}
                  draggable={false}
                  className="max-h-[68vh] w-auto max-w-full object-contain select-none pointer-events-none"
                  style={{
                    WebkitTouchCallout: 'none',
                    userSelect: 'none',
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* INVISIBLE ANTI-DOWNLOAD SHIELD OVER FULLSCREEN IMAGE */}
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute inset-0 z-20 select-none bg-transparent pointer-events-auto"
                  style={{
                    WebkitTouchCallout: 'none',
                    userSelect: 'none',
                  }}
                />

                {/* Anti-AI Seal Overlay */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 pointer-events-none">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black bg-red-950/80 text-red-200 border border-red-500/60 backdrop-blur-md flex items-center gap-1 sm:gap-1.5 shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                    <span>CẤM FEED AI & BẢO VỆ TÁC QUYỀN</span>
                  </span>
                </div>
              </div>

              {/* Painting Info Bar Below */}
              <div className="w-full mt-2.5 sm:mt-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-center sm:text-left">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-lg font-black text-amber-300 truncate">
                    {activeLightboxArtwork.title || `Tranh vẽ ${activeLightboxArtwork.characterName}`}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-3 text-[11px] sm:text-xs text-slate-300 mt-0.5">
                    <span>
                      Chồng: <strong>{activeLightboxArtwork.characterName}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Họa sĩ: <strong>{activeLightboxArtwork.authorName}</strong>
                    </span>
                    <span>•</span>
                    <span>{new Date(activeLightboxArtwork.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {activeLightboxArtwork.message && (
                    <div className="mt-1.5 sm:mt-2 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] sm:text-xs text-amber-100/95 font-medium italic">
                      💬 "{activeLightboxArtwork.message}"
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: "'Byron', 'Cormorant Garamond', 'EB Garamond', 'Playfair Display', 'Cinzel', 'Great Vibes', 'Nunito', serif, cursive",
                  }}
                  className="text-[10px] sm:text-xs text-amber-200/90 font-medium italic shrink-0 px-1"
                >
                  "Gửi trao một mối chân tình, Đổi về trọn vẹn bóng hình người thương."
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtGalleryPage;
