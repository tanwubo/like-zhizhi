# Font Role Settings Design

## Goal

Add an admin-managed font settings module for the public site without changing the admin console typography.

## Scope

- Add four public font roles: body, display, romance, and number.
- Configure these roles from the existing admin theme settings page.
- Keep font choices as curated presets in code so the library can be expanded by adding options in one place.
- Apply the roles semantically on the public homepage first: body copy, card titles, anniversary poetry, bottom quote, and numeric counters.
- Do not add per-module overrides or uploaded font files in this iteration.

## Data Model

Extend `ThemeSetting` with nullable string fields:

- `bodyFontKey`
- `displayFontKey`
- `romanceFontKey`
- `numberFontKey`

Missing or invalid keys normalize back to role defaults. This keeps old rows compatible and lets future font options be added without migrations.

## Font Library

Create a focused font option module with:

- one option list per role
- stable option keys for persistence
- labels for the admin UI
- CSS font stacks for public rendering

Future expansion should add a new option to this file first. A later custom-font feature can add uploaded `.woff2` assets and `@font-face` generation, but it is out of scope for this change.

## Public Rendering

`PublicShell` injects these CSS custom properties only on public pages:

- `--font-body`
- `--font-display`
- `--font-romance`
- `--font-number`

Global CSS maps public utility classes to those variables. The homepage uses those classes for semantic typography while keeping existing layout and visual structure.

## Admin UX

The existing `/admin/settings/theme` page gains a "字体设置" section with four selects. Each select shows role-appropriate choices. Saving uses the existing settings permission guard and theme upsert path.

## Verification

- Unit tests cover font option normalization and default fallback.
- Integration tests cover saving font keys through `updateThemeSettings`.
- A lightweight copy/style test checks that the homepage uses the public font role classes.
- Run focused tests first, then normal lint/build verification if the workspace allows it.
