import { describe, expect, it } from "vitest";

import { normalizeModuleSettings } from "@/features/admin/settings-data";

describe("admin settings data", () => {
  it("sorts modules by sortOrder then label", () => {
    const modules = normalizeModuleSettings([
      { id: "2", key: "messages", label: "留言", enabled: true, sortOrder: 20, description: "" },
      { id: "1", key: "notes", label: "点滴", enabled: true, sortOrder: 10, description: "" }
    ]);

    expect(modules.map((module) => module.key)).toEqual(["notes", "messages"]);
  });
});
