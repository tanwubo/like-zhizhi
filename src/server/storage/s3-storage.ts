import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { joinPublicUrl } from "@/lib/public-url";
import { env } from "@/server/config/env";

type SendableClient = {
  send(command: PutObjectCommand): Promise<unknown>;
};

export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
};

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
}) {
  return {
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
    }
  };
}

export const storage = createStorageAdapter({
  client: createS3Client(),
  bucket: env.S3_BUCKET,
  publicBaseUrl: env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
});
