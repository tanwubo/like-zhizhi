# Like Zhizhi Master Roadmap

> This is the project-level control document. Update it whenever a phase or major task batch is completed, deferred, or re-scoped.

**Goal:** Track the full rebuild of the Like Zhizhi Pro-like product from foundation to production polish.

**Current branch policy:** Develop directly on `master`, as requested by the user. Do not use worktrees for this project unless the user changes this decision.

**Local environment policy:** Local development and e2e verification must not depend on Docker. Use the project-local ignored `.env` for direct PostgreSQL and Redis connections. Do not write secrets into tracked files.

**Reference source policy:** The downloaded LikeGirl community edition and the target Pro site are product references only. The new implementation can use a different technology stack, schema, UI composition, and internal architecture as long as final product functionality is complete.

---

## Source Documents

- Product design: `docs/superpowers/specs/2026-05-15-like-zhizhi-full-rebuild-design.md`
- Phase 1 plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-1-foundation.md`
- Phase 2 plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-2-public-experience.md`
- Phase 3 admin settings/message plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-admin-console.md`
- Phase 3 notes plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-notes-admin.md`
- Phase 3 album plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-album-admin.md`
- Phase 3 checklist plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-checklist-admin.md`
- Phase 3 footprint plan: `docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-footprint-admin.md`
- Phase 3 love days plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-love-days-admin.md`
- Phase 3 music plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-music-admin.md`
- Phase 3 theme settings plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-theme-settings.md`
- Phase 3 media center plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-media-center.md`
- Phase 3 integrations plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-integrations.md`
- Phase 3 users and roles plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-users-roles.md`
- Phase 4 analytics, SEO, and polish plan: `docs/superpowers/plans/2026-05-16-like-zhizhi-phase-4-analytics-seo-polish.md`

## Progress Snapshot

Last updated: 2026-05-16

| Area | Status | Notes |
| --- | --- | --- |
| Phase 1 foundation | Done | Next.js, Prisma/PostgreSQL, auth/session, admin shell, public shell, seed data, storage adapter, base tests. |
| Phase 2 public experience | Done | Public home, notes, messages, footprints, album, checklist, love days, about, navigation, public seed content. |
| Admin settings | Done | Site settings, people profiles, module switches. |
| Message moderation | Done | Admin moderation page and approve/hide actions. |
| Notes management | Done | Admin notes list, create, edit, delete, validation, public preview path. |
| Album management | Done | Admin album list, create, edit, delete, external media registration, public image/video rendering. |
| Checklist management | Done | Admin checklist list, create, edit, delete, validation, completion state, target date, optional image URL. |
| Footprint management | Done | Admin footprint list, create, edit, delete, coordinate validation, cover URL, paired visit create/update/delete. |
| Love Day management | Done | Admin love-day list, create, edit, delete, date validation, yearly/lunar flags, sort order. |
| Music management | Done | Track CRUD, admin list/create/edit/delete, and enabled public player data read model. |
| Theme settings | Done | Theme editor, validation, public CSS-variable theme application, background media, glass and animation flags. |
| Media center upload | Done | Admin media center, external media registration, storage upload action, metadata helpers, and reusable admin media selector. |
| Integrations | Done | Admin integration settings, encrypted secret storage, object-storage environment status, and graceful disabled-provider defaults. |
| Users and roles | Done | Owner-only user CRUD, password replacement, disable/enable flow, role-filtered navigation, and server-side mutation permission guards. |
| Analytics and polish | Done | Visit beacon/API, daily stats, dashboard analytics cards, SEO metadata, sitemap, robots, delete confirmations, loading/error states, deployment docs. |

## Standard Execution Loop

Every future batch should follow this loop:

1. Create or update a focused implementation plan under `docs/superpowers/plans/`.
2. Update this roadmap before implementation if scope or ordering changes.
3. Write failing tests first for new behavior.
4. Implement the minimal product slice needed to make the tests pass.
5. Run targeted verification for the changed area.
6. Commit the batch with a narrow message.
7. Run full verification:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
   - `pnpm test:e2e`
