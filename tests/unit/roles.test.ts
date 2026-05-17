import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  canManageContent,
  canManageSettings,
  canManageUsers,
  canModerateMessages,
  getVisibleAdminNavGroups
} from "@/server/auth/roles";

describe("role permissions", () => {
  it("allows all authenticated roles into admin", () => {
    expect(canAccessAdmin("OWNER")).toBe(true);
    expect(canAccessAdmin("PARTNER")).toBe(true);
    expect(canAccessAdmin("MODERATOR")).toBe(true);
  });

  it("limits user management to owner", () => {
    expect(canManageUsers("OWNER")).toBe(true);
    expect(canManageUsers("PARTNER")).toBe(false);
    expect(canManageUsers("MODERATOR")).toBe(false);
  });

  it("allows owner and partner to manage settings", () => {
    expect(canManageSettings("OWNER")).toBe(true);
    expect(canManageSettings("PARTNER")).toBe(true);
    expect(canManageSettings("MODERATOR")).toBe(false);
  });

  it("allows owner and partner to manage content", () => {
    expect(canManageContent("OWNER")).toBe(true);
    expect(canManageContent("PARTNER")).toBe(true);
    expect(canManageContent("MODERATOR")).toBe(false);
  });

  it("allows owner, partner, and moderator to moderate messages", () => {
    expect(canModerateMessages("OWNER")).toBe(true);
    expect(canModerateMessages("PARTNER")).toBe(true);
    expect(canModerateMessages("MODERATOR")).toBe(true);
  });

  it("filters admin navigation by role capabilities", () => {
    const ownerLinks = getVisibleAdminNavGroups("OWNER").flatMap((group) => group.items.map((item) => item.href));
    const moderatorLinks = getVisibleAdminNavGroups("MODERATOR").flatMap((group) => group.items.map((item) => item.href));

    expect(ownerLinks).toContain("/admin/users");
    expect(ownerLinks).toContain("/admin/content/carousel");
    expect(ownerLinks).toContain("/admin/settings/site");
    expect(ownerLinks).toContain("/admin/content/messages");
    expect(moderatorLinks).toContain("/admin/content/messages");
    expect(moderatorLinks).not.toContain("/admin/users");
    expect(moderatorLinks).not.toContain("/admin/settings/site");
    expect(moderatorLinks).not.toContain("/admin/content/notes");
  });
});
