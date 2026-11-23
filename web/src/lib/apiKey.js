const STORAGE_KEY = 'onyourleft.googleMapsApiKey';

function normalizeApiKey(value) {
  const apiKey = typeof value === 'string' ? value.trim() : '';
  return apiKey === 'your_api_key_here' ? '' : apiKey;
}

const DEFAULT_API_KEY = normalizeApiKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

export function getStoredApiKey() {
  try {
    return normalizeApiKey(localStorage.getItem(STORAGE_KEY));
  } catch {
    return '';
  }
}

export function getApiKey() {
  return getStoredApiKey() || DEFAULT_API_KEY;
}

export function hasDeploymentApiKey() {
  return Boolean(DEFAULT_API_KEY);
}

export function getApiKeySource() {
  if (getStoredApiKey()) return 'custom';
  if (DEFAULT_API_KEY) return 'deployment';
  return 'none';
}

export function saveApiKey(value) {
  const apiKey = normalizeApiKey(value);
  if (!apiKey) {
    throw new Error('Enter a Google Maps API key.');
  }
  try {
    localStorage.setItem(STORAGE_KEY, apiKey);
  } catch {
    throw new Error('Could not save the API key in this browser.');
  }
}

export function clearStoredApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}