8. Update this roadmap with completed status, verification results, and any deferred items.
9. Commit the roadmap update.
10. Push `master`.

## Remaining Phase Plan

### Batch 1: Checklist Management

**Status:** Done on 2026-05-15.

**Goal:** Make the public checklist fully manageable from the admin console.

**Routes:**
- `/admin/content/checklist`
- `/admin/content/checklist/new`
- `/admin/content/checklist/[id]/edit`

**Scope:**
- List checklist items with title, completion state, status, target date, location, sort order, and actions.
- Create, edit, delete checklist items.
- Support completion toggle and `completedAt`.
- Support optional image URL until the media picker exists.
- Revalidate `/`, `/checklist`, `/admin`, and `/admin/content/checklist`.

**Tests:**
- Unit validation for required title and valid date/number fields.
- Integration tests for create/update/delete server actions.
- E2E test: seed owner creates a checklist draft and sees it in admin.

**Exit criteria:**
- Admin can manage checklist content without direct database edits.
- Public checklist continues rendering published items.
- Full verification passes.

### Batch 2: Footprint Management

**Status:** Done on 2026-05-15.

**Goal:** Make map/footprint places and visit records manageable.

**Routes:**
- `/admin/content/footprints`
- `/admin/content/footprints/new`
- `/admin/content/footprints/[id]/edit`

**Scope:**
- CRUD for `FootprintPlace`.
- Nested or paired CRUD for `FootprintVisit`.
- Validate latitude and longitude ranges.
- Support cover URL until media picker exists.
- Revalidate `/`, `/footprints`, `/admin`, and footprint admin routes.

**Tests:**
- Unit validation for coordinate bounds.
- Integration tests for place and visit mutations.
- E2E test: seed owner creates a footprint place and sees it in admin.

**Exit criteria:**
- Admin can manage places and visits.
- Public footprint page renders managed data.
- Full verification passes.

### Batch 3: Love Day Management

**Status:** Done on 2026-05-16.

**Goal:** Make anniversary/countdown events manageable.

**Routes:**
- `/admin/content/love-days`
- `/admin/content/love-days/new`
- `/admin/content/love-days/[id]/edit`

**Scope:**
- CRUD for `LoveDayEvent`.
- Manage title, description, date, yearly recurrence, lunar flag, and sort order.
- Preserve current public date calculation behavior.
- Revalidate `/`, `/love-days`, `/admin`, and love-day admin routes.

**Tests:**
- Unit tests for date validation and existing `formatLoveDay` behavior.
- Integration tests for create/update/delete actions.
- E2E test: seed owner creates a love-day event and sees it in admin.

**Exit criteria:**
- Admin can manage all Love Day events.
- Public Love Day page renders new/edited data.
- Full verification passes.

### Batch 4: Music Management

**Status:** Done on 2026-05-16.

**Goal:** Make music tracks manageable and prepare the public player.

**Routes:**
- `/admin/content/music`
- `/admin/content/music/new`
- `/admin/content/music/[id]/edit`

**Scope:**
- CRUD for `MusicTrack`.
- Manage title, artist, cover URL, source URL, source type, enabled state, and sort order.
- Add a public music data read model for enabled tracks.
- Keep playback UI minimal until theme/player polish batch.

**Tests:**
- Unit validation for title, artist, and valid source URL.
- Integration tests for create/update/delete actions.
- E2E test: seed owner creates a music track and sees it in admin.

**Exit criteria:**
- Admin can manage the music list.
- Public player data can be loaded from enabled tracks.
- Full verification passes.

### Batch 5: Theme Settings

**Status:** Done on 2026-05-16.

**Goal:** Let admin configure the visual theme used by the public site.

**Routes:**
- `/admin/settings/theme`

**Scope:**
- Edit primary color, background image URL, background video URL, glass effect flag, and page animation flag.
- Apply theme values through public layout or CSS variables.
- Keep defaults stable when theme settings are missing.

