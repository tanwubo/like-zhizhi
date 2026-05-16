import { describe, expect, it } from "vitest";

import { normalizeModuleSettings, normalizeThemeSetting } from "@/features/admin/settings-data";

describe("admin settings data", () => {
  it("sorts modules by sortOrder then label", () => {
    const modules = normalizeModuleSettings([
      { id: "2", key: "messages", label: "留言", enabled: true, sortOrder: 20, description: "" },
      { id: "1", key: "notes", label: "点滴", enabled: true, sortOrder: 10, description: "" }
    ]);

    expect(modules.map((module) => module.key)).toEqual(["notes", "messages"]);
  });

  it("returns stable defaults when theme settings are missing", () => {
    const theme = normalizeThemeSetting(null);

    expect(theme).toEqual({
      primaryColor: "#f45d7a",
      backgroundImageUrl: null,
      backgroundVideoUrl: null,
      enableGlassEffect: true,
      enablePageAnimation: true
    });
  });

  it("normalizes saved theme settings for public rendering", () => {
    const theme = normalizeThemeSetting({
      primaryColor: "#2f80ed",
      backgroundImageUrl: "https://example.com/bg.jpg",
      backgroundVideoUrl: "",
      enableGlassEffect: false,
      enablePageAnimation: false
    });

    expect(theme).toEqual({
      primaryColor: "#2f80ed",
      backgroundImageUrl: "https://example.com/bg.jpg",
      backgroundVideoUrl: null,
      enableGlassEffect: false,
      enablePageAnimation: false
    });
  });
});
