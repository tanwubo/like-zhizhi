# Cloudflare D1 Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy Like Zhizhi on Cloudflare Workers with OpenNext, D1 for application data, and R2 for media storage.

**Architecture:** Keep the existing Next.js App Router and Prisma-based data access, but swap the production platform bindings to Cloudflare-native resources. Use OpenNext/Wrangler for the Worker and static assets, Prisma SQLite/D1 for database access, and a storage factory that chooses R2 when a Worker binding is available and falls back to the existing S3 adapter elsewhere.

**Tech Stack:** Next.js 15, React 19, Prisma 5, Cloudflare Workers, OpenNext Cloudflare adapter, Wrangler, Cloudflare D1, Cloudflare R2, Vitest.

---

## File Structure

- `package.json`: add Cloudflare scripts and dependencies.
- `wrangler.jsonc`: configure Worker entry, assets, compatibility, D1, and R2 bindings.
- `prisma/schema.prisma`: switch datasource to SQLite/D1-compatible schema and remove PostgreSQL native types.
- `prisma/migrations-d1/0001_init.sql`: D1-compatible baseline schema for Cloudflare migrations.
- `src/server/cloudflare/bindings.ts`: central helper for reading OpenNext Cloudflare bindings.
- `src/server/db/prisma.ts`: instantiate Prisma with D1 adapter when `DB` binding exists; keep normal fallback for local Next dev/tests.
- `src/server/storage/types.ts`: shared storage adapter types.
- `src/server/storage/r2-storage.ts`: Cloudflare R2 storage adapter.
- `src/server/storage/s3-storage.ts`: keep S3 adapter focused on S3 client creation.
- `src/server/storage/index.ts`: storage factory choosing R2 or S3.
- `src/features/admin/media-actions.ts`: import shared storage type and default storage from the factory.
- `src/app/api/media/[...key]/route.ts`: remove Node runtime pin and normalize Worker-compatible response bodies.
- `tests/unit/storage.test.ts`: cover storage URL resolution, storage selection, and R2 behavior.
- `tests/unit/media-route.test.ts`: cover media route response body normalization.
- `docs/development/cloudflare-deployment.zh-CN.md`: Cloudflare deployment guide.
- `docs/development/production-deployment.md` and `.zh-CN.md`: link the Cloudflare-specific guide while preserving server deployment docs.

---

### Task 1: Cloudflare Package And Wrangler Configuration

**Files:**
- Modify: `package.json`
- Create: `wrangler.jsonc`

- [ ] **Step 1: Update scripts and dependencies**

Add these package scripts:

```json
{
  "build": "prisma generate && next build",
  "build:cloudflare": "prisma generate && opennextjs-cloudflare build",
  "preview:cloudflare": "pnpm build:cloudflare && wrangler dev",
  "deploy:cloudflare": "pnpm build:cloudflare && wrangler deploy",
  "db:d1:migrate:local": "wrangler d1 migrations apply like-zhizhi --local",
  "db:d1:migrate:remote": "wrangler d1 migrations apply like-zhizhi --remote"
}
```

Add dev dependencies:

```json
{
  "@opennextjs/cloudflare": "latest",
  "wrangler": "latest"
}
```

Add dependency:

```json
{
  "@prisma/adapter-d1": "latest"
}
```

Run:

```powershell
pnpm install
```

Expected: `pnpm-lock.yaml` updates and install exits 0.

- [ ] **Step 2: Add Wrangler config**

Create `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "like-zhizhi",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-05-21",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "like-zhizhi",
      "database_id": "replace-with-cloudflare-d1-database-id",
      "migrations_dir": "prisma/migrations-d1"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "like-zhizhi-media"
    }
  ]
}
```

- [ ] **Step 3: Verify package config**

Run:

```powershell
pnpm lint
```

Expected: lint exits 0. If dependency installation changes lint behavior, fix only directly related config issues.

- [ ] **Step 4: Commit**

```powershell
git add package.json pnpm-lock.yaml wrangler.jsonc
git commit -m "chore: add cloudflare worker configuration"
```

---

### Task 2: D1-Compatible Prisma Schema And Baseline Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations-d1/0001_init.sql`

- [ ] **Step 1: Write failing schema expectation**

Run this command before editing:

```powershell
Select-String -Path prisma\schema.prisma -Pattern 'provider = "sqlite"|@db\.Decimal'
```

Expected before implementation: it finds `@db.Decimal` and does not find `provider = "sqlite"`.

- [ ] **Step 2: Change Prisma datasource**

Edit the datasource:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

- [ ] **Step 3: Remove PostgreSQL native decimal annotations**

