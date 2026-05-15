# Like Zhizhi Phase 2 Public Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public Pro-like site experience with database-backed routes, navigation, seeded content, visitor messages, and responsive visual polish.

**Architecture:** Keep the Next.js App Router monolith from Phase 1. Public pages read through focused `src/features/public/*` query modules and compose shared UI primitives; visitor mutations live in route handlers with validation and server-side persistence. This phase intentionally avoids full admin CRUD, but seed data is expanded enough for all public modules to demonstrate the product.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Vitest, Playwright, pnpm.

---

## Phase Boundary

Implemented in this plan:

- Public routes: `/`, `/notes`, `/notes/[slug]`, `/messages`, `/footprints`, `/album`, `/checklist`, `/love-days`, `/about`.
- Responsive public navigation driven by enabled `ModuleSetting` records.
- Pro-like public UI sections: hero, profile pair, stats, timeline, gallery cards, wish list, footprint cards, love day counters, messages.
- Database-backed public queries with friendly empty states.
- Visitor message submission endpoint and form with validation.
- Visit event recording helper for public page views.
- Expanded seed content for notes, album, checklist, footprints, love days, music, and messages.
- Public e2e coverage for navigation and message submission.

Deferred to later plans:

- Full admin CRUD for managing these records.
- MinIO upload UI and media picker.
- External map/weather/email/music integrations.
- Advanced anti-spam, captcha, Redis rate limiting, and analytics aggregation jobs.

## File Structure

Create these files:

- `src/features/public/navigation.ts` - query enabled public modules and map them to route metadata.
- `src/features/public/site-data.ts` - shared site/theme/profile/stat query for public pages.
- `src/features/public/public-content.ts` - public queries for notes, messages, footprints, album, checklist, love days, and about summaries.
- `src/features/public/message-actions.ts` - validation and persistence helpers for visitor message creation.
- `src/server/analytics/visit-event.ts` - small helper for non-blocking visit event persistence.
- `src/components/public/public-nav.tsx` - responsive public navigation bar.
- `src/components/public/hero-section.tsx` - public hero and profile pair section.
- `src/components/public/content-card.tsx` - repeated public content card primitive.
- `src/components/public/empty-state.tsx` - public empty state primitive.
- `src/components/public/message-form.tsx` - client-side visitor message form.
- `src/app/notes/page.tsx` - notes index.
- `src/app/notes/[slug]/page.tsx` - note detail.
- `src/app/messages/page.tsx` - public message wall.
- `src/app/api/messages/route.ts` - visitor message API.
- `src/app/footprints/page.tsx` - footprint cards.
- `src/app/album/page.tsx` - album grid.
- `src/app/checklist/page.tsx` - wish checklist.
- `src/app/love-days/page.tsx` - anniversary counters.
- `src/app/about/page.tsx` - about page.
- `tests/unit/public-content.test.ts` - pure public view-model utility tests.
- `tests/integration/messages-api.test.ts` - visitor message API tests.

Modify these files:

- `prisma/seed.ts` - add representative public content for every module.
- `src/app/page.tsx` - upgrade home from shell to public landing page.
- `src/components/layout/public-shell.tsx` - use database-driven navigation and footer data.
- `tests/e2e/smoke.spec.ts` - add public route and message submission smoke tests.

## Task 1: Public Query Layer And Navigation

**Files:**
- Create: `src/features/public/navigation.ts`
- Create: `src/features/public/site-data.ts`
- Create: `src/features/public/public-content.ts`
- Create: `src/components/public/empty-state.tsx`
- Modify: `src/components/layout/public-shell.tsx`
- Test: `tests/unit/public-content.test.ts`

- [ ] **Step 1: Write failing tests for public view-model helpers**

```ts
import { describe, expect, it } from "vitest";
import { formatLoveDay, mapModuleToRoute } from "@/features/public/public-content";

describe("public content helpers", () => {
  it("maps enabled module keys to public routes", () => {
    expect(mapModuleToRoute("home")).toBe("/");
    expect(mapModuleToRoute("notes")).toBe("/notes");
    expect(mapModuleToRoute("love-days")).toBe("/love-days");
    expect(mapModuleToRoute("unknown")).toBeNull();
  });

  it("formats elapsed love days inclusively", () => {
    expect(formatLoveDay(new Date("2024-05-20T00:00:00+08:00"), new Date("2024-05-21T00:00:00+08:00"))).toEqual({
      days: 1,
      label: "已一起 1 天"
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/public-content.test.ts`

Expected: FAIL because `src/features/public/public-content.ts` does not exist.

- [ ] **Step 3: Implement public helpers and query modules**

Create `navigation.ts` with enabled-module querying, `site-data.ts` with shared site/profile/theme/stat querying, and `public-content.ts` with route mapping plus public list/detail queries. Return plain serializable view models, not Prisma records.

