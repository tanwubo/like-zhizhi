# Like Zhizhi Full Rebuild Design

Date: 2026-05-15

## Goal

Build a complete Pro-like couple website product from scratch in `C:\developer\code\personal\like-zhizhi`.

The existing open-source LikeGirl PHP project at `C:\developer\code\github\LikeGirl` is only a functional reference. The new project does not need to preserve its PHP structure, database schema, file layout, or migration compatibility.

## Confirmed Decisions

- Scope: full product rebuild, delivered in phases.
- Target directory: `C:\developer\code\personal\like-zhizhi`.
- Data compatibility: no compatibility or migration requirement.
- Deployment shape: Docker Compose.
- Technology stack: Next.js full-stack monolith with TypeScript, Prisma, PostgreSQL, MinIO, and Docker Compose.
- Recommended UI direction: modern Pro-like visual system inspired by the target site, without copying proprietary source code.

## Product Boundary

### Public Site

The public site includes these pages and features:

- Home: couple profiles, hero section, together timer, weather/distance widgets, map entry, statistics cards, latest content aggregation, Love Day preview, music player.
- Notes: timeline/feed for articles and daily memories, with rich text, media, author, mood, weather, location, views, and reactions.
- Messages: public message wall, anonymous or QQ-style messages, replies, moderation state, location/device display, random blessing text.
- Footprints: map-based places, visits, location records, distance display, and place detail cards.
- Album: image/video album, date, location, author, captions, detail view, and lightbox-style viewing.
- Checklist: plans and wishes, completion state, date, location, image, and progress summary.
- About: couple profile, site story, custom introduction content.
- Love Day: anniversaries, countdowns, elapsed-day events, lunar-calendar display, and yearly recurring events.
- Global features: responsive navigation, module switches, visitor statistics, theme configuration, immersive music prompt, and footer compliance links.

### Admin Console

The admin console includes:

- Dashboard: content totals, visit stats, latest activity, and quick actions.
- Site settings: title, slogan, footer, SEO metadata, compliance links.
- People profiles: two protagonist profiles, avatars, names, birthdays, location metadata.
- Theme settings: colors, background media, layout flags, visual toggles.
- Module settings: enable/disable public modules.
- Notes management: CRUD, rich text, media, publishing state.
- Message management: moderation, replies, delete/hide, visitor metadata.
- Footprint management: places, coordinates, visit records, map metadata.
- Album management: upload, captions, author, date, location, visibility.
- Checklist management: CRUD, completion state, images, location/date.
- Love Day management: event type, start/target date, yearly recurrence, lunar flag.
- Music management: tracks, playlists, cover, source type, sort order.
- Integrations: map, weather, email, object storage, optional music provider settings.
- Users and roles: user CRUD and role assignment.

## Architecture

Use a full-stack Next.js monolith:

- App framework: Next.js App Router.
- Language: TypeScript.
- Styling: Tailwind CSS plus a small local component system, with shadcn-style composition where useful.
- ORM: Prisma.
- Database: PostgreSQL.
- Object storage: MinIO, S3-compatible.
- Auth: credentials-based admin authentication initially, structured so Auth.js can be adopted if useful.
- Deployment: Docker Compose with at least `web`, `postgres`, and `minio` services.

This architecture keeps product delivery fast while still supporting full admin, API routes, server rendering, image handling, and Docker deployment.

## Data Model

The database is designed from scratch around product domains.

Core tables:

- `User`, `Session`, `Account`: admin users and login sessions.
- `PersonProfile`: the two main people shown on the site.
- `SiteSetting`: global site identity and copy.
- `ThemeSetting`: visual configuration.
- `ModuleSetting`: feature visibility and module-level switches.
- `MediaAsset`: central media registry backed by MinIO.
- `Note`: note/article content.
- `NoteMedia`: media attached to notes.
- `NoteReaction`: views, likes, or reaction events for notes.
- `Message`: public visitor messages.
- `MessageReply`: nested or admin replies to messages.
- `AlbumItem`: album entries linked to media assets.
- `ChecklistItem`: plans, wishes, and completion state.
- `FootprintPlace`: map places and coordinates.
- `FootprintVisit`: visits or records tied to footprint places.
- `LoveDayEvent`: anniversaries, countdowns, and elapsed-day events.
- `MusicTrack`: individual music tracks.
- `Playlist`: playlist grouping and ordering.
- `VisitEvent`: raw visitor event log.
- `DailyStat`: aggregated daily statistics for dashboard and home cards.
- `IntegrationCredential`: third-party integration configuration and encrypted secrets.

Important rules:

