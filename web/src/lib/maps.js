import { Loader } from '@googlemaps/js-api-loader';
import { getApiKey } from './apiKey';

let googlePromise = null;

/**
 * Loads the Google Maps JS API exactly once and returns `window.google`.
 * Loads the maps, routes (Routes API) and places libraries up front.
 */
export function loadGoogleMaps() {
  if (!googlePromise) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return Promise.reject(
        new Error('No Google Maps API key is configured. Open API key settings and add one.'),
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
