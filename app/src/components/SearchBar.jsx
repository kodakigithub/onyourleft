import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { isApiKeyError } from '../lib/googleErrors';
import { autocompletePlaces, getPlaceLocation } from '../lib/places';
import { COLORS } from '../lib/theme';

/**
 * Location search powered by the Places API (New) HTTP autocomplete.
 * Selecting a result recenters the map via onSelectLocation({lat, lng}).
 */
export default function SearchBar({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  // Debounced autocomplete lookup.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setError('');
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    let active = true;
    const currentQuery = query;
    debounceRef.current = setTimeout(async () => {
      try {
        const nextResults = await autocompletePlaces(currentQuery);
        if (active) setResults(nextResults);
      } catch (err) {
        if (!active) return;
        setResults([]);
        setError(
          isApiKeyError(err)
            ? 'Google rejected the API key. Open API key settings.'
            : 'Place search failed. Try again.',
        );
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = async (item) => {
    setOpen(false);
    setError('');
    setQuery(item.primaryText);
    Keyboard.dismiss();
    try {
      const location = await getPlaceLocation(item.placeId);
      onSelectLocation(location);
    } catch (err) {
      setError(
        isApiKeyError(err)
          ? 'Google rejected the API key. Open API key settings.'
          : 'Could not load that place.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a place…"
        placeholderTextColor={COLORS.muted}
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoCorrect={false}
        autoCapitalize="none"
        keyboardAppearance="dark"
      />
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {open && results.length > 0 && (
        <View style={styles.results}>
          {results.map((item) => (
            <TouchableOpacity
              key={item.placeId}
              style={styles.resultRow}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.resultPrimary} numberOfLines={1}>
                {item.primaryText}
              </Text>
              {!!item.secondaryText && (
                <Text style={styles.resultSecondary} numberOfLines={1}>
                  {item.secondaryText}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.ink,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  errorBox: {
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: { fontSize: 12, color: COLORS.accent },
  results: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  resultRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  resultPrimary: { fontSize: 14, fontWeight: '500', color: COLORS.ink },
  resultSecondary: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
});
