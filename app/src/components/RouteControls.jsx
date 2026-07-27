import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatMiles, formatKm } from '../lib/distance';

/**
 * Bottom control card: live distance, drawing mode toggle, undo/clear.
 */
export default function RouteControls({ builder }) {
  const { mode, setMode, waypoints, distanceMeters, busy, warning, undo, clear } = builder;
  const hasPoints = waypoints.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.distanceRow}>
        <Text style={styles.distance}>{formatMiles(distanceMeters)}</Text>
        <Text style={styles.subtext}>
          {formatKm(distanceMeters)} · {waypoints.length}{' '}
          {waypoints.length === 1 ? 'point' : 'points'}
          {busy ? ' · snapping…' : ''}
        </Text>
      </View>

      {warning && <Text style={styles.warning}>{warning}</Text>}

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'snap' && styles.modeButtonActive]}
          onPress={() => setMode('snap')}
        >
          <Text style={[styles.modeText, mode === 'snap' && styles.modeTextActive]}>
            Snap to roads
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'freeform' && styles.modeButtonActive]}
          onPress={() => setMode('freeform')}
        >
          <Text style={[styles.modeText, mode === 'freeform' && styles.modeTextActive]}>
            Free-form
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, (!hasPoints || busy) && styles.disabled]}
          disabled={!hasPoints || busy}
          onPress={undo}
        >
          <Text style={styles.actionText}>Undo point</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, (!hasPoints || busy) && styles.disabled]}
          disabled={!hasPoints || busy}
          onPress={clear}
        >
          <Text style={styles.actionText}>Clear route</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Tap map to add a point · Drag markers to adjust · Tap a marker's label to remove it
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  distanceRow: { alignItems: 'center', marginBottom: 8 },
  distance: { fontSize: 28, fontWeight: '700', color: '#1e3a8a' },
  subtext: { fontSize: 12, color: '#3b82f6', marginTop: 2 },
  warning: { fontSize: 12, color: '#d97706', textAlign: 'center', marginBottom: 6 },
  modeRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  modeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: 'white' },
  modeButtonActive: { backgroundColor: '#2563eb' },
  modeText: { fontSize: 14, color: '#374151' },
  modeTextActive: { color: 'white', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
  },
  actionText: { fontSize: 14, color: '#374151' },
  disabled: { opacity: 0.4 },
  hint: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 },
});