- [ ] **Step 4: Wire `PublicShell` to database-driven navigation**

Update `PublicShell` to receive navigation items and footer copy, then update callers to pass values from server components.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test tests/unit/public-content.test.ts
pnpm lint
git add src/features/public src/components/layout/public-shell.tsx src/components/public/empty-state.tsx tests/unit/public-content.test.ts
git commit -m "feat: add public query layer"
```

## Task 2: Home And Public Route Pages

**Files:**
- Create: `src/components/public/public-nav.tsx`
- Create: `src/components/public/hero-section.tsx`
- Create: `src/components/public/content-card.tsx`
- Create: `src/app/notes/page.tsx`
- Create: `src/app/notes/[slug]/page.tsx`
- Create: `src/app/footprints/page.tsx`
- Create: `src/app/album/page.tsx`
- Create: `src/app/checklist/page.tsx`
- Create: `src/app/love-days/page.tsx`
- Create: `src/app/about/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add route-level smoke assertions before implementation**

Extend `tests/e2e/smoke.spec.ts` with navigation checks for `/notes`, `/messages`, `/footprints`, `/album`, `/checklist`, `/love-days`, and `/about`.

- [ ] **Step 2: Run e2e to verify the new assertions fail**

Run: `pnpm test:e2e`

Expected: FAIL because the new public routes do not exist.

- [ ] **Step 3: Implement the shared public components**

Build compact Tailwind components for hero, nav, and repeated content cards. Keep cards at radius `8px` or less and avoid nested cards.

- [ ] **Step 4: Implement every public route**

Each route uses the public query layer, shows content when present, and renders `EmptyState` when the database has no published records. `notes/[slug]` returns `notFound()` for missing or unpublished notes.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm lint
pnpm test
pnpm test:e2e
git add src/app src/components/public tests/e2e/smoke.spec.ts
git commit -m "feat: add public route experience"
```

## Task 3: Visitor Messages

**Files:**
- Create: `src/features/public/message-actions.ts`
- Create: `src/components/public/message-form.tsx`
- Create: `src/app/api/messages/route.ts`
- Modify: `src/app/messages/page.tsx`
- Test: `tests/integration/messages-api.test.ts`

- [ ] **Step 1: Write failing API tests**

```ts
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/messages/route";

describe("visitor message API", () => {
  it("rejects short nickname and content", async () => {
    const response = await POST(new Request("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify({ nickname: "a", content: "短" })
    }));

    expect(response.status).toBe(400);
  });

  it("accepts valid visitor messages", async () => {
    const response = await POST(new Request("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify({ nickname: "测试访客", content: "这是一条公开留言，等待审核后展示。" })
    }));

    expect(response.status).toBe(201);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/integration/messages-api.test.ts`

Expected: FAIL because the route handler does not exist.

- [ ] **Step 3: Implement message validation and route handler**

Use `zod` to require nickname length `2..24` and content length `5..500`. Persist messages as `PENDING`; approved messages continue to display publicly.

- [ ] **Step 4: Implement client message form**

Use a client component that posts to `/api/messages`, shows pending-review success text, and displays field-level validation errors returned by the API.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test tests/integration/messages-api.test.ts
pnpm test:e2e
git add src/features/public/message-actions.ts src/components/public/message-form.tsx src/app/api/messages/route.ts src/app/messages/page.tsx tests/integration/messages-api.test.ts tests/e2e/smoke.spec.ts
git commit -m "feat: add visitor message submission"
```

## Task 4: Seed Data And Final Public Polish

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/notes/page.tsx`
- Modify: `src/app/footprints/page.tsx`
- Modify: `src/app/album/page.tsx`
- Modify: `src/app/checklist/page.tsx`
- Modify: `src/app/love-days/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add seed expectations to e2e**

Assert that public pages show representative seeded content: at least one note, one approved message, one checklist item, one love day, one album item, and one footprint place.

- [ ] **Step 2: Run e2e to verify missing seed coverage**

Run: `pnpm test:e2e`

Expected: FAIL until seed content and pages are complete.

- [ ] **Step 3: Expand seed data**

Add deterministic upserts for media assets, album items, footprint places/visits, additional notes, love days, messages, checklist items, and an enabled `love-days` module.

- [ ] **Step 4: Apply seed to the configured local database**

Run: `pnpm db:seed`

Expected: seed completes with exit code 0.

- [ ] **Step 5: Final verification and commit**

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
git add prisma/seed.ts src/app tests/e2e/smoke.spec.ts
git commit -m "feat: seed public experience"
```

## Completion Verification

Before Phase 2 is considered complete, run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected result:

- `pnpm lint` exits 0.
- `pnpm test` reports all unit/integration tests passing.
- `pnpm build` exits 0.
- `pnpm test:e2e` reports public navigation, message submission, public content, and admin login smoke tests passing.