Change footprint coordinate fields to SQLite-compatible decimals:

```prisma
model FootprintPlace {
  latitude  Decimal
  longitude Decimal
}

model FootprintMemory {
  latitude  Decimal?
  longitude Decimal?
}
```

Keep the surrounding model fields, indexes, and relations unchanged.

- [ ] **Step 4: Create D1 baseline SQL**

Generate an initial SQL draft:

```powershell
pnpm prisma migrate diff --from-empty --to-schema-datamodel prisma\schema.prisma --script > prisma\migrations-d1\0001_init.sql
```

Expected: the file is created with `CREATE TABLE` statements.

Review the generated SQL and keep relation/index/unique behavior equivalent to the Prisma schema. If generation is blocked by Prisma version behavior, create the D1 SQL manually from the existing PostgreSQL migration with these conversions:

```sql
TEXT primary keys, TEXT enums, DATETIME timestamps, DECIMAL coordinates, INTEGER booleans, explicit indexes, and foreign keys with ON DELETE behavior.
```

- [ ] **Step 5: Verify schema**

Run:

```powershell
pnpm prisma validate
pnpm prisma generate
Select-String -Path prisma\schema.prisma -Pattern '@db\.Decimal'
```

Expected: `validate` and `generate` exit 0; final `Select-String` has no matches.

- [ ] **Step 6: Commit**

```powershell
git add prisma/schema.prisma prisma/migrations-d1/0001_init.sql
git commit -m "feat: add d1 compatible prisma schema"
```

---

### Task 3: Cloudflare Bindings And Prisma D1 Adapter

**Files:**
- Create: `src/server/cloudflare/bindings.ts`
- Modify: `src/server/db/prisma.ts`
- Test: `tests/unit/cloudflare-bindings.test.ts`

- [ ] **Step 1: Write failing binding tests**

Create `tests/unit/cloudflare-bindings.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

describe("Cloudflare bindings", () => {
  it("returns undefined when OpenNext Cloudflare runtime is unavailable", async () => {
    vi.resetModules();
    vi.doMock("@opennextjs/cloudflare", () => {
      throw new Error("module unavailable");
    });

    const { getCloudflareContextSafe } = await import("@/server/cloudflare/bindings");

    await expect(getCloudflareContextSafe()).resolves.toBeUndefined();
  });
});
```

Run:

```powershell
pnpm vitest run tests/unit/cloudflare-bindings.test.ts
```

Expected: FAIL because `@/server/cloudflare/bindings` does not exist.

- [ ] **Step 2: Add safe Cloudflare binding helper**

Create `src/server/cloudflare/bindings.ts`:

```ts
type CloudflareContext = {
  env: {
    DB?: D1Database;
    MEDIA_BUCKET?: R2Bucket;
  };
};

export async function getCloudflareContextSafe(): Promise<CloudflareContext | undefined> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = mod.getCloudflareContext?.();
    return context as CloudflareContext | undefined;
  } catch {
    return undefined;
  }
}
```

- [ ] **Step 3: Update Prisma initialization**

Modify `src/server/db/prisma.ts`:

```ts
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { getCloudflareContextSafe } from "@/server/cloudflare/bindings";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

async function createPrismaClient() {
  const context = await getCloudflareContextSafe();
  if (context?.env.DB) {
    return new PrismaClient({
      adapter: new PrismaD1(context.env.DB),
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });
}

export const prisma = globalForPrisma.prisma ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Verify tests and TypeScript build path**

Run:

```powershell
pnpm vitest run tests/unit/cloudflare-bindings.test.ts
pnpm lint
```

Expected: tests and lint exit 0.

- [ ] **Step 5: Commit**

```powershell
git add src/server/cloudflare/bindings.ts src/server/db/prisma.ts tests/unit/cloudflare-bindings.test.ts
git commit -m "feat: support prisma d1 binding"
```

---

### Task 4: R2 Storage Adapter And Storage Factory

**Files:**
- Create: `src/server/storage/types.ts`
- Create: `src/server/storage/r2-storage.ts`
- Create: `src/server/storage/index.ts`
- Modify: `src/server/storage/s3-storage.ts`
- Modify: `src/features/admin/media-actions.ts`
- Test: `tests/unit/storage.test.ts`

- [ ] **Step 1: Write failing storage tests**

Append to `tests/unit/storage.test.ts`:

```ts
import { createR2StorageAdapter } from "@/server/storage/r2-storage";
import { createStorageFromBindings } from "@/server/storage";

