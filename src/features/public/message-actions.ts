import { z } from "zod";

import { prisma } from "@/server/db/prisma";

export const visitorMessageSchema = z.object({
  nickname: z.string().trim().min(2, "昵称至少 2 个字符").max(24, "昵称最多 24 个字符"),
  content: z.string().trim().min(5, "留言至少 5 个字符").max(500, "留言最多 500 个字符")
});

export type VisitorMessageResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

export async function createVisitorMessage(input: unknown): Promise<VisitorMessageResult> {
  const parsed = visitorMessageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const message = await prisma.message.create({
    data: {
      nickname: parsed.data.nickname,
      content: parsed.data.content,
      status: "PENDING"
    },
    select: { id: true }
  });

  return { ok: true, id: message.id };
}
