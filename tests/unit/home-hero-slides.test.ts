import { describe, expect, it } from "vitest";

import { buildHomeHeroSlides } from "@/features/home/hero-slides";

describe("home hero slides", () => {
  it("uses managed carousel slides before fallback images", () => {
    const slides = buildHomeHeroSlides({
      carouselSlides: [
        { imageUrl: "https://example.com/slide-1.jpg" },
        { imageUrl: "https://example.com/slide-2.jpg" }
      ],
      backgroundImageUrl: "https://example.com/theme.jpg",
      albumItems: [{ media: { publicUrl: "https://example.com/album-1.jpg", type: "IMAGE" } }]
    });

    expect(slides).toEqual(["https://example.com/slide-1.jpg", "https://example.com/slide-2.jpg"]);
  });

  it("uses the theme background first and fills with unique album images", () => {
    const slides = buildHomeHeroSlides({
      carouselSlides: [],
      backgroundImageUrl: "https://example.com/theme.jpg",
      albumItems: [
        { media: { publicUrl: "https://example.com/theme.jpg", type: "IMAGE" } },
        { media: { publicUrl: "https://example.com/album-1.jpg", type: "IMAGE" } },
        { media: { publicUrl: "https://example.com/video.mp4", type: "VIDEO" } },
        { media: { publicUrl: "https://example.com/album-2.jpg", type: "IMAGE" } },
        { media: { publicUrl: "https://example.com/album-3.jpg", type: "IMAGE" } }
      ],
      limit: 3
    });

    expect(slides).toEqual([
      "https://example.com/theme.jpg",
      "https://example.com/album-1.jpg",
      "https://example.com/album-2.jpg"
    ]);
  });

  it("falls back to album images when no theme background is configured", () => {
    const slides = buildHomeHeroSlides({
      carouselSlides: [],
      backgroundImageUrl: null,
      albumItems: [
        { media: { publicUrl: "https://example.com/album-1.jpg", type: "IMAGE" } },
        { media: { publicUrl: "https://example.com/album-2.jpg", type: "IMAGE" } }
      ]
    });

    expect(slides).toEqual(["https://example.com/album-1.jpg", "https://example.com/album-2.jpg"]);
  });
});
