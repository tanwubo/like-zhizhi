import { prisma } from "@/server/db/prisma";

export async function getModerationMessages() {
  return prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      nickname: true,
      content: true,
      status: true,
      location: true,
      createdAt: true
    }
  });
}
