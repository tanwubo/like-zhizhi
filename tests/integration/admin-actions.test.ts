import { beforeEach, describe, expect, it, vi } from "vitest";

const updateSite = vi.fn(async () => ({ id: "site" }));
const upsertTheme = vi.fn(async () => ({ id: "theme" }));
const upsertIntegrationSetting = vi.fn(async () => ({ id: "integration_1" }));
const findIntegrationSettings = vi.fn(async () => []);
const createNoteRecord = vi.fn(async () => ({ id: "note_1" }));
const updateNoteRecord = vi.fn(async () => ({ id: "note_1" }));
const deleteNoteRecord = vi.fn(async () => ({ id: "note_1" }));
const findNoteBySlug = vi.fn(async () => null);
const createMediaAsset = vi.fn(async () => ({ id: "media_1" }));
const updateMediaAsset = vi.fn(async () => ({ id: "media_1" }));
const createAlbumRecord = vi.fn(async () => ({ id: "album_1" }));
const updateAlbumRecord = vi.fn(async () => ({ id: "album_1" }));
const deleteAlbumRecord = vi.fn(async () => ({ id: "album_1" }));
const createChecklistRecord = vi.fn(async () => ({ id: "checklist_1" }));
const updateChecklistRecord = vi.fn(async () => ({ id: "checklist_1" }));
const deleteChecklistRecord = vi.fn(async () => ({ id: "checklist_1" }));
const createFootprintPlaceRecord = vi.fn(async () => ({ id: "place_1" }));
const updateFootprintPlaceRecord = vi.fn(async () => ({ id: "place_1" }));
const deleteFootprintPlaceRecord = vi.fn(async () => ({ id: "place_1" }));
const createFootprintVisitRecord = vi.fn(async () => ({ id: "visit_1" }));
const updateFootprintVisitRecord = vi.fn(async () => ({ id: "visit_1" }));
const deleteFootprintVisitRecord = vi.fn(async () => ({ id: "visit_1" }));
const createLoveDayRecord = vi.fn(async () => ({ id: "love_day_1" }));
const updateLoveDayRecord = vi.fn(async () => ({ id: "love_day_1" }));
const deleteLoveDayRecord = vi.fn(async () => ({ id: "love_day_1" }));
const createMusicTrackRecord = vi.fn(async () => ({ id: "music_1" }));
const updateMusicTrackRecord = vi.fn(async () => ({ id: "music_1" }));
const deleteMusicTrackRecord = vi.fn(async () => ({ id: "music_1" }));
const updateMessageRecord = vi.fn(async () => ({ id: "message_1" }));
const createUserRecord = vi.fn(async () => ({ id: "user_2" }));
const updateUserRecord = vi.fn(async () => ({ id: "user_2" }));
const findUserUniqueRecord = vi.fn(async () => null);
const deleteUserSessions = vi.fn(async () => ({ count: 1 }));
const upsertDailyStatRecord = vi.fn(async () => ({ id: "stat_1" }));
const getCurrentUserMock = vi.fn(async () => ({
  id: "owner_1",
  email: "owner@example.com",
  name: "Owner",
  role: "OWNER"
}));

const transactionMock = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback({
    mediaAsset: { create: createMediaAsset, update: updateMediaAsset },
    albumItem: { create: createAlbumRecord, update: updateAlbumRecord },
    footprintPlace: {
      create: createFootprintPlaceRecord,
      update: updateFootprintPlaceRecord
    },
    footprintVisit: {
      create: createFootprintVisitRecord,
      update: updateFootprintVisitRecord
    }
  })
);

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
    siteSetting: { update: updateSite },
    themeSetting: { upsert: upsertTheme },
    integrationSetting: { findMany: findIntegrationSettings, upsert: upsertIntegrationSetting },
    personProfile: { update: vi.fn(async () => ({ id: "person_1" })) },
    moduleSetting: { update: vi.fn(async () => ({ id: "module_1" })) },
    note: {
      create: createNoteRecord,
      update: updateNoteRecord,
      delete: deleteNoteRecord,
      findFirst: findNoteBySlug
    },
    mediaAsset: { create: createMediaAsset, update: updateMediaAsset },
    albumItem: { create: createAlbumRecord, update: updateAlbumRecord, delete: deleteAlbumRecord },
    checklistItem: {
      create: createChecklistRecord,
      update: updateChecklistRecord,
      delete: deleteChecklistRecord
    },
    footprintPlace: {
      create: createFootprintPlaceRecord,
      update: updateFootprintPlaceRecord,
      delete: deleteFootprintPlaceRecord
    },
    footprintVisit: {
      create: createFootprintVisitRecord,
      update: updateFootprintVisitRecord,
      delete: deleteFootprintVisitRecord
    },
    loveDayEvent: {
      create: createLoveDayRecord,
      update: updateLoveDayRecord,
      delete: deleteLoveDayRecord
    },
    musicTrack: {
      create: createMusicTrackRecord,
      update: updateMusicTrackRecord,
      delete: deleteMusicTrackRecord
    },
    message: {
      update: updateMessageRecord
    },
    user: {
      create: createUserRecord,
      update: updateUserRecord,
      findUnique: findUserUniqueRecord
    },
    session: {
      deleteMany: deleteUserSessions
    },
    dailyStat: {
      upsert: upsertDailyStatRecord
    }
  }
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentUser: getCurrentUserMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

