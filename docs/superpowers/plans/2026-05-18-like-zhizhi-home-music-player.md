# Like Zhizhi Home Music Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a left-bottom floating music player on the public home page, using admin-managed music tracks.

**Architecture:** Reuse the existing `MusicTrack` admin model and expose a focused public home music query. Render a client-only floating player on the home page; use an open-source audio player component for core controls and keep playlist behavior in a thin local wrapper.

**Tech Stack:** Next.js App Router, React client component, Prisma `MusicTrack`, `react-h5-audio-player`, Vitest.

---

## File Structure

- Reuse: `src/features/public/public-content.ts#getEnabledMusicTracks` for enabled public music query.
- Reuse: `tests/unit/public-content.test.ts` for enabled-only ordering and select shape.
- Create: `src/components/public/floating-music-player.tsx` for the left-bottom floating player.
- Modify: `src/features/home/home-data.ts` to include `musicTracks`.
- Modify: `src/app/page.tsx` to render the player when tracks exist.
- Modify: `package.json` and `pnpm-lock.yaml` to add `react-h5-audio-player`.

### Task 1: Home Music Data

- [x] Reuse `getEnabledMusicTracks()` with enabled-only filtering, stable ordering, and narrow select fields.
- [x] Run `tests/unit/public-content.test.ts`; verify the existing query contract.
- [x] Add the query to `getHomeData()` and return `musicTracks`.

### Task 2: Floating Player UI

- [x] Install `react-h5-audio-player`.
- [x] Create `FloatingMusicPlayer` as a client component using user-click playback only.
- [x] Add playlist controls, compact metadata, cover fallback, collapse toggle, and end-of-track next behavior.
- [x] Render it from the home page only when `data.musicTracks.length > 0`.

### Task 3: Verification

- [x] Run targeted unit tests.
- [x] Run lint/build checks that cover TypeScript and the new dependency.
- [x] Smoke test the local home page when the dev server is available.
