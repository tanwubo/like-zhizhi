import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMusicTracks } = vi.hoisted(() => ({
  findMusicTracks: vi.fn()
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    musicTrack: {
      findMany: findMusicTracks
    }
  }
}));

import { formatLoveDay, getEnabledMusicTracks, mapModuleToRoute } from "@/features/public/public-content";

beforeEach(() => {
  findMusicTracks.mockReset();
});

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

  it("loads enabled music tracks in player order", async () => {
    findMusicTracks.mockResolvedValueOnce([]);

    await getEnabledMusicTracks();

    expect(findMusicTracks).toHaveBeenCalledWith({
      where: { enabled: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        sourceUrl: true,
        sourceType: true
      }
    });
  });
});
