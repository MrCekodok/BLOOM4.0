import { LogEntry } from "../types";
import { HealthQuestType } from "../components/HealthQuestsModal";

export type TriggerCategory =
  | "stress"
  | "boredom"
  | "social"
  | "meal"
  | "other";

export interface WeeklyRecommendation {
  id: string;
  questType: HealthQuestType;
  /** Translation key suffix: weekRec_{id}_title / weekRec_{id}_why */
  copyId: "stressBreath" | "boredomMove" | "socialGround" | "mealHydrate" | "quantityWalk" | "protectStreak" | "startLogging";
  priority: number;
}

export interface WeeklyInsight {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  cleanDays: number;
  slipDays: number;
  loggedDays: number;
  totalQuantity: number;
  prevWeekQuantity: number;
  quantityDeltaPct: number | null;
  topTrigger: { category: TriggerCategory; count: number; percentage: number } | null;
  slipsByWeekday: { weekday: number; labelKey: string; count: number }[];
  worstWeekday: number | null;
  recommendations: WeeklyRecommendation[];
}

export interface MonthlyInsight {
  startDate: string;
  endDate: string;
  monthLabel: string; // YYYY-MM
  cleanDays: number;
  slipDays: number;
  loggedDays: number;
  totalQuantity: number;
  prevMonthQuantity: number;
  quantityDeltaPct: number | null;
  bestStreak: number;
  cleanRatePct: number | null;
  topTrigger: { category: TriggerCategory; count: number; percentage: number } | null;
  weeklyTrend: { weekIndex: number; label: string; cleanDays: number; slipDays: number; quantity: number }[];
  recommendations: WeeklyRecommendation[];
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1);
}

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, delta: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + delta);
  return toLocalDateString(d);
}

function classifyTrigger(reason?: string): TriggerCategory {
  const text = (reason || "").toLowerCase();
  if (/stress|anxiety|exam|work|pressure|angry|anger|tekanan|stres|学业|压力|考试|工作|生气|怒|스트레스|시험|업무|불안/.test(text)) {
    return "stress";
  }
  if (/bored|boredom|idle|free|nothing|tired|fatigue|bosan|penat|无聊|空闲|累|疲劳|지루|심심|피곤/.test(text)) {
    return "boredom";
  }
  if (/friend|peer|party|social|club|gathering|rakan|kawan|pesta|朋友|聚会|同辈|社交|친구|모임|술자리/.test(text)) {
    return "social";
  }
  if (/meal|eat|food|coffee|drink|makan|kopi|minum|饭|吃|咖啡|茶|食|식사|커피|밥|음료/.test(text)) {
    return "meal";
  }
  return "other";
}

function weekRangeEnding(endDate: string): { start: string; end: string; days: string[] } {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(addDays(endDate, -i));
  }
  return { start: days[0], end: days[days.length - 1], days };
}

function quantityInRange(logs: LogEntry[], days: Set<string>): number {
  return logs
    .filter((l) => days.has(l.date) && l.consumed)
    .reduce((sum, l) => sum + (l.quantity || 0), 0);
}

/**
 * Aggregate last 7 days (ending on activeDate) and produce rule-based quest recommendations.
 */
