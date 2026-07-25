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
    <aside className="flex h-full w-80 flex-col overflow-y-auto border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-lg font-bold text-gray-900">On Your Left</h1>
        <p className="text-xs text-gray-500">Running route planner</p>
      </div>

      <div className="space-y-4 p-4">
        <SearchBar map={map} />

        {/* Live distance */}
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-2xl font-bold text-blue-900">{formatMiles(distanceMeters)}</div>
          <div className="text-xs text-blue-700">
            {formatKm(distanceMeters)} · {waypoints.length}{' '}
            {waypoints.length === 1 ? 'point' : 'points'}
            {busy && ' · snapping to roads…'}
          </div>
        </div>

        {warning && <p className="text-xs text-amber-600">{warning}</p>}

        {/* Drawing mode */}
        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">Drawing mode</span>
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              onClick={() => setMode('snap')}
              className={`flex-1 px-3 py-1.5 text-sm ${
                mode === 'snap' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Snap to roads
            </button>
            <button
              onClick={() => setMode('freeform')}
              className={`flex-1 px-3 py-1.5 text-sm ${
                mode === 'freeform' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
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
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Undo point
          </button>
          <button
            onClick={clear}
            disabled={waypoints.length === 0 || busy}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
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
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!canSave || !name.trim()}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Save
          </button>
        </form>
        {justSaved && <p className="text-xs text-green-600">Route saved.</p>}
      </div>

      <div className="mt-auto border-t border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Saved routes</h2>
        <SavedRouteList routes={savedRoutes} onLoad={onLoadRoute} onDelete={onDeleteRoute} />
      </div>
    </aside>
  );
}
