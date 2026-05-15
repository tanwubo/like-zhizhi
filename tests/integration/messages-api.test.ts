import { describe, expect, it, vi } from "vitest";

const createMessage = vi.fn(async () => ({ id: "message_1" }));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    message: {
      create: createMessage
    }
  }
}));

describe("visitor message API", () => {
  it("rejects short nickname and content", async () => {
    const { POST } = await import("@/app/api/messages/route");
    const response = await POST(
      new Request("http://localhost/api/messages", {
        method: "POST",
        body: JSON.stringify({ nickname: "a", content: "短" })
      })
    );

    expect(response.status).toBe(400);
    expect(createMessage).not.toHaveBeenCalled();
  });

  it("accepts valid visitor messages", async () => {
    const { POST } = await import("@/app/api/messages/route");
    const response = await POST(
      new Request("http://localhost/api/messages", {
        method: "POST",
        body: JSON.stringify({ nickname: "测试访客", content: "这是一条公开留言，等待审核后展示。" })
      })
    );

    expect(response.status).toBe(201);
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nickname: "测试访客",
          content: "这是一条公开留言，等待审核后展示。",
          status: "PENDING"
        })
      })
    );
  });
});
