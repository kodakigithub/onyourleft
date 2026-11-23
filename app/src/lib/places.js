import { requireApiKey } from './apiKey';

const BASE = 'https://places.googleapis.com/v1';

/**
 * Places API (New) over HTTP. Returns autocomplete suggestions and
 * fetches a place's location for recentering the map.
 */

/** Returns [{ placeId, primaryText, secondaryText }] for a query string. */
export async function autocompletePlaces(input) {
  if (!input.trim()) return [];
  const apiKey = await requireApiKey();

  const response = await fetch(`${BASE}/places:autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
    body: JSON.stringify({ input }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Places failed: HTTP ${response.status}`);
  }

  return (data?.suggestions ?? [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      placeId: s.placePrediction.placeId,
      primaryText: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text,
      secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
    }));
}

/** Returns { lat, lng } for a placeId. */
export async function getPlaceLocation(placeId) {
  const apiKey = await requireApiKey();
  const response = await fetch(`${BASE}/places/${placeId}?fields=location`, {
    headers: { 'X-Goog-Api-Key': apiKey },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Places failed: HTTP ${response.status}`);
  }

  if (!data?.location) {
    throw new Error('Place has no location');
  }
  return { lat: data.location.latitude, lng: data.location.longitude };
}
