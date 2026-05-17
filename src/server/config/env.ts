import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_COOKIE_NAME: z.string().default("like_zhizhi_session"),
  AUTH_SESSION_SECRET: z.string().min(16).default("dev-only-session-secret"),
  S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("like-zhizhi"),
  S3_ACCESS_KEY_ID: z.string().default("like_zhizhi"),
  S3_SECRET_ACCESS_KEY: z.string().default("like_zhizhi_secret"),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  NEXT_PUBLIC_STORAGE_PUBLIC_URL: optionalUrl
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  NEXT_PUBLIC_STORAGE_PUBLIC_URL:
    parsedEnv.NEXT_PUBLIC_STORAGE_PUBLIC_URL ?? `${parsedEnv.APP_URL.replace(/\/+$/, "")}/api/media`
};
