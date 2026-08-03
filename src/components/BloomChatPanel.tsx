import React, { useEffect, useRef, useState } from "react";
import { Send, RefreshCw, ShieldAlert, Droplets, Wind, Timer, Footprints } from "lucide-react";
import Markdown from "react-markdown";
import { Language, translate } from "../translations";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface BloomChatPanelProps {
  language: Language;
  activeHabit?: string;
  onFeelingBetter?: () => void;
  onStillCraving?: () => void;
  onLeave?: () => void;
}

type UiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "NETWORK"
  | "AI_REQUEST_FAILED"
  | null;

function offlineFourD(language: Language) {
  return [
    {
      icon: Timer,
      title: translate(language, "chat4dDelayTitle"),
      body: translate(language, "chat4dDelayBody")
    },
    {
      icon: Wind,
      title: translate(language, "chat4dBreathTitle"),
      body: translate(language, "chat4dBreathBody")
    },
    {
      icon: Droplets,
      title: translate(language, "chat4dWaterTitle"),
      body: translate(language, "chat4dWaterBody")
    },
    {
      icon: Footprints,
      title: translate(language, "chat4dDoTitle"),
      body: translate(language, "chat4dDoBody")
    }
  ];
}

export default function BloomChatPanel({
  language,
  activeHabit = "vape",
  onFeelingBetter,
  onStillCraving,
  onLeave
}: BloomChatPanelProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [urgeLevel, setUrgeLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<UiErrorCode>(null);
  const [questHint, setQuestHint] = useState<{
    questTitle: string;
    steps: string[];
    reason: string;
    fourDType: string;
    estimatedMinutes: number;
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastFailedText = useRef<string | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, isLoading, uiError, questHint]);

  const errorMessage = (code: UiErrorCode) => {
    if (code === "AI_NOT_CONFIGURED") return translate(language, "chatErrNotConfigured");
    if (code === "QUOTA_EXCEEDED") return translate(language, "chatErrQuota");
    if (code === "RATE_LIMITED") return translate(language, "chatErrRateLimit");
    if (code === "NETWORK") return translate(language, "chatErrNetwork");
    return translate(language, "chatErrGeneric");
  };

  const fetchQuest = async (trigger: string, level: number) => {
    try {
      const res = await fetch("/api/ai/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          context: {
            habit: activeHabit === "cigarettes" ? "cigarettes" : "vape",
            urgeLevel: level,
            trigger: trigger.slice(0, 300)
          }
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.questTitle && Array.isArray(data.steps)) {
        setQuestHint(data);
      }
    } catch {
      /* quest is optional enrichment */
    }
  };

  const sendMessage = async (text: string, opts?: { retry?: boolean }) => {
    const trimmed = text.trim().slice(0, 2000);
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = opts?.retry
      ? [...chatMessages]
      : [...chatMessages, { role: "user", content: trimmed }];

    if (!opts?.retry) {
      setChatMessages(nextMessages);
      setDraft("");
    }

    setIsLoading(true);
    setUiError(null);
    lastFailedText.current = trimmed;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
          language,
          context: {
            habit: activeHabit === "cigarettes" ? "cigarettes" : "vape",
            urgeLevel,
            trigger: trimmed.slice(0, 300)
          }
        })
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const code = (data.code as UiErrorCode) || "AI_REQUEST_FAILED";
        if (response.status === 503 || code === "AI_NOT_CONFIGURED") {
          setUiError("AI_NOT_CONFIGURED");
        } else if (response.status === 429 || code === "QUOTA_EXCEEDED" || code === "RATE_LIMITED") {
          setUiError(code === "RATE_LIMITED" ? "RATE_LIMITED" : "QUOTA_EXCEEDED");
        } else {
          setUiError("AI_REQUEST_FAILED");
        }
        return;
      }

      if (!data.reply || typeof data.reply !== "string") {
        setUiError("AI_REQUEST_FAILED");
        return;
      }

      lastFailedText.current = null;
      setChatMessages((current) => [...current, { role: "assistant", content: data.reply }]);

      // First user turn can also unlock a personalized 4D quest card
      if (nextMessages.filter((m) => m.role === "user").length === 1) {
        void fetchQuest(trimmed, urgeLevel);
      }
    } catch {
      setUiError("NETWORK");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const text = lastFailedText.current;
    if (!text) return;
    // Ensure the failed user message is present once
    setChatMessages((current) => {
      const last = current[current.length - 1];
      if (last?.role === "user" && last.content === text) return current;
      return [...current, { role: "user", content: text }];
    });
    void sendMessage(text, { retry: true });
  };

  const clearChat = () => {
    setChatMessages([]);
    setQuestHint(null);
    setUiError(null);
    lastFailedText.current = null;
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium text-stone-500 leading-relaxed">
        {translate(language, "chatDisclaimer")}
      </p>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-600 mb-1.5">
          {translate(language, "chatUrgeLevel")} ({urgeLevel}/10)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={urgeLevel}
          onChange={(e) => setUrgeLevel(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer"
          aria-label={translate(language, "chatUrgeLevel")}
        />
      </div>

      <div
        ref={listRef}
        className="max-h-56 overflow-y-auto space-y-2.5 rounded-2xl border border-rose-100 bg-gradient-to-b from-white to-rose-50/40 p-3"
      >
        {chatMessages.length === 0 && !isLoading && !uiError && (
          <p className="text-xs text-stone-500 text-center py-6 px-2">
            {translate(language, "chatEmptyHint")}
          </p>
        )}

        {chatMessages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-rose-600 text-white rounded-br-md"
                  : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="markdown-body space-y-1.5">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 animate-pulse px-1">
            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
            {translate(language, "chatThinking")}
          </div>
        )}
      </div>

      {questHint && !uiError && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-3 space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
            {translate(language, "chatQuestBadge")} · {questHint.estimatedMinutes} min
          </div>
          <div className="text-xs font-black text-teal-950">{questHint.questTitle}</div>
          <p className="text-[11px] text-teal-900/90 leading-relaxed">{questHint.reason}</p>
          <ul className="text-[11px] text-teal-950 space-y-1 pl-4 list-disc">
            {questHint.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {uiError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 space-y-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-950">{errorMessage(uiError)}</p>
              <p className="text-[10px] text-amber-900/80 mt-1">
                {translate(language, "chatOfflineNote")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {offlineFourD(language).map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white/80 border border-amber-100 p-2.5 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-stone-900">
                  <item.icon className="w-3.5 h-3.5 text-amber-700" />
                  {item.title}
                </div>
                <p className="text-[10px] text-stone-600 leading-snug">{item.body}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {translate(language, "chatTryAgain")}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          rows={2}
          value={draft}
          maxLength={2000}
          disabled={isLoading}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage(draft);
            }
          }}
          placeholder={translate(language, "chatPlaceholder")}
          className="flex-1 p-3 text-xs font-medium text-stone-900 bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void sendMessage(draft)}
          disabled={isLoading || !draft.trim()}
          className="shrink-0 self-end px-3.5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border-none cursor-pointer"
          aria-label={translate(language, "chatSend")}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {chatMessages.some((m) => m.role === "assistant") && !uiError && (
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onFeelingBetter}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-extrabold text-xs rounded-2xl border border-emerald-200 cursor-pointer text-left"
          >
            {translate(language, "chatFeelingBetter")}
          </button>
          <button
            type="button"
            onClick={onStillCraving}
            className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-950 font-extrabold text-xs rounded-2xl border border-amber-200 cursor-pointer text-left"
          >
            {translate(language, "chatStillCraving")}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between items-center pt-1">
        <button
          type="button"
          onClick={clearChat}
          className="text-[10px] font-bold text-stone-500 hover:text-stone-800 bg-transparent border-none cursor-pointer underline-offset-2 hover:underline"
        >
          {translate(language, "chatClear")}
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-transparent border-none cursor-pointer underline-offset-2 hover:underline"
        >
          {translate(language, "chatLeave")}
        </button>
      </div>
    </div>
  );
}
