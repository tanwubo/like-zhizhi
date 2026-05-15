import { describe, expect, it } from "vitest";

import { validateAlbumInput } from "@/features/admin/album-actions";
import { validateNoteInput } from "@/features/admin/notes-actions";
import { normalizeNoteSlug } from "@/features/admin/notes-data";

describe("admin notes", () => {
  it("normalizes human note titles into stable slugs", () => {
    expect(normalizeNoteSlug("  First Memory 2026!  ")).toBe("first-memory-2026");
  });

  it("rejects notes without title and content", () => {
    const result = validateNoteInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toContain("标题不能为空");
      expect(result.errors.content).toContain("正文不能为空");
    }
  });
});

describe("admin album validation", () => {
  it("rejects missing album title and media URL", () => {
    const result = validateAlbumInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toContain("标题不能为空");
      expect(result.errors.publicUrl).toContain("媒体地址不能为空");
    }
  });

  it("rejects invalid media URLs", () => {
    const formData = new FormData();

    formData.set("title", "海边照片");
    formData.set("publicUrl", "not-a-url");

    const result = validateAlbumInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.publicUrl).toContain("媒体地址必须是有效 URL");
    }
  });

  it("accepts a valid image album form", () => {
    const formData = new FormData();

    formData.set("title", "海边照片");
    formData.set("publicUrl", "https://example.com/sea.jpg");
    formData.set("mediaType", "IMAGE");

    expect(validateAlbumInput(formData)).toEqual({ ok: true });
  });
});
