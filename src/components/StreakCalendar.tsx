import { useState } from "react";
import { LogEntry } from "../types";
import { Calendar, Flame, Lock } from "lucide-react";
import { Language, translate } from "../translations";

interface StreakCalendarProps {
  logs: LogEntry[];
  onToggleDay: (dateString: string, consumed: boolean, habit: any, reason?: string, solution?: string) => void;
  language: Language;
  activeUser: string | null;
  currentDateStr: string;
  onDateChange: (dateString: string) => void;
}

export default function StreakCalendar({ logs, onToggleDay, language, activeUser, currentDateStr, onDateChange }: StreakCalendarProps) {
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);
  
  // Custom manual logger helper
  const [manualHabit, setManualHabit] = useState<"vape" | "cigarettes">("vape");
  const [manualReason, setManualReason] = useState("");
  const [isAddingPastLog, setIsAddingPastLog] = useState(false);

  const now = new Date();
  let YEAR = now.getFullYear();
  let MONTH = now.getMonth(); // 0-indexed
  let simulatedDayNum = now.getDate();

  if (currentDateStr) {
    const parts = currentDateStr.split("-");
    if (parts.length === 3) {
      YEAR = parseInt(parts[0], 10);
      MONTH = parseInt(parts[1], 10) - 1; // 0-indexed
      simulatedDayNum = parseInt(parts[2], 10);
    }
  }

  const getDynamicSubtitle = (): string => {
    try {
      if (language === "ko") {
        return `${YEAR}년 ${MONTH + 1}월`;
      } else if (language === "zh") {
        return `${YEAR}년 ${MONTH + 1}월`;
      } else if (language === "ms") {
        const msMonths = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
        return `${msMonths[MONTH]} ${YEAR}`;
      } else {
        const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${enMonths[MONTH]} ${YEAR}`;
      }
    } catch (e) {
      return `${YEAR}-${String(MONTH + 1).padStart(2, "0")}`;
    }
  };

  const getDayString = (dayNum: number) => {
    return `${YEAR}-${String(MONTH + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  };

  const MONTH_NAME = getDynamicSubtitle();
  const TOTAL_DAYS = new Date(YEAR, MONTH + 1, 0).getDate();
  const START_DAY_OFFSET = new Date(YEAR, MONTH, 1).getDay();

  const TODAY_STR = currentDateStr;

  // Calculate dynamic streaks (consecutive clean days counting backwards from current day)
  const calculateStreak = (): number => {
    let streak = 0;
    // Walk backwards starting from current simulated date
    let checkDateString = TODAY_STR;
    
    while (true) {
      const dayLogs = logs.filter(l => l.date === checkDateString);
      
      if (dayLogs.length === 0) {
        // No log for this day, stop streak counting or assume clean if before today.
        // For a tighter streak calculation, let's treat unchecked days as stopping the streak.
        break;
      }
      
      // If any log for this day is consumed, it breaks the clean streak
      const hasConsumed = dayLogs.some(l => l.consumed);
      if (hasConsumed) {
        break;
      }
      
      streak++;
      
      // Move checkDateString backward by 1 day
      const d = new Date(checkDateString);
      d.setDate(d.getDate() - 1);
      checkDateString = d.toISOString().split("T")[0];
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  const handleDayClick = (dayNum: number) => {
    const dayStr = getDayString(dayNum);
    const realTodayStr = new Date().toISOString().split("T")[0];
    // If real future day, ignore
    if (dayStr > realTodayStr) return;
    
    // Automatically make clicked day the active tracker date!
    onDateChange(dayStr);
    
    setSelectedDayDetail(dayStr);
    setIsAddingPastLog(false);
    setManualReason("");
  };

  const saveManualLog = (consumed: boolean) => {
    if (!selectedDayDetail) return;
    
    const habitSelected = manualHabit;
    const reasonText = consumed ? (manualReason || "Felt temporary restlessness") : undefined;
    const solutionText = consumed 
      ? `Try taking 3 slow deep breaths right now. Chewing bold bubblegum or splash-washing cold water on your hands blocks physical cravings.`
      : undefined;

    onToggleDay(selectedDayDetail, consumed, habitSelected, reasonText, solutionText);
    setIsAddingPastLog(false);
    setManualReason("");
  };

  const getDayStatusClass = (dayNum: number) => {
    const dayStr = getDayString(dayNum);
    const dayLogs = logs.filter(l => l.date === dayStr);
    
    const isToday = dayStr === TODAY_STR;
    const realTodayStr = new Date().toISOString().split("T")[0];
    
    if (dayStr > realTodayStr) {
      return "bg-emerald-50/25 border border-emerald-100/45 text-emerald-800/40 pointer-events-none"; // Future days (light green)
    }

    if (dayLogs.length === 0) {
      if (isToday) return "bg-[#E8F8F5]/50 border-2 border-[#16A085] text-[#16A085] font-bold ring-4 ring-[#16A085]/15 scale-102 shadow-xs";
      return "bg-white border border-emerald-100 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"; // Unlogged past days
    }

    const consumedHabits = dayLogs.filter(l => l.consumed).map(l => l.habit);

    if (consumedHabits.length === 0) {
      // Clean day! Beautiful light glowing golden yellow
      return "bg-[#FFF59D] text-[#5B2C6F] font-bold ring-4 ring-[#FFF59D]/50 border border-[#F1C40F] shadow-xs hover:bg-[#FFF9C4]/85";
    }

    const hasVape = consumedHabits.includes("vape");
    const hasCigarettes = consumedHabits.includes("cigarettes");

    // Highlight combined colors beautifully using multi-color dual gradients & customized premium borders
    if (hasVape && hasCigarettes) {
      return "bg-gradient-to-br from-[#1F4E79] to-[#4D5656] text-white font-bold border-2 border-[#A3E4D7] ring-2 ring-emerald-300 scale-103 shadow-md hover:scale-108 duration-200";
    }
    if (hasVape) {
      return "bg-[#1F4E79] text-white font-bold ring-4 ring-[#1F4E79]/20 shadow-xs hover:bg-[#1A4367]";
    }
    if (hasCigarettes) {
      return "bg-[#4D5656] text-white font-bold ring-4 ring-[#4D5656]/20 shadow-xs hover:bg-[#404848]";
    }

    // Fallback consumed
    return "bg-[#8E44AD] text-white font-bold ring-4 ring-[#8E44AD]/20 shadow-xs";
  };

  const getWeekdayLabels = () => {
    if (language === "zh") {
      return ["日", "一", "二", "三", "四", "五", "六"];
    } else if (language === "ms") {
      return ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
    } else if (language === "ko") {
      return ["일", "월", "화", "수", "목", "금", "토"];
    } else {
      return ["S", "M", "T", "W", "T", "F", "S"];
    }
  };

  return (
    <div id="streakcalendar-card" className="bg-white/85 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/55 select-none transition-all duration-300 relative z-10">
      
      {/* Account Lock Overlay */}
      {!activeUser && (
        <div className="absolute inset-0 bg-white/95 rounded-[2rem] flex flex-col justify-center items-center text-center p-6 z-40 animate-fade-in select-none">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200/80 flex items-center justify-center mb-4 shadow-xs">
            <Lock className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#2C3E50]">
            {language === "ko" ? "🔒 회원님 전용의 회복 기록판" :
             language === "zh" ? "🔒 您专属的恢复仪表盘" :
             language === "ms" ? "🔒 Papan Rekod Pemulihan Peribadi" :
             "🔒 Private Progress Tracker"}
          </h3>
          <p className="text-xs text-[#566573]/80 mt-2 max-w-[280px] leading-relaxed font-bold">
            {language === "ko" ? "회복 상태를 기록하고 AI 조언을 받으시려면 상단에서 생성 혹은 로그인을 해주세요." :
             language === "zh" ? "请在上方注册或登录账户，以便记录每日情况并获取智能分析。" :
             language === "ms" ? "Sila daftar atau daftar masuk ke akaun anda di atas untuk merekodkan pemulihan dan mendapatkan nasihat." :
             "Register or sign in to your Bloom account above to view your golden wellness matrix, check-ins history and streaks."}
          </p>
        </div>
      )}
      
      {/* Tracker Grid Header */}
      <h3 className="text-lg font-serif font-bold text-[#2C3E50] mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-700" />
          {translate(language, "calendarTitle")}
        </span>
        
        {/* Streak Counter display */}
        <span className="text-xs font-semibold py-1 px-3 bg-[#E8F8F5] text-[#16A085] border border-[#D1F2EB] rounded-full flex items-center gap-1.5 animate-bounce">
          <Flame className="w-4 h-4 text-[#16A085] fill-[#16A085]" />
          {translate(language, "calendarStreakBtn", { streak: currentStreak })}
        </span>
      </h3>

      <div className="space-y-6">
        {/* Calendar Grid & Legend */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#566573]">
              {MONTH_NAME}
            </span>
            <span className="text-[10px] text-[#566573]/70 font-bold">
              {translate(language, "calendarInstruction")}
            </span>
          </div>

          {/* Day titles */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-[#566573]/70 uppercase tracking-widest mb-2">
            {getWeekdayLabels().map((dayLabel, idx) => (
              <div key={`lbl-${idx}`}>{dayLabel}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty days offsets for current dynamic month */}
            {Array.from({ length: START_DAY_OFFSET }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-9 w-full" />
            ))}

            {/* Days in Current Month */}
            {Array.from({ length: TOTAL_DAYS }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = getDayString(dayNum);
              const isSelected = selectedDayDetail === dateStr;

              const dayLogs = logs.filter(l => l.date === dateStr);
              const isCleanDay = dayLogs.length > 0 && dayLogs.every(l => !l.consumed);

              return (
                <button
                  id={`calendar-day-${dayNum}`}
                  key={`day-${dayNum}`}
                  onClick={() => handleDayClick(dayNum)}
                  className={`relative h-9 w-full rounded-full flex items-center justify-center text-xs transition-all duration-300 cursor-pointer overflow-hidden ${getDayStatusClass(dayNum)} ${
                    isSelected ? "ring-2 ring-emerald-700 scale-105 shadow-sm" : ""
                  }`}
                >
                  <span className="relative z-10">{dayNum}</span>
                  {isCleanDay && (
                    <span 
                       className="absolute top-0.5 right-0.5 text-[8px] animate-glitter pointer-events-none select-none"
                       style={{ transformOrigin: "center" }}
                    >
                      ✨
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Indicators Legend */}
          <div className="mt-5 pt-4 border-t border-emerald-100 space-y-3.5 select-none text-[10px] font-bold text-[#566573]">
            {/* Row 1: General States */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFF59D] border border-[#F1C40F] shadow-xs flex items-center justify-center text-[6px]">✨</span>
                <span>{translate(language, "calendarLegendClean")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#16A085] bg-[#E8F8F5]/50 ring-2 ring-[#16A085]/15" />
                <span>{translate(language, "calendarLegendCurrent")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-emerald-100" />
                <span>{translate(language, "calendarLegendNotLogged")}</span>
              </div>
            </div>

            {/* Row 2: Single Habit Codes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-1">
              <div className="flex items-center gap-1.5 p-1 bg-[#1F4E79]/5 rounded-lg border border-[#1F4E79]/10">
                <span className="w-3 h-3 rounded-md bg-[#1F4E79]" />
                <span>💨 {translate(language, "calendarLegendVape")}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[#4D5656]/5 rounded-lg border border-[#4D5656]/10">
                <span className="w-3 h-3 rounded-md bg-[#4D5656]" />
                <span>🚬 {translate(language, "calendarLegendCigarette")}</span>
              </div>
            </div>

            {/* Row 3: Co-Consumption Blended Blends */}
            <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100 space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-emerald-800 block mb-1">{translate(language, "calendarLegendBlendsTitle")}</span>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-[#1F4E79] to-[#4D5656] border border-[#A3E4D7] shadow-xs" />
                  <span>{translate(language, "calendarLegendVapeCig")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Details Panel - elegant and modern vertical slide-in */}
        {selectedDayDetail && (
          <div className="bg-emerald-50/30 rounded-[1.5rem] p-4 border border-emerald-100 flex flex-col justify-between transition-all duration-300 animate-fadeIn">
            <div>
              <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-emerald-100">
                <span className="text-xs font-bold text-emerald-800">
                  {translate(language, "calendarDayDate", { date: selectedDayDetail })}
                </span>
                <button
                  onClick={() => setSelectedDayDetail(null)}
                  className="text-[10px] text-[#566573] font-bold bg-emerald-100/50 hover:bg-emerald-100 px-2.5 py-1 rounded-full cursor-pointer transition-colors border-none"
                >
                  {translate(language, "close")}
                </button>
              </div>

              {logs.filter(l => l.date === selectedDayDetail).length > 0 ? (
                /* Logs details list */
                <div className="space-y-3">
                  {logs.filter(l => l.date === selectedDayDetail).map((log) => {
                    const isVape = log.habit === "vape";
                    const habitLabel = isVape ? translate(language, "vape") : translate(language, "cigarette");
                    const emoji = log.consumed ? (isVape ? "💨 " : "🚬 ") : "🌸 ";
                    return (
                      <div key={log.id} className="text-xs leading-relaxed">
                        <div className="flex items-center justify-between font-bold text-stone-700">
                          <span className="capitalize text-emerald-850 flex items-center gap-1 font-serif">
                            {emoji}
                            {habitLabel} • {log.consumed ? translate(language, "calendarDayConsumed") : translate(language, "calendarDayClean")}
                          </span>
                          {log.consumed && log.quantity !== undefined && (
                            <span className="bg-emerald-100/90 text-emerald-950 px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-xs">
                              {log.quantity} {isVape ? "puffs" : "sticks"}
                            </span>
                          )}
                        </div>
                        {log.consumed && log.reason && (
                          <div className="mt-1.5 text-stone-600 pl-2 border-l-2 border-emerald-700">
                            <span className="font-semibold text-emerald-800 block text-[10px] uppercase">{translate(language, "calendarReasonLabel")}</span>
                            "{log.reason}"
                          </div>
                        )}
                        {!log.consumed && (
                          <div className="mt-1 text-[#566573] leading-normal font-semibold italic">
                            {translate(language, "clean")} ✨
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Retroactive Toggle Option */}
                  <button
                    onClick={() => {
                      const targetLog = logs.find(l => l.date === selectedDayDetail);
                      if (targetLog) {
                        onToggleDay(selectedDayDetail, !targetLog.consumed, targetLog.habit);
                      }
                    }}
                    className="mt-3 block text-[10px] text-emerald-800 bg-emerald-100/50 hover:bg-emerald-100 px-3 py-1.5 rounded-full font-bold cursor-pointer transition-colors border-none"
                  >
                    {translate(language, "calendarToggleStatusBtn")}
                  </button>
                </div>
              ) : (
                /* Empty state to log past days */
                <div>
                  <p className="text-xs text-[#566573] italic mb-3 font-semibold">
                    {translate(language, "calendarNoLogsYet")}
                  </p>

                  {isAddingPastLog ? (
                    <div className="space-y-3 p-3 bg-white rounded-xl border border-emerald-100">
                      <div>
                        <label className="text-[10px] font-bold text-[#2C3E50] block mb-1">{translate(language, "calendarManualLabelHabit")}</label>
                        <select
                          value={manualHabit}
                          onChange={(e: any) => setManualHabit(e.target.value)}
                          className="text-xs rounded-lg p-1 bg-[#E8F8F5]/50 border border-[#D1F2EB] w-full text-[#2C3E50]"
                        >
                          <option value="vape">{translate(language, "vape")}</option>
                          <option value="cigarettes">{translate(language, "cigarette")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#2C3E50] block mb-1">{translate(language, "calendarManualLabelTrigger")}</label>
                        <input
                          type="text"
                          placeholder="E.g. Stress..."
                          value={manualReason}
                          onChange={(e) => setManualReason(e.target.value)}
                          className="text-xs p-1.5 bg-[#E8F8F5]/50 border border-[#D1F2EB] w-full rounded-lg text-[#2C3E50] focus:outline-none focus:ring-1 focus:ring-emerald-750/30"
                        />
                      </div>

                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={() => saveManualLog(false)}
                          className="flex-1 py-1.5 rounded-lg bg-[#EBF5FB] hover:bg-sky-100 text-[#3498DB] text-[10px] font-bold cursor-pointer transition-colors border-none"
                        >
                          {translate(language, "calendarManualMarkClean")}
                        </button>
                        <button
                          onClick={() => saveManualLog(true)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-100/50 hover:bg-emerald-100 text-emerald-850 text-[10px] font-bold cursor-pointer transition-colors border-none"
                        >
                          {translate(language, "calendarManualMarkConsumed")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingPastLog(true)}
                      className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-850 text-white rounded-full font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors border-none"
                    >
                      {translate(language, "calendarManualAddBtn")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
