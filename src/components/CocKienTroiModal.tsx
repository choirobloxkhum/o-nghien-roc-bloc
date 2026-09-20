import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  ExternalLink,
  KeyRound,
  CheckCircle2,
  Lock,
  Volume2,
  VolumeX,
  ChevronRight,
  Crown,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { RPCharacter } from '../types';
import {
  playDrumBeatSound,
  playFrogCroakSound,
  playMilestoneUnlockSound,
  playUiClick,
  playSparkleSound,
} from '../utils/audio';

const marukoFaceImg = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

interface CocKienTroiModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: RPCharacter[];
  initialSelectedCharId?: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenPasswordModal?: (char: RPCharacter) => void;
}

interface FloatingBeat {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const CocKienTroiModal: React.FC<CocKienTroiModalProps> = ({
  isOpen,
  onClose,
  characters,
  initialSelectedCharId,
  soundEnabled = true,
  onToggleSound,
  onOpenPasswordModal,
}) => {
  // Filter all characters that have a password
  const lockedCharacters = characters.filter((c) => Boolean(c.password));

  // Step 1: 'ask_who' (Cô bé Ngọc Hoàng hỏi: "Con muốn kiện ai?")
  // Step 2: 'drum_strikes' (Màn hình gõ trống Đăng Văn cho nhân vật đã chọn)
  const [viewStep, setViewStep] = useState<'ask_who' | 'drum_strikes'>('ask_who');

  const [selectedCharId, setSelectedCharId] = useState<string>(() => {
    if (initialSelectedCharId && lockedCharacters.some((c) => c.id === initialSelectedCharId)) {
      return initialSelectedCharId;
    }
    return lockedCharacters[0]?.id || 'char-11-lucifer';
  });

  const selectedChar =
    lockedCharacters.find((c) => c.id === selectedCharId) ||
    characters.find((c) => c.id === selectedCharId) ||
    lockedCharacters[0] ||
    null;

  // In-memory drum beats map: completely reset on reload or when user leaves the page
  const [beatsMap, setBeatsMap] = useState<Record<string, number>>({});
  const [isDrumActive, setIsDrumActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [floatingBeats, setFloatingBeats] = useState<FloatingBeat[]>([]);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any legacy localStorage values from earlier versions
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('roblox_rp_drum_beats_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore
    }
  }, []);

  // Current beat count of selected character (in-memory only)
  const beats = selectedChar ? beatsMap[selectedChar.id] || 0 : 0;

  // When modal opens, always start with Ngọc Hoàng asking "Con muốn kiện ai?"
  useEffect(() => {
    if (isOpen) {
      setViewStep('ask_who');
      playSparkleSound(soundEnabled);
    }
  }, [isOpen, soundEnabled]);

  // Update initial selected char when prop changes
  useEffect(() => {
    if (initialSelectedCharId && lockedCharacters.some((c) => c.id === initialSelectedCharId)) {
      setSelectedCharId(initialSelectedCharId);
    }
  }, [initialSelectedCharId, lockedCharacters]);

