// Generate a clean, human-readable title from a raw Drive filename.
// Example: cleanTitleFromFilename("VID_20260822_003750.mp4", "Youth") -> "Youth — Aug 22, 2026"
// The second argument should be the video's actual category from Supabase —
// never a hardcoded assumption — so an untitled video's generated title
// reflects what it really is instead of defaulting to one specific event.
export function cleanTitleFromFilename(filename: string, category?: string | null): string {
  const fallback = category?.trim() || "Recording";
  const base = filename.replace(/\.[^.]+$/, ""); // strip extension
  const match = base.match(/(\d{4})(\d{2})(\d{2})/); // YYYYMMDD
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) {
      const formatted = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
      return `${fallback} — ${formatted}`;
    }
  }
  // Fallback: strip common prefixes and underscores, title-case.
  const cleaned = base
    .replace(/^VID_/i, "")
    .replace(/^IMG_/i, "")
    .replace(/^Praise[_ -]?Night[_ -]?/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned) {
    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return fallback;
}

// Format a number compactly: 245 -> "245", 1200 -> "1.2K"
export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

// A stable per-browser key for likes/views (no accounts required).
export function getDeviceKey(): string {
  try {
    let key = localStorage.getItem("fg_device_key");
    if (!key) {
      key = `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem("fg_device_key", key);
    }
    return key;
  } catch {
    return "anon";
  }
}

// Format a date nicely.
export function formatDate(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

// ---------- Watch history ("Continue watching") ----------
const HISTORY_KEY = "fg_watch_history";
const HISTORY_MAX = 12;

// Most-recent-first list of video ids the visitor has opened on this device.
export function getWatchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

// Record that a video was opened; keeps the list capped and deduplicated.
export function addToWatchHistory(videoId: string): void {
  try {
    const next = [videoId, ...getWatchHistory().filter((id) => id !== videoId)].slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable; history is a progressive enhancement.
  }
}

// ---------- Social sharing ----------
// Upgrade a Google Drive thumbnail (which Drive caps at ~220px, e.g. "...=s220")
// to a larger variant so social preview cards are crisp. Non-Drive URLs pass through.
export function getSocialImageUrl(thumbnail?: string | null): string | undefined {
  if (!thumbnail) return undefined;
  const upgraded = thumbnail.replace(/=s\d+(-c)?$/, "=w1280-h720");
  return upgraded === thumbnail ? thumbnail : upgraded;
}

// The canonical public site origin used for share links and og:url.
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  return "https://foursquare.media";
}