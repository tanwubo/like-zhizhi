import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".worktrees/**",
      "next-env.d.ts",
      "node_modules/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**"
    ]
  }
];

export default eslintConfig;
