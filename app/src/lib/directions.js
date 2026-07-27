import { GOOGLE_MAPS_API_KEY, assertApiKey } from './config';
import { decodePolyline } from './polyline';

/**
 * Returns the walking path (array of {lat, lng}) between two points,
 * snapped to roads/paths via the Directions HTTP API.
 * Throws if no route is found.
 */
export async function getWalkingPath(from, to) {
  assertApiKey();
  const url =
    'https://maps.googleapis.com/maps/api/directions/json' +
    `?origin=${from.lat},${from.lng}` +
    `&destination=${to.lat},${to.lng}` +
    '&mode=walking' +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.routes?.length) {
    throw new Error(`Directions failed: ${data.status ?? response.status}`);
  }
  return decodePolyline(data.routes[0].overview_polyline.points);
}
