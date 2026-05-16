# Analytics, SEO, And Product Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the rebuild with visit analytics, SEO endpoints, admin dashboard polish, safer deletes, and deployment documentation.

**Architecture:** Reuse the existing `VisitEvent` and `DailyStat` Prisma models. Public pages send a lightweight client beacon to an API route; the server records raw events and rolls up daily counters in the same request. SEO uses App Router metadata, `sitemap.ts`, and `robots.ts`, with site settings as the source of truth.

**Tech Stack:** Next.js App Router, Prisma/PostgreSQL, Vitest, Playwright, server actions, client components.

---

### Task 1: Analytics Core

**Files:**
- Create: `src/server/analytics/visits.ts`
- Create: `src/app/api/visits/route.ts`
- Create: `src/components/public/visit-tracker.tsx`
- Modify: `src/components/layout/public-shell.tsx`
- Create: `tests/unit/analytics.test.ts`
- Modify: `tests/integration/messages-api.test.ts`

- [x] **Step 1: Write failing unit tests**

Cover path normalization, private/admin path rejection, day-start normalization, and stat increment shape.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/unit/analytics.test.ts`

- [x] **Step 3: Implement minimal analytics helper**

Create a focused helper that accepts path, visitor id, user agent, referrer, and optional IP hash. It must ignore admin/API/static paths, create one `VisitEvent`, and upsert the matching `DailyStat`.

- [x] **Step 4: Run GREEN**

Run: `pnpm vitest run tests/unit/analytics.test.ts`

- [x] **Step 5: Add API and beacon**

Expose `POST /api/visits` and mount a client tracker in `PublicShell` so public navigation records visits without blocking render.

### Task 2: Dashboard Stats And SEO

**Files:**
- Modify: `src/features/admin/dashboard-data.ts`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `tests/unit/seo.test.ts`

- [x] **Step 1: Write failing tests**

Cover dashboard analytics totals and sitemap/robots generation from configured public URL and enabled content.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/unit/seo.test.ts`

- [x] **Step 3: Implement dashboard and SEO**

Add visit/unique/message/note stats to the admin dashboard, generate dynamic metadata from `SiteSetting`, and add sitemap and robots endpoints.

- [x] **Step 4: Run GREEN**

Run: `pnpm vitest run tests/unit/seo.test.ts`

### Task 3: Product Polish

**Files:**
- Create: `src/components/admin/delete-button.tsx`
- Modify: content admin list pages that delete records
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [x] **Step 1: Write failing E2E**

Cover the admin dashboard analytics cards and confirm that delete buttons require browser confirmation.

- [x] **Step 2: Run RED**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts -g "analytics|delete confirmation"`

- [x] **Step 3: Implement polish**

Add a small reusable delete button with `window.confirm`, public loading/error screens, and dashboard UI labels.

- [x] **Step 4: Run GREEN**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts -g "analytics|delete confirmation"`

### Task 4: Deployment Docs, Roadmap, And Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/development/local-setup.md`
- Modify: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md`

- [x] **Step 1: Update docs**

Document direct PostgreSQL/Redis local defaults, production environment variables, migration/seed/deploy commands, and verification commands.

- [x] **Step 2: Run full verification**

Run sequentially:
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

Result on 2026-05-16:
- `pnpm lint`: passed.
- `pnpm test`: passed, 14 test files and 96 tests.
- `pnpm build`: passed.
- `pnpm test:e2e`: passed, 19 Playwright tests.

- [x] **Step 3: Update roadmap and commit**

Mark Batch 9 done, record verification counts, commit the feature and roadmap, and push `master`.
