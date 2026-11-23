# On Your Left — Running Route Planner

Plan running routes on an interactive map: click/tap to draw a route, watch
the distance update live, and save routes for later.

This repo is a monorepo with two independent apps:

| Directory | App                                        | Docs                         |
| --------- | ------------------------------------------ | ---------------------------- |
| `web/`    | Desktop web app (React + Vite, Google Maps) | [web/README.md](web/README.md) |
| `app/`    | Mobile app (Expo / React Native)            | [app/README.md](app/README.md) |

Both apps share the same route data model and feature set:

- Draw routes by placing waypoints on a map, with live distance (mi + km)
- Snap segments to roads (walking) via the Routes API, or draw free-form
- Night Run dark map style with a Map / Satellite layer toggle
- Drag points to adjust, remove points, undo, clear
- Search for a place to center the map (Places API)
- Save / reload / delete named routes (local storage per platform, behind a
  small `routeStorage` interface that can later be swapped for a backend)

## Quick start

```bash
# Web
cd web && npm install && cp .env.example .env   # add your API key
npm run dev

# Mobile (requires Expo Go on your phone)
cd app && npm install && cp .env.example .env   # add your API key
npx expo start                                   # scan the QR code with Expo Go
```

Each app needs a Google Maps API key — see the per-app READMEs for exactly
which APIs to enable and how the keys must be restricted (they differ:
web uses HTTP-referrer restrictions, mobile must not).

## Roadmap

- Live GPS pace tracking in the mobile app
- Real backend with user accounts and synced routes across web + mobile
