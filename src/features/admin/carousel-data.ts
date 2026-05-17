import { prisma } from "@/server/db/prisma";

export async function getAdminCarouselSlides() {
  return prisma.carouselSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getAdminCarouselSlide(id: string) {
  return prisma.carouselSlide.findUnique({
    where: { id }
  });
}