describe("R2 storage adapter", () => {
  it("writes objects through the R2 bucket binding and builds public URLs", async () => {
    const put = vi.fn(async () => undefined);
    const bucket = { put } as unknown as R2Bucket;
    const adapter = createR2StorageAdapter({
      bucket,
      bucketName: "like-zhizhi-media",
      publicBaseUrl: "https://media.example.com"
    });

    const result = await adapter.putObject({
      key: "media/photo.jpg",
      body: new Uint8Array([1, 2, 3]),
      contentType: "image/jpeg"
    });

    expect(put).toHaveBeenCalledWith("media/photo.jpg", new Uint8Array([1, 2, 3]), {
      httpMetadata: { contentType: "image/jpeg" }
    });
    expect(result).toEqual({
      bucket: "like-zhizhi-media",
      key: "media/photo.jpg",
      publicUrl: "https://media.example.com/media/photo.jpg"
    });
  });

  it("selects R2 storage when a media bucket binding exists", () => {
    const storage = createStorageFromBindings({
      mediaBucket: { put: vi.fn(), get: vi.fn() } as unknown as R2Bucket,
      bucketName: "like-zhizhi-media",
      publicBaseUrl: "https://media.example.com"
    });

    expect(storage.kind).toBe("r2");
  });
});
```

Run:

```powershell
pnpm vitest run tests/unit/storage.test.ts
```

Expected: FAIL because R2 storage modules do not exist.

- [ ] **Step 2: Add shared storage type**

Create `src/server/storage/types.ts`:

```ts
export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
};

export type StoredObject = {
  body: unknown;
  contentType?: string;
  contentLength?: number;
};

export type StorageAdapter = {
  kind: "s3" | "r2";
  putObject(input: PutObjectInput): Promise<{
    bucket: string;
    key: string;
    publicUrl: string;
  }>;
  getObject(key: string): Promise<StoredObject>;
};
```

- [ ] **Step 3: Add R2 adapter**

Create `src/server/storage/r2-storage.ts`:

```ts
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
```

- [ ] **Step 4: Update S3 adapter type**

Modify `src/server/storage/s3-storage.ts`:

```ts
import type { PutObjectInput, StorageAdapter } from "@/server/storage/types";
```

Remove its local `PutObjectInput` type and add `kind: "s3"` to the object returned by `createStorageAdapter`.

- [ ] **Step 5: Add storage factory**

Create `src/server/storage/index.ts`:

```ts
import { env } from "@/server/config/env";
import { getCloudflareContextSafe } from "@/server/cloudflare/bindings";
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
```

- [ ] **Step 6: Update media action default storage**

Modify `src/features/admin/media-actions.ts`:

```ts
import { getStorage } from "@/server/storage";
import type { StorageAdapter } from "@/server/storage/types";
```

Change upload signature:

```ts
export async function uploadMediaAsset(formData: FormData, adapter?: StorageAdapter): Promise<UploadResult> {
  "use server";

  await requireAdminCapability("content");
  const resolvedAdapter = adapter ?? (await getStorage());
```

Then call `resolvedAdapter.putObject(...)`.

- [ ] **Step 7: Verify storage tests**

Run:

```powershell
pnpm vitest run tests/unit/storage.test.ts
pnpm vitest run tests/integration/admin-actions.test.ts
```

Expected: both commands exit 0.

- [ ] **Step 8: Commit**

```powershell
git add src/server/storage src/features/admin/media-actions.ts tests/unit/storage.test.ts
git commit -m "feat: add r2 storage adapter"
```

---

### Task 5: Worker-Compatible Media Route

**Files:**
- Modify: `src/app/api/media/[...key]/route.ts`
- Test: `tests/unit/media-route.test.ts`

- [ ] **Step 1: Write failing route body tests**

Create `tests/unit/media-route.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { toResponseBody } from "@/app/api/media/[...key]/route";

describe("media route response body", () => {
  it("accepts a ReadableStream from R2 objects", () => {
    const stream = new ReadableStream();

    expect(toResponseBody(stream)).toBe(stream);
  });

  it("accepts Uint8Array content without relying on Node runtime", () => {
    const body = toResponseBody(new Uint8Array([1, 2, 3]));

    expect(body).toBeInstanceOf(ArrayBuffer);
  });
});
```

Run:

```powershell
pnpm vitest run tests/unit/media-route.test.ts
```

Expected: FAIL because `toResponseBody` is not exported and does not accept plain `ReadableStream`.

- [ ] **Step 2: Update media route**

Modify `src/app/api/media/[...key]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getStorage } from "@/server/storage";