beforeEach(() => {
  updateSite.mockClear();
  upsertTheme.mockClear();
  upsertIntegrationSetting.mockClear();
  findIntegrationSettings.mockReset();
  findIntegrationSettings.mockResolvedValue([]);
  createNoteRecord.mockClear();
  updateNoteRecord.mockClear();
  deleteNoteRecord.mockClear();
  findNoteBySlug.mockReset();
  findNoteBySlug.mockResolvedValue(null);
  createMediaAsset.mockClear();
  updateMediaAsset.mockClear();
  createAlbumRecord.mockClear();
  updateAlbumRecord.mockClear();
  deleteAlbumRecord.mockClear();
  createChecklistRecord.mockClear();
  updateChecklistRecord.mockClear();
  deleteChecklistRecord.mockClear();
  createFootprintPlaceRecord.mockClear();
  updateFootprintPlaceRecord.mockClear();
  deleteFootprintPlaceRecord.mockClear();
  createFootprintVisitRecord.mockClear();
  updateFootprintVisitRecord.mockClear();
  deleteFootprintVisitRecord.mockClear();
  createLoveDayRecord.mockClear();
  updateLoveDayRecord.mockClear();
  deleteLoveDayRecord.mockClear();
  createMusicTrackRecord.mockClear();
  updateMusicTrackRecord.mockClear();
  deleteMusicTrackRecord.mockClear();
  updateMessageRecord.mockClear();
  createUserRecord.mockClear();
  updateUserRecord.mockClear();
  findUserUniqueRecord.mockReset();
  findUserUniqueRecord.mockResolvedValue(null);
  deleteUserSessions.mockClear();
  upsertDailyStatRecord.mockClear();
  getCurrentUserMock.mockReset();
  getCurrentUserMock.mockResolvedValue({
    id: "owner_1",
    email: "owner@example.com",
    name: "Owner",
    role: "OWNER"
  });
  transactionMock.mockClear();
});

