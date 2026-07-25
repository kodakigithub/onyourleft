import { Loader } from '@googlemaps/js-api-loader';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googlePromise = null;

/**
 * Loads the Google Maps JS API exactly once and returns `window.google`.
 * Loads the maps, routes (Directions) and places libraries up front.
 */
export function loadGoogleMaps() {
  if (!googlePromise) {
    if (!apiKey) {
      return Promise.reject(
        new Error(
          'Missing VITE_GOOGLE_MAPS_API_KEY. Copy .env.example to .env and add your key (see README.md).',
        ),
      );
    }
    const loader = new Loader({ apiKey, version: 'weekly' });
    googlePromise = Promise.all([
      loader.importLibrary('maps'),
      loader.importLibrary('routes'),
      loader.importLibrary('places'),
    ]).then(() => window.google);
  }
  return googlePromise;
}
