import { describe, expect, it, vi } from "vitest";
import type { R2Bucket } from "@cloudflare/workers-types";
import { createStorageFromBindings } from "@/server/storage";
import { createR2StorageAdapter } from "@/server/storage/r2-storage";
import { createStorageAdapter, resolveStoragePublicBaseUrl } from "@/server/storage/s3-storage";

describe("S3 storage adapter", () => {
  it("defaults public URLs to the app-hosted media route", () => {
    expect(
      resolveStoragePublicBaseUrl({
        appUrl: "https://love.example.com/",
        publicBaseUrl: undefined
      })
    ).toBe("https://love.example.com/api/media");
  });

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

  it("gets uploaded objects for app-hosted media access", async () => {
    const body = new Uint8Array([1, 2, 3]);
    const send = vi.fn(async () => ({
      Body: body,
      ContentType: "image/png",
      ContentLength: 3
    }));
    const adapter = createStorageAdapter({
      client: { send },
      bucket: "like-zhizhi",
      publicBaseUrl: "https://love.example.com/api/media"
    });

    const result = await adapter.getObject("media/2026/photo.png");

    expect(send).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      body,
      contentType: "image/png",
      contentLength: 3
    });
  });
});

describe("R2 storage adapter", () => {
  it("writes objects through the R2 bucket binding and builds public URLs", async () => {
    const put = vi.fn(async () => undefined);
    const bucket = { put } as unknown as R2Bucket;
    const body = new Uint8Array([1, 2, 3]);
    const adapter = createR2StorageAdapter({
      bucket,
      bucketName: "like-zhizhi-media",
      publicBaseUrl: "https://media.example.com"
    });

    const result = await adapter.putObject({
      key: "media/photo.jpg",
      body,
      contentType: "image/jpeg"
    });

    expect(put).toHaveBeenCalledWith("media/photo.jpg", body, {
      httpMetadata: { contentType: "image/jpeg" }
    });
    expect(result).toEqual({
      bucket: "like-zhizhi-media",
      key: "media/photo.jpg",
      publicUrl: "https://media.example.com/media/photo.jpg"
    });
  });

  it("selects R2 storage when a media bucket binding exists", () => {
    const storage = createStorageFromBindings({
      mediaBucket: { put: vi.fn(), get: vi.fn() } as unknown as R2Bucket,
      bucketName: "like-zhizhi-media",
      publicBaseUrl: "https://media.example.com"
    });

    expect(storage.kind).toBe("r2");
  });
});
