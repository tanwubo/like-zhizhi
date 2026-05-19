import { describe, expect, it } from "vitest";

import { validateFootprintCityInput, validateFootprintMemoryInput } from "@/features/admin/footprint-actions";

function form(input: Record<string, string | string[]>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        data.append(key, item);
      }
    } else {
      data.set(key, value);
    }
  }

  return data;
}

describe("footprint admin validation", () => {
  it("accepts city node input", () => {
    const result = validateFootprintCityInput(
      form({
        name: "长沙",
        description: "星城",
        latitude: "28.2282",
        longitude: "112.9388",
        sortOrder: "1",
        enabled: "on"
      })
    );

    expect(result.ok).toBe(true);
  });

  it("rejects invalid coordinates", () => {
    const result = validateFootprintCityInput(
      form({
        name: "长沙",
        latitude: "128",
        longitude: "200",
        sortOrder: "1"
      })
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.latitude).toContain("纬度必须在 -90 到 90 之间");
      expect(result.errors.longitude).toContain("经度必须在 -180 到 180 之间");
    }
  });

  it("accepts memory input with ordered image IDs", () => {
    const result = validateFootprintMemoryInput(
      form({
        placeId: "place_1",
        locationName: "橘子洲",
        address: "湖南省长沙市岳麓区",
        visitedAt: "2024-05-01",
        mood: "那天江边的风刚刚好",
        story: "一起看湘江。",
        sortOrder: "1",
        mediaAssetIds: ["media_1", "media_2"]
      })
    );

    expect(result.ok).toBe(true);
  });
});