describe("admin settings actions", () => {
  it("rejects blank site title", async () => {
    const { validateSiteSettings, updateSiteSettings } = await import("@/features/admin/settings-actions");
    const result = await validateSiteSettings(new FormData());

    expect(result.ok).toBe(false);
    await updateSiteSettings(new FormData());
    expect(updateSite).not.toHaveBeenCalled();
  });

  it("updates the public together date from site settings", async () => {
    const { updateSiteSettings } = await import("@/features/admin/settings-actions");
    const formData = new FormData();

    formData.set("title", "Like Zhizhi");
    formData.set("slogan", "Slogan");
    formData.set("description", "Description");
    formData.set("togetherDate", "2026-05-16");
    formData.set("footerText", "Footer");
    formData.set("seoKeywords", "like,zhizhi");

    await updateSiteSettings(formData);

    expect(updateSite).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "site" },
        data: expect.objectContaining({
          togetherDate: new Date("2026-05-16T00:00:00+08:00")
        })
      })
    );
  });

  it("does not update site settings for invalid together dates", async () => {
    const { validateSiteSettings, updateSiteSettings } = await import("@/features/admin/settings-actions");
    const formData = new FormData();

    formData.set("title", "Like Zhizhi");
    formData.set("slogan", "Slogan");
    formData.set("description", "Description");
    formData.set("togetherDate", "2026-02-31");
    formData.set("footerText", "Footer");

    const result = await validateSiteSettings(formData);

    expect(result.ok).toBe(false);
    await updateSiteSettings(formData);
    expect(updateSite).not.toHaveBeenCalled();
  });

  it("updates theme settings with media and effect flags", async () => {
    const { updateThemeSettings } = await import("@/features/admin/settings-actions");
    const formData = new FormData();

    formData.set("primaryColor", "#2f80ed");
    formData.set("backgroundImageUrl", "https://example.com/bg.jpg");
    formData.set("backgroundVideoUrl", "https://example.com/bg.mp4");
    formData.set("enableGlassEffect", "on");
    formData.set("enablePageAnimation", "on");

    await updateThemeSettings(formData);

    expect(upsertTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "theme" },
        create: expect.objectContaining({
          id: "theme",
          primaryColor: "#2f80ed",
          backgroundImageUrl: "https://example.com/bg.jpg",
          backgroundVideoUrl: "https://example.com/bg.mp4",
          enableGlassEffect: true,
          enablePageAnimation: true
        }),
        update: expect.objectContaining({
          primaryColor: "#2f80ed",
          backgroundImageUrl: "https://example.com/bg.jpg",
          backgroundVideoUrl: "https://example.com/bg.mp4",
          enableGlassEffect: true,
          enablePageAnimation: true
        })
      })
    );
  });

  it("does not update theme settings for invalid color or media URLs", async () => {
    const { validateThemeSettings, updateThemeSettings } = await import("@/features/admin/settings-actions");
    const formData = new FormData();

    formData.set("primaryColor", "blue");
    formData.set("backgroundImageUrl", "broken");

    const result = await validateThemeSettings(formData);
    await updateThemeSettings(formData);

    expect(result.ok).toBe(false);
    expect(upsertTheme).not.toHaveBeenCalled();
  });
});

describe("admin integration actions", () => {
  it("saves enabled provider settings and encrypted secret-like fields", async () => {
    const { updateIntegrationSettings } = await import("@/features/admin/integration-actions");
    const formData = new FormData();

    formData.set("mapEnabled", "on");
    formData.set("mapProvider", "amap");
    formData.set("mapApiBaseUrl", "https://restapi.amap.com");
    formData.set("mapPublicKey", "public-map-key");
    formData.set("mapSecretKey", "private-map-key");
    formData.set("weatherEnabled", "on");
    formData.set("weatherProvider", "openweather");
    formData.set("weatherApiBaseUrl", "https://api.openweathermap.org");
    formData.set("weatherApiKey", "weather-key");
    formData.set("emailEnabled", "on");
    formData.set("emailProvider", "smtp");
    formData.set("emailHost", "smtp.example.com");
    formData.set("emailPort", "465");
    formData.set("emailFromEmail", "hello@example.com");
    formData.set("emailUsername", "mailer");
    formData.set("emailSmtpPassword", "smtp-secret");
    formData.set("musicEnabled", "on");
    formData.set("musicProvider", "netease");
    formData.set("musicApiBaseUrl", "https://music.example.com");

    await updateIntegrationSettings(formData);

    expect(upsertIntegrationSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "map" },
        create: expect.objectContaining({
          key: "map",
          enabled: true,
          provider: "amap",
          config: expect.objectContaining({
            apiBaseUrl: "https://restapi.amap.com",
            publicKey: "public-map-key"
          }),
          secrets: expect.objectContaining({
            secretKey: expect.any(String)
          })
        })
      })
    );
    expect(upsertIntegrationSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "email" },
        update: expect.objectContaining({
          enabled: true,
          provider: "smtp",
          config: expect.objectContaining({
            host: "smtp.example.com",
            port: 465,
            fromEmail: "hello@example.com",
            username: "mailer"
          }),
          secrets: expect.objectContaining({
            smtpPassword: expect.any(String)
          })
        })
      })
    );
    expect(JSON.stringify(upsertIntegrationSetting.mock.calls)).not.toContain("smtp-secret");
    expect(JSON.stringify(upsertIntegrationSetting.mock.calls)).not.toContain("private-map-key");
  });

  it("preserves existing encrypted secrets when secret fields are blank", async () => {
    const { encryptIntegrationSecret } = await import("@/features/admin/integration-utils");
    const { updateIntegrationSettings } = await import("@/features/admin/integration-actions");
    const existingSecret = encryptIntegrationSecret("already-stored");
    const formData = new FormData();

    findIntegrationSettings.mockResolvedValueOnce([
      {
        key: "weather",
        enabled: true,
        provider: "openweather",
        config: {},
        secrets: { apiKey: existingSecret }
      }
    ]);
    formData.set("weatherEnabled", "on");
    formData.set("weatherProvider", "openweather");
    formData.set("weatherApiBaseUrl", "https://api.openweathermap.org");
    formData.set("weatherApiKey", "");

    await updateIntegrationSettings(formData);

    expect(upsertIntegrationSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "weather" },
        update: expect.objectContaining({
          secrets: { apiKey: existingSecret }
        })
      })
    );
  });

  it("does not save invalid provider URLs", async () => {
    const { validateIntegrationSettings, updateIntegrationSettings } = await import("@/features/admin/integration-actions");
    const formData = new FormData();

    formData.set("mapEnabled", "on");
    formData.set("mapProvider", "amap");
    formData.set("mapApiBaseUrl", "broken");

    const result = await validateIntegrationSettings(formData);
    await updateIntegrationSettings(formData);

    expect(result.ok).toBe(false);
    expect(upsertIntegrationSetting).not.toHaveBeenCalled();
  });
});

