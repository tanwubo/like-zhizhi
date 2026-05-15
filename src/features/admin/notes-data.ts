import { prisma } from "@/server/db/prisma";

export function normalizeNoteSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAdminNotes() {
  return prisma.note.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      status: true,
      publishedAt: true,
      updatedAt: true
    }
  });
}

export async function getAdminNote(id: string) {
  return prisma.note.findUnique({ where: { id } });
}
