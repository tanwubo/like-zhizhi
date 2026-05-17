export type CarouselSlideMoveDirection = "up" | "down";

export type SortableCarouselSlide = {
  id: string;
  sortOrder: number;
  updatedAt: Date;
};

export function sortCarouselSlides(slides: SortableCarouselSlide[]) {
  return [...slides].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return right.updatedAt.getTime() - left.updatedAt.getTime();
  });
}

export function resolveCarouselSlideMove(
  slides: SortableCarouselSlide[],
  currentId: string,
  direction: CarouselSlideMoveDirection
) {
  const orderedSlides = sortCarouselSlides(slides);
  const currentIndex = orderedSlides.findIndex((slide) => slide.id === currentId);

  if (currentIndex < 0) {
    return null;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const target = orderedSlides[targetIndex];
  const current = orderedSlides[currentIndex];

  if (!target || !current) {
    return null;
  }

  return {
    current: { id: current.id, sortOrder: target.sortOrder },
    target: { id: target.id, sortOrder: current.sortOrder }
  };
}

export function resolveCarouselSlideMoveOrder(
  slides: SortableCarouselSlide[],
  currentId: string,
  direction: CarouselSlideMoveDirection
) {
  const orderedSlides = sortCarouselSlides(slides);
  const currentIndex = orderedSlides.findIndex((slide) => slide.id === currentId);

  if (currentIndex < 0) {
    return [];
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= orderedSlides.length) {
    return [];
  }

  const nextSlides = [...orderedSlides];
  [nextSlides[currentIndex], nextSlides[targetIndex]] = [nextSlides[targetIndex], nextSlides[currentIndex]];

  return nextSlides.map((slide, index) => ({
    id: slide.id,
    sortOrder: (index + 1) * 10
  }));
}
