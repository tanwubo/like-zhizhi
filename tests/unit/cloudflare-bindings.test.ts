import { describe, expect, it, vi } from "vitest";

describe("Cloudflare bindings", () => {
  it("returns undefined when OpenNext Cloudflare runtime is unavailable", async () => {
    vi.resetModules();
    vi.doMock("@opennextjs/cloudflare", () => {
      throw new Error("module unavailable");
    });

    const { getCloudflareContextSafe } = await import("@/server/cloudflare/bindings");

    await expect(getCloudflareContextSafe()).resolves.toBeUndefined();
  });
});
