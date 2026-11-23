import { useState } from 'react';
import SearchBar from './SearchBar';
import SavedRouteList from './SavedRouteList';
import { formatMiles, formatKm } from '../lib/distance';

/**
 * Left-hand control panel: search, live distance, drawing mode,
 * undo/clear, save form, and the saved-routes list.
 */
export default function Sidebar({
  map,
  builder,
  savedRoutes,
  onSaveRoute,
  onLoadRoute,
  onDeleteRoute,
}) {
  const { mode, setMode, waypoints, distanceMeters, busy, warning, undo, clear } = builder;
  const [name, setName] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const canSave = waypoints.length >= 2 && !busy;

  const handleSave = (e) => {
    e.preventDefault();
    if (!canSave || !name.trim()) return;
    onSaveRoute(name.trim());
    setName('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <aside className="flex h-full w-80 flex-col overflow-y-auto border-r border-line bg-surface">
      <div className="border-b border-line p-4">
        <h1 className="text-lg font-bold text-ink">On Your Left</h1>
        <p className="text-xs text-muted">Running route planner</p>
      </div>

      <div className="space-y-4 p-4">
        <SearchBar map={map} />

        {/* Live distance */}
        <div className="rounded-lg border border-line bg-night p-3">
          <div className="text-2xl font-bold text-primary">{formatMiles(distanceMeters)}</div>
          <div className="text-xs text-muted">
            {formatKm(distanceMeters)} · {waypoints.length}{' '}
            {waypoints.length === 1 ? 'point' : 'points'}
            {busy && ' · snapping to roads…'}
          </div>
        </div>

        {warning && <p className="text-xs text-accent">{warning}</p>}

        {/* Drawing mode */}
        <div>
          <span className="mb-1 block text-xs font-medium text-muted">Drawing mode</span>
          <div className="flex overflow-hidden rounded-lg border border-line bg-night">
            <button
              onClick={() => setMode('snap')}
              className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
                mode === 'snap'
                  ? 'bg-primary font-medium text-night'
                  : 'text-muted hover:bg-elevated hover:text-ink'
              }`}
            >
              Snap to roads
            </button>
            <button
              onClick={() => setMode('freeform')}
              className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
                mode === 'freeform'
                  ? 'bg-primary font-medium text-night'
                  : 'text-muted hover:bg-elevated hover:text-ink'
              }`}
            >
              Free-form
            </button>
          </div>
        </div>

        {/* Edit actions */}
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={waypoints.length === 0 || busy}
            className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-primary/50 hover:bg-elevated disabled:opacity-40"
          >
            Undo point
          </button>
          <button
            onClick={clear}
            disabled={waypoints.length === 0 || busy}
            className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-primary/50 hover:bg-elevated disabled:opacity-40"
          >
            Clear route
          </button>
        </div>

        {/* Save */}
        <form onSubmit={handleSave} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Route name"
            className="min-w-0 flex-1 rounded-lg border border-line bg-night px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={!canSave || !name.trim()}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-night transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Save
          </button>
        </form>
        {justSaved && <p className="text-xs text-primary">Route saved.</p>}
      </div>

      <div className="mt-auto border-t border-line p-4">
        <h2 className="mb-2 text-sm font-semibold text-ink">Saved routes</h2>
        <SavedRouteList routes={savedRoutes} onLoad={onLoadRoute} onDelete={onDeleteRoute} />
      </div>
    </aside>
  );
}
