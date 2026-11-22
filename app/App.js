import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RouteMap from './src/components/RouteMap';
import RouteControls from './src/components/RouteControls';
import SearchBar from './src/components/SearchBar';
import SavedRoutesSheet from './src/components/SavedRoutesSheet';
import { useRouteBuilder } from './src/hooks/useRouteBuilder';
import { routeStorage } from './src/lib/routeStorage';

export default function App() {
  const builder = useRouteBuilder();
  const mapRef = useRef(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [mapType, setMapType] = useState('standard');

  useEffect(() => {
    routeStorage.list().then(setSavedRoutes);
  }, []);

  const recenterOn = ({ lat, lng }) => {
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      500,
    );
  };

  const handleSaveRoute = async (name) => {
    await routeStorage.save({
      name,
      mode: builder.mode,
      distanceMeters: builder.distanceMeters,
      waypoints: builder.waypoints,
      segments: builder.segments,
    });
    setSavedRoutes(await routeStorage.list());
  };

  const handleLoadRoute = (route) => {
    builder.loadRoute(route);
    if (route.waypoints?.length) {
      mapRef.current?.fitToCoordinates(
        route.waypoints.map((p) => ({ latitude: p.lat, longitude: p.lng })),
        { edgePadding: { top: 80, right: 40, bottom: 220, left: 40 }, animated: true },
      );
    }
  };

  const handleDeleteRoute = async (id) => {
    await routeStorage.remove(id);
    setSavedRoutes(await routeStorage.list());
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <RouteMap
        ref={mapRef}
        waypoints={builder.waypoints}
        segments={builder.segments}
        mapType={mapType}
        onMapPress={builder.addPoint}
        onMoveWaypoint={builder.moveWaypoint}
        onRemoveWaypoint={builder.removeWaypoint}
      />
      <SearchBar onSelectLocation={recenterOn} />
      <View style={styles.topRightControls}>
        <TouchableOpacity style={styles.routesButton} onPress={() => setSheetVisible(true)}>
          <Text style={styles.routesButtonText}>Routes</Text>
        </TouchableOpacity>
        <View style={styles.layerToggle}>
          <TouchableOpacity
            style={[styles.layerButton, mapType === 'standard' && styles.layerButtonActive]}
            onPress={() => setMapType('standard')}
            accessibilityRole="button"
            accessibilityState={{ selected: mapType === 'standard' }}
          >
            <Text style={[styles.layerText, mapType === 'standard' && styles.layerTextActive]}>
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.layerButton, mapType === 'hybrid' && styles.layerButtonActive]}
            onPress={() => setMapType('hybrid')}
            accessibilityRole="button"
            accessibilityState={{ selected: mapType === 'hybrid' }}
          >
            <Text style={[styles.layerText, mapType === 'hybrid' && styles.layerTextActive]}>
              Satellite
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RouteControls builder={builder} />
      </KeyboardAvoidingView>
      <SavedRoutesSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        builder={builder}
        savedRoutes={savedRoutes}
        onSaveRoute={handleSaveRoute}
        onLoadRoute={handleLoadRoute}
        onDeleteRoute={handleDeleteRoute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topRightControls: {
    position: 'absolute',
    top: 104,
    right: 12,
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 10,
  },
  routesButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  routesButtonText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  layerToggle: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  layerButton: { paddingHorizontal: 12, paddingVertical: 8 },
  layerButtonActive: { backgroundColor: '#2563eb' },
  layerText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  layerTextActive: { color: 'white' },
});
