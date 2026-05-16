import type { MetadataRoute } from "next";
import type { Metadata } from "next";

import { joinPublicUrl } from "@/lib/public-url";

type SiteMetadataInput = {
  title: string;
  description: string;
  slogan?: string | null;
  seoKeywords?: string | null;
};

type SitemapInput = {
  baseUrl: string;
  routes: string[];
  noteSlugs: Array<{ slug: string; updatedAt: Date }>;
};

export function getSiteBaseUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export function buildSiteMetadata(site: SiteMetadataInput): Metadata {
  const keywords =
    site.seoKeywords
      ?.split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean) ?? [];

  return {
    title: site.title,
    description: site.description || site.slogan || site.title,
    keywords,
    openGraph: {
      title: site.title,
      description: site.description || site.slogan || site.title,
      type: "website",
      locale: "zh_CN"
    }
  };
}

export function buildPublicSitemap(input: SitemapInput): MetadataRoute.Sitemap {
  const latestContentDate = input.noteSlugs[0]?.updatedAt ?? new Date();
  const baseRoutes = input.routes.map((route) => ({
    url: route === "/" ? input.baseUrl.replace(/\/+$/, "/") : joinPublicUrl(input.baseUrl, route),
    lastModified: latestContentDate
  }));
  const noteRoutes = input.noteSlugs.map((note) => ({
    url: joinPublicUrl(input.baseUrl, `/notes/${note.slug}`),
    lastModified: note.updatedAt
  }));

  return [...baseRoutes, ...noteRoutes];
}

export function buildRobots(baseUrl: string): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"]
    },
    sitemap: joinPublicUrl(baseUrl, "/sitemap.xml")
  };
}
