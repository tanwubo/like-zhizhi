import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const homePage = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");

describe("home page copy", () => {
  it("keeps homepage Chinese copy readable", () => {
    expect(homePage).toContain("我们的相册");
    expect(homePage).toContain("悄悄话");
    expect(homePage).not.toContain("鐩");
    expect(homePage).not.toContain("杩");
    expect(homePage).not.toContain("鈾");
  });

  it("uses semantic public font role classes on the homepage", () => {
    expect(homePage).toContain("font-display");
    expect(homePage).toContain("font-romance");
    expect(homePage).toContain("font-number");
  });
});
