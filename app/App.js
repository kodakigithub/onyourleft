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
        onMapPress={builder.addPoint}
        onMoveWaypoint={builder.moveWaypoint}
        onRemoveWaypoint={builder.removeWaypoint}
      />
      <SearchBar onSelectLocation={recenterOn} />
      <TouchableOpacity style={styles.routesButton} onPress={() => setSheetVisible(true)}>
        <Text style={styles.routesButtonText}>Routes</Text>
      </TouchableOpacity>
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
  routesButton: {
    position: 'absolute',
    top: 104,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 10,
  },
  routesButtonText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
});
