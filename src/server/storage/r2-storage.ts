import type { R2Bucket } from "@cloudflare/workers-types";
import { joinPublicUrl } from "@/lib/public-url";
import type { PutObjectInput, StorageAdapter } from "@/server/storage/types";

function toR2Body(body: PutObjectInput["body"]) {
  if (typeof body === "string" || body instanceof Uint8Array) {
    return body;
  }

  return new Uint8Array(body);
}

export function createR2StorageAdapter({
  bucket,
  bucketName,
  publicBaseUrl
}: {
  bucket: R2Bucket;
  bucketName: string;
  publicBaseUrl: string;
}): StorageAdapter {
  return {
    kind: "r2",
    async putObject(input) {
      await bucket.put(input.key, toR2Body(input.body), {
        httpMetadata: {
          contentType: input.contentType
        }
      });

      return {
        bucket: bucketName,
        key: input.key,
        publicUrl: joinPublicUrl(publicBaseUrl, input.key)
      };
    },
    async getObject(key) {
      const result = await bucket.get(key);
      if (!result) {
        return {
          body: null
        };
      }

      return {
        body: result.body,
        contentType: result.httpMetadata?.contentType,
        contentLength: result.size
      };
    }
  };
}
