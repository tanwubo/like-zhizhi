import { describe, expect, it, vi } from "vitest";

vi.mock("@amap/amap-jsapi-loader", () => ({
  default: {
    load: vi.fn(async () => ({
      getConfig: () => ({ appname: "" })
    }))
  }
}));

import AMapLoader from "@amap/amap-jsapi-loader";
import { configureAMapSecurity, loadAMap } from "@/lib/amap-loader";

describe("amap loader", () => {
  it("returns a missing-key result without loading AMap", async () => {
    const result = await loadAMap({});

    expect(result).toEqual({ ok: false, reason: "missing-key" });
    expect(AMapLoader.load).not.toHaveBeenCalled();
  });

  it("configures serviceHost before loading", () => {
    configureAMapSecurity({ serviceHost: "https://example.com/_AMapService" });

    expect(window._AMapSecurityConfig).toEqual({ serviceHost: "https://example.com/_AMapService" });
  });

  it("loads JSAPI v2 and preloads requested plugins", async () => {
    const result = await loadAMap({
      key: "test-key",
      securityJsCode: "test-code",
      plugins: ["AMap.Scale", "AMap.AutoComplete", "AMap.PlaceSearch"]
    });

    expect(result.ok).toBe(true);
    expect(AMapLoader.load).toHaveBeenCalledWith({
      key: "test-key",
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.AutoComplete", "AMap.PlaceSearch"]
    });
  });
});
