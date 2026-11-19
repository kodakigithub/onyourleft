import { GOOGLE_MAPS_API_KEY, assertApiKey } from './config';
import { decodePolyline } from './polyline';

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const FIELD_MASK = 'routes.polyline.encodedPolyline,routes.legs.steps.polyline';

function toWaypoint(point) {
  return {
    location: {
      latLng: { latitude: point.lat, longitude: point.lng },
    },
  };
}

/** Steps share endpoints, so drop consecutive duplicates. */
function dedupeConsecutive(points) {
  return points.filter(
    (point, i) =>
      i === 0 || point.lat !== points[i - 1].lat || point.lng !== points[i - 1].lng,
  );
}

/**
 * Returns the walking path (array of {lat, lng}) between two points,
 * snapped to roads/paths via the Routes HTTP API.
 * Throws if no route is found.
 */
export async function getWalkingPath(from, to) {
  assertApiKey();

  const response = await fetch(ROUTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      origin: toWaypoint(from),
      destination: toWaypoint(to),
      travelMode: 'WALK',
      polylineQuality: 'HIGH_QUALITY',
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Routes failed: ${data?.error?.message ?? `HTTP ${response.status}`}`);
  }

  const route = data?.routes?.[0];
  if (!route) {
    throw new Error('Routes failed: no route found');
  }

  const steps = route.legs?.flatMap((leg) => leg.steps ?? []) ?? [];
  const stepPoints = steps.flatMap((step) => {
    const encoded = step.polyline?.encodedPolyline;
    return encoded ? decodePolyline(encoded) : [];
  });
  const path = stepPoints.length
    ? stepPoints
    : route.polyline?.encodedPolyline
      ? decodePolyline(route.polyline.encodedPolyline)
      : [];

  if (!path.length) {
    throw new Error('Routes failed: no route geometry returned');
  }
  return dedupeConsecutive(path);
}
