let directionsService = null;

/**
 * Returns the walking path (array of {lat, lng}) between two points,
 * snapped to roads/paths via the Directions API.
 * Throws if no route is found.
 */
export async function getWalkingPath(from, to) {
  if (!directionsService) {
    directionsService = new window.google.maps.DirectionsService();
  }
  const result = await directionsService.route({
    origin: from,
    destination: to,
    travelMode: window.google.maps.TravelMode.WALKING,
  });
  return result.routes[0].overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
}
