# Theme Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins configure primary color, background media, glass effect, and page animation for the public site.

**Architecture:** Reuse the existing `ThemeSetting` Prisma model and add a narrow admin update action plus one settings page. Public pages will pass the already-loaded theme data into `PublicShell`, which applies CSS variables and media layers with safe defaults.

**Tech Stack:** Next.js App Router, React server components, Prisma, Zod, Vitest, Playwright.

---

### Task 1: Theme Validation And Mutation

**Files:**
- Modify: `tests/integration/admin-actions.test.ts`
- Modify: `src/features/admin/settings-actions.ts`

- [x] **Step 1: Write the failing integration tests**

Add tests that call `validateThemeSettings()` and `updateThemeSettings()` with a valid primary color, optional background URLs, and boolean flags. Add a rejection case for an invalid color and invalid URL.

- [x] **Step 2: Run the focused tests and verify RED**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts`

Expected: FAIL because theme settings action helpers are not implemented or the Prisma mock is missing `themeSetting.update`.

- [x] **Step 3: Implement validation and update**

Add a Zod schema for `primaryColor`, `backgroundImageUrl`, `backgroundVideoUrl`, `enableGlassEffect`, and `enablePageAnimation`. Save valid values to `prisma.themeSetting.upsert()` with id `theme` and revalidate `/`, `/admin`, and `/admin/settings/theme`.

- [x] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm vitest run tests/integration/admin-actions.test.ts`

Expected: PASS.

### Task 2: Theme Data And Public Application

**Files:**
- Modify: `tests/unit/admin-settings.test.ts`
- Modify: `src/features/admin/settings-data.ts`
- Modify: `src/components/layout/public-shell.tsx`
- Modify: public route pages under `src/app`

- [x] **Step 1: Write the failing unit tests**

Add tests for `normalizeThemeSetting()` that prove missing theme data returns stable defaults and saved theme values are normalized for rendering.

- [x] **Step 2: Run focused unit tests and verify RED**

Run: `pnpm vitest run tests/unit/admin-settings.test.ts`

Expected: FAIL because `normalizeThemeSetting()` does not exist.

- [x] **Step 3: Implement theme normalization**

Return defaults for missing theme rows and expose the normalized theme from admin settings data.

- [x] **Step 4: Apply theme in public shell**

Add a `theme` prop to `PublicShell`. Use CSS variables for the primary color, optional image/video background layers, and class switches for glass/animation. Pass `publicData.theme` from public routes and `data.theme` from home data.

- [x] **Step 5: Run focused unit tests and verify GREEN**

Run: `pnpm vitest run tests/unit/admin-settings.test.ts`

Expected: PASS.

### Task 3: Theme Settings Page And E2E

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Create: `src/app/admin/settings/theme/page.tsx`

- [x] **Step 1: Write the failing E2E test**

Add a smoke test where the seed owner opens `/admin/settings/theme`, changes the primary color, saves, and sees the theme page again.

- [x] **Step 2: Run focused E2E and verify RED**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts`

Expected: FAIL because the route does not exist.

- [x] **Step 3: Implement the settings page**

Create a compact admin form for primary color, background image URL, background video URL, glass effect, and page animation. Use `updateThemeSettings` and `SubmitButton`.

- [x] **Step 4: Run focused E2E and verify GREEN**

Run: `pnpm test:e2e -- tests/e2e/smoke.spec.ts`

Expected: PASS.

### Task 4: Final Verification And Roadmap

**Files:**
- Modify: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-theme-settings.md`

- [x] **Step 1: Run full verification**

Run:
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

Expected: all commands exit 0.

- [x] **Step 2: Update roadmap**

Mark Theme settings Done, add the theme plan link, and append the latest verification log.

- [x] **Step 3: Commit and push**

Commit implementation and docs with narrow messages, then push `master`.
