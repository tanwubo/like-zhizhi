# Footprint Map Showcase Design

## Context

The current footprint module stores places and visits, but the public `/footprints` page is still a simple card list. The new goal is to turn it into a romantic interactive travel map: a bright AMap-powered China map that lights up cities in order, shows a small photo cluster above each city, and opens grouped memories when a visitor clicks a city or photo.

Existing footprint data does not need compatibility. The implementation may clear old `FootprintPlace` and `FootprintVisit` records during migration and rebuild seed data against the new model.

## Goals

- Show an interactive China travel map on `/footprints`.
- Use AMap JSAPI v2.0 for the map and admin location search.
- Keep the first release in a bright visual style only.
- Treat the map node as a city-level footprint.
- Support multiple memory records under one city.
- Let admins choose locations through AMap search, with manual coordinate edits as fallback.
- Let each memory bind multiple media-center images, ordered for display.
- Auto-play the city lighting sequence on first entry, with a skip option.
- Preserve a romantic couple-oriented presentation instead of a pure POI tool.

## Non-Goals

- No dark mode in the first release.
- No real traffic route planning through AMap Driving, Walking, Riding, or Transfer services.
- No old footprint data migration or compatibility layer.
- No deletion of original media files when removing footprint memories or image bindings.
- No separate admin navigation section for city and memory management.

## Data Model

### FootprintPlace

`FootprintPlace` becomes the city node rendered on the map.

Fields:

- `id`
- `name`: city display name, such as `长沙`.
- `description`: optional city intro.
- `latitude`: city map latitude.
- `longitude`: city map longitude.
- `amapAdcode`: optional AMap administrative code.
- `amapCityCode`: optional AMap city code.
- `coverUrl`: optional city cover image.
- `sortOrder`: required integer controlling map lighting order and route order.
- `enabled`: boolean controlling public visibility.
- `createdAt`
- `updatedAt`
- `memories`: relation to `FootprintMemory`.

Ordering:

- Admin and public city lists use `sortOrder asc`, then `updatedAt desc` as a stable fallback.

### FootprintMemory

`FootprintMemory` represents one concrete romantic memory under a city.

Fields:

- `id`
- `placeId`
- `locationName`: concrete place name, such as `橘子洲`.
- `address`: optional detailed address from AMap.
- `amapPoiId`: optional AMap POI id.
- `latitude`: optional concrete location latitude.
- `longitude`: optional concrete location longitude.
- `visitedAt`: memorial date.
- `mood`: short one-line romantic text, such as `那天江边的风刚刚好`.
- `story`: longer memory text.
- `sortOrder`: optional manual order inside the city.
- `createdAt`
- `updatedAt`
- `place`: relation to `FootprintPlace`.
- `images`: relation to `FootprintMemoryImage`.

Memory display ordering:

- Default: `visitedAt desc`.
- If `sortOrder` is set, use `sortOrder asc`, then `visitedAt desc`.

### FootprintMemoryImage

`FootprintMemoryImage` binds media-center images to one memory.

Fields:

- `id`
- `memoryId`
- `mediaAssetId`
- `sortOrder`
- `caption`: optional image caption.
- `createdAt`
- `memory`: relation to `FootprintMemory`.
- `mediaAsset`: relation to existing media asset model.

Rules:

- Deleting a city deletes its memories and image bindings.
- Deleting a memory deletes its image bindings.
- Deleting image bindings never deletes the original media asset.
- A memory may have any number of images, but the admin UI should encourage at least 4 for good map thumbnails.

## Admin Experience

The existing admin entry remains `足迹管理`.

### City List

The list page shows city nodes rather than raw visits:

- City name.
- Sort order.
- Enabled status.
- City coordinates.
- Memory count.
- Image count.
- Latest memory date and mood.
- Actions: edit city, manage memories, delete city.

The list is sorted by `sortOrder asc`.

### Create And Edit City

The city form includes:

- AMap search input.
- City name.
- City latitude and longitude.
- AMap adcode and citycode hidden or advanced fields.
- Sort order.
- Enabled toggle.
- Optional city intro.
- Optional cover image.

AMap search behavior:

- Admin can type a city or concrete POI, such as `长沙`, `橘子洲`, or `上海外滩`.
- The form uses `AMap.AutoComplete` for input suggestions.
- The form uses `AMap.PlaceSearch` to resolve the selected result.
- Choosing a result fills city name, concrete location name, address, longitude, latitude, adcode, citycode, and poi id when available.
- Coordinates remain editable so admins can correct inaccurate search results.
- If AMap is not configured, the form still allows manual input.

### Memory Management

The city edit page also manages memories under that city.

Each memory includes:

- Concrete location name.
- Address.
- Memorial date.
- One-line mood.
- Story text.
- Optional concrete location coordinates.
- Image bindings.
- Optional sort order.

Image controls:

- Select multiple images from the existing media center.
- Upload new photos inside the footprint form.
- Newly uploaded photos are saved into the media center and immediately selected for the memory.
- Selected images can be reordered.
- Selected images can be removed from the memory without deleting media assets.

The first implementation can keep city creation focused: save the city first, then add memories from the edit page. This avoids an overly large create form.

## Public Footprint Page

`/footprints` becomes an interactive AMap page in a bright style.

Layout:

- Reuse the public shell and current public navigation.
- Main content is a large map area focused on China.
- A journey order panel lists `第 1 站`, `第 2 站`, and so on.
- A small summary shows how many cities have been lit.
- City detail opens as a right-side panel on desktop and a bottom drawer on mobile.

