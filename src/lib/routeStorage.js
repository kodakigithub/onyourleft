/**
 * Route storage interface.
 *
 * MVP implementation uses browser localStorage. To swap in a real backend
 * later, re-implement these four functions as API calls and update the
 * callers (App.jsx) if the functions become async.
 *
 * SavedRoute shape:
 * {
 *   id: string,
 *   name: string,
 *   createdAt: string (ISO date),
 *   mode: 'snap' | 'freeform',
 *   distanceMeters: number,
 *   waypoints: [{lat, lng}, ...],        // user-placed points
 *   segments: [[{lat, lng}, ...], ...]   // segments[i] connects waypoints[i] -> waypoints[i+1]
 * }
 */

const KEY = 'onyourleft.routes.v1';

export const routeStorage = {
  list() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? [];
    } catch {
      return [];
    }
  },

  save({ name, mode, distanceMeters, waypoints, segments }) {
    const routes = routeStorage.list();
    const saved = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      mode,
      distanceMeters,
      waypoints,
      segments,
    };
    routes.unshift(saved);
    localStorage.setItem(KEY, JSON.stringify(routes));
    return saved;
  },

  remove(id) {
    const routes = routeStorage.list().filter((r) => r.id !== id);
    localStorage.setItem(KEY, JSON.stringify(routes));
  },
};