describe("admin checklist actions", () => {
  it("creates a checklist item with completion and planning fields", async () => {
    const { createChecklistItem } = await import("@/features/admin/checklist-actions");
    const formData = new FormData();

    formData.set("title", "Watch the sunrise");
    formData.set("description", "Leave before dawn.");
    formData.set("status", "PUBLISHED");
    formData.set("completed", "on");
    formData.set("completedAt", "2026-05-10");
    formData.set("targetDate", "2026-05-20");
    formData.set("location", "Qingdao");
    formData.set("imageUrl", "https://example.com/sunrise.jpg");
    formData.set("sortOrder", "7");

    await createChecklistItem(formData);

    expect(createChecklistRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Watch the sunrise",
          description: "Leave before dawn.",
          status: "PUBLISHED",
          completed: true,
          completedAt: expect.any(Date),
          targetDate: expect.any(Date),
          location: "Qingdao",
          imageUrl: "https://example.com/sunrise.jpg",
          sortOrder: 7
        })
      })
    );
  });

  it("updates a checklist item", async () => {
    const { updateChecklistItem } = await import("@/features/admin/checklist-actions");
    const formData = new FormData();

    formData.set("id", "checklist_1");
    formData.set("title", "Updated plan");
    formData.set("description", "Updated details.");
    formData.set("status", "DRAFT");

    await updateChecklistItem(formData);

    expect(updateChecklistRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "checklist_1" },
        data: expect.objectContaining({
          title: "Updated plan",
          description: "Updated details.",
          status: "DRAFT"
        })
      })
    );
  });

  it("deletes a checklist item", async () => {
    const { deleteChecklistItem } = await import("@/features/admin/checklist-actions");
    const formData = new FormData();

    formData.set("id", "checklist_1");

    await deleteChecklistItem(formData);

    expect(deleteChecklistRecord).toHaveBeenCalledWith({ where: { id: "checklist_1" } });
  });

  it("does not create checklist records for invalid image URLs", async () => {
    const { createChecklistItem } = await import("@/features/admin/checklist-actions");
    const formData = new FormData();

    formData.set("title", "Broken checklist");
    formData.set("imageUrl", "broken");

    await createChecklistItem(formData);

    expect(createChecklistRecord).not.toHaveBeenCalled();
  });
});

describe("admin note actions", () => {
  it("creates a published note with normalized slug and publish time", async () => {
    const { createNote } = await import("@/features/admin/notes-actions");
    const formData = new FormData();

    formData.set("title", "First Memory 2026!");
    formData.set("excerpt", "A short summary");
    formData.set("content", "A full note body");
    formData.set("status", "PUBLISHED");

    await createNote(formData);

    expect(createNoteRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "First Memory 2026!",
          slug: "first-memory-2026",
          status: "PUBLISHED",
          publishedAt: expect.any(Date)
        })
      })
    );
  });

  it("does not create a note when slug is already used", async () => {
    const { createNote } = await import("@/features/admin/notes-actions");
    const formData = new FormData();

    findNoteBySlug.mockResolvedValueOnce({ id: "existing_note" });
    formData.set("title", "First Memory 2026!");
    formData.set("excerpt", "A short summary");
    formData.set("content", "A full note body");
    formData.set("status", "DRAFT");

    await createNote(formData);

    expect(createNoteRecord).not.toHaveBeenCalled();
  });
});

