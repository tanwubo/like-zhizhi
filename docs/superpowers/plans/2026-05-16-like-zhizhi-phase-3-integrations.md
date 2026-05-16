# Integrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin integrations page for map, weather, email, object storage, and optional music provider configuration with graceful fallback and secret-safe display.

**Architecture:** Store integration records in a dedicated `IntegrationSetting` table keyed by provider area. Non-secret options live in `config`, sensitive values live in encrypted `secrets`, and admin read models only expose whether a secret is configured. The public site will not read these settings in this batch.

**Tech Stack:** Next.js server actions, Prisma/PostgreSQL, Zod validation, Node `crypto`, Vitest, Playwright.

---

## File Structure

- Create `prisma/migrations/20260516000000_add_integration_settings/migration.sql` for the `IntegrationSetting` table.
- Modify `prisma/schema.prisma` to add the Prisma model.
- Create `src/features/admin/integration-utils.ts` for provider definitions, validation, normalization, encryption, and status helpers.
- Create `src/features/admin/integration-data.ts` for admin read models.
- Create `src/features/admin/integration-actions.ts` for save server actions.
- Create `src/app/admin/integrations/page.tsx` for the admin form and status cards.
- Modify `tests/unit/admin-integrations.test.ts` for validation, secret masking, and object-storage status.
- Modify `tests/integration/admin-actions.test.ts` for saving non-secret and secret-like fields.
- Modify `tests/e2e/smoke.spec.ts` for owner save flow.
- Modify `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md` after verification.

## Tasks

### Task 1: Tests First

- [x] Add unit tests for provider normalization, URL validation, secret preservation, and object-storage readiness.
- [x] Add integration action tests proving invalid provider URLs are rejected, map/weather/email/music settings are upserted, and blank secret inputs preserve existing encrypted secrets.
- [x] Add E2E coverage for opening `/admin/integrations`, saving disabled providers, and seeing clear admin feedback.
- [x] Run the targeted tests and confirm they fail because integration modules/routes do not exist yet.

### Task 2: Data Model

- [x] Add `IntegrationSetting` to `prisma/schema.prisma` with `key`, `enabled`, `provider`, `config`, `secrets`, and timestamps.
- [x] Add a SQL migration creating the table and unique key.
- [x] Keep all defaults application-side so existing databases can add rows lazily.

### Task 3: Validation And Secret Handling

- [x] Implement provider metadata and default records for `map`, `weather`, `email`, `storage`, and `music`.
- [x] Implement Zod-backed parsing that accepts disabled providers with sparse config and requires valid URLs/emails only when values are present.
- [x] Encrypt secret values before persistence with an authenticated cipher derived from `AUTH_SESSION_SECRET`.
- [x] Preserve existing secrets when admin submits blank secret fields.
- [x] Return admin read models with secret status flags and no decrypted values.

### Task 4: Admin UI And Actions

- [x] Implement `getAdminIntegrationSettings()` and `updateIntegrationSettings(formData)`.
- [x] Build `/admin/integrations` with provider cards, enable toggles, provider fields, secret inputs, object-storage environment summary, and a save button.
- [x] Revalidate `/admin` and `/admin/integrations` after save.

### Task 5: Verification And Roadmap

- [x] Run targeted unit/integration/E2E tests.
- [x] Run `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` sequentially.
- [x] Update the roadmap source docs, progress snapshot, Batch 7 status, and verification log.
- [ ] Commit and push `master`.
