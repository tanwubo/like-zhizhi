import { describe, expect, it } from "vitest";

import {
  buildIntegrationAdminModel,
  buildStorageHealth,
  encryptIntegrationSecret,
  parseIntegrationSettingsInput
} from "@/features/admin/integration-utils";

describe("admin integration utilities", () => {
  it("normalizes missing integration rows without exposing secret values", () => {
    const model = buildIntegrationAdminModel([]);

    expect(model.map).toMatchObject({
      key: "map",
      label: "地图服务",
      provider: "none",
      enabled: false,
      config: {}
    });
    expect(model.email.secrets.smtpPassword).toEqual({ configured: false, placeholder: "未配置" });
  });

  it("marks encrypted secrets as configured without returning their plaintext", () => {
    const encrypted = encryptIntegrationSecret("smtp-secret");
    const model = buildIntegrationAdminModel([
      {
        key: "email",
        enabled: true,
        provider: "smtp",
        config: { fromEmail: "hello@example.com" },
        secrets: { smtpPassword: encrypted }
      }
    ]);

    expect(model.email.secrets.smtpPassword).toEqual({ configured: true, placeholder: "已配置，留空则不修改" });
    expect(JSON.stringify(model.email)).not.toContain("smtp-secret");
  });

  it("validates provider URLs and email addresses before saving", () => {
    const formData = new FormData();

    formData.set("mapEnabled", "on");
    formData.set("mapProvider", "amap");
    formData.set("mapApiBaseUrl", "broken");
    formData.set("emailEnabled", "on");
    formData.set("emailProvider", "smtp");
    formData.set("emailFromEmail", "not-an-email");

    const result = parseIntegrationSettingsInput(formData, {});

    expect(result.ok).toBe(false);
    expect(result.errors.mapApiBaseUrl).toContain("请输入有效的地图服务 URL");
    expect(result.errors.emailFromEmail).toContain("请输入有效的发件邮箱");
  });

  it("preserves existing secrets when submitted secret fields are blank", () => {
    const existing = encryptIntegrationSecret("existing-key");
    const formData = new FormData();

    formData.set("weatherEnabled", "on");
    formData.set("weatherProvider", "openweather");
    formData.set("weatherApiBaseUrl", "https://api.openweathermap.org");
    formData.set("weatherApiKey", "");

    const result = parseIntegrationSettingsInput(formData, {
      weather: { apiKey: existing }
    });

    expect(result.ok).toBe(true);
    expect(result.records.weather.secrets.apiKey).toBe(existing);
  });

  it("reports object storage as configured only when required environment values exist", () => {
    expect(
      buildStorageHealth({
        endpoint: "https://s3.example.com",
        bucket: "like-zhizhi",
        region: "us-east-1",
        publicBaseUrl: "https://cdn.example.com"
      })
    ).toMatchObject({ configured: true, label: "配置完整" });

    expect(
      buildStorageHealth({
        endpoint: "",
        bucket: "like-zhizhi",
        region: "us-east-1",
        publicBaseUrl: "https://cdn.example.com"
      })
    ).toMatchObject({ configured: false, label: "缺少 S3_ENDPOINT" });
  });
});
