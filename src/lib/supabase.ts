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
  email: string;
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
 * Prevents duplicate profile creation.
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  username: string
): Promise<{ success: boolean; profile?: SupabaseProfile; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      profile: {
        id: userId,
        email,
        username,
        created_at: new Date().toISOString()
      }
    };
  }

  try {
    // 1. Check if profile already exists
    const { data: existingProfile, error: fetchErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // 2. Insert new profile only if authentic and not duplicate
    const newProfile: SupabaseProfile = {
      id: userId,
      email,
      username: username || email.split("@")[0],
      created_at: new Date().toISOString()
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("profiles")
      .upsert(newProfile, { onConflict: "id" })
      .select("*")
      .single();

    if (insertErr) {
      console.error("Error creating Supabase profile:", insertErr.message);
      // Return newly built profile in memory as fallback if table missing
      return { success: true, profile: newProfile };
    }

    return { success: true, profile: inserted || newProfile };
  } catch (err: any) {
    console.error("Exception in ensureUserProfile:", err);
    return {
      success: true,
      profile: {
        id: userId,
        email,
        username,
        created_at: new Date().toISOString()
      }
    };
  }
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
  const username = usernameInput.trim();

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!username) {
    return { success: false, error: "Please enter a username." };
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
  emailOrUsername: string,
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
  const input = emailOrUsername.trim();

  if (!input) {
    return { success: false, error: "Please enter your email or username." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured in environment variables."
    };
  }

  try {
    // If input does not contain '@', check if username maps to an email or treat as format
    let targetEmail = input;
    if (!input.includes("@")) {
      // Look up profile by username
      const { data: foundProfile } = await supabase
        .from("profiles")
        .select("email, username")
        .eq("username", input)
        .maybeSingle();

      if (foundProfile && foundProfile.email) {
        targetEmail = foundProfile.email;
      } else {
        // Fallback email format for pure username accounts
        targetEmail = `${input.toLowerCase()}@bloom.app`;
      }
    }

    // Step 1: Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: passwordInput
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Authentication failed." };
    }

    const userId = data.user.id;

    // Step 2: Retrieve profile
    const profileRes = await ensureUserProfile(
      userId,
      data.user.email || targetEmail,
      data.user.user_metadata?.username || input
    );

    // Step 3: Retrieve saved smoking records / logs
    const { data: dbLogs } = await supabase
      .from("smoking_records")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    // Step 4: Retrieve saved diary / journal entries
    const { data: dbJournals } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    const formattedLogs: LogEntry[] = (dbLogs || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      habit: row.habit,
      consumed: Boolean(row.consumed),
      quantity: row.quantity,
      reason: row.reason,
      solution: row.solution,
      timestamp: row.timestamp
    }));

    const formattedJournals: JournalEntry[] = (dbJournals || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      text: row.text,
      timestamp: row.timestamp
    }));

    return {
      success: true,
      user: data.user,
      profile: profileRes.profile,
      logs: formattedLogs,
      journals: formattedJournals,
      smokingProfile: profileRes.profile?.smoking_profile || null
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sign in." };
  }
}

/**
 * Saves/syncs logs, journals, and smoking profile to Supabase database linked to user_id.
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
    // 1. Update Profile record with latest smokingProfile and progress
    const profileUpdate: Partial<SupabaseProfile> = {};
    if (smokingProfile !== undefined) profileUpdate.smoking_profile = smokingProfile;
    if (extraSettings?.streak !== undefined) profileUpdate.streak = extraSettings.streak;
    if (extraSettings?.plantStage !== undefined) profileUpdate.companion_plant_stage = extraSettings.plantStage;
    if (extraSettings?.seedType !== undefined) profileUpdate.seed_type = extraSettings.seedType;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from("profiles").update(profileUpdate).eq("id", userId);
    }

    // 2. Upsert smoking records
    if (logs && logs.length > 0) {
      const recordsToUpsert = logs.map((log) => ({
        id: log.id,
        user_id: userId,
        date: log.date,
        habit: log.habit,
        consumed: log.consumed,
        quantity: log.quantity || 0,
        reason: log.reason || "",
        solution: log.solution || "",
        timestamp: log.timestamp || new Date().toISOString()
      }));

      await supabase.from("smoking_records").upsert(recordsToUpsert, { onConflict: "id" });
    }

    // 3. Upsert diary entries
    if (journals && journals.length > 0) {
      const entriesToUpsert = journals.map((j) => ({
        id: j.id,
        user_id: userId,
        date: j.date,
        text: j.text,
        timestamp: j.timestamp || new Date().toISOString()
      }));

      await supabase.from("diary_entries").upsert(entriesToUpsert, { onConflict: "id" });
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
}> {
  if (!isSupabaseConfigured() || !userId) {
    return { profile: null, logs: [], journals: [] };
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const { data: dbLogs } = await supabase
      .from("smoking_records")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    const { data: dbJournals } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    const formattedLogs: LogEntry[] = (dbLogs || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      habit: row.habit,
      consumed: Boolean(row.consumed),
      quantity: row.quantity,
      reason: row.reason,
      solution: row.solution,
      timestamp: row.timestamp
    }));

    const formattedJournals: JournalEntry[] = (dbJournals || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      text: row.text,
      timestamp: row.timestamp
    }));

    return {
      profile: profile || null,
      logs: formattedLogs,
      journals: formattedJournals
    };
  } catch (err) {
    console.error("Error fetching user data from Supabase:", err);
    return { profile: null, logs: [], journals: [] };
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

    const profileUpdates: any = {};
    if (params.newUsername) profileUpdates.username = params.newUsername;
    if (params.newEmail) profileUpdates.email = params.newEmail;

    if (Object.keys(profileUpdates).length > 0 && userId) {
      const { error: profErr } = await supabase
        .from("profiles")
        .update(profileUpdates)
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
 * Permanently deletes user records (smoking_records, diary_entries, profiles) and logs out of Supabase.
 */
export async function deleteUserAccountAndDataFromSupabase(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: true };
  }

  try {
    // 1. Delete smoking records
    await supabase.from("smoking_records").delete().eq("user_id", userId);
    // 2. Delete diary entries
    await supabase.from("diary_entries").delete().eq("user_id", userId);
    // 3. Delete profile row
    await supabase.from("profiles").delete().eq("id", userId);
    // 4. Sign out
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting user data from Supabase:", err);
    return { success: false, error: err.message || "Failed to delete account data." };
  }
}

