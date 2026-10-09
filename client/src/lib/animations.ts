/**
 * Reusable Framer Motion animation variants and wrapper components.
 *
 * Design principles:
 * - All variants respect `prefers-reduced-motion` via Framer Motion's
 *   built-in `useReducedMotion` / `MotionConfig`; caller can wrap with
 *   <MotionConfig reducedMotion="user"> if needed.
 * - Row-level animation is intentionally excluded — only containers,
 *   panels, and key UI moments get animated. This keeps performance
 *   acceptable on lower-end devices.
 * - Import the variants here and spread them on `<motion.X>` elements
 *   rather than writing inline animation objects per component.
 */

import { Variants } from "framer-motion";

// ─── Fade Up ──────────────────────────────────────────────────────────────────
// General entrance: fade in + rise 18px. Use for cards, panels, sections.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─── Stagger Container ────────────────────────────────────────────────────────
// Wraps a list of `fadeUp` children and staggers them 60ms apart.
// Usage: <motion.div variants={staggerContainer} initial="hidden" animate="visible">
//          {items.map(i => <motion.div key={i} variants={fadeUp}>…</motion.div>)}
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

// ─── Slide In ─────────────────────────────────────────────────────────────────
// Horizontal slide for tab panels / section transitions.
export const slideIn: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

// ─── Scale Pop ────────────────────────────────────────────────────────────────
// Subtle scale entrance for KPI numbers and badges.
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }, // spring-like
  },
};

// ─── Glow Pulse (CSS keyframe, applied via className) ────────────────────────
// For cards that should pulse the sky glow on mount — inject this CSS once
// and add className="anim-glow-pulse" to the element.
//
// We export the keyframe as a style string so it can be injected once via
// a <style> tag in the component that needs it, keeping it co-located.
export const glowPulseKeyframes = `
@keyframes glowPulse {
  0%   { box-shadow: 0 0 0   rgba(249, 115, 22, 0);    }
  40%  { box-shadow: 0 0 28px rgba(249, 115, 22, 0.32); }
  100% { box-shadow: 0 0 0   rgba(249, 115, 22, 0);    }
}
.anim-glow-pulse {
  animation: glowPulse 1.2s ease-out forwards;
}
`;
