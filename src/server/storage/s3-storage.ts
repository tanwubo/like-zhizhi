import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { joinPublicUrl } from "@/lib/public-url";
import { env } from "@/server/config/env";
import type { PutObjectInput, StorageAdapter } from "@/server/storage/types";

type SendableClient = {
  send(command: GetObjectCommand | PutObjectCommand): Promise<unknown>;
};

export function resolveStoragePublicBaseUrl({
  appUrl,
  publicBaseUrl
}: {
  appUrl: string;
  publicBaseUrl?: string;
}) {
  return publicBaseUrl?.replace(/\/+$/, "") || joinPublicUrl(appUrl, "/api/media");
}

export function createS3Client() {
  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY
    }
  });
}

export function createStorageAdapter({
  client,
  bucket,
  publicBaseUrl
}: {
  client: SendableClient;
  bucket: string;
  publicBaseUrl: string;
}): StorageAdapter {
  return {
    kind: "s3",
    async putObject(input: PutObjectInput) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType
        })
      );

      return {
        bucket,
        key: input.key,
        publicUrl: joinPublicUrl(publicBaseUrl, input.key)
      };
    },
    async getObject(key: string) {
      const result = (await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key
        })
      )) as {
        Body?: unknown;
        ContentType?: string;
        ContentLength?: number;
      };

      return {
        body: result.Body,
        contentType: result.ContentType,
        contentLength: result.ContentLength
      };
    }
  };
}

export const storage = createStorageAdapter({
  client: createS3Client(),
  bucket: env.S3_BUCKET,
  publicBaseUrl: resolveStoragePublicBaseUrl({
    appUrl: env.APP_URL,
    publicBaseUrl: env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
  })
});
