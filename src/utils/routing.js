import { haversineDistance } from './helpers';
import { decodePolyline } from './polyline';

const OSRM_URL = 'https://router.project-osrm.org';

export const getRoadDistance = async (lat1, lng1, lat2, lng2) => {
  try {
    const url = `${OSRM_URL}/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM route error');
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      return {
        distance: data.routes[0].distance / 1000,
        duration: data.routes[0].duration / 60,
      };
    }
    throw new Error('No route found');
  } catch (err) {
    console.warn('OSRM route failed, using Haversine fallback:', err);
    const distance = haversineDistance(lat1, lng1, lat2, lng2);
    return { distance, duration: distance * 1.5 };
  }
};

export const getDistanceMatrix = async (points) => {
  const n = points.length;
  const distances = Array.from({ length: n }, () => Array(n).fill(0));
  const durations = Array.from({ length: n }, () => Array(n).fill(0));

  try {
    const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `${OSRM_URL}/table/v1/driving/${coords}?annotations=distance,duration`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM table error');
    const data = await response.json();
    if (data.code === 'Ok') {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            distances[i][j] = 0;
            durations[i][j] = 0;
          } else {
            const valDist = data.distances?.[i]?.[j];
            const valDur = data.durations?.[i]?.[j];
            if (valDist === null || valDist === undefined || valDist === 0) {
              const d = haversineDistance(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
              distances[i][j] = d;
              durations[i][j] = d * 1.5;
            } else {
              distances[i][j] = valDist / 1000;
              durations[i][j] = (valDur || 0) / 60;
            }
          }
        }
      }
      return { distances, durations };
    }
    throw new Error('OSRM table failed');
  } catch (err) {
    console.warn('OSRM table failed, using Haversine fallback:', err);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const d = haversineDistance(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
        distances[i][j] = d;
        durations[i][j] = d * 1.5;
      }
    }
    return { distances, durations };
  }
};

/**
 * Get actual road route geometry between two points.
 * Returns array of [lat, lng] coordinates following real roads.
 */
export const getRouteGeometry = async (lat1, lng1, lat2, lng2) => {
  try {
    const url = `${OSRM_URL}/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=polyline6`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM geometry error');
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const geometry = data.routes[0].geometry;
      // polyline6 uses precision 6
      const coords = decodePolyline(geometry, 6);
      // decodePolyline returns [lat, lng] already
      return {
        coords,
        distance: data.routes[0].distance / 1000,
        duration: data.routes[0].duration / 60,
      };
    }
    throw new Error('No route geometry');
  } catch (err) {
    console.warn('OSRM geometry failed, using straight line:', err);
    // Fallback: straight line with interpolated points
    const straightLine = interpolateStraightLine(lat1, lng1, lat2, lng2);
    const distance = haversineDistance(lat1, lng1, lat2, lng2);
    return {
      coords: straightLine,
      distance,
      duration: distance * 1.5,
    };
  }
};

function interpolateStraightLine(lat1, lng1, lat2, lng2, segments = 20) {
  const coords = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lng1 + (lng2 - lng1) * t;
    coords.push([lat, lng]);
  }
  return coords;
}
