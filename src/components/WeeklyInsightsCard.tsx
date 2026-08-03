import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Sparkles, TrendingDown, TrendingUp, Minus, Brain, Info } from "lucide-react";
import { Language, translate, TranslationType } from "../translations";
import {
  MonthlyInsight,
  WeeklyInsight,
  InsightExplanation,
  buildLocalInsightExplanation,
  toExplainPayload
} from "../lib/weeklyInsights";
import { isInsightsXaiEnabled } from "../lib/features";
import { HealthQuestType } from "./HealthQuestsModal";

interface WeeklyInsightsCardProps {
  language: Language;
  weekly: WeeklyInsight;
  monthly: MonthlyInsight;
  onStartQuest: (quest: HealthQuestType) => void;
}

type InsightsTab = "week" | "month";

const TRIGGER_LABEL_KEYS: Record<string, keyof TranslationType> = {
  stress: "weekTriggerStress",
  boredom: "weekTriggerBoredom",
  social: "weekTriggerSocial",
  meal: "weekTriggerMeal",
  other: "weekTriggerOther"
};

const WEEKDAY_KEYS = [
  "weekDaySun",
  "weekDayMon",
  "weekDayTue",
  "weekDayWed",
  "weekDayThu",
  "weekDayFri",
  "weekDaySat"
] as const;

const REC_TITLE: Record<string, keyof TranslationType> = {
  stressBreath: "weekRecStressBreathTitle",
  boredomMove: "weekRecBoredomMoveTitle",
  socialGround: "weekRecSocialGroundTitle",
  mealHydrate: "weekRecMealHydrateTitle",
  quantityWalk: "weekRecQuantityWalkTitle",
  protectStreak: "weekRecProtectStreakTitle",
  startLogging: "weekRecStartLoggingTitle"
};

const REC_WHY: Record<string, keyof TranslationType> = {
  stressBreath: "weekRecStressBreathWhy",
  boredomMove: "weekRecBoredomMoveWhy",
  socialGround: "weekRecSocialGroundWhy",
  mealHydrate: "weekRecMealHydrateWhy",
  quantityWalk: "weekRecQuantityWalkWhy",
  protectStreak: "weekRecProtectStreakWhy",
  startLogging: "weekRecStartLoggingWhy"
};

