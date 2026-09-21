import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingEmoji {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  duration: number;
}

const EMOJI_POOL = ['⭐️', '☀️', '☁️', '💧', '🌷', '🌱'];

export const FloatingEmojiClickEffect: React.FC = () => {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if the click was on an interactive functional element
    const isInteractive = target.closest(
      'button, a, input, select, textarea, [role="button"], audio, video, label, .clickable-control'
    );

    if (isInteractive) return;

    const clickX = e.clientX;
    const clickY = e.clientY;

    // Generate exactly 1 random emoji per click
    const randomEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
    const spreadX = (Math.random() - 0.5) * 40; // slight horizontal drift
    const spreadY = -90 - Math.random() * 50; // float up 90px to 140px
    const size = 26 + Math.random() * 8; // 26px to 34px
    const rotation = (Math.random() - 0.5) * 30; // gentle tilt
    const duration = 1.2; // 1.2 seconds duration for swift, snappy cleanup

    const isMobile = window.innerWidth < 768;
    const maxItems = isMobile ? 3 : 5;

    const newItem: FloatingEmoji = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
      emoji: randomEmoji,
      angle: spreadX,
      distance: spreadY,
      size,
      rotation,
      duration,
    };

    setEmojis((prev) => [...prev.slice(-(maxItems - 1)), newItem]);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [handleGlobalClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      <AnimatePresence>
        {emojis.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              x: item.x - item.size / 2,
              y: item.y - item.size / 2,
              opacity: 0,
              scale: 0.6,
              rotate: 0,
            }}
            animate={{
              x: item.x - item.size / 2 + item.angle,
              y: item.y - item.size / 2 + item.distance,
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.1, 1.15, 1],
              rotate: item.rotation,
            }}
            transition={{
              duration: item.duration,
              times: [0, 0.15, 0.75, 1],
              ease: 'easeOut',
            }}
            onAnimationComplete={() => {
              setEmojis((prev) => prev.filter((em) => em.id !== item.id));
            }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              fontSize: `${item.size}px`,
              willChange: 'transform, opacity',
              textShadow: '0 2px 5px rgba(0,0,0,0.15)',
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
