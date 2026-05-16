# Like Zhizhi Media Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin media center that can register external media, upload files through the storage adapter, and expose reusable media choices to content forms.

**Architecture:** Keep the existing `MediaAsset` table as the source of truth. Add focused media utilities for storage keys, type detection, image dimensions, and form parsing; add admin actions for external registration and storage uploads; add an `/admin/media` page and a reusable selector component that writes selected public URLs into existing URL fields.

**Tech Stack:** Next.js App Router server actions, Prisma, S3-compatible storage adapter, Vitest, Playwright.

---

### Task 1: Media Utilities And Validation

**Files:**
- Create: `src/features/admin/media-utils.ts`
- Test: `tests/unit/media.test.ts`

- [x] **Step 1: Write failing unit tests**

Cover media type detection, object key generation, external media parsing, and PNG dimensions.

- [x] **Step 2: Run unit tests and verify RED**

Run: `pnpm vitest run tests/unit/media.test.ts`

Expected: fails because `media-utils.ts` does not exist.

- [x] **Step 3: Implement media utility functions**

Implement:
- `detectMediaType(contentType, filename)`
- `buildMediaObjectKey(filename, now)`
- `readImageDimensions(buffer, contentType)`
- `parseExternalMediaInput(formData)`

- [x] **Step 4: Run unit tests and verify GREEN**

Run: `pnpm vitest run tests/unit/media.test.ts`

Expected: pass.

### Task 2: Media Actions And Data

**Files:**
- Create: `src/features/admin/media-actions.ts`
- Create: `src/features/admin/media-data.ts`
- Modify: `tests/integration/admin-actions.test.ts`

- [x] **Step 1: Write failing integration tests**

Cover external media registration, invalid URL rejection, and mocked storage upload.

- [x] **Step 2: Run integration tests and verify RED**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts`

Expected: fails because media actions do not exist.

- [x] **Step 3: Implement media data and actions**

Add `getAdminMediaAssets()`, `validateMediaInput()`, `registerExternalMedia()`, and `uploadMediaAsset(formData, adapter = storage)`.

- [x] **Step 4: Run integration tests and verify GREEN**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts`

Expected: pass.

### Task 3: Admin Media UI And Reusable Selector

**Files:**
- Create: `src/app/admin/media/page.tsx`
- Create: `src/components/admin/media-selector.tsx`
- Modify: `src/components/layout/admin-shell.tsx`
- Modify: `src/components/admin/album-form.tsx`
- Modify: `src/components/admin/checklist-form.tsx`
- Modify: `src/components/admin/footprint-form.tsx`
- Modify: `src/app/admin/settings/theme/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [x] **Step 1: Write failing e2e test**

Cover seed owner opening `/admin/media`, registering an external media URL, and seeing it in the list.

- [x] **Step 2: Run e2e test and verify RED**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts`

Expected: fails because `/admin/media` is missing.

- [x] **Step 3: Implement page and selector**

Add media list, external registration form, upload form, admin navigation, and selector widgets for current URL-driven admin forms.

- [x] **Step 4: Run e2e test and verify GREEN**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts`

Expected: pass.

### Task 4: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-media-center.md`

- [x] **Step 1: Run full verification sequentially**

Run:
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

- [x] **Step 2: Update roadmap**

Mark Batch 6 done, add this plan to source documents, and record verification results.

- [x] **Step 3: Commit and push**

Commit with `feat: add media center` and push `master`.
