import { createClient } from "@supabase/supabase-js";
import { LogEntry, JournalEntry, SmokingProfile } from "../types";

// Retrieve Supabase config from environment variables
const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("placeholder") &&
    supabaseUrl.startsWith("http")
  );
}

// Fallback dummy URL/Key to avoid client crashes if env variables are empty during initial run
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co";
const effectiveKey = isSupabaseConfigured() ? supabaseAnonKey : "placeholder-key";

export const supabase = createClient(effectiveUrl, effectiveKey);

export interface SupabaseProfile {
  id: string; // matches auth.users.id
  email?: string;
  username: string;
  created_at: string;
  streak?: number;
  companion_plant_stage?: string;
  seed_type?: string;
  smoking_profile?: SmokingProfile | null;
  settings?: any;
  last_simulated_date?: string;
}

/**
 * Ensures user profile exists in 'profiles' table after successful auth.
 * Schema: profiles(id, username, created_at) — optional email if column exists.
 * Progress lives in user_data.
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  username: string
): Promise<{ success: boolean; profile?: SupabaseProfile; error?: string }> {
  const fallbackProfile: SupabaseProfile = {
    id: userId,
    email,
    username: username || email.split("@")[0] || "user",
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured()) {
    return { success: true, profile: fallbackProfile };
  }

  try {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, username, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: true,
        profile: { ...existingProfile, email }
      };
    }

    // Prefer including email — some projects still have email NOT NULL
    let inserted = null as { id: string; username: string; created_at: string } | null;
    let insertErr: { message: string } | null = null;

    {
      const res = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            username: fallbackProfile.username,
            email
          },
          { onConflict: "id" }
        )
        .select("id, username, created_at")
        .single();
      inserted = res.data;
      insertErr = res.error;
    }

    // Fallback for schemas without an email column
    if (insertErr && /email|column/i.test(insertErr.message)) {
      const res = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            username: fallbackProfile.username
          },
          { onConflict: "id" }
        )
        .select("id, username, created_at")
        .single();
      inserted = res.data;
      insertErr = res.error;
    }

    if (insertErr) {
      console.error("Error creating Supabase profile:", insertErr.message);
      return { success: false, profile: fallbackProfile, error: insertErr.message };
    }

    // Ensure a user_data row exists for progress sync
    const { error: userDataErr } = await supabase.from("user_data").upsert(
      {
        user_id: userId,
        logs: [],
        journals: [],
        seed_type: "tomato"
      },
      { onConflict: "user_id" }
    );
    if (userDataErr) {
      console.error("Error creating user_data row:", userDataErr.message);
    }

    return {
      success: true,
      profile: inserted ? { ...inserted, email } : fallbackProfile
    };
  } catch (err: any) {
    console.error("Exception in ensureUserProfile:", err);
    return { success: false, profile: fallbackProfile, error: err?.message };
  }
}

function mapLogsFromDb(raw: unknown): LogEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row: any) => ({
    id: row.id,
    date: row.date,
    habit: row.habit,
    consumed: Boolean(row.consumed),
    quantity: row.quantity,
    reason: row.reason,
    solution: row.solution,
    timestamp: row.timestamp
  }));
}

function mapJournalsFromDb(raw: unknown): JournalEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row: any) => ({
    id: row.id,
    date: row.date,
    text: row.text,
    timestamp: row.timestamp
  }));
}

/**
 * Sign up user with Supabase Auth.
 * ONLY creates profile row AFTER successful authentication.
 * If sign up fails, NO data is inserted.
 */
export async function signUpWithSupabase(
  emailInput: string,
  usernameInput: string,
  passwordInput: string
): Promise<{
  success: boolean;
  user?: any;
  profile?: SupabaseProfile;
  error?: string;
}> {
  const email = emailInput.trim();
  const username = (usernameInput.trim() || email.split("@")[0] || "user").trim();

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!passwordInput || passwordInput.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (!isSupabaseConfigured()) {
    // Return error or offline notification if client not configured
    return {
      success: false,
      error: "Supabase credentials are not configured in environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)."
    };
  }

  try {
    // Step 1: Execute Supabase Auth signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordInput,
      options: {
        data: { username }
      }
    });

    if (error) {
      // If sign up fails, do NOT insert any profile or user data
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to create user account with Supabase Auth." };
    }

    // Step 2: Ensure profile row is created ONLY after successful authentication
    const profileRes = await ensureUserProfile(data.user.id, email, username);

    return {
      success: true,
      user: data.user,
      profile: profileRes.profile
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Sign up failed due to a network or server issue." };
  }
}

