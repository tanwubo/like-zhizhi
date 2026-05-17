import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHeroCarousel } from "@/components/public/home-hero-carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselOptions
} from "@/components/ui/carousel";

describe("public home carousel", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: vi.fn(() => []),
        unobserve: vi.fn()
      }))
    });
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: window.IntersectionObserver
    });
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn()
      }))
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: window.ResizeObserver
    });
  });

  it("uses reusable carousel primitives with loop enabled", () => {
    const opts: CarouselOptions = { loop: true };

    render(
      <Carousel opts={opts}>
        <CarouselContent>
          <CarouselItem>第一张</CarouselItem>
          <CarouselItem>第二张</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByTestId("carousel")).toHaveAttribute("data-loop", "true");
    expect(screen.getByText("第一张")).toHaveAttribute("data-slot", "carousel-item");
  });

  it("renders homepage slides with five second autoplay and infinite looping", () => {
    render(<HomeHeroCarousel slides={["/one.jpg", "/two.jpg"]} />);

    const carousel = screen.getByTestId("home-hero-carousel");

    expect(carousel).toHaveAttribute("data-loop", "true");
    expect(carousel).toHaveAttribute("data-autoplay-delay", "5000");
    expect(screen.getByLabelText("第 1 张轮播图")).toHaveStyle({ backgroundImage: 'url("/one.jpg")' });
    expect(screen.getByRole("button", { name: "切换到第 2 张" })).toBeInTheDocument();
  });
});
