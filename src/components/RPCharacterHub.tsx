import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sparkles, Users, Search, X, Flame, SunMedium, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RPCharacter } from '../types';
import { RPTopNavBar } from './RPTopNavBar';
import { RPRichLeaderboard } from './RPRichLeaderboard';
import { RPCharacterCard } from './RPCharacterCard';
import { VinylRecordButton } from './VinylRecordButton';
import { GachaWheelBanner } from './GachaWheelBanner';
import { GachaModal } from './GachaModal';
import { RobloxBackground } from './RobloxBackground';
import { HellBackground } from './HellBackground';
import { AgeVerificationModal } from './AgeVerificationModal';
import { HellFallingOverlay } from './HellFallingOverlay';
import { ActiveVoiceBanner } from './ActiveVoiceBanner';
import { AnnouncementBanner } from './AnnouncementBanner';
import { NgocHoangCloudModal } from './NgocHoangCloudModal';
import { RapunzelTributeFooter } from './RapunzelTributeFooter';
import { PasswordModal } from './PasswordModal';
import { CocKienTroiModal } from './CocKienTroiModal';
import { ArtGalleryEntranceCard } from './ArtGalleryEntranceCard';
import { ArtGalleryPage } from './ArtGalleryPage';
import {
  getStoredRPCharacters,
  saveStoredRPCharacters,
} from '../data/rpCharacters';
import {
  fetchAllRobuxCounts,
  fetchDeviceVotes,
  upvoteCharacterRobux,
  subscribeToRobuxCounts,
} from '../services/robuxApi';
import { subscribeToAllCommentCounts } from '../services/commentsApi';
import {
  getLeaderboardSnapshot,
  forceRefreshLeaderboardSnapshot,
} from '../utils/leaderboardSnapshot';
import {
  isCharacterVotedLocally,
  getLocalVotedCharactersList,
} from '../utils/fingerprint';
import {
  playUiClick,
  playRobuxDonateSound,
  playReturnToHeaven,
} from '../utils/audio';