**Tests:**
- Unit validation for color and URL fields.
- Integration test for theme update action.
- E2E test: seed owner opens theme settings and saves a valid theme.

**Exit criteria:**
- Theme settings affect public rendering.
- Missing/invalid optional media values degrade safely.
- Full verification passes.

### Batch 6: Media Center And Real Uploads

**Status:** Done on 2026-05-16.

**Goal:** Replace external-media-only workflows with a reusable media center and object-storage upload path.

**Routes:**
- `/admin/media`

**Scope:**
- List media assets.
- Upload image/video/audio/file assets to S3-compatible storage.
- Store width/height where practical.
- Provide a reusable selector for notes, album, checklist, footprints, and theme backgrounds.
- Keep external URL registration as an escape hatch.

**Tests:**
- Unit tests for media metadata and storage key generation.
- Integration tests with mocked storage adapter.
- E2E test for media registration path. Binary upload e2e can remain mocked or deferred if storage is not available in local direct-db mode.

**Exit criteria:**
- Admin can create media assets without manual database edits.
- Object-storage upload works in configured environments.
- Full verification passes in local direct-db mode without requiring Docker.

**Notes:**
- Local e2e covers the external media registration path. Binary upload is covered through unit/integration tests with a mocked storage adapter so local direct-db verification does not require object storage.

### Batch 7: Integrations

**Status:** Done on 2026-05-16.

**Goal:** Add configurable third-party integration settings with graceful fallback.

**Routes:**
- `/admin/integrations`

**Scope:**
- Map provider settings.
- Weather provider settings.
- Email notification settings.
- Object storage settings display/health checks.
- Optional music provider settings.
- Store sensitive values safely; do not expose secrets in public rendering.

**Tests:**
- Unit tests for provider config validation.
- Integration tests for saving non-secret and secret-like fields.
- E2E test: owner can open and save integrations page.

**Exit criteria:**
- Disabled or unconfigured integrations do not break public pages.
- Configured integrations have clear admin feedback.
- Full verification passes.

**Notes:**
- Object storage secrets remain environment-driven; the admin page displays configuration health without persisting S3 credentials in the database.
- Provider secrets are encrypted before persistence and admin read models expose only configured/not-configured status.

### Batch 8: Users And Roles

**Status:** Done on 2026-05-16.

**Goal:** Make admin access manageable inside the product.

**Routes:**
- `/admin/users`
- `/admin/users/new`
- `/admin/users/[id]/edit`

**Scope:**
- User CRUD for owners/partners/moderators.
- Password reset or replacement flow.
- Disable or remove users safely.
- Refine admin navigation visibility by role.
- Ensure server-side mutations enforce permissions.

**Tests:**
- Unit tests for role capability checks.
- Integration tests for user create/update/disable actions.
- E2E test: owner can create a moderator.

**Exit criteria:**
- User access can be managed without seed scripts.
- Role restrictions are enforced server-side.
- Full verification passes.

**Notes:**
- Disabled users are blocked at both login and session read time; disabling an account clears its active sessions.
- User deletion is intentionally represented as disable/enable to avoid orphaning authored content while still removing access.
- Server-side admin mutations now use role capability guards: owners manage users/integrations, owners and partners manage content/settings, and moderators can only moderate messages.

### Batch 9: Analytics, SEO, And Product Polish

**Status:** Done on 2026-05-16.

**Goal:** Complete the product experience and production readiness.

**Scope:**
- Visitor event collection and daily stat aggregation.
- Admin dashboard stats refinement.
- SEO metadata, Open Graph, sitemap, robots.
- Loading, empty, and error states across public/admin pages.
- Delete confirmations and better admin validation feedback.
- Mobile layout pass.
- Deployment documentation aligned with actual environment choices.

**Tests:**
- Unit tests for stat aggregation.
- Integration tests for visit recording where applicable.
- E2E smoke pass across public and admin routes.

