import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Copy,
  Check,
  Code,
  Type,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  FileText,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RPCommand } from '../types';
import { INITIAL_RP_COMMANDS } from '../data/initialCommands';
import { playUiClick } from '../utils/audio';

interface CommandLibraryPageProps {
  isHellMode?: boolean;
  soundEnabled?: boolean;
}

// Truncated & Summarized Syntax Preview Box Component
const SummarizedCodeViewer: React.FC<{
  code: string;
  category: 'html' | 'text' | 'prompt';
  isHellMode?: boolean;
}> = ({ code, category, isHellMode = false }) => {
  // Generate a concise summary/excerpt for the card preview
  const summarySnippet = useMemo(() => {
    const lines = code.trim().split('\n').filter(Boolean);

    if (category === 'prompt') {
      // For prompt commands, show key summary highlights
      const displayLines = lines.slice(0, 4);
      return displayLines.join('\n');
    }

    if (category === 'html') {
      return lines.slice(0, 3).join('\n');
    }

    return lines.slice(0, 3).join('\n');
  }, [code, category]);

  return (
    <div className="relative font-mono text-[9px] sm:text-[12px] md:text-[13px] leading-relaxed select-text">
      {/* Excerpt text */}
      <pre className="text-slate-200 whitespace-pre-wrap break-words max-h-14 sm:max-h-24 overflow-hidden">
        {summarySnippet}
      </pre>

      {/* Subtle fade gradient overlay indicating summary truncation */}
      <div className="absolute inset-x-0 bottom-0 h-6 sm:h-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

      {/* Summarized notice badge */}
      <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[8px] sm:text-[11px] text-amber-300 font-bold font-sans">
        <span className="flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Thu gọn</span>
        </span>
        <span className="text-[7px] sm:text-[10px] text-slate-400 font-medium truncate">
          (Bấm copy để lấy hết)
        </span>
      </div>
    </div>
  );
};

