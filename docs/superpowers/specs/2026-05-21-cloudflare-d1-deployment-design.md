# Cloudflare D1 Deployment Design

Date: 2026-05-21
Branch: `feature/cloudflare-deployment`

## Goal

Move Like Zhizhi from the current Linux server deployment model to a Cloudflare-native deployment:

- Next.js application and backend routes run on Cloudflare Workers through the OpenNext Cloudflare adapter.
- Static application assets are served by Cloudflare Workers Static Assets.
- Application data moves from PostgreSQL to Cloudflare D1.
- Uploaded media moves to Cloudflare R2.
- Existing local development remains usable while Cloudflare preview/deploy commands are added.

This design treats Cloudflare D1 as an explicit database migration, not a small deployment-config change.

## Current State

The current production guide targets Ubuntu, Node.js 22, PostgreSQL, Nginx, PM2, and S3-compatible object storage.

The app currently uses:

- Next.js 15 App Router with dynamic pages, route handlers, and Server Actions.
- Prisma Client with a PostgreSQL datasource.
- `src/server/db/prisma.ts` as the shared Prisma entry point.
- `src/server/storage/s3-storage.ts` as the shared S3-compatible storage adapter.
- `/api/media/[...key]` to proxy stored objects when no public storage base URL is configured.
- `@db.Decimal(10, 7)` for footprint coordinates.

There are no current `$transaction` usages in the application code. That lowers D1 migration risk because Prisma's D1 adapter does not provide normal transaction guarantees.

## Platform Direction

### Application Runtime

Use Cloudflare Workers with `@opennextjs/cloudflare`.

Required project changes:

- Add OpenNext and Wrangler dev dependencies.
- Add Cloudflare build, preview, deploy, and D1 migration scripts.
- Add `wrangler.jsonc` with:
  - Worker entry at `.open-next/worker.js`.
  - Static assets directory at `.open-next/assets`.
  - `nodejs_compat` compatibility flag.
  - D1 binding named `DB`.
  - R2 binding named `MEDIA_BUCKET`.

The existing `pnpm dev` path remains a normal Next.js development server. Cloudflare parity is verified with Wrangler preview.

### Database

Use Cloudflare D1 as the production database.

Prisma changes:

- Change `prisma/schema.prisma` datasource provider from `postgresql` to `sqlite`.
- Add `@prisma/adapter-d1`.
- Update the Prisma client entry point so Cloudflare Workers instantiate Prisma with the D1 binding.
- Keep a local non-Cloudflare fallback for tests and normal Next development.

Schema changes:

- Remove PostgreSQL-specific native types such as `@db.Decimal(10, 7)`.
- Represent footprint coordinates with SQLite-compatible fields.
- Preserve logical indexes, unique constraints, relation behavior, and cascade/null-delete intent.

Migration workflow:

- Keep Prisma schema as the source model.
- Generate SQL migration output for D1 with Prisma diff tooling.
- Apply migrations through `wrangler d1 migrations apply`.
- Do not rely on `prisma migrate deploy` for Cloudflare production.

### Storage

Use Cloudflare R2 as the primary media store.

Storage changes:

- Add an R2 storage adapter that uses the Worker binding rather than S3 credentials.
- Keep the existing S3 adapter available for non-Cloudflare deployments and local compatibility.
- Add a storage factory that chooses R2 when `MEDIA_BUCKET` is available and falls back to S3 otherwise.
- Remove the hard `runtime = "nodejs"` from `/api/media/[...key]` and make media reads compatible with Workers.

Public media URL behavior:

- Prefer `NEXT_PUBLIC_STORAGE_PUBLIC_URL` when configured.
- If no public storage base URL is configured, continue to serve media through `/api/media`.
- Production Cloudflare docs should recommend either an R2 public/custom domain or the app-hosted `/api/media` route, depending on whether direct public media access is desired.

## Data Migration

This design does not automatically copy an existing PostgreSQL production database into D1 during application startup.

The implementation should include operator documentation for:

- Creating the D1 database.
- Applying schema migrations.
- Seeding a fresh deployment.
- Exporting existing PostgreSQL data separately if needed.
- Importing cleaned SQLite/D1-compatible data through Wrangler or a dedicated one-off script.

Fresh Cloudflare deployment can use the existing seed workflow after the D1-compatible Prisma client is generated.

## Code Impact

Expected code changes:

- `package.json`
  - Add Cloudflare scripts and dependencies.
- `wrangler.jsonc`
  - Add Worker, D1, R2, assets, and compatibility config.
- `prisma/schema.prisma`
  - Convert datasource and unsupported native field annotations.
- `src/server/db/prisma.ts`
  - Support D1 adapter in Cloudflare runtime.
- `src/server/storage/*`
  - Add R2 adapter and storage selection.
- `src/app/api/media/[...key]/route.ts`
  - Make object read responses Worker-compatible.
- `docs/development/*`
  - Add Cloudflare deployment guide.
- Tests
  - Add or update unit coverage for storage selection, R2 object URL handling, and schema-sensitive coordinate behavior.

## Risk Management

Primary risks:

- D1 is SQLite-based, so PostgreSQL-native schema assumptions must be removed.
- Prisma D1 support is preview-level and transaction guarantees differ from PostgreSQL.
- Cloudflare Workers runtime is not a normal Node.js runtime; runtime-only Node APIs must be avoided in request paths.
- R2 public URL behavior depends on whether the project uses a public bucket/custom domain or app-proxied media.

Mitigations:

- Keep the first migration focused on platform compatibility and preserve business behavior.
- Avoid adding new transactional workflows in the same branch.
- Verify with both normal Next build/tests and Cloudflare preview.
- Keep the existing Linux deployment docs instead of replacing them, so rollback remains understandable.

## Verification Plan

Local verification:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Cloudflare verification:

- Create a local D1 database through Wrangler.
- Apply D1 migrations locally.
- Run the app with the Cloudflare preview command.
- Confirm:
  - Home page renders.
  - Login works.
  - Admin dashboard loads.
  - A media upload writes to the configured storage adapter.
  - Uploaded media can be opened through the expected public URL or `/api/media` proxy.

Production operator verification:

- Create D1 and R2 resources.
- Configure Wrangler bindings and secrets.
- Apply remote D1 migrations.
- Deploy the Worker.
- Open the public site, `/login`, `/sitemap.xml`, and `/robots.txt`.
- Log in as the seeded owner.
- Upload one media asset and open it directly.

## Out Of Scope

- Rewriting the application from Prisma to another ORM.
- Replacing all Server Actions with REST endpoints.
- Building automated PostgreSQL-to-D1 production data migration in the request path.
- Changing product features or admin workflows unrelated to Cloudflare compatibility.
- Removing the existing Linux/PM2 deployment path.
