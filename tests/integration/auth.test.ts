import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUserUnique } = vi.hoisted(() => ({
  findUserUnique: vi.fn()
}));

vi.mock("@/server/db/prisma", async () => {
  const bcrypt = await vi.importActual<typeof import("bcryptjs")>("bcryptjs");
  const passwordHash = await bcrypt.default.hash("Secret123!", 12);
  findUserUnique.mockImplementation(async () => ({
    id: "user_1",
    email: "owner@example.com",
    name: "Owner",
    role: "OWNER",
    passwordHash,
    disabledAt: null
  }));

  return {
    prisma: {
      user: {
        findUnique: findUserUnique
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

beforeEach(() => {
  findUserUnique.mockClear();
});

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

  it("rejects disabled users", async () => {
    const bcrypt = await vi.importActual<typeof import("bcryptjs")>("bcryptjs");
    const passwordHash = await bcrypt.default.hash("Secret123!", 12);
    const { POST } = await import("@/app/api/auth/login/route");

    findUserUnique.mockResolvedValueOnce({
      id: "user_1",
      email: "owner@example.com",
      name: "Owner",
      role: "OWNER",
      passwordHash,
      disabledAt: new Date("2026-05-16T00:00:00.000Z")
    });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "owner@example.com", password: "Secret123!" })
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
