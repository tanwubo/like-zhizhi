import { describe, expect, it } from "vitest";
import { toResponseBody } from "@/server/storage/media-response";

describe("media route response body", () => {
  it("accepts a ReadableStream from R2 objects", () => {
    const stream = new ReadableStream();

    expect(toResponseBody(stream)).toBe(stream);
  });

  it("accepts Uint8Array content without relying on Node runtime", () => {
    const body = toResponseBody(new Uint8Array([1, 2, 3]));

    expect(body).toBeInstanceOf(ArrayBuffer);
  });
});
