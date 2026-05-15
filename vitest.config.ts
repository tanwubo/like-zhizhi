import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest"],
    include: ["tests/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.tsx"],
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      APP_URL: "http://localhost:3000",
      AUTH_SESSION_SECRET: "test-session-secret-with-enough-length",
      S3_ENDPOINT: "http://localhost:9000",
      S3_REGION: "us-east-1",
      S3_BUCKET: "like-zhizhi",
      S3_ACCESS_KEY_ID: "like_zhizhi",
      S3_SECRET_ACCESS_KEY: "like_zhizhi_secret",
      S3_FORCE_PATH_STYLE: "true",
      NEXT_PUBLIC_STORAGE_PUBLIC_URL: "http://localhost:9000/like-zhizhi"
    }
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
