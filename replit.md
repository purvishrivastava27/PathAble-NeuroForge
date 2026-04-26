# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the **BlindAssist** real-time
assistive-navigation web app plus a shared API server.

## Artifacts

- `artifacts/blindassist` — BlindAssist front-end (React + Vite, vanilla-style
  single-page app). Webcam obstacle detection, voice guidance, Google Maps
  navigation, emergency alert. Served at `/`.
- `artifacts/api-server` — Express API. Endpoints under `/api`:
  - `GET /api/healthz` — health check
  - `GET /api/config` — returns `{ googleMapsApiKey }` for the front-end
  - `POST /api/detect` — receives detection events (frame + objects + decision)
  - `POST /api/emergency` — receives `{ latitude, longitude, accuracy, ... }`
    and returns an alert ID + Google Maps link
- `artifacts/mockup-sandbox` — design canvas (unused by BlindAssist).

## BlindAssist key behavior

- Webcam via `getUserMedia` (rear camera preferred).
- Object detection runs **in the browser** with TensorFlow.js + COCO-SSD
  (`lite_mobilenet_v2`) loaded from CDN. Falls back to CPU backend if WebGL
  is unavailable.
- **Frame throttling**: detection runs at most once every **300 ms**
  (`FRAME_INTERVAL_MS`) using a timestamp gate plus an `inFlight` boolean
  flag — guarantees smooth UI with no stacked work.
- Each processed frame is also POSTed to `/api/detect` (fire-and-forget) for
  server-side logging.
- Decision logic (frontend, in `decideInstruction`):
  - Object center-zone & bbox-area ratio ≥ 28% → **STOP**
  - Object in CENTER → **Move Right**
  - Object in LEFT → **Move Right**
  - Object in RIGHT → **Move Left**
  - No object → **Move Forward**
- Voice via `speechSynthesis`, deduped to avoid repeating the same line within
  1.5 s.
- Geolocation via `navigator.geolocation.watchPosition` (high accuracy).
- Google Maps JS + Directions API draw a walking route from current location
  to the entered destination.
- Emergency button POSTs current coords to `/api/emergency` and opens
  `tel:911`.

## Required secrets

- `GOOGLE_MAPS_API_KEY` — Google Maps JavaScript API + Directions API.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Front-end**: React 19 + Vite 7 (used as a vanilla-style SPA)
- **ML**: TensorFlow.js + COCO-SSD (CDN)
- **Maps**: Google Maps JS API + Directions API

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/blindassist run dev` — run BlindAssist front-end

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and
package details.
