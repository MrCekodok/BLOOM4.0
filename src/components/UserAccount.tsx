import { useState, useEffect, FormEvent } from "react";
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, LogOut, ShieldCheck, CheckCircle2, Mail, Database, Sparkles, Settings, Stethoscope } from "lucide-react";
import { Language, translate } from "../translations";
import NotificationSettings from "./NotificationSettings";
import { LegalTab } from "./LegalPagesModal";
import {
  signUpWithSupabase,
  signInWithSupabase,
  isSupabaseConfigured,
  fetchUserDataFromSupabase
} from "../lib/supabase";


interface UserAccountProps {
  onLoginStateChange?: (username: string | null) => void;
  language: Language;
  onOpenLegal?: (tab?: LegalTab) => void;
  onOpenSettings?: () => void;
}

export default function UserAccount({ onLoginStateChange, language, onOpenLegal, onOpenSettings }: UserAccountProps) {

  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);

  // Load active user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("bloom_current_user");
    if (savedUser) {
      setCurrentUser(savedUser);
      if (onLoginStateChange) onLoginStateChange(savedUser);
    }
  }, []);

  const clearInputs = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFeedback(null);
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!consentAgreed) {
      showFeedback("error", translate(language, "accErrConsentRequired"));
      return;
    }

    const trimmedEmail = email.trim();
    // Display name is derived from email — no separate username on signup
    const trimmedUser = trimmedEmail.split("@")[0] || "user";

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      showFeedback("error", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      showFeedback("error", translate(language, "accErrPassMin"));
      return;
    }

    if (password !== confirmPassword) {
      showFeedback("error", translate(language, "accErrPassMatch"));
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth First
      if (isSupabaseConfigured()) {
        const res = await signUpWithSupabase(trimmedEmail, trimmedUser, password);

        if (!res.success) {
          // If sign up fails, DO NOT insert any data into profiles or database!
          setIsLoading(false);
          showFeedback("error", res.error || "Sign-up failed with Supabase Auth.");
          return;
        }

        // Successfully created user & inserted into profiles table
        setActiveTab("login");
        setPassword("");
        setConfirmPassword("");
        setIsLoading(false);

        let successMsg = "";
        if (language === "ko") {
          successMsg = `Supabase 계정이 성공적으로 생성되어 profiles 테이블에 저장되었습니다! 로그인하여 동기화를 진행해 주세요.`;
        } else if (language === "zh") {
          successMsg = `Supabase 帐户建立成功，并已同步写入 profiles 数据表！请在此登录解锁。`;
        } else if (language === "ms") {
          successMsg = `Akaun Supabase berjaya dicipta dan disimpan dalam jadual profiles! Sila daftar masuk untuk penyelarasan.`;
        } else {
          successMsg = `Supabase account created & profile initialized in 'profiles' table! Please sign in to sync across devices.`;
        }

        showFeedback("success", successMsg);
        return;
      }

      // 2. Fallback to API endpoint if Supabase client keys not present
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, username: trimmedUser, password })
      });
      const data = await res.json();

      setIsLoading(false);

      if (!res.ok) {
        showFeedback("error", data.error || translate(language, "accErrUserTaken"));
        return;
      }

      // Sync local registry for offline backup
      const usersRaw = localStorage.getItem("bloom_registered_users");
      let users: { [key: string]: string } = {};
      if (usersRaw) {
        try { users = JSON.parse(usersRaw); } catch (e) {}
      }
      users[trimmedEmail.toLowerCase()] = password;
      localStorage.setItem("bloom_registered_users", JSON.stringify(users));

      setActiveTab("login");
      setPassword("");
      setConfirmPassword("");

      showFeedback("success", "Account created successfully! Please sign in to unlock your profile.");
    } catch (err: any) {
      setIsLoading(false);
      showFeedback("error", err.message || "Network connection issue. Failed to register.");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      showFeedback("error", "Please enter a valid email address.");
      return;
    }

    if (!password) {
      showFeedback("error", "Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth First
      if (isSupabaseConfigured()) {
        const res = await signInWithSupabase(trimmedEmail, password);

        if (!res.success) {
          setIsLoading(false);
          showFeedback("error", res.error || "Invalid sign-in credentials.");
          return;
        }

        const emailLocal = trimmedEmail.split("@")[0] || trimmedEmail;
        const authenticatedUser =
          res.profile?.username ||
          res.user?.user_metadata?.username ||
          emailLocal ||
          trimmedEmail;
        const userId = res.user?.id;

        // Sync cloud data retrieved from Supabase to local state & storage!
        if (userId) {
          localStorage.setItem(`bloom_supabase_user_id_${authenticatedUser}`, userId);
          if (emailLocal !== authenticatedUser) {
            localStorage.setItem(`bloom_supabase_user_id_${emailLocal}`, userId);
          }
        }
        if (res.logs && res.logs.length > 0) {
          localStorage.setItem(`bloom_recovery_logs_v4_${authenticatedUser}`, JSON.stringify(res.logs));
        }
        if (res.journals && res.journals.length > 0) {
          localStorage.setItem(`bloom_journal_entries_v4_${authenticatedUser}`, JSON.stringify(res.journals));
        }

        // Prefer cloud profile; fall back to any locally saved profile under known username keys
        let restoredProfile = res.smokingProfile || null;
        if (!restoredProfile) {
          for (const key of [authenticatedUser, emailLocal]) {
            const raw = localStorage.getItem(`bloom_smoking_profile_${key}`);
            if (!raw) continue;
            try {
              restoredProfile = JSON.parse(raw);
              break;
            } catch {
              /* ignore bad cache */
            }
          }
        }
        if (restoredProfile) {
          localStorage.setItem(
            `bloom_smoking_profile_${authenticatedUser}`,
            JSON.stringify(restoredProfile)
          );
        }

        // Returning users (already completed habit profile) skip the tutorial
        const tourAlreadySeen =
          restoredProfile?.hasSeenTour === true ||
          localStorage.getItem(`bloom_tour_guide_seen_${authenticatedUser}`) === "true" ||
          localStorage.getItem(`bloom_tour_guide_seen_${emailLocal}`) === "true" ||
          (userId
            ? localStorage.getItem(`bloom_tour_guide_seen_id_${userId}`) === "true"
            : false) ||
          localStorage.getItem("bloom_tour_guide_seen") === "true";

        if (restoredProfile) {
          localStorage.setItem(`bloom_tour_guide_seen_${authenticatedUser}`, "true");
          if (userId) {
            localStorage.setItem(`bloom_tour_guide_seen_id_${userId}`, "true");
          }
          if (!restoredProfile.hasSeenTour) {
            localStorage.setItem(
              `bloom_smoking_profile_${authenticatedUser}`,
              JSON.stringify({ ...restoredProfile, hasSeenTour: true })
            );
          }
        } else if (tourAlreadySeen) {
          localStorage.setItem(`bloom_tour_guide_seen_${authenticatedUser}`, "true");
          if (userId) {
            localStorage.setItem(`bloom_tour_guide_seen_id_${userId}`, "true");
          }
        }

        const isReturningUser = Boolean(restoredProfile);
        localStorage.setItem("bloom_current_user", authenticatedUser);
        localStorage.setItem("bloom_current_page", isReturningUser ? "home" : "did_consume");
        setCurrentUser(authenticatedUser);
        if (onLoginStateChange) onLoginStateChange(authenticatedUser);

        setIsLoading(false);
        showFeedback("success", `Signed in with Supabase Auth! Retrieved synced profile for ${authenticatedUser}.`);
        clearInputs();

        setTimeout(() => {
          window.location.reload();
        }, 600);
        return;
      }

      // 2. Fallback API Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedEmail, password })
      });
      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        showFeedback("error", data.error || translate(language, "accErrInvalid"));
        return;
      }

      const localUser = data.username || trimmedEmail.split("@")[0] || trimmedEmail;

      if (data.logs) {
        localStorage.setItem(`bloom_recovery_logs_v4_${localUser}`, JSON.stringify(data.logs));
      }
      if (data.journals) {
        localStorage.setItem(`bloom_journal_entries_v4_${localUser}`, JSON.stringify(data.journals));
      }
      if (data.smokingProfile) {
        localStorage.setItem(
          `bloom_smoking_profile_${localUser}`,
          JSON.stringify(data.smokingProfile)
        );
      }

      const hasLocalProfile = Boolean(
        data.smokingProfile || localStorage.getItem(`bloom_smoking_profile_${localUser}`)
      );
      if (hasLocalProfile) {
        localStorage.setItem(`bloom_tour_guide_seen_${localUser}`, "true");
      }

      localStorage.setItem("bloom_current_user", localUser);
      localStorage.setItem("bloom_current_page", hasLocalProfile ? "home" : "did_consume");
      setCurrentUser(localUser);
      if (onLoginStateChange) onLoginStateChange(localUser);

      showFeedback("success", translate(language, "accSuccessLogin", { username: localUser }));
      clearInputs();

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      setIsLoading(false);
      // Local fallback
      const usersRaw = localStorage.getItem("bloom_registered_users");
      let users: { [key: string]: string } = {};
      if (usersRaw) {
        try { users = JSON.parse(usersRaw); } catch (e) {}
      }
      const savedPassword = users[trimmedEmail.toLowerCase()];
      if (savedPassword && savedPassword === password) {
        const localUser = trimmedEmail.split("@")[0] || trimmedEmail;
        localStorage.setItem("bloom_current_user", localUser);
        localStorage.setItem("bloom_current_page", "did_consume");
        setCurrentUser(localUser);
        if (onLoginStateChange) onLoginStateChange(localUser);
        showFeedback("success", translate(language, "accSuccessLogin", { username: localUser }));
        clearInputs();
      } else {
        showFeedback("error", "Failed to sign in. Please check connection or password.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bloom_current_user");
    localStorage.setItem("bloom_just_logged_out", "true");
    setCurrentUser(null);
    if (onLoginStateChange) onLoginStateChange(null);
    showFeedback("success", translate(language, "accSuccessLogout"));
    clearInputs();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div 
      id="user-account-card" 
      className="select-none transition-all duration-300 relative overflow-hidden z-10 p-5 sm:p-7 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/70 shadow-2xl"
    >
      {/* Calming Left Growing Plant Illustration */}
      <div className="absolute left-[-12px] bottom-[-15px] pointer-events-none opacity-25 sm:opacity-40 select-none z-0">
        <svg width="90" height="150" viewBox="0 0 90 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[60px] sm:w-[80px] h-auto animate-[pulse_6s_ease-in-out_infinite]">
          <path d="M10,140 Q35,110 30,70 Q25,30 55,5" stroke="url(#acc-stem-left)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M22,110 C35,115 38,102 30,95 C22,88 18,98 22,110 Z" fill="url(#acc-leaf-left-1)" />
          <path d="M26,75 C10,72 6,60 14,56 C22,52 26,64 26,75 Z" fill="url(#acc-leaf-left-2)" />
          <path d="M28,45 C42,42 40,32 32,28 C24,24 18,34 28,45 Z" fill="url(#acc-leaf-left-1)" />
          <circle cx="45" cy="40" r="2.5" fill="#F4D03F" opacity="0.8" className="animate-ping [animation-duration:3s]" />
          <circle cx="15" cy="85" r="2" fill="emerald" opacity="0.6" />
          <defs>
            <linearGradient id="acc-stem-left" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B5E20" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
            <linearGradient id="acc-leaf-left-1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A2D9CE" />
              <stop offset="100%" stopColor="#2ECC71" />
            </linearGradient>
            <linearGradient id="acc-leaf-left-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8E6C9" />
              <stop offset="100%" stopColor="#81C784" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Calming Right Growing Plant Illustration */}
      <div className="absolute right-[-12px] bottom-[-15px] pointer-events-none opacity-25 sm:opacity-40 select-none z-0">
        <svg width="90" height="150" viewBox="0 0 90 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[60px] sm:w-[80px] h-auto animate-[pulse_6s_ease-in-out_infinite_1.5s]">
          <path d="M80,140 Q55,110 60,70 Q65,30 35,5" stroke="url(#acc-stem-right)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M68,110 C55,115 52,102 60,95 C68,88 72,98 68,110 Z" fill="url(#acc-leaf-right-1)" />
          <path d="M64,75 C80,72 84,60 76,56 C68,52 64,64 64,75 Z" fill="url(#acc-leaf-right-2)" />
          <path d="M62,45 C48,42 50,32 58,28 C66,24 72,34 62,45 Z" fill="url(#acc-leaf-right-1)" />
          <circle cx="45" cy="40" r="2.5" fill="#F4D03F" opacity="0.8" className="animate-ping [animation-duration:4s]" />
          <circle cx="75" cy="85" r="2" fill="#2ECC71" opacity="0.6" />
          <defs>
            <linearGradient id="acc-stem-right" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#2ECC71" />
              <stop offset="100%" stopColor="#81C784" />
            </linearGradient>
            <linearGradient id="acc-leaf-right-1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8F5E9" />
              <stop offset="100%" stopColor="#81C784" />
            </linearGradient>
            <linearGradient id="acc-leaf-right-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A2D9CE" />
              <stop offset="100%" stopColor="#45B39D" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {currentUser ? (
        /* LOGGED IN ACTIVE PROFILE SCREEN */
        <div className="space-y-4 relative z-10 bg-white/50 backdrop-blur-xs rounded-xl p-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-900" />
                {translate(language, "accTitleSecured")}
              </h3>
              {isSupabaseConfigured() && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Database className="w-3 h-3 text-emerald-600" /> Supabase Synced
                </span>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-emerald-850 hover:text-white bg-emerald-100 hover:bg-emerald-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer border-none"
            >
              <LogOut className="w-3.5 h-3.5" /> {translate(language, "accLogoutBtn")}
            </button>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 font-serif font-extrabold text-white flex items-center justify-center text-xl shrink-0 uppercase shadow-md">
                {currentUser.charAt(0)}
              </div>
              
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-sm">
                  {translate(language, "accLoggedInAs")} <span className="font-extrabold text-emerald-800">{currentUser}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Your progress, streak, companion plant stage, smoking records, and diary entries are securely synced to Supabase.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons for Account Management & Legal */}
            <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-2">
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer border-none shadow-xs transition-all"
                >
                  <Settings className="w-3.5 h-3.5" /> Account Settings
                </button>
              )}
              {onOpenLegal && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenLegal("privacy")}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/70 text-emerald-950 border border-emerald-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> Privacy & Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLegal("disclaimer")}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-950 border border-rose-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-rose-600" /> Medical Disclaimer
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLegal("contact")}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-950 border border-teal-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-700" /> Contact Support
                  </button>
                </>
              )}
            </div>
          </div>
          <NotificationSettings username={currentUser} language={language} />

        </div>
      ) : (
        /* LOGIN / SIGNUP SCREEN */
        <div className="space-y-3 sm:space-y-4 relative z-10">
          {/* Section Heading & Compact Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-serif font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4.5 h-4.5 text-emerald-900" />
                {translate(language, "accTitle")}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-800" />
                  {isSupabaseConfigured() ? "Supabase Cloud Auth & Database Active" : "Supabase Offline / Fallback Local Mode"}
                </span>
              </div>
            </div>
            
            {/* Tabs Selector */}
            <div className="inline-flex bg-emerald-50 rounded-full p-1 border border-emerald-100 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => { setActiveTab("signup"); setFeedback(null); }}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
                  activeTab === "signup"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {language === "zh" ? "注册" : language === "ms" ? "Daftar" : language === "ko" ? "회원가입" : "Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("login"); setFeedback(null); }}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
                  activeTab === "login"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {language === "zh" ? "登录" : language === "ms" ? "Daftar Masuk" : language === "ko" ? "로그인" : "Sign In"}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={activeTab === "signup" ? handleRegister : handleLogin} className="space-y-3">

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-emerald-900" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/60 border border-white/80 text-xs text-emerald-950 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:bg-white/90 transition-all shadow-xs font-semibold backdrop-blur-xs"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-emerald-900" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeTab === "signup" ? translate(language, "accSetPass") : (language === "zh" ? "输入您的密码..." : language === "ms" ? "Masukkan kata laluan anda..." : language === "ko" ? "비밀번호를 입력하세요..." : "Enter your password...")}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/60 border border-white/80 text-xs text-emerald-950 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:bg-white/90 transition-all shadow-xs font-semibold backdrop-blur-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer border-none bg-transparent"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password (only for signup) */}
            {activeTab === "signup" && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-emerald-900" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={translate(language, "accRepeatPass")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/60 border border-white/80 text-xs text-emerald-950 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:bg-white/90 transition-all shadow-xs font-semibold backdrop-blur-xs"
                  />
                </div>

                {/* Privacy & Consent Step Notice Box */}
                <div className="p-3.5 bg-white/50 backdrop-blur-xs border border-white/70 rounded-2xl space-y-2.5 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-serif font-black text-xs text-emerald-950 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-900" />
                      <span>{translate(language, "accPrivacyTitle")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer border-none bg-transparent"
                    >
                      {showPrivacyDetails ? "Hide Policy ▲" : translate(language, "accPrivacyViewDetails")}
                    </button>
                  </div>

                  <div className="space-y-1 text-[11px] font-medium text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-100/80">
                    <div>{translate(language, "accPrivacyPoint1")}</div>
                    <div>{translate(language, "accPrivacyPoint2")}</div>
                    <div>{translate(language, "accPrivacyPoint3")}</div>
                  </div>

                  {/* Expanded Policy Details */}
                  {showPrivacyDetails && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] text-stone-700 space-y-1.5 leading-relaxed animate-fadeIn">
                      <p className="font-bold text-emerald-950">📜 Privacy & Supabase Security Details:</p>
                      <ul className="list-disc pl-4 space-y-1 text-stone-600">
                        <li><strong>Supabase Auth:</strong> Authenticated securely via Supabase Auth with Row-Level Security (RLS).</li>
                        <li><strong>Profile Table:</strong> Creates an isolated row in the `profiles` table linked by `auth.users.id`.</li>
                        <li><strong>Cross-Device Sync:</strong> Your logs, streak, companion plant, and diary entries sync on any device.</li>
                      </ul>
                    </div>
                  )}

                  {/* Consent Agreement Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50/50 transition-all">
                    <input
                      type="checkbox"
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-emerald-700 bg-stone-50 border-emerald-300 rounded focus:ring-emerald-600 accent-emerald-700 cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-bold text-emerald-950 leading-tight">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenLegal) onOpenLegal("privacy");
                        }}
                        className="font-extrabold text-emerald-800 underline hover:text-emerald-950 cursor-pointer border-none bg-transparent p-0"
                      >
                        Privacy Policy
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenLegal) onOpenLegal("terms");
                        }}
                        className="font-extrabold text-emerald-800 underline hover:text-emerald-950 cursor-pointer border-none bg-transparent p-0"
                      >
                        Terms of Service
                      </button>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>

                </div>
              </>
            )}

            {/* Feedback Notifications */}
            {feedback && (
              <div 
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border transition-all ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                    : "bg-red-50 text-red-800 border-red-100"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <span className="w-4.5 h-4.5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">⚠️</span>
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border-none disabled:opacity-50"
            >
              {isLoading ? (
                <span>Connecting to Supabase...</span>
              ) : activeTab === "signup" ? (
                <>
                  <UserPlus className="w-4 h-4" /> {translate(language, "accCreateBtn")}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> {translate(language, "accLoginBtn")}
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
