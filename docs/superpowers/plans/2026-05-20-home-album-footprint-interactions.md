# Home Album Footprint Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live anniversary seconds, homepage album taken-time labels, footprint animation replay, and footprint large-image preview.

**Architecture:** Keep the server-rendered homepage intact and isolate live time into one client component. Keep footprint image-preview state in `FootprintMapShowcase` so closing the detail panel also closes the centered preview.

**Tech Stack:** Next.js App Router, React client components, Tailwind classes, existing AMap integration.

---

### Task 1: Homepage Anniversary And Album Preview

**Files:**
- Create: `src/components/public/home-clock-cards.tsx`
- Modify: `src/app/page.tsx`

- [ ] Add `HomeClockCards` with `useEffect` and a one-second interval.
- [ ] Replace the anniversary panel's static `new Date()` time cards with `HomeClockCards`.
- [ ] Overlay `takenAt` on album preview tiles using the existing album item data.

### Task 2: Footprint Replay And Large Image

**Files:**
- Modify: `src/components/public/footprint-map-showcase.tsx`
- Modify: `src/components/public/footprint-detail-panel.tsx`
- Modify: `src/app/globals.css`

- [ ] Add replay logic that cancels the current animation, resets reveal state, and recenters the map.
- [ ] Add a replay button below the existing skip button.
- [ ] Make detail-panel thumbnails buttons and send the selected image to the parent.
- [ ] Render and style the centered large image overlay; clear it on detail close.

### Task 3: Verification

**Files:**
- No production files.

- [ ] Run `pnpm lint`.
- [ ] Run focused unit tests for public home and footprint code.
