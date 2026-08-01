import { useState, useEffect, FormEvent } from "react";
import { Settings, User, Mail, Lock, Trash2, ShieldAlert, CheckCircle2, X, AlertCircle } from "lucide-react";
import { Language, translate } from "../translations";
import {
  updateUserCredentialsInSupabase,
  deleteUserAccountAndDataFromSupabase,
  isSupabaseConfigured
} from "../lib/supabase";

interface AccountSettingsModalProps {
  isOpen: boolean;
  currentUser: string;
  onClose: () => void;
  onAccountUpdated: (newUsername: string) => void;
  onAccountDeleted: () => void;
  language: Language;
}

export default function AccountSettingsModal({
  isOpen,
  currentUser,
  onClose,
  onAccountUpdated,
  onAccountDeleted,
  language
}: AccountSettingsModalProps) {
  const [newUsername, setNewUsername] = useState(currentUser || "");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Deletion modal confirmation step
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNewUsername(currentUser);
      setFeedback(null);
      setShowDeleteConfirm(false);
      setDeleteConfirmInput("");
    }
  }, [currentUser, isOpen]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedUser = newUsername.trim();
    const trimmedEmail = newEmail.trim();

    if (!trimmedUser) {
      setFeedback({ type: "error", message: translate(language, "accErrUserEmpty") });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setFeedback({ type: "error", message: translate(language, "accErrPassMin") });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: translate(language, "accErrPassMatch") });
      return;
    }

    setIsLoading(true);

    try {
      const supabaseUserId = localStorage.getItem(`bloom_supabase_user_id_${currentUser}`) || "";

      // 1. Update in Supabase
      if (isSupabaseConfigured() && supabaseUserId) {
        await updateUserCredentialsInSupabase(supabaseUserId, {
          newUsername: trimmedUser !== currentUser ? trimmedUser : undefined,
          newEmail: trimmedEmail || undefined,
          newPassword: newPassword || undefined
        });
      }

      // 2. Update via server API endpoint
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUsername: currentUser,
          newUsername: trimmedUser !== currentUser ? trimmedUser : undefined,
          newEmail: trimmedEmail || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update profile settings." });
        return;
      }

      // Update local storage tracking if username changed
      if (trimmedUser !== currentUser) {
        localStorage.setItem("bloom_current_user", trimmedUser);
        const oldLogs = localStorage.getItem(`bloom_recovery_logs_v4_${currentUser}`);
        const oldJournals = localStorage.getItem(`bloom_journal_entries_v4_${currentUser}`);
        if (oldLogs) localStorage.setItem(`bloom_recovery_logs_v4_${trimmedUser}`, oldLogs);
        if (oldJournals) localStorage.setItem(`bloom_journal_entries_v4_${trimmedUser}`, oldJournals);
        if (supabaseUserId) localStorage.setItem(`bloom_supabase_user_id_${trimmedUser}`, supabaseUserId);
      }

      setFeedback({ type: "success", message: "Account settings updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onAccountUpdated(trimmedUser);
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: "error", message: err.message || "Error updating account settings." });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput.trim().toLowerCase() !== currentUser.trim().toLowerCase()) {
      setFeedback({ type: "error", message: `Please type "${currentUser}" exactly to confirm deletion.` });
      return;
    }

    setIsDeleting(true);

    try {
      const supabaseUserId = localStorage.getItem(`bloom_supabase_user_id_${currentUser}`) || "";

      // 1. Delete from Supabase
      if (isSupabaseConfigured() && supabaseUserId) {
        await deleteUserAccountAndDataFromSupabase(supabaseUserId);
      }

      // 2. Delete via server API
      await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser })
      });

      // Clear local storage entries
      localStorage.removeItem("bloom_current_user");
      localStorage.removeItem(`bloom_recovery_logs_v4_${currentUser}`);
      localStorage.removeItem(`bloom_journal_entries_v4_${currentUser}`);
      localStorage.removeItem(`bloom_supabase_user_id_${currentUser}`);

      setIsDeleting(false);
      onAccountDeleted();
    } catch (err: any) {
      setIsDeleting(false);
      setFeedback({ type: "error", message: "Failed to delete account. Please try again." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div 
        id="account-settings-modal"
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-2xl overflow-hidden text-stone-800"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-200">
              <Settings className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-serif font-extrabold tracking-wide uppercase">
                Account Settings
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                Manage your credentials and security preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {feedback && (
            <div 
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : "bg-red-50 text-red-800 border-red-100"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-800" />
                <span>Username</span>
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-800" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Update email address..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {/* Change Password */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-800" />
                <span>New Password (min 6 chars, optional)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {newPassword.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-none disabled:opacity-50"
            >
              {isLoading ? "Saving Changes..." : "Save Settings"}
            </button>
          </form>

          {/* Danger Zone: Permanent Account Deletion */}
          <div className="pt-4 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Danger Zone
              </span>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="text-xs font-bold text-red-600 hover:text-red-800 underline cursor-pointer border-none bg-transparent"
              >
                {showDeleteConfirm ? "Cancel Deletion" : "Delete Account"}
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3 animate-fadeIn">
                <p className="text-xs text-red-900 font-medium leading-relaxed">
                  ⚠️ <strong>Warning:</strong> Permanently deleting your account will erase all habit logs, diary entries, quit streaks, and companion plant progress from Supabase and local storage. This action cannot be undone.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-red-950 mb-1">
                    To confirm, type your username <span className="font-mono bg-red-100 px-1 py-0.5 rounded text-red-800">"{currentUser}"</span> below:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder={currentUser}
                    className="w-full px-3 py-2 rounded-xl border border-red-300 bg-white text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmInput.trim().toLowerCase() !== currentUser.trim().toLowerCase()}
                  className="w-full py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-none disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting Account..." : "Permanently Delete My Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
