# Users And Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make admin users and roles manageable from the product without seed scripts.

**Architecture:** Add `disabledAt` to `User`, keep destructive removal out of the first product slice, and implement owner-only server actions for create/update/password replacement/disable/enable. Admin navigation is filtered from role capability definitions so UI visibility and server-side enforcement share the same policy source.

**Tech Stack:** Next.js App Router, Prisma/PostgreSQL, server actions, bcrypt password hashing, Vitest, Playwright.

---

### Task 1: User Model And Permission Utilities

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260516010000_add_user_disabled_at/migration.sql`
- Modify: `src/server/auth/roles.ts`
- Test: `tests/unit/roles.test.ts`

- [x] **Step 1: Write failing permission tests**

Add tests that assert owner-only user management, partner settings access, moderator navigation restrictions, and disabled users being represented by `disabledAt`.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/unit/roles.test.ts`

- [x] **Step 3: Implement schema and role helpers**

Add nullable `disabledAt` to `User`, add the migration SQL, and expose capability helpers used by admin navigation and user actions.

- [x] **Step 4: Run GREEN**

Run: `pnpm vitest run tests/unit/roles.test.ts`

### Task 2: User Data, Validation, And Actions

**Files:**
- Create: `src/features/admin/users-data.ts`
- Create: `src/features/admin/users-actions.ts`
- Modify: `tests/integration/admin-actions.test.ts`

- [x] **Step 1: Write failing action tests**

Cover owner create/update/password replacement/disable/enable actions, email/password validation, self-disable prevention, and non-owner rejection before Prisma writes.

- [x] **Step 2: Run RED**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts -t "admin user actions"`

- [x] **Step 3: Implement actions**

Create owner-guarded mutations that hash passwords, normalize emails, upsert no data, revalidate admin user routes, and redirect to `/admin/users`.

- [x] **Step 4: Run GREEN**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts -t "admin user actions"`

### Task 3: Admin User Routes

**Files:**
- Create: `src/components/admin/user-form.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/users/new/page.tsx`
- Create: `src/app/admin/users/[id]/edit/page.tsx`
- Modify: `src/components/layout/admin-shell.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/server/auth/session.ts`
- Test: `tests/e2e/smoke.spec.ts`

- [x] **Step 1: Write failing E2E**

Add an owner flow that creates a moderator through `/admin/users/new`, then confirms the user appears in `/admin/users`.

- [x] **Step 2: Run RED**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts -g "seed owner can create a moderator"`

- [x] **Step 3: Implement UI and auth hardening**

Add list/new/edit pages, reusable user form, owner-only route guards, disabled-user login/session blocking, and role-filtered admin navigation.

- [x] **Step 4: Run GREEN**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts -g "seed owner can create a moderator"`

### Task 4: Verification And Roadmap

**Files:**
- Modify: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md`

- [x] **Step 1: Apply and generate database changes**

Run: `pnpm db:deploy` and `pnpm db:generate`.

- [x] **Step 2: Run full verification**

Run sequentially:
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

- [x] **Step 3: Update roadmap and commit**

Mark Batch 8 done, record verification, commit the feature and roadmap, and push `master`.
