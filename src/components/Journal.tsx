import { useState, FormEvent } from "react";
import { BookOpen, Calendar, Trash2, CheckCircle2, Lock } from "lucide-react";
import { JournalEntry } from "../types";
import { Language, translate } from "../translations";

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (text: string) => void;
  onDeleteEntry: (id: string) => void;
  language: Language;
  activeUser: string | null;
}

export default function Journal({ entries, onAddEntry, onDeleteEntry, language, activeUser }: JournalProps) {
  const [inputText, setInputText] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddEntry(inputText.trim());
    setInputText("");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const TODAY_STR = new Date().toISOString().split("T")[0];

  const getTodayLabel = (): string => {
    const d = new Date();
    if (language === "ko") {
      return `오늘 (${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일)`;
    } else if (language === "zh") {
      return `今日 (${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日)`;
    } else if (language === "ms") {
      const msMonths = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
      return `Hari Ini (${d.getDate()} ${msMonths[d.getMonth()]} ${d.getFullYear()})`;
    } else {
      const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `Today (${enMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()})`;
    }
  };

  // Group entries to see if we wrote one for today
  const hasTodayEntry = entries.some(e => e.date === TODAY_STR);

  return (
    <div id="journal-card" className="bg-white/85 backdrop-blur-md rounded-[2rem] p-6 border border-white/55 shadow-xl select-none transition-all duration-300 relative min-h-[300px] z-10">
      
      {/* Account Lock Overlay */}
      {!activeUser && (
        <div className="absolute inset-0 bg-white/98 rounded-[2rem] flex flex-col justify-center items-center text-center p-6 z-40 animate-fade-in select-none overflow-hidden">
          
          {/* Calming Left Floral Illustration */}
          <div className="absolute left-[-16px] bottom-[-24px] pointer-events-none opacity-25 sm:opacity-45 select-none z-0">
            <svg width="120" height="220" viewBox="0 0 120 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 sm:w-28 md:w-32 h-auto">
              <path d="M10,210 Q35,170 30,110 Q25,50 65,10" stroke="url(#stem-grad-left)" strokeWidth="3" strokeLinecap="round" />
              <path d="M22,160 C40,165 45,150 35,140 C25,130 18,145 22,160 Z" fill="url(#leaf-grad-1)" />
              <path d="M28,115 C10,110 5,95 15,90 C25,85 30,100 28,115 Z" fill="url(#leaf-grad-2)" />
              <path d="M31,75 C50,70 48,55 38,50 C28,45 20,60 31,75 Z" fill="url(#leaf-grad-1)" />
              <path d="M50,35 C35,30 30,15 40,10 C50,5 55,20 50,35 Z" fill="url(#leaf-grad-3)" />
              
              <circle cx="55" cy="65" r="3" fill="#F4D03F" opacity="0.6" className="animate-pulse" />
              <circle cx="20" cy="120" r="2" fill="#2E7D32" opacity="0.4" />
              <circle cx="45" cy="180" r="4" fill="#A2D9CE" opacity="0.5" />
              
              <defs>
                <linearGradient id="stem-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#81C784" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="leaf-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A2D9CE" />
                  <stop offset="100%" stopColor="#58D68D" />
                </linearGradient>
                <linearGradient id="leaf-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C8E6C9" />
                  <stop offset="100%" stopColor="#A5D6A7" />
                </linearGradient>
                <linearGradient id="leaf-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FCF3CF" />
                  <stop offset="100%" stopColor="#F4D03F" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Calming Right Floral Illustration */}
          <div className="absolute right-[-16px] top-[-16px] pointer-events-none opacity-25 sm:opacity-45 select-none z-0">
            <svg width="120" height="220" viewBox="0 0 120 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 sm:w-28 md:w-32 h-auto">
              <path d="M110,210 Q85,170 90,110 Q95,50 55,10" stroke="url(#stem-grad-right)" strokeWidth="3" strokeLinecap="round" />
              <path d="M98,160 C80,165 75,150 85,140 C95,130 102,145 98,160 Z" fill="url(#leaf-grad-2)" />
              <path d="M92,115 C110,110 115,95 105,90 C95,85 90,100 92,115 Z" fill="url(#leaf-grad-1)" />
              <path d="M89,75 C70,70 72,55 82,50 C92,45 100,60 89,75 Z" fill="url(#leaf-grad-3)" />
              <path d="M70,35 C85,30 90,15 80,10 C70,5 65,20 70,35 Z" fill="url(#leaf-grad-1)" />
              
              <circle cx="65" cy="65" r="2.5" fill="#F4D03F" opacity="0.6" className="animate-pulse" />
              <circle cx="100" cy="120" r="3" fill="#2ECC71" opacity="0.4" />
              <circle cx="75" cy="180" r="2" fill="#C8E6C9" opacity="0.5" />
              
              <defs>
                <linearGradient id="stem-grad-right" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#81C784" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200/80 flex items-center justify-center mb-4 shadow-xs z-10">
            <Lock className="w-6 h-6 text-emerald-700 animate-pulse" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#2C3E50] z-10">
            {language === "ko" ? "🔒 회원님 전용의 회복 기록판" :
             language === "zh" ? "🔒 您专属的恢复仪表盘" :
             language === "ms" ? "🔒 Papan Rekod Pemulihan Peribadi" :
             "🔒 Private Recovery Journal"}
          </h3>
          <p className="text-xs text-[#566573]/80 mt-2 max-w-[280px] leading-relaxed font-bold z-10">
            {language === "ko" ? "회복 상태를 기록하고 AI 조언을 받으시려면 상단에서 생성 혹은 로그인을 해주세요." :
             language === "zh" ? "请在上方注册或登录账户，以便记录每日情况并获取智能分析。" :
             language === "ms" ? "Sila daftar atau daftar masuk ke akaun anda di atas untuk merekodkan pemulihan dan mendapatkan nasihat." :
             "Register or sign in to your Bloom account above to start writing emotional relief logs and private reflective notes."}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h3 className="text-sm font-serif font-bold text-emerald-950 uppercase tracking-wider">
            {translate(language, "journalTitle")}
          </h3>
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={translate(language, "journalPlaceholder")}
            rows={3}
            maxLength={600}
            className="w-full text-xs p-3.5 bg-emerald-50/20 border border-[#C8E6C9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700/60 font-medium text-emerald-950 placeholder-stone-400 resize-none transition-all"
          />
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold px-1 mt-1">
            <span>{translate(language, "journalChars", { count: inputText.length })}</span>
            {hasTodayEntry && <span className="text-emerald-700">{translate(language, "journalLoggedForToday")}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {successMsg ? (
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#117A65] animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {translate(language, "journalSuccessMsg")}
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition-all active:scale-95 shadow-xs flex items-center gap-1.5 border-none ${
              inputText.trim()
                ? "bg-emerald-700 hover:bg-emerald-850 text-white"
                : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
            }`}
          >
            {translate(language, "journalSaveBtn")}
          </button>
        </div>
      </form>

      {/* Diary history feed */}
      {entries.length > 0 && (
        <div className="mt-5 pt-4 border-t border-emerald-100 space-y-3 max-h-[220px] overflow-y-auto pr-1">
          <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">
            {translate(language, "journalHistoryTitle", { count: entries.length })}
          </h4>
          <div className="space-y-2.5">
            {[...entries].reverse().map((entry) => (
              <div 
                key={entry.id} 
                className="bg-[#FAF9F6] p-3 rounded-2xl border border-emerald-100/70 flex items-start justify-between gap-3 group hover:border-emerald-300 transition-colors"
                id={`journal-history-item-${entry.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-800/90 font-extrabold mb-1 pb-0.5 border-b border-stone-200/50">
                    <Calendar className="w-3 h-3 text-emerald-700" />
                    <span>{entry.date === TODAY_STR ? getTodayLabel() : entry.date}</span>
                  </div>
                  <p className="text-xs text-stone-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {entry.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                  className="p-1 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 active:scale-90 transition-all cursor-pointer opacity-80 group-hover:opacity-100 border-none bg-transparent"
                  title={translate(language, "journalRemoveTooltip")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
