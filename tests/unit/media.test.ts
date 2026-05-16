import { MediaType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  buildMediaObjectKey,
  detectMediaType,
  parseExternalMediaInput,
  readImageDimensions
} from "@/features/admin/media-utils";

describe("admin media utilities", () => {
  it("detects media types from content type and filename", () => {
    expect(detectMediaType("image/jpeg", "photo.jpg")).toBe(MediaType.IMAGE);
    expect(detectMediaType("video/mp4", "clip.mp4")).toBe(MediaType.VIDEO);
    expect(detectMediaType("audio/mpeg", "song.mp3")).toBe(MediaType.AUDIO);
    expect(detectMediaType("application/octet-stream", "archive.zip")).toBe(MediaType.FILE);
  });

  it("builds stable storage keys with sanitized filenames", () => {
    const now = new Date("2026-05-16T08:09:10.000Z");

    expect(buildMediaObjectKey(" Our Photo 01.JPG ", now)).toBe("media/2026/05/16/080910-our-photo-01.jpg");
  });

  it("reads PNG dimensions from file bytes", () => {
    const png = Buffer.from(
      "89504e470d0a1a0a0000000d4948445200000010000000200806000000",
      "hex"
    );

    expect(readImageDimensions(png, "image/png")).toEqual({ width: 16, height: 32 });
  });

  it("parses external media registration input", () => {
    const formData = new FormData();

    formData.set("publicUrl", "https://example.com/uploads/sea.webp");
    formData.set("filename", "");
    formData.set("contentType", "");
    formData.set("sizeBytes", "2048");
    formData.set("width", "1200");
    formData.set("height", "800");

    expect(parseExternalMediaInput(formData)).toEqual({
      ok: true,
      data: {
        type: MediaType.IMAGE,
        bucket: "external",
        objectKey: "/uploads/sea.webp",
        publicUrl: "https://example.com/uploads/sea.webp",
        filename: "sea.webp",
        contentType: "image/webp",
        sizeBytes: 2048,
        width: 1200,
        height: 800
      }
    });
  });

  it("rejects invalid external media URLs", () => {
    const formData = new FormData();

    formData.set("publicUrl", "broken");

    const result = parseExternalMediaInput(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.publicUrl).toContain("媒体地址必须是有效 URL");
    }
  });
});
