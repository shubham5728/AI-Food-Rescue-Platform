import { AVERAGE_SPEED_KMH } from "./constants";

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance in km. Straight-line distance understates road
 * distance in a real city, so callers that care about travel time should use
 * `travelMinutes`, which applies a detour factor.
 */
export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Road distance is typically ~30% longer than the crow-flies line. */
const ROAD_DETOUR_FACTOR = 1.3;

/** One-way driving time in minutes for a straight-line distance. */
export function travelMinutes(distanceKm: number): number {
  return Math.round(
    ((distanceKm * ROAD_DETOUR_FACTOR) / AVERAGE_SPEED_KMH) * 60,
  );
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
