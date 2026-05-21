import { describe, expect, it } from "vitest";

import { generateD1SeedSql } from "@/../prisma/seed-d1";

describe("generateD1SeedSql", () => {
  it("creates idempotent seed SQL for remote D1 without destructive deletes", () => {
    const sql = generateD1SeedSql({
      ownerEmail: "owner'o@example.com",
      ownerPasswordHash: "hash'value",
      now: "2026-05-21T12:00:00.000Z"
    });

    expect(sql).toContain("PRAGMA foreign_keys = ON;");
    expect(sql).toContain("owner''o@example.com");
    expect(sql).toContain("hash''value");
    expect(sql).toContain("ON CONFLICT");
    expect(sql).toContain('(SELECT "id" FROM "User" WHERE "email" = \'owner\'\'o@example.com\')');
    expect(sql).not.toContain('DELETE FROM "FootprintPlace"');
  });
});
