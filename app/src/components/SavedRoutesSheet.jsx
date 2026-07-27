import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatMiles, formatKm } from '../lib/distance';

/**
 * Modal for saving the current route and browsing saved ones.
 * All persistence goes through routeStorage (AsyncStorage).
 */
export default function SavedRoutesSheet({
  visible,
  onClose,
  builder,
  savedRoutes,
  onSaveRoute,
  onLoadRoute,
  onDeleteRoute,
}) {
  const [name, setName] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const canSave = builder.waypoints.length >= 2 && !builder.busy && name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSaveRoute(name.trim());
    setName('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Routes</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Save current route */}
        <View style={styles.saveRow}>
          <TextInput
            style={styles.nameInput}
            placeholder="Name this route"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.disabled]}
            disabled={!canSave}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        {justSaved && <Text style={styles.savedNote}>Route saved.</Text>}
        {builder.waypoints.length < 2 && (
          <Text style={styles.hint}>Add at least 2 points on the map to save a route.</Text>
        )}

        {/* Saved routes list */}
        <ScrollView style={styles.list}>
          {savedRoutes.length === 0 ? (
            <Text style={styles.empty}>No saved routes yet.</Text>
          ) : (
            savedRoutes.map((route) => (
              <View key={route.id} style={styles.routeRow}>
                <TouchableOpacity
                  style={styles.routeInfo}
                  onPress={() => {
                    onLoadRoute(route);
                    onClose();
                  }}
                >
                  <Text style={styles.routeName} numberOfLines={1}>
                    {route.name}
                  </Text>
                  <Text style={styles.routeMeta}>
                    {formatMiles(route.distanceMeters)} ({formatKm(route.distanceMeters)}) ·{' '}
                    {new Date(route.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteRoute(route.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  close: { fontSize: 15, color: '#2563eb', fontWeight: '600' },
  saveRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  nameInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  disabled: { opacity: 0.4 },
  savedNote: { fontSize: 12, color: '#059669', paddingHorizontal: 16, marginTop: 4 },
  hint: { fontSize: 12, color: '#9ca3af', paddingHorizontal: 16, marginTop: 4 },
  list: { flex: 1, marginTop: 12, paddingHorizontal: 16 },
  empty: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  routeInfo: { flex: 1, marginRight: 8 },
  routeName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  routeMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
});
