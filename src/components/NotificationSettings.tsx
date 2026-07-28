import { useState, useEffect } from "react";
import { Bell, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { Language, translate } from "../translations";

interface NotificationSettingsProps {
  username: string;
  language: Language;
}

export default function NotificationSettings({ username, language }: NotificationSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("19:00");
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Convert VAPID public key to Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Load existing settings and permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }

    async function loadSettings() {
      try {
        const res = await fetch("/api/notifications/get-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setEnabled(data.settings.enabled);
          setTime(data.settings.time || "19:00");
        }
      } catch (err) {
        console.error("Error loading notification settings:", err);
      }
    }

    loadSettings();
  }, [username]);

  // Request notification permission and subscribe to Push Manager
  const handleEnableReminders = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported on this device/browser.");
      return;
    }

    try {
      setSaving(true);
      
      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== "granted") {
        setSaving(false);
        return;
      }

      // Get Service Worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from backend
      const keyRes = await fetch("/api/notifications/vapid-public-key");
      const keyData = await keyRes.json();
      if (!keyData.publicKey) {
        throw new Error("VAPID public key not found on server");
      }

      const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to backend to register
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const subRes = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          subscription,
          enabled: true,
          time,
          timezone
        })
      });

      if (subRes.ok) {
        setEnabled(true);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to enable push notifications:", err);
    } finally {
      setSaving(false);
    }
  };

  // Save regular preferences change (toggle or time picker)
  const handleSavePreferences = async (newEnabled: boolean, newTime: string) => {
    try {
      setSaving(true);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      
      // Try to get subscription if they are turning it ON and permission is granted
      let subscription = null;
      if (newEnabled && Notification.permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          // If no subscription exists, let's try to subscribe
          const keyRes = await fetch("/api/notifications/vapid-public-key");
          const keyData = await keyRes.json();
          if (keyData.publicKey) {
            const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });
          }
        }
      }

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          subscription,
          enabled: newEnabled,
          time: newTime,
          timezone
        })
      });

      if (res.ok) {
        setEnabled(newEnabled);
        setTime(newTime);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving notification preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setSendingTest(true);
      let subscription = null;
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.getSubscription();
      }

      const res = await fetch("/api/notifications/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          subscription
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send test notification");
      }
    } catch (err) {
      console.error("Error triggering test notification:", err);
    } finally {
      setSendingTest(false);
    }
  };

  const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

  if (!isSupported) {
    return (
      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-xs text-stone-600 font-medium mt-2">
        ⚠️ {translate(language, "notifBlocked")}
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-emerald-100 mt-2">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-emerald-700" />
        <h4 className="text-sm font-serif font-bold text-emerald-950">
          {translate(language, "notifOptInTitle")}
        </h4>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed font-medium">
        {translate(language, "notifOptInDesc")}
      </p>

      {permissionStatus !== "granted" ? (
        <button
          onClick={handleEnableReminders}
          disabled={saving}
          className="w-full py-2.5 px-4 rounded-full bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-850 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border-none disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {saving ? "Enabling..." : translate(language, "notifPermissionBtn")}
        </button>
      ) : (
        <div className="space-y-3 bg-emerald-50/45 p-4 border border-emerald-100/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {translate(language, "notifEnabledLabel")}
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleSavePreferences(e.target.checked, time)}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
            </label>
          </div>

          {enabled && (
            <div className="space-y-2.5 pt-2 border-t border-emerald-100/40">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  {translate(language, "notifTimeLabel")}
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleSavePreferences(enabled, e.target.value)}
                  disabled={saving}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-emerald-200/60 bg-white text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-700/30"
                />
              </div>

              <div className="flex justify-end pt-1.5">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={sendingTest}
                  className="px-3.5 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50 border-none"
                >
                  {sendingTest ? "Sending..." : translate(language, "notifTestBtn")}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-emerald-50 text-emerald-850 border border-emerald-100/60 transition-all">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{translate(language, "notifSuccessUpdate")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