  // Trigger celebratory confetti
  const triggerConfetti = (count = 60) => {
    try {
      confetti({
        particleCount: count,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {
      // Ignore
    }
  };

  // Drum strike action (only single strikes +1, no multi-strike buttons)
  const handleStrikeDrum = useCallback(() => {
    if (!selectedChar) return;
    const currentCharId = selectedChar.id;
    const prevBeats = beatsMap[currentCharId] || 0;
    const nextBeats = prevBeats + 1;

    setBeatsMap((prev) => ({
      ...prev,
      [currentCharId]: nextBeats,
    }));

    // Visual drum feedback
    setIsDrumActive(true);
    setTimeout(() => setIsDrumActive(false), 120);

    // Play drum sound
    playDrumBeatSound(soundEnabled);

    // Combo handling
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 1500);

    // Random frog croak on combo intervals
    if (nextCombo > 0 && nextCombo % 20 === 0) {
      playFrogCroakSound(soundEnabled);
    }

    // Check milestones crossed (1,000 and 10,000 beats)
    if (prevBeats < 1000 && nextBeats >= 1000) {
      playMilestoneUnlockSound(soundEnabled);
      triggerConfetti(100);
    } else if (prevBeats < 10000 && nextBeats >= 10000) {
      playMilestoneUnlockSound(soundEnabled);
      triggerConfetti(180);
    }

    // Add floating text
    const id = Date.now() + Math.random();
    const texts = ['TÙNG! 🥁', 'CẮC! ⚡', 'OẠP! 🐸', 'KIỆN TRỜI! ☁️', '+1 LƯỢT 💥'];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#ec4899', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newFloating: FloatingBeat = {
      id,
      text: nextCombo > 15 && nextCombo % 5 === 0 ? `COMBO x${nextCombo}! 🔥` : randomText,
      x: (Math.random() - 0.5) * 140,
      y: -20 - Math.random() * 40,
      color: randomColor,
    };

    setFloatingBeats((prev) => [...prev.slice(-6), newFloating]);
    setTimeout(() => {
      setFloatingBeats((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  }, [beatsMap, combo, selectedChar, soundEnabled]);

  // Keyboard support: Space or Enter key strikes the drum only in 'drum_strikes' view
  useEffect(() => {
    if (!isOpen || viewStep !== 'drum_strikes') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        handleStrikeDrum();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewStep, handleStrikeDrum]);

  if (!isOpen) return null;

  // Milestone unlock states for selectedChar: 1,000 for Hint 1, 10,000 for Hint 2
  const hasHint1 = beats >= 1000;
  const hasHint2 = beats >= 10000;

  // Specific hint content for Lucifer & fallback for others
  const hint1Text =
    selectedChar?.hint1 ||
    (selectedChar?.id === 'char-11-lucifer' ? 'Facebook của Ngọc Hoàng' : selectedChar?.passwordHint || 'Gợi ý từ Thiên Đình');
  const hint1Link =
    selectedChar?.hint1Url ||
    (selectedChar?.id === 'char-11-lucifer'
      ? 'https://www.facebook.com/profile.php?id=61590620211736'
      : undefined);

  const hint2Text =
    selectedChar?.hint2 ||
    (selectedChar?.id === 'char-11-lucifer'
      ? 'Bio mô tả của Ngọc Hoàng'
      : 'Xem kỹ phần mô tả cốt truyện và thông tin của Ngọc Hoàng');

  // Switch to Password Modal
  const handleGoToPassword = () => {
    playUiClick(soundEnabled);
    onClose();
    if (onOpenPasswordModal && selectedChar) {
      onOpenPasswordModal(selectedChar);
    }
  };

  // Progress percentage (capped at 100%, based on 10,000 beats)
  const progressPercent = Math.min(100, (beats / 10000) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playUiClick(soundEnabled);
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 25 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#fffbe8] via-[#fff5d6] to-[#feeaa7] rounded-3xl sm:rounded-[36px] border-4 border-[#eab308] shadow-[0_20px_60px_rgba(202,138,4,0.4),0_0_30px_rgba(234,179,8,0.25)] overflow-hidden z-20 my-auto select-none max-h-[92vh] flex flex-col"
        >
          {/* Folk Cloud & Sky Header Banner */}
          <div className="relative bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] px-4 sm:px-6 py-3.5 sm:py-4 border-b-4 border-yellow-300 text-white shadow-md shrink-0">
            {/* Studs texture pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            <div className="relative flex items-center justify-between gap-3">
              {/* Left Title */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-md flex items-center justify-center text-2xl shrink-0 animate-bounce">
                  🐸
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-base sm:text-xl font-black tracking-tight uppercase text-yellow-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      Cóc Kiện Trời
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-300">
                      {viewStep === 'ask_who' ? 'Cung Đình Ngọc Hoàng' : 'Trống Đăng Văn'}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-amber-100 truncate">
                    "Con Cóc là cậu ông Trời - Ai mà đánh nó thì Trời đánh cho!"
                  </p>
                </div>
              </div>

              {/* Controls: Back button (if in drum view), Sound toggle & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {viewStep === 'drum_strikes' && (
                  <button
                    onClick={() => {
                      playUiClick(soundEnabled);
                      setViewStep('ask_who');
                    }}
                    title="Đổi nhân vật kiện"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="hidden xs:inline">Đổi người</span>
                  </button>
                )}

                {onToggleSound && (
                  <button
                    onClick={onToggleSound}
                    title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/40 transition-all cursor-pointer"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => {
                    playUiClick(soundEnabled);
                    onClose();
                  }}
                  title="Đóng bảng kiện trời"
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/40 transition-all cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Main Body Scrollable */}
          <div className="p-3.5 sm:p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
            {/* STEP 1: CÔ BÉ NGỌC HOÀNG HỎI "CON MUỐN KIỆN AI?" */}
            {viewStep === 'ask_who' ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Center Dialogue with Maruko Face Ngọc Hoàng */}
                <div className="flex flex-col items-center text-center my-1">
                  {/* Maruko Ngoc Hoang Avatar */}
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full blur-md opacity-75 animate-pulse" />
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-yellow-300 shadow-xl overflow-hidden bg-amber-100 ring-4 ring-yellow-400/40">
                      <img
                        src={marukoFaceImg}
                        alt="Cô bé Ngọc Hoàng"
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Golden Crown badge */}
                    <div className="absolute -top-3 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-md flex items-center justify-center text-lg animate-bounce">
                      👑
                    </div>
                    {/* Cloud pill */}
                    <div className="absolute -bottom-2 -left-2 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-black text-amber-950 border border-amber-300 shadow-xs">
                      ☁️ Ngọc Hoàng
                    </div>
                  </div>

                  {/* Speech Bubble: "Con muốn kiện ai?" */}
                  <div className="relative mt-4 w-full max-w-lg bg-white/95 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-md text-stone-800">
                    {/* Pointer arrow */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white/95" />
                    <h3 className="text-lg sm:text-xl font-black text-amber-950 uppercase tracking-tight flex items-center justify-center gap-1.5">
                      <span>👑 "Con muốn kiện ai?"</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1 leading-relaxed">
                      Nhân vật nào đang giấu mật khẩu khiến con bứt rứt? Hãy chọn kẻ đó để bước vào gõ Trống Đăng Văn ép ta nhả gợi ý!
                    </p>
                  </div>
                </div>

                {/* Character Selection Grid */}
                <div className="space-y-2 mt-3">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                      <span>Các nhân vật đang bị khóa mật khẩu ({lockedCharacters.length})</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 hidden xs:inline">
                      Bấm vào nhân vật để gõ trống ➜
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lockedCharacters.map((char) => {
                      const charBeats = beatsMap[char.id] || 0;
                      const hasHint1Unlocked = charBeats >= 1000;
                      const hasHint2Unlocked = charBeats >= 10000;

                      return (
                        <motion.button
                          key={char.id}
                          whileHover={{ scale: 1.025, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            playUiClick(soundEnabled);
                            setSelectedCharId(char.id);
                            setViewStep('drum_strikes');
                          }}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-amber-300 hover:border-amber-500 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group relative overflow-hidden"
                        >
                          {/* Avatar */}
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 border-amber-400 bg-stone-900 shadow-inner">
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              className="w-full h-full object-cover object-[center_15%]"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                              <Lock className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm sm:text-base font-black text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                                {char.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                              "{char.quote || char.role || 'Khu vực khóa mật khẩu'}"
                            </p>

                            {/* Progress info badge */}
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                🥁 {charBeats.toLocaleString('vi-VN')}/10.000 lần
                              </span>
                              {hasHint2Unlocked ? (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                                  ✓ Đủ 2 Gợi ý
                                </span>
                              ) : hasHint1Unlocked ? (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                                  ✓ Gợi ý 1
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Arrow CTA */}
                          <div className="w-8 h-8 rounded-full bg-amber-100 group-hover:bg-amber-400 group-hover:text-amber-950 text-amber-800 flex items-center justify-center transition-all shrink-0">
                            <ChevronRight className="w-4 h-4 stroke-[3]" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* STEP 2: MÀN HÌNH GÕ TRỐNG ĐĂNG VĂN (KHÔNG CÓ NÚT +5, +20) */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Active Character Top Bar */}
                <div className="flex items-center justify-between bg-white/90 border-2 border-amber-300 rounded-2xl p-2.5 sm:p-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-black">
                      {selectedChar?.avatarUrl && (
                        <img
                          src={selectedChar.avatarUrl}
                          alt={selectedChar.name}
                          className="w-full h-full object-cover object-[center_15%]"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                        Đang kiện xin pass nhân vật:
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-stone-900 truncate">
                        {selectedChar?.name}
                      </h3>
                    </div>
                  </div>

                  {/* Button to switch character */}
                  <button
                    onClick={() => {
                      playUiClick(soundEnabled);
                      setViewStep('ask_who');
                    }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border border-amber-300 transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-800" />
                    <span>Đổi người</span>
                  </button>
                </div>

                {/* DRUM STAGE AREA */}
                <div className="relative rounded-3xl bg-gradient-to-b from-[#fde68a] via-[#fcd34d] to-[#f59e0b] border-4 border-[#b45309] shadow-inner p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
                  {/* Floating Hit Texts */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                    <AnimatePresence>
                      {floatingBeats.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 1, scale: 0.8, x: item.x, y: 80 }}
                          animate={{ opacity: 0, scale: 1.4, y: item.y }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className="absolute left-1/2 top-1/3 -translate-x-1/2 font-black text-sm sm:text-base drop-shadow-md select-none pointer-events-none whitespace-nowrap"
                          style={{ color: item.color }}
                        >
                          {item.text}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Header counters */}
                  <div className="w-full flex items-center justify-between mb-2 z-10 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-900 text-yellow-300 font-black text-xs sm:text-sm border border-yellow-400 shadow-xs flex items-center gap-1">
                        <span>🥁 Đã Gõ:</span>
                        <strong className="text-white text-sm sm:text-base">{beats.toLocaleString('vi-VN')}</strong>
                        <span className="text-[10px] text-amber-200">/10.000 lần</span>
                      </span>
                    </div>

                    {/* Streak combo indicator */}
                    {combo > 2 && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.15, 1] }}
                        className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-xs border border-red-300 shadow-xs animate-pulse"
                      >
                        🔥 COMBO x{combo}
                      </motion.div>
                    )}
                  </div>

                  {/* The Drum & Mascot Stage */}
                  <div className="relative flex items-center justify-center my-2 sm:my-3">
                    {/* Left Mascot (Toad Cóc Cậu Ông Trời with Mallet) */}
                    <motion.div
                      animate={isDrumActive ? { rotate: [-15, 15, -15], y: [0, -6, 0] } : { y: [0, -3, 0] }}
                      transition={{ duration: isDrumActive ? 0.12 : 2, repeat: isDrumActive ? 0 : Infinity }}
                      className="hidden sm:flex absolute -left-16 sm:-left-20 bottom-1 flex-col items-center pointer-events-none z-10"
                    >
                      <span className="text-4xl sm:text-5xl drop-shadow-md">🐸</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-900 text-yellow-200 text-[10px] font-black border border-yellow-300 shadow-xs mt-1">
                        Cóc Kiện
                      </span>
                    </motion.div>

                    {/* BIG INTERACTIVE DRUM (TRỐNG ĐĂNG VĂN) */}
                    <motion.button
                      id="drum-strike-target"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleStrikeDrum}
                      aria-label="Gõ Trống Đăng Văn"
                      className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border-8 border-[#78350f] shadow-[0_15px_30px_rgba(120,53,15,0.6),inset_0_4px_12px_rgba(255,255,255,0.7)] flex flex-col items-center justify-center cursor-pointer transition-all duration-75 overflow-hidden ${
                        isDrumActive
                          ? 'bg-gradient-to-b from-[#fef08a] to-[#eab308] ring-8 ring-red-500/80 scale-95'
                          : 'bg-gradient-to-b from-[#fef9c3] via-[#fde047] to-[#eab308] hover:shadow-[0_20px_40px_rgba(120,53,15,0.8)]'
                      }`}
                    >
                      {/* Drum Rim Studs */}
                      <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#b45309]/50 pointer-events-none" />
                      <div className="absolute inset-0 bg-[radial-gradient(#b45309_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                      {/* Drum Center Logo */}
                      <div className="relative flex flex-col items-center justify-center pointer-events-none z-10 text-center px-3">
                        <span className="text-3xl sm:text-4xl drop-shadow-md">🥁</span>
                        <span className="text-sm sm:text-base font-black text-amber-950 uppercase tracking-tight mt-1">
                          TRỐNG ĐĂNG VĂN
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-amber-900/90 mt-0.5">
                          GÕ ĐỂ KIỆN TRỜI ⚡
                        </span>

                        {/* Mallet strike indicator */}
                        {isDrumActive && (
                          <motion.div
                            initial={{ opacity: 1, scale: 0.6 }}
                            animate={{ opacity: 0, scale: 1.6 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 rounded-full bg-white/40 pointer-events-none"
                          />
                        )}
                      </div>
                    </motion.button>

                    {/* Right Mascot (Cô bé Ngọc Hoàng) */}
                    <motion.div
                      animate={isDrumActive ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : { y: [0, -3, 0] }}
                      transition={{ duration: isDrumActive ? 0.15 : 2.5, repeat: isDrumActive ? 0 : Infinity }}
                      className="hidden sm:flex absolute -right-16 sm:-right-20 bottom-1 flex-col items-center pointer-events-none z-10"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-yellow-300 shadow-md overflow-hidden bg-amber-100">
                        <img
                          src={marukoFaceImg}
                          alt="Ngọc Hoàng"
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-900 text-yellow-200 text-[10px] font-black border border-yellow-300 shadow-xs mt-1">
                        Ngọc Hoàng
                      </span>
                    </motion.div>
                  </div>

                  {/* Instructional Tip */}
                  <p className="text-[11px] sm:text-xs font-bold text-amber-950/90 mt-2 text-center">
                    Bấm vào mặt trống hoặc gõ phím <kbd className="px-1.5 py-0.5 rounded bg-amber-900 text-yellow-300 font-mono text-[10px]">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-amber-900 text-yellow-300 font-mono text-[10px]">Enter</kbd>
                  </p>
                </div>

                {/* ROYAL DECREE RULES BANNER */}
                <div className="rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-400 shadow-xs flex items-start gap-2.5">
                  <span className="text-xl sm:text-2xl shrink-0">📜</span>
                  <div className="text-xs text-amber-950 space-y-1">
                    <div className="font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Luật Kiện Trời Của Thiên Đình</span>
                    </div>
                    <p className="leading-relaxed font-semibold">
                      • Đánh trống <strong>1.000 lần</strong>: nhận được <strong>gợi ý lần 1</strong>.<br />
                      • Đánh trống <strong>10.000 lần</strong>: nhận được <strong>gợi ý lần 2</strong>.
                    </p>
                    <p className="text-red-700 font-black text-[11px] pt-0.5">
                      ⚠️ Chỉ có 2 lần gợi ý duy nhất — Không có bất kỳ cách nào khác để nhận link nếu không tự giải được mật khẩu!
                    </p>
                  </div>
                </div>

                {/* OVERALL PROGRESS BAR (0 -> 10.000) WITH 2 MILESTONE FLAGS */}
                <div className="bg-white/90 rounded-2xl p-3 sm:p-4 border-2 border-amber-300 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-950">
                    <span>Tiến độ xin lệnh Ngọc Hoàng (tối đa 10.000 tiếng trống):</span>
                    <span className="text-red-700 font-extrabold">{progressPercent.toFixed(1)}%</span>
                  </div>

                  {/* Visual Track */}
                  <div className="relative w-full h-4 sm:h-5 bg-amber-100 rounded-full border border-amber-300 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    />
                  </div>

                  {/* Milestone Flag Labels (2 milestones: 1,000 and 10,000) */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs pt-1">
                    <div className={`flex flex-col items-center text-center p-2 rounded-xl border ${hasHint1 ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black shadow-xs' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                      <span className="font-bold text-xs sm:text-sm">1.000 lần 📜</span>
                      <span className="text-[9px] sm:text-[10px]">{hasHint1 ? '✓ ĐÃ MỞ GỢI Ý 1' : 'Gợi ý lần 1'}</span>
                    </div>
                    <div className={`flex flex-col items-center text-center p-2 rounded-xl border ${hasHint2 ? 'bg-blue-50 border-blue-400 text-blue-950 font-black shadow-xs' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                      <span className="font-bold text-xs sm:text-sm">10.000 lần 💡</span>
                      <span className="text-[9px] sm:text-[10px]">{hasHint2 ? '✓ ĐÃ MỞ GỢI Ý 2' : 'Gợi ý lần 2'}</span>
                    </div>
                  </div>
                </div>

                {/* MILESTONE CARDS: THE 2 REWARDS ONLY */}
                <div className="space-y-3">
                  {/* MILESTONE 1: 1,000 BEATS (GỢI Ý THỨ NHẤT) */}
                  <div
                    className={`relative rounded-2xl p-3.5 sm:p-4 border-2 transition-all ${
                      hasHint1
                        ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-400 shadow-md'
                        : 'bg-white/60 border-dashed border-stone-300 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                            hasHint1
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                              : 'bg-stone-200 text-stone-500 border-stone-300'
                          }`}
                        >
                          {hasHint1 ? <CheckCircle2 className="w-5 h-5" /> : '1K'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900">
                              MỐC 1: GỢI Ý THỨ NHẤT (1.000 LẦN GÕ)
                            </h4>
                            {hasHint1 && (
                              <span className="px-2 py-0.2 bg-emerald-600 text-white text-[9px] font-black rounded-full uppercase">
                                Đã Mở Khóa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600">
                            {hasHint1
                              ? 'Ngọc Hoàng đã truyền lệnh mật báo đầu mối:'
                              : `Còn thiếu ${Math.max(0, 1000 - beats).toLocaleString('vi-VN')} lần gõ trống để mở`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Unlocked Hint 1 Content */}
                    {hasHint1 ? (
                      <div className="mt-2.5 p-3 rounded-xl bg-white border border-emerald-300 shadow-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📜</span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-950">
                              {hint1Text}
                            </span>
                          </div>
                          {hint1Link && (
                            <a
                              href={hint1Link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                            >
                              <span>Mở Facebook Ngọc Hoàng</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-medium text-stone-400 italic">
                        🔒 Đánh đủ 1.000 tiếng trống để kinh động Thiên Cung nhận manh mối thứ nhất.
                      </div>
                    )}
                  </div>

                  {/* MILESTONE 2: 10,000 BEATS (GỢI Ý THỨ HAI) */}
                  <div
                    className={`relative rounded-2xl p-3.5 sm:p-4 border-2 transition-all ${
                      hasHint2
                        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-400 shadow-md'
                        : 'bg-white/60 border-dashed border-stone-300 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                            hasHint2
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-stone-200 text-stone-500 border-stone-300'
                          }`}
                        >
                          {hasHint2 ? <CheckCircle2 className="w-5 h-5" /> : '10K'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900">
                              MỐC 2: GỢI Ý THỨ HAI (10.000 LẦN GÕ)
                            </h4>
                            {hasHint2 && (
                              <span className="px-2 py-0.2 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase">
                                Đã Mở Khóa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600">
                            {hasHint2
                              ? 'Mật khải chi tiết từ Ngai Vàng Thiên Tử:'
                              : `Còn thiếu ${Math.max(0, 10000 - beats).toLocaleString('vi-VN')} lần gõ trống để mở`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Unlocked Hint 2 Content */}
                    {hasHint2 ? (
                      <div className="mt-2.5 p-3 rounded-xl bg-white border border-blue-300 shadow-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">💡</span>
                          <span className="text-xs sm:text-sm font-bold text-blue-950">
                            {hint2Text}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 italic">
                          (Đọc kỹ dòng tiểu sử / bio trên trang Ngọc Hoàng để giải mật mã!)
                        </p>
                        <p className="text-[10px] text-amber-800 font-semibold mt-1">
                          📌 Quy tắc: Password không viết hoa, không dấu, không cách
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-medium text-stone-400 italic">
                        🔒 Đánh đủ 10.000 tiếng trống để nhận gợi ý chí mạng thứ hai.
                      </div>
                    )}
                  </div>

                  {/* STRICT RULE NOTICE: ONLY 2 HINTS, NO OTHER WAY TO GET LINK */}
                  <div className="rounded-2xl p-3.5 sm:p-4 border-2 border-dashed border-amber-300 bg-amber-50/70 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm text-amber-950">
                      <span>🚫</span>
                      <span>TUYỆT ĐỐI KHÔNG CÓ ĐẶC XÁ MỞ LINK TRỰC TIẾP</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-stone-700 max-w-md mx-auto leading-relaxed">
                      Thiên Đình chỉ ban tối đa <strong>2 lần gợi ý</strong> (ở mốc 1.000 và 10.000 lần gõ). Không có bất kỳ cách nào khác để nhận link chơi nếu không giải được pass. Thí chủ hãy dùng 2 gợi ý trên để suy luận và tự mở khóa!
                    </p>
                  </div>
                </div>

                {/* BOTTOM ACTIONS: SWITCH TO PASSWORD FORM */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-amber-200">
                  <p className="text-xs font-bold text-amber-950">
                    Đã đoán ra mật khẩu qua các gợi ý?
                  </p>
                  <button
                    onClick={handleGoToPassword}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-xs border border-amber-500 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <KeyRound className="w-4 h-4 text-amber-950" />
                    <span>Mở Form Nhập Mật Khẩu</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