export function toResponseBody(body: unknown): BodyInit | null {
  if (!body) return null;
  if (body instanceof ReadableStream) return body;
  if (body instanceof Uint8Array) {
    return new Uint8Array(body).buffer;
  }
  if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) {
    return body;
  }
  if (typeof body === "object" && "transformToWebStream" in body && typeof body.transformToWebStream === "function") {
    return body.transformToWebStream() as ReadableStream;
  }
  return null;
}
```

Remove:

```ts
export const runtime = "nodejs";
```

Inside `GET`, replace `storage.getObject(key)` with:

```ts
const storage = await getStorage();
const object = await storage.getObject(key);
```

- [ ] **Step 3: Verify media route tests**

Run:

```powershell
pnpm vitest run tests/unit/media-route.test.ts
pnpm vitest run tests/unit/storage.test.ts
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit**

```powershell
git add src/app/api/media/[...key]/route.ts tests/unit/media-route.test.ts
git commit -m "feat: support worker media responses"
```

---

### Task 6: Cloudflare Deployment Documentation

**Files:**
- Create: `docs/development/cloudflare-deployment.zh-CN.md`
- Modify: `docs/development/production-deployment.md`
- Modify: `docs/development/production-deployment.zh-CN.md`

- [ ] **Step 1: Add Cloudflare guide**

Create `docs/development/cloudflare-deployment.zh-CN.md` with sections:

```markdown
# Cloudflare 部署指南

## 目标架构

- Cloudflare Workers 运行 Next.js / API。
- Workers Static Assets 托管构建产物中的静态资源。
- Cloudflare D1 保存业务数据。
- Cloudflare R2 保存媒体文件。

## 1. 安装和登录 Wrangler

pnpm install
pnpm wrangler login

## 2. 创建 D1

pnpm wrangler d1 create like-zhizhi

把返回的 database_id 写入 wrangler.jsonc。

## 3. 创建 R2 Bucket

pnpm wrangler r2 bucket create like-zhizhi-media

## 4. 配置环境变量和 Secret

pnpm wrangler secret put AUTH_SESSION_SECRET
pnpm wrangler secret put SEED_OWNER_PASSWORD

APP_URL、AUTH_COOKIE_NAME、NEXT_PUBLIC_STORAGE_PUBLIC_URL 可以放在 Cloudflare 控制台或 wrangler 环境配置中。

## 5. 执行 D1 迁移

pnpm db:d1:migrate:local
pnpm db:d1:migrate:remote

## 6. 构建和预览

pnpm preview:cloudflare

## 7. 部署

pnpm deploy:cloudflare

## 8. 上线验收

- 打开首页、/login、/sitemap.xml、/robots.txt。
- 登录后台。
- 上传一个媒体文件。
- 确认媒体文件可以通过公开 URL 或 /api/media 打开。
```

Expand each section with the exact commands and warnings from the design doc.

- [ ] **Step 2: Link from existing deployment docs**

Add a Cloudflare note near the top of both existing production deployment docs:

```markdown
For Cloudflare Workers + D1 + R2 deployment, see `docs/development/cloudflare-deployment.zh-CN.md`.
```

Chinese version:

```markdown
如果要部署到 Cloudflare Workers + D1 + R2，请阅读 `docs/development/cloudflare-deployment.zh-CN.md`。
```

- [ ] **Step 3: Verify docs diff**

Run:

```powershell
git diff --check
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```powershell
git add docs/development/cloudflare-deployment.zh-CN.md docs/development/production-deployment.md docs/development/production-deployment.zh-CN.md
git commit -m "docs: add cloudflare deployment guide"
```

---

### Task 7: Full Verification

**Files:**
- All changed files

- [ ] **Step 1: Run targeted tests**

```powershell
pnpm vitest run tests/unit/storage.test.ts tests/unit/media-route.test.ts tests/unit/cloudflare-bindings.test.ts
```

Expected: exit 0.

- [ ] **Step 2: Run standard verification**

```powershell
pnpm lint
pnpm test
pnpm build
```

Expected: each command exits 0.

- [ ] **Step 3: Attempt Cloudflare build**

```powershell
pnpm build:cloudflare
```

Expected: exits 0 and creates `.open-next/worker.js` and `.open-next/assets`.

- [ ] **Step 4: Record any Cloudflare runtime blockers**

If `pnpm build:cloudflare` fails because `wrangler.jsonc` still contains `replace-with-cloudflare-d1-database-id` or because local Cloudflare credentials are not available, record the exact error in the final response and do not claim Cloudflare preview is verified.

- [ ] **Step 5: Final status**

Run:

```powershell
git status --short --branch
git log --oneline -5
```

Expected: branch is `feature/cloudflare-deployment`; working tree is clean except ignored build artifacts.
