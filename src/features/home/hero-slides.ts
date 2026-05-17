type HeroSlideMedia = {
  publicUrl: string;
  type: string;
};

type HeroSlideAlbumItem = {
  media: HeroSlideMedia;
};

type ManagedCarouselSlide = {
  imageUrl: string;
};

export function buildHomeHeroSlides({
  carouselSlides = [],
  backgroundImageUrl,
  albumItems,
  limit = 4
}: {
  carouselSlides?: ManagedCarouselSlide[];
  backgroundImageUrl: string | null;
  albumItems: HeroSlideAlbumItem[];
  limit?: number;
}) {
  const slides = new Set<string>();

  for (const slide of carouselSlides) {
    if (slides.size >= limit) {
      break;
    }

    if (slide.imageUrl) {
      slides.add(slide.imageUrl);
    }
  }

  if (slides.size > 0) {
    return [...slides].slice(0, limit);
  }

  if (backgroundImageUrl) {
    slides.add(backgroundImageUrl);
  }

  for (const item of albumItems) {
    if (slides.size >= limit) {
      break;
    }

    if (item.media.type === "IMAGE") {
      slides.add(item.media.publicUrl);
    }
  }

  return [...slides].slice(0, limit);
}
