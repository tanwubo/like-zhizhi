import { describe, expect, it } from "vitest";
import { canAccessAdmin, canManageUsers, canModerateMessages } from "@/server/auth/roles";

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

  it("allows owner, partner, and moderator to moderate messages", () => {
    expect(canModerateMessages("OWNER")).toBe(true);
    expect(canModerateMessages("PARTNER")).toBe(true);
    expect(canModerateMessages("MODERATOR")).toBe(true);
  });
});
