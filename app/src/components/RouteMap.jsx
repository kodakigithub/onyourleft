import React, { forwardRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NIGHT_MAP_STYLE } from '../lib/mapStyle';
import { COLORS } from '../lib/theme';

const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * The interactive map. Tap to add waypoints, drag markers to adjust,
 * tap a marker to remove it. Purely presentational — all route state
 * lives in useRouteBuilder and flows in via props / out via callbacks.
 */
const RouteMap = forwardRef(function RouteMap(
  { waypoints, segments, mapType = 'standard', onMapPress, onMoveWaypoint, onRemoveWaypoint },
  ref,
) {
  return (
    <MapView
      ref={ref}
      style={styles.map}
      initialRegion={DEFAULT_REGION}
      mapType={mapType}
      customMapStyle={Platform.OS === 'android' ? NIGHT_MAP_STYLE : undefined}
      userInterfaceStyle="dark"
      loadingEnabled
      loadingBackgroundColor={COLORS.night}
      loadingIndicatorColor={COLORS.primary}
      onPress={(e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        onMapPress({ lat: latitude, lng: longitude });
      }}
    >
      {segments.map((path, i) => {
        const coordinates = path.map((p) => ({ latitude: p.lat, longitude: p.lng }));
        return (
          <React.Fragment key={`seg-${i}`}>
            <Polyline
              coordinates={coordinates}
              strokeColor="rgba(198, 255, 61, 0.22)"
              strokeWidth={12}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={coordinates}
              strokeColor={COLORS.route}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          </React.Fragment>
        );
      })}
      {waypoints.map((pt, i) => (
        <Marker
          key={`wp-${i}`}
          coordinate={{ latitude: pt.lat, longitude: pt.lng }}
          draggable
          pinColor={COLORS.primary}
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
  map: { flex: 1, backgroundColor: COLORS.night },
});

export default RouteMap;
