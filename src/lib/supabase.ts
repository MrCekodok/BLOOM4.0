import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth will not work until they are set."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Prefer display name, then email local-part, for Bloom's existing username-keyed storage. */
export function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const metaName = user.user_metadata?.username;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }
  const email = user.email?.trim();
  if (email) {
    return email.split("@")[0] || email;
  }
  return "bloom-user";
}

export type BloomUserData = {
  logs: unknown[];
  journals: unknown[];
  seed_type: string;
  notification_settings: unknown | null;
  smoking_profile?: unknown | null;
};

export async function fetchUserData(): Promise<BloomUserData | null> {
  const { data, error } = await supabase
    .from("user_data")
    .select("logs, journals, seed_type, notification_settings, smoking_profile")
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch user_data:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    logs: (data.logs as unknown[]) || [],
    journals: (data.journals as unknown[]) || [],
    seed_type: data.seed_type || "",
    notification_settings: data.notification_settings ?? null,
    smoking_profile: data.smoking_profile ?? null,
  };
}

export async function upsertUserData(payload: {
  logs: unknown[];
  journals: unknown[];
  seedType: string;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("user_data").upsert(
    {
      user_id: user.id,
      logs: payload.logs,
      journals: payload.journals,
      seed_type: payload.seedType || "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.warn("Failed to sync user_data:", error.message);
  }
}

export async function getUsernameForSession(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const metaName = user.user_metadata?.username;
  if (typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) return profile.username;

  return displayNameFromUser(user);
}
