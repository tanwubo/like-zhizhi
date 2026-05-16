import { describe, expect, it } from "vitest";

describe("SEO helpers", () => {
  it("builds metadata from site settings", async () => {
    const { buildSiteMetadata } = await import("@/features/public/seo");

    const metadata = buildSiteMetadata({
      title: "Like Zhizhi",
      description: "情侣纪念站",
      slogan: "把每一天都认真收藏",
      seoKeywords: "情侣,纪念,相册"
    });

    expect(metadata.title).toBe("Like Zhizhi");
    expect(metadata.description).toBe("情侣纪念站");
    expect(metadata.keywords).toEqual(["情侣", "纪念", "相册"]);
    expect(metadata.openGraph).toMatchObject({
      title: "Like Zhizhi",
      description: "情侣纪念站",
      type: "website",
      locale: "zh_CN"
    });
  });

  it("builds public sitemap entries with note detail pages", async () => {
    const { buildPublicSitemap } = await import("@/features/public/seo");
    const lastModified = new Date("2026-05-16T00:00:00.000Z");

    const entries = buildPublicSitemap({
      baseUrl: "https://love.example.com/",
      routes: ["/", "/notes"],
      noteSlugs: [{ slug: "first-memory", updatedAt: lastModified }]
    });

    expect(entries).toEqual([
      { url: "https://love.example.com/", lastModified },
      { url: "https://love.example.com/notes", lastModified },
      { url: "https://love.example.com/notes/first-memory", lastModified }
    ]);
  });

  it("builds robots rules for the configured public URL", async () => {
    const { buildRobots } = await import("@/features/public/seo");

    expect(buildRobots("https://love.example.com")).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"]
      },
      sitemap: "https://love.example.com/sitemap.xml"
    });
  });
});
