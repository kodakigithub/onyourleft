import { formatMiles, formatKm } from '../lib/distance';

/** List of saved routes with load/delete actions. */
export default function SavedRouteList({ routes, onLoad, onDelete }) {
  if (routes.length === 0) {
    return <p className="text-sm text-gray-400">No saved routes yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {routes.map((route) => (
        <li
          key={route.id}
          className="rounded-lg border border-gray-200 p-3 hover:border-blue-300"
        >
          <button
            onClick={() => onLoad(route)}
            className="block w-full text-left"
            title="Load this route on the map"
          >
            <span className="block truncate text-sm font-medium text-gray-800">
              {route.name}
            </span>
            <span className="block text-xs text-gray-500">
              {formatMiles(route.distanceMeters)} ({formatKm(route.distanceMeters)}) ·{' '}
              {new Date(route.createdAt).toLocaleDateString()}
            </span>
          </button>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onLoad(route)}
              className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Load
            </button>
            <button
              onClick={() => onDelete(route.id)}
              className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
