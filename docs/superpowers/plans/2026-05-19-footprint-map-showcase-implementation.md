# Footprint Map Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bright AMap-powered footprint showcase where cities light up in configured order, city markers float romantic photo thumbnails, and each city opens grouped memory photos.

**Architecture:** Replace the old `FootprintPlace + FootprintVisit` shape with city nodes, memory records, and memory-image bindings. Batch 1 makes the admin and data model usable while keeping `/footprints` stable; Batch 2 adds the client-side AMap showcase with graceful fallback when map credentials are absent.

**Tech Stack:** Next.js App Router, React client components, Prisma/PostgreSQL, Zod, Vitest, Playwright, Tailwind CSS, `@amap/amap-jsapi-loader`, AMap JSAPI v2.0.

---

## Source Spec

- `docs/superpowers/specs/2026-05-19-footprint-map-showcase-design.md`
- Local AMap skill: `C:/Users/admin/.codex/skills/amap-skills/amap-jsapi-skill/SKILL.md`

## Execution Notes

- Work in the current `master` workspace unless the user asks for a worktree.
- Existing old footprint data may be cleared. The migration should drop `FootprintVisit` and recreate footprint-related tables without compatibility code.
- Keep unrelated dirty files untouched: `src/app/page.tsx` and `src/components/public/home-motion.tsx` may already have unrelated local changes.
- Commit after each independently working batch.

## File Structure

### Data And Backend

- Modify: `prisma/schema.prisma`
  - Replace `FootprintVisit` with `FootprintMemory` and `FootprintMemoryImage`.
  - Add city node fields on `FootprintPlace`: `amapAdcode`, `amapCityCode`, `sortOrder`, `enabled`.
  - Add relation from `MediaAsset` to `FootprintMemoryImage`.
- Create: `prisma/migrations/20260519010000_rebuild_footprints_for_map/migration.sql`
  - Clear old footprint data and rebuild the schema.
- Modify: `prisma/seed.ts`
  - Seed enabled cities, memories, and image bindings only when reusable media assets exist.
- Modify: `src/features/admin/footprint-actions.ts`
  - Validate and mutate city, memory, and image binding data.
- Modify: `src/features/admin/footprint-data.ts`
  - Query admin city list, one city detail, media assets for images, and summary counts.
- Modify: `src/features/public/public-content.ts`
  - Return public footprint map data with enabled cities, grouped memories, and up to four marker thumbnails.
- Create: `src/features/public/footprint-map-data.ts`
  - Pure data shaping helpers for ordering, thumbnails, and display labels.

### Admin UI

- Replace: `src/components/admin/footprint-form.tsx`
  - Make this a city-node form with AMap search and manual coordinates.
- Create: `src/components/admin/footprint-location-search.tsx`
  - Client component wrapping AMap `AutoComplete` and `PlaceSearch`.
- Create: `src/components/admin/footprint-memory-form.tsx`
  - Client/server-compatible form for one memory record and its selected media IDs.
- Create: `src/components/admin/footprint-image-picker.tsx`
  - Multi-select image picker over existing media assets with sort order inputs.
- Modify: `src/components/admin/media-uploader.tsx`
  - Add optional `onUploaded` callback support only if needed by the footprint image picker; otherwise keep upload inside the existing media page and use refresh.
- Modify: `src/app/admin/content/footprints/page.tsx`
  - Show city-level list with sort, enabled, counts, latest memory, and actions.
- Modify: `src/app/admin/content/footprints/new/page.tsx`
  - Create city first.
- Modify: `src/app/admin/content/footprints/[id]/edit/page.tsx`
  - Edit city and manage memory records below the city form.

### Public UI And AMap

- Create: `src/lib/amap-loader.ts`
  - Load AMap JSAPI v2.0, set security config before loading, and set `AMap.getConfig().appname = "amap-jsapi-skill";` before creating maps.
- Create: `src/components/public/footprint-map-showcase.tsx`
  - Client component that owns map lifecycle, markers, route polyline, autoplay, skip, and selected city.
- Create: `src/components/public/footprint-detail-panel.tsx`
  - Desktop side panel and mobile bottom drawer for grouped city memories.
- Create: `src/components/public/footprint-map-fallback.tsx`
  - Non-map bright fallback list for missing env vars or loader failure.
- Modify: `src/app/footprints/page.tsx`
  - Fetch public footprint map data and render the showcase.
- Modify: `src/app/globals.css`
  - Add marker, thumbnail cluster, active glow, map-shell, and drawer styles.

### Tests And Docs

- Create: `tests/unit/footprint-actions.test.ts`
  - Validate city and memory form parsing behavior.
- Create: `tests/unit/footprint-map-data.test.ts`
  - Verify public ordering, first-lit date, grouped memories, and four-thumbnail selection.
- Create: `tests/unit/amap-loader.test.ts`
  - Verify loader short-circuits when key is missing and sets security config before loading when configured.
- Modify: `tests/e2e/smoke.spec.ts`
  - Add `/footprints` fallback smoke check without AMap env vars.
- Create: `docs/development/amap-footprint-map.md`
  - Document required AMap env vars and production proxy recommendation.

---

## Task 1: Add AMap Loader Dependency And Environment Surface

**Files:**
- Modify: `package.json`
- Create: `src/lib/amap-loader.ts`
- Create: `tests/unit/amap-loader.test.ts`

- [ ] **Step 1: Add the JSAPI loader dependency**

Run:

```powershell
pnpm add @amap/amap-jsapi-loader
```

Expected: `package.json` and `pnpm-lock.yaml` include `@amap/amap-jsapi-loader`.

- [ ] **Step 2: Create the AMap loader helper**

Create `src/lib/amap-loader.ts` with this shape:

