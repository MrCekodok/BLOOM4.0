import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Language } from "../translations";
import { 
  Wind, 
  Footprints, 
  Droplets, 
  Activity, 
  Eye, 
  CheckCircle2, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Award,
  Check
} from "lucide-react";

export type HealthQuestType = "breathing" | "walking" | "hydration" | "grounding" | "shakeout";

interface HealthQuestsModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  initialQuest?: HealthQuestType;
  onQuestCompleted?: (questTitle: string, xpEarned: number) => void;
}

export default function HealthQuestsModal({
  language,
  isOpen,
  onClose,
  initialQuest = "breathing",
  onQuestCompleted
}: HealthQuestsModalProps) {
  const [activeTab, setActiveTab] = useState<HealthQuestType>(initialQuest);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  // 1. Breathing Quest State (4-7-8)
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathActive, setBreathActive] = useState(false);
  const [breathCyclesCompleted, setBreathCyclesCompleted] = useState(0);

  // 2. Walking Quest State (10 Min)
  const [walkSecondsLeft, setWalkSecondsLeft] = useState(600);
  const [walkActive, setWalkActive] = useState(false);

  // 3. Hydration Quest State (8 sips)
  const [sipsCount, setSipsCount] = useState(0);

  // 4. Grounding Quest State (5 steps)
  const [completedGroundingSteps, setCompletedGroundingSteps] = useState<number[]>([]);

  // 5. Shakeout State (2 Min)
  const [shakeoutSeconds, setShakeoutSeconds] = useState(120);
  const [shakeoutActive, setShakeoutActive] = useState(false);

  useEffect(() => {
    setActiveTab(initialQuest);
  }, [initialQuest, isOpen]);

  // Freeze background scrolling when HealthQuestsModal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Breathing Timer
  useEffect(() => {
    let interval: any = null;
    if (breathActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === "inhale") {
              setBreathPhase("hold");
              return 7;
            } else if (breathPhase === "hold") {
              setBreathPhase("exhale");
              return 8;
            } else {
              setBreathPhase("inhale");
              setBreathCyclesCompleted((c) => {
                const updated = c + 1;
                if (updated >= 3 && !completedQuests.includes("breathing")) {
                  setCompletedQuests((p) => [...p, "breathing"]);
                  if (onQuestCompleted) onQuestCompleted("4-7-8 Breathing", 25);
                }
                return updated;
              });
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathActive, breathPhase, completedQuests, onQuestCompleted]);

  // Walking Timer
  useEffect(() => {
    let interval: any = null;
    if (walkActive && walkSecondsLeft > 0) {
      interval = setInterval(() => {
        setWalkSecondsLeft((prev) => {
          if (prev <= 1) {
            setWalkActive(false);
            if (!completedQuests.includes("walking")) {
              setCompletedQuests((p) => [...p, "walking"]);
              if (onQuestCompleted) onQuestCompleted("10-Min Walk", 40);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [walkActive, walkSecondsLeft, completedQuests, onQuestCompleted]);

  // Shakeout Timer
  useEffect(() => {
    let interval: any = null;
    if (shakeoutActive && shakeoutSeconds > 0) {
      interval = setInterval(() => {
        setShakeoutSeconds((prev) => {
          if (prev <= 1) {
            setShakeoutActive(false);
            if (!completedQuests.includes("shakeout")) {
              setCompletedQuests((p) => [...p, "shakeout"]);
              if (onQuestCompleted) onQuestCompleted("2-Min Shakeout", 30);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shakeoutActive, shakeoutSeconds, completedQuests, onQuestCompleted]);

  if (!isOpen) return null;

  const t = {
    en: {
      title: "Health Quests 🫁",
      subtitle: "Simple activities to refresh your lungs and clear cravings.",
      close: "Close",
      tabBreathing: "Breathing",
      tabWalking: "10m Walk",
      tabHydration: "Hydration",
      tabShakeout: "2m Shake",
      tabGrounding: "Grounding",

      // Breathing
      bTitle: "4-7-8 Breathing",
      bGuide: "Inhale (4s) → Hold (7s) → Exhale (8s). Complete 3 cycles.",
      bInhale: "Inhale slowly...",
      bHold: "Hold breath...",
      bExhale: "Exhale fully...",
      bStart: "Start",
      bPause: "Pause",
      bReset: "Reset",
      bDone: "3 Cycles Complete!",
      bBenefit: "✨ Clears carbon monoxide & lowers heart rate",

      // Walking
      wTitle: "10-Minute Walk",
      wGuide: "Walk away from smoking triggers to boost dopamine & oxygen.",
      wStart: "Start Walk",
      wPause: "Pause",
      wReset: "Reset",
      wBenefit: "✨ Boosts brain oxygen & breaks habit loops",

      // Hydration
      hTitle: "Hydration Flush",
      hGuide: "Sip cold water to soothe your throat and cool craving urges.",
      hSipBtn: "+1 Water Sip 🥤",
      hDone: "Goal met! Throat refreshed ❄️",
      hBenefit: "✨ Soothes dry throat & cools oral fixation",

      // Shakeout
      sTitle: "2-Minute Movement",
      sGuide: "Roll shoulders, stretch, or do light movement to burn urge energy.",
      sStart: "Start",
      sPause: "Pause",
      sReset: "Reset",
      sTips: "💡 Roll shoulders • Stretch arms • Shake hands",
      sBenefit: "✨ Redirects nervous energy & improves circulation",

      // Grounding
      gTitle: "5-4-3-2-1 Sensory Reset",
      gGuide: "Tap each card as you focus on your senses to ground your mind.",
      g5: "5 Things you SEE",
      g4: "4 Things you TOUCH",
      g3: "3 Things you HEAR",
      g2: "2 Things you SMELL",
      g1: "1 Thing you TASTE",
      gDone: "Mind is clear & grounded! 🌟",
      gBenefit: "✨ Disrupts automatic smoking reflexes"
    },
    ms: {
      title: "Misi Kesihatan 🫁",
      subtitle: "Aktiviti ringkas untuk menyegarkan paru-paru & mengawal keinginan.",
      close: "Tutup",
      tabBreathing: "Pernafasan",
      tabWalking: "Jalan 10m",
      tabHydration: "Hidrasi",
      tabShakeout: "Senaman 2m",
      tabGrounding: "Sensori",

      bTitle: "Pernafasan 4-7-8",
      bGuide: "Tarik (4s) → Tahan (7s) → Hembus (8s). Lengkapkan 3 kitaran.",
      bInhale: "Tarik nafas perlahan...",
      bHold: "Tahan nafas...",
      bExhale: "Hembus sepenuhnya...",
      bStart: "Mula",
      bPause: "Jeda",
      bReset: "Semula",
      bDone: "3 Kitaran Selesai!",
      bBenefit: "✨ Membersihkan karbon monoksida & menenangkan nadi",

      wTitle: "Jalan 10 Minit",
      wGuide: "Berjalan untuk meningkatkan oksigen & mengalihkan keinginan.",
      wStart: "Mula Jalan",
      wPause: "Jeda",
      wReset: "Semula",
      wBenefit: "✨ Meningkatkan oksigen otak & memecah tabiat",

      hTitle: "Siraman Hidrasi",
      hGuide: "Teguk air sejuk untuk melegakan tekak & meredakan keinginan.",
      hSipBtn: "+1 Tegukan Air 🥤",
      hDone: "Sasaran dicapai! Tekak segar ❄️",
      hBenefit: "✨ Melegakan tekak kering & keinginan mulut",

      sTitle: "Senaman 2 Minit",
      sGuide: "Putar bahu, regang badan, atau bergerak ringkas untuk meredakan gelisah.",
      sStart: "Mula",
      sPause: "Jeda",
      sReset: "Semula",
      sTips: "💡 Putar bahu • Regang tangan • Goyang jari",
      sBenefit: "✨ Mengalihkan tenaga gelisah & melancarkan darah",

      gTitle: "Misi Deria 5-4-3-2-1",
      gGuide: "Ketik setiap kad apabila anda memberi tumpuan kepada deria.",
      g5: "5 Benda yang anda LIHAT",
      g4: "4 Benda yang anda SENTUH",
      g3: "3 Bunyi yang anda DENGAR",
      g2: "2 Bau yang anda BAU",
      g1: "1 Rasa yang anda RASA",
      gDone: "Minda kembali tenang! 🌟",
      gBenefit: "✨ Menghentikan refleks automatik merokok"
    },
    zh: {
      title: "健康任务 🫁",
      subtitle: "简单高效的练习，助您清肺复苏并化解烟瘾。",
      close: "关闭",
      tabBreathing: "呼吸训练",
      tabWalking: "10分散步",
      tabHydration: "饮水清肺",
      tabShakeout: "2分活力",
      tabGrounding: "感官接地",

      bTitle: "4-7-8 呼吸训练",
      bGuide: "吸气 (4秒) → 屏气 (7秒) → 呼气 (8秒)。完成 3 次循环。",
      bInhale: "缓慢吸气...",
      bHold: "屏气吸氧...",
      bExhale: "缓缓呼气...",
      bStart: "开始",
      bPause: "暂停",
      bReset: "重置",
      bDone: "已完成 3 次循环！",
      bBenefit: "✨ 排出一氧化碳并平缓心率",

      wTitle: "10 分钟正念散步",
      wGuide: "离开吸烟环境散步，提升脑含氧量并促进多巴胺分泌。",
      wStart: "开始散步",
      wPause: "暂停",
      wReset: "重置",
      wBenefit: "✨ 补充大脑氧气并打破习惯性条件反射",

      hTitle: "饮水清肺",
      hGuide: "品饮冰水润泽咽喉，冰爽感平息嘴空欲望。",
      hSipBtn: "+1 口冰水 🥤",
      hDone: "目标达成！咽喉恢复冰爽 ❄️",
      hBenefit: "✨ 舒缓咽干咽痒并转移口舌欲望",

      sTitle: "2 分钟活力身体伸展",
      sGuide: "活动肩部、拉伸手臂，在烟瘾高峰期消耗紧张能量。",
      sStart: "开始",
      sPause: "暂停",
      sReset: "重置",
      sTips: "💡 环绕肩部 • 向上拉伸 • 轻甩双臂",
      sBenefit: "✨ 转移烟瘾焦躁并改善血液循环",

      gTitle: "5-4-3-2-1 感官回归",
      gGuide: "依次关注您的 5 种感官，点击卡片拉回注意力。",
      g5: "5 个【看见】的物体",
      g4: "4 个【触摸】的材质",
      g3: "3 种【听到】的声音",
      g2: "2 种【闻到】的气味",
      g1: "1 种【尝到】的味道",
      gDone: "感官已拉回当下，内心平静！🌟",
      gBenefit: "✨ 打断无意识的吸烟反射"
    },
    ko: {
      title: "건강 퀘스트 🫁",
      subtitle: "폐를 정화하고 흡연 충동을 해소하는 쉬운 연습.",
      close: "닫기",
      tabBreathing: "호흡법",
      tabWalking: "10분 산책",
      tabHydration: "수분 보충",
      tabShakeout: "2분 스트레칭",
      tabGrounding: "감각 집중",

      bTitle: "4-7-8 호흡법",
      bGuide: "들이마시기 (4초) → 참기 (7초) → 내쉬기 (8초). 3회 반복.",
      bInhale: "천천히 들이마시기...",
      bHold: "숨 참기...",
      bExhale: "길게 내쉬기...",
      bStart: "시작",
      bPause: "일시정지",
      bReset: "초기화",
      bDone: "3회 사이클 완료!",
      bBenefit: "✨ 일산화탄소 배출 및 심박수 진정",

      wTitle: "10분 마인드풀 산책",
      wGuide: "흡연 장소에서 벗어나 걸으며 뇌에 산소를 공급하세요.",
      wStart: "시작",
      wPause: "일시정지",
      wReset: "초기화",
      wBenefit: "✨ 뇌 산소 공급 및 습관 고리 차단",

      hTitle: "수분 보충",
      hGuide: "시원한 물을 마셔 목을 진정시키고 충동을 완화하세요.",
      hSipBtn: "+1모금 마시기 🥤",
      hDone: "목표 달성! 목이 시원해졌습니다 ❄️",
      hBenefit: "✨ 건조한 목 진정 및 충동 자극 완화",

      sTitle: "2분 신체 리셋",
      sGuide: "어깨를 돌리거나 몸을 뻗어 불안한 에너지를 소모하세요.",
      sStart: "시작",
      sPause: "일시정지",
      sReset: "초기화",
      sTips: "💡 어깨 돌리기 • 팔 스트레칭 • 손 털기",
      sBenefit: "✨ 불안 에너지 전환 및 혈액 순환 개선",

      gTitle: "5-4-3-2-1 감각 집중",
      gGuide: "5가지 감각에 집중하며 카드를 탭하세요.",
      g5: "눈에 보이는 5가지",
      g4: "만질 수 있는 4가지",
      g3: "들을 수 있는 3가지",
      g2: "맡을 수 있는 2가지",
      g1: "맛볼 수 있는 1가지",
      gDone: "정신이 맑아지고 평온해졌습니다! 🌟",
      gBenefit: "✨ 무의식적인 흡연 반사 차단"
    }
  };

  const currentT = t[language] || t.en;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const toggleGroundingStep = (stepIndex: number) => {
    let updated: number[];
    if (completedGroundingSteps.includes(stepIndex)) {
      updated = completedGroundingSteps.filter((i) => i !== stepIndex);
    } else {
      updated = [...completedGroundingSteps, stepIndex];
    }
    setCompletedGroundingSteps(updated);

    if (updated.length >= 5 && !completedQuests.includes("grounding")) {
      setCompletedQuests((p) => [...p, "grounding"]);
      if (onQuestCompleted) onQuestCompleted("5-4-3-2-1 Grounding", 35);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-emerald-100 flex flex-col relative">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all cursor-pointer border-none"
            title={currentT.close}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {completedQuests.length} / 5 Done
            </span>
          </div>

          <h2 className="text-xl font-serif font-black tracking-tight">{currentT.title}</h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">{currentT.subtitle}</p>

          {/* Clean Horizontal Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pt-3 mt-1 scrollbar-none">
            {[
              { id: "breathing", label: currentT.tabBreathing, icon: Wind },
              { id: "walking", label: currentT.tabWalking, icon: Footprints },
              { id: "hydration", label: currentT.tabHydration, icon: Droplets },
              { id: "shakeout", label: currentT.tabShakeout, icon: Activity },
              { id: "grounding", label: currentT.tabGrounding, icon: Eye },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDone = completedQuests.includes(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as HealthQuestType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 border-none ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-sm font-extrabold"
                      : "bg-white/15 text-white/90 hover:bg-white/25"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: BREATHING */}
          {activeTab === "breathing" && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <h3 className="text-base font-serif font-black text-stone-900">{currentT.bTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{currentT.bGuide}</p>
              </div>

              {/* Breathing Circle */}
              <div className="py-6 px-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathPhase === "inhale" ? 1.25 : breathPhase === "hold" ? 1.25 : 0.9,
                  }}
                  transition={{
                    duration: breathPhase === "inhale" ? 4 : breathPhase === "hold" ? 0.2 : 8,
                    ease: "easeInOut"
                  }}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-black shadow-md ${
                    breathPhase === "inhale"
                      ? "bg-emerald-600"
                      : breathPhase === "hold"
                      ? "bg-amber-500"
                      : "bg-teal-600"
                  }`}
                >
                  <span className="text-2xl font-serif">{breathTimer}s</span>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider">{breathPhase}</span>
                </motion.div>

                <p className="text-xs font-bold text-emerald-900 mt-3 h-4">
                  {breathPhase === "inhale" ? currentT.bInhale : breathPhase === "hold" ? currentT.bHold : currentT.bExhale}
                </p>

                {/* Progress Dots */}
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <span>{breathCyclesCompleted >= 3 ? currentT.bDone : `Cycle ${breathCyclesCompleted} / 3`}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setBreathActive(!breathActive)}
                    className="px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                  >
                    {breathActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{breathActive ? currentT.bPause : currentT.bStart}</span>
                  </button>
                  <button
                    onClick={() => {
                      setBreathActive(false);
                      setBreathPhase("inhale");
                      setBreathTimer(4);
                    }}
                    className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 transition-all cursor-pointer border-none"
                    title={currentT.bReset}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-medium text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {currentT.bBenefit}
              </div>
            </div>
          )}

          {/* TAB 2: WALKING */}
          {activeTab === "walking" && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <h3 className="text-base font-serif font-black text-stone-900">{currentT.wTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{currentT.wGuide}</p>
              </div>

              <div className="py-6 px-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center space-y-3">
                <span className="text-4xl font-serif font-black text-emerald-950">
                  {formatTime(walkSecondsLeft)}
                </span>

                <div className="w-48 bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${((600 - walkSecondsLeft) / 600) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setWalkActive(!walkActive)}
                    className="px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                  >
                    {walkActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{walkActive ? currentT.wPause : currentT.wStart}</span>
                  </button>
                  <button
                    onClick={() => {
                      setWalkActive(false);
                      setWalkSecondsLeft(600);
                    }}
                    className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 transition-all cursor-pointer border-none"
                    title={currentT.wReset}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-medium text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {currentT.wBenefit}
              </div>
            </div>
          )}

          {/* TAB 3: HYDRATION */}
          {activeTab === "hydration" && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <h3 className="text-base font-serif font-black text-stone-900">{currentT.hTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{currentT.hGuide}</p>
              </div>

              <div className="py-6 px-4 bg-teal-50/70 rounded-2xl border border-teal-100 flex flex-col items-center justify-center space-y-3">
                
                {/* 8 Water Drops visual */}
                <div className="flex gap-2 justify-center flex-wrap max-w-xs">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i < sipsCount
                          ? "bg-teal-600 text-white shadow-xs scale-105"
                          : "bg-stone-200 text-stone-400"
                      }`}
                    >
                      💧
                    </div>
                  ))}
                </div>

                <div className="text-lg font-serif font-black text-teal-950">
                  {sipsCount} / 8 Sips
                </div>

                {sipsCount >= 8 ? (
                  <div className="px-3 py-1.5 bg-teal-100 text-teal-900 font-bold text-xs rounded-xl">
                    {currentT.hDone}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const next = sipsCount + 1;
                      setSipsCount(next);
                      if (next >= 8 && !completedQuests.includes("hydration")) {
                        setCompletedQuests((p) => [...p, "hydration"]);
                        if (onQuestCompleted) onQuestCompleted("Hydration Flush", 20);
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-xs"
                  >
                    {currentT.hSipBtn}
                  </button>
                )}
              </div>

              <div className="text-[11px] font-medium text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {currentT.hBenefit}
              </div>
            </div>
          )}

          {/* TAB 4: SHAKEOUT */}
          {activeTab === "shakeout" && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <h3 className="text-base font-serif font-black text-stone-900">{currentT.sTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{currentT.sGuide}</p>
              </div>

              <div className="py-5 px-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex flex-col items-center justify-center space-y-3">
                <span className="text-3xl font-serif font-black text-stone-900">
                  {formatTime(shakeoutSeconds)}
                </span>

                <div className="text-xs font-semibold text-stone-600">
                  {currentT.sTips}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShakeoutActive(!shakeoutActive)}
                    className="px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                  >
                    {shakeoutActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{shakeoutActive ? currentT.sPause : currentT.sStart}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShakeoutActive(false);
                      setShakeoutSeconds(120);
                    }}
                    className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 transition-all cursor-pointer border-none"
                    title={currentT.sReset}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-medium text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {currentT.sBenefit}
              </div>
            </div>
          )}

          {/* TAB 5: GROUNDING */}
          {activeTab === "grounding" && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-center">
                <h3 className="text-base font-serif font-black text-stone-900">{currentT.gTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{currentT.gGuide}</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 1, title: currentT.g5, icon: "👀" },
                  { id: 2, title: currentT.g4, icon: "✋" },
                  { id: 3, title: currentT.g3, icon: "👂" },
                  { id: 4, title: currentT.g2, icon: "👃" },
                  { id: 5, title: currentT.g1, icon: "👅" },
                ].map((step) => {
                  const isDone = completedGroundingSteps.includes(step.id);

                  return (
                    <button
                      key={step.id}
                      onClick={() => toggleGroundingStep(step.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-base">{step.icon}</span>
                        <span>{step.title}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isDone ? "bg-emerald-600 border-emerald-700 text-white" : "border-stone-300 bg-white"
                      }`}>
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {completedGroundingSteps.length >= 5 && (
                <div className="p-2.5 bg-emerald-100 text-emerald-900 text-center font-bold text-xs rounded-xl">
                  {currentT.gDone}
                </div>
              )}

              <div className="text-[11px] font-medium text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center">
                {currentT.gBenefit}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-xs"
          >
            {currentT.close}
          </button>
        </div>
      </div>
    </div>
  );
}
