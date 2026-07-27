import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/maps';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 }; // New York City
const LINE_COLOR = '#2563eb';

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
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const callbacksRef = useRef({ onMapClick, onMoveWaypoint, onRemoveWaypoint });
  callbacksRef.current = { onMapClick, onMoveWaypoint, onRemoveWaypoint };
  const [error, setError] = useState(null);

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || mapRef.current || !containerRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 13,
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
        label: { text: String(i + 1), color: 'white', fontSize: '11px' },
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

  // Re-draw polylines whenever segments change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = segments.map(
      (path) =>
        new window.google.maps.Polyline({
          path,
          map,
          geodesic: true,
          strokeColor: LINE_COLOR,
          strokeOpacity: 0.9,
          strokeWeight: 4,
        }),
    );
  }, [segments]);

  // Zoom to a route when one is loaded from the saved list.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusRoute || focusRoute.waypoints.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    focusRoute.waypoints.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds);
  }, [focusRoute]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-8">
          <p className="max-w-md text-center text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-xs text-gray-600 shadow">
        Click to add a point · Drag markers to adjust · Right-click a marker to remove it
      </div>
    </div>
  );
}
