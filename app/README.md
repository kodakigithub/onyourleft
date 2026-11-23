# On Your Left — Mobile App (Expo / React Native)

The mobile version of the running route planner, with the same features as
the web app: draw routes on a map, see live distance, snap to roads, search
places, and save/reload/delete routes.

Runs in **Expo Go** — no native build or Xcode/Android Studio required.

## Setup

```bash
npm install
cp .env.example .env   # optional: set a deployment key
npx expo start
```

Scan the QR code with the **Expo Go** app
([iOS](https://apps.apple.com/app/expo-go/id982107779) /
[Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
on the same network as your computer.

## API key

Route snapping and place search call the **Routes API** and
**Places API (New)** over HTTP. You can add a key in the app or provide a
deployment key through `.env`.

### Add a key in the app

Tap **API key** (top right) to open the key sheet. On launch, the sheet opens
automatically when neither a custom nor a deployment key is available.

- A custom key is stored only on this device with AsyncStorage.
- It overrides `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, if one is configured.
- **Remove saved key** deletes the custom key and falls back to the
  deployment key, if one exists.
- Keys apply immediately to new route and place requests; no reload is
  needed.
- Without a key, free-form drawing still works, but road snapping and place
  search show an error and a shortcut to the key sheet.

### Use a deployment key

Get a key from the
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)
and put it in `.env`:

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

`.env` is gitignored. Expo inlines `EXPO_PUBLIC_*` variables at bundle time,
so a deployment key is visible inside the app bundle. A custom key entered in
the app stays in local storage instead.

### Google Cloud setup

Enable these APIs and billing:

- **Routes API**
- **Places API (New)**

> [!IMPORTANT]
> Do **not** add HTTP-referrer or app restrictions in Expo Go — mobile
> requests send no referrer, and Expo Go's package/signature differ from
> your app's. Restrict the key to just these two APIs instead. (The web app
> uses a separate key with referrer restrictions; see `web/README.md`.)

No Maps SDK key is needed for the map itself in Expo Go: `react-native-maps`
uses Apple Maps on iOS and Google Maps on Android automatically. Android's
tiles come from Expo Go's embedded Google key, and iOS's from Apple Maps, so
your key only covers route snapping and place search. (A native key is only
needed if you later create a standalone build with Google Maps on iOS — see
the [Expo docs](https://docs.expo.dev/versions/latest/sdk/map-view/).)

## Usage

- **Tap** the map to add a waypoint — segments snap to roads (walking) by
  default, or switch to **Free-form** for straight lines. Switching modes
  recomputes the existing route.
- **Drag** a marker to adjust it; **tap a marker's callout** to remove it.
- **Undo point** / **Clear route** buttons; live distance in miles + km.
- **Map / Satellite** toggle (top right) switches between the Night Run dark
  map and satellite imagery.
- **API key** (top right) opens the key sheet to add, replace, or remove a
  custom Google Maps key.
- **Search bar** (top) finds a place and centers the map on it.
- **Routes button** opens the routes sheet: name and save the current
  route, tap a saved route to reload it on the map, or delete it.

## Project structure

```
App.js                        # Wires map ↔ controls ↔ search ↔ sheets
src/
├── components/
│   ├── RouteMap.jsx          # react-native-maps: markers, polylines, tap/drag
│   ├── RouteControls.jsx     # Distance, mode toggle, undo/clear
│   ├── SearchBar.jsx         # Places autocomplete → recenters the map
│   ├── ApiKeySheet.jsx       # Runtime API key setup/edit sheet
│   └── SavedRoutesSheet.jsx  # Save form + saved routes (load/delete)
├── hooks/
│   └── useRouteBuilder.js    # Route state: waypoints + segments (same model as web)
└── lib/
    ├── apiKey.js             # Custom key storage + env-key fallback
    ├── googleErrors.js       # Detects Google key/auth errors
    ├── mapStyle.js           # Night Run palette (Android Google Maps)
    ├── theme.js              # Shared Night Run UI colors
    ├── directions.js         # Routes HTTP API (walking) → snapped path
    ├── places.js             # Places API (New) HTTP autocomplete + details
    ├── polyline.js           # Google encoded-polyline decoder
    ├── distance.js           # Haversine distance + formatting (same as web)
    └── routeStorage.js       # Save/load interface over AsyncStorage
```

The route model (`waypoints` + `segments`) is identical to the web app, so
routes could be synced across platforms once a backend exists. All
persistence goes through the `routeStorage` interface in
`src/lib/routeStorage.js`.

## Notes & limitations

- Each added/dragged point in snap mode costs one Routes API request.
  Walking routes bill under Compute Routes Essentials (10,000 free requests per
  month at current pricing; billing must be enabled on the Google Cloud
  project).
- If a point can't be snapped (e.g. dropped in water), that segment falls
  back to a straight line and a warning is shown. Missing or rejected keys
  produce a key-specific warning with a shortcut to the key sheet.
- Map tiles come from Apple Maps (iOS) / Google Maps (Android) in Expo Go,
  but route snapping, search, and distance all use Google's APIs identically
  on both platforms. Custom keys are stored only on the device.
- The Night Run map styling is applied through Google Maps custom styling on
  Android. Expo Go on iOS uses Apple Maps, which ignores Google's custom style,
  so it shows Apple Maps in dark mode instead. Satellite works on both
  platforms.
- No accounts, no backend, no GPS/pace tracking — by design (see roadmap).
