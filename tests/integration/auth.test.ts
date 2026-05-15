import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/prisma", async () => {
  const bcrypt = await vi.importActual<typeof import("bcryptjs")>("bcryptjs");
  const passwordHash = await bcrypt.default.hash("Secret123!", 12);

  return {
    prisma: {
      user: {
        findUnique: vi.fn(async () => ({
          id: "user_1",
          email: "owner@example.com",
          name: "Owner",
          role: "OWNER",
          passwordHash
        }))
      },
      session: {
        create: vi.fn(async () => ({ id: "session_1" }))
      }
    }
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn()
  }))
}));

describe("login route", () => {
  it("accepts valid credentials", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "owner@example.com", password: "Secret123!" })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
