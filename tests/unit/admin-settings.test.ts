import { describe, expect, it } from "vitest";

import { FONT_ROLE_DEFAULTS, getFontOptionGroups } from "@/features/admin/font-options";
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
      enablePageAnimation: true,
      bodyFontKey: FONT_ROLE_DEFAULTS.body,
      displayFontKey: FONT_ROLE_DEFAULTS.display,
      romanceFontKey: FONT_ROLE_DEFAULTS.romance,
      numberFontKey: FONT_ROLE_DEFAULTS.number
    });
  });

  it("normalizes saved theme settings for public rendering", () => {
    const theme = normalizeThemeSetting({
      primaryColor: "#2f80ed",
      backgroundImageUrl: "https://example.com/bg.jpg",
      backgroundVideoUrl: "",
      enableGlassEffect: false,
      enablePageAnimation: false,
      bodyFontKey: "modern-soft",
      displayFontKey: "serif-gentle",
      romanceFontKey: "wenkai",
      numberFontKey: "mono-classic"
    });

    expect(theme).toEqual({
      primaryColor: "#2f80ed",
      backgroundImageUrl: "https://example.com/bg.jpg",
      backgroundVideoUrl: null,
      enableGlassEffect: false,
      enablePageAnimation: false,
      bodyFontKey: "modern-soft",
      displayFontKey: "serif-gentle",
      romanceFontKey: "wenkai",
      numberFontKey: "mono-classic"
    });
  });

  it("falls back to default font keys when saved keys are unknown", () => {
    const theme = normalizeThemeSetting({
      primaryColor: "#2f80ed",
      backgroundImageUrl: null,
      backgroundVideoUrl: null,
      enableGlassEffect: true,
      enablePageAnimation: true,
      bodyFontKey: "unknown-body",
      displayFontKey: "unknown-display",
      romanceFontKey: "unknown-romance",
      numberFontKey: "unknown-number"
    });

    expect(theme.bodyFontKey).toBe(FONT_ROLE_DEFAULTS.body);
    expect(theme.displayFontKey).toBe(FONT_ROLE_DEFAULTS.display);
    expect(theme.romanceFontKey).toBe(FONT_ROLE_DEFAULTS.romance);
    expect(theme.numberFontKey).toBe(FONT_ROLE_DEFAULTS.number);
  });

  it("groups role-specific font options for the admin form", () => {
    const groups = getFontOptionGroups();

    expect(groups.body.length).toBeGreaterThanOrEqual(4);
    expect(groups.display.length).toBeGreaterThanOrEqual(5);
    expect(groups.romance.length).toBeGreaterThanOrEqual(5);
    expect(groups.number.length).toBeGreaterThanOrEqual(3);
  });
});
