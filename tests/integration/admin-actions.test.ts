import { beforeEach, describe, expect, it, vi } from "vitest";

const updateSite = vi.fn(async () => ({ id: "site" }));
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

const transactionMock = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback({
    mediaAsset: { create: createMediaAsset, update: updateMediaAsset },
    albumItem: { create: createAlbumRecord, update: updateAlbumRecord }
  })
);

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
    siteSetting: { update: updateSite },
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
    }
  }
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

beforeEach(() => {
  updateSite.mockClear();
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
