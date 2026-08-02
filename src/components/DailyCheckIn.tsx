import { useState } from "react";
import { Wind, Cigarette, ArrowRight, Sparkles, AlertCircle, RefreshCw, HandHeart, CheckCircle2, Lock, Activity, Footprints, Droplets } from "lucide-react";
import { HabitType, LogEntry } from "../types";
import { Language, translate } from "../translations";
import { HealthQuestType } from "./HealthQuestsModal";

interface RecommendedQuestInfo {
  type: HealthQuestType;
  icon: string;
  name: Record<Language, string>;
  whyItRelieves: Record<Language, string>;
  buttonText: Record<Language, string>;
  secondaryType?: HealthQuestType;
  secondaryName?: Record<Language, string>;
}

function getRecommendedQuest(reason: string): RecommendedQuestInfo {
  const lower = (reason || "").toLowerCase().trim();

  const isStress = /stress|anxiety|exam|work|pressure|angry|anger|tekanan|stres|学业|压力|考试|工作|生气|怒|스트레스|시험|업무|불안/.test(lower);
  const isBored = /bored|boredom|idle|free|nothing|tired|fatigue|bosan|penat|无聊|空闲|累|疲劳|지루|심심|피곤/.test(lower);
  const isMeal = /meal|eat|food|coffee|drink|makan|kopi|minum|饭|吃|咖啡|茶|食|식사|커피|밥|음료/.test(lower);
  const isSocial = /friend|peer|party|social|club|gathering|rakan|kawan|pesta|朋友|聚会|同辈|社交|친구|모임|술자리/.test(lower);

  if (isStress) {
    return {
      type: "breathing",
      icon: "🫁",
      name: {
        en: "4-7-8 Stress Relieving Breath",
        ms: "Nafas Pelepasan Stres 4-7-8",
        zh: "4-7-8 舒压深呼吸",
        ko: "4-7-8 스트레스 해소 호흡"
      },
      whyItRelieves: {
        en: "Relieves acute stress & anxiety by stimulating the vagus nerve, rapidly lowering cortisol and heart rate in 60 seconds.",
        ms: "Melegakan stres & kegelisahan dengan merangsang saraf vagus untuk menurunkan kortisol dan degupan jantung dalam 60 saat.",
        zh: "通过深呼吸直接刺激迷走神经，在 60 秒内降低心率与压力激素（皮质醇），平复引发吸食的紧张与压力。",
        ko: "미경신경을 자극하여 60초 내에 심박수와 스트레스 호르몬(코르티솔)을 낮춤으로써 흡연 욕구를 유발한 스트레스를 해소합니다."
      },
      buttonText: {
        en: "Start 4-7-8 Breathing Exercise 🫁",
        ms: "Mula Senaman Nafas 4-7-8 🫁",
        zh: "开始 4-7-8 舒压呼吸 🫁",
        ko: "4-7-8 호흡 운동 시작 🫁"
      },
      secondaryType: "grounding",
      secondaryName: {
        en: "5-4-3-2-1 Sensory Grounding",
        ms: "Penenangan Deria 5-4-3-2-1",
        zh: "5-4-3-2-1 感官着陆",
        ko: "5-4-3-2-1 감각 그라운딩"
      }
    };
  }

  if (isBored) {
    return {
      type: "shakeout",
      icon: "⚡",
      name: {
        en: "2-Min Dopamine Shakeout & Stretch",
        ms: "Senaman Dopamin & Regangan 2-Minit",
        zh: "2分钟多巴胺激活与拉伸",
        ko: "2분 도파민 활성 & 스트레칭"
      },
      whyItRelieves: {
        en: "Relieves boredom & fatigue by releasing natural dopamine and physically replacing the hand-to-mouth craving habit.",
        ms: "Melegakan kebosanan & keletihan dengan membebaskan dopamin semula jadi dan memutus pergerakan tangan-ke-mulut.",
        zh: "通过全身肌肉拉伸释放自然多巴胺，填补脑部渴望，完美物理替代手到嘴的机械吸食习惯。",
        ko: "전신 스트레칭을 통해 천연 도파민을 분비하여 무의식적인 손-입 동작 습관을 완벽히 대체하고 지루함을 없앱니다."
      },
      buttonText: {
        en: "Start 2-Min Dopamine Shake ⚡",
        ms: "Mula Senaman 2-Minit ⚡",
        zh: "开始 2分钟多巴胺激活 ⚡",
        ko: "2분 도파민 리셋 시작 ⚡"
      },
      secondaryType: "walking",
      secondaryName: {
        en: "10-Min Walk",
        ms: "Jalan 10-Minit",
        zh: "10分钟散步",
        ko: "10분 산책"
      }
    };
  }

  if (isMeal) {
    return {
      type: "hydration",
      icon: "💧",
      name: {
        en: "Cool Water Palate Cleanser",
        ms: "Pembersih Air Sejuk & Tembuni",
        zh: "冰水口感重置与水疗",
        ko: "시원한 수분 보충 & 입안 리셋"
      },
      whyItRelieves: {
        en: "Relieves post-meal & coffee habit loops by cleansing taste receptors and accelerating nicotine toxin clearance.",
        ms: "Melegakan tabiat selepas makan dengan menetapkan semula reseptor rasa dan mempercepatkan pembuangan toksin nikotin.",
        zh: "刷新口腔味觉受体，重置餐后/饮品后的习惯性口唇渴望，并加速体内残留尼古丁毒素的代谢。",
        ko: "구강 미각 수용체를 깨끗이 리셋하여 식후/커피 후 습관성 갈망을 차단하고 니코틴 독소 배출을 돕습니다."
      },
      buttonText: {
        en: "Start Hydration Quest 💧",
        ms: "Mula Misi Minum Air 💧",
        zh: "开始补水清肺 💧",
        ko: "수분 보충 퀘스트 시작 💧"
      }
    };
  }

  if (isSocial) {
    return {
      type: "walking",
      icon: "🚶‍♂️",
      name: {
        en: "10-Min Environment Reset Walk",
        ms: "Jalan 10-Minit Tukar Suasana",
        zh: "10分钟环境换气与换景",
        ko: "10분 환경 리셋 산책"
      },
      whyItRelieves: {
        en: "Relieves social pressure & peer triggers by stepping away, filling your lungs with fresh air, and resetting your focus.",
        ms: "Melegakan tekanan sosial dengan melangkah keluar dari persekitaran pencetus untuk mendapatkan udara segar.",
        zh: "拉开与吸烟聚会/同辈圈的物理距离，用新鲜空气理气，摆脱视听线索诱发的吸食模仿冲动。",
        ko: "흡연 모임 공간에서 잠시 벗어나 신선한 공기를 마시고 흡연 유혹의 시각적 자극을 물리적으로 차단합니다."
      },
      buttonText: {
        en: "Start 10-Min Walk 🚶‍♂️",
        ms: "Mula Jalan 10-Minit 🚶‍♂️",
        zh: "开始 10分钟散步 🚶‍♂️",
        ko: "10분 산책 시작 🚶‍♂️"
      },
      secondaryType: "hydration",
      secondaryName: {
        en: "Hold Ice Water",
        ms: "Pegang Air Ais",
        zh: "手握冰镇水",
        ko: "찬 음료 보충"
      }
    };
  }

  // Default / General Craving
  return {
    type: "breathing",
    icon: "🫁",
    name: {
      en: "Targeted Craving Relief Breath (4-7-8)",
      ms: "Nafas Pelepasan Keinginan (4-7-8)",
      zh: "定向欲望舒缓呼吸 (4-7-8)",
      ko: "갈망 해소 맞춤 호흡 (4-7-8)"
    },
    whyItRelieves: {
      en: "Relieves acute craving spikes by regulating oxygen intake and shifting your body out of trigger-driven stress mode.",
      ms: "Melegakan gelombang keinginan dengan mengawal bekalan oksigen dan mengalihkan badan dari mod pencetus.",
      zh: "通过规律呼吸重置体内氧气平衡，安全陪伴你渡过尼古丁生理渴望的最强高峰期（3-5分钟）。",
      ko: "산소 공급을 조절하여 유발 원인으로 급증한 니코틴 갈망 피크를 3~5분 내로 가라앉힙니다."
    },
    buttonText: {
      en: "Start Relief Breathing Exercise 🫁",
      ms: "Mula Senaman Nafas Pemulihan 🫁",
      zh: "开始定向舒缓呼吸 🫁",
      ko: "맞춤 호흡 운동 시작 🫁"
    },
    secondaryType: "hydration",
    secondaryName: {
      en: "Cool Water Flush",
      ms: "Bilas Air Sejuk",
      zh: "冰水清肺",
      ko: "시원한 수분 보충"
    }
  };
}

