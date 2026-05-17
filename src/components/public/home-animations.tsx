"use client";

import { useEffect } from "react";

export function HomeAnimations() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-motion-ready");

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".home-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("home-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12
      }
    );

    const enterTimer = window.setTimeout(() => {
      document.querySelectorAll(".home-hero-person, .home-heart").forEach((element) => {
        element.classList.add("home-visible");
      });

      revealItems.forEach((element) => observer.observe(element));
    }, 220);

    return () => {
      window.clearTimeout(enterTimer);
      observer.disconnect();
      root.classList.remove("home-motion-ready");
    };
  }, []);

  return null;
}
