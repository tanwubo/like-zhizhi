import { createCipheriv, createHash, randomBytes } from "node:crypto";

import { z } from "zod";

import { env } from "@/server/config/env";

export type IntegrationKey = "map" | "weather" | "email" | "storage" | "music";

export type IntegrationRecordInput = {
  key: string;
  enabled: boolean;
  provider: string;
  config: unknown;
  secrets: unknown;
};

export type IntegrationSaveRecord = {
  key: IntegrationKey;
  enabled: boolean;
  provider: string;
  config: Record<string, unknown>;
  secrets: Record<string, string>;
};

export type IntegrationAdminModel = {
  [key in IntegrationKey]: {
    key: IntegrationKey;
    label: string;
    enabled: boolean;
    provider: string;
    config: Record<string, unknown>;
    secrets: Record<string, { configured: boolean; placeholder: string }>;
  };
};

type ExistingSecrets = Partial<Record<IntegrationKey, Record<string, string>>>;

const integrationDefinitions = {
  map: {
    label: "地图服务",
    provider: "none",
    secretFields: ["secretKey"]
  },
  weather: {
    label: "天气服务",
    provider: "none",
    secretFields: ["apiKey"]
  },
  email: {
    label: "邮件通知",
    provider: "none",
    secretFields: ["smtpPassword"]
  },
  storage: {
    label: "对象存储",
    provider: "s3",
    secretFields: []
  },
  music: {
    label: "音乐服务",
    provider: "none",
    secretFields: ["apiKey"]
  }
} satisfies Record<IntegrationKey, { label: string; provider: string; secretFields: string[] }>;

const integrationKeys = Object.keys(integrationDefinitions) as IntegrationKey[];

const optionalUrlSchema = z.string().trim().optional();
const optionalEmailSchema = z.string().trim().optional();

function encryptedSecretKey() {
  return createHash("sha256").update(env.AUTH_SESSION_SECRET).digest();
}

