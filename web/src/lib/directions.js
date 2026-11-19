function toPathPoint(point) {
  const lat = typeof point.lat === 'function' ? point.lat() : point.lat;
  const lng = typeof point.lng === 'function' ? point.lng() : point.lng;
  return { lat, lng };
}

/** Steps share endpoints, so drop consecutive duplicates. */
function dedupeConsecutive(points) {
  return points.filter(
    (point, i) =>
      i === 0 || point.lat !== points[i - 1].lat || point.lng !== points[i - 1].lng,
  );
}

/**
 * Returns the walking path (array of {lat, lng}) between two points,
 * snapped to roads/paths via the Routes API.
 * Throws if no route is found.
 */
export async function getWalkingPath(from, to) {
  const { Route, PolylineQuality } = window.google.maps.routes;
  const result = await Route.computeRoutes({
    origin: from,
    destination: to,
    travelMode: window.google.maps.TravelMode.WALKING,
    polylineQuality: PolylineQuality.HIGH_QUALITY,
    fields: ['path'],
  });
  const path = result.routes?.[0]?.path;
  if (!path?.length) {
    throw new Error('No walking route found');
  }
  return dedupeConsecutive(path.map(toPathPoint));
}
