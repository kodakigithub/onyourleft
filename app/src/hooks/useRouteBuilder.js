import { useCallback, useMemo, useRef, useState } from 'react';
import { getWalkingPath } from '../lib/directions';
import { routeLengthMeters } from '../lib/distance';
import { isApiKeyError } from '../lib/googleErrors';

/**
 * Core route-editing state — same model as web/src/hooks/useRouteBuilder.js.
 *
 * Model:
 *   waypoints: [{lat, lng}]            — the points the user placed
 *   segments:  [[{lat, lng}], ...]     — segments[i] is the drawn path from waypoints[i] to waypoints[i+1]
 *
 * In 'snap' mode each segment is fetched from the Routes API (walking),
 * falling back to a straight line if no road route exists. In 'freeform'
 * mode segments are straight lines.
 */
export function useRouteBuilder() {
  const [mode, setModeState] = useState('snap'); // 'snap' | 'freeform'
  const [waypoints, setWaypoints] = useState([]);
  const [segments, setSegments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState(null);

  // Refs mirror state so async handlers always read the latest values.
  const modeRef = useRef(mode);
  const waypointsRef = useRef(waypoints);
  const segmentsRef = useRef(segments);
  modeRef.current = mode;
  waypointsRef.current = waypoints;
  segmentsRef.current = segments;

  const buildSegment = useCallback(async (from, to, segmentMode) => {
    if (segmentMode === 'snap') {
      try {
        return await getWalkingPath(from, to);
      } catch (error) {
        setWarning(
          isApiKeyError(error)
            ? 'Google rejected the API key. Open API key settings and check Routes API access and billing.'
            : 'A point could not be snapped to roads — a straight line was used instead.',
        );
        return [from, to];
      }
    }
    return [from, to];
  }, []);

  const addPoint = useCallback(
    async (point) => {
      const prev = waypointsRef.current;
      if (prev.length === 0) {
        setWaypoints([point]);
        return;
      }
      setBusy(true);
      try {
        const seg = await buildSegment(prev[prev.length - 1], point, modeRef.current);
        setWaypoints([...waypointsRef.current, point]);
        setSegments([...segmentsRef.current, seg]);
      } finally {
        setBusy(false);
      }
    },
    [buildSegment],
  );

  const moveWaypoint = useCallback(
    async (index, point) => {
      const wps = [...waypointsRef.current];
      const segs = [...segmentsRef.current];
      wps[index] = point;
      // Optimistically straighten affected segments, then re-snap.
      if (index > 0) segs[index - 1] = [wps[index - 1], point];
      if (index < wps.length - 1) segs[index] = [point, wps[index + 1]];
      setWaypoints(wps);
      setSegments(segs);

      if (modeRef.current === 'snap') {
        setBusy(true);
        try {
          const updates = [];
          if (index > 0) {
            updates.push(
              buildSegment(wps[index - 1], point, 'snap').then((s) => (segs[index - 1] = s)),
            );
          }
          if (index < wps.length - 1) {
            updates.push(
              buildSegment(point, wps[index + 1], 'snap').then((s) => (segs[index] = s)),
            );
          }
          await Promise.all(updates);
          setSegments([...segs]);
        } finally {
          setBusy(false);
        }
      }
    },
    [buildSegment],
  );

  const removeWaypoint = useCallback(
    async (index) => {
      const wps = waypointsRef.current.filter((_, i) => i !== index);
      const segs = segmentsRef.current.filter((_, i) => i !== index - 1 && i !== index);
      // Bridge the gap between the two neighbors of the removed point.
      if (index > 0 && index < waypointsRef.current.length - 1) {
        setBusy(true);
        try {
          const bridge = await buildSegment(wps[index - 1], wps[index], modeRef.current);
          segs.splice(index - 1, 0, bridge);
        } finally {
          setBusy(false);
        }
      }
      setWaypoints(wps);
      setSegments(segs);
    },
    [buildSegment],
  );

  const undo = useCallback(() => {
    setWaypoints(waypointsRef.current.slice(0, -1));
    setSegments(segmentsRef.current.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setWaypoints([]);
    setSegments([]);
    setWarning(null);
  }, []);

  /** Switch drawing mode; re-computes existing segments to match. */
  const setMode = useCallback(
    async (nextMode) => {
      if (nextMode === modeRef.current) return;
      setModeState(nextMode);
      modeRef.current = nextMode;
      const wps = waypointsRef.current;
      if (wps.length < 2) return;
      setBusy(true);
      try {
        const segs = [];
        for (let i = 1; i < wps.length; i++) {
          segs.push(await buildSegment(wps[i - 1], wps[i], nextMode));
        }
        setSegments(segs);
      } finally {
        setBusy(false);
      }
    },
    [buildSegment],
  );

  /** Replace the editor with a previously saved route. */
  const loadRoute = useCallback((route) => {
    setModeState(route.mode ?? 'snap');
    setWaypoints(route.waypoints ?? []);
    setSegments(route.segments ?? []);
    setWarning(null);
  }, []);

  const distanceMeters = useMemo(() => routeLengthMeters(segments), [segments]);

  return {
    mode,
    setMode,
    waypoints,
    segments,
    distanceMeters,
    busy,
    warning,
    addPoint,
    moveWaypoint,
    removeWaypoint,
    undo,
    clear,
    loadRoute,
  };
}
