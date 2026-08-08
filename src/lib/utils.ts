import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function minutesBetween(from: Date | string, to: Date | string): number {
  const a = typeof from === "string" ? new Date(from) : from;
  const b = typeof to === "string" ? new Date(to) : to;
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

/** "2h 15m", "45m", "overdue by 20m" — used all over the urgency UI. */
export function formatDuration(minutes: number): string {
  const abs = Math.abs(Math.round(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const text = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  return minutes < 0 ? `overdue by ${text}` : text;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const time = formatTime(iso);

  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;

  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;

  // Pickup windows routinely cross midnight, so "Tomorrow" matters as much as
  // "Today" — a bare "6:05 am" on a deadline is genuinely ambiguous.
  const tomorrow = new Date(today.getTime() + 86400000);
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;

  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

/**
 * The recognisable part of a street address for a compact card.
 * Indian addresses put the locality just before the city, so the
 * second-to-last segment beats the first — "Indiranagar", not "412".
 */
export function localityOf(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return address;
  if (parts.length === 1) return parts[0];
  return parts[parts.length - 2];
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Short, sortable, collision-resistant enough for a single-tenant MVP. */
export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
