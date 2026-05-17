"use client";

import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, type CSSProperties } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import { cn } from "@/lib/cn";

const AUTOPLAY_DELAY = 5000;
const TRANSITION_DURATION = 400; // 淡入淡出过渡时间，单位毫秒

export function HomeHeroCarousel({ slides }: { slides: string[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const usableSlides = slides.filter(Boolean);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => setSelectedIndex(api.selectedScrollSnap());

    handleSelect();
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  if (usableSlides.length === 0) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#dcefd5]" data-testid="home-hero-carousel">
        <HeroOverlay />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden"
      data-autoplay-delay={AUTOPLAY_DELAY}
      data-loop="true"
      data-testid="home-hero-carousel"
    >
      <Carousel
        className="h-full [&_[data-slot=carousel-content]]:h-full [&_[data-slot=carousel-viewport]]:h-full"
        opts={{
          loop: true,
          duration: 0, // 禁用Embla默认滑动动画，完全由我们自己控制淡入淡出
          dragFree: false,
          watchDrag: false, // 禁用拖动，避免滑动交互
        }}
        plugins={[
          Autoplay({
            delay: AUTOPLAY_DELAY,
            stopOnInteraction: false,
            stopOnMouseEnter: true
          })
        ]}
        setApi={setApi}
      >
        <CarouselContent className="h-full -ml-0 relative !transform-none !transition-none">
          {usableSlides.map((slide, index) => (
            <CarouselItem
              aria-label={`第 ${index + 1} 张轮播图`}
              className={cn(
                "absolute inset-0 h-full bg-cover bg-center pl-0 transition-opacity ease-in-out",
                selectedIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
              style={{
                backgroundImage: `url("${slide}")`,
                transitionDuration: `${TRANSITION_DURATION}ms`
              } as CSSProperties}
              key={`${slide}-${index}`}
            >
              <span className="sr-only">轮播图 {index + 1}</span>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {usableSlides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center gap-2">
          {usableSlides.map((slide, index) => (
            <button
              aria-label={`切换到第 ${index + 1} 张`}
              className={cn(
                "h-2.5 rounded-full border border-white/70 bg-white/45 shadow-sm backdrop-blur-md transition-all",
                selectedIndex === index ? "w-8 bg-white" : "w-2.5 hover:bg-white/75"
              )}
              key={`${slide}-dot-${index}`}
              onClick={() => api?.scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
      <HeroOverlay />
    </div>
  );
}

function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,249,219,0.55)_0%,rgba(255,255,255,0.08)_45%,rgba(79,126,75,0.3)_100%),radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.7),transparent_30%)]" />
  );
}
