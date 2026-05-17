import { describe, expect, it } from "vitest";

import { validateCarouselSlideInput } from "@/features/admin/carousel-actions";

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
});
