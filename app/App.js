import React, { useRef } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RouteMap from './src/components/RouteMap';
import RouteControls from './src/components/RouteControls';
import { useRouteBuilder } from './src/hooks/useRouteBuilder';

export default function App() {
  const builder = useRouteBuilder();
  const mapRef = useRef(null);

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RouteControls builder={builder} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