describe("admin footprint actions", () => {
  it("creates a footprint place and first visit", async () => {
    const { createFootprintPlace } = await import("@/features/admin/footprint-actions");
    const formData = new FormData();

    formData.set("name", "The Bund");
    formData.set("description", "A riverside walk.");
    formData.set("latitude", "31.2397");
    formData.set("longitude", "121.4998");
    formData.set("coverUrl", "https://example.com/bund.jpg");
    formData.set("visitTitle", "Evening walk");
    formData.set("visitDescription", "Watched the lights.");
    formData.set("visitedAt", "2026-05-10");

    await createFootprintPlace(formData);

    expect(createFootprintPlaceRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "The Bund",
          description: "A riverside walk.",
          latitude: "31.2397",
          longitude: "121.4998",
          coverUrl: "https://example.com/bund.jpg"
        })
      })
    );
    expect(createFootprintVisitRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          placeId: "place_1",
          title: "Evening walk",
          description: "Watched the lights.",
          visitedAt: expect.any(Date)
        })
      })
    );
  });

  it("updates a footprint place and existing visit", async () => {
    const { updateFootprintPlace } = await import("@/features/admin/footprint-actions");
    const formData = new FormData();

    formData.set("id", "place_1");
    formData.set("visitId", "visit_1");
    formData.set("name", "Updated place");
    formData.set("description", "Updated description.");
    formData.set("latitude", "30.0001");
    formData.set("longitude", "120.0001");
    formData.set("visitTitle", "Updated visit");
    formData.set("visitDescription", "Updated visit description.");
    formData.set("visitedAt", "2026-05-11");

    await updateFootprintPlace(formData);

    expect(updateFootprintPlaceRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "place_1" },
        data: expect.objectContaining({
          name: "Updated place",
          latitude: "30.0001",
          longitude: "120.0001"
        })
      })
    );
    expect(updateFootprintVisitRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "visit_1" },
        data: expect.objectContaining({
          title: "Updated visit",
          description: "Updated visit description.",
          visitedAt: expect.any(Date)
        })
      })
    );
  });

  it("deletes a footprint place", async () => {
    const { deleteFootprintPlace } = await import("@/features/admin/footprint-actions");
    const formData = new FormData();

    formData.set("id", "place_1");

    await deleteFootprintPlace(formData);

    expect(deleteFootprintPlaceRecord).toHaveBeenCalledWith({ where: { id: "place_1" } });
  });

  it("deletes a footprint visit", async () => {
    const { deleteFootprintVisit } = await import("@/features/admin/footprint-actions");
    const formData = new FormData();

    formData.set("id", "visit_1");

    await deleteFootprintVisit(formData);

    expect(deleteFootprintVisitRecord).toHaveBeenCalledWith({ where: { id: "visit_1" } });
  });

  it("does not create footprint records for invalid coordinates", async () => {
    const { createFootprintPlace } = await import("@/features/admin/footprint-actions");
    const formData = new FormData();

    formData.set("name", "Broken place");
    formData.set("description", "Broken description.");
    formData.set("latitude", "999");
    formData.set("longitude", "121.4998");

    await createFootprintPlace(formData);

    expect(createFootprintPlaceRecord).not.toHaveBeenCalled();
    expect(createFootprintVisitRecord).not.toHaveBeenCalled();
  });
});

