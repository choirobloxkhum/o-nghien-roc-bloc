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
    const size = 28 + Math.random() * 10; // 28px to 38px
    const rotation = (Math.random() - 0.5) * 35; // gentle tilt
    const duration = 3.0; // 3 seconds duration

    const isMobile = window.innerWidth < 768;
    const maxItems = isMobile ? 5 : 12;

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

    setEmojis((prev) => [...prev.slice(-maxItems), newItem]);
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
              scale: 0.5,
              rotate: 0,
            }}
            animate={{
              x: item.x - item.size / 2 + item.angle,
              y: item.y - item.size / 2 + item.distance,
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.15, 1.2, 1],
              rotate: item.rotation,
            }}
            transition={{
              duration: item.duration,
              times: [0, 0.1, 0.7, 1], // Stays clearly visible from 0.3s to 2.1s, then fades out gently in last 0.9s
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
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