interface RPCharacterHubProps {
  onBackToWelcome?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const RPCharacterHub: React.FC<RPCharacterHubProps> = ({
  onBackToWelcome,
  soundEnabled,
  onToggleSound,
}) => {
  const [characters, setCharacters] = useState<RPCharacter[]>(() => getStoredRPCharacters());
  const [votedIds, setVotedIds] = useState<string[]>(() =>
    getLocalVotedCharactersList(getStoredRPCharacters().map((c) => c.id))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'hiendai' | 'hocduong' | 'cotrang' | 'vnxua' | 'ngot' | 'nguoc' | 'khac' | 'f7'>('all');
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [isNgocHoangModalOpen, setIsNgocHoangModalOpen] = useState(false);

  // NSFW / Hell Realm State (Always defaults to false / Hạ Giới on fresh visit or entering game)
  const [isHellMode, setIsHellMode] = useState<boolean>(false);
  const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState(false);
  const [isFallingOverlayActive, setIsFallingOverlayActive] = useState(false);

  // Password Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedPasswordChar, setSelectedPasswordChar] = useState<RPCharacter | null>(null);

  // Cóc Kiện Trời Modal states (Đánh trống xin gợi ý password)
  const [isCocKienTroiOpen, setIsCocKienTroiOpen] = useState(false);
  const [cocKienTroiCharId, setCocKienTroiCharId] = useState<string>('char-11-lucifer');

  // Phòng Tranh (Art Gallery) Page state - default to false so app always enters Home Hub first
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleOpenGallery = () => {
    playUiClick(soundEnabled);
    setIsGalleryOpen(true);
  };

  const handleCloseGallery = () => {
    playUiClick(soundEnabled);
    setIsGalleryOpen(false);
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth >= 640 ? 20 : 10);
  // Real-time comment counts map
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 640 ? 20 : 10);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset page to 1 when filters or mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, isHellMode]);

  // Sync data from centralized database
  const syncServerData = useCallback(async () => {
    try {
      const [counts, serverVotes] = await Promise.all([
        fetchAllRobuxCounts(),
        fetchDeviceVotes(),
      ]);

      // Update character counts if returned
      if (counts && Object.keys(counts).length > 0) {
        setCharacters((prev) => {
          const updated = prev.map((char) => ({
            ...char,
            robuxDonations: typeof counts[char.id] === 'number' ? counts[char.id] : (char.robuxDonations || 0),
          }));
          saveStoredRPCharacters(updated);
          return updated;
        });
      }

      // Update voted list for this device
      if (serverVotes && serverVotes.length > 0) {
        setVotedIds((prev) => {
          const combined = Array.from(new Set([...prev, ...serverVotes]));
          return combined;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Đồng bộ thời gian thực (Real-time Sync qua Firestore onSnapshot)
  useEffect(() => {
    // 1. Initial snapshot data fetch
    syncServerData();

    // 2. Real-time Firestore snapshot listener: Nhận dữ liệu cập nhật tức thì từ Firestore
    const unsubscribeRobux = subscribeToRobuxCounts((newCounts) => {
      setCharacters((prev) => {
        let changed = false;
        const updated = prev.map((char) => {
          if (typeof newCounts[char.id] === 'number' && newCounts[char.id] !== char.robuxDonations) {
            changed = true;
            return { ...char, robuxDonations: newCounts[char.id] };
          }
          return char;
        });
        if (changed) {
          saveStoredRPCharacters(updated);
          return updated;
        }
        return prev;
      });
    });

    // 3. Real-time Comment Counts listener
    const unsubscribeComments = subscribeToAllCommentCounts((counts) => {
      setCommentCounts(counts);
    });

    return () => {
      unsubscribeRobux();
      unsubscribeComments();
    };
  }, [syncServerData]);

  // Handle Robux Donation with Anonymous Device Fingerprinting & Real-Time Sync
  const handleDonateRobux = async (characterId: string) => {
    // Check if already voted on this device
    if (votedIds.includes(characterId) || isCharacterVotedLocally(characterId)) {
      return;
    }

    // Optimistic UI update
    playRobuxDonateSound(soundEnabled);
    setVotedIds((prev) => Array.from(new Set([...prev, characterId])));
    setCharacters((prev) => {
      const updated = prev.map((char) => {
        if (char.id === characterId) {
          const next = (char.robuxDonations || 0) + 1;
          return { ...char, robuxDonations: next };
        }
        return char;
      });
      saveStoredRPCharacters(updated);
      return updated;
    });

    // Send to central backend database
    try {
      const result = await upvoteCharacterRobux(characterId);
      if (result.success && typeof result.totalRobux === 'number') {
        setCharacters((prev) => {
          const updated = prev.map((char) => {
            if (char.id === characterId) {
              return { ...char, robuxDonations: result.totalRobux };
            }
            return char;
          });
          saveStoredRPCharacters(updated);
          return updated;
        });
      }
      if (result.votedCharacters) {
        setVotedIds((prev) => Array.from(new Set([...prev, ...result.votedCharacters])));
      }
    } catch {
      // Local optimistic state already applied
    }
  };

  // Trigger Hell Mode Confirmation flow
  const handleOpenAgeVerification = () => {
    setIsAgeVerificationOpen(true);
  };

  const handleConfirmHellMode = () => {
    setIsAgeVerificationOpen(false);
    setIsHellMode(true);
    setIsFallingOverlayActive(true);
    try {
      sessionStorage.setItem('roblox_rp_hell_mode', 'true');
    } catch {
      // ignore
    }
  };

  const handleFallingOverlayComplete = useCallback(() => {
    setIsFallingOverlayActive(false);
    setIsHellMode(true);
    try {
      sessionStorage.setItem('roblox_rp_hell_mode', 'true');
    } catch {
      // ignore
    }
  }, []);

  const handleReturnToEarth = useCallback(() => {
    playReturnToHeaven(soundEnabled);
    setIsHellMode(false);
    try {
      sessionStorage.setItem('roblox_rp_hell_mode', 'false');
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Characters active in current mode (in Hell Mode, remove Yuuma and Rex)
  const activeModeCharacters = useMemo(() => {
    if (!isHellMode) return characters;
    return characters.filter((c) => {
      const lowerId = c.id.toLowerCase();
      const lowerName = c.name.toLowerCase();
      const isYuuma = lowerId.includes('yuuma') || lowerName.includes('yuuma');
      const isRex = lowerId.includes('rex') || lowerName.includes('rex');
      return !isYuuma && !isRex;
    });
  }, [characters, isHellMode]);

  // Sorted by Robux donations descending for Leaderboard
  const sortedByRobux = useMemo(() => {
    return [...activeModeCharacters].sort((a, b) => b.robuxDonations - a.robuxDonations);
  }, [activeModeCharacters]);

  // 24-Hour Leaderboard Snapshot (Tự động cập nhật thứ hạng top 3 sau 24 tiếng để tránh lag nhảy vị trí)
  const [leaderboardInfo, setLeaderboardInfo] = useState(() => {
    const currentSortedIds = [...activeModeCharacters]
      .sort((a, b) => b.robuxDonations - a.robuxDonations)
      .map((c) => c.id);
    return getLeaderboardSnapshot(currentSortedIds);
  });

  // Tự động kiểm tra chu kỳ 24 giờ khi số tim thay đổi
  useEffect(() => {
    const currentSortedIds = sortedByRobux.map((c) => c.id);
    const snap = getLeaderboardSnapshot(currentSortedIds);
    setLeaderboardInfo(snap);
  }, [sortedByRobux]);

  // Cho phép người dùng bấm nút cập nhật lại thứ hạng Top 3 ngay lập tức nếu muốn
  const handleForceRefreshLeaderboard = () => {
    playUiClick(soundEnabled);
    const currentSortedIds = sortedByRobux.map((c) => c.id);
    const snap = forceRefreshLeaderboardSnapshot(currentSortedIds);
    setLeaderboardInfo(snap);
  };

  // Top 3 nhân vật cho Bảng Xếp Hạng theo vị trí chốt 24h (Số tim vẫn nhảy real-time từ Firestore)
  const top3LeaderboardCharacters = useMemo(() => {
    const map = new Map(activeModeCharacters.map((c) => [c.id, c]));
    const list = leaderboardInfo.topIds.map((id) => map.get(id)).filter(Boolean) as RPCharacter[];
    if (list.length < 3) {
      return sortedByRobux.slice(0, 3);
    }
    return list;
  }, [activeModeCharacters, leaderboardInfo.topIds, sortedByRobux]);

  // Filtered characters for "Các chồng" section
  const filteredCharacters = useMemo(() => {
    return activeModeCharacters.filter((char) => {
      const matchSearch =
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.roleTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.plotSummary && char.plotSummary.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeCategory === 'hiendai') return char.tags?.some((t) => t.toLowerCase() === 'hiện đại');
      if (activeCategory === 'hocduong') return char.tags?.some((t) => t.toLowerCase() === 'học đường');
      if (activeCategory === 'cotrang') return char.tags?.some((t) => t.toLowerCase() === 'cổ trang');
      if (activeCategory === 'vnxua') return char.tags?.some((t) => t.toLowerCase() === 'vn xưa');
      if (activeCategory === 'ngot') return char.tags?.some((t) => t.toLowerCase() === 'ngọt');
      if (activeCategory === 'nguoc') return char.tags?.some((t) => t.toLowerCase() === 'ngược');
      if (activeCategory === 'khac') return char.tags?.some((t) => t.toLowerCase() === 'khác');
      if (activeCategory === 'f7') return char.tags?.some((t) => t.toLowerCase() === 'f7 big wrongs');

      return true;
    });
  }, [activeModeCharacters, searchQuery, activeCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
  
  const paginatedCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCharacters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCharacters, currentPage, itemsPerPage]);

  // Quick Open Plot
  const handleReadPlot = (char: RPCharacter) => {
    playUiClick(soundEnabled);
    if (char.plotUrl) {
      window.open(char.plotUrl, '_blank');
    }
  };

  // Quick Open Play
  const handlePlay = (char: RPCharacter) => {
    playUiClick(soundEnabled);
    if (char.password) {
      setSelectedPasswordChar(char);
      setIsPasswordModalOpen(true);
      return;
    }

    if (char.playUrl) {
      window.open(char.playUrl, '_blank');
    }
  };

  // Open Cóc Kiện Trời Modal
  const handleOpenCocKienTroi = (char?: RPCharacter) => {
    playUiClick(soundEnabled);
    if (char?.id) {
      setCocKienTroiCharId(char.id);
    }
    setIsCocKienTroiOpen(true);
  };

  // Select and scroll to character from Gacha
  const handleSelectFromGacha = (char: RPCharacter) => {
    setSearchQuery('');
    setActiveCategory('all');
    setIsGachaOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`char-${char.id}`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
        el.classList.add('ring-4', isHellMode ? 'ring-red-500' : 'ring-pink-500', 'ring-offset-4', 'transition-all', 'duration-300');
        setTimeout(() => {
          el.classList.remove('ring-4', isHellMode ? 'ring-red-500' : 'ring-pink-500', 'ring-offset-4');
        }, 2000);
      }
    }, 150);
  };

  // Calculate rank lookup map for quick badges based on 24-hour leaderboard snapshot
  const rankMap = useMemo(() => {
    const map = new Map<string, { rank: number; label: string; color: string }>();
    top3LeaderboardCharacters.forEach((char, idx) => {
      map.set(char.id, {
        rank: idx + 1,
        label: `Top ${idx + 1}`,
        color: idx === 0 ? 'amber' : idx === 1 ? 'slate' : 'amber-700',
      });
    });
    return map;
  }, [top3LeaderboardCharacters]);

  if (isGalleryOpen) {
    return (
      <ArtGalleryPage
        onBackToHub={handleCloseGallery}
        characters={characters}
        isHellMode={isHellMode}
        soundEnabled={soundEnabled}
      />
    );
  }

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col font-dessert select-none overflow-x-hidden transition-colors duration-700 ${
        isHellMode ? 'text-purple-100 bg-[#0b020e]' : 'text-slate-800 bg-[#87CEEB]'
      }`}
    >
      {/* Background Switch: Heaven/Meadow vs Hell Landscape */}
      {isHellMode ? <HellBackground /> : <RobloxBackground />}

      {/* 1. TOP NAVIGATION BAR */}
      <RPTopNavBar
        onBackToWelcome={onBackToWelcome}
        votedCount={votedIds.length}
        totalCharacters={characters.length}
        isHellMode={isHellMode}
        onOpenAgeVerification={handleOpenAgeVerification}
        onReturnToEarth={handleReturnToEarth}
        onOpenGallery={handleOpenGallery}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 md:px-12 py-4 sm:py-8">
        {/* Large Header Banner at Top */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b backdrop-blur-xs ${
            isHellMode ? 'border-red-900/50' : 'border-white/30'
          }`}
        >
          <div>
            <div
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black mb-2.5 border-2 shadow-lg backdrop-blur-md transform hover:scale-[1.02] transition-transform select-none ${
                isHellMode
                  ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white border-red-300 ring-2 ring-purple-500/70 shadow-[0_0_20px_rgba(220,38,38,0.7)]'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 border-white ring-2 ring-amber-300/70 shadow-[0_4px_16px_rgba(245,158,11,0.45)]'
              }`}
            >
              <span className="text-sm">{isHellMode ? '🔥' : '💥'}</span>
              <span className="tracking-wide">
                {isHellMode
                  ? 'Độc quyền phân phối ngực Roblox chất lượng cao'
                  : 'Độc quyền phân phối chồng Roblox chất lượng cao'}
              </span>
              {isHellMode ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-400 animate-pulse" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-800 fill-amber-500 animate-pulse" />
              )}
            </div>
            <h1 className="text-white text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight dessert-title-shadow">
              {isHellMode ? 'Hi, my little demon!🔥' : 'Hi, my roblox kid! ✨'}
            </h1>
            <p
              className={`text-xs sm:text-sm md:text-base font-bold mt-1 drop-shadow-xs max-w-2xl ${
                isHellMode ? 'text-purple-200/90' : 'text-white/90'
              }`}
            >
              {isHellMode
                ? 'Dành cho các "dâm" yêu của mộng chè: nơi dục tình nảy nở và thăng hoa'
                : 'Dành cho các đáng yêu của mộng chè: nơi ái tình nảy nở (và Robux)'}
            </p>
          </div>

          {/* Quick Stats & Hell Realm Status Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl backdrop-blur-md border shadow-xs sm:shadow-md flex items-center gap-2 ${
                isHellMode
                  ? 'bg-[#100314]/85 border-red-900/80 text-purple-200 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                  : 'bg-white/90 border-white text-slate-700'
              }`}
            >
              <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] ${isHellMode ? 'text-red-400' : 'text-sky-600'}`} />
              <span className="text-[11px] sm:text-xs font-bold">
                Tổng: <strong className={`text-xs sm:text-sm font-black ${isHellMode ? 'text-amber-300' : 'text-sky-700'}`}>{activeModeCharacters.length}</strong> {isHellMode ? 'chồng damdang' : 'chồng RP'}
              </span>
            </div>
          </div>
        </div>

        {/* PROMINENT SEARCH BAR */}
        <div className="mb-5 sm:mb-8 w-full max-w-2xl mx-auto">
          {/* MARQUEE ANNOUNCEMENT TICKER BANNER */}
          <AnnouncementBanner
            onClick={() => setIsNgocHoangModalOpen(true)}
            soundEnabled={soundEnabled}
            isHellMode={isHellMode}
          />

          <div className="relative w-full shadow-md sm:shadow-lg rounded-xl sm:rounded-2xl group">
            <div className={`absolute inset-y-0 left-0 pl-3.5 sm:pl-5 flex items-center pointer-events-none ${isHellMode ? 'text-red-400' : 'text-sky-600'}`}>
              <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <input
              id="input-search-husband-main"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHellMode ? 'Tìm tên chồng damdang...' : 'Tìm tên chồng...'}
              className={`w-full pl-10 sm:pl-14 pr-10 sm:pr-12 py-2.5 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg font-bold outline-none border-2 transition-all shadow-md sm:shadow-xl ${
                isHellMode
                  ? 'bg-[#0f0314]/90 hover:bg-[#16041c] focus:bg-[#16041c] text-purple-100 placeholder-purple-300/40 border-red-900/70 focus:border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                  : 'bg-white/95 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 border-white focus:border-sky-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
                className="absolute inset-y-0 right-0 pr-3.5 sm:pr-5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: "Chồng giàu Robux" (LEADERBOARD TOP 3) - Only in normal mode */}
        {!isHellMode && !searchQuery && (
          <div
            className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-7 border sm:border-2 backdrop-blur-md shadow-md sm:shadow-xl mb-6 sm:mb-10 bg-white/85 border-white/80"
          >
            <RPRichLeaderboard
              topCharacters={top3LeaderboardCharacters}
              votedIds={votedIds}
              onPlay={handlePlay}
              onReadPlot={handleReadPlot}
              onDonateRobux={handleDonateRobux}
              isHellMode={false}
              remainingHours={leaderboardInfo.remainingHours}
              onRefreshLeaderboard={handleForceRefreshLeaderboard}
            />
          </div>
        )}

        {/* PROMINENT GACHA WHEEL BANNER */}
        {!searchQuery && (
          <GachaWheelBanner
            onOpenGacha={() => setIsGachaOpen(true)}
            soundEnabled={soundEnabled}
          />
        )}

        {/* 🎨 PHÒNG TRANH PROMINENT BANNER (DIRECTLY UNDER GACHA WHEEL) */}
        {!searchQuery && (
          <div className="mb-6 sm:mb-10 w-full">
            <ArtGalleryEntranceCard
              onOpenGallery={handleOpenGallery}
              isHellMode={isHellMode}
              soundEnabled={soundEnabled}
            />
          </div>
        )}

        {/* SECTION 2: "Các chồng / Danh sách nhân vật" */}
        <section
          className={`w-full rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-7 border sm:border-2 backdrop-blur-md shadow-md sm:shadow-xl mb-8 sm:mb-12 ${
            isHellMode
              ? 'bg-gradient-to-b from-[#160418]/90 via-[#0f0212]/90 to-[#0a010c]/95 border-red-900/60 shadow-[0_4px_30px_rgba(0,0,0,0.85)]'
              : 'bg-white/85 border-white/80'
          }`}
        >
          {/* Section Subheader & Filters */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b ${
              isHellMode ? 'border-red-900/50' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs sm:shadow-md text-white ${
                  isHellMode
                    ? 'bg-gradient-to-tr from-red-600 via-purple-600 to-amber-500 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                    : 'bg-gradient-to-tr from-sky-500 to-sky-400'
                }`}
              >
                {isHellMode ? <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Users className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
              </div>
              <div>
                <h2 className={`text-lg sm:text-2xl font-black tracking-tight ${isHellMode ? 'text-purple-100' : 'text-slate-900'}`}>
                  {isHellMode ? 'Các chồng dâm' : 'Các chồng'}
                </h2>
                <span className={`text-[11px] sm:text-sm font-medium ${isHellMode ? 'text-purple-300/80' : 'text-slate-500'}`}>
                  {searchQuery
                    ? `Kết quả tìm kiếm cho "${searchQuery}" (${filteredCharacters.length})`
                    : isHellMode
                    ? 'Danh sách các chồng hư hỏng cần "phạt"'
                    : 'Danh sách lưu giữ các slot nhân vật Roleplay'}
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar -mx-1 px-1">
              {[
                { key: 'all', label: `Tất cả (${activeModeCharacters.length})` },
                { key: 'hiendai', label: 'Hiện đại' },
                { key: 'hocduong', label: 'Học đường' },
                { key: 'cotrang', label: 'Cổ trang' },
                { key: 'vnxua', label: 'VN xưa' },
                { key: 'ngot', label: 'Ngọt' },
                { key: 'nguoc', label: 'Ngược' },
                { key: 'khac', label: 'Khác' },
                { key: 'f7', label: 'F7 Big Wrongs' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as any)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ${
                    activeCategory === cat.key
                      ? isHellMode
                        ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)] border-t border-white/30'
                        : 'bg-sky-600 text-white shadow-xs border-t border-white/30'
                      : isHellMode
                      ? 'bg-[#0f0314]/80 text-purple-200 hover:bg-[#1a0522] border border-red-900/50'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Character Cards Grid: EXACTLY 2 COLUMNS ON MOBILE (grid-cols-2) with smooth mode transition */}
          {paginatedCharacters.length > 0 ? (
            <>
              <motion.div
                key={isHellMode ? 'hell-mode-active' : 'earth-mode-active'}
                initial={{ opacity: 0.75, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6"
              >
                {paginatedCharacters.map((character) => (
                  <RPCharacterCard
                    key={character.id}
                    character={character}
                    hasVoted={votedIds.includes(character.id)}
                    onPlay={handlePlay}
                    onReadPlot={handleReadPlot}
                    onDonateRobux={handleDonateRobux}
                    rankBadge={rankMap.get(character.id)}
                    isHellMode={isHellMode}
                    commentCount={commentCounts[character.id] || 0}
                  />
                ))}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-10 mb-6">
                  {/* Stylized Previous Page Button */}
                  <button
                    id="btn-pagination-prev"
                    onClick={() => {
                      playUiClick(soundEnabled);
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                    title="Trang trước"
                    className={`group relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 select-none ${
                      currentPage === 1 
                        ? 'opacity-30 cursor-not-allowed bg-slate-200/50 text-slate-400 border border-slate-200/40' 
                        : isHellMode 
                          ? 'bg-gradient-to-b from-red-950/90 to-black text-red-300 hover:text-white border-2 border-red-800/80 shadow-[0_0_16px_rgba(220,38,38,0.4)] hover:shadow-[0_0_24px_rgba(220,38,38,0.7)] hover:border-red-600 active:scale-90 cursor-pointer' 
                          : 'bg-gradient-to-b from-white via-white to-sky-50 text-slate-700 hover:text-sky-600 border-2 border-sky-100 shadow-[0_4px_16px_rgba(14,165,233,0.14)] hover:shadow-[0_6px_22px_rgba(14,165,233,0.25)] hover:border-sky-300 active:scale-90 cursor-pointer'
                    }`}
                  >
                    <ChevronsLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-0.5" />
                  </button>

                  {/* Stylized Page Indicator / Pill Selector */}
                  <div className={`flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl border-2 backdrop-blur-md shadow-xs ${
                    isHellMode 
                      ? 'bg-black/70 border-red-900/70 text-red-200' 
                      : 'bg-white/90 border-sky-100/90 text-slate-700'
                  }`}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            if (pageNum !== currentPage) {
                              playUiClick(soundEnabled);
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }
                          }}
                          className={`min-w-[34px] sm:min-w-[38px] h-9 sm:h-10 px-2 sm:px-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isActive
                              ? isHellMode
                                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_0_14px_rgba(220,38,38,0.7)] border border-red-300/40 scale-105'
                                : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/35 border border-sky-200/50 scale-105'
                              : isHellMode
                                ? 'text-red-400/70 hover:text-red-200 hover:bg-red-950/50'
                                : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stylized Next Page Button */}
                  <button
                    id="btn-pagination-next"
                    onClick={() => {
                      playUiClick(soundEnabled);
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    aria-label="Trang sau"
                    title="Trang sau"
                    className={`group relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 select-none ${
                      currentPage === totalPages 
                        ? 'opacity-30 cursor-not-allowed bg-slate-200/50 text-slate-400 border border-slate-200/40' 
                        : isHellMode 
                          ? 'bg-gradient-to-b from-red-950/90 to-black text-red-300 hover:text-white border-2 border-red-800/80 shadow-[0_0_16px_rgba(220,38,38,0.4)] hover:shadow-[0_0_24px_rgba(220,38,38,0.7)] hover:border-red-600 active:scale-90 cursor-pointer' 
                          : 'bg-gradient-to-b from-white via-white to-sky-50 text-slate-700 hover:text-sky-600 border-2 border-sky-100 shadow-[0_4px_16px_rgba(145,213,255,0.2)] hover:shadow-[0_6px_22px_rgba(14,165,233,0.25)] hover:border-sky-300 active:scale-90 cursor-pointer'
                    }`}
                  >
                    <ChevronsRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </>
          ) : activeCategory === 'vnxua' && !searchQuery ? (
            <div
              className={`w-full py-8 sm:py-14 px-4 sm:px-6 flex flex-col items-center justify-center text-center backdrop-blur-md rounded-2xl sm:rounded-3xl border sm:border-2 shadow-md ${
                isHellMode ? 'bg-[#180606]/95 border-red-900/80' : 'bg-white/95 border-slate-200/80'
              }`}
            >
              <div className="relative w-36 h-36 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-md sm:shadow-lg border-2 border-sky-200 mb-4 sm:mb-5 bg-sky-50 flex items-center justify-center">
                <img
                  src="https://i.ibb.co/F9p186z/cf0014560db495e5fcd5bab9cc237c10.jpg"
                  alt="chưa có ông xã nào ở đây hếttt"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h3 className={`text-base sm:text-xl md:text-2xl font-black max-w-lg leading-snug ${isHellMode ? 'text-red-100' : 'text-slate-900'}`}>
                chưa có ông xã nào ở đây hếttt🥺💦
              </h3>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className={`mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                    : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500'
                }`}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span>Xem tất cả các chồng</span>
              </button>
            </div>
          ) : (
            <div
              className={`w-full py-8 sm:py-14 px-4 sm:px-6 flex flex-col items-center justify-center text-center backdrop-blur-md rounded-2xl sm:rounded-3xl border sm:border-2 shadow-md ${
                isHellMode ? 'bg-[#180606]/95 border-red-900/80' : 'bg-white/95 border-slate-200/80'
              }`}
            >
              <div className="relative w-36 h-36 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-md sm:shadow-lg border-2 border-pink-200 mb-4 sm:mb-5 bg-pink-50 flex items-center justify-center">
                <img
                  src="https://i.ibb.co/hJkq7VHp/9204390ef9b17b40be77241e0bf0374f.jpg"
                  alt="nhóc có chắc tên chồng này là đúng khumm"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ibb.co/FL9PxzJG/9204390ef9b17b40be77241e0bf0374f.jpg';
                  }}
                />
              </div>

              <h3 className={`text-base sm:text-xl md:text-2xl font-black max-w-lg leading-snug ${isHellMode ? 'text-red-100' : 'text-slate-900'}`}>
                nhóc có chắc tên chồng này là đúng khumm
                <br />
                ((ヾ(≧皿≦ﾒ)ﾉ))
              </h3>

              <p className={`text-[11px] sm:text-sm mt-1.5 sm:mt-2 font-semibold max-w-md ${isHellMode ? 'text-red-300/70' : 'text-slate-500'}`}>
                {searchQuery ? `Không tìm thấy chồng nào khớp với từ khóa "${searchQuery}".` : 'Không có nhân vật nào trong mục này.'}
              </p>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className={`mt-4 sm:mt-5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                    : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500'
                }`}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span>Xem tất cả các chồng</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Tribute Footer with AI Họa Thần Rapunzel */}
      <RapunzelTributeFooter soundEnabled={soundEnabled} isHellMode={isHellMode} />

      {/* Floating "Trở về Hạ Giới" (Return to Earth) Button when in Hell Mode */}
      {isHellMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <button
            onClick={handleReturnToEarth}
            title="Trở về cõi trần gian tươi sáng"
            className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-black text-xs sm:text-sm border-2 border-white shadow-[0_0_25px_rgba(56,189,248,0.8)] cursor-pointer active:scale-95 transition-all"
          >
            <SunMedium className="w-5 h-5 text-yellow-200 group-hover:rotate-45 transition-transform" />
            <span className="tracking-wide">Trở về Hạ Giới 🌤️</span>
          </button>
        </motion.div>
      )}

      {/* Floating Bottom-Right Vinyl Record Audio Controller */}
      <div className="fixed bottom-6 right-6 z-40">
        <VinylRecordButton
          isPlaying={soundEnabled}
          onTogglePlay={onToggleSound}
          isHellMode={isHellMode}
        />
      </div>

      {/* Floating Active Character Voice Speaker Banner */}
      <ActiveVoiceBanner characters={activeModeCharacters} />

      {/* Interactive Gacha Roulette Modal */}
      <GachaModal
        isOpen={isGachaOpen}
        onClose={() => setIsGachaOpen(false)}
        characters={activeModeCharacters}
        soundEnabled={soundEnabled}
        onSelectCharacter={handleSelectFromGacha}
        onPlay={handlePlay}
        onReadPlot={handleReadPlot}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        character={selectedPasswordChar}
        soundEnabled={soundEnabled}
        isHellMode={isHellMode}
        onOpenCocKienTroi={handleOpenCocKienTroi}
      />

      {/* Cóc Kiện Trời: Đánh Trống Xin Gợi Ý Password */}
      <CocKienTroiModal
        isOpen={isCocKienTroiOpen}
        onClose={() => setIsCocKienTroiOpen(false)}
        characters={characters}
        initialSelectedCharId={cocKienTroiCharId}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onOpenPasswordModal={(char) => {
          setSelectedPasswordChar(char);
          setIsPasswordModalOpen(true);
        }}
      />

      {/* Floating Cloud Announcement Modal (Ngọc Hoàng in Normal Mode / Cursed Letter in Hell Mode) */}
      <NgocHoangCloudModal
        isOpen={isNgocHoangModalOpen}
        onClose={() => setIsNgocHoangModalOpen(false)}
        soundEnabled={soundEnabled}
        isHellMode={isHellMode}
      />

      {/* 18+ Age Verification Caution Modal for Hell Realm */}
      <AgeVerificationModal
        isOpen={isAgeVerificationOpen}
        onClose={() => setIsAgeVerificationOpen(false)}
        onConfirm={handleConfirmHellMode}
        soundEnabled={soundEnabled}
      />

      {/* Fullscreen Dramatic Falling Mascot & Shatter Screen Transition Overlay */}
      <HellFallingOverlay
        isActive={isFallingOverlayActive}
        onComplete={handleFallingOverlayComplete}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
