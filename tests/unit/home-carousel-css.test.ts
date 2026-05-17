import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("home carousel css", () => {
  it("does not rely on slide-count-specific keyframes for the homepage carousel", () => {
    expect(globalsCss).not.toContain("home-hero-slides-2");
    expect(globalsCss).not.toContain("home-hero-carousel-2");
    expect(globalsCss).not.toContain("home-hero-carousel-3");
    expect(globalsCss).not.toContain("home-hero-carousel-4");
    expect(globalsCss).not.toContain("--home-slide-index");
  });
});
