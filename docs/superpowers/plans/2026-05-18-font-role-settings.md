# Font Role Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add curated admin font role settings for the public site and apply them to the homepage.

**Architecture:** Store selected font option keys on `ThemeSetting`, normalize them through a centralized font options module, inject CSS variables from `PublicShell`, and use semantic public font classes in the homepage. The admin console remains unaffected because variables and classes are scoped to public rendering.

**Tech Stack:** Next.js App Router, Prisma, Zod, React server components, Tailwind CSS, Vitest.

---

### Task 1: Font Options And Normalization

**Files:**
- Create: `src/features/admin/font-options.ts`
- Modify: `src/features/admin/settings-data.ts`
- Test: `tests/unit/admin-settings.test.ts`

- [ ] **Step 1: Write failing unit tests**

Add tests that import `FONT_ROLE_DEFAULTS`, `getFontOptionGroups`, and `normalizeThemeSetting`. Assert defaults include body/display/romance/number keys and invalid keys fall back to defaults.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/admin-settings.test.ts`

Expected: FAIL because `font-options.ts` and theme font fields do not exist.

- [ ] **Step 3: Implement font option module and settings normalization**

Create the curated font option groups and add font fields to `AdminThemeSetting` plus `normalizeThemeSetting`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/admin-settings.test.ts`

Expected: PASS.

### Task 2: Persistence And Admin Form

**Files:**
- Modify: `prisma/schema.prisma`
- Add: `prisma/migrations/20260518000000_add_theme_font_roles/migration.sql`
- Modify: `src/features/admin/settings-actions.ts`
- Modify: `src/app/admin/settings/theme/page.tsx`
- Test: `tests/integration/admin-actions.test.ts`

- [ ] **Step 1: Write failing integration test**

Add a test that posts valid font keys to `updateThemeSettings` and expects `themeSetting.upsert` create/update data to include those keys.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts --testNamePattern "updates theme settings"`

Expected: FAIL because font keys are ignored.

- [ ] **Step 3: Add database fields and action parsing**

Add nullable string columns in Prisma and SQL migration. Extend `themeSchema` with role-specific font key validation and include fields in upsert data.

- [ ] **Step 4: Add admin selects**

Render a "字体设置" admin section using the centralized option groups and current theme keys.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts --testNamePattern "updates theme settings"`

Expected: PASS.

### Task 3: Public CSS Variables And Homepage Application

**Files:**
- Modify: `src/components/layout/public-shell.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Test: `tests/unit/home-copy.test.ts`

- [ ] **Step 1: Write failing homepage style test**

Extend `home-copy.test.ts` to assert the homepage source contains `font-display`, `font-romance`, and `font-number`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/home-copy.test.ts`

Expected: FAIL because the homepage has not been updated with role classes.

- [ ] **Step 3: Inject variables and add public font classes**

Set CSS variables in `PublicShell`, add `.public-theme`, `.font-display`, `.font-romance`, and `.font-number` declarations in `globals.css`.

- [ ] **Step 4: Apply classes on homepage semantic text**

Use body font on the public shell, display font for section/card titles, romance font for anniversary poetry and the bottom quote, and number font for numeric counters.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/home-copy.test.ts`

Expected: PASS.

### Task 4: Focused And Full Verification

**Files:**
- No new files.

- [ ] **Step 1: Generate Prisma client**

Run: `pnpm db:generate`

Expected: PASS.

- [ ] **Step 2: Run focused tests**

Run:

```bash
pnpm vitest run tests/unit/admin-settings.test.ts tests/integration/admin-actions.test.ts tests/unit/home-copy.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run lint and build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: PASS unless blocked by pre-existing workspace changes; record exact output if blocked.
