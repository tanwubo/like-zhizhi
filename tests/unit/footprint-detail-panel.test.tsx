import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FootprintDetailPanel } from "@/components/public/footprint-detail-panel";
import type { PublicFootprintPlace } from "@/features/public/footprint-map-data";

describe("FootprintDetailPanel", () => {
  const place: PublicFootprintPlace = {
    id: "place_1",
    name: "长沙",
    description: "一起去过的地方",
    latitude: "28.2282000",
    longitude: "112.9388000",
    sortOrder: 1,
    coverUrl: null,
    memories: [
      {
        id: "memory_1",
        locationName: "橘子洲",
        address: "",
        visitedAt: new Date("2026-05-20T00:00:00"),
        mood: "晴天",
        story: "散步",
        sortOrder: 1,
        images: [
          {
            id: "image_1",
            url: "https://example.com/photo.jpg",
            filename: "photo.jpg",
            caption: "江边合照",
            sortOrder: 1
          }
        ]
      }
    ]
  };

  it("notifies the parent when a memory image is clicked", () => {
    const onImageOpen = vi.fn();

    render(
      <FootprintDetailPanel
        index={0}
        onClose={vi.fn()}
        onImageOpen={onImageOpen}
        onNext={vi.fn()}
        onPrev={vi.fn()}
        place={place}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "查看江边合照" }));

    expect(onImageOpen).toHaveBeenCalledWith(place.memories[0].images[0]);
  });
});
