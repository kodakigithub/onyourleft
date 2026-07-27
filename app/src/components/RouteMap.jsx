import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LINE_COLOR = '#2563eb';

/**
 * The interactive map. Tap to add waypoints, drag markers to adjust,
 * tap a marker to remove it. Purely presentational — all route state
 * lives in useRouteBuilder and flows in via props / out via callbacks.
 */
const RouteMap = forwardRef(function RouteMap(
  { waypoints, segments, onMapPress, onMoveWaypoint, onRemoveWaypoint },
  ref,
) {
  return (
    <MapView
      ref={ref}
      style={styles.map}
      initialRegion={DEFAULT_REGION}
      onPress={(e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        onMapPress({ lat: latitude, lng: longitude });
      }}
    >
      {segments.map((path, i) => (
        <Polyline
          key={`seg-${i}`}
          coordinates={path.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor={LINE_COLOR}
          strokeWidth={4}
        />
      ))}
      {waypoints.map((pt, i) => (
        <Marker
          key={`wp-${i}`}
          coordinate={{ latitude: pt.lat, longitude: pt.lng }}
          draggable
          title={`Point ${i + 1}`}
          description="Drag to adjust · tap to remove"
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            onMoveWaypoint(i, { lat: latitude, lng: longitude });
          }}
          onCalloutPress={() => onRemoveWaypoint(i)}
        />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: { flex: 1 },
});

export default RouteMap;