/**
 * Sign in user with Supabase Auth and fetch all saved data.
 */
export async function signInWithSupabase(
  emailInput: string,
  passwordInput: string
): Promise<{
  success: boolean;
  user?: any;
  profile?: SupabaseProfile;
  logs?: LogEntry[];
  journals?: JournalEntry[];
  smokingProfile?: SmokingProfile | null;
  error?: string;
}> {
  const email = emailInput.trim();

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured in environment variables."
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordInput
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Authentication failed." };
    }

    const userId = data.user.id;
    const displayName =
      data.user.user_metadata?.username || email.split("@")[0] || "user";

    const profileRes = await ensureUserProfile(
      userId,
      data.user.email || email,
      displayName
    );

    const cloud = await fetchUserDataFromSupabase(userId);

    return {
      success: true,
      user: data.user,
      profile: {
        ...(profileRes.profile || {
          id: userId,
          username: displayName,
          created_at: new Date().toISOString()
        }),
        smoking_profile: cloud.smokingProfile,
        seed_type: cloud.seedType
      },
      logs: cloud.logs,
      journals: cloud.journals,
      smokingProfile: cloud.smokingProfile
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sign in." };
  }
}

/**
 * Saves/syncs logs, journals, and smoking profile to public.user_data (JSONB).
 */
export async function syncUserProgressToSupabase(
  userId: string,
  logs: LogEntry[],
  journals: JournalEntry[],
  smokingProfile?: SmokingProfile | null,
  extraSettings?: { streak?: number; plantStage?: string; seedType?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const payload: Record<string, unknown> = {
      user_id: userId,
      logs: logs || [],
      journals: journals || [],
      seed_type: extraSettings?.seedType || "tomato",
      updated_at: new Date().toISOString()
    };

    if (smokingProfile !== undefined) {
      payload.smoking_profile = smokingProfile;
    }

    const { error } = await supabase
      .from("user_data")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("Error syncing progress to Supabase user_data:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error syncing progress to Supabase:", err);
    return false;
  }
}

/**
 * Fetches latest user data from Supabase across devices.
 */
export async function fetchUserDataFromSupabase(userId: string): Promise<{
  profile: SupabaseProfile | null;
  logs: LogEntry[];
  journals: JournalEntry[];
  smokingProfile: SmokingProfile | null;
  seedType: string;
}> {
  if (!isSupabaseConfigured() || !userId) {
    return { profile: null, logs: [], journals: [], smokingProfile: null, seedType: "tomato" };
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, created_at")
      .eq("id", userId)
      .maybeSingle();

    const { data: userData, error } = await supabase
      .from("user_data")
      .select("logs, journals, seed_type, smoking_profile")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user_data:", error.message);
    }

    const logs = mapLogsFromDb(userData?.logs);
    const journals = mapJournalsFromDb(userData?.journals);
    const smokingProfile = (userData?.smoking_profile as SmokingProfile | null) || null;
    const seedType = userData?.seed_type || "tomato";

    return {
      profile: profile
        ? { ...profile, smoking_profile: smokingProfile, seed_type: seedType }
        : null,
      logs,
      journals,
      smokingProfile,
      seedType
    };
  } catch (err) {
    console.error("Error fetching user data from Supabase:", err);
    return { profile: null, logs: [], journals: [], smokingProfile: null, seedType: "tomato" };
  }
}

/**
 * Updates user profile credentials (username, email, or password) in Supabase Auth & profiles table.
 */
export async function updateUserCredentialsInSupabase(
  userId: string,
  params: {
    newUsername?: string;
    newEmail?: string;
    newPassword?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const authUpdates: any = {};
    if (params.newEmail && params.newEmail.includes("@")) {
      authUpdates.email = params.newEmail;
    }
    if (params.newPassword && params.newPassword.length >= 6) {
      authUpdates.password = params.newPassword;
    }
    if (params.newUsername) {
      authUpdates.data = { username: params.newUsername };
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authErr } = await supabase.auth.updateUser(authUpdates);
      if (authErr) {
        console.warn("Supabase Auth updateUser warning:", authErr.message);
      }
    }

    // profiles table only has username (email lives in auth.users)
    if (params.newUsername && userId) {
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ username: params.newUsername })
        .eq("id", userId);

      if (profErr) {
        console.error("Error updating profile in Supabase:", profErr.message);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

/**
 * Permanently deletes user_data + profiles rows and signs out of Supabase.
 */
export async function deleteUserAccountAndDataFromSupabase(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: true };
  }

  try {
    await supabase.from("user_data").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting user data from Supabase:", err);
    return { success: false, error: err.message || "Failed to delete account data." };
  }
}

