# Like Zhizhi Phase 3 Admin Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the product manageable from the admin console, starting with settings, people profiles, module switches, and message moderation.

**Architecture:** Continue the Next.js App Router monolith on `master` as explicitly requested by the user. Admin pages use server components for reads, server actions for form mutations, focused `src/features/admin/*` modules for validation and persistence, and existing session/role checks in the protected admin layout.

**Tech Stack:** Next.js App Router, React Server Components, Server Actions, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Zod, Vitest, Playwright, pnpm.

---

## Phase Boundary

Implemented by this plan:

- Expanded role-aware admin navigation.
- Site settings editor for title, slogan, description, footer, SEO and compliance text.
- People profile editor for the two protagonist profiles.
- Module switch editor that immediately affects public navigation.
- Message moderation page for approving/hiding visitor messages.
- Focused unit/integration/e2e coverage for settings and moderation.

Deferred to later Phase 3 batches:

- Rich note editor and full note CRUD.
- Album/checklist/footprint/love-day/music CRUD.
- Media upload UI and MinIO picker.
- User management and integration settings.

## File Structure

Create these files:

- `src/features/admin/settings-actions.ts` - Zod schemas and server-side mutations for site, people, and module settings.
- `src/features/admin/settings-data.ts` - read models for admin settings pages.
- `src/features/admin/message-actions.ts` - message moderation mutations.
- `src/features/admin/message-data.ts` - message moderation list read model.
- `src/components/admin/admin-section.tsx` - shared admin section frame.
- `src/components/admin/submit-button.tsx` - client submit button with pending state.
- `src/app/admin/settings/site/page.tsx` - site settings form.
- `src/app/admin/settings/people/page.tsx` - people profile forms.
- `src/app/admin/settings/modules/page.tsx` - module switch form.
- `src/app/admin/content/messages/page.tsx` - moderation page.
- `tests/unit/admin-settings.test.ts` - validation and view model tests.
- `tests/integration/admin-actions.test.ts` - mocked admin mutation tests.

Modify these files:

- `src/components/layout/admin-shell.tsx` - full grouped admin navigation.
- `src/app/admin/page.tsx` - update dashboard copy and quick links.
- `tests/e2e/smoke.spec.ts` - add admin settings and message moderation smoke coverage.

## Task 1: Admin Navigation And Settings Data

**Files:**
- Create: `src/features/admin/settings-data.ts`
- Create: `src/components/admin/admin-section.tsx`
- Modify: `src/components/layout/admin-shell.tsx`
- Modify: `src/app/admin/page.tsx`
- Test: `tests/unit/admin-settings.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { normalizeModuleSettings } from "@/features/admin/settings-data";

describe("admin settings data", () => {
  it("sorts modules by sortOrder then label", () => {
    const modules = normalizeModuleSettings([
      { id: "2", key: "messages", label: "留言", enabled: true, sortOrder: 20, description: "" },
      { id: "1", key: "notes", label: "点滴", enabled: true, sortOrder: 10, description: "" }
    ]);

    expect(modules.map((module) => module.key)).toEqual(["notes", "messages"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/admin-settings.test.ts`

Expected: FAIL because `settings-data.ts` does not exist.

- [ ] **Step 3: Implement settings data helpers and grouped admin nav**

Create `normalizeModuleSettings()`, `getAdminSettingsData()`, and `AdminSection`. Update `AdminShell` navigation to include content and settings groups.

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm test tests/unit/admin-settings.test.ts
pnpm lint
git add src/features/admin/settings-data.ts src/components/admin/admin-section.tsx src/components/layout/admin-shell.tsx src/app/admin/page.tsx tests/unit/admin-settings.test.ts
git commit -m "feat: add admin settings data foundation"
```

## Task 2: Settings Mutations And Forms

**Files:**
- Create: `src/features/admin/settings-actions.ts`
- Create: `src/components/admin/submit-button.tsx`
- Create: `src/app/admin/settings/site/page.tsx`
- Create: `src/app/admin/settings/people/page.tsx`
- Create: `src/app/admin/settings/modules/page.tsx`
- Test: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing action tests**

```ts
import { describe, expect, it, vi } from "vitest";

const updateSite = vi.fn(async () => ({ id: "site" }));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    siteSetting: { update: updateSite },
    personProfile: { update: vi.fn(async () => ({ id: "person_1" })) },
    moduleSetting: { update: vi.fn(async () => ({ id: "module_1" })) }
  }
}));

describe("admin settings actions", () => {
  it("rejects blank site title", async () => {
    const { updateSiteSettings } = await import("@/features/admin/settings-actions");
    const result = await updateSiteSettings(new FormData());
    expect(result.ok).toBe(false);
    expect(updateSite).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/integration/admin-actions.test.ts`

Expected: FAIL because `settings-actions.ts` does not exist.

- [ ] **Step 3: Implement server actions**

Implement `updateSiteSettings`, `updatePersonProfile`, and `updateModuleSettings` with Zod validation, Prisma updates, `revalidatePath("/")`, and `revalidatePath("/admin")`.

- [ ] **Step 4: Implement forms**

Build forms for site settings, people profiles, and module switches using `AdminSection` and `SubmitButton`. Keep forms compact and functional.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test tests/integration/admin-actions.test.ts
pnpm lint
pnpm build
git add src/features/admin/settings-actions.ts src/components/admin/submit-button.tsx src/app/admin/settings tests/integration/admin-actions.test.ts
git commit -m "feat: add admin settings forms"
```

## Task 3: Message Moderation

**Files:**
- Create: `src/features/admin/message-data.ts`
- Create: `src/features/admin/message-actions.ts`
- Create: `src/app/admin/content/messages/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add e2e moderation assertion**

Add a test that logs in, opens `/admin/content/messages`, and expects the `留言审核` heading and at least one pending/approved message action.

- [ ] **Step 2: Run e2e to verify it fails**

Run: `pnpm test:e2e`

Expected: FAIL because the moderation page does not exist.

- [ ] **Step 3: Implement moderation data and actions**

Add `getModerationMessages()`, `approveMessage(formData)`, and `hideMessage(formData)`. Mutations update `Message.status`, revalidate admin messages and public messages pages.

- [ ] **Step 4: Implement moderation page**

Show pending and approved messages with action buttons. Hidden messages remain visible in admin with status labels.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
git add src/features/admin/message-data.ts src/features/admin/message-actions.ts src/app/admin/content/messages/page.tsx tests/e2e/smoke.spec.ts
git commit -m "feat: add message moderation"
```

## Completion Verification

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected result:

- Lint exits 0.
- Vitest reports all unit and integration tests passing.
- Production build exits 0.
- Playwright verifies public smoke, admin login, settings navigation, and message moderation.
