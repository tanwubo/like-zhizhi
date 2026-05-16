# Like Zhizhi Music Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make music tracks manageable from the admin console and expose enabled tracks as public player data.

**Architecture:** Reuse the existing Phase 3 admin CRUD pattern: focused admin data loader, server actions with Zod validation, shared form component, list/new/edit routes, and public read model helper. Keep playback UI minimal; this batch only guarantees enabled track data is available to the public layer.

**Tech Stack:** Next.js App Router, React Server Components, Prisma `MusicTrack`, Zod, Vitest, Playwright.

---

## File Structure

- Modify: `tests/integration/admin-actions.test.ts` for music create/update/delete action tests.
- Modify: `tests/unit/public-content.test.ts` for enabled public music read model tests.
- Modify: `tests/e2e/smoke.spec.ts` for admin music creation smoke coverage.
- Create: `src/features/admin/music-actions.ts` for validation, create, update, delete, and revalidation.
- Create: `src/features/admin/music-data.ts` for list/detail admin queries.
- Create: `src/components/admin/music-form.tsx` for new/edit form fields.
- Create: `src/app/admin/content/music/page.tsx` for music list and delete action.
- Create: `src/app/admin/content/music/new/page.tsx` for create route.
- Create: `src/app/admin/content/music/[id]/edit/page.tsx` for edit route.
- Modify: `src/features/public/public-content.ts` to expose `getEnabledMusicTracks`.
- Modify: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md` after verification.

### Task 1: Tests

- [x] **Step 1: Write failing integration tests**

Add music action coverage that imports `@/features/admin/music-actions`, creates/updates/deletes `MusicTrack`, and rejects invalid source URLs.

- [x] **Step 2: Write failing public read model test**

Assert `getEnabledMusicTracks()` calls Prisma with `where: { enabled: true }`, player ordering, and a narrow select shape.

- [x] **Step 3: Write failing e2e smoke test**

Add a seed-owner flow for `/admin/content/music` -> `/new` -> save -> list contains the new title.

- [x] **Step 4: Run targeted tests and confirm RED**

Run: `pnpm vitest run tests/unit/public-content.test.ts tests/integration/admin-actions.test.ts`

Expected before implementation: missing `music-actions` and missing `getEnabledMusicTracks`.

### Task 2: Admin Actions And Public Data

- [x] **Step 1: Create `src/features/admin/music-actions.ts`**

Implement `validateMusicTrackInput`, `createMusicTrack`, `updateMusicTrack`, and `deleteMusicTrack` with required title, artist, valid `sourceUrl`, optional valid `coverUrl`, checkbox `enabled`, integer `sortOrder`, and path revalidation for `/`, `/admin`, and `/admin/content/music`.

- [x] **Step 2: Create `src/features/admin/music-data.ts`**

Implement `getAdminMusicTracks()` ordered by `sortOrder asc`, `createdAt desc`, and `getAdminMusicTrack(id)`.

- [x] **Step 3: Add `getEnabledMusicTracks()`**

Implement public read model in `src/features/public/public-content.ts` using enabled-only filtering, player ordering, and narrow select.

- [x] **Step 4: Run targeted unit/integration tests**

Run: `pnpm vitest run tests/unit/public-content.test.ts tests/integration/admin-actions.test.ts`

Expected after implementation: all tests pass.

### Task 3: Admin UI Routes

- [x] **Step 1: Create `src/components/admin/music-form.tsx`**

Fields: title, artist, cover URL, audio source URL, source type, enabled checkbox, sort order, and submit label `保存音乐`.

- [x] **Step 2: Create list route**

Create `src/app/admin/content/music/page.tsx` with heading `音乐管理`, CTA `新建音乐`, table columns for title, artist, source type, enabled state, sort order, update time, and preview/edit/delete actions.

- [x] **Step 3: Create new route**

Create `src/app/admin/content/music/new/page.tsx` using `MusicForm` and `createMusicTrack`.

- [x] **Step 4: Create edit route**

Create `src/app/admin/content/music/[id]/edit/page.tsx` using `MusicForm`, `updateMusicTrack`, `getAdminMusicTrack`, and `notFound`.

- [x] **Step 5: Run e2e smoke test**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts`

Expected after implementation: the music creation smoke test passes with the existing suite.

### Task 4: Roadmap And Verification

- [x] **Step 1: Update master roadmap**

Add this plan to Source Documents, mark Music management Done, update progress snapshot notes, and append verification results.

- [x] **Step 2: Run full verification**

Run: `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

- [ ] **Step 3: Commit and push if verification passes**

Commit the implementation and roadmap update with a narrow message, then push `master`.
