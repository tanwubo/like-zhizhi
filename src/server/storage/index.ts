import { getCloudflareContextSafe } from "@/server/cloudflare/bindings";
import { env } from "@/server/config/env";
import { createR2StorageAdapter } from "@/server/storage/r2-storage";
import { resolveStoragePublicBaseUrl, storage as s3Storage } from "@/server/storage/s3-storage";
import type { StorageAdapter } from "@/server/storage/types";

export function createStorageFromBindings({
  mediaBucket,
  bucketName,
  publicBaseUrl
}: {
  mediaBucket?: R2Bucket;
  bucketName: string;
  publicBaseUrl: string;
}): StorageAdapter {
  if (mediaBucket) {
    return createR2StorageAdapter({
      bucket: mediaBucket,
      bucketName,
      publicBaseUrl
    });
  }

  return s3Storage;
}

export async function getStorage(): Promise<StorageAdapter> {
  const context = await getCloudflareContextSafe();

  return createStorageFromBindings({
    mediaBucket: context?.env.MEDIA_BUCKET,
    bucketName: env.S3_BUCKET,
    publicBaseUrl: resolveStoragePublicBaseUrl({
      appUrl: env.APP_URL,
      publicBaseUrl: env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
    })
  });
}
