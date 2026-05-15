# Album Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first complete admin workflow for album content: register media by URL, create/edit/delete album entries, and publish them to the existing public album page.

**Architecture:** Use the existing `MediaAsset` and `AlbumItem` Prisma models. Admin actions validate form input, create or update the linked media asset and album item in a transaction, revalidate public/admin routes, and redirect back to the album management list. Binary object-storage upload remains a later enhancement; this phase avoids requiring local Docker or object-storage availability.

**Tech Stack:** Next.js App Router server actions, React server components, Prisma/PostgreSQL, Zod, Vitest, Playwright, Tailwind CSS.

---

### Task 1: Album Validation And Data Foundation

**Files:**
- Create: `src/features/admin/album-data.ts`
- Create: `src/features/admin/album-actions.ts`
- Modify: `tests/unit/admin-notes.test.ts`

- [ ] **Step 1: Write failing unit tests**

Add tests that import `validateAlbumInput` from `src/features/admin/album-actions.ts` and assert that title and media URL are required, media URLs must be valid URLs, and a normal image form passes validation.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: FAIL because `@/features/admin/album-actions` does not exist.

- [ ] **Step 3: Implement minimal validation and data reads**

Create `album-actions.ts` with Zod validation for title, media URL, status, media type, caption, location, author label, date, sort order, filename, content type, size, width, and height. Create `album-data.ts` with `getAdminAlbumItems()` and `getAdminAlbumItem(id)`.

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-album-admin.md src/features/admin/album-data.ts src/features/admin/album-actions.ts tests/unit/admin-notes.test.ts && git commit -m "feat: add admin album data foundation"`

### Task 2: Album Mutations

**Files:**
- Modify: `src/features/admin/album-actions.ts`
- Modify: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing integration tests**

Add Prisma mocks for `mediaAsset.create/update` and `albumItem.create/update/delete`. Test that `createAlbumItem` creates a media asset and a linked album item, and that invalid media URLs do not create records.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: FAIL because mutation functions are missing.

- [ ] **Step 3: Implement mutations**

Add `createAlbumItem`, `updateAlbumItem`, and `deleteAlbumItem`. Use `prisma.$transaction` for create/update, map blank optional fields to `null`, normalize numeric fields, revalidate `/`, `/album`, `/admin`, and `/admin/content/album`, then redirect to `/admin/content/album`.

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/features/admin/album-actions.ts tests/integration/admin-actions.test.ts && git commit -m "feat: add admin album mutations"`

### Task 3: Admin Album UI

**Files:**
- Create: `src/components/admin/album-form.tsx`
- Create: `src/app/admin/content/album/page.tsx`
- Create: `src/app/admin/content/album/new/page.tsx`
- Create: `src/app/admin/content/album/[id]/edit/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing e2e test**

Add a smoke test where the seed owner logs in, opens `/admin/content/album`, creates a draft album item with an image URL, and sees it in the admin list.

- [ ] **Step 2: Run e2e to verify failure**

Run: `pnpm test:e2e -- --grep "album"`

Expected: FAIL because `/admin/content/album` does not exist.

- [ ] **Step 3: Implement UI**

Create the shared form and admin routes. The list shows title, status, media type, location, updated time, preview link for published entries, edit link, and delete button.

- [ ] **Step 4: Run e2e to verify pass**

Run: `pnpm test:e2e -- --grep "album"`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/components/admin/album-form.tsx src/app/admin/content/album tests/e2e/smoke.spec.ts && git commit -m "feat: add admin album management"`

### Task 4: Full Verification

**Files:**
- No planned file changes.

- [ ] **Step 1: Run lint**

Run: `pnpm lint`

Expected: PASS.

- [ ] **Step 2: Run unit/integration tests**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 4: Run e2e tests**

Run: `pnpm test:e2e`

Expected: PASS against the direct PostgreSQL/Redis local environment.

- [ ] **Step 5: Commit or report clean status**

If verification creates no changes, report the passing commands. If fixes are needed, commit them with the narrowest accurate message.

---

## Self-Review

- Spec coverage: covers album management upload-equivalent registration, captions, author, date, location, visibility, and public album publishing. Binary object upload is intentionally deferred because local development must not depend on Docker object storage.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: uses existing `MediaType`, `PublishStatus`, `MediaAsset`, and `AlbumItem` names from Prisma.
