import { GOOGLE_MAPS_API_KEY, assertApiKey } from './config';

const BASE = 'https://places.googleapis.com/v1';

/**
 * Places API (New) over HTTP. Returns autocomplete suggestions and
 * fetches a place's location for recentering the map.
 */

/** Returns [{ placeId, primaryText, secondaryText }] for a query string. */
export async function autocompletePlaces(input) {
  assertApiKey();
  if (!input.trim()) return [];

  const response = await fetch(`${BASE}/places:autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY },
    body: JSON.stringify({ input }),
  });
  const data = await response.json();

  return (data.suggestions ?? [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      placeId: s.placePrediction.placeId,
      primaryText: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text,
      secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
    }));
}

/** Returns { lat, lng } for a placeId. */
export async function getPlaceLocation(placeId) {
  assertApiKey();
  const response = await fetch(
    `${BASE}/places/${placeId}?fields=location&key=${GOOGLE_MAPS_API_KEY}`,
  );
  const data = await response.json();

  if (!data.location) {
    throw new Error('Place has no location');
  }
  return { lat: data.location.latitude, lng: data.location.longitude };
}