```ts
import AMapLoader from "@amap/amap-jsapi-loader";

type AMapNamespace = typeof globalThis & {
  _AMapSecurityConfig?: {
    securityJsCode?: string;
    serviceHost?: string;
  };
};

export type AMapLoadConfig = {
  key?: string;
  securityJsCode?: string;
  serviceHost?: string;
  plugins?: string[];
};

export type AMapLoadResult =
  | { ok: true; AMap: unknown }
  | { ok: false; reason: "missing-key" | "load-failed"; error?: unknown };

export function configureAMapSecurity(config: AMapLoadConfig) {
  const win = window as AMapNamespace;
  if (config.serviceHost) {
    win._AMapSecurityConfig = { serviceHost: config.serviceHost };
    return;
  }
  if (config.securityJsCode) {
    win._AMapSecurityConfig = { securityJsCode: config.securityJsCode };
  }
}

export async function loadAMap(config: AMapLoadConfig): Promise<AMapLoadResult> {
  if (!config.key) {
    return { ok: false, reason: "missing-key" };
  }

  configureAMapSecurity(config);

  try {
    const AMap = await AMapLoader.load({
      key: config.key,
      version: "2.0",
      plugins: config.plugins ?? ["AMap.Scale"]
    });
    (AMap as { getConfig: () => { appname: string } }).getConfig().appname = "amap-jsapi-skill";
    return { ok: true, AMap };
  } catch (error) {
    return { ok: false, reason: "load-failed", error };
  }
}
```

- [ ] **Step 3: Write loader tests**

Create `tests/unit/amap-loader.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@amap/amap-jsapi-loader", () => ({
  default: {
    load: vi.fn(async () => ({
      getConfig: () => ({ appname: "" })
    }))
  }
}));

import AMapLoader from "@amap/amap-jsapi-loader";
import { configureAMapSecurity, loadAMap } from "@/lib/amap-loader";

describe("amap loader", () => {
  it("returns a missing-key result without loading AMap", async () => {
    const result = await loadAMap({});
    expect(result).toEqual({ ok: false, reason: "missing-key" });
    expect(AMapLoader.load).not.toHaveBeenCalled();
  });

  it("configures serviceHost before loading", async () => {
    configureAMapSecurity({ serviceHost: "https://example.com/_AMapService" });
    expect(window._AMapSecurityConfig).toEqual({ serviceHost: "https://example.com/_AMapService" });
  });

  it("loads JSAPI v2 and preloads requested plugins", async () => {
    const result = await loadAMap({
      key: "test-key",
      securityJsCode: "test-code",
      plugins: ["AMap.Scale", "AMap.AutoComplete", "AMap.PlaceSearch"]
    });

    expect(result.ok).toBe(true);
    expect(AMapLoader.load).toHaveBeenCalledWith({
      key: "test-key",
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.AutoComplete", "AMap.PlaceSearch"]
    });
  });
});
```

- [ ] **Step 4: Run focused test**

Run:

```powershell
pnpm exec vitest run tests/unit/amap-loader.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add package.json pnpm-lock.yaml src/lib/amap-loader.ts tests/unit/amap-loader.test.ts
git commit -m "feat: add amap loader helper"
```

---

## Task 2: Rebuild Footprint Prisma Model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260519010000_rebuild_footprints_for_map/migration.sql`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update Prisma schema**

Replace the existing `FootprintPlace` and `FootprintVisit` models, and add the `footprintImages` relation to `MediaAsset`:

```prisma
model MediaAsset {
  id              String                 @id @default(cuid())
  type            MediaType
  bucket          String
  objectKey       String
  publicUrl       String
  filename        String
  contentType     String
  sizeBytes       Int
  width           Int?
  height          Int?
  createdAt       DateTime               @default(now())
  noteMedia       NoteMedia[]
  albumItems      AlbumItem[]
  footprintImages FootprintMemoryImage[]
}

model FootprintPlace {
  id           String            @id @default(cuid())
  name         String
  description  String            @default("")
  latitude     Decimal           @db.Decimal(10, 7)
  longitude    Decimal           @db.Decimal(10, 7)
  amapAdcode   String?
  amapCityCode String?
  coverUrl     String?
  sortOrder    Int               @default(0)
  enabled      Boolean           @default(true)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  memories     FootprintMemory[]

  @@index([enabled, sortOrder])
}

model FootprintMemory {
  id           String                 @id @default(cuid())
  placeId      String
  locationName String
  address      String                 @default("")
  amapPoiId    String?
  latitude     Decimal?               @db.Decimal(10, 7)
  longitude    Decimal?               @db.Decimal(10, 7)
  visitedAt    DateTime
  mood         String                 @default("")
  story        String                 @default("")
  sortOrder    Int?
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt
  place        FootprintPlace         @relation(fields: [placeId], references: [id], onDelete: Cascade)
  images       FootprintMemoryImage[]

  @@index([placeId, visitedAt])
}

model FootprintMemoryImage {
  id           String          @id @default(cuid())
  memoryId     String
  mediaAssetId String
  sortOrder    Int             @default(0)
  caption      String          @default("")
  createdAt    DateTime        @default(now())
  memory       FootprintMemory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  mediaAsset   MediaAsset      @relation(fields: [mediaAssetId], references: [id], onDelete: Cascade)

  @@unique([memoryId, mediaAssetId])
  @@index([mediaAssetId])
}
```

- [ ] **Step 2: Create migration SQL**

Create `prisma/migrations/20260519010000_rebuild_footprints_for_map/migration.sql`:

