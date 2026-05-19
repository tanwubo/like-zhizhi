import { describe, expect, it } from "vitest";

import { validateAlbumInput } from "@/features/admin/album-actions";
import { validateChecklistInput } from "@/features/admin/checklist-actions";
import { validateFootprintCityInput, validateFootprintMemoryInput } from "@/features/admin/footprint-actions";
import { validateLoveDayInput } from "@/features/admin/love-days-actions";
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

describe("admin checklist validation", () => {
  it("rejects missing checklist titles", () => {
    const result = validateChecklistInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toContain("标题不能为空");
    }
  });

  it("rejects invalid checklist dates and image URLs", () => {
    const formData = new FormData();

    formData.set("title", "一起看展");
    formData.set("targetDate", "not-a-date");
    formData.set("imageUrl", "not-a-url");

    const result = validateChecklistInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.targetDate).toContain("目标日期必须是有效日期");
      expect(result.errors.imageUrl).toContain("图片地址必须是有效 URL");
    }
  });

  it("accepts a minimal valid checklist form", () => {
    const formData = new FormData();

    formData.set("title", "一起看展");

    expect(validateChecklistInput(formData)).toEqual({ ok: true });
  });
});

describe("admin footprint validation", () => {
  it("rejects missing footprint place fields", () => {
    const result = validateFootprintCityInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toContain("城市名称不能为空");
      expect(result.errors.latitude).toContain("纬度不能为空");
      expect(result.errors.longitude).toContain("经度不能为空");
      expect(result.errors.sortOrder).toContain("排序值不能为空");
    }
  });

  it("rejects invalid footprint coordinates and cover URLs", () => {
    const formData = new FormData();

    formData.set("name", "外滩");
    formData.set("description", "一起散步的地方。");
    formData.set("latitude", "91");
    formData.set("longitude", "-181");
    formData.set("coverUrl", "not-a-url");
    formData.set("sortOrder", "1");

    const result = validateFootprintCityInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.latitude).toContain("纬度必须在 -90 到 90 之间");
      expect(result.errors.longitude).toContain("经度必须在 -180 到 180 之间");
      expect(result.errors.coverUrl).toContain("封面地址必须是有效 URL");
    }
  });

  it("accepts a valid minimal footprint place form", () => {
    const formData = new FormData();

    formData.set("name", "外滩");
    formData.set("description", "一起散步的地方。");
    formData.set("latitude", "31.2397");
    formData.set("longitude", "121.4998");
    formData.set("sortOrder", "1");

    expect(validateFootprintCityInput(formData)).toEqual({ ok: true });
  });

  it("rejects invalid footprint memory dates", () => {
    const formData = new FormData();

    formData.set("placeId", "place_1");
    formData.set("locationName", "橘子洲");
    formData.set("visitedAt", "bad-date");

    const result = validateFootprintMemoryInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.visitedAt).toContain("纪念日期不能为空");
    }
  });
});

describe("admin love-day validation", () => {
  it("rejects missing love-day fields", () => {
    const result = validateLoveDayInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toContain("标题不能为空");
      expect(result.errors.description).toContain("说明不能为空");
      expect(result.errors.date).toContain("日期不能为空");
    }
  });

  it("rejects invalid love-day dates and sort order", () => {
    const formData = new FormData();

    formData.set("title", "第一次旅行");
    formData.set("description", "一起出发。");
    formData.set("date", "bad-date");
    formData.set("sortOrder", "1.5");

    const result = validateLoveDayInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.date).toContain("日期必须是有效日期");
      expect(result.errors.sortOrder).toContain("排序必须是整数");
    }
  });

  it("accepts a valid minimal love-day form", () => {
    const formData = new FormData();

    formData.set("title", "第一次旅行");
    formData.set("description", "一起出发。");
    formData.set("date", "2026-05-16");

    expect(validateLoveDayInput(formData)).toEqual({ ok: true });
  });
});
