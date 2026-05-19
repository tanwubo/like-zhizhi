import { describe, expect, it } from "vitest";

import {
  firstLitDate,
  formatFootprintDate,
  selectMarkerThumbnails,
  toJourneyLabel
} from "@/features/public/footprint-map-data";

describe("footprint map data", () => {
  const place = {
    id: "place_1",
    name: "长沙",
    description: "",
    latitude: "28.2282000",
    longitude: "112.9388000",
    sortOrder: 1,
    coverUrl: null,
    memories: [
      {
        id: "memory_1",
        locationName: "橘子洲",
        address: "",
        visitedAt: new Date("2024-05-01T00:00:00"),
        mood: "",
        story: "",
        sortOrder: 1,
        images: Array.from({ length: 5 }, (_, index) => ({
          id: `image_${index}`,
          url: `https://example.com/${index}.jpg`,
          filename: `${index}.jpg`,
          caption: "",
          sortOrder: index
        }))
      }
    ]
  };

  it("formats date labels", () => {
    expect(formatFootprintDate(new Date("2024-05-01T00:00:00"))).toBe("2024.05.01");
  });

  it("returns the first lit date", () => {
    const date = firstLitDate(place);

    expect(date ? formatFootprintDate(date) : null).toBe("2024.05.01");
  });

  it("selects at most four marker thumbnails", () => {
    expect(selectMarkerThumbnails(place)).toHaveLength(4);
  });

  it("formats journey labels", () => {
    expect(toJourneyLabel(2)).toBe("第 3 站");
  });
});