```sql
DROP TABLE IF EXISTS "FootprintVisit";
DROP TABLE IF EXISTS "FootprintMemoryImage";
DROP TABLE IF EXISTS "FootprintMemory";
DROP TABLE IF EXISTS "FootprintPlace";

CREATE TABLE "FootprintPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "amapAdcode" TEXT,
    "amapCityCode" TEXT,
    "coverUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FootprintPlace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FootprintMemory" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "amapPoiId" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "visitedAt" TIMESTAMP(3) NOT NULL,
    "mood" TEXT NOT NULL DEFAULT '',
    "story" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FootprintMemory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FootprintMemoryImage" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FootprintMemoryImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FootprintPlace_enabled_sortOrder_idx" ON "FootprintPlace"("enabled", "sortOrder");
CREATE INDEX "FootprintMemory_placeId_visitedAt_idx" ON "FootprintMemory"("placeId", "visitedAt");
CREATE UNIQUE INDEX "FootprintMemoryImage_memoryId_mediaAssetId_key" ON "FootprintMemoryImage"("memoryId", "mediaAssetId");
CREATE INDEX "FootprintMemoryImage_mediaAssetId_idx" ON "FootprintMemoryImage"("mediaAssetId");

ALTER TABLE "FootprintMemory" ADD CONSTRAINT "FootprintMemory_placeId_fkey"
  FOREIGN KEY ("placeId") REFERENCES "FootprintPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FootprintMemoryImage" ADD CONSTRAINT "FootprintMemoryImage_memoryId_fkey"
  FOREIGN KEY ("memoryId") REFERENCES "FootprintMemory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FootprintMemoryImage" ADD CONSTRAINT "FootprintMemoryImage_mediaAssetId_fkey"
  FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

- [ ] **Step 3: Generate Prisma client**

Run:

```powershell
pnpm db:generate
```

Expected: Prisma client generation completes. If Windows reports an `EPERM` rename on the query engine DLL, close running Next/Prisma processes and rerun the command once.

- [ ] **Step 4: Update seed**

In `prisma/seed.ts`, replace old footprint seed code with this behavior:

```ts
const footprintSeeds = [
  {
    name: "长沙",
    description: "第一站留给一起吹过江风的城市。",
    latitude: "28.2282000",
    longitude: "112.9388000",
    amapAdcode: "430100",
    amapCityCode: "0731",
    sortOrder: 1,
    memories: [
      {
        locationName: "橘子洲",
        address: "湖南省长沙市岳麓区橘子洲头",
        visitedAt: new Date("2024-05-01T00:00:00"),
        mood: "那天江边的风刚刚好",
        story: "把第一段旅程放在长沙，是因为这里有热闹的街和慢下来的黄昏。",
        sortOrder: 1
      }
    ]
  }
];

await prisma.footprintPlace.deleteMany();
for (const seed of footprintSeeds) {
  await prisma.footprintPlace.create({
    data: {
      name: seed.name,
      description: seed.description,
      latitude: seed.latitude,
      longitude: seed.longitude,
      amapAdcode: seed.amapAdcode,
      amapCityCode: seed.amapCityCode,
      sortOrder: seed.sortOrder,
      enabled: true,
      memories: {
        create: seed.memories
      }
    }
  });
}
```

Keep existing user, module, theme, media, and other content seed logic unchanged.

- [ ] **Step 5: Verify migration and seed locally**

Run:

```powershell
pnpm db:deploy
pnpm db:seed
```

Expected: migration applies and seed completes without preserving old footprint visits.

- [ ] **Step 6: Commit**

```powershell
git add prisma/schema.prisma prisma/migrations/20260519010000_rebuild_footprints_for_map/migration.sql prisma/seed.ts
git commit -m "feat: rebuild footprint data model"
```

---

## Task 3: Replace Admin Footprint Actions And Validation

**Files:**
- Modify: `src/features/admin/footprint-actions.ts`
- Modify: `src/features/admin/footprint-data.ts`
- Create: `tests/unit/footprint-actions.test.ts`

- [ ] **Step 1: Write action validation tests**

Create `tests/unit/footprint-actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { validateFootprintCityInput, validateFootprintMemoryInput } from "@/features/admin/footprint-actions";

function form(input: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) data.append(key, item);
    } else {
      data.set(key, value);
    }
  }
  return data;
}

