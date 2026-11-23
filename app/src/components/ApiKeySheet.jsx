import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../lib/theme';

const SOURCE_COPY = {
  custom: { label: 'Using your saved key', color: COLORS.primary },
  deployment: { label: 'Using the key configured for this build', color: COLORS.muted },
  none: { label: 'No key configured', color: COLORS.accent },
};

export default function ApiKeySheet({ visible, source = 'none', onClose, onSave, onClear }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const status = SOURCE_COPY[source] ?? SOURCE_COPY.none;

  useEffect(() => {
    if (visible) {
      setValue('');
      setError('');
      setBusy(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!value.trim()) {
      setError('Enter a Google Maps API key.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(value);
    } catch (err) {
      setError(err.message ?? 'Could not save the key.');
      setBusy(false);
    }
  };

  const removeKey = async () => {
    setBusy(true);
    setError('');
    try {
      await onClear();
    } catch (err) {
      setError(err.message ?? 'Could not remove the key.');
      setBusy(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Remove saved key?',
      'The app will fall back to the key configured for this build, if one exists.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: removeKey },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Google Maps API key</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button">
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>

          <Text style={styles.description}>
            {source === 'none'
              ? 'Add a Google Maps API key for route snapping and place search. It is stored only on this device.'
              : 'Save your own key to override the key configured for this build. A custom key is stored only on this device.'}
          </Text>

          <View style={styles.setupBox}>
            <Text style={styles.setupTitle}>Required Google Cloud setup</Text>
            <Text style={styles.setupText}>
              Enable Routes API and Places API (New), and turn on billing. In Expo Go, do not
              add HTTP-referrer or app restrictions to this key.
            </Text>
            <Text style={styles.setupText}>
              In Expo Go, Android map tiles use Expo Go&apos;s key and iOS uses Apple Maps. Your key
              powers route snapping and place search.
            </Text>
          </View>

          <Text style={styles.label}>API key</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              setError('');
            }}
            placeholder="Paste your Google Maps API key"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardAppearance="dark"
          />
          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, (!value.trim() || busy) && styles.disabled]}
            disabled={!value.trim() || busy}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>{busy ? 'Working…' : 'Save key'}</Text>
          </TouchableOpacity>

          {source === 'custom' && (
            <TouchableOpacity
              style={[styles.clearButton, busy && styles.disabled]}
              disabled={busy}
              onPress={handleClear}
            >
              <Text style={styles.clearText}>Remove saved key</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.night },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.ink },
  close: { fontSize: 14, color: COLORS.muted },
  body: { padding: 16, paddingBottom: 40 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '500' },
  description: { marginTop: 10, fontSize: 14, lineHeight: 20, color: COLORS.muted },
  setupBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    padding: 12,
    gap: 6,
  },
  setupTitle: { fontSize: 12, fontWeight: '600', color: COLORS.ink },
  setupText: { fontSize: 12, lineHeight: 17, color: COLORS.muted },
  label: { marginTop: 18, marginBottom: 6, fontSize: 12, color: COLORS.muted },
  input: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.ink,
  },
  error: { marginTop: 8, fontSize: 12, color: COLORS.accent },
  saveButton: {
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    alignItems: 'center',
  },
  saveText: { fontSize: 15, fontWeight: '600', color: COLORS.night },
  clearButton: { marginTop: 12, paddingVertical: 8, alignItems: 'center' },
  clearText: { fontSize: 13, fontWeight: '500', color: COLORS.accent },
  disabled: { opacity: 0.4 },
});
