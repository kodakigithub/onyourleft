import { formatMiles, formatKm } from '../lib/distance';

/** List of saved routes with load/delete actions. */
export default function SavedRouteList({ routes, onLoad, onDelete }) {
  if (routes.length === 0) {
    return <p className="text-sm text-muted">No saved routes yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {routes.map((route) => (
        <li
          key={route.id}
          className="rounded-lg border border-line bg-night/60 p-3 transition-colors hover:border-primary/50"
        >
          <button
            onClick={() => onLoad(route)}
            className="block w-full text-left"
            title="Load this route on the map"
          >
            <span className="block truncate text-sm font-medium text-ink">{route.name}</span>
            <span className="block text-xs text-muted">
              {formatMiles(route.distanceMeters)} ({formatKm(route.distanceMeters)}) ·{' '}
              {new Date(route.createdAt).toLocaleDateString()}
            </span>
          </button>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onLoad(route)}
              className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Load
            </button>
            <button
              onClick={() => onDelete(route.id)}
              className="rounded bg-accent/10 px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