export default function WeeklyInsightsCard({
  language,
  weekly,
  monthly,
  onStartQuest
}: WeeklyInsightsCardProps) {
  const [tab, setTab] = useState<InsightsTab>("week");
  const insight = tab === "week" ? weekly : monthly;
  const xaiOn = isInsightsXaiEnabled();

  const localExplanation = useMemo(
    () => buildLocalInsightExplanation(insight, tab, language),
    [insight, tab, language]
  );

  const [explanation, setExplanation] = useState<InsightExplanation>(localExplanation);
  const [explainLoading, setExplainLoading] = useState(false);

  useEffect(() => {
    setExplanation(localExplanation);
    if (!xaiOn) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setExplainLoading(true);
      try {
        const res = await fetch("/api/insight-explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: language,
            period: tab,
            summary: toExplainPayload(insight, tab)
          })
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!data.isFallback && Array.isArray(data.lines) && data.lines.length > 0) {
          setExplanation({
            signals: localExplanation.signals,
            lines: data.lines.slice(0, 3),
            source: "gemini"
          });
        } else {
          setExplanation(localExplanation);
        }
      } catch {
        if (!cancelled) setExplanation(localExplanation);
      } finally {
        if (!cancelled) setExplainLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [localExplanation, xaiOn, language, tab, insight]);

  const delta = insight.quantityDeltaPct;
  const DeltaIcon =
    delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor =
    delta === null
      ? "text-stone-500"
      : delta > 0
        ? "text-rose-600"
        : delta < 0
          ? "text-emerald-700"
          : "text-stone-500";

  return (
    <div
      id="weekly-insights-card"
      className="bg-white/90 backdrop-blur-md rounded-[2rem] p-5 sm:p-6 shadow-xl border border-white/60 relative z-10 select-none"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
            <CalendarRange className="w-5 h-5 text-teal-700" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-serif font-black text-stone-900 tracking-tight">
              {translate(language, "weekInsightsTitle")}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {tab === "week"
                ? translate(language, "weekInsightsRange", {
                    start: weekly.startDate,
                    end: weekly.endDate
                  })
                : translate(language, "monthInsightsRange", {
                    month: monthly.monthLabel,
                    start: monthly.startDate,
                    end: monthly.endDate
                  })}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
          {translate(language, "weekInsightsBadge")}
        </span>
      </div>

      <div className="flex gap-1 p-1 mb-4 rounded-full bg-stone-100/90 border border-stone-200 w-fit">
        <button
          type="button"
          onClick={() => setTab("week")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border-none cursor-pointer transition-all ${
            tab === "week"
              ? "bg-teal-800 text-white shadow-sm"
              : "bg-transparent text-stone-600 hover:text-stone-900"
          }`}
        >
          {translate(language, "insightsTabWeek")}
        </button>
        <button
          type="button"
          onClick={() => setTab("month")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border-none cursor-pointer transition-all ${
            tab === "month"
              ? "bg-teal-800 text-white shadow-sm"
              : "bg-transparent text-stone-600 hover:text-stone-900"
          }`}
        >
          {translate(language, "insightsTabMonth")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700/80">
            {translate(language, "weekStatClean")}
          </div>
          <div className="text-2xl font-serif font-black text-emerald-950 mt-0.5">
            {insight.cleanDays}
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50/80 border border-rose-100 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-rose-700/80">
            {translate(language, "weekStatSlips")}
          </div>
          <div className="text-2xl font-serif font-black text-rose-950 mt-0.5">
            {insight.slipDays}
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800/80">
            {translate(language, "weekStatQuantity")}
          </div>
          <div className="text-2xl font-serif font-black text-amber-950 mt-0.5">
            {insight.totalQuantity}
          </div>
        </div>
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
            {tab === "week"
              ? translate(language, "weekStatVsLast")
              : translate(language, "monthStatVsLast")}
          </div>
          <div className={`text-lg font-serif font-black mt-0.5 flex items-center gap-1 ${deltaColor}`}>
            <DeltaIcon className="w-4 h-4" />
            {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
          </div>
        </div>
      </div>

      {tab === "month" && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-2xl bg-teal-50/70 border border-teal-100 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-teal-800/80">
              {translate(language, "monthStatBestStreak")}
            </div>
            <div className="text-xl font-serif font-black text-teal-950 mt-0.5">
              {monthly.bestStreak}
              <span className="text-xs font-bold text-teal-700 ml-1">
                {translate(language, "monthStatDays")}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-indigo-800/80">
              {translate(language, "monthStatCleanRate")}
            </div>
            <div className="text-xl font-serif font-black text-indigo-950 mt-0.5">
              {monthly.cleanRatePct === null ? "—" : `${monthly.cleanRatePct}%`}
            </div>
          </div>
        </div>
      )}

      {tab === "month" && monthly.weeklyTrend.length > 0 && monthly.loggedDays > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            {translate(language, "monthTrendTitle")}
          </div>
          <div className="flex gap-1.5 items-end h-16">
            {monthly.weeklyTrend.map((w) => {
              const max = Math.max(1, ...monthly.weeklyTrend.map((x) => x.cleanDays + x.slipDays));
              const total = w.cleanDays + w.slipDays;
              const height = total === 0 ? 8 : Math.max(12, Math.round((total / max) * 56));
              const cleanRatio = total === 0 ? 0 : w.cleanDays / total;
              return (
                <div key={w.weekIndex} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md overflow-hidden bg-rose-200/80 flex flex-col justify-end"
                    style={{ height }}
                    title={`${w.label}: ${w.cleanDays} clean / ${w.slipDays} slips`}
                  >
                    <div
                      className="w-full bg-emerald-500/90"
                      style={{ height: `${Math.round(cleanRatio * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-stone-500">{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {insight.topTrigger && (
        <p className="text-xs text-stone-600 mb-3 leading-relaxed">
          {translate(language, "weekTopTrigger", {
            trigger: translate(language, TRIGGER_LABEL_KEYS[insight.topTrigger.category]),
            pct: insight.topTrigger.percentage
          })}
          {tab === "week" &&
            weekly.worstWeekday !== null &&
            ` ${translate(language, "weekWorstDay", {
              day: translate(language, WEEKDAY_KEYS[weekly.worstWeekday])
            })}`}
        </p>
      )}

      {!insight.topTrigger && insight.loggedDays === 0 && (
        <p className="text-xs text-stone-500 mb-3">
          {tab === "week"
            ? translate(language, "weekNoData")
            : translate(language, "monthNoData")}
        </p>
      )}

      {/* XAI: explain data before recommendations */}
      {xaiOn && (
        <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-900">
              <Brain className="w-3.5 h-3.5 text-sky-700" />
              {translate(language, "xaiExplainTitle")}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/80 border border-sky-100 text-sky-800">
              {explainLoading
                ? translate(language, "xaiExplainLoading")
                : explanation.source === "gemini"
                  ? translate(language, "xaiSourceGemini")
                  : translate(language, "xaiSourceRules")}
            </span>
          </div>

          {explanation.signals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {explanation.signals.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-white border border-sky-100 text-sky-900"
                >
                  <Info className="w-3 h-3 text-sky-600" />
                  {s.label}: {s.value}
                </span>
              ))}
            </div>
          )}

          <ul className="space-y-1.5 m-0 pl-0 list-none">
            {explanation.lines.map((line, idx) => (
              <li
                key={idx}
                className="flex gap-2 text-xs text-sky-950/90 leading-snug"
              >
                <span className="shrink-0 text-sky-600 font-bold" aria-hidden>
                  •
                </span>
                <span>{line.replace(/^[-•*]\s+/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-teal-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {translate(language, "weekRecsTitle")}
        </div>
        {insight.recommendations.map((rec) => (
          <div
            key={`${tab}-${rec.id}`}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-teal-50/50 border border-teal-100"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-stone-900">
                {translate(language, REC_TITLE[rec.copyId])}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {translate(language, REC_WHY[rec.copyId])}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartQuest(rec.questType)}
              className="shrink-0 px-4 py-2 rounded-full bg-teal-800 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-colors"
            >
              {translate(language, "weekStartQuest")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
