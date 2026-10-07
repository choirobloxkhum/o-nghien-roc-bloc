import confetti from 'canvas-confetti';

/**
 * Centralized Confetti Fire Helper that respects "Giảm effect" (reduced motion mode).
 * In reduced motion mode: cuts particles down to 15-20 with small spread, avoiding frame drops.
 */
export function fireConfetti(options: confetti.Options = {}, isReducedMotion?: boolean) {
  const isReduced =
    isReducedMotion ??
    (typeof document !== 'undefined' &&
      document.documentElement.classList.contains('reduced-motion-mode'));

  if (isReduced) {
    return confetti({
      origin: { y: 0.6 },
      ...options,
      particleCount: Math.min(options.particleCount || 15, 15),
      spread: Math.min(options.spread || 45, 45),
      ticks: 80,
      decay: 0.92,
      gravity: 1.2,
      scalar: 0.8,
    });
  }

  return confetti(options);
}
