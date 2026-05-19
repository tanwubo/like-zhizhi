export type PublicFootprintImage = {
  id: string;
  url: string;
  filename: string;
  caption: string;
  sortOrder: number;
};

export type PublicFootprintMemory = {
  id: string;
  locationName: string;
  address: string;
  visitedAt: Date;
  mood: string;
  story: string;
  sortOrder: number | null;
  images: PublicFootprintImage[];
};

export type PublicFootprintPlace = {
  id: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  sortOrder: number;
  coverUrl: string | null;
  memories: PublicFootprintMemory[];
};

export function formatFootprintDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function firstLitDate(place: PublicFootprintPlace) {
  const timestamps = place.memories.map((memory) => memory.visitedAt.getTime()).filter(Number.isFinite);

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.min(...timestamps));
}

export function selectMarkerThumbnails(place: PublicFootprintPlace) {
  return place.memories
    .flatMap((memory) =>
      memory.images.map((image) => ({
        ...image,
        memoryId: memory.id,
        visitedAt: memory.visitedAt
      }))
    )
    .sort((left, right) => left.sortOrder - right.sortOrder || right.visitedAt.getTime() - left.visitedAt.getTime())
    .slice(0, 4);
}

export function toJourneyLabel(index: number) {
  return `第 ${index + 1} 站`;
}
