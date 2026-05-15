# Footprint Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make footprint places and visit records manageable from the admin console.

**Architecture:** Follow the existing admin content pattern: a data module for list/detail reads, a server action module for validation and mutations, a shared form component, and three App Router pages. The place form includes an optional visit block so the batch can manage places and visits without adding more routes yet.

**Tech Stack:** Next.js App Router, React Server Components, Prisma/PostgreSQL Decimal fields, Zod, Vitest, Playwright.

---

## File Structure

- Create `src/features/admin/footprint-data.ts` for place list/detail reads with visits.
- Create `src/features/admin/footprint-actions.ts` for validation, place CRUD, visit upsert, visit delete, and revalidation.
- Create `src/components/admin/footprint-form.tsx` for the shared place/visit form.
- Create `src/app/admin/content/footprints/page.tsx` for list, visit display, and delete actions.
- Create `src/app/admin/content/footprints/new/page.tsx` for place creation.
- Create `src/app/admin/content/footprints/[id]/edit/page.tsx` for place editing and visit maintenance.
- Modify `tests/unit/admin-notes.test.ts` for footprint validation tests.
- Modify `tests/integration/admin-actions.test.ts` for footprint server action tests.
- Modify `tests/e2e/smoke.spec.ts` for owner-created footprint place coverage.
- Modify `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md` after completion.

### Task 1: Validation And Data Foundation

**Files:**
- Create: `src/features/admin/footprint-data.ts`
- Create: `src/features/admin/footprint-actions.ts`
- Test: `tests/unit/admin-notes.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add tests that import `validateFootprintInput`, reject missing name/description/coordinates, reject latitude outside `-90..90`, reject longitude outside `-180..180`, reject invalid cover URL and visit date, and accept a valid minimal place form.

- [ ] **Step 2: Run targeted unit tests and verify RED**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: fail because `@/features/admin/footprint-actions` does not exist.

- [ ] **Step 3: Implement data reads and validation**

Create `getAdminFootprintPlaces()` ordered by `updatedAt desc` with visits ordered by `visitedAt desc`. Create `getAdminFootprintPlace(id)` with visits. Add Zod validation for required place fields, coordinate bounds, optional cover URL, optional visit fields, and optional visit date.

- [ ] **Step 4: Run targeted unit tests and verify GREEN**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: pass.

- [ ] **Step 5: Commit the foundation**

Run:

```bash
git add src/features/admin/footprint-data.ts src/features/admin/footprint-actions.ts tests/unit/admin-notes.test.ts docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-footprint-admin.md
git commit -m "feat: add admin footprint data foundation"
```

### Task 2: Footprint Mutations

**Files:**
- Modify: `src/features/admin/footprint-actions.ts`
- Test: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing integration tests**

Add tests for `createFootprintPlace`, `updateFootprintPlace`, `deleteFootprintPlace`, and `deleteFootprintVisit`. Verify create can create a place and an optional first visit in one transaction. Verify invalid coordinates do not write records.

- [ ] **Step 2: Run targeted integration tests and verify RED**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: fail because mutation exports or Prisma calls are missing.

- [ ] **Step 3: Implement server actions**

Implement server actions with shared parsing. Place create/update should write `FootprintPlace`. If visit title, description, and date are present, create a visit on create, update the provided `visitId` on edit, or create a new visit on edit when no `visitId` exists. Delete actions remove the place or visit. Revalidate `/`, `/footprints`, `/admin`, and `/admin/content/footprints`, then redirect to `/admin/content/footprints`.

- [ ] **Step 4: Run targeted integration tests and verify GREEN**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: pass.

- [ ] **Step 5: Commit the mutations**

Run:

```bash
git add src/features/admin/footprint-actions.ts tests/integration/admin-actions.test.ts
git commit -m "feat: add admin footprint mutations"
```

### Task 3: Admin UI And E2E

**Files:**
- Create: `src/components/admin/footprint-form.tsx`
- Create: `src/app/admin/content/footprints/page.tsx`
- Create: `src/app/admin/content/footprints/new/page.tsx`
- Create: `src/app/admin/content/footprints/[id]/edit/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing e2e test**

Add a Playwright test where the seed owner logs in, opens `/admin/content/footprints`, clicks `新建足迹`, fills place name, description, latitude, longitude, and a first visit, saves, returns to the list, and sees the new place.

- [ ] **Step 2: Run targeted e2e and verify RED**

Run: `pnpm test:e2e -- --grep "footprint place"`

Expected: fail because the admin footprint routes do not exist.

- [ ] **Step 3: Implement footprint admin UI**

Create list, new, and edit pages. List places with coordinates, cover URL, latest visits, updated date, edit/delete actions, and per-visit delete actions. Create the shared form fields for place and optional visit maintenance.

- [ ] **Step 4: Run targeted e2e and verify GREEN**

Run: `pnpm test:e2e -- --grep "footprint place"`

Expected: pass.

- [ ] **Step 5: Commit the UI**

Run:

```bash
git add src/components/admin/footprint-form.tsx src/app/admin/content/footprints tests/e2e/smoke.spec.ts
git commit -m "feat: add admin footprint management"
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

Mark footprint management as `Done`, add this plan to Source Documents, mark Batch 2 done, and append the latest verification results with observed counts.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md
git commit -m "docs: update footprint roadmap status"
git push
```
