import { describe, expect, it } from "vitest";

import { calculateMarkerLabelOffset } from "@/components/public/footprint-map-showcase";

describe("footprint map showcase marker positioning", () => {
  it("places the label above the coordinate without using gallery height as the anchor", () => {
    const marker = document.createElement("button");
    marker.className = "footprint-map-marker footprint-map-marker-label is-hidden";

    const label = document.createElement("div");
    label.className = "marker-label";
    marker.append(label);

    const gallery = document.createElement("div");
    gallery.className = "marker-gallery";
    marker.append(gallery);

    marker.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 60,
        width: 120,
        height: 120,
        right: 220,
        bottom: 180
      }) as DOMRect;

    label.getBoundingClientRect = () => {
      const hiddenScale = marker.classList.contains("is-hidden") ? 0.78 : 1;
      return {
        left: hiddenScale === 1 ? 130 : 123.4,
        top: hiddenScale === 1 ? 84 : 78.72,
        width: 60 * hiddenScale,
        height: 20 * hiddenScale,
        right: (hiddenScale === 1 ? 130 : 123.4) + 60 * hiddenScale,
        bottom: (hiddenScale === 1 ? 84 : 78.72) + 20 * hiddenScale
      } as DOMRect;
    };

    expect(calculateMarkerLabelOffset(marker, label)).toEqual({ x: -60, y: -68 });
    expect(marker).toHaveClass("is-hidden");
  });
});