**Exit criteria:**
- Product feels complete for normal public browsing and admin operation.
- Production deployment instructions are repeatable.
- Full verification passes.

**Notes:**
- Public pages now send a non-blocking visit beacon to `/api/visits`; admin, API, framework asset, sitemap, and robots paths are ignored.
- `VisitEvent` stores raw visits and `DailyStat` tracks daily visit, unique visitor, message, and note counters.
- SEO metadata is generated from site settings; sitemap and robots use `APP_URL`.
- Admin content deletes now require browser confirmation before submitting.

## Roadmap Maintenance Rules

When a task batch is completed:

1. Change its status in `Progress Snapshot` from `Not started` to `Done`.
2. Add or update the corresponding phase plan link in `Source Documents`.
3. Record material deviations from this roadmap in the relevant batch section.
4. If a feature is intentionally deferred, state why and where it moved.
5. Add the latest full verification result with date and commands.
6. Commit the roadmap update in the same final batch commit or a separate `docs:` commit.

## Verification Log

### 2026-05-16

Latest verified state after analytics, SEO, and product polish:

- `pnpm lint`: passed.
- `pnpm test`: passed, 14 test files and 96 tests.
- `pnpm build`: passed, including `/api/visits`, `/robots.txt`, and `/sitemap.xml`.
- `pnpm test:e2e`: passed, 19 Playwright tests.

Latest verified state after users and roles:

- `pnpm lint`: passed.
- `pnpm test`: passed, 11 test files and 86 tests.
- `pnpm build`: passed, including `/admin/users`, `/admin/users/new`, and `/admin/users/[id]/edit`.
- `pnpm test:e2e`: passed, 17 Playwright tests.

Previous verified state after integrations:

- `pnpm lint`: passed.
- `pnpm test`: passed, 11 test files and 70 tests.
- `pnpm build`: passed, including `/admin/integrations`.
- `pnpm test:e2e`: passed, 16 Playwright tests.

Previous verified state after media center:

- `pnpm lint`: passed.
- `pnpm test`: passed, 10 test files and 62 tests.
- `pnpm build`: passed, including `/admin/media`.
- `pnpm test:e2e`: passed, 15 Playwright tests.

Latest verified state after theme settings:

- `pnpm lint`: passed.
- `pnpm test`: passed, 9 test files and 54 tests.
- `pnpm build`: passed, including `/admin/settings/theme`.
- `pnpm test:e2e`: passed, 14 Playwright tests.

Note: `pnpm build` and `pnpm test:e2e` must be run sequentially because both use `.next`; running them in parallel can corrupt the generated Next.js output.

Latest verified state after music management:

- `pnpm lint`: passed.
- `pnpm test`: passed, 9 test files and 50 tests.
- `pnpm build`: passed, including `/admin/content/music`, `/admin/content/music/new`, and `/admin/content/music/[id]/edit`.
- `pnpm test:e2e`: passed, 13 Playwright tests.

Previous verified state after love-day management:

- `pnpm lint`: passed.
- `pnpm test`: passed, 9 test files and 45 tests.
- `pnpm build`: passed, including `/admin/content/love-days`, `/admin/content/love-days/new`, and `/admin/content/love-days/[id]/edit`.
- `pnpm test:e2e`: passed, 12 Playwright tests.

### 2026-05-15

Latest verified state after footprint management:

- `pnpm lint`: passed.
- `pnpm test`: passed, 9 test files and 38 tests.
- `pnpm build`: passed, including `/admin/content/footprints`, `/admin/content/footprints/new`, and `/admin/content/footprints/[id]/edit`.
- `pnpm test:e2e`: passed, 11 Playwright tests.

Known non-blocking log output:

- Next.js dev server may print a future `allowedDevOrigins` warning during e2e.
- Playwright dev-server shutdown may print a non-blocking `ECONNRESET aborted` line after all e2e tests pass.
- A transient remote PostgreSQL connection error can appear in dev-server output when using the direct remote database, but the latest full e2e command exited 0 with all tests passing.
