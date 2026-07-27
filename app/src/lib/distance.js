// Distance math — identical to web/src/lib/distance.js (platform-agnostic).

const EARTH_RADIUS_M = 6378137;

function haversineMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Total length in meters of a path: [{lat, lng}, ...] */
export function pathLengthMeters(path) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineMeters(path[i - 1], path[i]);
  }
  return total;
}

/** Total length in meters across all segments of a route. */
export function routeLengthMeters(segments) {
  return segments.reduce((sum, seg) => sum + pathLengthMeters(seg), 0);
}

/** e.g. "3.42 mi" */
export function formatMiles(meters) {
  return `${(meters / 1609.344).toFixed(2)} mi`;
}

/** e.g. "5.50 km" */
export function formatKm(meters) {
  return `${(meters / 1000).toFixed(2)} km`;
}