export function buildWeeklyInsight(logs: LogEntry[], activeDate: string): WeeklyInsight {
  const current = weekRangeEnding(activeDate);
  const prevEnd = addDays(current.start, -1);
  const previous = weekRangeEnding(prevEnd);

  const currentDaySet = new Set(current.days);
  const prevDaySet = new Set(previous.days);

  const weekLogs = logs.filter((l) => currentDaySet.has(l.date));
  const daysWithLogs = new Set(weekLogs.map((l) => l.date));
  const slipDaySet = new Set(weekLogs.filter((l) => l.consumed).map((l) => l.date));
  const cleanDaySet = new Set(
    [...daysWithLogs].filter((d) => !slipDaySet.has(d))
  );

  const slipLogs = weekLogs.filter((l) => l.consumed);
  const triggerCounts: Record<TriggerCategory, number> = {
    stress: 0,
    boredom: 0,
    social: 0,
    meal: 0,
    other: 0
  };
  slipLogs.forEach((l) => {
    triggerCounts[classifyTrigger(l.reason)] += 1;
  });
  const triggerTotal = Object.values(triggerCounts).reduce((a, b) => a + b, 0);
  let topTrigger: WeeklyInsight["topTrigger"] = null;
  if (triggerTotal > 0) {
    const [category, count] = (Object.entries(triggerCounts) as [TriggerCategory, number][])
      .sort((a, b) => b[1] - a[1])[0];
    topTrigger = {
      category,
      count,
      percentage: Math.round((count / triggerTotal) * 100)
    };
  }

  const slipsByWeekdayMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  slipDaySet.forEach((dateStr) => {
    const wd = parseLocalDate(dateStr).getDay();
    slipsByWeekdayMap[wd] = (slipsByWeekdayMap[wd] || 0) + 1;
  });
  const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const slipsByWeekday = weekdayKeys.map((labelKey, weekday) => ({
    weekday,
    labelKey,
    count: slipsByWeekdayMap[weekday] || 0
  }));
  const worst = [...slipsByWeekday].sort((a, b) => b.count - a.count)[0];
  const worstWeekday = worst && worst.count > 0 ? worst.weekday : null;

  const totalQuantity = quantityInRange(logs, currentDaySet);
  const prevWeekQuantity = quantityInRange(logs, prevDaySet);
  let quantityDeltaPct: number | null = null;
  if (prevWeekQuantity > 0) {
    quantityDeltaPct = Math.round(((totalQuantity - prevWeekQuantity) / prevWeekQuantity) * 100);
  } else if (totalQuantity > 0 && prevWeekQuantity === 0) {
    quantityDeltaPct = 100;
  }

  const recommendations = buildRecommendations({
    loggedDays: daysWithLogs.size,
    cleanDays: cleanDaySet.size,
    slipDays: slipDaySet.size,
    topTrigger: topTrigger?.category || null,
    quantityDeltaPct,
    totalQuantity
  });

  return {
    startDate: current.start,
    endDate: current.end,
    cleanDays: cleanDaySet.size,
    slipDays: slipDaySet.size,
    loggedDays: daysWithLogs.size,
    totalQuantity,
    prevWeekQuantity,
    quantityDeltaPct,
    topTrigger,
    slipsByWeekday,
    worstWeekday,
    recommendations
  };
}

