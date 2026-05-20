# Home Album Footprint Interactions Design

## Goal

Update the public-facing homepage and footprint map interactions without changing existing admin data models or routes.

## Design

- The homepage anniversary panel keeps its existing layout and replaces the static hour/minute/second cards with a small client component that starts from the server-rendered time and refreshes once per second.
- The homepage album preview keeps the current four-tile grid and overlays each published item's `takenAt` value in the bottom-right corner when present.
- The footprint map keeps the existing AMap route animation. A new replay button resets the map to the first city and restarts the reveal animation.
- The footprint detail panel exposes image clicks to the parent map showcase. The parent renders one centered large-image overlay with a close button and clears it whenever the detail panel closes.

## Verification

- Run focused unit tests for public home/footprint behavior where available.
- Run lint to catch client/server component and TypeScript issues.
