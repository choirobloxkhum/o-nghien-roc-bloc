import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RobloxTopBar } from './components/RobloxTopBar';
import { RobloxAvatarCompanion } from './components/RobloxAvatarCompanion';
import { RobloxLoadingScreen } from './components/RobloxLoadingScreen';
import { JumpscareOverlay } from './components/JumpscareOverlay';
import { RobloxBackground } from './components/RobloxBackground';
import { RPCharacterHub } from './components/RPCharacterHub';
import { FloatingEmojiClickEffect } from './components/FloatingEmojiClickEffect';
import {
  playUiClick,
  playHoverTick,
  playVictoryChime,
  playBoingSound,
} from './utils/audio';
import {
  startChillBgm,
  stopChillBgm,
} from './utils/chillBgm';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'rphub'>('welcome');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [companionDialogue, setCompanionDialogue] = useState('Welcome my roblox\nkid ദ്ദി(~ ` ᴗ - ~) ✧');
  const [companionReaction, setCompanionReaction] = useState<'idle' | 'happy' | 'scared' | 'excited'>('idle');
  const [noClickCount, setNoClickCount] = useState(0);
  const [noButtonOffset, setNoButtonOffset] = useState({ x: 0, y: 0 });
  const pianoAudioRef = useRef<HTMLAudioElement | null>(null);

  // Background Piano Music Controls: Mute/Pause during Jumpscare or when disabled
  useEffect(() => {
    if (pianoAudioRef.current) {
      if (showJumpscare || !soundEnabled || currentScreen !== 'welcome') {
        pianoAudioRef.current.pause();
      } else {
        pianoAudioRef.current.play().catch(() => {});
      }
    }
  }, [showJumpscare, soundEnabled, currentScreen]);

  // Handle Chill Background Music Lifecycle: ONLY active when inside the RP Character Hub ('rphub')
  useEffect(() => {
    if (currentScreen === 'rphub' && soundEnabled && !showJumpscare) {
      startChillBgm(0.5);
    } else {
      stopChillBgm();
    }
  }, [currentScreen, soundEnabled, showJumpscare]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next && currentScreen === 'rphub') {
        playUiClick(true);
        startChillBgm(0.5);
      } else {
        stopChillBgm();
      }
      return next;
    });
  };

  const handleHoverYes = () => {
    playHoverTick(soundEnabled);
    setCompanionDialogue('Đúng rùi! Nhấn CÓ để vào quẩy game nè! ✨');
    setCompanionReaction('excited');
  };

  const handleHoverNo = () => {
    playHoverTick(soundEnabled);
    if (noClickCount === 0) {
      setCompanionDialogue('Ủa sao lại chỉ vào Khum dợ?! 🥺');
      setCompanionReaction('scared');
    } else if (noClickCount === 1) {
      setCompanionDialogue('Bấm trúng sao được mà bấm lêu lêu 😜');
      setCompanionReaction('scared');
    } else {
      setCompanionDialogue('Đừng cố chấp nữa... bạn sẽ hối hận đó 💀');
      setCompanionReaction('scared');
    }
  };

  const handleLeaveButtons = () => {
    if (companionReaction !== 'scared') {
      setCompanionDialogue('Welcome my roblox\nkid ദ്ദി(~ ` ᴗ - ~) ✧');
      setCompanionReaction('idle');
    }
  };

  const handleClickYes = () => {
    playUiClick(soundEnabled);
    setCompanionDialogue('Yayyy! Chuẩn bị quẩy game thôi! 🎉');
    setCompanionReaction('happy');
    setShowJoinModal(true);
    // Reset No button state
    setNoClickCount(0);
    setNoButtonOffset({ x: 0, y: 0 });
  };

  const getRandomOffset = () => {
    // Generate an evasive jump offset (between 80px and 160px away in X/Y)
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 70;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    return { x: offsetX, y: offsetY };
  };

  const handleClickNo = () => {
    const nextCount = noClickCount + 1;
    setNoClickCount(nextCount);

    if (nextCount < 3) {
      // Button dodges/jumps to a new spot so player can't easily click it
      playBoingSound(soundEnabled);
      setNoButtonOffset(getRandomOffset());

      if (nextCount === 1) {
        setCompanionDialogue('Ủa lêu lêu né được rồi nha! Không cho bấm đâu 😝');
        setCompanionReaction('happy');
      } else if (nextCount === 2) {
        setCompanionDialogue('Ta nói lì mà không nghe! Lần sau là toang ráng chịu nha... 😰');
        setCompanionReaction('scared');
      }
    } else {
      // 3rd attempt: TRIGGER JUMPSCARE
      setCompanionDialogue('Á Á Á! TA NÓI LÌ MÀ KHÔNG NGHE! 😱');
      setCompanionReaction('scared');
      setShowJumpscare(true);
      // Reset position so button is accessible next time
      setNoClickCount(0);
      setNoButtonOffset({ x: 0, y: 0 });
    }
  };

  const handleAvatarClick = () => {
    playBoingSound(soundEnabled);
    const quotes = [
      'Welcome my roblox\nkid ദ്ദി(~ ` ᴗ - ~) ✧',
      'mình là cục cưng\nbạn đối xử tệ bạc với mình thì bạn là cục cứt\n(゜Д゜≡゜Д゜)?',
      'gu mộng chè là Thế Trí🫦',
      'roblox kid muôn năm‼️',
      'chơi đi bấm vô đây chi quài zị(　｀Å´)',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCompanionDialogue(randomQuote);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 },
    });
  };

  const handleEnterGame = () => {
    setShowJoinModal(false);
    setCurrentScreen('rphub');
    try {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {}
    playVictoryChime(soundEnabled);
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  if (currentScreen === 'rphub') {
    return (
      <>
        <FloatingEmojiClickEffect />
        <RPCharacterHub
          onBackToWelcome={() => {
            playUiClick(soundEnabled);
            setCurrentScreen('welcome');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      </>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none font-dessert"
      style={{ backgroundColor: '#87CEEB' }}
    >
      {/* Global Interactive Floating Emoji Click Effect */}
      <FloatingEmojiClickEffect />
      {/* Background Landscape Construction */}
      <RobloxBackground />

      {/* Top Bar Header */}
      <RobloxTopBar
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Background Gentle Instrumental Piano Music (Turns off when entering rphub screen or during jumpscare) */}
      <audio
        ref={pianoAudioRef}
        autoPlay
        loop
        muted={!soundEnabled || showJumpscare}
        src="https://upload.wikimedia.org/wikipedia/commons/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg"
      />

      {/* Main Interactive Center Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-5xl mx-auto w-full text-center">
        {/* Waving Roblox Character Companion */}
        <div className="mb-2 sm:mb-4">
          <RobloxAvatarCompanion
            dialogue={companionDialogue}
            reaction={companionReaction}
            onClickAvatar={handleAvatarClick}
          />
        </div>

        {/* Cute Enhanced Main Welcome Container with Twinkling Sparkles and Celestial Glow */}
        <div className="relative max-w-3xl w-full flex items-center justify-center">
          {/* CELESTIAL AMBIENT AURA GLOW BEHIND MAIN CARD */}
          <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-sky-400/35 via-amber-300/30 to-pink-400/35 rounded-[50px] blur-3xl opacity-80 pointer-events-none animate-pulse" />

          {/* Twinkling Top-Left Sparkle Gem */}
          <div className="absolute -top-4 -left-4 sm:-top-7 sm:-left-7 z-20 pointer-events-none">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center"
            >
              <Sparkles className="w-9 h-9 sm:w-12 sm:h-12 text-yellow-300 fill-yellow-200 drop-shadow-[0_2px_12px_rgba(253,224,71,0.9)]" />
            </motion.div>
          </div>

          {/* Twinkling Top-Right Star Gem */}
          <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 z-20 pointer-events-none hidden sm:block">
            <motion.div
              animate={{ rotate: [0, -15, 15, 0], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="flex items-center justify-center"
            >
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-pink-300 fill-pink-300 drop-shadow-[0_2px_10px_rgba(244,114,182,0.8)]" />
            </motion.div>
          </div>

          {/* Main Glass Card with gentle float */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.35 }}
            className="relative z-10 flex flex-col items-center text-center px-6 sm:px-14 md:px-20 py-8 sm:py-10 md:py-12 rounded-[40px] bg-white/45 backdrop-blur-md border-[6px] border-white shadow-[0_20px_60px_rgba(2,132,199,0.35),0_0_50px_rgba(255,255,255,0.6)] w-full overflow-hidden"
          >
            {/* Subtle top rainbow edge sheen */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-400 via-yellow-300 via-emerald-400 to-sky-400 opacity-75" />

            {/* Stylized Clean Bold Rounded Headline stacked on two lines */}
            <motion.h1
              id="roblox-main-title"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-white text-5xl sm:text-7xl md:text-8xl font-black mb-6 sm:mb-8 dessert-title-shadow tracking-tight leading-tight flex flex-col items-center gap-0 sm:gap-1 relative z-10"
            >
              <span>Chơi Roblox</span>
              <span>Khum?</span>
            </motion.h1>

            {/* TWO DISTINCT LARGE INTERACTION BUTTONS */}
            <div
              onMouseLeave={handleLeaveButtons}
              className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center justify-center w-full my-2 relative z-10"
            >
              {/* Green Button (Có) with Inviting Energy Rings & Sweep Highlight */}
              <div className="relative w-full sm:w-[240px] h-[85px] sm:h-[100px] flex items-center justify-center">
                {/* Expanding Aura Wave Rings */}
                <div className="absolute inset-0 rounded-[34px] bg-emerald-400/40 animate-aura-ring-1 pointer-events-none blur-sm" />
                <div className="absolute inset-0 rounded-[34px] bg-green-400/30 animate-aura-ring-2 pointer-events-none blur-md" />

                {/* Glowing Aura Halo */}
                <div className="absolute -inset-2 rounded-[38px] bg-gradient-to-r from-emerald-400/50 via-green-400/60 to-lime-400/50 blur-lg animate-pulse pointer-events-none" />

                <button
                  id="btn-choice-yes"
                  onMouseEnter={handleHoverYes}
                  onClick={handleClickYes}
                  className="group relative w-full h-full cursor-pointer focus:outline-none animate-aura-pulse transition-transform active:scale-95"
                >
                  {/* 3D Depth Base */}
                  <div className="absolute inset-0 bg-[#2e7d32] rounded-[30px] translate-y-2 shadow-xl" />

                  {/* Top Face */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#5cd862] via-[#4CAF50] to-[#43A047] hover:from-[#6ae370] hover:to-[#4bb24f] rounded-[30px] border-t border-white/40 border-b-4 border-[#2e7d32] flex items-center justify-center overflow-hidden transition-all shadow-[0_0_24px_rgba(76,175,80,0.7)]">
                    {/* Gloss highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-[30px] pointer-events-none" />

                    {/* Sweep light effect on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                    <span className="text-white text-4xl sm:text-5xl font-bold flex items-center gap-2.5 sleek-btn-text-shadow font-dessert">
                      <Check className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3.5] text-white drop-shadow" />
                      <span>Có</span>
                    </span>
                  </div>
                </button>
              </div>

              {/* Red Button (Khum) with Dodging Movement Animation */}
              <motion.div
                animate={{
                  x: noButtonOffset.x,
                  y: noButtonOffset.y,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 22,
                }}
                className="w-full sm:w-[240px] h-[85px] sm:h-[100px] z-30"
              >
                <button
                  id="btn-choice-no"
                  onMouseEnter={handleHoverNo}
                  onClick={handleClickNo}
                  className="group relative w-full h-full cursor-pointer focus:outline-none transition-transform active:scale-95 hover:scale-[1.02]"
                >
                  {/* 3D Depth Base */}
                  <div className="absolute inset-0 bg-[#b71c1c] rounded-[30px] translate-y-2 shadow-lg" />

                  {/* Top Face */}
                  <div className="absolute inset-0 bg-[#F44336] hover:bg-[#fa4f42] rounded-[30px] border-t border-white/20 border-b-4 border-[#d32f2f] flex items-center justify-center transition-transform active:translate-y-1 overflow-hidden">
                    {/* Gloss highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent rounded-[30px] pointer-events-none" />

                    <span className="text-white text-4xl sm:text-5xl font-bold flex items-center gap-2.5 sleek-btn-text-shadow font-dessert">
                      <X className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3.5]" />
                      <span>Khum</span>
                    </span>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Floating Bottom-Right Facebook Icon Link */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          id="btn-facebook-link"
          href="https://www.facebook.com/profile.php?id=61590620211736"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playUiClick(soundEnabled)}
          title="Facebook"
          aria-label="Facebook Profile"
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1877F2] hover:bg-[#0c6be9] border-2 border-white/80 shadow-[0_8px_20px_rgba(24,119,242,0.45)] hover:shadow-[0_12px_28px_rgba(24,119,242,0.6)] transform hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Subtle glossy top shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          {/* Facebook 'f' Logo */}
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 fill-white drop-shadow-sm transform group-hover:scale-105 transition-transform"
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {/* Pulse highlight ring */}
          <div className="absolute -inset-1 rounded-full border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </a>
      </div>

      {/* Loading Progress Screen when clicking CÓ */}
      <AnimatePresence>
        {showJoinModal && (
          <RobloxLoadingScreen
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            onEnterGame={handleEnterGame}
            soundEnabled={soundEnabled}
            onPlayClickSound={() => playUiClick(soundEnabled)}
            onPlayVictorySound={() => playVictoryChime(soundEnabled)}
          />
        )}
      </AnimatePresence>

      {/* Jumpscare Overlay when clicking KHUM */}
      <AnimatePresence>
        {showJumpscare && (
          <JumpscareOverlay
            isOpen={showJumpscare}
            onClose={() => setShowJumpscare(false)}
            onSelectYes={() => {
              setShowJumpscare(false);
              setShowJoinModal(true);
            }}
            soundEnabled={soundEnabled}
            onPlayClickSound={() => playUiClick(soundEnabled)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


