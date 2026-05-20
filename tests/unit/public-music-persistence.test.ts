import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("public music player persistence", () => {
  it("mounts the music player from the persistent root layout instead of the home page", () => {
    expect(source("src/app/layout.tsx")).toContain("PublicMusicPlayer");
    expect(source("src/app/page.tsx")).not.toContain("FloatingMusicPlayer");
  });
});