export function encryptIntegrationSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptedSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return ["enc:v1", iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function secretValue(
  formData: FormData,
  name: string,
  existingSecrets: ExistingSecrets,
  key: IntegrationKey,
  secretName: string
) {
  const value = stringValue(formData, name);
  if (value) {
    return encryptIntegrationSecret(value);
  }

  return existingSecrets[key]?.[secretName];
}

function validateOptionalUrl(value: string, message: string, errors: Record<string, string[]>, field: string) {
  const parsed = optionalUrlSchema.refine((input) => !input || z.string().url().safeParse(input).success, message).safeParse(value);
  if (!parsed.success) {
    errors[field] = [message];
  }
}

function validateOptionalEmail(value: string, message: string, errors: Record<string, string[]>, field: string) {
  const parsed = optionalEmailSchema
    .refine((input) => !input || z.string().email().safeParse(input).success, message)
    .safeParse(value);
  if (!parsed.success) {
    errors[field] = [message];
  }
}

export function parseIntegrationSettingsInput(formData: FormData, existingSecrets: ExistingSecrets) {
  const errors: Record<string, string[]> = {};
  const mapApiBaseUrl = stringValue(formData, "mapApiBaseUrl");
  const weatherApiBaseUrl = stringValue(formData, "weatherApiBaseUrl");
  const emailFromEmail = stringValue(formData, "emailFromEmail");
  const musicApiBaseUrl = stringValue(formData, "musicApiBaseUrl");
  const emailPortValue = stringValue(formData, "emailPort");
  const emailPort = emailPortValue ? Number(emailPortValue) : undefined;

  validateOptionalUrl(mapApiBaseUrl, "请输入有效的地图服务 URL", errors, "mapApiBaseUrl");
  validateOptionalUrl(weatherApiBaseUrl, "请输入有效的天气服务 URL", errors, "weatherApiBaseUrl");
  validateOptionalUrl(musicApiBaseUrl, "请输入有效的音乐服务 URL", errors, "musicApiBaseUrl");
  validateOptionalEmail(emailFromEmail, "请输入有效的发件邮箱", errors, "emailFromEmail");

  if (emailPortValue && (emailPort === undefined || !Number.isInteger(emailPort) || emailPort < 1 || emailPort > 65535)) {
    errors.emailPort = ["SMTP 端口必须是 1 到 65535 之间的整数"];
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors };
  }

  const records: Record<IntegrationKey, IntegrationSaveRecord> = {
    map: {
      key: "map",
      enabled: booleanValue(formData, "mapEnabled"),
      provider: stringValue(formData, "mapProvider") || "none",
      config: {
        apiBaseUrl: mapApiBaseUrl,
        publicKey: stringValue(formData, "mapPublicKey")
      },
      secrets: {
        ...(secretValue(formData, "mapSecretKey", existingSecrets, "map", "secretKey")
          ? { secretKey: secretValue(formData, "mapSecretKey", existingSecrets, "map", "secretKey") as string }
          : {})
      }
    },
    weather: {
      key: "weather",
      enabled: booleanValue(formData, "weatherEnabled"),
      provider: stringValue(formData, "weatherProvider") || "none",
      config: { apiBaseUrl: weatherApiBaseUrl, defaultLocation: stringValue(formData, "weatherDefaultLocation") },
      secrets: {
        ...(secretValue(formData, "weatherApiKey", existingSecrets, "weather", "apiKey")
          ? { apiKey: secretValue(formData, "weatherApiKey", existingSecrets, "weather", "apiKey") as string }
          : {})
      }
    },
    email: {
      key: "email",
      enabled: booleanValue(formData, "emailEnabled"),
      provider: stringValue(formData, "emailProvider") || "none",
      config: {
        host: stringValue(formData, "emailHost"),
        port: emailPort ?? null,
        fromEmail: emailFromEmail,
        username: stringValue(formData, "emailUsername")
      },
      secrets: {
        ...(secretValue(formData, "emailSmtpPassword", existingSecrets, "email", "smtpPassword")
          ? { smtpPassword: secretValue(formData, "emailSmtpPassword", existingSecrets, "email", "smtpPassword") as string }
          : {})
      }
    },
    storage: {
      key: "storage",
      enabled: booleanValue(formData, "storageEnabled"),
      provider: "s3",
      config: {},
      secrets: {}
    },
    music: {
      key: "music",
      enabled: booleanValue(formData, "musicEnabled"),
      provider: stringValue(formData, "musicProvider") || "none",
      config: { apiBaseUrl: musicApiBaseUrl },
      secrets: {
        ...(secretValue(formData, "musicApiKey", existingSecrets, "music", "apiKey")
          ? { apiKey: secretValue(formData, "musicApiKey", existingSecrets, "music", "apiKey") as string }
          : {})
      }
    }
  };

  return { ok: true as const, records };
}

export function buildIntegrationAdminModel(rows: IntegrationRecordInput[]): IntegrationAdminModel {
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return Object.fromEntries(
    integrationKeys.map((key) => {
      const definition = integrationDefinitions[key];
      const row = byKey.get(key);
      const secrets = asRecord(row?.secrets);

      return [
        key,
        {
          key,
          label: definition.label,
          enabled: row?.enabled ?? false,
          provider: row?.provider || definition.provider,
          config: asRecord(row?.config),
          secrets: Object.fromEntries(
            definition.secretFields.map((field) => {
              const configured = typeof secrets[field] === "string" && Boolean(secrets[field]);
              return [field, { configured, placeholder: configured ? "已配置，留空则不修改" : "未配置" }];
            })
          )
        }
      ];
    })
  ) as IntegrationAdminModel;
}

export function extractExistingSecrets(rows: IntegrationRecordInput[]) {
  return Object.fromEntries(rows.map((row) => [row.key, asRecord(row.secrets)])) as ExistingSecrets;
}

export function buildStorageHealth(input: { endpoint: string; bucket: string; region: string; publicBaseUrl: string }) {
  const missing = [
    ["S3_ENDPOINT", input.endpoint],
    ["S3_BUCKET", input.bucket],
    ["S3_REGION", input.region],
    ["NEXT_PUBLIC_STORAGE_PUBLIC_URL", input.publicBaseUrl]
  ].find(([, value]) => !value);

  return missing
    ? { configured: false, label: `缺少 ${missing[0]}` }
    : { configured: true, label: "配置完整" };
}

export function getStorageEnvironmentSummary() {
  const summary = {
    endpoint: env.S3_ENDPOINT,
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    publicBaseUrl: env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
  };

  return {
    ...summary,
    health: buildStorageHealth(summary)
  };
}
