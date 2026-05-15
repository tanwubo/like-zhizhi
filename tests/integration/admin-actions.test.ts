import { describe, expect, it, vi } from "vitest";

const updateSite = vi.fn(async () => ({ id: "site" }));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    siteSetting: { update: updateSite },
    personProfile: { update: vi.fn(async () => ({ id: "person_1" })) },
    moduleSetting: { update: vi.fn(async () => ({ id: "module_1" })) }
  }
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("admin settings actions", () => {
  it("rejects blank site title", async () => {
    const { validateSiteSettings, updateSiteSettings } = await import("@/features/admin/settings-actions");
    const result = await validateSiteSettings(new FormData());

    expect(result.ok).toBe(false);
    await updateSiteSettings(new FormData());
    expect(updateSite).not.toHaveBeenCalled();
  });
});
