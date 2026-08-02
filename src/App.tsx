import { useState, useEffect, useRef } from "react";
import { LogEntry, JournalEntry, SmokingProfile } from "./types";
import Header from "./components/Header";
import DailyCheckIn from "./components/DailyCheckIn";
import StreakCalendar from "./components/StreakCalendar";
import Journal from "./components/Journal";
import UserAccount from "./components/UserAccount";
import FlowerPot from "./components/FlowerPot";
import { Activity, Phone, ChevronRight, ArrowRight, ArrowLeft, Sparkles, Cloud, CloudOff, RefreshCw, Check } from "lucide-react";
import { Language, translate } from "./translations";
import LogoutScreen from "./components/LogoutScreen";
import { motion } from "motion/react";
import SmokingProfileSetup from "./components/SmokingProfileSetup";
import UrgeQuestModal from "./components/UrgeQuestModal";
import TourGuide from "./components/TourGuide";
import LanguageSelector from "./components/LanguageSelector";
import HealthQuestsModal, { HealthQuestType } from "./components/HealthQuestsModal";
import ThemeSelectorModal from "./components/ThemeSelectorModal";
import LegalPagesModal, { LegalTab } from "./components/LegalPagesModal";
import AccountSettingsModal from "./components/AccountSettingsModal";
import { getStoredTheme, applyTheme, ThemeId } from "./theme";
import greenhouseBg from "./assets/images/greenhouse_garden_bg_1785109902243.jpg";
import greenhouseInteriorBg from "./assets/images/greenhouse_interior_bg_1785110978329.jpg";
import { supabase, syncUserProgressToSupabase, fetchUserDataFromSupabase, isSupabaseConfigured } from "./lib/supabase";
import { isBloomAnalyticsEnabled } from "./lib/features";
import { buildWeeklyInsight, buildMonthlyInsight } from "./lib/weeklyInsights";
import WeeklyInsightsCard from "./components/WeeklyInsightsCard";

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHealthQuestsOpen, setIsHealthQuestsOpen] = useState<boolean>(false);
  const [activeHealthQuestTab, setActiveHealthQuestTab] = useState<HealthQuestType>("breathing");
  const [colorTheme, setColorTheme] = useState<ThemeId>(() => getStoredTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Legal & Account Settings Modals
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>("privacy");
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState<boolean>(false);

  const handleOpenLegal = (tab: LegalTab = "privacy") => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleOpenAccountSettings = () => {
    setIsAccountSettingsOpen(true);
  };


  useEffect(() => {
    applyTheme(colorTheme);
  }, [colorTheme]);
  const [smokingProfile, setSmokingProfile] = useState<SmokingProfile | null>(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("bloom_current_user");
      if (active) {
        const saved = localStorage.getItem(`bloom_smoking_profile_${active}`);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            return null;
          }
        }
      }
    }
    return null;
  });
  const seedType = "tomato";

  // Local date helper to avoid timezone shifts
  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Keep track of the actual, live real-world date to detect structural date changes
  const [realLocalDate, setRealLocalDate] = useState<string>(() => getLocalDateString());

  // Simulation/Working tracking day state
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    const liveToday = getLocalDateString();
    if (typeof window !== "undefined") {
      const lastKnownReal = localStorage.getItem("bloom_last_known_real_date");
      if (lastKnownReal && lastKnownReal !== liveToday) {
        // A new day in the normal calendar has arrived! Reset active date back to the exact date
        localStorage.setItem("bloom_last_known_real_date", liveToday);
        localStorage.setItem("bloom_simulated_date", liveToday);
        return liveToday;
      } else {
        localStorage.setItem("bloom_last_known_real_date", liveToday);
      }
      const saved = localStorage.getItem("bloom_simulated_date");
      if (saved) return saved;
    }
    return liveToday;
  });

  const handleCurrentDateChange = (newDate: string) => {
    setCurrentDateStr(newDate);
    localStorage.setItem("bloom_simulated_date", newDate);
  };

  // Periodically check if the physical real-world day has advanced
  useEffect(() => {
    const checkRealDayShift = () => {
      const liveRealDate = getLocalDateString();
      if (liveRealDate !== realLocalDate) {
        // Day changed in normal calendar! Automatically change current day to the exact date
        setRealLocalDate(liveRealDate);
        setCurrentDateStr(liveRealDate);
        localStorage.setItem("bloom_last_known_real_date", liveRealDate);
        localStorage.setItem("bloom_simulated_date", liveRealDate);
      }
    };

    const interval = setInterval(checkRealDayShift, 5000);
    return () => clearInterval(interval);
  }, [realLocalDate]);

  const [currentAvatarId, setCurrentAvatarId] = useState<string>("peony");
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("bloom_language") as Language) || "en"
  );
  
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bloom_just_logged_out") === "true";
    }
    return false;
  });

  const handleCloseLogoutOverlay = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bloom_just_logged_out");
    }
    setShowLogoutOverlay(false);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("bloom_language", lang);
  };

  // Safely restore user logs & journal entries from localStorage on load
  const [activeUser, setActiveUser] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bloom_current_user") || null;
    }
    return null;
  });

  // Coins & Plant State Management
  const [spentCoins, setSpentCoins] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("bloom_current_user");
      if (active) {
        const saved = localStorage.getItem(`bloom_spent_coins_${active}`);
        return saved ? parseInt(saved, 10) || 0 : 0;
      }
    }
    return 0;
  });

  const [isPlantBroken, setIsPlantBroken] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("bloom_current_user");
      if (active) {
        return localStorage.getItem(`bloom_plant_is_broken_${active}`) === "true";
      }
    }
    return false;
  });

  const [restoredDate, setRestoredDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("bloom_current_user");
      if (active) {
        return localStorage.getItem(`bloom_plant_restored_date_${active}`) || "";
      }
    }
    return "";
  });

  const [savedPlantLevel, setSavedPlantLevel] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("bloom_current_user");
      if (active) {
        const saved = localStorage.getItem(`bloom_saved_plant_level_${active}`);
        return saved ? parseInt(saved, 10) || 0 : 0;
      }
    }
    return 0;
  });

  // Reload plant & coins state when activeUser changes
  useEffect(() => {
    if (activeUser) {
      const savedSpent = localStorage.getItem(`bloom_spent_coins_${activeUser}`);
      setSpentCoins(savedSpent ? parseInt(savedSpent, 10) || 0 : 0);

      const savedBroken = localStorage.getItem(`bloom_plant_is_broken_${activeUser}`);
      setIsPlantBroken(savedBroken === "true");

      const savedRestored = localStorage.getItem(`bloom_plant_restored_date_${activeUser}`);
      setRestoredDate(savedRestored || "");

      const savedLevel = localStorage.getItem(`bloom_saved_plant_level_${activeUser}`);
      setSavedPlantLevel(savedLevel ? parseInt(savedLevel, 10) || 0 : 0);
    } else {
      setSpentCoins(0);
      setIsPlantBroken(false);
      setRestoredDate("");
      setSavedPlantLevel(0);
    }
  }, [activeUser]);

  const [currentPage, setCurrentPage] = useState<"did_consume" | "plant_progress" | "home">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bloom_current_page");
      if (saved === "did_consume" || saved === "plant_progress" || saved === "home") {
        return saved;
      }
    }
    return "did_consume";
  });

  const handleSetCurrentPage = (page: "did_consume" | "plant_progress" | "home") => {
    setCurrentPage(page);
    localStorage.setItem("bloom_current_page", page);
  };

  // Prevent empty local state from wiping Supabase before cloud hydrate finishes
  const [cloudHydrated, setCloudHydrated] = useState(false);
  type CloudSyncStatus = "synced" | "pending" | "syncing" | "offline";
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(() =>
    typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "synced"
  );
  const syncPayloadRef = useRef({
    logs,
    journals,
    smokingProfile,
    activeUser,
    seedType,
    cloudHydrated: false as boolean
  });
  const runCloudSyncRef = useRef<(reason?: string) => Promise<void>>(async () => {});

  useEffect(() => {
    syncPayloadRef.current = {
      logs,
      journals,
      smokingProfile,
      activeUser,
      seedType,
      cloudHydrated
    };
  }, [logs, journals, smokingProfile, activeUser, seedType, cloudHydrated]);

  runCloudSyncRef.current = async () => {
    const payload = syncPayloadRef.current;
    if (!payload.activeUser || !payload.cloudHydrated) return;

    const pendingKey = `bloom_sync_pending_${payload.activeUser}`;

    // Always persist locally first (offline-safe)
    localStorage.setItem(`bloom_recovery_logs_v4_${payload.activeUser}`, JSON.stringify(payload.logs));
    localStorage.setItem(`bloom_journal_entries_v4_${payload.activeUser}`, JSON.stringify(payload.journals));
    if (payload.smokingProfile) {
      localStorage.setItem(
        `bloom_smoking_profile_${payload.activeUser}`,
        JSON.stringify(payload.smokingProfile)
      );
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      localStorage.setItem(pendingKey, "1");
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");

    try {
      let supabaseOk = true;
      if (isSupabaseConfigured()) {
        const userId = localStorage.getItem(`bloom_supabase_user_id_${payload.activeUser}`) || "";
        if (userId) {
          supabaseOk = await syncUserProgressToSupabase(
            userId,
            payload.logs,
            payload.journals,
            payload.smokingProfile,
            { seedType: payload.seedType }
          );
        }
      }

      try {
        await fetch("/api/sync/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: payload.activeUser,
            logs: payload.logs,
            journals: payload.journals,
            seedType: payload.seedType
          })
        });
      } catch {
        // Local Express sync is optional; Supabase is the cloud source of truth.
      }

      if (supabaseOk || !isSupabaseConfigured()) {
        localStorage.removeItem(pendingKey);
        setSyncStatus("synced");
      } else {
        localStorage.setItem(pendingKey, "1");
        setSyncStatus("pending");
      }
    } catch (err) {
      console.warn("Auto-sync could not reach server. Updates stored locally.", err);
      localStorage.setItem(pendingKey, "1");
      setSyncStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "pending");
    }
  };

  useEffect(() => {
    // Proactively delete older data versions to ensure a completely fresh start
    localStorage.removeItem("bloom_recovery_logs_raw");
    localStorage.removeItem("bloom_recovery_logs");
    localStorage.removeItem("bloom_recovery_logs_v2");
    setCloudHydrated(false);
    
    if (activeUser) {
      const savedProf = localStorage.getItem(`bloom_smoking_profile_${activeUser}`);
      if (savedProf) {
        try {
          setSmokingProfile(JSON.parse(savedProf));
        } catch (e) {
          setSmokingProfile(null);
        }
      } else {
        setSmokingProfile(null);
      }

      const saved = localStorage.getItem(`bloom_recovery_logs_v4_${activeUser}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLogs(parsed);
        } catch (err) {
          console.error("Error parsing saved recovery logs:", err);
          setLogs([]);
        }
      } else {
        // Import legacy global logs if they exist during initial migration
        const oldLogs = localStorage.getItem("bloom_recovery_logs_v4");
        if (oldLogs) {
          try {
            const parsed = JSON.parse(oldLogs);
            setLogs(parsed);
            localStorage.setItem(`bloom_recovery_logs_v4_${activeUser}`, oldLogs);
          } catch (e) {
            setLogs([]);
          }
        } else {
          setLogs([]);
        }
      }

      const savedJournals = localStorage.getItem(`bloom_journal_entries_v4_${activeUser}`);
      if (savedJournals) {
        try {
          setJournals(JSON.parse(savedJournals));
        } catch (err) {
          console.error("Error parsing saved journals:", err);
          setJournals([]);
        }
      } else {
        const oldJournals = localStorage.getItem("bloom_journal_entries_v4");
        if (oldJournals) {
          try {
            const parsed = JSON.parse(oldJournals);
            setJournals(parsed);
            localStorage.setItem(`bloom_journal_entries_v4_${activeUser}`, oldJournals);
          } catch (e) {
            setJournals([]);
          }
        } else {
          setJournals([]);
        }
      }
    } else {
      // If user logs out, all data completely vanishes
      setLogs([]);
      setJournals([]);
      setSmokingProfile(null);
      setIsGuideOpen(false);
      setCloudHydrated(true);
    }
  }, [activeUser]);

  // Hydrate Progress Tracker logs/journals from Supabase user_data
  useEffect(() => {
    if (!activeUser || !isSupabaseConfigured()) {
      setCloudHydrated(true);
      return;
    }

    let cancelled = false;

    const hydrateFromCloud = async () => {
      try {
        const userId = localStorage.getItem(`bloom_supabase_user_id_${activeUser}`) || "";
        let resolvedUserId = userId;

        if (!resolvedUserId) {
          const { data } = await supabase.auth.getSession();
          resolvedUserId = data.session?.user?.id || "";
          if (resolvedUserId) {
            localStorage.setItem(`bloom_supabase_user_id_${activeUser}`, resolvedUserId);
          }
        }

        if (!resolvedUserId) {
          if (!cancelled) setCloudHydrated(true);
          return;
        }

        const cloud = await fetchUserDataFromSupabase(resolvedUserId);
        if (cancelled) return;

        const mergeById = <T extends { id: string }>(local: T[], remote: T[]): T[] => {
          const map = new Map<string, T>();
          [...remote, ...local].forEach((item) => {
            if (item?.id) map.set(item.id, item);
          });
          return Array.from(map.values());
        };

        if (cloud.logs.length > 0 || cloud.journals.length > 0 || cloud.smokingProfile) {
          setLogs((prev) => {
            const merged = mergeById(prev, cloud.logs);
            localStorage.setItem(`bloom_recovery_logs_v4_${activeUser}`, JSON.stringify(merged));
            return merged;
          });
          setJournals((prev) => {
            const merged = mergeById(prev, cloud.journals);
            localStorage.setItem(`bloom_journal_entries_v4_${activeUser}`, JSON.stringify(merged));
            return merged;
          });
          if (cloud.smokingProfile) {
            setSmokingProfile(cloud.smokingProfile);
            localStorage.setItem(
              `bloom_smoking_profile_${activeUser}`,
              JSON.stringify(cloud.smokingProfile)
            );
          }
        }
      } catch (err) {
        console.warn("Could not hydrate progress from Supabase:", err);
      } finally {
        if (!cancelled) setCloudHydrated(true);
      }
    };

    hydrateFromCloud();
    return () => {
      cancelled = true;
    };
  }, [activeUser]);

  // Check if onboarding tour guide should pop up (first time user completes profile)
  useEffect(() => {
    if (activeUser && smokingProfile) {
      const isDone = localStorage.getItem(`bloom_tour_guide_seen_${activeUser}`);
      if (!isDone) {
        setIsGuideOpen(true);
      }
    }
  }, [activeUser, smokingProfile]);



  // Local-first persist + cloud sync (with offline pending queue)
  useEffect(() => {
    if (!activeUser || !cloudHydrated) return;

    // Avoid wiping richer local cache with an empty in-memory state (load race)
    if (logs.length === 0) {
      try {
        const existingRaw = localStorage.getItem(`bloom_recovery_logs_v4_${activeUser}`);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        if (Array.isArray(existing) && existing.length > 0) {
          setLogs(existing);
          return;
        }
      } catch {
        // continue with empty
      }
    }

    localStorage.setItem(`bloom_recovery_logs_v4_${activeUser}`, JSON.stringify(logs));
    localStorage.setItem(`bloom_journal_entries_v4_${activeUser}`, JSON.stringify(journals));
    if (smokingProfile) {
      localStorage.setItem(`bloom_smoking_profile_${activeUser}`, JSON.stringify(smokingProfile));
    }

    const pendingKey = `bloom_sync_pending_${activeUser}`;
    localStorage.setItem(pendingKey, "1");
    setSyncStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "pending");

    const timer = setTimeout(() => {
      void runCloudSyncRef.current();
    }, 1200);

    return () => clearTimeout(timer);
  }, [logs, journals, smokingProfile, activeUser, seedType, cloudHydrated]);

  // Auto-retry sync when connection returns
  useEffect(() => {
    const handleOnline = () => {
      const user = syncPayloadRef.current.activeUser;
      const pending = user ? localStorage.getItem(`bloom_sync_pending_${user}`) === "1" : false;
      if (pending || syncPayloadRef.current.cloudHydrated) {
        void runCloudSyncRef.current();
      }
    };
    const handleOffline = () => {
      setSyncStatus("offline");
      const user = syncPayloadRef.current.activeUser;
      if (user) localStorage.setItem(`bloom_sync_pending_${user}`, "1");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Register Service Worker and proactively ask for notification permission on first load if logged in
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      // Register service worker
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  // Request notification permission on first load if logged in and permission is default
  useEffect(() => {
    if (!activeUser) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    if (Notification.permission === "default") {
      const askPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const registration = await navigator.serviceWorker.ready;
            
            // Get VAPID public key
            const keyRes = await fetch("/api/notifications/vapid-public-key");
            const keyData = await keyRes.json();
            if (keyData.publicKey) {
              // Convert base64
              const padding = "=".repeat((4 - (keyData.publicKey.length % 4)) % 4);
              const base64 = (keyData.publicKey + padding).replace(/\-/g, "+").replace(/_/g, "/");
              const rawData = window.atob(base64);
              const convertedVapidKey = new Uint8Array(rawData.length);
              for (let i = 0; i < rawData.length; ++i) {
                convertedVapidKey[i] = rawData.charCodeAt(i);
              }

              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
              });

              // Register on backend
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
              await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: activeUser,
                  subscription,
                  enabled: true,
                  time: "19:00",
                  timezone
                })
              });
            }
          }
        } catch (err) {
          console.error("Error auto-prompting push notification subscription:", err);
        }
      };

      // Delay prompt slightly so it doesn't pop up instantly, making it feel organic and warm
      const promptTimer = setTimeout(() => {
        askPermission();
      }, 3000);
      return () => clearTimeout(promptTimer);
    }
  }, [activeUser]);

  const handleClearAll = () => {
    // Clear all recovery data versions
    localStorage.removeItem("bloom_recovery_logs_raw");
    localStorage.removeItem("bloom_recovery_logs");
    localStorage.removeItem("bloom_recovery_logs_v2");
    localStorage.removeItem("bloom_recovery_logs_v4");

    if (activeUser) {
      localStorage.removeItem(`bloom_recovery_logs_v4_${activeUser}`);
      localStorage.removeItem(`bloom_journal_entries_v4_${activeUser}`);
      localStorage.removeItem(`bloom_seed_type_${activeUser}`);
      localStorage.removeItem(`bloom_smoking_profile_${activeUser}`);
    }
    
    // Clear all general journals
    localStorage.removeItem("bloom_journal_entries_v4");
    
    // Clear background notifications preference state
    localStorage.removeItem("bloom_reminders_enabled");
    localStorage.removeItem("bloom_reminder_time");
    localStorage.removeItem("bloom_last_notified_date");

    setLogs([]);
    setJournals([]);
    
    // Reload dynamically to apply changes. Since we do not delete bloom_current_user or bloom_registered_users, they remain logged in!
    window.location.reload();
  };

  const handleAddJournal = (text: string) => {
    const TODAY_STR = currentDateStr;
    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: TODAY_STR,
      text: text,
      timestamp: new Date().toISOString()
    };
    setJournals((prev) => {
      const updated = [...prev, newEntry];
      if (activeUser) {
        localStorage.setItem(`bloom_journal_entries_v4_${activeUser}`, JSON.stringify(updated));
      }
      localStorage.setItem("bloom_journal_entries_v4", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteJournal = (id: string) => {
    setJournals((prev) => {
      const updated = prev.filter(item => item.id !== id);
      if (activeUser) {
        localStorage.setItem(`bloom_journal_entries_v4_${activeUser}`, JSON.stringify(updated));
      }
      localStorage.setItem("bloom_journal_entries_v4", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogAdded = (newEntry: LogEntry) => {
    if (newEntry.consumed) {
      setIsPlantBroken(true);
      if (activeUser) {
        localStorage.setItem(`bloom_plant_is_broken_${activeUser}`, "true");
      }
    }
    setLogs((prev) => {
      // Avoid duplicates for same habit on same date
      const filtered = prev.filter(l => !(l.date === newEntry.date && l.habit === newEntry.habit));
      const updated = [...filtered, newEntry];
      if (activeUser) {
        localStorage.setItem(`bloom_recovery_logs_v4_${activeUser}`, JSON.stringify(updated));
      }
      localStorage.setItem("bloom_recovery_logs_v4", JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleDay = (
    dateString: string, 
    consumed: boolean, 
    habit: any, 
    reason?: string, 
    solution?: string
  ) => {
    if (consumed) {
      setIsPlantBroken(true);
      if (activeUser) {
        localStorage.setItem(`bloom_plant_is_broken_${activeUser}`, "true");
      }
    }
    setLogs((prev) => {
      // Remove previous entry for same date and habit
      const filtered = prev.filter(l => !(l.date === dateString && l.habit === habit));
      
      const newLog: LogEntry = {
        id: `retro-${Date.now()}`,
        date: dateString,
        habit: habit || "vape",
        consumed: consumed,
        reason: reason,
        solution: solution,
        timestamp: new Date().toISOString()
      };

      const updated = [...filtered, newLog];
      if (activeUser) {
        localStorage.setItem(`bloom_recovery_logs_v4_${activeUser}`, JSON.stringify(updated));
      }
      localStorage.setItem("bloom_recovery_logs_v4", JSON.stringify(updated));
      return updated;
    });
  };

  // Coins & Clean Days Calculations
  const cleanDaysCount = (() => {
    const cleanDates = new Set<string>();
    logs.forEach((l) => {
      if (!l.consumed) {
        cleanDates.add(l.date);
      }
    });
    return cleanDates.size;
  })();

  const totalEarnedCoins = cleanDaysCount * 5;
  const coinsBalance = Math.max(0, totalEarnedCoins - spentCoins);

  // Current streak calculation
  const currentStreak = (() => {
    let streak = 0;
    let checkDateString = currentDateStr || new Date().toISOString().split("T")[0];
    while (true) {
      const dayLogs = logs.filter((l) => l.date === checkDateString);
      if (dayLogs.length === 0) break;
      if (dayLogs.some((l) => l.consumed)) break;
      streak++;
      const d = new Date(checkDateString);
      d.setDate(d.getDate() - 1);
      checkDateString = d.toISOString().split("T")[0];
    }
    return streak;
  })();

  // Map current streak to growth stage index (1-8) matching FlowerPot
  const getStageFromStreak = (s: number): number => {
    if (s <= 0) return 1;
    if (s === 1) return 2;
    if (s === 2) return 3;
    if (s === 3) return 4;
    if (s === 4) return 5;
    if (s === 5) return 6;
    if (s === 6) return 7;
    return 8;
  };

  const currentStreakStage = getStageFromStreak(currentStreak);

  // Synchronize savedPlantLevel when currentStreakStage reaches new high
  useEffect(() => {
    if (currentStreakStage > savedPlantLevel) {
      setSavedPlantLevel(currentStreakStage);
      if (activeUser) {
        localStorage.setItem(`bloom_saved_plant_level_${activeUser}`, String(currentStreakStage));
      }
    }
  }, [currentStreakStage, savedPlantLevel, activeUser]);

  // Check if plant should be marked as broken/withered (due to consumption or missing previous day's check-in)
  useEffect(() => {
    const todayStr = currentDateStr || new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check if consumed recently
    const recentConsumedLog = logs
      .filter((l) => (l.date === todayStr || l.date === yesterdayStr) && l.consumed)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    // Check if user missed yesterday's log
    const hasLogsBeforeYesterday = logs.some((l) => l.date < yesterdayStr);
    const hasYesterdayLog = logs.some((l) => l.date === yesterdayStr);
    const missedYesterday = hasLogsBeforeYesterday && !hasYesterdayLog;

    const latestBreakDate = recentConsumedLog ? recentConsumedLog.date : (missedYesterday ? yesterdayStr : null);

    if (latestBreakDate) {
      // If user has restored on or after the latest break date, do not re-wither
      if (restoredDate && restoredDate >= latestBreakDate) {
        return;
      }
      if (!isPlantBroken) {
        setIsPlantBroken(true);
        if (activeUser) {
          localStorage.setItem(`bloom_plant_is_broken_${activeUser}`, "true");
        }
      }
    }
  }, [logs, currentDateStr, activeUser, isPlantBroken, restoredDate]);

  const effectivePlantLevel = Math.max(1, savedPlantLevel, currentStreakStage);

  // Restore plant handler
  const handleRestorePlant = () => {
    if (coinsBalance >= 20) {
      const todayStr = currentDateStr || new Date().toISOString().split("T")[0];
      const newSpent = spentCoins + 20;
      setSpentCoins(newSpent);
      setIsPlantBroken(false);
      setRestoredDate(todayStr);
      if (activeUser) {
        localStorage.setItem(`bloom_spent_coins_${activeUser}`, String(newSpent));
        localStorage.setItem(`bloom_plant_is_broken_${activeUser}`, "false");
        localStorage.setItem(`bloom_plant_restored_date_${activeUser}`, todayStr);
      }
    }
  };

  // Habit metrics calculator for analytical self-awareness
  const getTriggerStats = () => {
    const consumedLogs = logs.filter(l => l.consumed && l.reason);
    const triggers: { [key: string]: number } = {};
    
    consumedLogs.forEach(entry => {
      const text = entry.reason?.toLowerCase() || "";
      if (text.includes("stress") || text.includes("anxious") || text.includes("exam") || text.includes("study") || text.includes("school")) {
        triggers["Deep Stress / Exams"] = (triggers["Deep Stress / Exams"] || 0) + 1;
      } else if (text.includes("friend") || text.includes("peer") || text.includes("party") || text.includes("social") || text.includes("cool")) {
        triggers["Peer Environment"] = (triggers["Peer Environment"] || 0) + 1;
      } else if (text.includes("bore") || text.includes("nothing") || text.includes("idle")) {
        triggers["Boredom & Free Time"] = (triggers["Boredom & Free Time"] || 0) + 1;
      } else {
        triggers["Fatigue & Others"] = (triggers["Fatigue & Others"] || 0) + 1;
      }
    });

    const total = Object.values(triggers).reduce((sum, val) => sum + val, 0);
    return Object.entries(triggers).map(([category, count]) => ({
      category,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      count
    })).sort((a,b) => b.percentage - a.percentage);
  };

  const stats = getTriggerStats();

  const handleLogout = () => {
    localStorage.removeItem("bloom_current_user");
    localStorage.setItem("bloom_just_logged_out", "true");
    setActiveUser(null);
    window.location.reload();
  };

  const isCompactPage = !activeUser || currentPage !== "home";
  const isAuthOrOnboardingPage = !activeUser || !smokingProfile;

  return (
    <div className={`min-h-screen pb-12 pt-3 sm:pt-6 px-3 sm:px-6 relative overflow-y-auto ${
      isAuthOrOnboardingPage 
        ? "bg-emerald-950/80" 
        : "bg-emerald-950/60"
    }`}>
      {/* Offline / sync status — local-first redundancy */}
      {activeUser && (
        <button
          type="button"
          onClick={() => {
            if (syncStatus === "pending" || syncStatus === "offline") {
              void runCloudSyncRef.current();
            }
          }}
          title={
            syncStatus === "pending" || syncStatus === "offline"
              ? translate(language, "syncRetry")
              : undefined
          }
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md border backdrop-blur-md transition-all cursor-pointer ${
            syncStatus === "synced"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 opacity-80 hover:opacity-100"
              : syncStatus === "syncing"
                ? "bg-sky-50/95 border-sky-200 text-sky-800"
                : syncStatus === "offline"
                  ? "bg-amber-50/95 border-amber-300 text-amber-900"
                  : "bg-orange-50/95 border-orange-300 text-orange-900"
          }`}
        >
          {syncStatus === "synced" && <Check className="w-3.5 h-3.5" />}
          {syncStatus === "syncing" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          {syncStatus === "offline" && <CloudOff className="w-3.5 h-3.5" />}
          {syncStatus === "pending" && <Cloud className="w-3.5 h-3.5" />}
          <span>
            {syncStatus === "synced" && translate(language, "syncSynced")}
            {syncStatus === "syncing" && translate(language, "syncSyncing")}
            {syncStatus === "offline" && translate(language, "syncOffline")}
            {syncStatus === "pending" && translate(language, "syncPending")}
          </span>
        </button>
      )}

      {/* Greenhouse Atmosphere Backdrop */}
      {isAuthOrOnboardingPage ? (
        /* Greenhouse Garden Outdoor Atmosphere Backdrop for Auth, Profile Setup, and Seed Selection Pages */
        <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <img
            src={greenhouseBg}
            alt="Atmosphere outside of the greenhouse"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.92] contrast-[1.05]"
          />
          {/* Natural Sunlight & Garden Atmosphere Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-emerald-950/20 to-stone-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-transparent to-stone-900/10" />

          {/* Gentle Floating Golden Sunbeam / Garden Petal Particles */}
          <div className="absolute inset-0 overflow-hidden opacity-75">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: "105vh", x: `${8 + i * 12}%` }}
                animate={{
                  opacity: [0, 0.9, 0],
                  y: ["105vh", "-10vh"],
                  x: [`${8 + i * 12}%`, `${14 + i * 10}%`, `${6 + i * 14}%`],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 10 + i * 2.5,
                  delay: i * 1.5,
                  ease: "easeInOut"
                }}
                className="absolute w-2.5 h-2.5 rounded-full bg-amber-200/90 blur-[1px] shadow-[0_0_10px_rgba(251,191,36,0.9)]"
              />
            ))}
          </div>
        </div>
      ) : (
        /* Greenhouse Interior Atmosphere Backdrop for Daily Check In, Companion Plant, and Home Pages */
        <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <img
            src={greenhouseInteriorBg}
            alt="Atmosphere inside the greenhouse"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.92] contrast-[1.05]"
          />
          {/* Warm Interior Sunlight & Glass Roof Atmosphere Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/25 via-emerald-950/15 to-stone-950/35 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-amber-900/10" />

          {/* Soft Floating Indoor Sunbeam Particles */}
          <div className="absolute inset-0 overflow-hidden opacity-75">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: "105vh", x: `${5 + i * 9}%` }}
                animate={{
                  opacity: [0, 0.85, 0],
                  y: ["105vh", "-10vh"],
                  x: [`${5 + i * 9}%`, `${10 + i * 8}%`, `${4 + i * 10}%`],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 12 + i * 2,
                  delay: i * 1.2,
                  ease: "easeInOut"
                }}
                className="absolute w-2 h-2 rounded-full bg-amber-100/90 blur-[1px] shadow-[0_0_8px_rgba(254,240,138,0.9)]"
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative z-10 w-full">
        
        {/* Serene Floating Header with glassmorphic design - Rendered for authenticated users on home page */}
        {activeUser && currentPage === "home" && (
          <div className="bg-white/85 backdrop-blur-md border border-white/55 shadow-xl relative z-10 rounded-[2rem] p-4 sm:p-6">
            <Header onAvatarChanged={(avatarId) => setCurrentAvatarId(avatarId)} logs={logs} activeUser={activeUser} language={language} currentDateStr={currentDateStr} coins={coinsBalance} onLogout={handleLogout} onOpenGuide={() => setIsGuideOpen(true)} onOpenThemeSelector={() => setIsThemeModalOpen(true)} compact={currentPage !== "home"} />
          </div>
        )}

        {activeUser && currentPage === "home" && (
          /* Sticky Mobile-Friendly Visual Stepper Bar for Seamless Page Navigation */
          <div className="flex justify-center items-center gap-1.5 sm:gap-3 bg-white/90 backdrop-blur-md border border-white/60 shadow-md relative z-30 w-full animate-fade-in select-none rounded-2xl sm:rounded-[2rem] px-2.5 sm:px-4 py-2 sm:py-3 sticky top-2">
            {/* Step 1: Check-in */}
            <button
              onClick={() => handleSetCurrentPage("did_consume")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                (currentPage as string) === "did_consume"
                  ? "bg-emerald-700 text-white shadow-xs hover:bg-emerald-750 scale-102"
                  : "text-emerald-950 hover:bg-emerald-50/80"
              }`}
            >
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black border ${(currentPage as string) === "did_consume" ? "bg-white/20 border-white text-white" : "bg-emerald-100 border-emerald-200 text-emerald-800"}`}>1</span>
              <span>{translate(language, "navCheckIn")}</span>
            </button>

            {/* Divider */}
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800/40 shrink-0" />

            {/* Step 2: Digital Plant */}
            <button
              onClick={() => handleSetCurrentPage("plant_progress")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                (currentPage as string) === "plant_progress"
                  ? "bg-emerald-700 text-white shadow-xs hover:bg-emerald-750 scale-102"
                  : "text-emerald-950 hover:bg-emerald-50/80"
              }`}
            >
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black border ${(currentPage as string) === "plant_progress" ? "bg-white/20 border-white text-white" : "bg-emerald-100 border-emerald-200 text-emerald-800"}`}>2</span>
              <span>{translate(language, "navPlant")}</span>
            </button>

            {/* Divider */}
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800/40 shrink-0" />

            {/* Step 3: Home Dashboard */}
            <button
              onClick={() => handleSetCurrentPage("home")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                currentPage === "home"
                  ? "bg-emerald-700 text-white shadow-xs hover:bg-emerald-750 scale-102"
                  : "text-emerald-950 hover:bg-emerald-50/80"
              }`}
            >
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black border ${currentPage === "home" ? "bg-white/20 border-white text-white" : "bg-emerald-100 border-emerald-200 text-emerald-800"}`}>3</span>
              <span>{translate(language, "navHome")}</span>
            </button>
          </div>
        )}

        {!activeUser ? (
          /* PAGE 1: Authentication & Onboarding Sign Up / Sign In Screen */
          <div className="flex justify-center w-full relative z-10 pt-2 pb-4">
            <div className="w-full max-w-lg relative px-4 md:px-0">
              
              {/* Left Side Entertaining Companion: Swaying Happy Sprout growing on Grass */}
              <div className="absolute -left-16 sm:-left-20 md:-left-24 lg:-left-32 bottom-2 w-14 sm:w-16 md:w-24 pointer-events-none select-none z-10 hidden sm:flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Floating Heart / Bloom Particle */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: [0, 0.9, 0], y: [-15, -45, -60], x: [0, -10, 10, 0], scale: [0.8, 1.2, 0.9] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeOut" }}
                    className="absolute top-0 text-[#E74C3C] text-xs sm:text-sm font-bold drop-shadow-xs"
                  >
                    🌸
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: [0, 0.8, 0], y: [-10, -35, -50], x: [10, 5, -10, 5], scale: [0.6, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 4.5, delay: 1.5, ease: "easeOut" }}
                    className="absolute top-0 text-amber-400 text-xs sm:text-xs font-bold drop-shadow-xs"
                  >
                    ✨
                  </motion.div>

                  <svg viewBox="0 0 100 120" className="w-full h-auto drop-shadow-md">
                    {/* Glowing halo background */}
                    <circle cx="50" cy="55" r="30" fill="#EAFAF1" opacity="0.65" />
                    
                    {/* Quiet Cute Grass Mound instead of flower pot */}
                    <ellipse cx="50" cy="108" rx="24" ry="8" fill="#503A2E" />
                    <ellipse cx="50" cy="104" rx="22" ry="6" fill="#1E5C2F" />
                    <path d="M28,102 Q50,94 72,102 Q60,110 50,110 Q40,110 28,102 Z" fill="#2ECC71" />
                    <circle cx="36" cy="98" r="2" fill="#F4D03F" />
                    <circle cx="64" cy="99" r="1.5" fill="#F4D03F" />

                    {/* Swaying Stem and Sprout Body */}
                    <motion.g
                      animate={{ rotate: [-4, 4, -4] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      className="origin-[50px_100px]"
                    >
                      {/* Stem */}
                      <path
                        d="M50,96 Q48,70 50,45"
                        fill="none"
                        stroke="#27AE60"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      {/* Cute Swaying Left Leaf */}
                      <motion.path
                        d="M48,75 Q32,70 28,80 Q40,88 48,77"
                        fill="#2ECC71"
                        animate={{ rotate: [-8, 8, -8] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                        className="origin-[48px_75px]"
                      />

                      {/* Cute Swaying Right Leaf */}
                      <motion.path
                        d="M52,65 Q68,60 72,70 Q60,78 52,67"
                        fill="#2ECC71"
                        animate={{ rotate: [6, -6, 6] }}
                        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                        className="origin-[52px_65px]"
                      />

                      {/* Chubby Sprout Head / Cute Face */}
                      <g transform="translate(50, 42)">
                        {/* Bulb head */}
                        <circle cx="0" cy="0" r="18" fill="#58D68D" />
                        <circle cx="0" cy="0" r="16" fill="#82E0AA" />

                        {/* Blinking Smiling Eyes */}
                        <motion.g
                          animate={{ scaleY: [1, 0.1, 1, 1, 0.1, 1] }}
                          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                          className="origin-center"
                        >
                          {/* Eyes */}
                          <circle cx="-6" cy="-2" r="2" fill="#2C3E50" />
                          <circle cx="6" cy="-2" r="2" fill="#2C3E50" />
                          
                          {/* Highlights */}
                          <circle cx="-7" cy="-3" r="0.7" fill="#FFF" />
                          <circle cx="5" cy="-3" r="0.7" fill="#FFF" />
                        </motion.g>

                        {/* Happy rosy cheeks */}
                        <circle cx="-11" cy="3" r="2.5" fill="#E74C3C" opacity="0.6" />
                        <circle cx="11" cy="3" r="2.5" fill="#E74C3C" opacity="0.6" />

                        {/* Content little smile */}
                        <path d="M-3,3 Q0,6 3,3" fill="none" stroke="#2C3E50" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Playful yellow bloom crown on top of the head */}
                        <path d="M-4,-16 Q0,-24 4,-16" fill="#F4D03F" stroke="#F1C40F" strokeWidth="1" />
                        <circle cx="0" cy="-22" r="2.5" fill="#F39C12" className="animate-ping [animation-duration:2s]" />
                        <circle cx="0" cy="-22" r="2" fill="#F1C40F" />
                      </g>
                    </motion.g>
                  </svg>
                  <span className="hidden md:inline-block text-[9px] font-mono font-bold text-emerald-800/90 mt-1 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200/50 uppercase tracking-wider">
                    {language === "ko" ? "새싹이" : language === "zh" ? "小芽" : language === "ms" ? "Tunas" : "Budding"}
                  </span>
                </motion.div>
              </div>

              <UserAccount
                onLoginStateChange={(username) => {
                  setActiveUser(username);
                  if (username) handleSetCurrentPage("did_consume");
                }}
                language={language}
                onOpenLegal={handleOpenLegal}
                onOpenSettings={handleOpenAccountSettings}
              />


              {/* Right Side Entertaining Companion: Floating Wing-Flapping Butterfly and Blooming Tulip growing on Grass */}
              <div className="absolute -right-16 sm:-right-20 md:-right-24 lg:-right-32 bottom-2 w-14 sm:w-16 md:w-24 pointer-events-none select-none z-10 hidden sm:flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full flex flex-col items-center relative"
                >
                  {/* Floating Flapping Paper Butterfly */}
                  <motion.div
                    animate={{
                      y: [-12, -26, -12],
                      x: [-4, 6, -4],
                      rotate: [-8, 8, -8]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: "easeInOut"
                    }}
                    className="absolute w-8 h-8 -top-8 z-20 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
                      {/* Butterfly Body */}
                      <rect x="19" y="8" width="2" height="16" rx="1" fill="#5B2C6F" />
                      <line x1="19" y1="8" x2="15" y2="3" stroke="#5B2C6F" strokeWidth="0.8" />
                      <line x1="21" y1="8" x2="25" y2="3" stroke="#5B2C6F" strokeWidth="0.8" />
                      
                      {/* Left Flapping Wing */}
                      <motion.path
                        d="M19,16 C12,10 6,12 8,18 C10,24 18,20 19,16 Z"
                        fill="#9B59B6"
                        animate={{ scaleX: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.22, ease: "linear" }}
                        className="origin-right"
                      />
                      <motion.path
                        d="M19,16 C13,20 8,24 11,26 C14,28 17,20 19,16 Z"
                        fill="#8E44AD"
                        animate={{ scaleX: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.22, ease: "linear" }}
                        className="origin-right"
                      />

                      {/* Right Flapping Wing */}
                      <motion.path
                        d="M21,16 C28,10 34,12 32,18 C30,24 22,20 21,16 Z"
                        fill="#EB984E"
                        animate={{ scaleX: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.22, ease: "linear" }}
                        className="origin-left"
                      />
                      <motion.path
                        d="M21,16 C27,20 32,24 29,26 C26,28 23,20 21,16 Z"
                        fill="#F39C12"
                        animate={{ scaleX: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.22, ease: "linear" }}
                        className="origin-left"
                      />
                    </svg>
                  </motion.div>

                  {/* Sparkling dust popping up below butterfly */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.6], y: [10, -5, 15] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                    className="absolute top-[-10px] text-[8px]"
                  >
                    🌟
                  </motion.div>

                  <svg viewBox="0 0 100 120" className="w-full h-auto drop-shadow-md">
                    {/* Glowing halo background */}
                    <circle cx="50" cy="55" r="30" fill="#FEF9E7" opacity="0.65" />
                    
                    {/* Cozy Grass Patch instead of elegant plant pot */}
                    <ellipse cx="50" cy="108" rx="24" ry="8" fill="#503A2E" />
                    <ellipse cx="50" cy="104" rx="22" ry="6" fill="#1E5C2F" />
                    <path d="M28,102 Q50,94 72,102 Q60,110 50,110 Q40,110 28,102 Z" fill="#2ECC71" />
                    <circle cx="35" cy="99" r="1.5" fill="#E74C3C" />
                    <circle cx="62" cy="98" r="2" fill="#E74C3C" />

                    {/* Swaying Tulip/Flower Stem */}
                    <motion.g
                      animate={{ rotate: [4, -4, 4] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="origin-[50px_100px]"
                    >
                      {/* Stem */}
                      <path
                        d="M50,96 Q52,70 50,44"
                        fill="none"
                        stroke="#27AE60"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Leaves */}
                      <path d="M48,82 Q34,80 32,73 Q44,72 48,82 Z" fill="#2ECC71" />
                      <path d="M52,70 Q66,66 68,58 Q60,62 52,70 Z" fill="#2ECC71" />

                      {/* Cozy Blooming Petal Cup */}
                      <g transform="translate(50, 42)">
                        {/* Back Petals */}
                        <path d="M-10,0 C-16,-16 -4,-22 0,-10 C4,-22 16,-16 10,0 Z" fill="#F1948A" />
                        
                        {/* Center tulip cup */}
                        <path d="M-8,-2 C-14,-14 -12,-20 -5,-14 C2,-8 -2,-25 0,-12 Q0,-12 5,-14 C12,-20 14,-14 8,-2 Z" fill="#EC7163" />
                        
                        {/* Foreground lovely petals */}
                        <path d="M-10,0 C-5,-12 5,-12 10,0 C6,4 -6,4 -10,0 Z" fill="#E74C3C" />

                        {/* Blinking Crown Crown Sparkle */}
                        <ellipse cx="0" cy="-6" rx="5" ry="3.5" fill="#FFF" opacity="0.4" />
                        
                        {/* Cute smiley face inside the tulip petal */}
                        <circle cx="-4" cy="-4" r="1.2" fill="#FFFFFF" />
                        <circle cx="4" cy="-4" r="1.2" fill="#FFFFFF" />
                        <path d="M-2,-2 Q0,0 2,-2" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                      </g>
                    </motion.g>
                  </svg>
                  <span className="hidden md:inline-block text-[9px] font-mono font-bold text-rose-800/90 mt-1 bg-rose-100/60 px-2.5 py-0.5 rounded-full border border-rose-200/50 uppercase tracking-wider">
                    {language === "ko" ? "희망이" : language === "zh" ? "希望" : language === "ms" ? "Harapan" : "Hope"}
                  </span>
                </motion.div>
              </div>

            </div>
          </div>
        ) : !smokingProfile ? (
          /* HABIT PROFILE ONBOARDING SETUP */
          <div className="flex justify-center w-full relative z-10 pt-2 pb-4">
            <SmokingProfileSetup
              language={language}
              onSaveProfile={(prof) => {
                setSmokingProfile(prof);
                if (activeUser) {
                  localStorage.setItem(`bloom_smoking_profile_${activeUser}`, JSON.stringify(prof));
                  localStorage.setItem(`bloom_seed_type_${activeUser}`, "tomato");
                }
              }}
            />
          </div>
        ) : (
          /* FULLY AUTHENTICATED STEP-BY-STEP FLOWS */
          <>

            {/* PAGE 2: Did you consume any of it today? */}
            {currentPage === "did_consume" && (
              <div className="space-y-3 sm:space-y-4 animate-fade-in relative z-10 w-full">
                <div className="max-w-2xl mx-auto w-full bg-white/50 backdrop-blur-md rounded-[2.5rem] p-4 sm:p-6 border border-white/70 shadow-2xl">
                  <DailyCheckIn 
                    onLogAdded={handleLogAdded} 
                    currentLogs={logs} 
                    language={language} 
                    activeUser={activeUser} 
                    currentDateStr={currentDateStr}
                    coins={coinsBalance}
                    onOpenHealthQuest={(type) => {
                      if (type) setActiveHealthQuestTab(type);
                      setIsHealthQuestsOpen(true);
                    }}
                    onGoToNextStep={() => handleSetCurrentPage("plant_progress")}
                  />
                  
                  {/* Step Buttons */}
                  <div className="flex justify-between items-center mt-3 sm:mt-5 pt-3 border-t border-emerald-100/80">
                    <button
                      onClick={() => handleSetCurrentPage("home")}
                      className="px-4.5 py-3 text-emerald-950 bg-white/80 hover:bg-white font-bold text-xs sm:text-sm rounded-full flex items-center gap-1.5 transition-all cursor-pointer border border-white/80 shadow-xs active:scale-95 backdrop-blur-xs"
                    >
                      <ArrowLeft className="w-4 h-4 text-emerald-800" />
                      <span>{translate(language, "navHome")}</span>
                    </button>

                    <button
                      onClick={() => handleSetCurrentPage("plant_progress")}
                      className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-850 text-white font-black text-xs sm:text-sm rounded-full flex items-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-md border-none"
                    >
                      <span>{translate(language, "navNext")}</span>
                      <span className="hidden sm:inline">: {translate(language, "navPlant")} 🌿</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: The digital plant (show the progress of the digital plant) */}
            {currentPage === "plant_progress" && (
              <div className="space-y-3 sm:space-y-4 animate-fade-in relative z-10 w-full">
                <div className="max-w-2xl mx-auto p-4 sm:p-6 w-full bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/70 shadow-2xl space-y-4">
                  <FlowerPot 
                    logs={logs} 
                    currentDateStr={currentDateStr} 
                    language={language} 
                    seedType={seedType}
                    coins={coinsBalance}
                    isBroken={isPlantBroken}
                    plantLevel={effectivePlantLevel}
                    onRestorePlant={handleRestorePlant}
                  />
                  
                  {/* Step Buttons */}
                  <div className="flex justify-between items-center mt-3 sm:mt-5 pt-3 border-t border-emerald-100/80">
                    <button
                      onClick={() => handleSetCurrentPage("did_consume")}
                      className="px-4.5 py-3 text-emerald-950 hover:bg-white font-bold text-xs sm:text-sm rounded-full flex items-center gap-1.5 hover:scale-102 active:scale-98 transition-all cursor-pointer border border-white/80 bg-white/80 shadow-xs backdrop-blur-xs"
                    >
                      <ArrowLeft className="w-4 h-4 text-emerald-800" /> 
                      <span>{translate(language, "navCheckIn")}</span>
                    </button>
                    <button
                      onClick={() => handleSetCurrentPage("home")}
                      className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-850 text-white font-black text-xs sm:text-sm rounded-full flex items-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-md border-none"
                    >
                      <span>{translate(language, "navNext")}</span>
                      <span className="hidden sm:inline">: {translate(language, "navHome")} 📊</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 4: Home that contains progress tracker, health quests, stress-release breathing bubble, recovery journal, and AADK numbers */}
            {currentPage === "home" && (
              <div className="space-y-6 animate-fade-in relative z-10">

                {/* Post-Smoke & Vape Health Quests Card */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-950 p-5 sm:p-6 rounded-[2rem] text-white border border-teal-700/80 shadow-xl relative overflow-hidden select-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        🫁
                      </div>
                      <div>
                        <h3 className="text-lg font-serif font-black tracking-tight text-white flex items-center gap-2">
                          {language === "zh" ? "健康任务 🫁" : language === "ms" ? "Misi Kesihatan 🫁" : language === "ko" ? "건강 퀘스트 🫁" : "Health Quests 🫁"}
                        </h3>
                        <p className="text-xs text-emerald-200/90 font-medium leading-snug mt-0.5">
                          {language === "zh" ? "简单的呼吸与运动练习，恢复肺部活力并化解烟瘾。" : language === "ms" ? "Aktiviti ringkas untuk menyegarkan paru-paru & mengawal keinginan." : language === "ko" ? "폐를 정화하고 흡연 충동을 해소하는 쉬운 연습." : "Quick exercises to refresh your lungs and clear cravings."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveHealthQuestTab("breathing");
                        setIsHealthQuestsOpen(true);
                      }}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 border-none hover:scale-102 active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-900" />
                      <span>{language === "zh" ? "开启任务" : language === "ms" ? "Mula Misi" : language === "ko" ? "퀘스트 시작" : "Start Quests"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-emerald-800/80">
                    <button
                      onClick={() => {
                        setActiveHealthQuestTab("breathing");
                        setIsHealthQuestsOpen(true);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🫁</div>
                      <div className="text-xs font-bold text-white">{language === "zh" ? "4-7-8 呼吸" : language === "ms" ? "Pernafasan" : language === "ko" ? "호흡법" : "4-7-8 Breath"}</div>
                      <div className="text-[10px] text-emerald-300">{language === "zh" ? "清肺理气" : language === "ms" ? "Segar paru-paru" : language === "ko" ? "폐 정화" : "Refresh lungs"}</div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveHealthQuestTab("walking");
                        setIsHealthQuestsOpen(true);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🚶‍♂️</div>
                      <div className="text-xs font-bold text-white">{language === "zh" ? "10分钟散步" : language === "ms" ? "Jalan 10m" : language === "ko" ? "10분 산책" : "10-Min Walk"}</div>
                      <div className="text-[10px] text-amber-300">{language === "zh" ? "补充氧气" : language === "ms" ? "Tambah oksigen" : language === "ko" ? "산소 공급" : "Boost oxygen"}</div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveHealthQuestTab("hydration");
                        setIsHealthQuestsOpen(true);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="text-lg mb-1 group-hover:scale-110 transition-transform">💧</div>
                      <div className="text-xs font-bold text-white">{language === "zh" ? "饮水清肺" : language === "ms" ? "Hidrasi" : language === "ko" ? "수분 보충" : "Hydration"}</div>
                      <div className="text-[10px] text-teal-300">{language === "zh" ? "舒缓咽喉" : language === "ms" ? "Melegakan tekak" : language === "ko" ? "목 진정" : "Soothe throat"}</div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveHealthQuestTab("shakeout");
                        setIsHealthQuestsOpen(true);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🏃</div>
                      <div className="text-xs font-bold text-white">{language === "zh" ? "2分钟活力" : language === "ms" ? "Senaman 2m" : language === "ko" ? "2분 리셋" : "2-Min Shake"}</div>
                      <div className="text-[10px] text-rose-300">{language === "zh" ? "释放冲动" : language === "ms" ? "Reda gelisah" : language === "ko" ? "충동 전환" : "Clear tension"}</div>
                    </button>
                  </div>
                </div>
                
                {/* Weekly Insights + rule-based recommendations (feature-flagged) */}
                {isBloomAnalyticsEnabled() && (
                  <WeeklyInsightsCard
                    language={language}
                    weekly={buildWeeklyInsight(logs, currentDateStr)}
                    monthly={buildMonthlyInsight(logs, currentDateStr)}
                    onStartQuest={(quest) => {
                      setActiveHealthQuestTab(quest);
                      setIsHealthQuestsOpen(true);
                    }}
                  />
                )}

                {/* Progress Tracker (Streak Calendar) */}
                <div className="grid grid-cols-1 gap-6 relative z-10">
                  <StreakCalendar logs={logs} onToggleDay={handleToggleDay} language={language} activeUser={activeUser} currentDateStr={currentDateStr} onDateChange={handleCurrentDateChange} />
                </div>

                {/* Secondary Wellness Resources (Hotlines & Journal) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  
                  {/* Left Column: Need to Talk to Someone Hotline & Trigger Analysis */}
                  <div className="space-y-6 flex flex-col justify-start">
                    {/* Professional Help Hotline Card (AADK numbers) */}
                    <div id="professional-help-card" className="bg-white/85 backdrop-blur-md rounded-[2rem] p-6 border border-white/55 shadow-xl flex items-start gap-4 hover:shadow-2xl transition-shadow duration-300 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-serif font-bold text-emerald-950 mb-3">
                          {translate(language, "hotlineTitle")}
                        </h4>
                        <a 
                          href="tel:1800-22-2235"
                          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-emerald-700 hover:bg-emerald-850 text-white font-bold text-xs rounded-full transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-xs"
                        >
                          {translate(language, "hotlineBtn")}
                        </a>
                      </div>
                    </div>

                    {/* Custom Interactive Trigger Analysis (Habit Awareness) with glassmorphic style */}
                    {stats.length > 0 && (
                      <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-6 border border-white/55 shadow-xl select-none relative z-10">
                        <h4 className="text-sm font-serif font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Activity className="w-4.5 h-4.5 text-emerald-600" />
                          {translate(language, "triggerMapTitle")}
                        </h4>

                        <div className="space-y-3">
                          {stats.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-emerald-950">{item.category}</span>
                                <span className="font-bold text-emerald-700">{item.percentage}%</span>
                              </div>
                              <div className="w-full h-2 bg-emerald-50 border border-emerald-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#16A085] rounded-full transition-all duration-1000" 
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Recovery Journal */}
                  <div className="space-y-6 flex flex-col justify-start">
                    {/* Recovery Journal */}
                    <Journal 
                      entries={journals} 
                      onAddEntry={handleAddJournal} 
                      onDeleteEntry={handleDeleteJournal} 
                      language={language}
                      activeUser={activeUser}
                    />
                  </div>
                </div>

                {/* Back button and Clear option at bottom of Home */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <button
                    onClick={() => handleSetCurrentPage("plant_progress")}
                    className="px-5 py-2.5 text-emerald-800 bg-white hover:bg-emerald-50 font-bold text-xs rounded-full flex items-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer border border-emerald-200 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> {translate(language, "navBack")}
                  </button>

                  {/* Delete all records action */}
                  <div>
                    {confirmWipe ? (
                      <div className="flex items-center gap-2 animate-bounce">
                        <button
                          onClick={() => {
                            handleClearAll();
                            setConfirmWipe(false);
                          }}
                          className="text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-full shadow-md cursor-pointer transition-all active:scale-95 border-none"
                        >
                          ⚠️ Are you sure? Click to WIPE ALL RECORDS
                        </button>
                        <button
                          onClick={() => setConfirmWipe(false)}
                          className="text-xs font-bold text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2.5 rounded-full cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmWipe(true)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/50 hover:bg-emerald-100 px-4 py-2 rounded-full border border-emerald-200 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        🗑️ Clear All Recovery Records
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
 
      </div>
      
      {/* AI-Powered WHO 4D Urge Quest Component (Floating Non-blocking Trigger) */}
      <UrgeQuestModal language={language} activeHabit="vape" />

      {/* Post-Smoke & Vape Health Quests Modal */}
      <HealthQuestsModal
        language={language}
        isOpen={isHealthQuestsOpen}
        initialQuest={activeHealthQuestTab}
        onClose={() => setIsHealthQuestsOpen(false)}
      />

      {/* Color Theme Studio Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={colorTheme}
        onSelectTheme={(newTheme) => {
          setColorTheme(newTheme);
          applyTheme(newTheme);
        }}
        language={language}
      />
 
      {/* Calming Logout Interstitial Page */}
      {showLogoutOverlay && (
        <LogoutScreen language={language} onClose={handleCloseLogoutOverlay} />
      )}

      {/* App Tour & Interactive Quick Guide */}
      <TourGuide
        language={language}
        onLanguageSelect={handleLanguageChange}
        isOpen={isGuideOpen}
        onClose={() => {
          setIsGuideOpen(false);
          if (activeUser) {
            localStorage.setItem(`bloom_tour_guide_seen_${activeUser}`, "true");
          }
        }}
        plantName={
          language === "zh" ? "有机番茄" : language === "ms" ? "Tumbuhan Tomato" : language === "ko" ? "유기농 토마토" : "Organic Tomato Plant"
        }
        plantEmoji="🍅"
      />

      {/* Footer Navigation for Legal, Security & Support */}
      <footer className="mt-12 pt-6 pb-8 border-t border-emerald-900/20 text-center relative z-20 text-xs text-emerald-950/80 font-sans space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-bold">
          <button
            type="button"
            onClick={() => handleOpenLegal("privacy")}
            className="hover:text-emerald-900 hover:underline cursor-pointer border-none bg-transparent"
          >
            🛡️ {language === "ms" ? "Dasar Privasi" : language === "zh" ? "隐私政策" : language === "ko" ? "개인정보" : "Privacy Policy"}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleOpenLegal("terms")}
            className="hover:text-emerald-900 hover:underline cursor-pointer border-none bg-transparent"
          >
            📜 {language === "ms" ? "Syarat Perkhidmatan" : language === "zh" ? "服务条款" : language === "ko" ? "이용약관" : "Terms of Service"}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleOpenLegal("disclaimer")}
            className="hover:text-emerald-900 hover:underline cursor-pointer border-none bg-transparent"
          >
            🩺 {language === "ms" ? "Penafian Perubatan" : language === "zh" ? "医疗免责" : language === "ko" ? "의료면책" : "Medical Disclaimer"}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleOpenLegal("contact")}
            className="hover:text-emerald-900 hover:underline cursor-pointer border-none bg-transparent"
          >
            ✉️ {language === "ms" ? "Hubungi Kami" : language === "zh" ? "联系我们" : language === "ko" ? "문의하기" : "Contact Us"}
          </button>
          {activeUser && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={handleOpenAccountSettings}
                className="hover:text-emerald-900 hover:underline cursor-pointer border-none bg-transparent font-extrabold text-emerald-900"
              >
                ⚙️ {language === "ms" ? "Tetapan Akaun" : language === "zh" ? "账户设置" : language === "ko" ? "계정 설정" : "Account Settings"}
              </button>
            </>
          )}
        </div>

        <div className="text-[11px] font-medium text-stone-600 max-w-xl mx-auto px-4 leading-relaxed">
          Bloom is an educational self-help companion app for smoking and vaping cessation. Data encrypted via Supabase Auth & RLS. Aligned with Malaysia PDPA, EU GDPR, and Korea PIPC principles.
        </div>
        <div className="text-[10px] font-mono text-emerald-900/60">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://smkkunak.edu.my/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-900/80 hover:text-emerald-950 underline underline-offset-2 transition-colors"
          >
            SMK Kunak
          </a>
          {" "}• Bloom Cessation Companion
        </div>
      </footer>

      {/* Legal, Privacy & Contact Pages Modal */}
      <LegalPagesModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
        language={language}
      />

      {/* User Account & Security Settings Modal */}
      {activeUser && (
        <AccountSettingsModal
          isOpen={isAccountSettingsOpen}
          currentUser={activeUser}
          onClose={() => setIsAccountSettingsOpen(false)}
          onAccountUpdated={(newUsername) => {
            setActiveUser(newUsername);
            setIsAccountSettingsOpen(false);
          }}
          onAccountDeleted={() => {
            setActiveUser(null);
            setIsAccountSettingsOpen(false);
            handleSetCurrentPage("did_consume");
          }}
          language={language}
        />
      )}

      {/* Floating Lower-Right Language Selector */}
      <LanguageSelector currentLanguage={language} onSelectLanguage={handleLanguageChange} />
 
    </div>
  );
}

