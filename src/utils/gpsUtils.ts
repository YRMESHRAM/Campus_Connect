/**
 * GPS Utilities for Campus Connect 3D Map
 * Maps geographic coordinates (Latitude, Longitude) to 3D Scene Coordinates (X, Z)
 */

// S.B. Jain Institute of Technology, Management & Research Reference Coordinates
export const CAMPUS_GPS_CENTER = {
  lat: 21.23226,
  lng: 79.03052,
  elevation: 0,
};

// Scale factor: Meters per degree approx at 21° Latitude
// 1 deg Lat ≈ 110,740m; 1 deg Lng ≈ 103,770m
const LAT_PER_METER = 1 / 110740;
const LNG_PER_METER = 1 / 103770;

// Campus boundary radius in meters
export const CAMPUS_RADIUS_METERS = 500;

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number; // in meters
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts GPS Latitude and Longitude to 3D Map Coordinates (X, Z)
 * World coordinate origin (0, 0, 0) corresponds to CAMPUS_GPS_CENTER.
 */
export function gpsToCampusCoords(lat: number, lng: number): Vector3D {
  const dLat = lat - CAMPUS_GPS_CENTER.lat;
  const dLng = lng - CAMPUS_GPS_CENTER.lng;

  // Convert delta degrees to meters
  const metersNorth = dLat / LAT_PER_METER;
  const metersEast = dLng / LNG_PER_METER;

  // In Three.js: +X is East, -Z is North
  const x = metersEast;
  const z = -metersNorth;

  return { x, y: 0.5, z };
}

/**
 * Calculates straight-line distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if a given GPS coordinate is within the campus radius
 */
export function isWithinCampus(lat: number, lng: number): boolean {
  const distance = calculateDistanceMeters(
    lat,
    lng,
    CAMPUS_GPS_CENTER.lat,
    CAMPUS_GPS_CENTER.lng
  );
  return distance <= CAMPUS_RADIUS_METERS;
}

/**
 * Find nearest campus landmark/entrance for a given GPS location
 */
export const CAMPUS_LANDMARKS = [
  { id: 'ENTRANCE_F', name: 'Entrance (F004-F005)', lat: 21.23230, lng: 79.03048, block: 'F', floor: 0 },
  { id: 'MAIN_GATE', name: 'Main Campus Gate', lat: 21.23200, lng: 79.03010, block: 'GROUND', floor: 0 },
  { id: 'PARKING', name: 'Parking Area A', lat: 21.23190, lng: 79.03030, block: 'GROUND', floor: 0 },
  { id: 'ADM', name: 'Admin Block Entrance', lat: 21.23245, lng: 79.03060, block: 'ADM', floor: 0 },
  { id: 'BLOCK_E', name: 'Block E Entrance', lat: 21.23250, lng: 79.03080, block: 'E', floor: 0 },
  { id: 'BLOCK_B', name: 'Block B Entrance', lat: 21.23215, lng: 79.03070, block: 'B', floor: 0 },
  { id: 'BLOCK_M', name: 'Block M Entrance', lat: 21.23260, lng: 79.03040, block: 'M', floor: 0 },
  { id: 'CANTEEN', name: 'Campus Canteen', lat: 21.23270, lng: 79.03075, block: 'CANTEEN', floor: 0 },
];

export function findNearestLandmark(lat: number, lng: number) {
  let nearest = CAMPUS_LANDMARKS[0];
  let minDistance = Infinity;

  for (const lm of CAMPUS_LANDMARKS) {
    const dist = calculateDistanceMeters(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  return { landmark: nearest, distanceMeters: minDistance };
}