Map rendering:

- Render only enabled `FootprintPlace` records.
- Render each city with a custom DOM `AMap.Marker`.
- Marker content includes city order, city name, and a romantic active state.
- Each city marker displays up to 4 thumbnail images above or near the marker.
- Thumbnail images are selected from that city's memories, respecting memory and image ordering.
- Hovering over a thumbnail slightly enlarges it and raises its z-index.
- Clicking a city marker or thumbnail opens the city detail panel.

Route rendering:

- Route order follows `FootprintPlace.sortOrder`.
- The first release draws stylized connections between cities, not real travel routes.
- Use `AMap.Polyline` with dashed styling for stable implementation.
- If a softer arc is needed, use `AMap.BezierCurve` after confirming path behavior in the implementation spike.

Auto-play:

- On first page entry, cities light up in `sortOrder` sequence.
- The active city marker glows.
- The route segment to the active city appears with the sequence.
- The active city's thumbnail group appears as the city lights up.
- A visible `跳过动画` action immediately reveals all cities and routes.
- Clicking any city or thumbnail also ends autoplay and opens the selected city.
- After autoplay finishes or is skipped, all cities remain interactive.

City detail panel:

- Title: city name.
- Subtitle: `第 N 站 · YYYY.MM.DD 首次点亮`.
- City intro if configured.
- Memories grouped by record:
  - `YYYY.MM.DD · locationName`
  - Mood line.
  - Story.
  - Image grid for that memory.
- Controls for previous city and next city.

Fallbacks:

- If no AMap key is configured, the page must not crash. Show a clear configuration-empty state and optionally a non-map list of enabled cities.
- If AMap fails to load, show the same graceful fallback.
- If there are no enabled cities, show the existing empty-state style.

## AMap JSAPI Integration

The implementation must follow the local `amap-jsapi-skill` guidance.

Use:

- `@amap/amap-jsapi-loader`.
- JSAPI version `2.0`.
- `window._AMapSecurityConfig` before calling `AMapLoader.load`.
- `AMap.getConfig().appname = "amap-jsapi-skill";` as the first statement in the `AMapLoader.load().then((AMap) => { ... })` callback.
- `map.destroy()` during React component cleanup.

Environment:

- `NEXT_PUBLIC_AMAP_JSAPI_KEY`: browser-side Web JSAPI key.
- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`: development-only browser security code.
- `NEXT_PUBLIC_AMAP_SERVICE_HOST`: production proxy endpoint for AMap service calls.
- `AMAP_SECURITY_JS_CODE`: server-side security code used by the production proxy.

Security:

- Development may use a browser-exposed security code for convenience.
- Production should use `serviceHost` proxy mode so the security code is not shipped to the browser.
- Documentation should explain the required AMap console setup.

Plugins:

- Admin search: `AMap.AutoComplete`, `AMap.PlaceSearch`.
- Public map controls: keep minimal, likely `AMap.Scale`.
- Route planning plugins are intentionally excluded.

Map style:

- Bright mode only.
- Prefer `amap://styles/light` for the first implementation.
- Fall back to `amap://styles/normal` if visual contrast or label legibility is better in testing.

## Implementation Batches

### Batch 1: Admin Data And Management

Scope:

- Update Prisma schema.
- Add migration that clears old footprint data and creates the new model shape.
- Update Prisma seed with example city memories.
- Update admin data queries and actions.
- Replace the existing footprint form with city and memory management UI.
- Add AMap search to the admin city form.
- Add multi-image selection and in-form upload for memories.
- Keep public `/footprints` functional, even if still rendered as a simple list during this batch.

Verification:

- Prisma migration applies cleanly.
- Seed creates example city nodes and memories.
- Admin can create a city.
- Admin can edit city order, coordinates, and enabled status.
- Admin can add, edit, and delete memories.
- Admin can attach, reorder, and remove memory photos.
- Deleting memories or cities does not delete media assets.
- `pnpm lint`.
- Focused unit or integration tests for validation and server actions.
- Admin smoke coverage for creating a city and adding one memory.

### Batch 2: Public Interactive Map

Scope:

- Add a reusable AMap loader helper for React client components.
- Add public footprint map component.
- Render city markers, photo thumbnails, route lines, autoplay, skip action, and detail panel.
- Add fallback UI for missing or failed AMap configuration.
- Tune mobile drawer behavior.

Verification:

- Without AMap env vars, `/footprints` shows fallback and does not crash.
- With AMap env vars, the map loads.
- Component cleanup destroys the map instance.
- Cities light up in sort order.
- Skip action reveals all cities.
- Clicking a marker or thumbnail opens detail.
- Detail panel groups memories by record and shows photos.
- Mobile viewport keeps the map and drawer usable.
- `pnpm lint`.
- Focused tests for public data shaping.
- Playwright smoke test for `/footprints` fallback behavior; live AMap rendering can be manually verified because it depends on external credentials.

## Open Decisions

- Whether the production AMap proxy should be implemented inside Next.js or through deployment-layer Nginx.
- Whether city node coordinates should always use the selected POI coordinate or allow admins to choose a separate city-center coordinate from the same search result.
- Whether the city thumbnail source should favor newest memories, earliest memories, or manually sorted memories. The default for implementation is manual sort first, then newest.

## Spec Review

- No old data compatibility is required.
- City-level map nodes and memory-level records are separated.
- AMap usage follows the local JSAPI skill constraints.
- Scope is split into an admin-data batch and a public-map batch.
- Fallback behavior is explicit for missing map configuration.
