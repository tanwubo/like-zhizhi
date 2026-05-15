import { describe, expect, it } from "vitest";
import { formatLoveDay, mapModuleToRoute } from "@/features/public/public-content";

describe("public content helpers", () => {
  it("maps enabled module keys to public routes", () => {
    expect(mapModuleToRoute("home")).toBe("/");
    expect(mapModuleToRoute("notes")).toBe("/notes");
    expect(mapModuleToRoute("love-days")).toBe("/love-days");
    expect(mapModuleToRoute("unknown")).toBeNull();
  });

  it("formats elapsed love days inclusively", () => {
    expect(
      formatLoveDay(
        new Date("2024-05-20T00:00:00+08:00"),
        new Date("2024-05-21T00:00:00+08:00")
      )
    ).toEqual({
      days: 1,
      label: "已一起 1 天"
    });
  });
});