function buildRecommendations(input: {
  loggedDays: number;
  cleanDays: number;
  slipDays: number;
  topTrigger: TriggerCategory | null;
  quantityDeltaPct: number | null;
  totalQuantity: number;
}): WeeklyRecommendation[] {
  const recs: WeeklyRecommendation[] = [];

  if (input.loggedDays === 0) {
    recs.push({
      id: "start-logging",
      questType: "breathing",
      copyId: "startLogging",
      priority: 1
    });
    return recs;
  }

  if (input.topTrigger === "stress") {
    recs.push({
      id: "stress-breath",
      questType: "breathing",
      copyId: "stressBreath",
      priority: 1
    });
  } else if (input.topTrigger === "boredom") {
    recs.push({
      id: "boredom-move",
      questType: "shakeout",
      copyId: "boredomMove",
      priority: 1
    });
  } else if (input.topTrigger === "social") {
    recs.push({
      id: "social-ground",
      questType: "grounding",
      copyId: "socialGround",
      priority: 1
    });
  } else if (input.topTrigger === "meal") {
    recs.push({
      id: "meal-hydrate",
      questType: "hydration",
      copyId: "mealHydrate",
      priority: 1
    });
  }

  if (input.quantityDeltaPct !== null && input.quantityDeltaPct > 10) {
    recs.push({
      id: "quantity-walk",
      questType: "walking",
      copyId: "quantityWalk",
      priority: 2
    });
  }

  if (input.slipDays === 0 && input.cleanDays >= 3) {
    recs.push({
      id: "protect-streak",
      questType: "breathing",
      copyId: "protectStreak",
      priority: 3
    });
  }

  // Always offer at least one actionable quest
  if (recs.length === 0) {
    recs.push({
      id: "protect-streak",
      questType: "breathing",
      copyId: "protectStreak",
      priority: 3
    });
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

function monthRangeContaining(activeDate: string): { start: string; end: string; days: string[]; monthLabel: string } {
  const d = parseLocalDate(activeDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days: string[] = [];
  for (let day = 1; day <= lastDay; day++) {
    days.push(toLocalDateString(new Date(year, month, day)));
  }
  return {
    start: days[0],
    end: days[days.length - 1],
    days,
    monthLabel: `${year}-${String(month + 1).padStart(2, "0")}`
  };
}

function previousMonthRange(activeDate: string): { days: string[] } {
  const d = parseLocalDate(activeDate);
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return monthRangeContaining(toLocalDateString(prev));
}

function bestCleanStreak(logs: LogEntry[], daySet: Set<string>, orderedDays: string[]): number {
  let best = 0;
  let current = 0;
  for (const day of orderedDays) {
    if (!daySet.has(day)) {
      // only count days that were logged
      continue;
    }
    const dayLogs = logs.filter((l) => l.date === day);
    const slipped = dayLogs.some((l) => l.consumed);
    if (dayLogs.length > 0 && !slipped) {
      current += 1;
      best = Math.max(best, current);
    } else if (slipped) {
      current = 0;
    }
  }
  return best;
}

/**
 * Aggregate the calendar month containing activeDate + monthly recommendations.
 */
export function buildMonthlyInsight(logs: LogEntry[], activeDate: string): MonthlyInsight {
  const current = monthRangeContaining(activeDate);
  const previous = previousMonthRange(activeDate);
  const currentDaySet = new Set(current.days);
  const prevDaySet = new Set(previous.days);

  const monthLogs = logs.filter((l) => currentDaySet.has(l.date));
  const daysWithLogs = new Set(monthLogs.map((l) => l.date));
  const slipDaySet = new Set(monthLogs.filter((l) => l.consumed).map((l) => l.date));
  const cleanDaySet = new Set([...daysWithLogs].filter((d) => !slipDaySet.has(d)));

  const slipLogs = monthLogs.filter((l) => l.consumed);
  const triggerCounts: Record<TriggerCategory, number> = {
    stress: 0,
    boredom: 0,
    social: 0,
    meal: 0,
    other: 0
  };
  slipLogs.forEach((l) => {
    triggerCounts[classifyTrigger(l.reason)] += 1;
  });
  const triggerTotal = Object.values(triggerCounts).reduce((a, b) => a + b, 0);
  let topTrigger: MonthlyInsight["topTrigger"] = null;
  if (triggerTotal > 0) {
    const [category, count] = (Object.entries(triggerCounts) as [TriggerCategory, number][])
      .sort((a, b) => b[1] - a[1])[0];
    topTrigger = {
      category,
      count,
      percentage: Math.round((count / triggerTotal) * 100)
    };
  }

  const totalQuantity = quantityInRange(logs, currentDaySet);
  const prevMonthQuantity = quantityInRange(logs, prevDaySet);
  let quantityDeltaPct: number | null = null;
  if (prevMonthQuantity > 0) {
    quantityDeltaPct = Math.round(((totalQuantity - prevMonthQuantity) / prevMonthQuantity) * 100);
  } else if (totalQuantity > 0 && prevMonthQuantity === 0) {
    quantityDeltaPct = 100;
  }

  const cleanRatePct =
    daysWithLogs.size > 0 ? Math.round((cleanDaySet.size / daysWithLogs.size) * 100) : null;

  // Split month into up to 5 week chunks for a simple trend strip
  const weeklyTrend: MonthlyInsight["weeklyTrend"] = [];
  for (let i = 0; i < current.days.length; i += 7) {
    const chunk = current.days.slice(i, i + 7);
    const chunkSet = new Set(chunk);
    const chunkLogs = logs.filter((l) => chunkSet.has(l.date));
    const chunkSlipDays = new Set(chunkLogs.filter((l) => l.consumed).map((l) => l.date));
    const chunkLogged = new Set(chunkLogs.map((l) => l.date));
    const chunkClean = [...chunkLogged].filter((d) => !chunkSlipDays.has(d)).length;
    weeklyTrend.push({
      weekIndex: weeklyTrend.length + 1,
      label: `W${weeklyTrend.length + 1}`,
      cleanDays: chunkClean,
      slipDays: chunkSlipDays.size,
      quantity: quantityInRange(logs, chunkSet)
    });
  }

  const recommendations = buildRecommendations({
    loggedDays: daysWithLogs.size,
    cleanDays: cleanDaySet.size,
    slipDays: slipDaySet.size,
    topTrigger: topTrigger?.category || null,
    quantityDeltaPct,
    totalQuantity
  });

  return {
    startDate: current.start,
    endDate: current.end,
    monthLabel: current.monthLabel,
    cleanDays: cleanDaySet.size,
    slipDays: slipDaySet.size,
    loggedDays: daysWithLogs.size,
    totalQuantity,
    prevMonthQuantity,
    quantityDeltaPct,
    bestStreak: bestCleanStreak(logs, daysWithLogs, current.days),
    cleanRatePct,
    topTrigger,
    weeklyTrend,
    recommendations
  };
}

export interface InsightEvidenceSignal {
  id: string;
  label: string;
  value: string;
}

export interface InsightExplanation {
  /** Short evidence chips shown for XAI transparency */
  signals: InsightEvidenceSignal[];
  /** 2–3 plain-language lines explaining the data before recommendations */
  lines: string[];
  source: "rules" | "gemini";
}

type PeriodInsight = WeeklyInsight | MonthlyInsight;

function isMonthly(insight: PeriodInsight): insight is MonthlyInsight {
  return "monthLabel" in insight && "weeklyTrend" in insight;
}

/**
 * Transparent rule-based XAI: maps measurable signals → short explanation lines.
 * Used offline and as fallback when Gemini is unavailable.
 */
export function buildLocalInsightExplanation(
  insight: PeriodInsight,
  period: "week" | "month",
  lang: string = "en"
): InsightExplanation {
  const signals: InsightEvidenceSignal[] = [];
  const lines: string[] = [];

  signals.push({
    id: "clean-slip",
    label: lang === "ms" ? "Rekod" : "Record",
    value: `${insight.cleanDays} clean / ${insight.slipDays} slips`
  });

  if (insight.quantityDeltaPct !== null) {
    signals.push({
      id: "qty-delta",
      label: lang === "ms" ? "Trend kuantiti" : "Quantity trend",
      value: `${insight.quantityDeltaPct > 0 ? "+" : ""}${insight.quantityDeltaPct}%`
    });
  }

  if (insight.topTrigger) {
    signals.push({
      id: "trigger",
      label: lang === "ms" ? "Pencetus utama" : "Top trigger",
      value: `${insight.topTrigger.category} ${insight.topTrigger.percentage}%`
    });
  }

  if (!isMonthly(insight) && insight.worstWeekday !== null) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    signals.push({
      id: "worst-day",
      label: lang === "ms" ? "Hari kritikal" : "Critical day",
      value: days[insight.worstWeekday] || "?"
    });
  }

  if (isMonthly(insight) && insight.cleanRatePct !== null) {
    signals.push({
      id: "clean-rate",
      label: lang === "ms" ? "Kadar bersih" : "Clean rate",
      value: `${insight.cleanRatePct}%`
    });
  }

  if (insight.loggedDays === 0) {
    lines.push(
      lang === "ms"
        ? `Tiada log ${period === "week" ? "mingguan" : "bulanan"} lagi — corak belum dapat diterangkan.`
        : `No ${period === "week" ? "weekly" : "monthly"} logs yet — there isn’t enough pattern data to explain.`
    );
    lines.push(
      lang === "ms"
        ? "Satu daftar masuk jujur akan membuka penjelasan dan cadangan seterusnya."
        : "One honest check-in will unlock a clearer explanation and the next recommendations."
    );
    return { signals, lines, source: "rules" };
  }

  // Line 1: overall pattern
  if (insight.slipDays === 0) {
    lines.push(
      lang === "ms"
        ? `Anda mencatat ${insight.cleanDays} hari bersih tanpa terlanjur dalam tempoh ini — isyarat kawalan yang kuat.`
        : `You logged ${insight.cleanDays} clean day(s) with no slips in this period — a strong control signal.`
    );
  } else if (insight.cleanDays >= insight.slipDays) {
    lines.push(
      lang === "ms"
        ? `Hari bersih (${insight.cleanDays}) masih melebihi hari terlanjur (${insight.slipDays}), jadi momentum positif masih ada walaupun ada kesilapan.`
        : `Clean days (${insight.cleanDays}) still outnumber slip days (${insight.slipDays}), so momentum remains positive despite setbacks.`
    );
  } else {
    lines.push(
      lang === "ms"
        ? `Hari terlanjur (${insight.slipDays}) lebih tinggi daripada hari bersih (${insight.cleanDays}) — tempoh ini memerlukan intervensi lebih kerap.`
        : `Slip days (${insight.slipDays}) outweigh clean days (${insight.cleanDays}) — this period needs more frequent coping interventions.`
    );
  }

  // Line 2: trigger / quantity drivers
  if (insight.topTrigger && insight.quantityDeltaPct !== null && insight.quantityDeltaPct > 10) {
    lines.push(
      lang === "ms"
        ? `Pencetus utama ialah ${insight.topTrigger.category} (${insight.topTrigger.percentage}%), dan kuantiti naik ${insight.quantityDeltaPct}% berbanding tempoh sebelumnya — kedua-dua isyarat ini memacu cadangan di bawah.`
        : `Your dominant trigger is ${insight.topTrigger.category} (${insight.topTrigger.percentage}%), and quantity rose ${insight.quantityDeltaPct}% vs the prior period — both signals drive the recommendations below.`
    );
  } else if (insight.topTrigger) {
    lines.push(
      lang === "ms"
        ? `Corak terlanjur paling kerap dikaitkan dengan ${insight.topTrigger.category} (${insight.topTrigger.percentage}% kes) — cadangan akan menyasarkan pencetus ini dahulu.`
        : `Most slips cluster around ${insight.topTrigger.category} (${insight.topTrigger.percentage}% of cases) — recommendations will target this trigger first.`
    );
  } else if (insight.quantityDeltaPct !== null && insight.quantityDeltaPct > 10) {
    lines.push(
      lang === "ms"
        ? `Kuantiti penggunaan naik ${insight.quantityDeltaPct}% berbanding tempoh sebelumnya, jadi fokus utama ialah menurunkan intensiti keinginan harian.`
        : `Usage quantity rose ${insight.quantityDeltaPct}% versus the prior period, so the priority is reducing daily urge intensity.`
    );
  } else if (insight.quantityDeltaPct !== null && insight.quantityDeltaPct < 0) {
    lines.push(
      lang === "ms"
        ? `Kuantiti turun ${Math.abs(insight.quantityDeltaPct)}% berbanding tempoh sebelumnya — kemajuan nyata yang perlu dikekalkan dengan rutin penanganan.`
        : `Quantity fell ${Math.abs(insight.quantityDeltaPct)}% versus the prior period — real progress to lock in with a coping routine.`
    );
  }

  // Line 3: timing / monthly specifics
  if (!isMonthly(insight) && insight.worstWeekday !== null && insight.slipDays > 0) {
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysMs = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
    const dayName = (lang === "ms" ? daysMs : daysEn)[insight.worstWeekday];
    lines.push(
      lang === "ms"
        ? `Hari paling berisiko ialah ${dayName}. Sediakan misi kesihatan lebih awal pada hari itu sebelum keinginan memuncak.`
        : `Your highest-risk day is ${dayName}. Pre-load a health quest earlier that day before the urge peaks.`
    );
  } else if (isMonthly(insight) && insight.bestStreak > 0) {
    lines.push(
      lang === "ms"
        ? `Rekod bersih terpanjang bulan ini ialah ${insight.bestStreak} hari — gunakan itu sebagai bukti anda mampu mengekalkan rentak.`
        : `Your longest clean streak this month is ${insight.bestStreak} day(s) — use that as proof you can sustain the rhythm.`
    );
  }

  if (lines.length === 1) {
    lines.push(
      lang === "ms"
        ? "Cadangan di bawah dipilih kerana ia paling sepadan dengan isyarat data di atas."
        : "The recommendations below were selected because they best match the signals above."
    );
  }

  return { signals, lines: lines.slice(0, 3), source: "rules" };
}

/** Compact JSON payload for Gemini XAI explain endpoint */
export function toExplainPayload(insight: PeriodInsight, period: "week" | "month") {
  return {
    period,
    startDate: insight.startDate,
    endDate: insight.endDate,
    cleanDays: insight.cleanDays,
    slipDays: insight.slipDays,
    loggedDays: insight.loggedDays,
    totalQuantity: insight.totalQuantity,
    quantityDeltaPct: insight.quantityDeltaPct,
    topTrigger: insight.topTrigger,
    ...(isMonthly(insight)
      ? {
          bestStreak: insight.bestStreak,
          cleanRatePct: insight.cleanRatePct,
          weeklyTrend: insight.weeklyTrend
        }
      : {
          worstWeekday: insight.worstWeekday
        })
  };
}
