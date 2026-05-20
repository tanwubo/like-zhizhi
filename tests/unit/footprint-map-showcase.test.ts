import { describe, expect, it, vi } from "vitest";

import {
  applyMarkerVisualState,
  calculateMarkerLabelOffset,
  paintRouteAnimationFrame,
  waitForMapComplete
} from "@/components/public/footprint-map-showcase";

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

    expect(calculateMarkerLabelOffset(marker, label)).toEqual({ x: -60, y: -56 });
    expect(marker).toHaveClass("is-hidden");
  });

  it("reveals detail labels and photos by route progress without a separate city-name marker", () => {
    const firstLabel = document.createElement("button");
    const firstAnchor = document.createElement("button");
    const secondLabel = document.createElement("button");
    const secondAnchor = document.createElement("button");

    for (const content of [firstLabel, firstAnchor, secondLabel, secondAnchor]) {
      content.className = "footprint-map-marker is-hidden";
    }

    applyMarkerVisualState(
      [
        {
          label: { getContent: () => firstLabel },
          anchor: { getContent: () => firstAnchor }
        },
        {
          label: { getContent: () => secondLabel },
          anchor: { getContent: () => secondAnchor }
        }
      ],
      0,
      0
    );

    expect(firstAnchor).not.toHaveClass("is-hidden");
    expect(secondAnchor).not.toHaveClass("is-hidden");
    expect(firstLabel).not.toHaveClass("is-hidden");
    expect(secondLabel).toHaveClass("is-hidden");
    expect(firstLabel).toHaveClass("is-active");
    expect(secondLabel).not.toHaveClass("is-active");
  });

  it("waits for the AMap complete event before allowing the route animation to start", () => {
    let completeHandler: (() => void) | null = null;
    const map = {
      on: (event: string, handler: () => void) => {
        if (event === "complete") completeHandler = handler;
      },
      off: () => {}
    };
    const ready = vi.fn();

    waitForMapComplete(map, ready);

    expect(ready).not.toHaveBeenCalled();
    completeHandler?.();
    expect(ready).toHaveBeenCalledTimes(1);
  });

  it("animates the route line while keeping the camera on the current line position", () => {
    const route = { setPath: vi.fn() };
    const map = { setCenter: vi.fn() };

    paintRouteAnimationFrame(route, map, [[116, 39]], [117, 40]);

    expect(route.setPath).toHaveBeenCalledWith([
      [116, 39],
      [117, 40]
    ]);
    expect(map.setCenter).toHaveBeenCalledWith([117, 40], true);
  });
});
