import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const homePage = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");

describe("home page copy", () => {
  it("keeps homepage Chinese copy readable", () => {
    expect(homePage).toContain("收好我们的日常");
    expect(homePage).toContain("大家的祝福");
    expect(homePage).not.toContain("鐩");
    expect(homePage).not.toContain("杩");
    expect(homePage).not.toContain("鈾");
  });
});
