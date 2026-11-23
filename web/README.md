# On Your Left — Running Route Planner (Web MVP)

Plan running routes on an interactive map: click to draw a route, watch the
distance update live, and save routes for later.

This is phase 1 of a larger project (mobile app with live GPS tracking comes
later), so the code is organized to keep map, state, and storage concerns
separate and portable.

## Features

- **Draw a route & see live distance**
  - Click the map to add waypoints, connected by a polyline
  - **Snap to roads** mode (default): segments follow roads/paths via the
    Routes API (walking profile)
  - **Free-form** mode: straight-line segments; switching modes recomputes
    the existing route
  - Live-updating total distance (miles + km) as points are added, removed,
    or dragged
  - Drag markers to adjust, right-click a marker to remove it, undo last
    point, or clear the whole route
- **Search & save routes**
  - Places search bar to find and center on any location/address
  - Runtime **API key** settings: use the deployment key or paste your own,
    which is stored in this browser
  - Night Run dark map style with a **Map / Satellite** layer toggle
  - Save routes (name, waypoints, full drawn path, distance, date) to
    browser `localStorage`
  - Saved-routes sidebar: click to reload a route on the map, or delete it

## Setup

```bash
npm install
cp .env.example .env   # optional: set a deployment key
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). If no
deployment key is configured, the app opens a setup dialog where you can
paste your own key.

### Getting a Google Maps API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create (or select) a project.
2. Enable billing for the project (Google provides a monthly free tier that
   comfortably covers personal use).
3. Under **APIs & Services → Library**, enable these three APIs:
   - **Maps JavaScript API**
   - **Routes API**
   - **Places API (New)**
4. Under **APIs & Services → Credentials**, create an API key.
5. (Recommended) Restrict the key: HTTP referrer restriction for
   `localhost:5173/*` during development, and limit it to the three APIs
   above.
6. Put the key in `.env`:

   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

Vite only exposes variables prefixed with `VITE_` to the frontend, and
`.env` is gitignored. A deployment key is still bundled into the frontend and
visible to users, so restrict it to your HTTP referrers and the required
APIs.

### Using your own key at runtime

The **API key** button in the sidebar opens the key dialog. If neither a
custom key nor a deployment key is available, the dialog opens automatically
and the map is gated until you add one.

- A custom key is saved in this browser's `localStorage` and overrides
  `VITE_GOOGLE_MAPS_API_KEY`.
- **Remove saved key** deletes the custom key and falls back to the
  deployment key, if one exists.
- Saving or removing a key reloads the page, which clears any unsaved route.
- The key is sent only to Google Maps Platform. Use the same Google Cloud
  setup and restrictions described above.

## Scripts

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the local dev server      |
| `npm run build`   | Production build into `dist/`   |
| `npm run preview` | Preview the production build    |

## Project structure

```
src/
├── App.jsx                    # Layout; wires builder state ↔ map ↔ sidebar
├── main.jsx
├── index.css                  # Tailwind entry
├── components/
│   ├── MapView.jsx            # Google Map: markers, polylines, click/drag events
│   ├── SearchBar.jsx          # Places autocomplete → pans the map
│   ├── ApiKeyDialog.jsx       # Runtime API key setup/edit dialog
│   ├── Sidebar.jsx            # Distance, mode toggle, actions, save form
│   └── SavedRouteList.jsx     # Saved routes: load / delete
├── hooks/
│   └── useRouteBuilder.js     # Core route state: waypoints + segments,
│                              #   add/move/remove/undo/clear, snap vs free-form
└── lib/
    ├── maps.js                # Loads the Google Maps JS API once
    ├── apiKey.js              # Custom key storage + env-key fallback
    ├── googleErrors.js        # Detects Google key/auth errors
    ├── mapStyle.js            # Night Run dark map palette
    ├── theme.js               # Shared Night Run colors for JS-rendered UI
    ├── directions.js          # Routes API (walking) → road-snapped path
    ├── distance.js            # Haversine distance + formatting
    └── routeStorage.js        # Save/load interface (localStorage for now)
```

### Route data model

A route is stored as:

- `waypoints`: the points the user placed (`[{lat, lng}, ...]`)
- `segments`: the drawn path between each pair of waypoints
  (`segments[i]` connects `waypoints[i]` → `waypoints[i+1]`)

Storing the full segment paths means reloading a saved route needs **zero**
API calls, and the shape is identical for road-snapped and free-form routes.

### Swapping storage for a backend later

All persistence goes through the four-function `routeStorage` interface in
`src/lib/routeStorage.js` (`list` / `save` / `remove`). Replace its internals
with API calls and no component code needs to change.

## Notes & limitations (MVP)

- Road snapping uses the **walking** travel mode; each added/dragged point in
  snap mode costs one Routes API request. Walking routes bill under Compute
  Routes Essentials (10,000 free requests/month at current pricing; billing
  must be enabled on the Google Cloud project).
- If a point can't be snapped (e.g. dropped in water), that segment falls
  back to a straight line and a warning is shown.
- A missing or rejected key disables the map; runtime key errors are shown
  with a shortcut to the **API key** settings.
- No accounts, no backend, no GPS/pace tracking, no PWA — by design.

## Roadmap

- Mobile app with live GPS pace tracking
- Real backend with user accounts and synced routes
