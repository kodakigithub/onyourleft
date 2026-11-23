import { useEffect, useRef, useState } from 'react';
import { isApiKeyError } from '../lib/googleErrors';
import { loadGoogleMaps } from '../lib/maps';
import { NIGHT_MAP_STYLE } from '../lib/mapStyle';
import { COLORS } from '../lib/theme';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 }; // New York City
const MAP_TYPES = [
  { id: 'roadmap', label: 'Map' },
  { id: 'hybrid', label: 'Satellite' },
];
const MARKER_ICON = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42"><path d="M17 2C9.268 2 3 8.268 3 16c0 10.5 14 24 14 24s14-13.5 14-24C31 8.268 24.732 2 17 2Z" fill="#3DDC97" stroke="#0F1419" stroke-width="3"/></svg>',
)}`;

/**
 * The interactive map. Renders waypoints as draggable markers and segments
 * as polylines. Purely presentational — all route state lives in the
 * useRouteBuilder hook and flows in via props / out via callbacks.
 */
export default function MapView({
  waypoints,
  segments,
  focusRoute,
  onMapReady,
  onMapClick,
  onMoveWaypoint,
  onRemoveWaypoint,
  onOpenApiKey,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const callbacksRef = useRef({ onMapClick, onMoveWaypoint, onRemoveWaypoint });
  callbacksRef.current = { onMapClick, onMoveWaypoint, onRemoveWaypoint };
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const mapTypeRef = useRef('roadmap');

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;
    const handleAuthFailure = () => {
      if (!cancelled) {
        setError('Google Maps rejected the API key. Check the key restrictions and enabled APIs.');
      }
    };
    window.gm_authFailure = handleAuthFailure;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || mapRef.current || !containerRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 13,
          backgroundColor: COLORS.night,
          mapTypeId: mapTypeRef.current,
          styles: NIGHT_MAP_STYLE,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        map.addListener('click', (e) => {
          callbacksRef.current.onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
        mapRef.current = map;
        onMapReady?.(map);
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
      if (window.gm_authFailure === handleAuthFailure) {
        delete window.gm_authFailure;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-draw markers whenever waypoints change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = waypoints.map((pt, i) => {
      const marker = new window.google.maps.Marker({
        position: pt,
        map,
        draggable: true,
        icon: {
          url: MARKER_ICON,
          scaledSize: new window.google.maps.Size(34, 42),
          anchor: new window.google.maps.Point(17, 42),
          labelOrigin: new window.google.maps.Point(17, 16),
        },
        label: { text: String(i + 1), color: COLORS.night, fontSize: '12px', fontWeight: '700' },
        title: `Point ${i + 1} — drag to adjust, right-click to remove`,
      });
      marker.addListener('dragend', (e) => {
        callbacksRef.current.onMoveWaypoint(i, { lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
      marker.addListener('rightclick', () => {
        callbacksRef.current.onRemoveWaypoint(i);
      });
      return marker;
    });
  }, [waypoints]);

  // Re-draw the glow and core polylines whenever segments change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = segments.flatMap((path) => [
      new window.google.maps.Polyline({
        path,
        map,
        geodesic: true,
        strokeColor: COLORS.route,
        strokeOpacity: 0.22,
        strokeWeight: 12,
        zIndex: 1,
      }),
      new window.google.maps.Polyline({
        path,
        map,
        geodesic: true,
        strokeColor: COLORS.route,
        strokeOpacity: 0.95,
        strokeWeight: 4,
        zIndex: 2,
      }),
    ]);
  }, [segments]);

  // Zoom to a route when one is loaded from the saved list.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusRoute || focusRoute.waypoints.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    focusRoute.waypoints.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds);
  }, [focusRoute]);

  const changeMapType = (nextMapType) => {
    mapTypeRef.current = nextMapType;
    setMapType(nextMapType);
    mapRef.current?.setMapTypeId(nextMapType);
  };

  return (
    <div className="relative h-full w-full bg-night">
      <div ref={containerRef} className="h-full w-full" />
      {!error && (
        <div className="absolute right-3 top-3 z-10 flex overflow-hidden rounded-lg border border-line bg-surface/95 shadow-lg backdrop-blur">
          {MAP_TYPES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => changeMapType(id)}
              aria-pressed={mapType === id}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mapType === id
                  ? 'bg-primary text-night'
                  : 'text-ink hover:bg-elevated'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-night p-8">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium text-accent">{error}</p>
            <p className="mt-2 text-xs leading-5 text-muted">
              {isApiKeyError(error)
                ? 'Check that your API key has the Maps JavaScript API enabled, allows this site, and has billing enabled.'
                : 'Check your connection and reload the page to try again.'}
            </p>
            {isApiKeyError(error) && (
              <button
                type="button"
                onClick={onOpenApiKey}
                className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-night transition-colors hover:bg-primary/90"
              >
                API key settings
              </button>
            )}
          </div>
        </div>
      )}
      {!error && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface/90 px-4 py-1.5 text-xs text-muted shadow-lg backdrop-blur">
          Click to add a point · Drag markers to adjust · Right-click a marker to remove it
        </div>
      )}
    </div>
  );
}
