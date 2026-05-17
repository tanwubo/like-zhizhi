import { describe, expect, it } from "vitest";

import { validateCarouselSlideInput } from "@/features/admin/carousel-actions";
import { resolveCarouselSlideMove } from "@/features/admin/carousel-order";

describe("admin carousel actions", () => {
  it("accepts a valid carousel slide", async () => {
    const formData = new FormData();

    formData.set("title", "首页轮播");
    formData.set("imageUrl", "https://example.com/slide.jpg");
    formData.set("linkUrl", "https://example.com/story");
    formData.set("description", "用于首页头部展示");
    formData.set("sortOrder", "10");
    formData.set("enabled", "on");

    await expect(validateCarouselSlideInput(formData)).resolves.toEqual({ ok: true });
  });

  it("rejects invalid image and link urls", async () => {
    const formData = new FormData();

    formData.set("title", "首页轮播");
    formData.set("imageUrl", "broken");
    formData.set("linkUrl", "also-broken");

    const result = await validateCarouselSlideInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.imageUrl).toContain("图片地址必须是有效 URL");
      expect(result.errors.linkUrl).toContain("跳转地址必须是有效 URL");
    }
  });

  it("resolves the previous and next slide when adjusting sort order", () => {
    const slides = [
      { id: "slide-a", sortOrder: 10, updatedAt: new Date("2026-05-17T08:00:00Z") },
      { id: "slide-b", sortOrder: 20, updatedAt: new Date("2026-05-17T07:00:00Z") },
      { id: "slide-c", sortOrder: 30, updatedAt: new Date("2026-05-17T06:00:00Z") }
    ];

    expect(resolveCarouselSlideMove(slides, "slide-b", "up")).toEqual({
      current: { id: "slide-b", sortOrder: 10 },
      target: { id: "slide-a", sortOrder: 20 }
    });
    expect(resolveCarouselSlideMove(slides, "slide-b", "down")).toEqual({
      current: { id: "slide-b", sortOrder: 30 },
      target: { id: "slide-c", sortOrder: 20 }
    });
    expect(resolveCarouselSlideMove(slides, "slide-a", "up")).toBeNull();
    expect(resolveCarouselSlideMove(slides, "slide-c", "down")).toBeNull();
  });
});
