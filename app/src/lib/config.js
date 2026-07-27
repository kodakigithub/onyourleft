/**
 * Google Maps API key for the web-service APIs (Directions, Places).
 * Expo exposes EXPO_PUBLIC_* env vars at build time — copy .env.example
 * to .env and fill in your key (see app/README.md).
 */
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function assertApiKey() {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Copy .env.example to .env and add your key (see README.md).',
    );
  }
}
