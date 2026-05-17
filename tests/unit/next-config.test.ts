import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next config", () => {
  it("allows Server Action bodies up to 10 MB for media uploads", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("10mb");
  });
});
