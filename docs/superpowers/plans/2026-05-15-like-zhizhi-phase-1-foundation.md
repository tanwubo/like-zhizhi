# Like Zhizhi Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the runnable foundation for the Like Zhizhi full rebuild: Next.js app, PostgreSQL/Prisma data layer, MinIO storage adapter, seed data, admin login, protected admin shell, public home shell, and Docker Compose startup.

**Architecture:** Implement a Next.js App Router monolith with server-side data access isolated in `src/server/*`, product-facing domain helpers in `src/features/*`, and shared UI in `src/components/*`. Phase 1 creates only the foundation and enough seeded content to prove the stack; public product depth and full admin CRUD are separate plans.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, MinIO S3 API, Vitest, Testing Library, Playwright, Docker Compose, pnpm.

---

## Phase Boundary

This plan implements only Phase 1 from `docs/superpowers/specs/2026-05-15-like-zhizhi-full-rebuild-design.md`.

Implemented in this plan:

- Next.js App Router project skeleton.
- Docker Compose services for `web`, `postgres`, and `minio`.
- Prisma schema, initial migration workflow, and seed data.
- Credentials-based admin session flow.
- Role helpers and protected admin layout.
- Public layout, home page shell, and admin dashboard shell backed by seed data.
- MinIO-compatible storage adapter.
- Test and verification setup.

Deferred to later plans:

- Complete public pages for notes, messages, footprints, album, checklist, and about.
- Full admin CRUD.
- Map, weather, email, analytics aggregation, SEO, and production polish.

## File Structure

Create these files:

- `package.json` - scripts and dependencies.
- `pnpm-workspace.yaml` - package manager workspace root.
- `tsconfig.json` - TypeScript configuration.
- `next.config.ts` - Next.js configuration.
- `postcss.config.mjs` - Tailwind PostCSS integration.
- `tailwind.config.ts` - Tailwind theme tokens.
- `eslint.config.mjs` - ESLint configuration.
- `prettier.config.cjs` - formatting rules.
- `vitest.config.ts` - unit and component test configuration.
- `playwright.config.ts` - smoke test configuration.
- `.env.example` - documented local environment values.
- `Dockerfile` - production web image.
- `docker-compose.yml` - local stack.
- `prisma/schema.prisma` - domain schema for Phase 1 and future modules.
- `prisma/seed.ts` - deterministic seed data.
- `src/app/globals.css` - global styles.
- `src/app/layout.tsx` - root HTML shell.
- `src/app/page.tsx` - public home shell.
- `src/app/login/page.tsx` - admin login page.
- `src/app/admin/layout.tsx` - protected admin layout.
- `src/app/admin/page.tsx` - admin dashboard shell.
- `src/app/api/auth/login/route.ts` - login endpoint.
- `src/app/api/auth/logout/route.ts` - logout endpoint.
- `src/components/layout/public-shell.tsx` - public page chrome.
- `src/components/layout/admin-shell.tsx` - admin page chrome.
- `src/components/ui/button.tsx` - reusable button primitive.
- `src/components/ui/card.tsx` - reusable card primitive.
- `src/features/home/home-data.ts` - home query and view model.
- `src/features/admin/dashboard-data.ts` - admin dashboard query and view model.
- `src/server/auth/password.ts` - password hashing and verification.
- `src/server/auth/session.ts` - cookie-backed session creation and lookup.
- `src/server/auth/roles.ts` - role checks.
- `src/server/db/prisma.ts` - Prisma client singleton.
- `src/server/storage/s3-storage.ts` - MinIO/S3 storage adapter.
- `src/server/config/env.ts` - environment parsing.
- `src/lib/cn.ts` - class name helper.
- `src/lib/date.ts` - date utilities.
- `src/lib/public-url.ts` - public URL helper.
- `tests/unit/date.test.ts` - date utility tests.
- `tests/unit/roles.test.ts` - permission helper tests.
- `tests/unit/storage.test.ts` - storage adapter tests with mocked S3 client.
- `tests/integration/auth.test.ts` - login route integration test.
- `tests/e2e/smoke.spec.ts` - public and login smoke tests.

Modify these files:

- `.gitignore` - add Node, Next.js, Prisma, coverage, Playwright, and local env ignores while preserving current IDE/system entries.