export const CommandLibraryPage: React.FC<CommandLibraryPageProps> = ({
  isHellMode = false,
  soundEnabled = true,
}) => {
  // Authoritative commands uploaded by Admin
  const [commands] = useState<RPCommand[]>(INITIAL_RP_COMMANDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'prompt' | 'html' | 'text'>('all');

  // Copy Feedback State (Map of commandId => boolean)
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination / Virtualized chunk rendering for 60fps
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth >= 640 ? 9 : 10);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 640 ? 9 : 10);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search Debounce (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, activeCategory]);

  // Filtered Commands
  const filteredCommands = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return commands.filter((cmd) => {
      // Category filter
      if (activeCategory === 'prompt' && cmd.category !== 'prompt') return false;
      if (activeCategory === 'html' && cmd.category !== 'html') return false;
      if (activeCategory === 'text' && cmd.category !== 'text') return false;

      // Search query filter
      if (!q) return true;
      const matchTitle = cmd.title.toLowerCase().includes(q);
      const matchCode = cmd.commandText.toLowerCase().includes(q);
      const matchDesc = cmd.description ? cmd.description.toLowerCase().includes(q) : false;
      const matchTags = cmd.tags ? cmd.tags.some((t) => t.toLowerCase().includes(q)) : false;

      return matchTitle || matchCode || matchDesc || matchTags;
    });
  }, [commands, debouncedQuery, activeCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCommands.length / itemsPerPage) || 1;
  const paginatedCommands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCommands.slice(start, start + itemsPerPage);
  }, [filteredCommands, currentPage, itemsPerPage]);

  // Category counts
  const categoryCounts = useMemo(() => {
    let prompt = 0;
    let html = 0;
    let text = 0;
    commands.forEach((c) => {
      if (c.category === 'prompt') prompt++;
      else if (c.category === 'html') html++;
      else if (c.category === 'text') text++;
    });
    return {
      all: commands.length,
      prompt,
      html,
      text,
    };
  }, [commands]);

  // Copy to clipboard handler with fallback
  const handleCopyCommand = useCallback(
    async (command: RPCommand) => {
      playUiClick(soundEnabled);
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(command.commandText);
        } else {
          // Fallback for iFrame or older webview
          const textArea = document.createElement('textarea');
          textArea.value = command.commandText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        setCopiedId(command.id);
        setToastMessage(`✓ Đã sao chép thành công: "${command.title}"!`);

        setTimeout(() => {
          setCopiedId((curr) => (curr === command.id ? null : curr));
        }, 2200);

        setTimeout(() => {
          setToastMessage(null);
        }, 2500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    [soundEnabled]
  );

  return (
    <div className="relative w-full max-w-7xl mx-auto px-2.5 sm:px-6 md:px-12 py-4 sm:py-8 font-dessert">
      {/* Toast Notification - Nằm ở DƯỚI, CHÍNH GIỮA MÀN HÌNH */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
            className={`fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-2xl border-2 flex items-center gap-3 backdrop-blur-xl select-none ${
              isHellMode
                ? 'bg-gradient-to-r from-red-950 via-purple-950 to-red-950 border-red-500 text-white shadow-[0_0_35px_rgba(220,38,38,0.85)] ring-2 ring-red-400/50'
                : 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 border-emerald-400 text-white shadow-[0_10px_35px_rgba(16,185,129,0.8)] ring-2 ring-emerald-300/50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0 animate-bounce" />
            <span className="text-xs sm:text-sm font-black tracking-wide whitespace-nowrap">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO HEADER BANNER */}
      <div
        className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b backdrop-blur-xs ${
          isHellMode ? 'border-red-900/50' : 'border-white/30'
        }`}
      >
        <div>
          {/* Badge Pill */}
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black mb-2.5 border-2 shadow-lg backdrop-blur-md select-none transform hover:scale-[1.02] transition-transform ${
              isHellMode
                ? 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white border-red-300 ring-2 ring-purple-500/70 shadow-[0_0_20px_rgba(220,38,38,0.7)]'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 border-white ring-2 ring-amber-300/70 shadow-[0_4px_16px_rgba(245,158,11,0.45)]'
            }`}
          >
            <Code className={`w-3.5 h-3.5 stroke-[2.5] ${isHellMode ? 'text-amber-300' : 'text-amber-900'}`} />
            <span className="tracking-wide uppercase">
              {isHellMode ? 'KHO MA LỆNH & PROMPT 18+' : 'THƯ VIỆN KHO LỆNH'}
            </span>
            <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isHellMode ? 'text-amber-300 fill-amber-400' : 'text-amber-800 fill-amber-500'}`} />
          </div>

          <h1 className="text-white text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight dessert-title-shadow flex items-center gap-2.5">
            <span>Kho Lệnh</span>
            <span>💾</span>
          </h1>
          <p
            className={`text-xs sm:text-sm md:text-base font-bold mt-1 drop-shadow-xs max-w-2xl ${
              isHellMode ? 'text-purple-200/90' : 'text-white/95'
            }`}
          >
            Tổng hợp các lệnh nhà tự nấu (và tự ăn)
          </p>
        </div>

        {/* Counter Info Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border backdrop-blur-md text-xs sm:text-sm font-black flex items-center gap-2 shadow-md ${
              isHellMode
                ? 'bg-[#100314]/85 border-red-900/80 text-purple-200 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                : 'bg-white/90 border-white text-slate-700'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] ${isHellMode ? 'text-red-400' : 'text-sky-600'}`} />
            <span>
              Tổng số lệnh: <strong className={`text-xs sm:text-sm font-black ${isHellMode ? 'text-amber-300' : 'text-sky-700'}`}>{commands.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR & CATEGORY FILTER BAR */}
      <div className="mb-6 sm:mb-8 space-y-4">
        {/* Search Input Box */}
        <div className="relative w-full max-w-3xl mx-auto">
          <div
            className={`relative rounded-3xl p-1 shadow-lg backdrop-blur-md border-2 transition-all ${
              isHellMode
                ? 'bg-purple-950/40 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)] focus-within:border-red-400'
                : 'bg-white/80 border-white shadow-[0_8px_30px_rgba(2,132,199,0.2)] focus-within:border-sky-400'
            }`}
          >
            <div className="flex items-center px-3.5 sm:px-5 py-2 sm:py-3">
              <Search
                className={`w-5 h-5 sm:w-6 sm:h-6 mr-3 stroke-[2.5] shrink-0 ${
                  isHellMode ? 'text-red-400' : 'text-sky-600'
                }`}
              />
              <input
                id="search-commands-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm lệnh theo tên, từ khóa, tag (#NSFW, #Chống YSL)..."
                className={`w-full bg-transparent text-sm sm:text-base md:text-lg font-bold outline-none placeholder:font-medium placeholder:italic ${
                  isHellMode
                    ? 'text-white placeholder:text-purple-300/60'
                    : 'text-slate-800 placeholder:text-slate-400'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    playUiClick(soundEnabled);
                    setSearchQuery('');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills: Tất cả, Lệnh Prompt, Lệnh HTML, Lệnh Chữ */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* All */}
          <button
            type="button"
            onClick={() => {
              playUiClick(soundEnabled);
              setActiveCategory('all');
            }}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 border ${
              activeCategory === 'all'
                ? isHellMode
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white border-red-300 shadow-[0_0_15px_rgba(220,38,38,0.7)]'
                  : 'bg-sky-600 text-white border-sky-400 shadow-[0_4px_14px_rgba(2,132,199,0.5)]'
                : isHellMode
                ? 'bg-[#18031e]/80 text-purple-200 border-red-900/40 hover:bg-[#25052e]'
                : 'bg-white/80 text-slate-700 border-white hover:bg-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Tất cả</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeCategory === 'all' ? 'bg-white/30 text-white' : 'bg-black/10 text-slate-500'
              }`}
            >
              {categoryCounts.all}
            </span>
          </button>

          {/* Lệnh Prompt (MỚI THEO YÊU CẦU) */}
          <button
            type="button"
            onClick={() => {
              playUiClick(soundEnabled);
              setActiveCategory('prompt');
            }}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 border ${
              activeCategory === 'prompt'
                ? isHellMode
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.7)]'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-300 shadow-[0_4px_14px_rgba(244,63,94,0.5)]'
                : isHellMode
                ? 'bg-[#18031e]/80 text-purple-200 border-red-900/40 hover:bg-[#25052e]'
                : 'bg-white/80 text-slate-700 border-white hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>Lệnh Prompt</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeCategory === 'prompt' ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {categoryCounts.prompt}
            </span>
          </button>

          {/* Lệnh HTML */}
          <button
            type="button"
            onClick={() => {
              playUiClick(soundEnabled);
              setActiveCategory('html');
            }}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 border ${
              activeCategory === 'html'
                ? isHellMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                  : 'bg-emerald-600 text-white border-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.5)]'
                : isHellMode
                ? 'bg-[#18031e]/80 text-purple-200 border-red-900/40 hover:bg-[#25052e]'
                : 'bg-white/80 text-slate-700 border-white hover:bg-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Lệnh HTML</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeCategory === 'html' ? 'bg-white/30 text-white' : 'bg-black/10 text-slate-500'
              }`}
            >
              {categoryCounts.html}
            </span>
          </button>

          {/* Lệnh Chữ */}
          <button
            type="button"
            onClick={() => {
              playUiClick(soundEnabled);
              setActiveCategory('text');
            }}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 border ${
              activeCategory === 'text'
                ? isHellMode
                  ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                  : 'bg-indigo-600 text-white border-indigo-400 shadow-[0_4px_14px_rgba(79,70,229,0.5)]'
                : isHellMode
                ? 'bg-[#18031e]/80 text-purple-200 border-red-900/40 hover:bg-[#25052e]'
                : 'bg-white/80 text-slate-700 border-white hover:bg-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Lệnh Chữ</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeCategory === 'text' ? 'bg-white/30 text-white' : 'bg-black/10 text-slate-500'
              }`}
            >
              {categoryCounts.text}
            </span>
          </button>
        </div>
      </div>

      {/* 3. COMMAND CARDS GRID: 2 COLUMNS ON MOBILE (grid-cols-2) JUST LIKE CHARACTER LIST */}
      {paginatedCommands.length === 0 ? (
        <div
          className={`text-center py-16 px-4 rounded-3xl border-2 backdrop-blur-md ${
            isHellMode
              ? 'bg-purple-950/30 border-red-900/50 text-purple-300'
              : 'bg-white/60 border-white/60 text-slate-600'
          }`}
        >
          <span className="text-5xl block mx-auto mb-3 animate-bounce select-none">💾</span>
          <h3 className="text-xl font-black mb-1">Không tìm thấy lệnh nào phù hợp</h3>
          <p className="text-sm font-medium opacity-80">
            Hãy thử tìm bằng từ khóa khác hoặc chọn mục "Tất cả" nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
          {paginatedCommands.map((command) => {
            const isCopied = copiedId === command.id;
            const isPrompt = command.category === 'prompt';
            const isHtml = command.category === 'html';

            return (
              <motion.div
                key={command.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`relative rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 md:p-5 flex flex-col justify-between border-2 transition-all duration-300 group hover:-translate-y-1 shadow-lg backdrop-blur-md overflow-hidden ${
                  isHellMode
                    ? 'bg-[#18031e]/90 border-red-900/60 hover:border-red-500/80 shadow-[0_6px_25px_rgba(220,38,38,0.2)]'
                    : 'bg-white/90 border-white hover:border-sky-300 shadow-[0_8px_25px_rgba(2,132,199,0.18)]'
                }`}
              >
                {/* Top Header inside Card */}
                <div>
                  <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <h3
                      className={`text-xs sm:text-base md:text-xl font-black leading-tight flex-1 tracking-tight line-clamp-2 ${
                        isHellMode ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {command.title}
                    </h3>

                    {/* Distinct Category Tag */}
                    <span
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-0.5 sm:gap-1 border shadow-xs ${
                        isPrompt
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/50'
                          : isHtml
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                          : 'bg-indigo-500/20 text-indigo-400 border-indigo-400/40'
                      }`}
                    >
                      {isPrompt ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                          <span className="hidden xs:inline sm:inline">PROMPT</span>
                          <span className="xs:hidden sm:hidden">PR</span>
                        </>
                      ) : isHtml ? (
                        <>
                          <Code className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                          <span>HTML</span>
                        </>
                      ) : (
                        <>
                          <Type className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                          <span>CHỮ</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Description */}
                  {command.description && (
                    <p
                      className={`text-[10px] sm:text-xs md:text-[13px] font-bold mb-2 sm:mb-3 line-clamp-2 ${
                        isHellMode ? 'text-purple-200/85' : 'text-slate-600'
                      }`}
                    >
                      {command.description}
                    </p>
                  )}

                  {/* Summarized Code/Text Preview Box */}
                  <div className="relative mb-2 sm:mb-3 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/95 shadow-inner p-2 sm:p-3.5">
                    {/* Top bar */}
                    <div className="flex items-center justify-between pb-1.5 sm:pb-2 mb-1.5 sm:mb-2 border-b border-slate-800 text-[8px] sm:text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 sm:gap-1.5 truncate mr-1">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 inline-block shrink-0" />
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                        <span className="ml-0.5 sm:ml-1 text-slate-300 font-semibold truncate">
                          {isPrompt ? 'Prompt' : 'Cú pháp'}
                        </span>
                      </span>
                      <span className="text-slate-400 font-semibold text-[8px] sm:text-[10px] shrink-0">
                        {command.commandText.length} ký tự
                      </span>
                    </div>

                    {/* Summarized preview */}
                    <SummarizedCodeViewer
                      code={command.commandText}
                      category={command.category}
                      isHellMode={isHellMode}
                    />
                  </div>

                  {/* Tags list */}
                  {command.tags && command.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5 sm:mb-3.5">
                      {command.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border ${
                            tag.includes('NSFW')
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : isHellMode
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          #{tag.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prominent Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopyCommand(command)}
                  className={`w-full py-1.5 sm:py-2.5 md:py-3 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-1 sm:gap-2 border-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                    isCopied
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                      : isHellMode
                      ? 'bg-gradient-to-r from-red-600 to-purple-700 hover:from-red-500 hover:to-purple-600 text-white border-red-400/60 shadow-[0_4px_15px_rgba(220,38,38,0.4)]'
                      : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-600 hover:from-sky-400 hover:to-cyan-400 text-white border-sky-300 shadow-[0_4px_15px_rgba(2,132,199,0.4)]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] animate-bounce shrink-0" />
                      <span className="truncate">✓ Đã copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
                      <span className="truncate">Sao Chép Lệnh</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION CONTROLS (60fps Fast Navigation) */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              playUiClick(soundEnabled);
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className={`p-2 sm:p-2.5 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isHellMode
                ? 'bg-purple-950/70 border-red-900/60 text-white'
                : 'bg-white/90 border-white text-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => {
                  playUiClick(soundEnabled);
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
                  currentPage === pageNum
                    ? isHellMode
                      ? 'bg-red-600 border-red-300 text-white shadow-[0_0_12px_rgba(220,38,38,0.7)]'
                      : 'bg-sky-600 border-sky-300 text-white shadow-[0_4px_12px_rgba(2,132,199,0.5)]'
                    : isHellMode
                    ? 'bg-purple-950/70 border-red-900/40 text-purple-200 hover:bg-purple-900/60'
                    : 'bg-white/80 border-white text-slate-700 hover:bg-white'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              playUiClick(soundEnabled);
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className={`p-2 sm:p-2.5 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isHellMode
                ? 'bg-purple-950/70 border-red-900/60 text-white'
                : 'bg-white/90 border-white text-slate-700'
            }`}
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
};
