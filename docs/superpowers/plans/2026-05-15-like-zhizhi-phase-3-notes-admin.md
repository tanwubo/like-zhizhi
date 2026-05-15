# Like Zhizhi Phase 3 Notes Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first full admin content CRUD surface for notes so the public notes module can be managed without editing seed data.

**Architecture:** Continue the Next.js App Router monolith directly on `master` as requested. Admin note pages use server components for reads, server actions for mutations, Prisma for persistence, and Zod for validation. This batch intentionally keeps note content as plain rich-text-ready text fields and leaves media attachment/upload for the later media batch.

**Tech Stack:** Next.js App Router, React Server Components, Server Actions, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Zod, Vitest, Playwright, pnpm.

---

## Phase Boundary

Implemented by this plan:

- Admin note list at `/admin/content/notes`.
- New note form at `/admin/content/notes/new`.
- Edit note form at `/admin/content/notes/[id]/edit`.
- Create/update/delete server actions.
- Publish status control using existing `PublishStatus` values: `DRAFT`, `PUBLISHED`, `HIDDEN`.
- Slug normalization and uniqueness validation.
- Revalidation for public notes routes after mutations.
- Focused unit/integration/e2e coverage.

Deferred to later Phase 3 batches:

- Rich text editor widget.
- Note media attachment and upload UI.
- Note reactions/views management.
- Batch operations.

## File Structure

Create these files:

- `src/features/admin/notes-data.ts` - admin note list/detail read models plus slug normalization helper.
- `src/features/admin/notes-actions.ts` - Zod schemas and server actions for create/update/delete.
- `src/components/admin/note-form.tsx` - shared note create/edit form.
- `src/app/admin/content/notes/page.tsx` - admin note list page.
- `src/app/admin/content/notes/new/page.tsx` - note creation page.
- `src/app/admin/content/notes/[id]/edit/page.tsx` - note edit page.
- `tests/unit/admin-notes.test.ts` - slug and note form validation tests.

Modify these files:

- `tests/integration/admin-actions.test.ts` - add mocked note mutation coverage.
- `tests/e2e/smoke.spec.ts` - add admin notes smoke coverage.

## Task 1: Admin Notes Data And Validation

**Files:**
- Create: `src/features/admin/notes-data.ts`
- Create: `tests/unit/admin-notes.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { normalizeNoteSlug } from "@/features/admin/notes-data";
import { validateNoteInput } from "@/features/admin/notes-actions";

describe("admin notes", () => {
  it("normalizes human note titles into stable slugs", () => {
    expect(normalizeNoteSlug("  First Memory 2026!  ")).toBe("first-memory-2026");
  });

  it("rejects notes without title and content", () => {
    const result = validateNoteInput(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toContain("标题不能为空");
      expect(result.errors.content).toContain("正文不能为空");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/admin-notes.test.ts`

Expected: FAIL because `notes-data.ts` and `notes-actions.ts` do not exist.

- [ ] **Step 3: Implement notes data helpers**

Create `normalizeNoteSlug(raw: string)` that lowercases text, trims it, replaces non-alphanumeric groups with `-`, and trims leading/trailing hyphens. Create `getAdminNotes()` ordered by `updatedAt desc`, and `getAdminNote(id)` using Prisma.

- [ ] **Step 4: Implement validation helper**

Create `validateNoteInput(formData: FormData)` in `notes-actions.ts` with required title, excerpt, content, status, and optional slug/mood/weather/location fields. Do not mutate the database in this task.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test tests/unit/admin-notes.test.ts
pnpm lint
git add src/features/admin/notes-data.ts src/features/admin/notes-actions.ts tests/unit/admin-notes.test.ts docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-notes-admin.md
git commit -m "docs: add notes admin implementation plan"
```

## Task 2: Note Mutations

**Files:**
- Modify: `src/features/admin/notes-actions.ts`
- Modify: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing action tests**

Add tests that mock `prisma.note.findUnique`, `prisma.note.create`, `prisma.note.update`, and `prisma.note.delete`. Verify blank title is rejected, create normalizes slug, published notes receive `publishedAt`, and duplicate slugs are rejected before create/update.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: FAIL because note mutation actions are not implemented.

- [ ] **Step 3: Implement server actions**

Implement:

- `createNote(formData: FormData): Promise<void>`
- `updateNote(formData: FormData): Promise<void>`
- `deleteNote(formData: FormData): Promise<void>`

All actions validate input, enforce slug uniqueness, map empty optional fields to `null`, set `publishedAt` when status is `PUBLISHED`, clear it for other statuses, and revalidate `/notes`, the changed detail route, `/admin`, and `/admin/content/notes`.

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm test tests/unit/admin-notes.test.ts tests/integration/admin-actions.test.ts
pnpm lint
git add src/features/admin/notes-actions.ts tests/integration/admin-actions.test.ts
git commit -m "feat: add admin note mutations"
```

## Task 3: Note Admin Pages

**Files:**
- Create: `src/components/admin/note-form.tsx`
- Create: `src/app/admin/content/notes/page.tsx`
- Create: `src/app/admin/content/notes/new/page.tsx`
- Create: `src/app/admin/content/notes/[id]/edit/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add e2e notes management assertion**

Add a smoke test that logs in, opens `/admin/content/notes`, confirms the `点滴管理` heading, opens the new note page, fills a draft note, submits it, and sees the new note in the admin list.

- [ ] **Step 2: Run e2e to verify it fails**

Run: `pnpm test:e2e`

Expected: FAIL because the admin notes pages do not exist.

- [ ] **Step 3: Implement note form component**

Build a shared form with fields for title, slug, excerpt, content, status, mood, weather, and location. Use existing `SubmitButton` and compact admin styling.

- [ ] **Step 4: Implement admin pages**

The list page shows title, status, slug, update time, public link for published notes, edit link, and delete button. The new page calls `createNote`. The edit page loads by `id`, shows 404 when missing, and calls `updateNote`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
git add src/components/admin/note-form.tsx src/app/admin/content/notes tests/e2e/smoke.spec.ts
git commit -m "feat: add admin notes management"
```

## Completion Verification

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
git push
```

Expected result:

- Lint exits 0.
- Vitest reports all unit and integration tests passing.
- Production build exits 0.
- Playwright verifies public smoke, admin login, message moderation, and admin notes creation.
- Remote `origin/master` contains the completed notes-admin batch.
