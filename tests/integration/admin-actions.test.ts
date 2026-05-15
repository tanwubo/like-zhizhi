import { beforeEach, describe, expect, it, vi } from "vitest";

const updateSite = vi.fn(async () => ({ id: "site" }));
const createNoteRecord = vi.fn(async () => ({ id: "note_1" }));
const updateNoteRecord = vi.fn(async () => ({ id: "note_1" }));
const deleteNoteRecord = vi.fn(async () => ({ id: "note_1" }));
const findNoteBySlug = vi.fn(async () => null);

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    siteSetting: { update: updateSite },
    personProfile: { update: vi.fn(async () => ({ id: "person_1" })) },
    moduleSetting: { update: vi.fn(async () => ({ id: "module_1" })) },
    note: {
      create: createNoteRecord,
      update: updateNoteRecord,
      delete: deleteNoteRecord,
      findFirst: findNoteBySlug
    }
  }
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

beforeEach(() => {
  updateSite.mockClear();
  createNoteRecord.mockClear();
  updateNoteRecord.mockClear();
  deleteNoteRecord.mockClear();
  findNoteBySlug.mockReset();
  findNoteBySlug.mockResolvedValue(null);
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
