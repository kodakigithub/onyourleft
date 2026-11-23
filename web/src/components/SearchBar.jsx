import { useEffect, useRef } from 'react';
import { COLORS } from '../lib/theme';

/**
 * Location search powered by the Places API (PlaceAutocompleteElement).
 * Selecting a result pans the map to that location.
 */
export default function SearchBar({ map }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!map || !hostRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return;
    }
    const el = new window.google.maps.places.PlaceAutocompleteElement();
    el.style.width = '100%';
    el.style.colorScheme = 'dark';
    el.style.backgroundColor = COLORS.surface;
    el.style.color = COLORS.ink;
    el.style.border = `1px solid ${COLORS.line}`;
    el.style.borderRadius = '10px';
    const host = hostRef.current;
    host.replaceChildren(el);

    const onSelect = async (e) => {
      const place = e.placePrediction.toPlace();
      await place.fetchFields({ fields: ['location', 'displayName'] });
      if (place.location) {
        map.panTo(place.location);
        map.setZoom(15);
      }
    };
    el.addEventListener('gmp-select', onSelect);
    return () => el.removeEventListener('gmp-select', onSelect);
  }, [map]);

  return <div ref={hostRef} className="w-full" />;
}
