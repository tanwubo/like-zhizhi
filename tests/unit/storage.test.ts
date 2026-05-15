import { describe, expect, it, vi } from "vitest";
import { createStorageAdapter } from "@/server/storage/s3-storage";

describe("S3 storage adapter", () => {
  it("builds a public URL after upload", async () => {
    const send = vi.fn(async () => ({}));
    const adapter = createStorageAdapter({
      client: { send },
      bucket: "like-zhizhi",
      publicBaseUrl: "http://localhost:9000/like-zhizhi"
    });

    const result = await adapter.putObject({
      key: "photos/one.jpg",
      body: Buffer.from("image"),
      contentType: "image/jpeg"
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(result.publicUrl).toBe("http://localhost:9000/like-zhizhi/photos/one.jpg");
  });
});