describe("admin love-day actions", () => {
  it("creates a love-day event with recurrence flags", async () => {
    const { createLoveDayEvent } = await import("@/features/admin/love-days-actions");
    const formData = new FormData();

    formData.set("title", "First trip");
    formData.set("description", "We travelled together.");
    formData.set("date", "2026-05-16");
    formData.set("yearly", "on");
    formData.set("lunar", "on");
    formData.set("sortOrder", "3");

    await createLoveDayEvent(formData);

    expect(createLoveDayRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "First trip",
          description: "We travelled together.",
          date: expect.any(Date),
          yearly: true,
          lunar: true,
          sortOrder: 3
        })
      })
    );
  });

  it("updates a love-day event", async () => {
    const { updateLoveDayEvent } = await import("@/features/admin/love-days-actions");
    const formData = new FormData();

    formData.set("id", "love_day_1");
    formData.set("title", "Updated event");
    formData.set("description", "Updated description.");
    formData.set("date", "2026-05-17");
    formData.set("sortOrder", "5");

    await updateLoveDayEvent(formData);

    expect(updateLoveDayRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "love_day_1" },
        data: expect.objectContaining({
          title: "Updated event",
          description: "Updated description.",
          date: expect.any(Date),
          yearly: false,
          lunar: false,
          sortOrder: 5
        })
      })
    );
  });

  it("deletes a love-day event", async () => {
    const { deleteLoveDayEvent } = await import("@/features/admin/love-days-actions");
    const formData = new FormData();

    formData.set("id", "love_day_1");

    await deleteLoveDayEvent(formData);

    expect(deleteLoveDayRecord).toHaveBeenCalledWith({ where: { id: "love_day_1" } });
  });

  it("does not create love-day records for invalid dates", async () => {
    const { createLoveDayEvent } = await import("@/features/admin/love-days-actions");
    const formData = new FormData();

    formData.set("title", "Broken event");
    formData.set("description", "Broken description.");
    formData.set("date", "broken");

    await createLoveDayEvent(formData);

    expect(createLoveDayRecord).not.toHaveBeenCalled();
  });
});

describe("admin album actions", () => {
  it("creates a media asset and linked album item", async () => {
    const { createAlbumItem } = await import("@/features/admin/album-actions");
    const formData = new FormData();

    formData.set("title", "Beach Sunset");
    formData.set("caption", "A warm evening.");
    formData.set("publicUrl", "https://example.com/beach.jpg");
    formData.set("mediaType", "IMAGE");
    formData.set("status", "PUBLISHED");
    formData.set("location", "Qingdao");

    await createAlbumItem(formData);

    expect(createMediaAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "IMAGE",
          publicUrl: "https://example.com/beach.jpg",
          filename: "beach.jpg",
          contentType: "image/jpeg"
        })
      })
    );
    expect(createAlbumRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mediaId: "media_1",
          title: "Beach Sunset",
          caption: "A warm evening.",
          status: "PUBLISHED",
          location: "Qingdao"
        })
      })
    );
  });

  it("does not create records for invalid media URLs", async () => {
    const { createAlbumItem } = await import("@/features/admin/album-actions");
    const formData = new FormData();

    formData.set("title", "Broken media");
    formData.set("publicUrl", "broken");

    await createAlbumItem(formData);

    expect(createMediaAsset).not.toHaveBeenCalled();
    expect(createAlbumRecord).not.toHaveBeenCalled();
  });
});

describe("admin music actions", () => {
  it("creates an enabled music track", async () => {
    const { createMusicTrack } = await import("@/features/admin/music-actions");
    const formData = new FormData();

    formData.set("title", "Warm Song");
    formData.set("artist", "Zhizhi");
    formData.set("coverUrl", "https://example.com/cover.jpg");
    formData.set("sourceUrl", "https://example.com/song.mp3");
    formData.set("sourceType", "url");
    formData.set("enabled", "on");
    formData.set("sortOrder", "4");

    await createMusicTrack(formData);

    expect(createMusicTrackRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Warm Song",
          artist: "Zhizhi",
          coverUrl: "https://example.com/cover.jpg",
          sourceUrl: "https://example.com/song.mp3",
          sourceType: "url",
          enabled: true,
          sortOrder: 4
        })
      })
    );
  });

  it("updates a music track", async () => {
    const { updateMusicTrack } = await import("@/features/admin/music-actions");
    const formData = new FormData();

    formData.set("id", "music_1");
    formData.set("title", "Updated Song");
    formData.set("artist", "Updated Artist");
    formData.set("sourceUrl", "https://example.com/updated.mp3");
    formData.set("sourceType", "url");
    formData.set("sortOrder", "8");

    await updateMusicTrack(formData);

    expect(updateMusicTrackRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "music_1" },
        data: expect.objectContaining({
          title: "Updated Song",
          artist: "Updated Artist",
          sourceUrl: "https://example.com/updated.mp3",
          enabled: false,
          sortOrder: 8
        })
      })
    );
  });

  it("deletes a music track", async () => {
    const { deleteMusicTrack } = await import("@/features/admin/music-actions");
    const formData = new FormData();

    formData.set("id", "music_1");

    await deleteMusicTrack(formData);

    expect(deleteMusicTrackRecord).toHaveBeenCalledWith({ where: { id: "music_1" } });
  });

  it("does not create music records for invalid source URLs", async () => {
    const { createMusicTrack } = await import("@/features/admin/music-actions");
    const formData = new FormData();

    formData.set("title", "Broken song");
    formData.set("artist", "Broken artist");
    formData.set("sourceUrl", "broken");

    await createMusicTrack(formData);

    expect(createMusicTrackRecord).not.toHaveBeenCalled();
  });
});

