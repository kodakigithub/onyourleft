import { useEffect, useRef, useState } from 'react';
import { getApiKeySource } from '../lib/apiKey';

const SOURCE_COPY = {
  custom: {
    label: 'Using your saved key',
    dotClass: 'bg-primary',
    textClass: 'text-primary',
  },
  deployment: {
    label: 'Using the deployment key',
    dotClass: 'bg-muted',
    textClass: 'text-muted',
  },
  none: {
    label: 'No key configured',
    dotClass: 'bg-accent',
    textClass: 'text-accent',
  },
};

export default function ApiKeyDialog({ dismissible = true, onClose, onSave, onClear }) {
  const source = getApiKeySource();
  const status = SOURCE_COPY[source];
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!dismissible) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!value.trim()) {
      setError('Enter a Google Maps API key.');
      return;
    }
    try {
      onSave(value);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setError('');
    try {
      onClear?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night/90 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-title"
        className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="api-key-title" className="text-xl font-bold text-ink">
              Google Maps API key
            </h2>
            <p className={`mt-2 flex items-center gap-2 text-xs font-medium ${status.textClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </p>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              Close
            </button>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">
          {source === 'none'
            ? 'Add a Google Maps API key to use the map. It is stored only in this browser.'
            : 'Save your own key to override the deployment key. A custom key is stored only in this browser.'}
        </p>

        <div className="mt-4 rounded-lg border border-line bg-night p-3 text-xs leading-5 text-muted">
          <p className="font-medium text-ink">Required Google Cloud setup</p>
          <p className="mt-1">
            Enable Maps JavaScript API, Routes API, and Places API (New), and turn on billing.
            Restrict the key to this site&apos;s HTTP referrers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="google-maps-api-key" className="mb-1 block text-xs font-medium text-muted">
            API key
          </label>
          <input
            ref={inputRef}
            id="google-maps-api-key"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError('');
            }}
            placeholder="Paste your Google Maps API key"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-lg border border-line bg-night px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {error && <p className="mt-2 text-xs text-accent">{error}</p>}

          <p className="mt-3 text-xs leading-5 text-muted">
            Saving or removing a key reloads the app and clears any unsaved route.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {source === 'custom' && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
              >
                Remove saved key
              </button>
            )}
            <div className="ml-auto flex gap-2">
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-elevated"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!value.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-night transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Save key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
