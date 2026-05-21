import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient, type Prisma } from "@prisma/client";
import { getCloudflareContextSafe } from "@/server/cloudflare/bindings";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

async function createPrismaClient() {
  const context = await getCloudflareContextSafe();
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];

  if (context?.env.DB) {
    return new PrismaClient({
      adapter: new PrismaD1(context.env.DB),
      log
    });
  }

  return new PrismaClient({
    log
  });
}

export const prisma =
  globalForPrisma.prisma ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
