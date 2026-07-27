import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Route storage interface — same shape as web/src/lib/routeStorage.js,
 * but async (AsyncStorage). To swap in a real backend later, re-implement
 * these three functions as API calls.
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
  async list() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async save({ name, mode, distanceMeters, waypoints, segments }) {
    const routes = await routeStorage.list();
    const saved = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      name,
      createdAt: new Date().toISOString(),
      mode,
      distanceMeters,
      waypoints,
      segments,
    };
    routes.unshift(saved);
    await AsyncStorage.setItem(KEY, JSON.stringify(routes));
    return saved;
  },

  async remove(id) {
    const routes = (await routeStorage.list()).filter((r) => r.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(routes));
  },
};
