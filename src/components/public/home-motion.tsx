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
        className="relative z-10 grid size-7 cursor-pointer place-items-center rounded-full border-0 bg-[#ff6f96] text-[14px] text-white shadow-[0_0_8px_rgba(255,111,150,0.72),0_0_18px_rgba(255,111,150,0.46)] outline-none ring-[#ffbfd0]/75 transition before:absolute before:inset-[-5px] before:rounded-full before:bg-[#ff7fa2]/25 before:blur-[4px] focus-visible:ring-4"
        animate={{
          scale: [1, 1.16, 1],
          boxShadow: [
            "0 0 8px rgba(255,111,150,0.72), 0 0 18px rgba(255,111,150,0.46)",
            "0 0 10px rgba(255,111,150,0.88), 0 0 25px rgba(255,111,150,0.62)",
            "0 0 8px rgba(255,111,150,0.72), 0 0 18px rgba(255,111,150,0.46)"
          ]
        }}
        transition={{
          duration: 1.65,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.22,
          boxShadow: "0 0 12px rgba(255,111,150,0.9), 0 0 30px rgba(255,111,150,0.68)"
        }}
        whileTap={{
          scale: 0.82,
          transition: { duration: 0.12 }
        }}
        onClick={() => {
          setBurstId((current) => current + 1);
        }}
      >
        <span className="relative z-10 leading-none">{"\u2665"}</span>
      </motion.button>
    </div>
  );
}

export function AvatarMotionFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative grid size-[134px] place-items-center overflow-hidden rounded-full border-2 border-white/90 bg-white/20 shadow-[0_5px_14px_rgba(80,63,72,0.16),0_0_0_1px_rgba(255,255,255,0.35)] md:size-[154px]"
      whileHover={{ scale: 1.04, boxShadow: "0 7px 18px rgba(80,63,72,0.2), 0 0 0 1px rgba(255,255,255,0.5)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}
