import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'onyourleft.googleMapsApiKey';

function normalizeApiKey(value) {
  const apiKey = typeof value === 'string' ? value.trim() : '';
  return apiKey === 'your_api_key_here' ? '' : apiKey;
}

const DEFAULT_API_KEY = normalizeApiKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);

let cachedStoredKey = '';
let hasLoaded = false;
let loadPromise = null;

async function loadStoredKey() {
  if (hasLoaded) return cachedStoredKey;
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!hasLoaded) {
          cachedStoredKey = normalizeApiKey(value);
          hasLoaded = true;
        }
        return cachedStoredKey;
      })
      .catch(() => {
        if (!hasLoaded) {
          cachedStoredKey = '';
          hasLoaded = true;
        }
        return cachedStoredKey;
      });
  }
  return loadPromise;
}

export async function getApiKey() {
  const storedKey = await loadStoredKey();
  return storedKey || DEFAULT_API_KEY;
}

export async function requireApiKey() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('No Google Maps API key configured. Open API key settings and add one.');
  }
  return apiKey;
}

export async function getApiKeyInfo() {
  const storedKey = await loadStoredKey();
  if (storedKey) return { source: 'custom', hasKey: true };
  if (DEFAULT_API_KEY) return { source: 'deployment', hasKey: true };
  return { source: 'none', hasKey: false };
}

export async function saveApiKey(value) {
  const apiKey = normalizeApiKey(value);
  if (!apiKey) {
    throw new Error('Enter a Google Maps API key.');
  }
  await AsyncStorage.setItem(STORAGE_KEY, apiKey);
  cachedStoredKey = apiKey;
  hasLoaded = true;
}

export async function clearStoredApiKey() {
  await AsyncStorage.removeItem(STORAGE_KEY);
  cachedStoredKey = '';
  hasLoaded = true;
}