- Media is centralized through `MediaAsset`; business tables reference media rather than storing upload details repeatedly.
- Module visibility is data-driven through `ModuleSetting`.
- Visit analytics keep raw events and aggregated daily stats.
- Sensitive integration values are encrypted in the database, with environment variables as deployment fallback.

## Roles And Permissions

Roles:

- `OWNER`: full access to users, settings, integrations, content, and deployment-sensitive configuration.
- `PARTNER`: daily content management, profile management, theme and module management where safe.
- `MODERATOR`: message moderation and visitor content handling.
- `VISITOR`: public access and public interactions only.

Permission checks should be enforced server-side for all admin routes and mutations.

## Routing

Public routes:

- `/`
- `/notes`
- `/notes/[slug]`
- `/messages`
- `/footprints`
- `/album`
- `/album/[id]`
- `/checklist`
- `/about`

Admin routes:

- `/admin`
- `/admin/content/notes`
- `/admin/content/messages`
- `/admin/content/footprints`
- `/admin/content/album`
- `/admin/content/checklist`
- `/admin/content/love-days`
- `/admin/content/music`
- `/admin/settings/site`
- `/admin/settings/people`
- `/admin/settings/theme`
- `/admin/settings/modules`
- `/admin/integrations`
- `/admin/users`

API and server actions should be colocated with these routes where practical, while shared data access belongs in dedicated library modules.

## Delivery Phases

### Phase 1: Foundation

Create a runnable product skeleton:

- Scaffold Next.js, TypeScript, Tailwind, linting, formatting, and test tooling.
- Add Docker Compose for `web`, `postgres`, and `minio`.
- Add Prisma schema, migrations, and seed data.
- Add auth, roles, protected admin layout, and public layout.
- Add base component system and responsive shell.
- Add storage adapter for MinIO.
- Add basic scripts for dev, build, lint, test, migration, and seed.

Exit criteria:

- `docker compose up` starts the app and dependencies.
- Prisma migrations apply successfully.
- Seed data renders on at least the home page and admin dashboard.
- Admin login works.

### Phase 2: Public Pro-like Experience

Build the full public-facing experience using seed or database-backed data:

- Home page with hero, couple profiles, timer, stats, latest content, Love Day preview, and music shell.
- Public routes for notes, messages, footprints, album, checklist, and about.
- Responsive navigation and footer.
- Basic interactions: message submission, reaction/like where relevant, media viewing, checklist progress display.
- Visual system close to the target Pro-like experience while remaining original implementation.

Exit criteria:

- Every public route is implemented and responsive.
- Core public interactions work against the database.
- The site can be demonstrated without using the admin console for every content change.

### Phase 3: Admin Console

Make the product manageable:

- CRUD for notes, album, checklist, footprints, Love Day, music.
- Message moderation and replies.
- Site settings, people profiles, theme settings, module switches.
- Media upload and selection.
- Role-based admin navigation.

Exit criteria:

- Admin can manage all public modules.
- Uploaded media is stored in MinIO and rendered publicly.
- Module switches affect public navigation and content visibility.

### Phase 4: Integrations And Polish

Add external integrations and final product polish:

- AMap or compatible map provider for footprints and distance.
- Weather integration.
- Email notifications for messages/replies if configured.
- Visitor analytics aggregation.
- Immersive music behavior and playlist UI.
- SEO metadata, Open Graph, sitemap, robots.
- Performance tuning, loading/empty/error states.
- Deployment documentation.

Exit criteria:

- Third-party integrations degrade gracefully when disabled or unconfigured.
- Dashboard stats are reliable.
- Production Docker deployment is documented and repeatable.

## Error Handling

- Public pages show friendly empty states when modules have no data.
- Disabled integrations show fallback UI rather than failing the page.
- Upload failures surface actionable admin errors.
- Admin mutations return validation errors per field where possible.
- Visitor-submitted content is rate-limited and moderation-aware.

## Testing Strategy

- Unit tests for date calculations, Love Day recurrence, permission checks, and integration adapters.
- Component tests for core UI states where practical.
- Integration tests for content CRUD, message submission, auth, and media upload.
- End-to-end smoke tests for public navigation and admin login.
- Docker verification for local startup before each phase is considered complete.

## Open Implementation Notes

- Redis is not required in Phase 1. Add it only if rate limiting, queues, or analytics aggregation needs it.
- Auth.js is optional. Start with a simple, secure credentials flow if that keeps Phase 1 smaller.
- Third-party integrations should be adapter-based so unavailable API keys do not block local development.
- The first usable milestone should prioritize a convincing public site, then complete manageability in the admin console.