interface DailyCheckInProps {
  onLogAdded: (entry: LogEntry) => void;
  currentLogs: LogEntry[];
  language: Language;
  activeUser: string | null;
  currentDateStr: string;
  coins?: number;
  onOpenHealthQuest?: (questType?: HealthQuestType) => void;
  onGoToNextStep?: () => void;
}

export default function DailyCheckIn({ onLogAdded, currentLogs, language, activeUser, currentDateStr, coins = 0, onOpenHealthQuest, onGoToNextStep }: DailyCheckInProps) {
  const [selectedHabit, setSelectedHabit] = useState<HabitType | null>(null);
  const [step, setStep] = useState<"select" | "ask_consumed" | "ask_quantity" | "ask_reason" | "loading" | "solution">("select");
  const [didConsume, setDidConsume] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState<number>(3);
  const [reasonText, setReasonText] = useState("");
  const [generatedSolution, setGeneratedSolution] = useState("");
  const [errorText, setErrorText] = useState("");

  const habitsList = [
    {
      id: "vape" as HabitType,
      title: translate(language, "vape"),
      desc: "",
      icon: Wind,
      emoji: "💨",
      pastelTag: "",
      unloggedClass: "bg-[#1F4E79] border-[#2980B9] text-[#EBF5FB] hover:bg-[#1A4367] hover:border-[#3498DB] shadow-md",
      loggedClass: "bg-[#112F4C] border-2 border-[#1B4F72] text-[#EBF5FB] shadow-lg font-bold",
      circleClass: "border-[#EBF5FB]/30 group-hover:border-[#EBF5FB]",
      tagClass: "bg-[#EBF5FB]/20 text-[#EBF5FB]",
      badgeClass: "bg-[#2980B9]"
    },
    {
      id: "cigarettes" as HabitType,
      title: translate(language, "cigarette"),
      desc: "",
      icon: Cigarette,
      emoji: "🚬",
      pastelTag: "",
      unloggedClass: "bg-[#4D5656] border-[#7F8C8D] text-[#F2F4F4] hover:bg-[#404848] hover:border-[#95A5A6] shadow-md",
      loggedClass: "bg-[#2C3030] border-2 border-[#5D6D7E] text-[#F2F4F4] shadow-lg font-bold",
      circleClass: "border-[#F2F4F4]/30 group-hover:border-[#F2F4F4]",
      tagClass: "bg-[#F2F4F4]/20 text-[#F2F4F4]",
      badgeClass: "bg-[#7F8C8D]"
    }
  ];

  const handleHabitSelect = (habit: HabitType) => {
    setSelectedHabit(habit);
    setReasonText("");
    setErrorText("");
    setDidConsume(null);
    setGeneratedSolution("");
    setQuantity(3);
    
    // Check if there is already a log for today.
    const today = currentDateStr;
    const existing = currentLogs.find(l => l.date === today && l.habit === habit);
    
    if (existing) {
      if (existing.consumed) {
        setDidConsume(true);
        if (existing.quantity) setQuantity(existing.quantity);
        setReasonText(existing.reason || "");
        
        // If solution exists and is valid
        if (existing.solution && existing.solution !== "Get Solution" && existing.solution !== translate(language, "checkInGetSolution") && existing.reason) {
          setStep("solution");
          setGeneratedSolution(existing.solution);
        } else {
          setStep("ask_reason");
        }
      } else {
        setStep("ask_consumed");
        setDidConsume(false);
      }
    } else {
      setStep("ask_consumed");
    }
  };

  const handleConsumedAnswer = (consumed: boolean) => {
    setDidConsume(consumed);
    const today = currentDateStr;
    if (!consumed) {
      // Create clean day log immediately
      const entry: LogEntry = {
        id: `log-${Date.now()}`,
        date: today,
        habit: selectedHabit!,
        consumed: false,
        timestamp: new Date().toISOString(),
      };
      
      onLogAdded(entry);
      setStep("solution"); // It will show positive encouragement screen instead
    } else {
      // Set default initial quantity and proceed to quantity sliding poll stage
      setQuantity(3);
      setStep("ask_quantity");
    }
  };

  const handleQuantityConfirmed = () => {
    const today = currentDateStr;
    const entry: LogEntry = {
      id: `log-${Date.now()}`,
      date: today,
      habit: selectedHabit!,
      consumed: true,
      quantity: quantity,
      reason: "",
      solution: translate(language, "checkInGetSolution"),
      timestamp: new Date().toISOString(),
    };
    
    onLogAdded(entry);
    setStep("ask_reason");
  };

  const getLocalFallbackSolution = (habit: string, reason: string, lang: Language): string => {
    const trigger = reason.trim() ? `"${reason.trim()}"` : "this trigger";
    const lower = reason.toLowerCase();
    const isStress = /stress|anxiety|exam|work|pressure|angry|anger|tekanan|stres|学业|压力|考试|工作|生气|怒|스트레스|시험|업무/.test(lower);

    if (lang === "ms") {
      if (isStress) {
        return `### 🩺 Bimbingan Pemulihan Pakar (Tekanan)\n\n**Punca**: Dicetuskan oleh ${trigger}.\n\n**🎯 Tindakan Masa Hadapan Khusus**:\n1. Alirkan air sejuk pada pergelangan tangan selama 30 saat.\n2. Lakukan 4 kali pernafasan 4-7-8 (tarik 4s, tahan 7s, hembus 8s).\n\n**💡 Mengapa Ia Berkesan**: Air sejuk dan pernafasan dalam menurunkan kortisol serta dorongan nikotin dalam masa singkat.`;
      }
      return `### 🩺 Bimbingan Pemulihan Pakar\n\n**Punca**: Dicetuskan oleh ${trigger} (${habit}).\n\n**🎯 Tindakan Masa Hadapan Khusus**:\n1. Minum 200ml air sejuk dan kunyah pudina.\n2. Tangguh 5 minit sebelum membuat sebarang keputusan.\n\n**💡 Mengapa Ia Berkesan**: Gelombang keinginan nikotin biasanya surut dalam 3–5 minit.`;
    }

    if (isStress) {
      return `### 🩺 Clinical Cessation Advisory (Stress)\n\n**Trigger Analysis**: Cravings triggered by ${trigger} are acute stress responses.\n\n**🎯 Specific Future Action**:\n1. Run cold water over both wrists for 30 seconds.\n2. Perform 4 cycles of 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s).\n\n**💡 Why It Works**: Cold water plus slow breathing lowers cortisol and interrupts the nicotine urge loop within about 45 seconds.`;
    }

    return `### 🩺 Clinical Cessation Advisory\n\n**Trigger Analysis**: Craving linked to ${trigger} (${habit}).\n\n**🎯 Specific Future Action**:\n1. Drink a glass of cold water and chew mint gum.\n2. Use the 5-minute delay rule before acting on the urge.\n\n**💡 Why It Works**: Nicotine craving waves usually peak and fade within 3–5 minutes.`;
  };

  const submitReason = async () => {
    if (!reasonText.trim()) {
      setErrorText(translate(language, "checkInErrWord"));
      return;
    }
    if (!selectedHabit) {
      setErrorText(translate(language, "checkInErrServer"));
      return;
    }

    setErrorText("");
    setStep("loading");

    let solutionText = "";

    try {
      const response = await fetch("/api/bloom-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit: selectedHabit,
          reason: reasonText,
          lang: language
        }),
      });

      const data = await response.json().catch(() => ({} as { solution?: string }));
      solutionText = (data.solution || "").trim();
    } catch (err: any) {
      console.error(err);
    }

    // Always deliver a solution — use local fallback if the API is unavailable
    if (!solutionText) {
      solutionText = getLocalFallbackSolution(selectedHabit, reasonText, language);
    }

    setGeneratedSolution(solutionText);

    const today = currentDateStr;
    const entry: LogEntry = {
      id: `log-${Date.now()}`,
      date: today,
      habit: selectedHabit,
      consumed: true,
      quantity: quantity,
      reason: reasonText,
      solution: solutionText,
      timestamp: new Date().toISOString()
    };

    onLogAdded(entry);
    setDidConsume(true);
    setStep("solution");
  };

  // Helper to convert Markdown to basic JSX tags cleanly to avoid npm depend issues
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Header level 3
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-base sm:text-lg font-serif font-black text-emerald-950 mt-3 mb-2 flex items-center gap-1.5">
            {trimmed.replace("### ", "")}
          </h4>
        );
      }
      // Header level 4
      if (trimmed.startsWith("#### ")) {
        return (
          <h5 key={idx} className="text-sm font-bold text-emerald-900 mt-2 mb-1">
            {trimmed.replace("#### ", "")}
          </h5>
        );
      }
      // Numbered list items (e.g. "1. ", "2. ")
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1.5 text-xs sm:text-sm text-emerald-950 font-medium">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black shrink-0 flex items-center justify-center mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1 leading-relaxed">
              {renderWithBolds(numMatch[2])}
            </div>
          </div>
        );
      }
      // Bullet list items
      if (trimmed.startsWith("* ") || trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        const cleanContent = trimmed.replace(/^[\s*•-]+/, "").trim();
        return (
          <li key={idx} className="ml-4 pl-1 list-disc text-xs sm:text-sm text-emerald-900 leading-relaxed mb-1.5 font-medium">
            {renderWithBolds(cleanContent)}
          </li>
        );
      }
      // Regular text or empty lines
      if (!trimmed) return <div key={idx} className="h-1.5" />;
      
      return (
        <p key={idx} className="text-xs sm:text-sm text-emerald-950 leading-relaxed mb-2 font-normal">
          {renderWithBolds(line)}
        </p>
      );
    });
  };

  const renderWithBolds = (inputText: string) => {
    const parts = inputText.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-emerald-950 bg-emerald-100/60 px-1 py-0.5 rounded-sm">{part}</strong>;
      }
      return part;
    });
  };

  const activeHabitDetails = habitsList.find(h => h.id === selectedHabit);

  return (
    <div id="dailycheckin-card" className="select-none transition-all duration-300 h-full flex flex-col relative justify-start min-h-0 z-10 p-4 sm:p-5">
      
      {/* Account Lock Overlay */}
      {!activeUser && (
        <div className="absolute inset-0 bg-white/95 rounded-[2rem] flex flex-col justify-center items-center text-center p-6 z-40 animate-fade-in select-none">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200/80 flex items-center justify-center mb-4 shadow-xs">
            <Lock className="w-6 h-6 text-emerald-700 animate-pulse" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#2C3E50]">
            {language === "ko" ? "🔒 회원님 전용의 회복 기록판" :
             language === "zh" ? "🔒 您专属的恢复仪表盘" :
             language === "ms" ? "🔒 Papan Rekod Pemulihan Peribadi" :
             "🔒 Private Recovery Log"}
          </h3>
          <p className="text-xs text-[#566573]/80 mt-2 max-w-[280px] leading-relaxed font-bold">
            {language === "ko" ? "회복 상태를 기록하고 AI 조언을 받으시려면 상단에서 생성 혹은 로그인을 해주세요." :
             language === "zh" ? "请在上方注册或登录账户，以便记录每日情况并获取智能分析。" :
             language === "ms" ? "Sila daftar atau daftar masuk ke akaun anda di atas untuk merekodkan pemulihan dan mendapatkan nasihat." :
             "Register or sign in to your Bloom account above to start checking in and receiving personalized recovery strategies."}
          </p>
        </div>
      )}
      
      {/* 1. SELECT HABIT STAGE */}
      {step === "select" && (
        <div className="flex flex-col justify-between h-full flex-1 py-1 sm:py-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black text-emerald-950 mb-3 sm:mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            {translate(language, "checkInTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-auto pt-1 sm:pt-2">
            {habitsList.map((hab) => {
              // Check if already logged today
              const today = currentDateStr;
              const loggedToday = currentLogs.find(l => l.date === today && l.habit === hab.id);

              return (
                <button
                  id={`habit-card-${hab.id}`}
                  key={hab.id}
                  onClick={() => handleHabitSelect(hab.id)}
                  className={`relative group flex flex-col items-center justify-center p-3 sm:p-4 md:p-5 w-full max-w-sm h-24 sm:h-28 md:h-36 lg:h-44 rounded-2xl transition-all duration-300 text-center border cursor-pointer ${
                    loggedToday 
                      ? hab.loggedClass 
                      : hab.unloggedClass
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-xs transition-transform group-hover:scale-110 border ${hab.circleClass}`}>
                    <span className="filter drop-shadow-sm select-none">{hab.emoji}</span>
                  </div>

                  <div className="mt-1.5 sm:mt-2 md:mt-3">
                    <span className="font-bold text-xs sm:text-sm md:text-base block tracking-tight">
                      {hab.title}
                    </span>
                  </div>

                  {loggedToday && (
                    <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-white text-[9px] md:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold ${hab.badgeClass}`}>
                      {loggedToday.consumed ? translate(language, "checkInLoggedLabel") : translate(language, "checkInCleanLabel")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ASK IF CONSUMED STAGE */}
      {step === "ask_consumed" && activeHabitDetails && (
        <div className="animate-soft-pulse flex flex-col justify-between h-full flex-1 py-1 sm:py-2">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-serif font-black text-emerald-950 mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3 select-none leading-tight">
            <span className="text-2xl sm:text-3xl md:text-4xl filter drop-shadow-md">{activeHabitDetails.emoji}</span>
            {translate(language, "checkInAskConsumed", { habit: activeHabitDetails.title })}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-auto">
            {/* Yes, consumed option */}
            <button
              id="confirm-consumed-yes"
              onClick={() => handleConsumedAnswer(true)}
              className="relative group flex flex-col items-center justify-center p-3 sm:p-4 h-24 sm:h-28 md:h-[130px] rounded-xl transition-all duration-300 text-center border cursor-pointer bg-red-50 hover:bg-red-100/90 border-red-200 text-red-700 shadow-md transform hover:scale-102 active:scale-98"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-xs border border-red-200 transition-transform group-hover:scale-110 border-dashed">
                <span className="filter drop-shadow-sm select-none">⚠️</span>
              </div>
              <div className="mt-1 sm:mt-2">
                <span className="font-extrabold text-xs sm:text-sm md:text-base block tracking-tight">
                  {translate(language, "checkInYes")}
                </span>
                <span className="text-[8px] sm:text-[10px] text-red-500 font-bold uppercase tracking-wider block">
                  {language === "ko" ? "기록 및 대처" : language === "zh" ? "记录与应对" : language === "ms" ? "Log & Atasi" : "Log & Cope"}
                </span>
              </div>
            </button>

            {/* No, clean option */}
            <button
              id="confirm-consumed-no"
              onClick={() => handleConsumedAnswer(false)}
              className="relative group flex flex-col items-center justify-center p-3 sm:p-4 h-24 sm:h-28 md:h-[130px] rounded-xl transition-all duration-300 text-center border cursor-pointer bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-800 shadow-md transform hover:scale-102 active:scale-98"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-xs border border-emerald-200 transition-transform group-hover:scale-110 border-dashed">
                <span className="filter drop-shadow-sm select-none">🌸</span>
              </div>
              <div className="mt-1 sm:mt-2">
                <span className="font-extrabold text-xs sm:text-sm md:text-base block tracking-tight">
                  {translate(language, "checkInNo")}
                </span>
                <span className="text-[8px] sm:text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                  {language === "ko" ? "성장 유지" : language === "zh" ? "持续成长" : language === "ms" ? "Kekal Bersih" : "Stay Clean"}
                </span>
              </div>
            </button>
          </div>

          {/* Simple elegantly designed wider back option at bottom */}
          <button
            id="confirm-consumed-back"
            onClick={() => setStep("select")}
            className="w-full relative group flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-2.5 mt-2 sm:mt-3 rounded-xl transition-all duration-300 border cursor-pointer bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-500 shadow-xs transform hover:scale-101 active:scale-99"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-base sm:text-lg shadow-xs border border-stone-100 transition-all group-hover:scale-105">
              <span>↩️</span>
            </div>
            <div className="text-left">
              <span className="font-bold text-xs sm:text-sm block tracking-tight">
                {translate(language, "back")}
              </span>
              <span className="text-[8px] sm:text-[9px] text-stone-400 font-semibold uppercase tracking-wider block">
                {language === "ko" ? "취소하고 돌아가기" : language === "zh" ? "返回选择" : language === "ms" ? "Kembali ke pilihan" : "Go back to habit screen"}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2.5 ASK QUANTITY (SLIDING POLL STAGE) */}
      {step === "ask_quantity" && activeHabitDetails && (
        <div className="animate-soft-pulse flex flex-col justify-between h-full flex-1 py-1 sm:py-2">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-black text-emerald-950 mb-1 flex items-center gap-2">
              <span className="text-2xl md:text-3xl filter drop-shadow-sm">{activeHabitDetails.emoji}</span>
              {selectedHabit === "vape"
                ? translate(language, "checkInQuantityTitleVape")
                : translate(language, "checkInQuantityTitleCigarette")}
            </h2>
            <p className="text-xs text-emerald-800 font-semibold mb-3 sm:mb-4">
              {selectedHabit === "vape"
                ? translate(language, "checkInQuantitySubVape")
                : translate(language, "checkInQuantitySubCigarette")}
            </p>

            {/* Dynamic Badge & Counter */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/90 p-3.5 sm:p-5 rounded-2xl border border-emerald-200 text-center mb-4 sm:mb-5 shadow-xs">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-emerald-950 tracking-tight flex items-center justify-center gap-2">
                <span>{quantity}{quantity >= 10 ? "+" : ""}</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-800">
                  {selectedHabit === "vape"
                    ? (language === "ko" ? "모금 💨" : language === "zh" ? "口 💨" : language === "ms" ? "Sedutan 💨" : "Puffs 💨")
                    : (language === "ko" ? "개비 🚬" : language === "zh" ? "支 🚬" : language === "ms" ? "Batang 🚬" : "Sticks 🚬")}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-widest mt-1">
                {quantity <= 2
                  ? translate(language, "checkInLight")
                  : quantity <= 6
                  ? translate(language, "checkInModerate")
                  : translate(language, "checkInHeavy")}
              </div>
            </div>

            {/* Sliding Poll Range Input */}
            <div className="space-y-3 px-1 sm:px-2">
              <input
                id="quantity-slider"
                type="range"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="w-full h-3 bg-emerald-200/80 rounded-lg appearance-none cursor-pointer accent-emerald-700 hover:accent-emerald-850 transition-all"
              />

              <div className="flex justify-between text-[10px] sm:text-xs font-bold text-emerald-800/80 px-1">
                <span>1</span>
                <span>5</span>
                <span>10+</span>
              </div>

              {/* Quick Preset Choice Buttons */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 justify-center">
                {[
                  { label: "1-2", val: 2 },
                  { label: "3-4", val: 3 },
                  { label: "5-6", val: 5 },
                  { label: "7-8", val: 7 },
                  { label: "10+", val: 10 },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuantity(chip.val)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold cursor-pointer transition-all border ${
                      quantity === chip.val
                        ? "bg-emerald-700 text-white border-emerald-850 shadow-xs scale-105"
                        : "bg-white text-emerald-850 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-emerald-100 mt-3 sm:mt-4">
            <button
              onClick={() => setStep("ask_consumed")}
              className="text-xs text-emerald-800 hover:text-[#1E3F20] hover:underline cursor-pointer font-bold flex items-center gap-1"
            >
              <span>↩️</span> {translate(language, "back")}
            </button>

            <button
              id="quantity-next-btn"
              onClick={handleQuantityConfirmed}
              className="py-2 sm:py-2.5 px-4 sm:px-5 rounded-full bg-emerald-700 text-white font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-md hover:bg-emerald-850 cursor-pointer hover:scale-102 active:scale-98 transition-all border-none"
            >
              {translate(language, "checkInNextReason")}
            </button>
          </div>
        </div>
      )}

      {/* 3. ASK FOR REASON STAGE */}
      {step === "ask_reason" && activeHabitDetails && (
        <div className="flex flex-col justify-between h-full flex-1 py-2">
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-black text-emerald-950 mb-4 flex items-center gap-2">
              <span className="text-2xl md:text-3xl filter drop-shadow-sm">{activeHabitDetails.emoji}</span>
              {translate(language, "checkInWhatTrigger")}
            </h3>

            <div className="space-y-2">
              <textarea
                id="reason-textarea"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={translate(language, "checkInTriggerPlaceholder")}
                rows={3}
                maxLength={400}
                className="w-full p-4 rounded-2xl bg-emerald-50/30 border border-[#C8E6C9] text-xs md:text-sm text-[#1E3F20] focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:bg-white transition-all resize-none shadow-md min-h-[90px] md:min-h-[110px]"
              />
              
              {errorText && (
                <div className="p-4 bg-emerald-50/55 text-emerald-900 text-sm font-semibold rounded-2xl flex items-center gap-2 border border-emerald-200">
                  <AlertCircle className="w-5 h-5 text-emerald-700" />
                  <span>{errorText}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 mt-auto">
            <button
              onClick={() => setStep("ask_quantity")}
              className="text-xs text-emerald-800 hover:text-[#1E3F20] hover:underline cursor-pointer font-bold flex items-center gap-1"
            >
              <span>↩️</span> {translate(language, "checkInBackOptions")}
            </button>
            
            <button
              id="submit-reason-btn"
              onClick={submitReason}
              className="py-2.5 px-5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer hover:scale-102 active:scale-98 transition-all border-none"
            >
              {translate(language, "checkInGetSolution")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. LOADING STAGE */}
      {step === "loading" && (
        <div className="flex flex-col justify-center items-center text-center h-full flex-1 py-12">
          <div className="w-20 h-20 border-8 border-emerald-100 border-t-emerald-700 rounded-full animate-spin mb-6"></div>
          
          <h4 className="text-2xl md:text-3xl font-serif font-black text-emerald-950 flex items-center justify-center gap-2 leading-tight">
            {translate(language, "checkInReflecting")} <span className="animate-bounce">🌸</span>
          </h4>
          <p className="text-sm md:text-base text-emerald-800/90 mt-3 font-semibold select-text max-w-sm leading-relaxed">
            {translate(language, "checkInReflectingDesc")}
          </p>
        </div>
      )}

      {/* 5. SOLUTION DISPLAY / POSITIVE REINFORCEMENT */}
      {step === "solution" && activeHabitDetails && (
        <div className="animate-soft-pulse flex flex-col justify-between h-full flex-1 py-1 sm:py-2">
          
          {/* If they logged: DID NOT CONSUME TODAY */}
          {didConsume === false ? (
            <div className="text-center py-2 sm:py-4 max-w-md mx-auto my-auto flex flex-col justify-center items-center">
              <span className="text-4xl sm:text-6xl md:text-7xl block animate-bounce mb-2 sm:mb-4 filter drop-shadow-sm select-none">🎉</span>
               
              <h3 className="text-lg sm:text-2xl md:text-3xl font-serif font-black text-emerald-950 leading-tight">
                {translate(language, "checkInBloomedTitle")}
              </h3>
              
              <p className="text-xs sm:text-sm md:text-base text-emerald-800 mt-1.5 sm:mt-3 leading-relaxed font-semibold select-text">
                {translate(language, "checkInBloomedDesc", { habit: activeHabitDetails.title })}
              </p>

              {/* Coin Reward Banner */}
              <div className="mt-3 py-2 px-4 bg-amber-100/90 border border-amber-300 rounded-2xl text-amber-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xs animate-pulse">
                <span>🪙</span>
                <span>
                  {language === "zh"
                    ? `已获得 +5 金币！当前总金币: ${coins}`
                    : language === "ms"
                    ? `Dapat +5 Syiling! Jumlah Syiling: ${coins}`
                    : language === "ko"
                    ? `+5 코인 획득! 현재 총 코인: ${coins}`
                    : `+5 Coins Earned! Total Coins: ${coins}`}
                </span>
              </div>

              <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-emerald-50/80 rounded-[1.5rem] border border-emerald-200 text-left text-emerald-900 text-xs sm:text-sm flex gap-3 sm:gap-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-700" />
                <div>
                  <span className="font-extrabold block text-emerald-700 text-sm sm:text-base mb-0.5 sm:mb-1">{translate(language, "checkInLoggedMilestone")}</span>
                  <span className="font-medium text-emerald-950 text-xs sm:text-sm">{translate(language, "checkInLoggedMilestoneDesc")}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4 sm:mt-6 w-full">
                <button
                  id="log-another-button"
                  onClick={() => setStep("select")}
                  className="w-full sm:w-auto py-2.5 sm:py-3.5 px-5 sm:px-6 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs sm:text-sm cursor-pointer transition-all shadow-xs hover:scale-102 active:scale-98"
                >
                  {translate(language, "checkInLogAnother")}
                </button>
                {onGoToNextStep && (
                  <button
                    onClick={onGoToNextStep}
                    className="w-full sm:w-auto py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm cursor-pointer transition-all shadow-md shadow-teal-500/20 hover:scale-102 active:scale-98 flex items-center justify-center gap-2 border-none"
                  >
                    <span>{language === "zh" ? "查看植物成长 🌿" : language === "ms" ? "Lihat Pertumbuhan Tumbuhan 🌿" : language === "ko" ? "식물 성장에 가기 🌿" : "See Plant Growth 🌿"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* If they logged: CONSUMED and got solutions */
            <div className="space-y-3 sm:space-y-4 flex flex-col justify-between h-full flex-1">
              <div className="p-4 sm:p-5 bg-emerald-50/40 rounded-[1.5rem] border border-emerald-100 flex-1 flex flex-col justify-between overflow-y-auto max-h-[180px] sm:max-h-[250px] md:max-h-[350px] lg:max-h-[420px]">
                <div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-emerald-100 mb-3 text-[10px] sm:text-xs md:text-sm text-emerald-900">
                    <span className="uppercase tracking-wider font-extrabold text-emerald-700 flex items-center gap-1 select-none">
                      🌱 {translate(language, "checkInCatalyst", { habit: activeHabitDetails.title })}
                    </span>
                    <span className="italic block max-w-[150px] sm:max-w-[200px] text-right truncate select-text font-bold text-emerald-850">
                      " {reasonText} "
                    </span>
                  </div>

                  <div className="solution-markdown select-text prose max-w-none text-xs sm:text-sm">
                    {parseMarkdown(generatedSolution)}
                  </div>

                  {reasonText && (
                    <div className="flex justify-end pt-2 mt-3 border-t border-emerald-100/60">
                      <button
                        type="button"
                        onClick={submitReason}
                        className="text-[10px] sm:text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 cursor-pointer bg-white hover:bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-xs transition-all active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-700" />
                        <span>
                          {language === "zh"
                            ? "用当前语言重新生成"
                            : language === "ms"
                            ? "Dapatkan nasihat dalam Bahasa Melayu"
                            : language === "ko"
                            ? "현재 언어로 다시 상담하기"
                            : "Re-consult in current language"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Targeted Post-Smoke & Vape Health Quest Card */}
              {onOpenHealthQuest && (() => {
                const questInfo = getRecommendedQuest(reasonText);
                const lang = (language in questInfo.name ? language : "en") as Language;

                return (
                  <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 p-3.5 sm:p-4 rounded-2xl text-white border border-teal-600/60 shadow-lg relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl">{questInfo.icon}</span>
                        <div>
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 block">
                            {lang === "zh" ? "针对您的诱因推荐" : lang === "ms" ? "Disyorkan Untuk Pencetus Anda" : lang === "ko" ? "원인 맞춤 추천 퀘스트" : "Targeted Health Quest"}
                          </span>
                          <h4 className="text-xs sm:text-sm md:text-base font-serif font-black text-white leading-tight">
                            {questInfo.name[lang] || questInfo.name.en}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700/80 text-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                        {lang === "zh" ? "定向舒缓" : lang === "ms" ? "Terarah" : lang === "ko" ? "맞춤 해소" : "Targeted"}
                      </span>
                    </div>

                    {/* Explanation Box: WHY it relieves the problem */}
                    <div className="my-2 p-2.5 sm:p-3 rounded-xl bg-teal-900/60 border border-teal-700/50 text-xs text-teal-100 leading-relaxed font-medium">
                      <div className="font-bold text-amber-300 text-[10px] sm:text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span>💡</span>
                        <span>
                          {lang === "zh" ? "为何此练习能解决您的具体难题？" : lang === "ms" ? "Mengapa Senaman Ini Melegakan Masalah Anda?" : lang === "ko" ? "이 운동이 문제를 해소하는 이유" : "Why This Relieves Your Specific Problem:"}
                        </span>
                      </div>
                      <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                        {questInfo.whyItRelieves[lang] || questInfo.whyItRelieves.en}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenHealthQuest(questInfo.type)}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-98 border-none"
                      >
                        <span>{questInfo.buttonText[lang] || questInfo.buttonText.en}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>

                      {questInfo.secondaryType && (
                        <button
                          type="button"
                          onClick={() => onOpenHealthQuest(questInfo.secondaryType)}
                          className="py-2 px-3 bg-teal-900/80 hover:bg-teal-800 border border-teal-700/80 text-teal-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {lang === "zh"
                              ? `备选: ${questInfo.secondaryName?.[lang] || ""}`
                              : lang === "ms"
                              ? `Pilihan: ${questInfo.secondaryName?.[lang] || ""}`
                              : lang === "ko"
                              ? `대안: ${questInfo.secondaryName?.[lang] || ""}`
                              : `Alt: ${questInfo.secondaryName?.[lang] || ""}`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <p className="text-[10px] sm:text-xs text-emerald-800/80 font-bold select-none">
                  {translate(language, "checkInTipCopy")}
                </p>

                <button
                  id="checkin-reset-btn"
                  onClick={() => setStep("select")}
                  className="py-2.5 px-4 sm:py-3 sm:px-6 rounded-full bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 hover:bg-emerald-850 cursor-pointer shadow-md transition-all hover:scale-102 active:scale-98 border-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {translate(language, "checkInLogAnotherShort")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
