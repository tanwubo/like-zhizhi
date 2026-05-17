"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function HeartPulse() {
  return (
    <motion.div
      className="grid size-16 cursor-pointer place-items-center rounded-full bg-[#ff5f86] text-3xl text-white shadow-[0_16px_40px_rgba(255,95,134,0.32)]"
      animate={{
        scale: [1, 1.08, 1],
        boxShadow: [
          "0 16px 40px rgba(255,95,134,0.32)",
          "0 20px 50px rgba(255,95,134,0.5)",
          "0 16px 40px rgba(255,95,134,0.32)"
        ]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileTap={{
        scale: 0.9,
        transition: { duration: 0.15 }
      }}
      onClick={() => {
        console.log("Heart clicked");
      }}
    >
      ♥
    </motion.div>
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
