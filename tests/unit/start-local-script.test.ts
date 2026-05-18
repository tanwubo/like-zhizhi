import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("start-local.ps1", () => {
  it("passes the dev server port directly to Next.js", () => {
    const script = readFileSync(resolve("start-local.ps1"), "utf8");

    expect(script).toContain('Invoke-Pnpm -Arguments @("dev", "-p", "$Port")');
    expect(script).not.toContain('Invoke-Pnpm -Arguments @("dev", "--", "-p", "$Port")');
  });

  it("keeps restart mode self-healing for dependencies and Prisma client", () => {
    const script = readFileSync(resolve("start-local.ps1"), "utf8");

    expect(script).toContain('Invoke-Pnpm -Arguments @("install", "--frozen-lockfile")');
    expect(script).not.toContain("node_modules exists. Skipping install for restart mode.");
    expect(script).toContain('Write-Step "Preparing Prisma client"');
    expect(script).toContain('Invoke-Pnpm -Arguments @("db:generate")');
  });

  it("handles an existing project dev server before syncing generated files", () => {
    const script = readFileSync(resolve("start-local.ps1"), "utf8");

    const portHandlingIndex = script.indexOf("Stop-ExistingProjectDevServer -TargetPort");
    const installIndex = script.indexOf('Invoke-Pnpm -Arguments @("install", "--frozen-lockfile")');
    const generateIndex = script.indexOf('Invoke-Pnpm -Arguments @("db:generate")');

    expect(portHandlingIndex).toBeGreaterThan(-1);
    expect(installIndex).toBeGreaterThan(portHandlingIndex);
    expect(generateIndex).toBeGreaterThan(portHandlingIndex);
    expect(script).toContain("Existing process on port $TargetPort belongs to this project. Stopping it for a clean restart.");
  });
});
