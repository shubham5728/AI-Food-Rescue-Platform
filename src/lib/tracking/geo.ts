/**
 * Geospatial utilities for Real-Time GPS Tracking & Geofencing.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates straight-line / Haversine distance between two coordinates in Kilometres.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Calculates distance in Meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return Math.round(calculateDistanceKm(lat1, lon1, lat2, lon2) * 1000);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates Estimated Time of Arrival (ETA) in Minutes based on distance and driver speed.
 * Uses realistic city travel factor (1.35x road factor) and average urban speed (22 km/h).
 */
export function calculateEtaMinutes(
  distanceKm: number,
  speedKmH: number | null = null,
): number {
  if (distanceKm <= 0.05) return 0;

  // Road circuit factor (roads aren't straight lines)
  const roadDistance = distanceKm * 1.35;
  // Effective speed (default 22 km/h for urban traffic if current speed is negligible)
  const effectiveSpeed = speedKmH && speedKmH > 5 ? Math.min(speedKmH, 60) : 22;

  const hours = roadDistance / effectiveSpeed;
  return Math.max(1, Math.round(hours * 60));
}

/**
 * Checks if current GPS coordinates are within a specified geofence radius (default 50 meters).
 */
export function isWithinGeofence(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number = 50,
): { isWithin: boolean; distanceMeters: number } {
  const distMeters = calculateDistanceMeters(
    currentLat,
    currentLng,
    targetLat,
    targetLng,
  );
  return {
    isWithin: distMeters <= radiusMeters,
    distanceMeters: distMeters,
  };
}

/**
 * Evaluates food rescue risk by comparing driver ETA against remaining rescue deadline window.
 */
export function evaluateRescueRisk(
  remainingRescueTimeMin: number,
  etaMinutes: number,
): "SAFE" | "HIGH_RISK" | "CRITICAL" {
  if (remainingRescueTimeMin <= 0) return "CRITICAL";
  if (etaMinutes > remainingRescueTimeMin) return "HIGH_RISK";
  if (remainingRescueTimeMin - etaMinutes < 10) return "HIGH_RISK";
  return "SAFE";
}