describe("admin media actions", () => {
  it("registers an external media asset", async () => {
    const { registerExternalMedia } = await import("@/features/admin/media-actions");
    const formData = new FormData();

    formData.set("publicUrl", "https://example.com/media/photo.png");
    formData.set("sizeBytes", "3000");
    formData.set("width", "640");
    formData.set("height", "480");

    await registerExternalMedia(formData);

    expect(createMediaAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "IMAGE",
          bucket: "external",
          objectKey: "/media/photo.png",
          publicUrl: "https://example.com/media/photo.png",
          filename: "photo.png",
          contentType: "image/png",
          sizeBytes: 3000,
          width: 640,
          height: 480
        })
      })
    );
  });

  it("does not register invalid external media URLs", async () => {
    const { registerExternalMedia } = await import("@/features/admin/media-actions");
    const formData = new FormData();

    formData.set("publicUrl", "broken");

    await registerExternalMedia(formData);

    expect(createMediaAsset).not.toHaveBeenCalled();
  });

  it("uploads media with a storage adapter and stores returned object metadata", async () => {
    const { uploadMediaAsset } = await import("@/features/admin/media-actions");
    const formData = new FormData();
    const adapter = {
      putObject: vi.fn(async () => ({
        bucket: "like-zhizhi",
        key: "media/2026/05/16/test-image.png",
        publicUrl: "https://cdn.example.com/media/2026/05/16/test-image.png"
      }))
    };

    formData.set(
      "file",
      new File([Buffer.from("89504e470d0a1a0a0000000d494844520000000a000000140806000000", "hex")], "Test Image.PNG", {
        type: "image/png"
      })
    );

    await uploadMediaAsset(formData, adapter);

    expect(adapter.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringMatching(/^media\/\d{4}\/\d{2}\/\d{2}\/\d{6}-test-image\.png$/),
        contentType: "image/png"
      })
    );
    expect(createMediaAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "IMAGE",
          bucket: "like-zhizhi",
          publicUrl: "https://cdn.example.com/media/2026/05/16/test-image.png",
          filename: "Test Image.PNG",
          contentType: "image/png",
          width: 10,
          height: 20
        })
      })
    );
  });
});

