"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const heartParticles = [
  { x: -92, y: -84, rotate: -24, delay: 0 },
  { x: -36, y: -116, rotate: -8, delay: 0.03 },
  { x: 36, y: -116, rotate: 8, delay: 0.06 },
  { x: 92, y: -84, rotate: 24, delay: 0.09 },
  { x: -108, y: 0, rotate: -18, delay: 0.05 },
  { x: 108, y: 0, rotate: 18, delay: 0.08 },
  { x: -56, y: 76, rotate: -12, delay: 0.1 },
  { x: 56, y: 76, rotate: 12, delay: 0.13 }
];

export function HeartPulse() {
  const [burstId, setBurstId] = useState(0);

  useEffect(() => {
    if (!burstId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBurstId(0);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [burstId]);

  return (
    <div className="relative grid place-items-center">
      <AnimatePresence>
        {burstId ? (
          <motion.div
            key={burstId}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 grid place-items-center"
            data-testid="heart-burst"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {heartParticles.map((particle, index) => (
              <motion.span
                key={`${burstId}-${index}`}
                className="absolute text-[28px] text-[#ff5f86]"
                data-testid="heart-particle"
                initial={{ opacity: 0, scale: 0.2, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.2, 1.35, 0.75],
                  x: particle.x,
                  y: particle.y,
                  rotate: particle.rotate
                }}
                transition={{
                  delay: particle.delay,
                  duration: 1.15,
                  ease: "easeOut"
                }}
              >
                {"\u2665"}
              </motion.span>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        aria-label="heart animation"
        className="relative z-10 grid size-[38px] cursor-pointer place-items-center rounded-full border-0 bg-[#ff5f86] text-[18px] text-white shadow-[0_10px_28px_rgba(255,95,134,0.34)] outline-none ring-[#ff9ab3]/90 transition focus-visible:ring-8"
        animate={{
          scale: [1, 1.16, 1],
          boxShadow: [
            "0 10px 28px rgba(255,95,134,0.34)",
            "0 22px 78px rgba(255,95,134,0.84)",
            "0 10px 28px rgba(255,95,134,0.34)"
          ]
        }}
        transition={{
          duration: 1.65,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.28,
          boxShadow: "0 28px 92px rgba(255,95,134,0.9)"
        }}
        whileTap={{
          scale: 0.82,
          transition: { duration: 0.12 }
        }}
        onClick={() => {
          setBurstId((current) => current + 1);
        }}
      >
        {"\u2665"}
      </motion.button>
    </div>
  );
}

export function AvatarMotionFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative grid size-32 place-items-center rounded-full bg-white/75 shadow-[0_18px_50px_rgba(61,86,54,0.18),0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-sm md:size-40"
      whileHover={{ scale: 1.05, boxShadow: "0 25px 60px rgba(61,86,54,0.25), 0 0 30px rgba(255,255,255,0.5)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}
