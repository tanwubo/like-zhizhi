# Love Days Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make anniversary and countdown events manageable from the admin console.

**Architecture:** Follow the existing content admin pattern: a focused data module, a Zod-backed server action module, a shared form component, and three admin routes. Public `formatLoveDay` behavior remains unchanged; admin mutations only manage `LoveDayEvent` fields and revalidate public/admin routes.

**Tech Stack:** Next.js App Router, React Server Components, Prisma/PostgreSQL, Zod, Vitest, Playwright.

---

## File Structure

- Create `src/features/admin/love-days-data.ts` for admin list/detail reads.
- Create `src/features/admin/love-days-actions.ts` for validation, create, update, delete, and revalidation.
- Create `src/components/admin/love-day-form.tsx` for the shared form.
- Create `src/app/admin/content/love-days/page.tsx` for list and delete actions.
- Create `src/app/admin/content/love-days/new/page.tsx` for event creation.
- Create `src/app/admin/content/love-days/[id]/edit/page.tsx` for event editing.
- Modify `tests/unit/admin-notes.test.ts` for love-day validation.
- Modify `tests/integration/admin-actions.test.ts` for love-day server actions.
- Modify `tests/e2e/smoke.spec.ts` for owner-created love-day coverage.
- Modify `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md` after completion.

### Task 1: Validation And Data Foundation

**Files:**
- Create: `src/features/admin/love-days-data.ts`
- Create: `src/features/admin/love-days-actions.ts`
- Test: `tests/unit/admin-notes.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add tests that import `validateLoveDayInput`, reject missing title/description/date, reject invalid date, reject non-integer sort order, and accept a valid minimal event form.

- [ ] **Step 2: Run targeted unit tests and verify RED**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: fail because `@/features/admin/love-days-actions` does not exist.

- [ ] **Step 3: Implement data reads and validation**

Create list/detail reads ordered by `sortOrder asc`, `date asc`. Add validation for title, description, date, yearly, lunar, and sortOrder.

- [ ] **Step 4: Run targeted unit tests and verify GREEN**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: pass.

- [ ] **Step 5: Commit the foundation**

Run:

```bash
git add src/features/admin/love-days-data.ts src/features/admin/love-days-actions.ts tests/unit/admin-notes.test.ts docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-love-days-admin.md
git commit -m "feat: add admin love days data foundation"
```

### Task 2: Love Day Mutations

**Files:**
- Modify: `src/features/admin/love-days-actions.ts`
- Test: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing integration tests**

Add tests for `createLoveDayEvent`, `updateLoveDayEvent`, and `deleteLoveDayEvent`. Verify boolean flags and sort order are persisted. Verify invalid date does not write a record.

- [ ] **Step 2: Run targeted integration tests and verify RED**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: fail because mutation exports or Prisma calls are missing.

- [ ] **Step 3: Implement server actions**

Implement create, update, and delete with `"use server"`, shared parsing, `prisma.loveDayEvent` writes, revalidation for `/`, `/love-days`, `/admin`, and `/admin/content/love-days`, then redirect to `/admin/content/love-days`.

- [ ] **Step 4: Run targeted integration tests and verify GREEN**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: pass.

- [ ] **Step 5: Commit the mutations**

Run:

```bash
git add src/features/admin/love-days-actions.ts tests/integration/admin-actions.test.ts
git commit -m "feat: add admin love day mutations"
```

### Task 3: Admin UI And E2E

**Files:**
- Create: `src/components/admin/love-day-form.tsx`
- Create: `src/app/admin/content/love-days/page.tsx`
- Create: `src/app/admin/content/love-days/new/page.tsx`
- Create: `src/app/admin/content/love-days/[id]/edit/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing e2e test**

Add a Playwright test where the seed owner logs in, opens `/admin/content/love-days`, clicks `新建纪念日`, fills title, description, date, and saves. The event should appear in the admin list.

- [ ] **Step 2: Run targeted e2e and verify RED**

Run: `pnpm test:e2e -- --grep "love-day event"`

Expected: fail because admin love-day routes do not exist.

- [ ] **Step 3: Implement love-day admin UI**

Create list, new, and edit pages. List events with title, description, date, yearly/lunar flags, sort order, updated date, preview/edit/delete actions. Create a shared form for all editable fields.

- [ ] **Step 4: Run targeted e2e and verify GREEN**

Run: `pnpm test:e2e -- --grep "love-day event"`

Expected: pass.

- [ ] **Step 5: Commit the UI**

Run:

```bash
git add src/components/admin/love-day-form.tsx src/app/admin/content/love-days tests/e2e/smoke.spec.ts
git commit -m "feat: add admin love day management"
```

### Task 4: Full Verification And Roadmap Update

**Files:**
- Modify: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected: all commands exit 0.

- [ ] **Step 2: Update roadmap**

Mark love-day management as `Done`, add this plan to Source Documents, mark Batch 3 done, update `Last updated` to `2026-05-16`, and append the latest verification results with observed counts.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md
git commit -m "docs: update love days roadmap status"
git push
```
