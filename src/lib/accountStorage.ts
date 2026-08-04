import { supabase, isSupabaseConfigured } from "./supabase";

/** Legacy unscoped progress keys that must never migrate into another account. */
const LEGACY_UNSCOPED_PROGRESS_KEYS = [
  "bloom_recovery_logs_raw",
  "bloom_recovery_logs",
  "bloom_recovery_logs_v2",
  "bloom_recovery_logs_v4",
  "bloom_journal_entries_v4"
] as const;

/** Device-global UI keys that leak across accounts if left after logout. */
const SESSION_UI_KEYS = [
  "bloom_tour_guide_seen",
  "bloom_user_avatar",
  "bloom_current_page"
] as const;

/**
 * Removes obsolete unscoped log/journal mirrors.
 * Safe to call when switching users — does not touch UI prefs mid-session.
 */
export function clearLegacyUnscopedProgressKeys(): void {
  for (const key of LEGACY_UNSCOPED_PROGRESS_KEYS) {
    localStorage.removeItem(key);
  }
}

/**
 * Clears all device-global keys that must not leak across accounts.
 * Does NOT delete other accounts' `bloom_*_${username}` keys.
 */
export function clearSessionGlobalProgressKeys(): void {
  clearLegacyUnscopedProgressKeys();
  for (const key of SESSION_UI_KEYS) {
    localStorage.removeItem(key);
  }
}

/**
 * End the local session and Supabase auth so the next sign-in cannot
 * hydrate the previous account's cloud row into a new username.
 */
export async function endBloomSession(): Promise<void> {
  localStorage.removeItem("bloom_current_user");
  clearSessionGlobalProgressKeys();
  localStorage.setItem("bloom_just_logged_out", "true");

  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut during logout:", err);
    }
  }
}

/**
 * Only trust a Supabase session user id for hydrate when it belongs to activeUser.
 */
export function sessionMatchesActiveUser(
  activeUser: string,
  sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined
): boolean {
  if (!activeUser || !sessionUser?.id) return false;
  const needle = activeUser.trim().toLowerCase();
  const candidates = [
    sessionUser.user_metadata?.username,
    sessionUser.email?.split("@")[0],
    sessionUser.email
  ]
    .filter(Boolean)
    .map((v) => String(v).trim().toLowerCase());
  return candidates.includes(needle);
}