## Task 1: Project Tooling And Configuration

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `eslint.config.mjs`
- Create: `prettier.config.cjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create package scripts and dependencies**

Create `package.json`:

```json
{
  "name": "like-zhizhi",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.812.0",
    "@aws-sdk/s3-request-presigner": "^3.812.0",
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.1.1",
    "lucide-react": "^0.511.0",
    "next": "^15.3.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwind-merge": "^3.3.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.15.19",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^4.4.1",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.27.0",
    "eslint-config-next": "^15.3.2",
    "jsdom": "^26.1.0",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.1.3"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Create workspace and compiler configuration**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "."
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/like-zhizhi/**"
      }
    ]
  }
};

export default nextConfig;
```

- [ ] **Step 3: Create styling, linting, and test configuration**

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff6f7",
          100: "#ffe7eb",
          500: "#f45d7a",
          700: "#c73155"
        },
        ink: "#251f24"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(199, 49, 85, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
```

Create `eslint.config.mjs`:

```js
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "test-results/**", "playwright-report/**"]
  }
];
```

Create `prettier.config.cjs`:

```js
module.exports = {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "none"
};
```

Create `vitest.config.ts`:

```ts
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
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000
  }
});
```

- [ ] **Step 4: Create environment example**

Create `.env.example`:

```dotenv
DATABASE_URL="postgresql://like_zhizhi:like_zhizhi@localhost:5432/like_zhizhi?schema=public"
APP_URL="http://localhost:3000"
AUTH_COOKIE_NAME="like_zhizhi_session"
AUTH_SESSION_SECRET="change-this-to-a-long-random-string"
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET="like-zhizhi"
S3_ACCESS_KEY_ID="like_zhizhi"
S3_SECRET_ACCESS_KEY="like_zhizhi_secret"
S3_FORCE_PATH_STYLE="true"
NEXT_PUBLIC_STORAGE_PUBLIC_URL="http://localhost:9000/like-zhizhi"
SEED_OWNER_EMAIL="owner@example.com"
SEED_OWNER_PASSWORD="ChangeMe123!"
```

- [ ] **Step 5: Update ignores**

Append these lines to `.gitignore` if they are absent:

```gitignore

# node
node_modules/
.pnpm-store/

# next
.next/
out/

# env
.env
.env.local
.env.*.local

# prisma
prisma/dev.db

# tests
coverage/
test-results/
playwright-report/

# uploads
uploads/
```

- [ ] **Step 6: Install dependencies**

Run:

```powershell
pnpm install
```

Expected: `node_modules` is created and `pnpm-lock.yaml` is written.

- [ ] **Step 7: Commit tooling**

Run:

```powershell
git add package.json pnpm-workspace.yaml tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts eslint.config.mjs prettier.config.cjs vitest.config.ts playwright.config.ts .env.example .gitignore pnpm-lock.yaml
git commit -m "chore: initialize nextjs toolchain"
```

Expected: commit succeeds with the listed files.

## Task 2: Core Utilities With Unit Tests

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/lib/date.ts`
- Create: `src/lib/public-url.ts`
- Create: `tests/unit/date.test.ts`

- [ ] **Step 1: Write date utility tests**

Create `tests/unit/date.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { daysBetween, formatDateLabel, getTogetherDays } from "@/lib/date";

describe("date utilities", () => {
  it("calculates inclusive together days from a start date", () => {
    expect(getTogetherDays(new Date("2024-05-20T00:00:00+08:00"), new Date("2024-05-20T23:00:00+08:00"))).toBe(1);
    expect(getTogetherDays(new Date("2024-05-20T00:00:00+08:00"), new Date("2024-05-22T08:00:00+08:00"))).toBe(3);
  });

  it("calculates absolute day difference", () => {
    expect(daysBetween(new Date("2024-01-01T00:00:00Z"), new Date("2024-01-04T00:00:00Z"))).toBe(3);
    expect(daysBetween(new Date("2024-01-04T00:00:00Z"), new Date("2024-01-01T00:00:00Z"))).toBe(3);
  });

  it("formats stable Chinese date labels", () => {
    expect(formatDateLabel(new Date("2024-05-20T12:00:00+08:00"))).toBe("2024.05.20");
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
pnpm test tests/unit/date.test.ts
```

Expected: test fails because `@/lib/date` does not exist.

- [ ] **Step 3: Implement class, date, and URL helpers**

Create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `src/lib/date.ts`:

```ts
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(left: Date, right: Date) {
  const diff = startOfLocalDay(right).getTime() - startOfLocalDay(left).getTime();
  return Math.abs(Math.round(diff / DAY_MS));
}

export function getTogetherDays(startDate: Date, now = new Date()) {
  return daysBetween(startDate, now) + 1;
}

export function formatDateLabel(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}
```

Create `src/lib/public-url.ts`:

```ts
export function joinPublicUrl(baseUrl: string, key: string) {
  const base = baseUrl.replace(/\/+$/, "");
  const path = key.replace(/^\/+/, "");
  return `${base}/${path}`;
}
```

- [ ] **Step 4: Run utility tests**

Run:

```powershell
pnpm test tests/unit/date.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit utilities**

Run:

```powershell
git add src/lib tests/unit/date.test.ts
git commit -m "feat: add core frontend utilities"
```

Expected: commit succeeds.

## Task 3: Database Schema, Prisma Client, And Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/server/db/prisma.ts`
- Create: `src/server/config/env.ts`
- Create: `Dockerfile`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create environment parser**

Create `src/server/config/env.ts`:

```ts
import { z } from "zod";

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
  NEXT_PUBLIC_STORAGE_PUBLIC_URL: z.string().url().default("http://localhost:9000/like-zhizhi")
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 2: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  OWNER
  PARTNER
  MODERATOR
}

enum PublishStatus {
  DRAFT
  PUBLISHED
  HIDDEN
}

enum MessageStatus {
  PENDING
  APPROVED
  HIDDEN
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  FILE
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  role         UserRole  @default(PARTNER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
  notes        Note[]
}

model Session {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model PersonProfile {
  id          String   @id @default(cuid())
  slot        Int      @unique
  displayName String
  avatarUrl   String?
  birthday    DateTime?
  location    String?
  bio         String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteSetting {
  id              String   @id @default("site")
  title           String
  slogan          String
  description     String
  togetherDate    DateTime
  footerText      String
  icpText         String?
  policeText      String?
  seoKeywords     String   @default("")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ThemeSetting {
  id                 String   @id @default("theme")
  primaryColor        String   @default("#f45d7a")
  backgroundImageUrl  String?
  backgroundVideoUrl  String?
  enableGlassEffect   Boolean  @default(true)
  enablePageAnimation Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model ModuleSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  label       String
  enabled     Boolean  @default(true)
  sortOrder   Int      @default(0)
  description String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MediaAsset {
  id          String     @id @default(cuid())
  type        MediaType
  bucket      String
  objectKey   String
  publicUrl   String
  filename    String
  contentType String
  sizeBytes   Int
  width       Int?
  height      Int?
  createdAt   DateTime   @default(now())
  noteMedia   NoteMedia[]
  albumItems  AlbumItem[]
}

model Note {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  excerpt     String
  content     String
  status      PublishStatus @default(DRAFT)
  mood        String?
  weather     String?
  location    String?
  authorId    String?
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  author      User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  media       NoteMedia[]
  reactions   NoteReaction[]

  @@index([status, publishedAt])
}

model NoteMedia {
  id        String     @id @default(cuid())
  noteId    String
  mediaId   String
  sortOrder Int        @default(0)
  note      Note       @relation(fields: [noteId], references: [id], onDelete: Cascade)
  media     MediaAsset @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@unique([noteId, mediaId])
}

model NoteReaction {
  id        String   @id @default(cuid())
  noteId    String
  type      String
  visitorId String?
  createdAt DateTime @default(now())
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@index([noteId, type])
}

model Message {
  id          String         @id @default(cuid())
  nickname    String
  content     String
  status      MessageStatus  @default(PENDING)
  ipHash      String?
  userAgent   String?
  location    String?
  deviceLabel String?
  createdAt   DateTime       @default(now())
  replies     MessageReply[]

  @@index([status, createdAt])
}

model MessageReply {
  id        String   @id @default(cuid())
  messageId String
  authorId  String?
  content   String
  createdAt DateTime @default(now())
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
}

model AlbumItem {
  id          String        @id @default(cuid())
  mediaId     String
  title       String
  caption     String
  status      PublishStatus @default(PUBLISHED)
  takenAt     DateTime?
  location    String?
  authorLabel String?
  sortOrder   Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  media       MediaAsset    @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@index([status, sortOrder])
}

model ChecklistItem {
  id          String        @id @default(cuid())
  title       String
  description String
  status      PublishStatus @default(PUBLISHED)
  completed   Boolean       @default(false)
  completedAt DateTime?
  targetDate  DateTime?
  location    String?
  imageUrl    String?
  sortOrder   Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model FootprintPlace {
  id          String           @id @default(cuid())
  name        String
  description String
  latitude    Decimal          @db.Decimal(10, 7)
  longitude   Decimal          @db.Decimal(10, 7)
  coverUrl    String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  visits      FootprintVisit[]
}

model FootprintVisit {
  id          String         @id @default(cuid())
  placeId     String
  visitedAt   DateTime
  title       String
  description String
  place       FootprintPlace @relation(fields: [placeId], references: [id], onDelete: Cascade)
}

model LoveDayEvent {
  id          String   @id @default(cuid())
  title       String
  description String
  date        DateTime
  yearly      Boolean  @default(false)
  lunar       Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MusicTrack {
  id          String   @id @default(cuid())
  title       String
  artist      String
  coverUrl    String?
  sourceUrl   String
  sourceType  String   @default("url")
  enabled     Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model VisitEvent {
  id        String   @id @default(cuid())
  path      String
  ipHash    String?
  userAgent String?
  referrer  String?
  createdAt DateTime @default(now())

  @@index([path, createdAt])
}

model DailyStat {
  id             String   @id @default(cuid())
  date           DateTime @unique
  visits         Int      @default(0)
  uniqueVisitors Int      @default(0)
  messages       Int      @default(0)
  notes          Int      @default(0)
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/server/db/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Create seed data**

Create `prisma/seed.ts`:

```ts
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@example.com";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { name: "站点主人", role: UserRole.OWNER, passwordHash },
    create: { email: ownerEmail, name: "站点主人", role: UserRole.OWNER, passwordHash }
  });

  await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: {},
    create: {
      title: "Like Zhizhi",
      slogan: "每一个日子都普通，除了遇见你的那一天。",
      description: "一个从零重建的情侣纪念站。",
      togetherDate: new Date("2024-05-20T00:00:00+08:00"),
      footerText: "Like Zhizhi"
    }
  });

  await prisma.themeSetting.upsert({
    where: { id: "theme" },
    update: {},
    create: { id: "theme" }
  });

  await prisma.personProfile.upsert({
    where: { slot: 1 },
    update: {},
    create: {
      slot: 1,
      displayName: "知知",
      location: "Shanghai",
      bio: "喜欢记录生活里的小事。"
    }
  });

  await prisma.personProfile.upsert({
    where: { slot: 2 },
    update: {},
    create: {
      slot: 2,
      displayName: "只只",
      location: "Hangzhou",
      bio: "负责把愿望一点点实现。"
    }
  });

  const modules = [
    ["home", "首页", 0],
    ["notes", "点滴", 10],
    ["messages", "留言", 20],
    ["footprints", "轨迹", 30],
    ["album", "相册", 40],
    ["checklist", "清单", 50],
    ["about", "关于", 60]
  ] as const;

  for (const [key, label, sortOrder] of modules) {
    await prisma.moduleSetting.upsert({
      where: { key },
      update: { label, sortOrder, enabled: true },
      create: { key, label, sortOrder, enabled: true }
    });
  }

  await prisma.note.upsert({
    where: { slug: "first-memory" },
    update: {},
    create: {
      slug: "first-memory",
      title: "第一条点滴",
      excerpt: "这是 Phase 1 的种子内容，用来证明首页和后台可以读取数据库。",
      content: "等公共站阶段开始，这里会变成完整的图文时间线。",
      status: "PUBLISHED",
      mood: "开心",
      weather: "晴",
      location: "家",
      authorId: owner.id,
      publishedAt: new Date("2024-05-20T20:00:00+08:00")
    }
  });

  await prisma.message.upsert({
    where: { id: "seed-message" },
    update: {},
    create: {
      id: "seed-message",
      nickname: "访客",
      content: "祝你们一直热爱生活。",
      status: "APPROVED",
      location: "Local"
    }
  });

  await prisma.checklistItem.upsert({
    where: { id: "seed-checklist" },
    update: {},
    create: {
      id: "seed-checklist",
      title: "一起看一次海",
      description: "Phase 1 的愿望清单种子数据。",
      completed: false,
      sortOrder: 1
    }
  });

  await prisma.loveDayEvent.upsert({
    where: { id: "seed-love-day" },
    update: {},
    create: {
      id: "seed-love-day",
      title: "在一起",
      description: "纪念我们开始认真记录彼此的日子。",
      date: new Date("2024-05-20T00:00:00+08:00"),
      yearly: true,
      sortOrder: 1
    }
  });

  await prisma.dailyStat.upsert({
    where: { date: new Date("2026-05-15T00:00:00+08:00") },
    update: {},
    create: {
      date: new Date("2026-05-15T00:00:00+08:00"),
      visits: 128,
      uniqueVisitors: 42,
      messages: 1,
      notes: 1
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 5: Create Docker files**

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["pnpm", "start"]
```

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: like_zhizhi
      POSTGRES_PASSWORD: like_zhizhi
      POSTGRES_DB: like_zhizhi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U like_zhizhi -d like_zhizhi"]
      interval: 5s
      timeout: 3s
      retries: 20

  minio:
    image: minio/minio:RELEASE.2025-04-22T22-12-26Z
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: like_zhizhi
      MINIO_ROOT_PASSWORD: like_zhizhi_secret
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  web:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_started
    environment:
      DATABASE_URL: postgresql://like_zhizhi:like_zhizhi@postgres:5432/like_zhizhi?schema=public
      APP_URL: http://localhost:3000
      AUTH_COOKIE_NAME: like_zhizhi_session
      AUTH_SESSION_SECRET: docker-local-session-secret
      S3_ENDPOINT: http://minio:9000
      S3_REGION: us-east-1
      S3_BUCKET: like-zhizhi
      S3_ACCESS_KEY_ID: like_zhizhi
      S3_SECRET_ACCESS_KEY: like_zhizhi_secret
      S3_FORCE_PATH_STYLE: "true"
      NEXT_PUBLIC_STORAGE_PUBLIC_URL: http://localhost:9000/like-zhizhi
      SEED_OWNER_EMAIL: owner@example.com
      SEED_OWNER_PASSWORD: ChangeMe123!
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  minio_data:
```

- [ ] **Step 6: Generate Prisma client and migration**

Run:

```powershell
Copy-Item .env.example .env -Force
pnpm db:generate
docker compose up -d postgres
pnpm db:migrate -- --name init
pnpm db:seed
```

Expected:

- `prisma/migrations/*_init/migration.sql` is created.
- Prisma client generation succeeds.
- Seed logs complete without errors.

- [ ] **Step 7: Commit database foundation**

Run:

```powershell
git add prisma src/server/db src/server/config Dockerfile docker-compose.yml
git commit -m "feat: add database foundation"
```

Expected: commit succeeds with schema, migration, seed, and Docker files.

## Task 4: Authentication And Authorization

**Files:**
- Create: `src/server/auth/password.ts`
- Create: `src/server/auth/session.ts`
- Create: `src/server/auth/roles.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `tests/unit/roles.test.ts`
- Create: `tests/integration/auth.test.ts`

- [ ] **Step 1: Write role tests**

Create `tests/unit/roles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAccessAdmin, canManageUsers, canModerateMessages } from "@/server/auth/roles";

describe("role permissions", () => {
  it("allows all authenticated roles into admin", () => {
    expect(canAccessAdmin("OWNER")).toBe(true);
    expect(canAccessAdmin("PARTNER")).toBe(true);
    expect(canAccessAdmin("MODERATOR")).toBe(true);
  });

  it("limits user management to owner", () => {
    expect(canManageUsers("OWNER")).toBe(true);
    expect(canManageUsers("PARTNER")).toBe(false);
    expect(canManageUsers("MODERATOR")).toBe(false);
  });

  it("allows owner, partner, and moderator to moderate messages", () => {
    expect(canModerateMessages("OWNER")).toBe(true);
    expect(canModerateMessages("PARTNER")).toBe(true);
    expect(canModerateMessages("MODERATOR")).toBe(true);
  });
});
```

- [ ] **Step 2: Run failing role tests**

Run:

```powershell
pnpm test tests/unit/roles.test.ts
```

Expected: test fails because `@/server/auth/roles` does not exist.

- [ ] **Step 3: Implement password and role helpers**

Create `src/server/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
```

Create `src/server/auth/roles.ts`:

```ts
import type { UserRole } from "@prisma/client";

export function canAccessAdmin(role: UserRole) {
  return role === "OWNER" || role === "PARTNER" || role === "MODERATOR";
}

export function canManageUsers(role: UserRole) {
  return role === "OWNER";
}

export function canManageSettings(role: UserRole) {
  return role === "OWNER" || role === "PARTNER";
}

export function canModerateMessages(role: UserRole) {
  return role === "OWNER" || role === "PARTNER" || role === "MODERATOR";
}
```

- [ ] **Step 4: Implement session helpers**

Create `src/server/auth/session.ts`:

```ts
import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { env } from "@/server/config/env";
import { prisma } from "@/server/db/prisma";

const SESSION_DAYS = 14;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(`${token}:${env.AUTH_SESSION_SECRET}`).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { tokenHash, userId, expiresAt }
  });

  const cookieStore = await cookies();
  cookieStore.set(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.AUTH_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(env.AUTH_COOKIE_NAME);
}

export type CurrentUser = Pick<User, "id" | "email" | "name" | "role">;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true }
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role
  };
}
```

- [ ] **Step 5: Implement auth API routes**

Create `src/app/api/auth/login/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "邮箱或密码格式不正确" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { destroySession } from "@/server/auth/session";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Add focused auth integration test**

Create `tests/integration/auth.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/server/auth/password";

vi.mock("@/server/db/prisma", async () => {
  const passwordHash = await hashPassword("Secret123!");
  return {
    prisma: {
      user: {
        findUnique: vi.fn(async () => ({
          id: "user_1",
          email: "owner@example.com",
          name: "Owner",
          role: "OWNER",
          passwordHash
        }))
      },
      session: {
        create: vi.fn(async () => ({ id: "session_1" }))
      }
    }
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn()
  }))
}));

describe("login route", () => {
  it("accepts valid credentials", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "owner@example.com", password: "Secret123!" })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
```

- [ ] **Step 7: Run auth tests**

Run:

```powershell
pnpm test tests/unit/roles.test.ts tests/integration/auth.test.ts
```

Expected: all tests pass.

- [ ] **Step 8: Commit auth**

Run:

```powershell
git add src/server/auth src/app/api/auth tests/unit/roles.test.ts tests/integration/auth.test.ts
git commit -m "feat: add credentials auth foundation"
```

Expected: commit succeeds.

## Task 5: Public And Admin Shells

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/layout/public-shell.tsx`
- Create: `src/components/layout/admin-shell.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/features/home/home-data.ts`
- Create: `src/features/admin/dashboard-data.ts`

- [ ] **Step 1: Create UI primitives**

Create `src/components/ui/button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-blush-500 text-white shadow-soft hover:bg-blush-700",
        variant === "secondary" && "border border-blush-100 bg-white text-ink hover:bg-blush-50",
        variant === "ghost" && "text-ink hover:bg-blush-50",
        className
      )}
      {...props}
    />
  );
}
```

Create `src/components/ui/card.tsx`:

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-blush-100 bg-white p-5 shadow-soft", className)} {...props} />;
}
```

- [ ] **Step 2: Create data query modules**

Create `src/features/home/home-data.ts`:

```ts
import { getTogetherDays } from "@/lib/date";
import { prisma } from "@/server/db/prisma";

export async function getHomeData() {
  const [site, people, modules, latestNote, messageCount, checklistCount, stats] = await Promise.all([
    prisma.siteSetting.findUniqueOrThrow({ where: { id: "site" } }),
    prisma.personProfile.findMany({ orderBy: { slot: "asc" } }),
    prisma.moduleSetting.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    prisma.note.findFirst({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
    prisma.message.count({ where: { status: "APPROVED" } }),
    prisma.checklistItem.count({ where: { status: "PUBLISHED" } }),
    prisma.dailyStat.findFirst({ orderBy: { date: "desc" } })
  ]);

  return {
    site,
    people,
    modules,
    latestNote,
    messageCount,
    checklistCount,
    visits: stats?.visits ?? 0,
    togetherDays: getTogetherDays(site.togetherDate)
  };
}
```

Create `src/features/admin/dashboard-data.ts`:

```ts
import { prisma } from "@/server/db/prisma";

export async function getDashboardData() {
  const [notes, messages, checklist, album, modules, latestMessages] = await Promise.all([
    prisma.note.count(),
    prisma.message.count(),
    prisma.checklistItem.count(),
    prisma.albumItem.count(),
    prisma.moduleSetting.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return {
    totals: { notes, messages, checklist, album },
    modules,
    latestMessages
  };
}
```

- [ ] **Step 3: Create global styles and root layout**

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #251f24;
  background: #fff6f7;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(244, 93, 122, 0.16), transparent 34rem),
    linear-gradient(180deg, #fff6f7 0%, #ffffff 52%, #fff6f7 100%);
}

a {
  color: inherit;
  text-decoration: none;
}
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Like Zhizhi",
  description: "情侣纪念站"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Create public shell and home page**

Create `src/components/layout/public-shell.tsx`:

```tsx
import Link from "next/link";

type ModuleLink = {
  key: string;
  label: string;
};

const hrefByKey: Record<string, string> = {
  home: "/",
  notes: "/notes",
  messages: "/messages",
  footprints: "/footprints",
  album: "/album",
  checklist: "/checklist",
  about: "/about"
};

export function PublicShell({
  title,
  modules,
  children
}: {
  title: string;
  modules: ModuleLink[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-semibold text-ink">
          {title}
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-ink/70 md:flex">
          {modules.map((module) => (
            <Link key={module.key} href={hrefByKey[module.key] ?? "/"}>
              {module.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-ink/50">{title}</footer>
    </div>
  );
}
```

Create `src/app/page.tsx`:

```tsx
import { Card } from "@/components/ui/card";
import { PublicShell } from "@/components/layout/public-shell";
import { getHomeData } from "@/features/home/home-data";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <PublicShell title={data.site.title} modules={data.modules}>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:py-20">
        <div>
          <p className="mb-3 text-sm font-medium text-blush-700">{data.site.slogan}</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
            {data.site.description}
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-ink/55">相伴天数</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{data.togetherDays}</p>
            </Card>
            <Card>
              <p className="text-sm text-ink/55">留言祝福</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{data.messageCount}</p>
            </Card>
            <Card>
              <p className="text-sm text-ink/55">访问次数</p>
              <p className="mt-2 text-3xl font-semibold text-blush-700">{data.visits}</p>
            </Card>
          </div>
        </div>
        <Card className="self-start">
          <p className="text-sm text-ink/55">最新点滴</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">{data.latestNote?.title ?? "暂无点滴"}</h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">{data.latestNote?.excerpt ?? "后台发布后会显示在这里。"}</p>
          <div className="mt-6 grid gap-3">
            {data.people.map((person) => (
              <div key={person.id} className="rounded-md bg-blush-50 p-4">
                <p className="font-medium text-ink">{person.displayName}</p>
                <p className="mt-1 text-sm text-ink/60">{person.bio}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PublicShell>
  );
}
```

- [ ] **Step 5: Create login page**

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    if (response.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(payload?.message ?? "登录失败");
    setSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">后台登录</h1>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-ink/70">
            邮箱
            <input className="rounded-md border border-blush-100 px-3 py-2" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-sm text-ink/70">
            密码
            <input className="rounded-md border border-blush-100 px-3 py-2" name="password" type="password" required />
          </label>
          {message ? <p className="text-sm text-blush-700">{message}</p> : null}
          <button className="rounded-md bg-blush-500 px-4 py-2 font-medium text-white disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? "登录中" : "登录"}
          </button>
        </form>
        <p className="mt-4 text-xs text-ink/50">种子账号：owner@example.com / ChangeMe123!</p>
      </Card>
    </main>
  );
}
```

- [ ] **Step 6: Create protected admin shell**

Create `src/components/layout/admin-shell.tsx`:

```tsx
import Link from "next/link";
import type { CurrentUser } from "@/server/auth/session";

const navItems = [
  ["概览", "/admin"],
  ["点滴", "/admin/content/notes"],
  ["留言", "/admin/content/messages"],
  ["相册", "/admin/content/album"],
  ["清单", "/admin/content/checklist"],
  ["设置", "/admin/settings/site"]
] as const;

export function AdminShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-blush-100 bg-blush-50/70 p-5 md:block">
        <Link href="/admin" className="text-lg font-semibold text-ink">
          Like Zhizhi
        </Link>
        <nav className="mt-8 grid gap-2 text-sm text-ink/70">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 hover:bg-white">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="md:pl-56">
        <header className="flex items-center justify-between border-b border-blush-100 px-5 py-4">
          <p className="text-sm text-ink/60">当前用户：{user.name}</p>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-blush-700" type="submit">
              退出
            </button>
          </form>
        </header>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
```

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { canAccessAdmin } from "@/server/auth/roles";
import { getCurrentUser } from "@/server/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !canAccessAdmin(user.role)) {
    redirect("/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
```

Create `src/app/admin/page.tsx`:

```tsx
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/features/admin/dashboard-data";

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">管理概览</h1>
        <p className="mt-2 text-sm text-ink/60">Phase 1 展示基础数据，完整 CRUD 在 Phase 3 实现。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(data.totals).map(([key, value]) => (
          <Card key={key}>
            <p className="text-sm text-ink/55">{key}</p>
            <p className="mt-2 text-3xl font-semibold text-blush-700">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-ink">已启用模块</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.modules.map((module) => (
            <span key={module.id} className="rounded-full bg-blush-50 px-3 py-1 text-sm text-ink/70">
              {module.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Run lint and build**

Run:

```powershell
pnpm lint
pnpm build
```

Expected: both commands pass.

- [ ] **Step 8: Commit shells**

Run:

```powershell
git add src/app src/components src/features
git commit -m "feat: add public and admin shells"
```

Expected: commit succeeds.

## Task 6: MinIO Storage Adapter

**Files:**
- Create: `src/server/storage/s3-storage.ts`
- Create: `tests/unit/storage.test.ts`

- [ ] **Step 1: Write storage adapter tests**

Create `tests/unit/storage.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createStorageAdapter } from "@/server/storage/s3-storage";

describe("S3 storage adapter", () => {
  it("builds a public URL after upload", async () => {
    const send = vi.fn(async () => ({}));
    const adapter = createStorageAdapter({
      client: { send },
      bucket: "like-zhizhi",
      publicBaseUrl: "http://localhost:9000/like-zhizhi"
    });

    const result = await adapter.putObject({
      key: "photos/one.jpg",
      body: Buffer.from("image"),
      contentType: "image/jpeg"
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(result.publicUrl).toBe("http://localhost:9000/like-zhizhi/photos/one.jpg");
  });
});
```

- [ ] **Step 2: Run failing storage test**

Run:

```powershell
pnpm test tests/unit/storage.test.ts
```

Expected: test fails because `@/server/storage/s3-storage` does not exist.

- [ ] **Step 3: Implement storage adapter**

Create `src/server/storage/s3-storage.ts`:

```ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/server/config/env";
import { joinPublicUrl } from "@/lib/public-url";

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
```

- [ ] **Step 4: Run storage tests**

Run:

```powershell
pnpm test tests/unit/storage.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit storage**

Run:

```powershell
git add src/server/storage tests/unit/storage.test.ts
git commit -m "feat: add minio storage adapter"
```

Expected: commit succeeds.

## Task 7: End-To-End Smoke Tests And Docker Verification

**Files:**
- Create: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Create smoke tests**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("public home renders seeded site", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Like Zhizhi" })).toBeVisible();
  await expect(page.getByText("每一个日子都普通，除了遇见你的那一天。")).toBeVisible();
  await expect(page.getByText("最新点滴")).toBeVisible();
});

test("login page renders seed account hint", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "后台登录" })).toBeVisible();
  await expect(page.getByText("owner@example.com / ChangeMe123!")).toBeVisible();
});

test("seed owner can login to admin dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "管理概览" })).toBeVisible();
});
```

- [ ] **Step 2: Run full unit and integration tests**

Run:

```powershell
pnpm test
```

Expected: all Vitest tests pass.

- [ ] **Step 3: Run Playwright smoke tests**

Run:

```powershell
pnpm test:e2e
```

Expected: both smoke tests pass in Chromium.

- [ ] **Step 4: Verify Docker Compose startup**

Run:

```powershell
docker compose down --remove-orphans
docker compose up -d --build postgres minio
pnpm db:deploy
pnpm db:seed
docker compose up -d --build web
docker compose ps
```

Expected:

- `postgres`, `minio`, and `web` are running.
- `http://localhost:3000` serves the seeded home page.
- `http://localhost:3000/login` serves the login page.

- [ ] **Step 5: Commit verification assets**

Run:

```powershell
git add tests/e2e/smoke.spec.ts
git commit -m "test: add phase one smoke coverage"
```

Expected: commit succeeds.

## Task 8: Phase 1 Documentation And Final Checks

**Files:**
- Create: `README.md`
- Create: `docs/development/local-setup.md`

- [ ] **Step 1: Create README**

Create `README.md`:

```md
# Like Zhizhi

Like Zhizhi is a from-scratch Next.js rebuild of a Pro-like couple website product.

## Local Development

1. Install dependencies:

   ```powershell
   pnpm install
   ```

2. Copy environment variables:

   ```powershell
   Copy-Item .env.example .env -Force
   ```

3. Start PostgreSQL and MinIO:

   ```powershell
   docker compose up -d postgres minio
   ```

4. Apply database migrations and seed data:

   ```powershell
   pnpm db:migrate
   pnpm db:seed
   ```

5. Start the app:

   ```powershell
   pnpm dev
   ```

The public site runs at `http://localhost:3000`.

Seed admin account:

- Email: `owner@example.com`
- Password: `ChangeMe123!`
```

Create `docs/development/local-setup.md`:

```md
# Local Setup

## Services

The local stack uses:

- `postgres` on port `5432`
- `minio` on ports `9000` and `9001`
- `web` on port `3000`

## Commands

```powershell
pnpm install
Copy-Item .env.example .env -Force
docker compose up -d postgres minio
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Verification

```powershell
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Docker Compose

```powershell
docker compose down --remove-orphans
docker compose up -d --build
```

After startup, open:

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:9001`
```

- [ ] **Step 2: Run final quality gate**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
```

Expected: all commands pass.

- [ ] **Step 3: Inspect git state**

Run:

```powershell
git status --short
```

Expected: only intentional documentation files are uncommitted before the final documentation commit.

- [ ] **Step 4: Commit docs**

Run:

```powershell
git add README.md docs/development/local-setup.md
git commit -m "docs: document phase one setup"
```

Expected: commit succeeds.

## Phase 1 Acceptance Checklist

- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm test:e2e` passes.
- [ ] `docker compose up -d --build` starts `web`, `postgres`, and `minio`.
- [ ] Prisma migrations apply successfully.
- [ ] Seed data renders on `/`.
- [ ] `/admin` redirects to `/login` when unauthenticated.
- [ ] Seed admin login creates a session and reaches `/admin`.
- [ ] MinIO storage adapter has unit coverage.

## Self-Review

Spec coverage:

- Phase 1 project scaffold is covered by Task 1.
- Docker Compose for `web`, `postgres`, and `minio` is covered by Task 3 and Task 7.
- Prisma schema, migrations, and seed data are covered by Task 3.
- Auth, roles, protected admin layout, and public layout are covered by Task 4 and Task 5.
- Base component system is covered by Task 5.
- MinIO storage adapter is covered by Task 6.
- Dev/build/lint/test/migration/seed scripts are covered by Task 1.
- Phase 1 exit criteria are covered by Task 7 and Task 8.

Placeholder scan:

- The plan uses concrete file paths, commands, and expected outcomes.
- No intentionally unspecified implementation step remains in the Phase 1 scope.

Type consistency:

- Role names match the Prisma `UserRole` enum.
- Status names match the Prisma enums.
- Data query modules reference models defined in `prisma/schema.prisma`.
- Public and admin pages call the view-model functions defined earlier in the plan.
