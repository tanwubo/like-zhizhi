import { describe, expect, it } from "vitest";

import { validateNoteInput } from "@/features/admin/notes-actions";
import { normalizeNoteSlug } from "@/features/admin/notes-data";

describe("admin notes", () => {
  it("normalizes human note titles into stable slugs", () => {
    expect(normalizeNoteSlug("  First Memory 2026!  ")).toBe("first-memory-2026");
  });

  it("rejects notes without title and content", () => {
    const result = validateNoteInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toContain("标题不能为空");
      expect(result.errors.content).toContain("正文不能为空");
    }
  });
});
