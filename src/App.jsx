import { useState } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { useRouteBuilder } from './hooks/useRouteBuilder';
import { routeStorage } from './lib/routeStorage';

export default function App() {
  const builder = useRouteBuilder();
  const [map, setMap] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState(() => routeStorage.list());
  const [focusRoute, setFocusRoute] = useState(null);

  const handleSaveRoute = (name) => {
    routeStorage.save({
      name,
      mode: builder.mode,
      distanceMeters: builder.distanceMeters,
      waypoints: builder.waypoints,
      segments: builder.segments,
    });
    setSavedRoutes(routeStorage.list());
  };

  const handleLoadRoute = (route) => {
    builder.loadRoute(route);
    setFocusRoute(route);
  };

  const handleDeleteRoute = (id) => {
    routeStorage.remove(id);
    setSavedRoutes(routeStorage.list());
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        map={map}
        builder={builder}
        savedRoutes={savedRoutes}
        onSaveRoute={handleSaveRoute}
        onLoadRoute={handleLoadRoute}
        onDeleteRoute={handleDeleteRoute}
      />
      <main className="flex-1">
        <MapView
          waypoints={builder.waypoints}
          segments={builder.segments}
          focusRoute={focusRoute}
          onMapReady={setMap}
          onMapClick={builder.addPoint}
          onMoveWaypoint={builder.moveWaypoint}
          onRemoveWaypoint={builder.removeWaypoint}
        />
      </main>
    </div>
  );
}