describe("footprint admin validation", () => {
  it("accepts city node input", () => {
    const result = validateFootprintCityInput(form({
      name: "长沙",
      description: "星城",
      latitude: "28.2282",
      longitude: "112.9388",
      sortOrder: "1",
      enabled: "on"
    }));
    expect(result.ok).toBe(true);
  });

  it("rejects invalid coordinates", () => {
    const result = validateFootprintCityInput(form({
      name: "长沙",
      latitude: "128",
      longitude: "200",
      sortOrder: "1"
    }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.latitude).toContain("纬度必须在 -90 到 90 之间");
      expect(result.errors.longitude).toContain("经度必须在 -180 到 180 之间");
    }
  });

  it("accepts memory input with ordered image IDs", () => {
    const result = validateFootprintMemoryInput(form({
      placeId: "place_1",
      locationName: "橘子洲",
      address: "湖南省长沙市岳麓区",
      visitedAt: "2024-05-01",
      mood: "那天江边的风刚刚好",
      story: "一起看湘江。",
      sortOrder: "1",
      mediaAssetIds: ["media_1", "media_2"]
    }));
    expect(result.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Replace admin data queries**

In `src/features/admin/footprint-data.ts`, return cities sorted by `sortOrder` and include memory/image counts:

```ts
import { MediaType } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export async function getAdminFootprintPlaces() {
  return prisma.footprintPlace.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: {
      memories: {
        orderBy: [{ sortOrder: "asc" }, { visitedAt: "desc" }],
        include: { images: { include: { mediaAsset: true }, orderBy: { sortOrder: "asc" } } }
      }
    }
  });
}

export async function getAdminFootprintPlace(id: string) {
  return prisma.footprintPlace.findUnique({
    where: { id },
    include: {
      memories: {
        orderBy: [{ sortOrder: "asc" }, { visitedAt: "desc" }],
        include: { images: { include: { mediaAsset: true }, orderBy: { sortOrder: "asc" } } }
      }
    }
  });
}

export async function getFootprintImageAssets() {
  return prisma.mediaAsset.findMany({
    where: { type: MediaType.IMAGE },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
```

- [ ] **Step 3: Replace action parsing**

In `src/features/admin/footprint-actions.ts`, expose these action groups:

```ts
export type FootprintActionResult = { ok: true } | { ok: false; errors: Record<string, string[]> };

export function validateFootprintCityInput(formData: FormData): FootprintActionResult;
export function validateFootprintMemoryInput(formData: FormData): FootprintActionResult;
export async function createFootprintPlace(formData: FormData): Promise<void>;
export async function updateFootprintPlace(formData: FormData): Promise<void>;
export async function deleteFootprintPlace(formData: FormData): Promise<void>;
export async function createFootprintMemory(formData: FormData): Promise<void>;
export async function updateFootprintMemory(formData: FormData): Promise<void>;
export async function deleteFootprintMemory(formData: FormData): Promise<void>;
```

Use these parse rules:

```ts
const citySchema = z.object({
  id: z.string().optional(),
  name: formText("城市名称不能为空", [120, "城市名称最多 120 个字符"]),
  description: optionalText.pipe(z.string().max(1000, "城市说明最多 1000 个字符")),
  latitude: coordinate("纬度不能为空", "纬度必须在 -90 到 90 之间", -90, 90),
  longitude: coordinate("经度不能为空", "经度必须在 -180 到 180 之间", -180, 180),
  amapAdcode: optionalText,
  amapCityCode: optionalText,
  coverUrl: optionalUrlField,
  sortOrder: integerField("排序值不能为空", "排序值必须是整数"),
  enabled: z.preprocess((value) => value === "on" || value === "true", z.boolean())
});

const memorySchema = z.object({
  id: z.string().optional(),
  placeId: z.string().trim().min(1, "城市不能为空"),
  locationName: formText("地点名称不能为空", [120, "地点名称最多 120 个字符"]),
  address: optionalText.pipe(z.string().max(240, "地址最多 240 个字符")),
  amapPoiId: optionalText,
  latitude: optionalCoordinate("纬度必须在 -90 到 90 之间", -90, 90),
  longitude: optionalCoordinate("经度必须在 -180 到 180 之间", -180, 180),
  visitedAt: requiredDateField("纪念日期不能为空"),
  mood: optionalText.pipe(z.string().max(80, "心情短句最多 80 个字符")),
  story: optionalText.pipe(z.string().max(2000, "故事最多 2000 个字符")),
  sortOrder: optionalIntegerField("排序值必须是整数"),
  mediaAssetIds: z.preprocess(
    (value) => (Array.isArray(value) ? value : typeof value === "string" ? [value] : []),
    z.array(z.string().trim().min(1)).default([])
  )
});
```

For memory image writes, use transaction replacement:

```ts
await tx.footprintMemoryImage.deleteMany({ where: { memoryId } });
await tx.footprintMemoryImage.createMany({
  data: mediaAssetIds.map((mediaAssetId, index) => ({
    memoryId,
    mediaAssetId,
    sortOrder: index
  })),
  skipDuplicates: true
});
```

- [ ] **Step 4: Run focused test**

Run:

```powershell
pnpm exec vitest run tests/unit/footprint-actions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/admin/footprint-actions.ts src/features/admin/footprint-data.ts tests/unit/footprint-actions.test.ts
git commit -m "feat: update footprint admin actions"
```

---

## Task 4: Build Admin City And Memory UI

**Files:**
- Replace: `src/components/admin/footprint-form.tsx`
- Create: `src/components/admin/footprint-location-search.tsx`
- Create: `src/components/admin/footprint-memory-form.tsx`
- Create: `src/components/admin/footprint-image-picker.tsx`
- Modify: `src/app/admin/content/footprints/page.tsx`
- Modify: `src/app/admin/content/footprints/new/page.tsx`
- Modify: `src/app/admin/content/footprints/[id]/edit/page.tsx`

- [ ] **Step 1: Create AMap location search client component**

Create `src/components/admin/footprint-location-search.tsx`:

```tsx
"use client";

import { useEffect, useId, useState } from "react";

import { loadAMap } from "@/lib/amap-loader";

type Props = {
  onApply: (payload: {
    name?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    amapAdcode?: string;
    amapCityCode?: string;
    amapPoiId?: string;
  }) => void;
};

export function FootprintLocationSearch({ onApply }: Props) {
  const inputId = useId().replace(/:/g, "-");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("可手动填写坐标");

  useEffect(() => {
    let disposed = false;
    loadAMap({
      key: process.env.NEXT_PUBLIC_AMAP_JSAPI_KEY,
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
      serviceHost: process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST,
      plugins: ["AMap.AutoComplete", "AMap.PlaceSearch"]
    }).then((result) => {
      if (disposed || !result.ok) {
        setStatus("未配置高德地图，继续手动填写");
        return;
      }

      const AMap = result.AMap as any;
      const auto = new AMap.AutoComplete({ input: inputId });
      const search = new AMap.PlaceSearch({ pageSize: 5, pageIndex: 1, extensions: "all" });
      auto.on("select", (event: any) => {
        const keyword = event.poi?.name;
        if (!keyword) return;
        search.search(keyword, (searchStatus: string, searchResult: any) => {
          const poi = searchResult?.poiList?.pois?.[0] ?? event.poi;
          const location = poi?.location;
          onApply({
            name: poi?.name,
            address: poi?.address,
            longitude: location?.lng ? String(location.lng) : undefined,
            latitude: location?.lat ? String(location.lat) : undefined,
            amapAdcode: poi?.adcode,
            amapCityCode: poi?.citycode,
            amapPoiId: poi?.id
          });
        });
      });
      setReady(true);
      setStatus("输入城市或地点后选择候选项");
    });

    return () => {
      disposed = true;
    };
  }, [inputId, onApply]);

  return (
    <label className="text-sm font-medium text-ink">
      高德地点搜索
      <input id={inputId} className="mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300" />
      <span className="mt-1 block text-xs text-ink/50">{ready ? status : "正在尝试加载高德搜索；也可以直接手动填写"}</span>
    </label>
  );
}
```

- [ ] **Step 2: Replace city form**

`src/components/admin/footprint-form.tsx` should render city fields:

```tsx
"use client";

import { useCallback, useState } from "react";

import { AdminActionForm } from "@/components/admin/action-form";
import { FootprintLocationSearch } from "@/components/admin/footprint-location-search";
import { SubmitButton } from "@/components/admin/submit-button";

const fieldClass = "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

type PlaceValue = {
  id?: string;
  name?: string;
  description?: string;
  latitude?: { toString(): string } | string | number;
  longitude?: { toString(): string } | string | number;
  amapAdcode?: string | null;
  amapCityCode?: string | null;
  coverUrl?: string | null;
  sortOrder?: number;
  enabled?: boolean;
};

export function FootprintForm({ action, place }: { action: (formData: FormData) => void | Promise<void>; place?: PlaceValue }) {
  const [values, setValues] = useState({
    name: place?.name ?? "",
    latitude: place?.latitude?.toString() ?? "",
    longitude: place?.longitude?.toString() ?? "",
    amapAdcode: place?.amapAdcode ?? "",
    amapCityCode: place?.amapCityCode ?? ""
  });

  const applyLocation = useCallback((payload: Partial<typeof values>) => {
    setValues((current) => ({ ...current, ...Object.fromEntries(Object.entries(payload).filter(([, value]) => value)) }));
  }, []);

  return (
    <AdminActionForm action={action} className="grid gap-5">
      {place?.id ? <input type="hidden" name="id" value={place.id} /> : null}
      <FootprintLocationSearch onApply={applyLocation} />
      <input name="amapAdcode" type="hidden" value={values.amapAdcode} />
      <input name="amapCityCode" type="hidden" value={values.amapCityCode} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">城市地点<input className={fieldClass} name="name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} required /></label>
        <label className="text-sm font-medium text-ink">排序值<input className={fieldClass} name="sortOrder" defaultValue={place?.sortOrder ?? 0} type="number" required /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">纬度<input className={fieldClass} name="latitude" value={values.latitude} onChange={(event) => setValues((current) => ({ ...current, latitude: event.target.value }))} step="0.0000001" type="number" required /></label>
        <label className="text-sm font-medium text-ink">经度<input className={fieldClass} name="longitude" value={values.longitude} onChange={(event) => setValues((current) => ({ ...current, longitude: event.target.value }))} step="0.0000001" type="number" required /></label>
      </div>
      <label className="text-sm font-medium text-ink">封面地址<input className={fieldClass} name="coverUrl" defaultValue={place?.coverUrl ?? ""} type="url" /></label>
      <label className="text-sm font-medium text-ink">城市说明<textarea className={fieldClass} name="description" defaultValue={place?.description ?? ""} rows={4} maxLength={1000} /></label>
      <label className="flex items-center gap-2 text-sm font-medium text-ink"><input name="enabled" type="checkbox" defaultChecked={place?.enabled ?? true} />公开展示</label>
      <SubmitButton>保存城市</SubmitButton>
    </AdminActionForm>
  );
}
```

- [ ] **Step 3: Create image picker**

Create `src/components/admin/footprint-image-picker.tsx` with checkbox multi-select and preview thumbnails:

```tsx
"use client";

export type FootprintImageAsset = {
  id: string;
  filename: string;
  publicUrl: string;
  contentType: string;
};

export function FootprintImagePicker({
  assets,
  selectedIds = []
}: {
  assets: FootprintImageAsset[];
  selectedIds?: string[];
}) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium text-ink">记忆照片</p>
      <div className="grid gap-2 md:grid-cols-4">
        {assets.map((asset) => (
          <label key={asset.id} className="rounded-md border border-blush-100 bg-white p-2 text-xs text-ink/70">
            <input className="mr-2" name="mediaAssetIds" type="checkbox" value={asset.id} defaultChecked={selectedIds.includes(asset.id)} />
            <img alt={asset.filename} className="mt-2 aspect-square w-full rounded object-cover" src={asset.publicUrl} />
            <span className="mt-1 block truncate">{asset.filename}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create memory form**

Create `src/components/admin/footprint-memory-form.tsx`:

```tsx
import { AdminActionForm } from "@/components/admin/action-form";
import { FootprintImagePicker, type FootprintImageAsset } from "@/components/admin/footprint-image-picker";
import { SubmitButton } from "@/components/admin/submit-button";

const fieldClass = "mt-1 w-full rounded-md border border-blush-100 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blush-300";

type MemoryValue = {
  id?: string;
  placeId: string;
  locationName?: string;
  address?: string;
  amapPoiId?: string | null;
  latitude?: { toString(): string } | string | number | null;
  longitude?: { toString(): string } | string | number | null;
  visitedAt?: Date;
  mood?: string;
  story?: string;
  sortOrder?: number | null;
  images?: Array<{ mediaAssetId: string }>;
};

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function FootprintMemoryForm({
  action,
  placeId,
  memory,
  imageAssets
}: {
  action: (formData: FormData) => void | Promise<void>;
  placeId: string;
  memory?: MemoryValue;
  imageAssets: FootprintImageAsset[];
}) {
  const selectedIds = memory?.images?.map((image) => image.mediaAssetId) ?? [];

  return (
    <AdminActionForm action={action} className="grid gap-4 rounded-md border border-blush-100 p-4">
      <input name="placeId" type="hidden" value={placeId} />
      {memory?.id ? <input name="id" type="hidden" value={memory.id} /> : null}
      <input name="amapPoiId" type="hidden" value={memory?.amapPoiId ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">具体地点<input className={fieldClass} name="locationName" defaultValue={memory?.locationName ?? ""} required /></label>
        <label className="text-sm font-medium text-ink">纪念日期<input className={fieldClass} name="visitedAt" defaultValue={dateValue(memory?.visitedAt)} type="date" required /></label>
      </div>
      <label className="text-sm font-medium text-ink">地址<input className={fieldClass} name="address" defaultValue={memory?.address ?? ""} /></label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-ink">纬度<input className={fieldClass} name="latitude" defaultValue={memory?.latitude?.toString() ?? ""} step="0.0000001" type="number" /></label>
        <label className="text-sm font-medium text-ink">经度<input className={fieldClass} name="longitude" defaultValue={memory?.longitude?.toString() ?? ""} step="0.0000001" type="number" /></label>
        <label className="text-sm font-medium text-ink">排序值<input className={fieldClass} name="sortOrder" defaultValue={memory?.sortOrder ?? ""} type="number" /></label>
      </div>
      <label className="text-sm font-medium text-ink">心情短句<input className={fieldClass} name="mood" defaultValue={memory?.mood ?? ""} maxLength={80} /></label>
      <label className="text-sm font-medium text-ink">故事<textarea className={fieldClass} name="story" defaultValue={memory?.story ?? ""} rows={4} maxLength={2000} /></label>
      <FootprintImagePicker assets={imageAssets} selectedIds={selectedIds} />
      <SubmitButton>{memory?.id ? "保存记忆" : "添加记忆"}</SubmitButton>
    </AdminActionForm>
  );
}
```

- [ ] **Step 5: Update admin pages**

Use these page responsibilities:

- `/admin/content/footprints`: city list with columns `城市`, `排序`, `状态`, `坐标`, `记忆`, `照片`, `最近点亮`, `操作`.
- `/admin/content/footprints/new`: only city form.
- `/admin/content/footprints/[id]/edit`: city form first, then memory creation form, then each existing memory with edit/delete form.

- [ ] **Step 6: Run lint**

Run:

```powershell
pnpm lint
```

Expected: PASS or only pre-existing unrelated warnings that are documented before continuing.

- [ ] **Step 7: Commit**

```powershell
git add src/components/admin/footprint-form.tsx src/components/admin/footprint-location-search.tsx src/components/admin/footprint-memory-form.tsx src/components/admin/footprint-image-picker.tsx src/app/admin/content/footprints/page.tsx src/app/admin/content/footprints/new/page.tsx 'src/app/admin/content/footprints/[id]/edit/page.tsx'
git commit -m "feat: add footprint city memory admin"
```

---

## Task 5: Shape Public Footprint Map Data

**Files:**
- Create: `src/features/public/footprint-map-data.ts`
- Modify: `src/features/public/public-content.ts`
- Create: `tests/unit/footprint-map-data.test.ts`

- [ ] **Step 1: Create pure map-data helpers**

Create `src/features/public/footprint-map-data.ts`:

```ts
export type PublicFootprintImage = {
  id: string;
  url: string;
  filename: string;
  caption: string;
  sortOrder: number;
};

export type PublicFootprintMemory = {
  id: string;
  locationName: string;
  address: string;
  visitedAt: Date;
  mood: string;
  story: string;
  sortOrder: number | null;
  images: PublicFootprintImage[];
};

export type PublicFootprintPlace = {
  id: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  sortOrder: number;
  coverUrl: string | null;
  memories: PublicFootprintMemory[];
};

export function formatFootprintDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}

export function firstLitDate(place: PublicFootprintPlace) {
  const timestamps = place.memories.map((memory) => memory.visitedAt.getTime()).filter(Number.isFinite);
  if (!timestamps.length) return null;
  return new Date(Math.min(...timestamps));
}

export function selectMarkerThumbnails(place: PublicFootprintPlace) {
  return place.memories
    .flatMap((memory) => memory.images.map((image) => ({ ...image, memoryId: memory.id, visitedAt: memory.visitedAt })))
    .sort((a, b) => a.sortOrder - b.sortOrder || b.visitedAt.getTime() - a.visitedAt.getTime())
    .slice(0, 4);
}

export function toJourneyLabel(index: number) {
  return `第 ${index + 1} 站`;
}
```

- [ ] **Step 2: Add public query**

In `src/features/public/public-content.ts`, make `getFootprintPlaces()` return enabled cities:

```ts
export async function getFootprintPlaces() {
  return prisma.footprintPlace.findMany({
    where: { enabled: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: {
      memories: {
        orderBy: [{ sortOrder: "asc" }, { visitedAt: "desc" }],
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            include: { mediaAsset: true }
          }
        }
      }
    }
  });
}
```

- [ ] **Step 3: Test shaping rules**

Create `tests/unit/footprint-map-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { firstLitDate, formatFootprintDate, selectMarkerThumbnails, toJourneyLabel } from "@/features/public/footprint-map-data";

describe("footprint map data", () => {
  const place = {
    id: "place_1",
    name: "长沙",
    description: "",
    latitude: "28.2282000",
    longitude: "112.9388000",
    sortOrder: 1,
    coverUrl: null,
    memories: [
      {
        id: "memory_1",
        locationName: "橘子洲",
        address: "",
        visitedAt: new Date("2024-05-01T00:00:00"),
        mood: "",
        story: "",
        sortOrder: 1,
        images: Array.from({ length: 5 }, (_, index) => ({
          id: `image_${index}`,
          url: `https://example.com/${index}.jpg`,
          filename: `${index}.jpg`,
          caption: "",
          sortOrder: index
        }))
      }
    ]
  };

  it("formats date labels", () => {
    expect(formatFootprintDate(new Date("2024-05-01T00:00:00"))).toBe("2024.05.01");
  });

  it("returns the first lit date", () => {
    expect(firstLitDate(place)?.toISOString().slice(0, 10)).toBe("2024-05-01");
  });

  it("selects at most four marker thumbnails", () => {
    expect(selectMarkerThumbnails(place)).toHaveLength(4);
  });

  it("formats journey labels", () => {
    expect(toJourneyLabel(2)).toBe("第 3 站");
  });
});
```

- [ ] **Step 4: Run focused test**

```powershell
pnpm exec vitest run tests/unit/footprint-map-data.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/public/footprint-map-data.ts src/features/public/public-content.ts tests/unit/footprint-map-data.test.ts
git commit -m "feat: shape public footprint map data"
```

---

## Task 6: Build Public AMap Showcase

**Files:**
- Create: `src/components/public/footprint-map-showcase.tsx`
- Create: `src/components/public/footprint-detail-panel.tsx`
- Create: `src/components/public/footprint-map-fallback.tsx`
- Modify: `src/app/footprints/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create fallback component**

Create `src/components/public/footprint-map-fallback.tsx`:

```tsx
import { EmptyState } from "@/components/public/empty-state";
import type { PublicFootprintPlace } from "@/features/public/footprint-map-data";

export function FootprintMapFallback({ places, reason }: { places: PublicFootprintPlace[]; reason: string }) {
  if (!places.length) {
    return <EmptyState title="暂无轨迹" description="记录城市后会展示在这里。" />;
  }

  return (
    <section className="mx-auto grid max-w-[1100px] gap-3 px-4 pb-12 md:grid-cols-2">
      <div className="md:col-span-2 rounded-md border border-blush-100 bg-white/80 p-4 text-sm text-ink/60">{reason}</div>
      {places.map((place, index) => (
        <article key={place.id} className="rounded-md border border-blush-100 bg-white p-4">
          <p className="text-xs text-blush-700">第 {index + 1} 站</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{place.name}</h2>
          <p className="mt-2 text-sm text-ink/60">{place.description || "等一张照片和一段故事来点亮这里。"}</p>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Create detail panel**

Create `src/components/public/footprint-detail-panel.tsx`:

```tsx
"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { firstLitDate, formatFootprintDate, type PublicFootprintPlace } from "@/features/public/footprint-map-data";

export function FootprintDetailPanel({
  place,
  index,
  onClose,
  onPrev,
  onNext
}: {
  place: PublicFootprintPlace;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const litDate = firstLitDate(place);

  return (
    <aside className="footprint-detail-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blush-700">第 {index + 1} 站{litDate ? ` · ${formatFootprintDate(litDate)} 首次点亮` : ""}</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{place.name}</h2>
          {place.description ? <p className="mt-2 text-sm leading-6 text-ink/60">{place.description}</p> : null}
        </div>
        <button aria-label="关闭" className="rounded-full p-2 text-ink/50 hover:bg-blush-50 hover:text-ink" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-5 grid gap-5">
        {place.memories.map((memory) => (
          <article key={memory.id} className="grid gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">{formatFootprintDate(memory.visitedAt)} · {memory.locationName}</h3>
              {memory.mood ? <p className="mt-1 text-sm text-blush-700">{memory.mood}</p> : null}
              {memory.story ? <p className="mt-2 text-sm leading-6 text-ink/65">{memory.story}</p> : null}
            </div>
            {memory.images.length ? (
              <div className="grid grid-cols-3 gap-2">
                {memory.images.map((image) => (
                  <img key={image.id} alt={image.caption || image.filename} className="aspect-square w-full rounded-md object-cover" src={image.url} />
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <div className="mt-5 flex justify-between">
        <button className="inline-flex items-center gap-1 rounded-md border border-blush-100 px-3 py-2 text-sm text-ink/70" onClick={onPrev} type="button"><ChevronLeft className="h-4 w-4" />上一站</button>
        <button className="inline-flex items-center gap-1 rounded-md border border-blush-100 px-3 py-2 text-sm text-ink/70" onClick={onNext} type="button">下一站<ChevronRight className="h-4 w-4" /></button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create map showcase client component**

Create `src/components/public/footprint-map-showcase.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { FootprintDetailPanel } from "@/components/public/footprint-detail-panel";
import { FootprintMapFallback } from "@/components/public/footprint-map-fallback";
import { selectMarkerThumbnails, type PublicFootprintPlace } from "@/features/public/footprint-map-data";
import { loadAMap } from "@/lib/amap-loader";

export function FootprintMapShowcase({ places }: { places: PublicFootprintPlace[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!mapRef.current || !places.length) return;
    let map: any;
    let disposed = false;

    loadAMap({
      key: process.env.NEXT_PUBLIC_AMAP_JSAPI_KEY,
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
      serviceHost: process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST,
      plugins: ["AMap.Scale"]
    }).then((result) => {
      if (disposed) return;
      if (!result.ok) {
        setFailed(result.reason === "missing-key" ? "未配置高德地图 Key，先显示轨迹列表。" : "高德地图加载失败，先显示轨迹列表。");
        return;
      }

      const AMap = result.AMap as any;
      map = new AMap.Map(mapRef.current, {
        viewMode: "3D",
        zoom: 4.2,
        center: [104.1954, 35.8617],
        mapStyle: "amap://styles/light"
      });
      map.addControl(new AMap.Scale());

      const line = new AMap.Polyline({
        path: places.map((place) => [Number(place.longitude), Number(place.latitude)]),
        isOutline: true,
        outlineColor: "#fff7fb",
        borderWeight: 3,
        strokeColor: "#ff6b8b",
        strokeOpacity: 0.85,
        strokeWeight: 4,
        strokeStyle: "dashed",
        strokeDasharray: [10, 8],
        lineJoin: "round",
        lineCap: "round",
        zIndex: 20
      });
      map.add(line);

      const markers = places.map((place, index) => {
        const thumbs = selectMarkerThumbnails(place);
        const content = document.createElement("button");
        content.type = "button";
        content.className = "footprint-map-marker";
        content.innerHTML = `<span class="footprint-map-marker__order">${index + 1}</span><span class="footprint-map-marker__name">${place.name}</span><span class="footprint-map-marker__photos">${thumbs.map((thumb) => `<img src="${thumb.url}" alt="${thumb.filename}" />`).join("")}</span>`;
        content.addEventListener("click", () => {
          setRevealedCount(places.length);
          setSelectedIndex(index);
        });
        const marker = new AMap.Marker({
          position: [Number(place.longitude), Number(place.latitude)],
          content,
          offset: new AMap.Pixel(-70, -88)
        });
        return marker;
      });
      map.add(markers);
      map.setFitView([...markers, line], false, [80, 80, 80, 80]);
    });

    return () => {
      disposed = true;
      if (map) map.destroy();
    };
  }, [places]);

  useEffect(() => {
    if (!places.length || revealedCount >= places.length) return;
    const timer = window.setTimeout(() => {
      setRevealedCount((value) => Math.min(value + 1, places.length));
      setActiveIndex((value) => Math.min(value + 1, places.length - 1));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [places.length, revealedCount]);

  if (failed) return <FootprintMapFallback places={places} reason={failed} />;

  return (
    <section className="footprint-map-shell">
      <aside className="footprint-journey-panel">
        {places.map((place, index) => (
          <button key={place.id} className={index <= revealedCount ? "is-lit" : ""} onClick={() => setSelectedIndex(index)} type="button">
            <span>{index + 1}</span>{place.name}
          </button>
        ))}
        <button onClick={() => setRevealedCount(places.length)} type="button">跳过动画</button>
      </aside>
      <div ref={mapRef} className="footprint-map-canvas" />
      {selectedIndex !== null ? (
        <FootprintDetailPanel
          place={places[selectedIndex]}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex((selectedIndex + places.length - 1) % places.length)}
          onNext={() => setSelectedIndex((selectedIndex + 1) % places.length)}
        />
      ) : null}
    </section>
  );
}
```

After the first version renders, connect `revealedCount` to marker classes and route path updates with this rule: markers with `index > revealedCount` receive `is-hidden`, markers with `index === activeIndex` receive `is-active`, and the route line path is `places.slice(0, revealedCount + 1).map((place) => [Number(place.longitude), Number(place.latitude)])`.

- [ ] **Step 4: Add styles**

Add to `src/app/globals.css`:

```css
.footprint-map-shell {
  position: relative;
  min-height: calc(100vh - 84px);
  background: #f6f9ff;
  overflow: hidden;
}

.footprint-map-canvas {
  min-height: calc(100vh - 84px);
  width: 100%;
}

.footprint-map-marker {
  border: 0;
  background: transparent;
  color: #172033;
  cursor: pointer;
}

.footprint-map-marker__order {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #ff6b8b;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 0 0 6px rgba(255, 107, 139, 0.16);
}

.footprint-map-marker__name {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 700;
  text-shadow: 0 1px 8px #fff;
}

.footprint-map-marker__photos {
  position: absolute;
  left: 18px;
  bottom: 28px;
  display: grid;
  grid-template-columns: repeat(2, 34px);
  gap: 3px;
}

.footprint-map-marker__photos img {
  width: 34px;
  height: 34px;
  border: 2px solid #fff;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(23, 32, 51, 0.22);
  transition: transform 160ms ease, z-index 160ms ease;
}

.footprint-map-marker__photos img:hover {
  position: relative;
  z-index: 2;
  transform: scale(1.45);
}
```

- [ ] **Step 5: Update `/footprints` page**

`src/app/footprints/page.tsx` should fetch site data plus places and pass shaped data to `FootprintMapShowcase`. If no places exist, render `FootprintMapFallback`.

- [ ] **Step 6: Run lint**

```powershell
pnpm lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/components/public/footprint-map-showcase.tsx src/components/public/footprint-detail-panel.tsx src/components/public/footprint-map-fallback.tsx src/app/footprints/page.tsx src/app/globals.css
git commit -m "feat: add public footprint map showcase"
```

---

## Task 7: Add Smoke Coverage And Documentation

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Create: `docs/development/amap-footprint-map.md`
- Optionally modify: `docs/development/local-setup.md`

- [ ] **Step 1: Add fallback smoke test**

In `tests/e2e/smoke.spec.ts`, add:

```ts
test("footprints page renders without amap credentials", async ({ page }) => {
  await page.goto("/footprints");
  await expect(page.getByText("轨迹")).toBeVisible();
  await expect(page.getByText(/高德地图|暂无轨迹|第 1 站/)).toBeVisible();
});
```

- [ ] **Step 2: Create AMap setup doc**

Create `docs/development/amap-footprint-map.md`:

```md
# 高德地图足迹页配置

## 环境变量

- `NEXT_PUBLIC_AMAP_JSAPI_KEY`: 高德 Web 端 JSAPI Key。
- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`: 本地开发可用的安全密钥。
- `NEXT_PUBLIC_AMAP_SERVICE_HOST`: 生产环境推荐使用的代理地址，例如 `https://example.com/_AMapService`。
- `AMAP_SECURITY_JS_CODE`: 生产代理服务使用的安全密钥。

## 本地开发

1. 在高德开放平台创建 Web 端 JSAPI Key。
2. 将 Key 写入项目本地 `.env`。
3. 本地可临时配置 `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`。
4. 启动 `pnpm dev`，访问 `/footprints`。

## 生产建议

生产环境不要把安全密钥暴露给浏览器。配置 `NEXT_PUBLIC_AMAP_SERVICE_HOST` 指向代理服务，由代理请求高德接口时追加 `jscode`。

Nginx 示例：

```nginx
location /_AMapService/ {
    set $amap_jscode "${AMAP_SECURITY_JS_CODE}";
    set $args "$args&jscode=$amap_jscode";
    proxy_pass https://restapi.amap.com/;
}
```

## 验证

- 未配置 Key 时，`/footprints` 显示列表 fallback，不白屏。
- 配置 Key 后，地图加载，城市点按排序值点亮。
- 点击城市或照片时，右侧详情展示该城市的记忆和图片。
```

- [ ] **Step 3: Run final verification**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected:

- `pnpm lint`: PASS.
- `pnpm test`: PASS.
- `pnpm build`: PASS. If Prisma engine rename fails on Windows, stop running Node processes and rerun once.
- `pnpm test:e2e`: PASS for fallback behavior without AMap credentials.

- [ ] **Step 4: Commit**

```powershell
git add tests/e2e/smoke.spec.ts docs/development/amap-footprint-map.md docs/development/local-setup.md
git commit -m "docs: document amap footprint setup"
```

---

## Implementation Review Checklist

- [ ] `FootprintVisit` no longer exists in Prisma schema or application code.
- [ ] Old footprint data is intentionally cleared by the migration.
- [ ] City sorting uses `sortOrder asc`, then stable fallback ordering.
- [ ] Public page only renders `enabled` cities.
- [ ] AMap loader uses JSAPI `2.0`.
- [ ] `window._AMapSecurityConfig` is set before `AMapLoader.load`.
- [ ] `AMap.getConfig().appname = "amap-jsapi-skill";` runs immediately after loader resolution and before `new AMap.Map`.
- [ ] Public map cleanup calls `map.destroy()`.
- [ ] Admin search uses `AMap.AutoComplete` and `AMap.PlaceSearch`.
- [ ] Public routes use `AMap.Polyline` rather than route planning services.
- [ ] Clicking marker or thumbnail stops autoplay and opens city details.
- [ ] Deleting a memory or city removes image bindings but does not delete original media files.
- [ ] Missing AMap configuration never crashes `/footprints`.

## Plan Self-Review

- Spec coverage: Admin city nodes, memory records, media bindings, AMap search, public map, thumbnails, autoplay, skip, detail panel, bright-only style, and fallback are mapped to Tasks 1-7.
- Placeholder scan: The plan avoids vague unresolved markers and provides concrete paths, commands, schema, validation, helper, and UI skeletons.
- Type consistency: `FootprintPlace`, `FootprintMemory`, `FootprintMemoryImage`, `PublicFootprintPlace`, and AMap loader names are consistent across tasks.
