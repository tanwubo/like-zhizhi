# Checklist Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make checklist items fully manageable from the admin console while preserving the public checklist page.

**Architecture:** Follow the established notes and album admin pattern: a focused data module, a server action module with Zod validation, one reusable form component, three admin routes, and public route revalidation after mutations. Checklist media stays as an optional external image URL until the media center batch exists.

**Tech Stack:** Next.js App Router, React Server Components, Prisma/PostgreSQL, Zod, Vitest, Playwright.

---

## File Structure

- Create `src/features/admin/checklist-data.ts` for admin list/detail Prisma reads.
- Create `src/features/admin/checklist-actions.ts` for validation, create, update, delete, and revalidation.
- Create `src/components/admin/checklist-form.tsx` for the shared new/edit form.
- Create `src/app/admin/content/checklist/page.tsx` for list and delete actions.
- Create `src/app/admin/content/checklist/new/page.tsx` for item creation.
- Create `src/app/admin/content/checklist/[id]/edit/page.tsx` for item editing.
- Modify `tests/unit/admin-notes.test.ts` to cover checklist validation.
- Modify `tests/integration/admin-actions.test.ts` to cover checklist server actions.
- Modify `tests/e2e/smoke.spec.ts` to cover owner-created checklist drafts.
- Modify `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md` after completion.

### Task 1: Validation And Data Foundation

**Files:**
- Create: `src/features/admin/checklist-data.ts`
- Create: `src/features/admin/checklist-actions.ts`
- Test: `tests/unit/admin-notes.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add tests that call `validateChecklistInput(new FormData())`, expect `title` to be required, reject invalid `targetDate`, reject invalid `imageUrl`, and accept a minimal valid title.

- [ ] **Step 2: Run targeted unit tests and verify RED**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: fail because `@/features/admin/checklist-actions` does not exist.

- [ ] **Step 3: Implement checklist data and validation**

Create admin reads ordered by `updatedAt desc`. Create Zod validation for `title`, `description`, `status`, `completed`, `completedAt`, `targetDate`, `location`, `imageUrl`, and `sortOrder`. Optional dates must be real `YYYY-MM-DD` dates when present. Optional image URL must be a valid URL when present.

- [ ] **Step 4: Run targeted unit tests and verify GREEN**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: pass.

- [ ] **Step 5: Commit the foundation**

Run:

```bash
git add src/features/admin/checklist-data.ts src/features/admin/checklist-actions.ts tests/unit/admin-notes.test.ts docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-checklist-admin.md
git commit -m "feat: add admin checklist data foundation"
```

### Task 2: Checklist Mutations

**Files:**
- Modify: `src/features/admin/checklist-actions.ts`
- Test: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing integration tests**

Add tests for `createChecklistItem`, `updateChecklistItem`, and `deleteChecklistItem`. Verify create stores title, description, draft/published status, completion fields, optional target date, optional image URL, location, and sort order. Verify invalid image URL does not write a record.

- [ ] **Step 2: Run targeted integration tests and verify RED**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: fail because mutation exports or Prisma calls are missing.

- [ ] **Step 3: Implement server actions**

Implement `createChecklistItem`, `updateChecklistItem`, and `deleteChecklistItem` with `"use server"`, shared parsing, `prisma.checklistItem` writes, `revalidatePath` for `/`, `/checklist`, `/admin`, and `/admin/content/checklist`, then redirect to `/admin/content/checklist`.

- [ ] **Step 4: Run targeted integration tests and verify GREEN**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: pass.

- [ ] **Step 5: Commit the mutations**

Run:

```bash
git add src/features/admin/checklist-actions.ts tests/integration/admin-actions.test.ts
git commit -m "feat: add admin checklist mutations"
```

### Task 3: Admin UI And E2E

**Files:**
- Create: `src/components/admin/checklist-form.tsx`
- Create: `src/app/admin/content/checklist/page.tsx`
- Create: `src/app/admin/content/checklist/new/page.tsx`
- Create: `src/app/admin/content/checklist/[id]/edit/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing e2e test**

Add a Playwright test where the seed owner logs in, opens `/admin/content/checklist`, clicks `新建清单`, fills title and description, saves, returns to the list, and sees the new title.

- [ ] **Step 2: Run targeted e2e and verify RED**

Run: `pnpm test:e2e -- --grep "checklist draft"`

Expected: fail because the admin checklist routes do not exist.

- [ ] **Step 3: Implement checklist admin UI**

Create the list page with status labels, completion state, target date, location, updated date, preview/edit/delete actions, and an empty state. Create new/edit pages and shared form fields for title, description, status, completed, completedAt, targetDate, location, imageUrl, and sortOrder.

- [ ] **Step 4: Run targeted e2e and verify GREEN**

Run: `pnpm test:e2e -- --grep "checklist draft"`

Expected: pass.

- [ ] **Step 5: Commit the UI**

Run:

```bash
git add src/components/admin/checklist-form.tsx src/app/admin/content/checklist tests/e2e/smoke.spec.ts
git commit -m "feat: add admin checklist management"
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

Mark checklist management as `Done`, add this plan to Source Documents, and append the latest verification results with the test counts observed from the commands.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md
git commit -m "docs: update checklist roadmap status"
git push
```
