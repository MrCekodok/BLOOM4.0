import { useState, useEffect } from "react";
import { User, AlertCircle, Sparkles, Check, Heart, Trophy, LogOut, HelpCircle } from "lucide-react";
import { PlantAvatar, LogEntry } from "../types";
import { Language, translate } from "../translations";

const PERSONAS: PlantAvatar[] = [
  {
    id: "seedling",
    name: "Spunky Seedling",
    emoji: "🌱",
    stageName: "Level 1 • Roots & Courage",
    tagline: "Every grand tree started by daring to sink its roots.",
    themeColor: "text-green-leaf",
    bgColor: "bg-green-soft",
  },
  {
    id: "sprout",
    name: "Serene Sprout",
    emoji: "🌿",
    stageName: "Level 2 • Rising Resilient",
    tagline: "Stretching upward towards the gentle morning warmth.",
    themeColor: "text-[#7B9A86]",
    bgColor: "bg-stone-100",
  },
  {
    id: "peony",
    name: "Blushing Peony",
    emoji: "🌸",
    stageName: "Level 3 • Honest Blossom",
    tagline: "Petal by petal, vulnerability makes you beautiful.",
    themeColor: "text-rose-dusty",
    bgColor: "bg-brand-blush",
  },
  {
    id: "fern",
    name: "Golden Fern",
    emoji: "🍀",
    stageName: "Level 4 • Deep Grounding",
    tagline: "Swaying gracefully in the wind, but staying unbroken.",
    themeColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  {
    id: "cosmic",
    name: "Zen Lotus",
    emoji: "🪷",
    stageName: "Level 5 • Master Blooming",
    tagline: "Rising calmly above the mud to shine your light.",
    themeColor: "text-purple-600",
    bgColor: "bg-purple-50",
  }
];

interface HeaderProps {
  onAvatarChanged?: (avatarId: string) => void;
  logs?: LogEntry[];
  activeUser?: string | null;
  language: Language;
  currentDateStr?: string;
  coins?: number;
  onLogout?: () => void;
  onOpenGuide?: () => void;
  onOpenTutorial?: () => void;
  onOpenThemeSelector?: () => void;
  compact?: boolean;
}

export default function Header({ onAvatarChanged, logs = [], activeUser = null, language, currentDateStr, coins = 0, onLogout, onOpenGuide, onOpenTutorial, onOpenThemeSelector, compact = false }: HeaderProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("peony");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Freeze background scrolling when Header avatar modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!activeUser) return;
    const saved =
      localStorage.getItem(`bloom_user_avatar_${activeUser}`) ||
      localStorage.getItem("bloom_user_avatar");
    if (saved) {
      setSelectedAvatarId(saved);
      localStorage.setItem(`bloom_user_avatar_${activeUser}`, saved);
      localStorage.removeItem("bloom_user_avatar");
      if (onAvatarChanged) onAvatarChanged(saved);
    } else {
      setSelectedAvatarId("peony");
      if (onAvatarChanged) onAvatarChanged("peony");
    }
  }, [activeUser]);

  const handleSelectAvatar = (id: string) => {
    setSelectedAvatarId(id);
    if (activeUser) {
      localStorage.setItem(`bloom_user_avatar_${activeUser}`, id);
    }
    localStorage.removeItem("bloom_user_avatar");
    if (onAvatarChanged) onAvatarChanged(id);
    setIsModalOpen(false);
  };

  const TODAY_STR = currentDateStr || new Date().toISOString().split("T")[0];
  const calculateStreak = (): number => {
    let streak = 0;
    let checkDateString = TODAY_STR;
    while (true) {
      const dayLogs = logs.filter(l => l.date === checkDateString);
      if (dayLogs.length === 0) {
        break;
      }
      const hasConsumed = dayLogs.some(l => l.consumed);
      if (hasConsumed) {
        break;
      }
      streak++;
      const d = new Date(checkDateString);
      d.setDate(d.getDate() - 1);
      checkDateString = d.toISOString().split("T")[0];
    }
    return streak;
  };

  const streak = calculateStreak();
  const hasConsumedAny = logs.some(l => l.consumed);
  const fireScale = Math.min(1 + streak * 0.15, 2.5);

  // Calculate user level dynamically based on streak progress
  let userLevelVal = 1;
  let levelEmoji = "🌱";
  
  if (streak >= 7) {
    userLevelVal = 5;
    levelEmoji = "🪷";
  } else if (streak >= 5) {
    userLevelVal = 4;
    levelEmoji = "🍀";
  } else if (streak >= 3) {
    userLevelVal = 3;
    levelEmoji = "🌸";
  } else if (streak >= 1) {
    userLevelVal = 2;
    levelEmoji = "🌿";
  } else {
    userLevelVal = 1;
    levelEmoji = "🌱";
  }

  // Get dynamic localized level names
  const getLevelName = (lvl: number): string => {
    switch (lvl) {
      case 5: return language === "zh" ? "禅意莲花 (大师绽放)" : language === "ms" ? "Teratai Zen (Mekar Utama)" : language === "ko" ? "젠 로투스 (마스터 블루밍)" : "Zen Lotus (Master Blooming)";
      case 4: return language === "zh" ? "黄金蕨类 (深层扎根)" : language === "ms" ? "Paku-pakis Emas (Akar Mendalam)" : language === "ko" ? "골든 펀 (딥 그라운딩)" : "Golden Fern (Deep Grounding)";
      case 3: return language === "zh" ? "娇羞牡丹 (诚实绽放)" : language === "ms" ? "Peony Merona (Mekar Jujur)" : language === "ko" ? "블러싱 피오니 (어니스트 블러썸)" : "Blushing Peony (Honest Blossom)";
      case 2: return language === "zh" ? "宁静幼苗 (韧性成长)" : language === "ms" ? "Tunas Tenang (Kemajuan Cekal)" : language === "ko" ? "세린 스프라우트 (라이징 레질리언트)" : "Serene Sprout (Rising Resilient)";
      default: return language === "zh" ? "勇敢小苗 (勇气扎根)" : language === "ms" ? "Anak Benih Berani (Keberanian Akar)" : language === "ko" ? "스펑키 시들링 (루츠 & 커리지)" : "Spunky Seedling (Roots & Courage)";
    }
  };

  const levelName = getLevelName(userLevelVal);

  const getPersonaTranslated = (id: string) => {
    switch (id) {
      case "seedling":
        return {
          name: language === "zh" ? "勇敢小苗" : language === "ms" ? "Anak Benih Berani" : language === "ko" ? "용감한 아기 새싹" : "Spunky Seedling",
          tag: language === "zh" ? "只要敢于扎根，万木自会成林。" : language === "ms" ? "Setiap pokok besar bermula dengan berani mencacak akar." : language === "ko" ? "모든 위대한 나무도 처음에는 두려움 없이 깊게 뿌리를 내리는 것에서 시작했습니다." : "Every grand tree started by daring to sink its roots."
        };
      case "sprout":
        return {
          name: language === "zh" ? "宁静幼芽" : language === "ms" ? "Tunas Tenang" : language === "ko" ? "차분한 새싹" : "Serene Sprout",
          tag: language === "zh" ? "在清晨微温的阳光下，尽情伸展成长的臂膀。" : language === "ms" ? "Meregang ke atas menghadap kehangatan lembut pagi." : language === "ko" ? "아침의 따스한 온기를 향해 위로 뻗어나갑니다." : "Stretching upward towards the gentle morning warmth."
        };
      case "peony":
        return {
          name: language === "zh" ? "娇羞牡丹" : language === "ms" ? "Peony Merona" : language === "ko" ? "수줍은 모란" : "Blushing Peony",
          tag: language === "zh" ? "一片一片，由内至外的蜕变，使你格格外出了不起。" : language === "ms" ? "Kelopak demi kelopak, kerentanan menjadikan anda cantik." : language === "ko" ? "한 잎 한 잎, 솔직한 취약함이 당신을 더 아름답게 만듭니다." : "Petal by petal, vulnerability makes you beautiful."
        };
      case "fern":
        return {
          name: language === "zh" ? "黄金蕨类" : language === "ms" ? "Paku-pakis Emas" : language === "ko" ? "황금 고사리" : "Golden Fern",
          tag: language === "zh" ? "在疾风中优雅轻晃，而主干依然稳固、坚不可摧。" : language === "ms" ? "Melambai dengan anggun di ditiup angin, kekal teguh." : language === "ko" ? "거친 바람에도 꺾이지 않고 우아하게 흔들립니다." : "Swaying gracefully in the wind, but staying unbroken."
        };
      default:
        return {
          name: language === "zh" ? "禅意莲花" : language === "ms" ? "Teratai Zen" : language === "ko" ? "젠 로투스" : "Zen Lotus",
          tag: language === "zh" ? "超凡脱俗，穿过逆境 of 淤泥，绽放最纯净的光芒。" : language === "ms" ? "Bangkit dengan tenang mengatasi lumpur untuk bersinar." : language === "ko" ? "진흙 위로 고요히 세상을 향해 맑고 밝은 빛을 피웁니다." : "Rising calmly above the mud to shine your light."
        };
    }
  };

  // The custom avatar selection is automatically matched/earned based on the user's level progress
  const currentAvatar = PERSONAS[userLevelVal - 1];
  const translatedCurrentAvatar = getPersonaTranslated(currentAvatar.id);

  return (
    <>
      <header className={`flex justify-between items-start select-none ${compact ? "pb-2 pt-1" : "pb-6 pt-2"}`}>
        <div>
          {/* SDG Indicator tag */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {!compact && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 text-emerald-900 text-[12px] font-semibold tracking-[0.2em] uppercase rounded-full border border-teal-200/70 shadow-xs">
                {translate(language, "headerSdg")}
              </div>
            )}
            {activeUser && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold text-teal-900 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-teal-200/70 px-3 py-1 rounded-full shadow-xs animate-soft-pulse">
                  {translate(language, "headerWelcomeUser", { username: activeUser })}
                </span>
                <span className="text-[11px] font-black text-amber-900 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <span>🪙</span>
                  <span>{coins} {language === "zh" ? "金币" : language === "ms" ? "Syiling" : language === "ko" ? "코인" : "Coins"}</span>
                </span>
                {(onOpenGuide || onOpenTutorial) && (
                  <button
                    onClick={onOpenGuide || onOpenTutorial}
                    className="text-[10px] font-extrabold text-teal-900 hover:text-sky-950 bg-gradient-to-r from-teal-100/90 to-sky-100/90 hover:from-teal-200 hover:to-sky-200 border border-sky-300/80 px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                    title="View App Tour & Guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                    <span>{language === "zh" ? "指南" : language === "ms" ? "Panduan" : language === "ko" ? "가이드" : "Guide"}</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-[10px] font-bold text-stone-500 hover:text-red-600 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-200 px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {translate(language, "accLogoutBtn")}
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Brand Title with Fire Illustration & Dynamic Progress-based Level Badge */}
          <h1 className={`${compact ? "text-3xl sm:text-4xl" : "text-5xl sm:text-6xl"} font-serif font-bold tracking-tight text-emerald-950 -mt-1 flex items-center flex-wrap gap-x-4`}>
            <span>Bloom</span>

            {streak > 0 && (
              <div className={`${compact ? "w-10 h-10" : "w-14 h-14"} flex items-center justify-center relative select-none ml-2`}>
                <span 
                  className={`${compact ? "text-2xl" : "text-3xl"} transition-all duration-500 animate-pulse origin-center filter drop-shadow-[0_4px_8px_rgba(230,126,34,0.3)]`}
                  style={{ transform: `scale(${fireScale})` }}
                  title={`Streak recovery flame: ${streak} days`}
                >
                  🔥
                </span>
              </div>
            )}
          </h1>
        </div>
      </header>

      {/* Modern, comforting, slide-in overlay / modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-emerald-100 z-10 animate-soft-pulse transform transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-emerald-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                {translate(language, "headerAvatarTitle")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 hover:bg-stone-50 rounded-full transition-colors cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#566573]/85 mb-5 font-medium leading-relaxed">
              {translate(language, "headerAvatarDesc")}
            </p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {PERSONAS.map((p, idx) => {
                const isSelected = p.id === selectedAvatarId;
                const trans = getPersonaTranslated(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectAvatar(p.id)}
                    className={`w-full text-left flex items-start gap-4 p-3.5 rounded-2xl transition-all duration-300 cursor-pointer border-none ${
                      isSelected 
                        ? "bg-emerald-50 border-2 border-emerald-600/40 shadow-xs" 
                        : "bg-stone-50/50 hover:bg-stone-100/50 border border-transparent hover:border-stone-200"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${p.bgColor} border border-emerald-100/30 shrink-0`}>
                      {p.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-950 text-sm">{trans.name}</span>
                        {isSelected && (
                          <span className="text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> {translate(language, "headerSelected")}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1 mt-0.5">
                        {p.stageName}
                      </div>
                      <p className="text-xs text-[#566573]/90 italic line-clamp-2 leading-relaxed font-semibold">
                        "{trans.tag}"
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/40 flex gap-3 text-xs text-stone-600">
              <Trophy className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-950">{translate(language, "headerAvatarNextLevel")}</span>
                {translate(language, "headerAvatarInstructions")}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