describe("admin user actions", () => {
  it("creates a moderator with a normalized email and hashed password", async () => {
    const { createUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("email", " Moderator@Example.COM ");
    formData.set("name", "留言管理员");
    formData.set("role", "MODERATOR");
    formData.set("password", "Secret123!");

    await createUser(formData);

    expect(createUserRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "moderator@example.com",
          name: "留言管理员",
          role: "MODERATOR",
          disabledAt: null,
          passwordHash: expect.not.stringContaining("Secret123!")
        })
      })
    );
  });

  it("rejects user creation when current user is not owner", async () => {
    const { createUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    getCurrentUserMock.mockResolvedValueOnce({
      id: "partner_1",
      email: "partner@example.com",
      name: "Partner",
      role: "PARTNER"
    });
    formData.set("email", "moderator@example.com");
    formData.set("name", "Moderator");
    formData.set("role", "MODERATOR");
    formData.set("password", "Secret123!");

    await expect(createUser(formData)).rejects.toThrow("没有用户管理权限");
    expect(createUserRecord).not.toHaveBeenCalled();
  });

  it("updates profile fields without replacing a blank password", async () => {
    const { updateUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("id", "user_2");
    formData.set("email", "partner@example.com");
    formData.set("name", "Partner");
    formData.set("role", "PARTNER");
    formData.set("password", "");

    await updateUser(formData);

    expect(updateUserRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_2" },
        data: {
          email: "partner@example.com",
          name: "Partner",
          role: "PARTNER"
        }
      })
    );
  });

  it("replaces a password when a new value is supplied", async () => {
    const { updateUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("id", "user_2");
    formData.set("email", "partner@example.com");
    formData.set("name", "Partner");
    formData.set("role", "PARTNER");
    formData.set("password", "NewSecret123!");

    await updateUser(formData);

    expect(updateUserRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_2" },
        data: expect.objectContaining({
          passwordHash: expect.not.stringContaining("NewSecret123!")
        })
      })
    );
  });

  it("disables a user and clears active sessions", async () => {
    const { disableUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("id", "user_2");

    await disableUser(formData);

    expect(updateUserRecord).toHaveBeenCalledWith({
      where: { id: "user_2" },
      data: { disabledAt: expect.any(Date) }
    });
    expect(deleteUserSessions).toHaveBeenCalledWith({ where: { userId: "user_2" } });
  });

  it("prevents disabling the current owner account", async () => {
    const { disableUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("id", "owner_1");

    await expect(disableUser(formData)).rejects.toThrow("不能禁用当前登录用户");
    expect(updateUserRecord).not.toHaveBeenCalled();
  });

  it("enables a disabled user", async () => {
    const { enableUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("id", "user_2");

    await enableUser(formData);

    expect(updateUserRecord).toHaveBeenCalledWith({
      where: { id: "user_2" },
      data: { disabledAt: null }
    });
  });

  it("does not create users with invalid input", async () => {
    const { validateUserInput, createUser } = await import("@/features/admin/users-actions");
    const formData = new FormData();

    formData.set("email", "bad-email");
    formData.set("name", "");
    formData.set("role", "OWNER");
    formData.set("password", "short");

    expect(validateUserInput(formData, { requirePassword: true }).ok).toBe(false);
    await createUser(formData);
    expect(createUserRecord).not.toHaveBeenCalled();
  });
});

describe("admin permission gates", () => {
  it("rejects content mutations for moderators", async () => {
    const { createNote } = await import("@/features/admin/notes-actions");
    const formData = new FormData();

    getCurrentUserMock.mockResolvedValueOnce({
      id: "moderator_1",
      email: "moderator@example.com",
      name: "Moderator",
      role: "MODERATOR"
    });
    formData.set("title", "Blocked note");
    formData.set("excerpt", "Blocked excerpt");
    formData.set("content", "Blocked content");

    await expect(createNote(formData)).rejects.toThrow("没有内容管理权限");
    expect(createNoteRecord).not.toHaveBeenCalled();
  });

  it("rejects settings mutations for moderators", async () => {
    const { updateSiteSettings } = await import("@/features/admin/settings-actions");
    const formData = new FormData();

    getCurrentUserMock.mockResolvedValueOnce({
      id: "moderator_1",
      email: "moderator@example.com",
      name: "Moderator",
      role: "MODERATOR"
    });
    formData.set("title", "Like Zhizhi");
    formData.set("slogan", "Slogan");
    formData.set("description", "Description");
    formData.set("togetherDate", "2026-05-16");
    formData.set("footerText", "Footer");

    await expect(updateSiteSettings(formData)).rejects.toThrow("没有设置管理权限");
    expect(updateSite).not.toHaveBeenCalled();
  });

  it("rejects integration mutations for partners", async () => {
    const { updateIntegrationSettings } = await import("@/features/admin/integration-actions");
    const formData = new FormData();

    getCurrentUserMock.mockResolvedValueOnce({
      id: "partner_1",
      email: "partner@example.com",
      name: "Partner",
      role: "PARTNER"
    });

    await expect(updateIntegrationSettings(formData)).rejects.toThrow("没有集成管理权限");
    expect(upsertIntegrationSetting).not.toHaveBeenCalled();
  });

  it("allows moderators to moderate messages", async () => {
    const { approveMessage } = await import("@/features/admin/message-actions");
    const formData = new FormData();

    getCurrentUserMock.mockResolvedValueOnce({
      id: "moderator_1",
      email: "moderator@example.com",
      name: "Moderator",
      role: "MODERATOR"
    });
    formData.set("id", "message_1");

    await approveMessage(formData);

    expect(updateMessageRecord).toHaveBeenCalledWith({
      where: { id: "message_1" },
      data: { status: "APPROVED" }
    });
  });
});
