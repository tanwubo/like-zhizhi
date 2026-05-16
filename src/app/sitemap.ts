import { buildPublicSitemap, getSiteBaseUrl } from "@/features/public/seo";
import { prisma } from "@/server/db/prisma";

export default async function sitemap() {
  const [modules, notes] = await Promise.all([
    prisma.moduleSetting.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { key: true }
    }),
    prisma.note.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { slug: true, updatedAt: true }
    })
  ]);
  const routeByKey: Record<string, string> = {
    home: "/",
    notes: "/notes",
    messages: "/messages",
    footprints: "/footprints",
    album: "/album",
    checklist: "/checklist",
    "love-days": "/love-days",
    about: "/about"
  };
  const routes = Array.from(new Set(["/", ...modules.map((module) => routeByKey[module.key]).filter(Boolean)]));

  return buildPublicSitemap({
    baseUrl: getSiteBaseUrl(),
    routes,
    noteSlugs: notes
  });
}
