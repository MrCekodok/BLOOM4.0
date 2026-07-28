import { useState } from "react";
import { motion } from "motion/react";
import { LogEntry } from "../types";
import { Language } from "../translations";
import { Flame, Info, Sparkles } from "lucide-react";

interface FlowerPotProps {
  logs: LogEntry[];
  currentDateStr: string;
  language: Language;
  seedType?: string;
  coins?: number;
  isBroken?: boolean;
  plantLevel?: number;
  onRestorePlant?: () => void;
}

const GLITTER_PARTICLES = [
  { id: 1, left: "28.1%", top: "18.4%", color: "#FFF2CC", size: 5 },
  { id: 2, left: "40.6%", top: "13.2%", color: "#FFFFFF", size: 4 },
  { id: 3, left: "56.3%", top: "10.5%", color: "#FAD7A0", size: 6 },
  { id: 4, left: "71.9%", top: "19.7%", color: "#FFFFFF", size: 5 },
  { id: 5, left: "31.3%", top: "31.6%", color: "#FFFFFF", size: 4 },
  { id: 6, left: "68.8%", top: "28.9%", color: "#FAD7A0", size: 5 },
  { id: 7, left: "43.8%", top: "21.1%", color: "#FAD7A0", size: 6 },
  { id: 8, left: "54.7%", top: "23.7%", color: "#FFFFFF", size: 4 },
  { id: 9, left: "34.4%", top: "39.5%", color: "#FFF2CC", size: 5 },
  { id: 10, left: "62.5%", top: "36.8%", color: "#FFFFFF", size: 4 },
  { id: 11, left: "46.9%", top: "34.2%", color: "#FFFFFF", size: 5 },
  { id: 12, left: "51.6%", top: "15.8%", color: "#FAD7A0", size: 4 },
];

const BUTTERFLY_1_PATH = {
  left: ["6.2%", "18.7%", "31.2%", "42.1%", "42.1%", "42.1%", "50.0%", "62.5%", "71.8%", "71.8%", "71.8%", "56.2%", "34.3%", "15.6%", "6.2%"],
  top: ["15.7%", "21.0%", "23.6%", "27.6%", "27.6%", "27.6%", "21.0%", "17.1%", "22.3%", "22.3%", "22.3%", "31.5%", "36.8%", "28.9%", "15.7%"],
  rotate: [15, 25, 10, -5, -5, -5, 30, 15, -10, -10, -10, 45, -20, -35, 15]
};

const BUTTERFLY_2_PATH = {
  left: ["87.5%", "71.8%", "57.8%", "54.6%", "54.6%", "54.6%", "40.6%", "28.1%", "18.7%", "18.7%", "18.7%", "37.5%", "59.3%", "78.1%", "87.5%"],
  top: ["18.4%", "23.6%", "28.9%", "27.6%", "27.6%", "27.6%", "19.7%", "15.7%", "25.0%", "25.0%", "25.0%", "34.2%", "39.4%", "28.9%", "18.4%"],
  rotate: [-10, -25, 0, 5, 5, 5, -20, -15, 30, 30, 30, -45, 15, 10, -10]
};

function Butterfly({ path, color, delay }: { path: typeof BUTTERFLY_1_PATH; color: string; delay: number }) {
  return (
    <motion.div
      animate={{
        left: path.left,
        top: path.top,
        rotate: path.rotate,
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className="absolute pointer-events-none z-30"
      style={{ width: 22, height: 22 }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left Wing */}
        <motion.div
          animate={{ rotateY: [0, 75, 0] }}
          transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[11px] w-[9px] h-[11px] rounded-l-full origin-right"
          style={{ backgroundColor: color, border: "0.5px solid #1C2833" }}
        />
        {/* Right Wing */}
        <motion.div
          animate={{ rotateY: [0, 75, 0] }}
          transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[11px] w-[9px] h-[11px] rounded-r-full origin-left"
          style={{ backgroundColor: color, border: "0.5px solid #1C2833" }}
        />
        {/* Body */}
        <div className="absolute w-[1.5px] h-[12px] bg-slate-800 rounded-full" />
      </div>
    </motion.div>
  );
}

interface StageDetail {
  title: Record<Language, string>;
  desc: Record<Language, string>;
}

const STAGES_DETAILS: Record<number, StageDetail> = {
  1: {
    title: {
      en: "Stage 1: Seed",
      ms: "Tahap 1: Biji Benih",
      zh: "阶段 1：种子",
      ko: "1단계: 씨앗",
    },
    desc: {
      en: "A tiny tomato seed resting in cozy warm soil.",
      ms: "Biji benih tomato kecil berehat di tanah hangat yang selesa.",
      zh: "一颗微小的番茄种子在温暖舒适的泥土中沉睡。",
      ko: "포근한 흙 속에서 쉬고 있는 작은 토마토 씨앗.",
    }
  },
  2: {
    title: {
      en: "Stage 2: Germination (1)",
      ms: "Tahap 2: Percambahan (1)",
      zh: "阶段 2：发芽期 (1)",
      ko: "2단계: 발아 (1)",
    },
    desc: {
      en: "The seed absorbs water and a root and shoot emerge.",
      ms: "Biji benih menyerap air, akar dan pucuk mula muncul.",
      zh: "种子吸收水分，幼根和嫩芽破土萌发。",
      ko: "씨앗이 수분을 흡수하여 뿌리와 어린순이 돋아납니다.",
    }
  },
  3: {
    title: {
      en: "Stage 3: Germination (2)",
      ms: "Tahap 3: Percambahan (2)",
      zh: "阶段 3：发芽期 (2)",
      ko: "3단계: 발아 (2)",
    },
    desc: {
      en: "The hooked shoot pushes upward out of the soil.",
      ms: "Pucuk melengkung menolak keluar dari tanah.",
      zh: "弯曲的幼芽破土而出，向上生长。",
      ko: "어린 줄기가 흙을 뚫고 올라옵니다.",
    }
  },
  4: {
    title: {
      en: "Stage 4: Seedling",
      ms: "Tahap 4: Anak Benih",
      zh: "阶段 4：幼苗期",
      ko: "4단계: 유묘기",
    },
    desc: {
      en: "The plant develops its first true leaves.",
      ms: "Tumbuhan mula menumbuhkan daun sejati pertamanya.",
      zh: "小苗展开了第一对真叶，充满生机。",
      ko: "식물이 첫 번째 진짜 잎을 펼쳐냅니다.",
    }
  },
  5: {
    title: {
      en: "Stage 5: Vegetative Growth",
      ms: "Tahap 5: Pertumbuhan Vegetatif",
      zh: "阶段 5：营养生长期",
      ko: "5단계: 영양 성장",
    },
    desc: {
      en: "The plant grows larger with more leaves and stronger stems.",
      ms: "Tumbuhan membesar dengan lebih banyak daun dan batang yang kukuh.",
      zh: "植株不断长高，茎干更加粗壮，长出茂密的枝叶。",
      ko: "식물이 더 많은 잎과 튼튼한 줄기를 형성하며 왕성하게 자랍니다.",
    }
  },
  6: {
    title: {
      en: "Stage 6: Flowering",
      ms: "Tahap 6: Berbunga",
      zh: "阶段 6：开花期",
      ko: "6단계: 개화기",
    },
    desc: {
      en: "Yellow flowers appear on the plant.",
      ms: "Bunga-bunga kuning cantik mula mekar di atas tumbuhan.",
      zh: "枝头绽放出朵朵金黄色的花朵。",
      ko: "줄기 끝에 노란 토마토 꽃이 화사하게 피어납니다.",
    }
  },
  7: {
    title: {
      en: "Stage 7: Fruit Set",
      ms: "Tahap 7: Pembentukan Buah",
      zh: "阶段 7：坐果期",
      ko: "7단계: 착과기",
    },
    desc: {
      en: "Flowers develop into green fruits.",
      ms: "Bunga bertukar menjadi buah-buah tomato hijau.",
      zh: "花朵谢后，结出串串青绿色的番茄幼果。",
      ko: "꽃이 진 자리에 탐스러운 초록색 토마토 열매가 맺힙니다.",
    }
  },
  8: {
    title: {
      en: "Stage 8: Maturity & Fruiting",
      ms: "Tahap 8: Matang & Berbuah",
      zh: "阶段 8：成熟采收期",
      ko: "8단계: 완숙 & 결실기",
    },
    desc: {
      en: "Fruits ripen from green to red on the support stake. The plant continues producing.",
      ms: "Buah masak dari hijau ke merah di atas pancang kayu. Tumbuhan terus mengeluarkan hasil.",
      zh: "在立桩支撑下果实由绿转红，红润饱满，长势喜人。",
      ko: "지지대에 자라나 붉게 익은 토마토가 풍성한 결실을 맺고 계속 수확됩니다.",
    }
  }
};

export default function FlowerPot({ logs, currentDateStr, language, coins = 0, isBroken = false, plantLevel, onRestorePlant }: FlowerPotProps) {
  const TODAY_STR = currentDateStr || new Date().toISOString().split("T")[0];

  const calculateStreak = (): number => {
    let streak = 0;
    let checkDateString = TODAY_STR;
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
  };

  const streak = calculateStreak();

  // Map streak to growth stages 1-8 based on the Life Cycle diagram
  let calculatedStageIndex = 1;
  if (streak === 0) calculatedStageIndex = 1; // Stage 1: Seed
  else if (streak === 1) calculatedStageIndex = 2; // Stage 2: Germination (1)
  else if (streak === 2) calculatedStageIndex = 3; // Stage 3: Germination (2)
  else if (streak === 3) calculatedStageIndex = 4; // Stage 4: Seedling
  else if (streak === 4) calculatedStageIndex = 5; // Stage 5: Vegetative Growth
  else if (streak === 5) calculatedStageIndex = 6; // Stage 6: Flowering
  else if (streak === 6) calculatedStageIndex = 7; // Stage 7: Fruit Set
  else calculatedStageIndex = 8; // Stage 8: Maturity & Fruiting

  // If plantLevel is explicitly provided (>0), use it bounded between 1 and 8
  const currentStageIndex = typeof plantLevel === "number" && plantLevel > 0 ? Math.max(1, Math.min(8, plantLevel)) : calculatedStageIndex;

  // Retrieve Stage Text Info
  const stageData = STAGES_DETAILS[currentStageIndex] || STAGES_DETAILS[1];
  const title = stageData.title[language];
  const description = stageData.desc[language];

  const getSeedLocalizedName = () => {
    return language === "ko" ? "유기농 토마토" : language === "zh" ? "有机番茄" : language === "ms" ? "Tumbuhan Tomato" : "Organic Tomato";
  };

  return (
    <div className="w-full mb-3 select-none relative flex flex-col items-center justify-center">
      
      {/* Aspect Ratio SVG Plant Arena */}
      <div className="relative h-[13rem] sm:h-[16rem] md:h-[19rem] w-full flex items-center justify-center overflow-visible py-1">
        <div className="relative h-full aspect-[320/380] flex items-center justify-center">
          
          {/* Ambient Particles & Butterflies for Bloom Stages */}
          {currentStageIndex >= 5 && !isBroken && (
            <>
              {GLITTER_PARTICLES.map((gp) => (
                <motion.div
                  key={gp.id}
                  className="absolute rounded-full pointer-events-none z-20"
                  style={{
                    left: gp.left,
                    top: gp.top,
                    width: gp.size,
                    height: gp.size,
                    backgroundColor: gp.color,
                    boxShadow: `0 0 8px ${gp.color}`,
                  }}
                  animate={{ opacity: [0.15, 0.95, 0.15], scale: [0.8, 1.4, 0.8] }}
                  transition={{
                    duration: 2.2 + (gp.id % 3) * 1.0,
                    repeat: Infinity,
                    delay: (gp.id % 4) * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}

              <Butterfly path={BUTTERFLY_1_PATH} color="#E74C3C" delay={0} />
              <Butterfly path={BUTTERFLY_2_PATH} color="#F5B041" delay={4} />
            </>
          )}

          {/* Falling dry withered leaves when plant is broken/withered */}
          {isBroken && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              <motion.div
                className="absolute w-3.5 h-2 rounded-full bg-[#8B5A2B] opacity-80"
                style={{ left: "35%", top: "25%" }}
                animate={{ y: [0, 130], x: [0, -15, 10], rotate: [0, 120, 240], opacity: [0.9, 0.7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-3 h-1.5 rounded-full bg-[#A0522D] opacity-80"
                style={{ left: "62%", top: "20%" }}
                animate={{ y: [0, 150], x: [0, 18, -8], rotate: [0, -180, -360], opacity: [0.85, 0.6, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "linear", delay: 1.2 }}
              />
              <motion.div
                className="absolute w-2.5 h-2 rounded-full bg-[#D4AC0D] opacity-75"
                style={{ left: "48%", top: "30%" }}
                animate={{ y: [0, 110], x: [0, 8, -12], rotate: [0, 90, 180], opacity: [0.8, 0.5, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "linear", delay: 2.1 }}
              />
            </div>
          )}

          {/* Master Plant SVG Canvas */}
          <svg viewBox="0 0 320 380" className="w-full h-full max-h-full drop-shadow-[0_12px_24px_rgba(91,44,111,0.08)] overflow-visible">
            <defs>
              <linearGradient id="greenhouse-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DFEBE5" />
                <stop offset="60%" stopColor="#EBF4F0" />
                <stop offset="100%" stopColor="#F5FAF8" />
              </linearGradient>
              <linearGradient id="sunlight-ray" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#FFF9E6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#FFF9E6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grass-gradient-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E5C2F" />
                <stop offset="100%" stopColor="#113F1F" />
              </linearGradient>
              <linearGradient id="grass-gradient-medium" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#27AE60" />
                <stop offset="100%" stopColor="#1B7A43" />
              </linearGradient>
              <linearGradient id="grass-gradient-light" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#58D68D" />
                <stop offset="100%" stopColor="#2ECC71" />
              </linearGradient>
              <linearGradient id="rich-soil" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#503A2E" />
                <stop offset="100%" stopColor="#2E1C12" />
              </linearGradient>
              
              {/* Botanical Gradients: Tomato */}
              <linearGradient id="tomato-stem" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#2D5A27" />
                <stop offset="60%" stopColor="#4A7C3A" />
                <stop offset="100%" stopColor="#69A253" />
              </linearGradient>
              <linearGradient id="t-leaf-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#69A253" /><stop offset="100%" stopColor="#244D1E" />
              </linearGradient>
              <linearGradient id="t-leaf-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7EBA65" /><stop offset="100%" stopColor="#316127" />
              </linearGradient>
              <radialGradient id="tomato-radial" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FF8B74" />
                <stop offset="35%" stopColor="#E74C3C" />
                <stop offset="85%" stopColor="#C0392B" />
                <stop offset="100%" stopColor="#7B1A10" />
              </radialGradient>

              {/* Botanical Gradients: Strawberry */}
              <linearGradient id="strawberry-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2ECC71" />
                <stop offset="100%" stopColor="#196F3D" />
              </linearGradient>
              <radialGradient id="strawberry-fruit" cx="35%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#FF7676" />
                <stop offset="40%" stopColor="#E74C3C" />
                <stop offset="90%" stopColor="#922B21" />
              </radialGradient>

              {/* Botanical Gradients: Grape */}
              <linearGradient id="grape-vine" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#5E3A19" />
                <stop offset="100%" stopColor="#9C6432" />
              </linearGradient>
              <linearGradient id="grape-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D8348" />
                <stop offset="100%" stopColor="#114F26" />
              </linearGradient>
              <radialGradient id="grape-berry" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#D4B2E6" />
                <stop offset="30%" stopColor="#8E44AD" />
                <stop offset="85%" stopColor="#5B2C6F" />
                <stop offset="100%" stopColor="#2C133A" />
              </radialGradient>

              {/* Botanical Gradients: Mango */}
              <linearGradient id="mango-trunk" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#4D3319" />
                <stop offset="100%" stopColor="#734D26" />
              </linearGradient>
              <linearGradient id="mango-leaf-mature" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#27AE60" />
                <stop offset="100%" stopColor="#145A32" />
              </linearGradient>
              <linearGradient id="mango-leaf-young" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D98880" />
                <stop offset="100%" stopColor="#7B241C" />
              </linearGradient>
              <radialGradient id="mango-fruit" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#F7DC6F" />
                <stop offset="40%" stopColor="#F39C12" />
                <stop offset="85%" stopColor="#E67E22" />
                <stop offset="100%" stopColor="#C0392B" />
              </radialGradient>

              {/* Botanical Gradients: Lemon */}
              <linearGradient id="lemon-trunk" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#2E4A1C" />
                <stop offset="100%" stopColor="#4A752C" />
              </linearGradient>
              <radialGradient id="lemon-fruit" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="50%" stopColor="#F7E31E" />
                <stop offset="100%" stopColor="#C9A302" />
              </radialGradient>

              {/* Botanical Gradients: Pear */}
              <linearGradient id="pear-trunk" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#3E5C25" />
                <stop offset="100%" stopColor="#5E8A37" />
              </linearGradient>
              <radialGradient id="pear-fruit" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#C1E170" />
                <stop offset="60%" stopColor="#A4C639" />
                <stop offset="100%" stopColor="#6C8A1B" />
              </radialGradient>

              {/* Radial Gradients for Tomato Fruit Stages */}
              <radialGradient id="tomato-orange-radial" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FAD7A0" />
                <stop offset="40%" stopColor="#F39C12" />
                <stop offset="85%" stopColor="#E67E22" />
                <stop offset="100%" stopColor="#A04000" />
              </radialGradient>
              <radialGradient id="tomato-green-radial" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ABEBC6" />
                <stop offset="40%" stopColor="#2ECC71" />
                <stop offset="85%" stopColor="#27AE60" />
                <stop offset="100%" stopColor="#1E8449" />
              </radialGradient>
              <linearGradient id="wooden-stake" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#875A31" />
                <stop offset="50%" stopColor="#A06A32" />
                <stop offset="100%" stopColor="#6E4522" />
              </linearGradient>

              {/* Withered/Sick Gradients & Filter */}
              <linearGradient id="withered-stem" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#5C4033" />
                <stop offset="100%" stopColor="#8B5A2B" />
              </linearGradient>
              <linearGradient id="withered-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A0522D" />
                <stop offset="100%" stopColor="#5C4033" />
              </linearGradient>
              <filter id="withered-plant-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feColorMatrix type="matrix" values="
                  0.35  0.35  0.10  0  0.18
                  0.25  0.30  0.10  0  0.10
                  0.10  0.15  0.10  0  0.02
                  0     0     0     1  0" />
              </filter>
            </defs>

            {/* ==================== BACKDROP GREENHOUSE STRUCTURE ==================== */}
            <g id="greenhouse-backdrop">
              <rect x="0" y="0" width="320" height="380" rx="20" fill="url(#greenhouse-sky)" />
              <polygon points="60,0 180,0 320,150 320,250 140,380 0,380" fill="url(#sunlight-ray)" opacity="0.6" />
              <path d="M10,380 L10,80 Q160,20 310,80 L310,380" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.6" />
              <line x1="85" y1="380" x2="85" y2="55" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
              <line x1="160" y1="380" x2="160" y2="20" stroke="#FFFFFF" strokeWidth="3" opacity="0.5" />
              <line x1="235" y1="380" x2="235" y2="55" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
              <path d="M10,140 Q160,95 310,140" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
              <path d="M10,240 Q160,195 310,240" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
            </g>

            {/* ==================== STABLE SOIL & GROUND COVER ==================== */}
            <g id="ground">
              <ellipse cx="160" cy="345" rx="145" ry="32" fill="url(#rich-soil)" />
              <path d="M10,340 Q160,285 310,340 L310,380 L10,380 Z" fill="url(#grass-gradient-dark)" />
              <path d="M15,350 Q160,300 305,350 L305,380 L15,380 Z" fill="url(#grass-gradient-medium)" />
              
              {/* Soil pebbles */}
              <circle cx="90" cy="365" r="2.5" fill="#3E2723" />
              <circle cx="230" cy="362" r="2" fill="#4E342E" />
              <circle cx="120" cy="370" r="1.5" fill="#3E2723" opacity="0.8" />
              <circle cx="200" cy="368" r="2" fill="#5D4037" />

              <path d="M5,358 Q160,312 315,358 L315,380 L5,380 Z" fill="url(#grass-gradient-light)" />
            </g>

            {/* ==================== DRAW DIGITAL SEED / PLANT LAYERS ==================== */}

            {/* CASE 0: STREAK IS ZERO (RESTING STATE WHEN LOGS IS EMPTY) */}
            {currentStageIndex === 0 && (
              <g>
                <ellipse cx="160" cy="335" rx="10" ry="6" fill="#F4D03F" opacity="0.25" className="animate-ping" />
                <path d="M157,336 C155,331 163,331 165,336 C164,340 158,340 157,336 Z" fill="#D35400" stroke="#5C4033" strokeWidth="0.5" />
                <circle cx="160" cy="330" r="1.5" fill="#FFF" className="animate-pulse" />
              </g>
            )}

            {/* ==================== 8 TOMATO GROWTH STAGES ==================== */}
            {currentStageIndex > 0 && (
              <g 
                id="tomato-plant-stages" 
                filter={isBroken ? "url(#withered-plant-filter)" : undefined}
                transform={isBroken ? "translate(0, 10) scale(1, 0.92) rotate(2.5, 160, 340)" : undefined}
              >
                
                {/* STAGE 1: SEED (streak 0 / day 1) */}
                {currentStageIndex === 1 && (
                  <g id="stage-1-seed">
                    {/* Golden moisture & soil warmth halo */}
                    <ellipse cx="160" cy="356" rx="20" ry="10" fill="#F4D03F" opacity="0.22" className="animate-pulse" />
                    <ellipse cx="160" cy="356" rx="12" ry="6" fill="#795548" opacity="0.4" />
                    {/* Detailed teardrop tomato seed in rich soil */}
                    <path d="M156,356 C153,349 167,349 164,356 C162,361 158,361 156,356 Z" fill="#D35400" stroke="#4A2E1A" strokeWidth="0.8" />
                    <path d="M158,352 C160,351 162,353 160,356" fill="none" stroke="#F5CBA7" strokeWidth="0.6" />
                    {/* Underground tiny white root tip starting to emerge */}
                    <path d="M160,358 C159,366 158,373 155,379" fill="none" stroke="#F5E6CC" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="160" cy="346" r="1.5" fill="#FFF" className="animate-ping" />
                  </g>
                )}

                {/* STAGE 2: GERMINATION 1 (streak 1 / day 2) */}
                {currentStageIndex === 2 && (
                  <g id="stage-2-germination-1">
                    {/* Subterranean taproot growing down into soil */}
                    <path d="M160,352 C158,366 162,378 156,386" fill="none" stroke="#F5E6CC" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M159,366 C151,373 140,380 132,384" fill="none" stroke="#D5C4A1" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M159,372 C168,378 178,383 186,387" fill="none" stroke="#D5C4A1" strokeWidth="1.6" strokeLinecap="round" />
                    {/* Swollen seed coat underground */}
                    <path d="M156,351 C153,346 167,346 164,351 C162,356 158,356 156,351 Z" fill="#B9770E" stroke="#4A2E1A" strokeWidth="0.8" />
                    {/* Bright green hypocotyl shoot emerging upward toward light */}
                    <path d="M160,349 C159,343 158,338 158,333" fill="none" stroke="#58D68D" strokeWidth="2.8" strokeLinecap="round" />
                    <circle cx="158" cy="332" r="1.5" fill="#82E0AA" className="animate-pulse" />
                  </g>
                )}

                {/* STAGE 3: GERMINATION 2 (streak 2 / day 3) */}
                {currentStageIndex === 3 && (
                  <g id="stage-3-germination-2">
                    {/* Subterranean branching root system */}
                    <path d="M160,345 C158,364 163,380 155,388" fill="none" stroke="#F5E6CC" strokeWidth="3" strokeLinecap="round" />
                    <path d="M159,358 C147,368 134,376 126,381" fill="none" stroke="#D5C4A1" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M159,368 C168,376 179,383 188,387" fill="none" stroke="#D5C4A1" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M157,378 C150,383 142,386 136,388" fill="none" stroke="#C8B195" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Hooked hypocotyl stem crook popping through soil line */}
                    <path d="M160,345 C157,328 150,314 154,308 C158,304 166,312 163,324" fill="none" stroke="url(#tomato-stem)" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Cotyledon tip emerging with brown seed cap sliding off */}
                    <g transform="translate(163, 324)">
                      <circle cx="2" cy="-2" r="3" fill="#B9770E" opacity="0.9" />
                      <path d="M0,0 C-7,-6 -9,-2 0,0 Z" fill="#58D68D" />
                      <path d="M0,0 C3,-7 7,-5 0,0 Z" fill="#82E0AA" />
                    </g>
                  </g>
                )}

                {/* STAGE 4: SEEDLING (streak 3 / day 4) */}
                {currentStageIndex === 4 && (
                  <g id="stage-4-seedling">
                    {/* Roots in soil */}
                    <path d="M160,345 C160,366 162,384 156,396" fill="none" stroke="#F5E6CC" strokeWidth="3.2" strokeLinecap="round" />
                    <path d="M160,356 C146,367 132,377 122,383" fill="none" stroke="#D5C4A1" strokeWidth="2" strokeLinecap="round" />
                    <path d="M160,368 C172,377 186,385 196,390" fill="none" stroke="#D5C4A1" strokeWidth="2" strokeLinecap="round" />
                    <path d="M158,380 C148,387 138,391 130,394" fill="none" stroke="#C8B195" strokeWidth="1.4" strokeLinecap="round" />
                    {/* Straight vertical seedling stem */}
                    <path d="M160,345 C159,310 161,285 160,265" fill="none" stroke="url(#tomato-stem)" strokeWidth="5" strokeLinecap="round" />
                    {/* Pair of cotyledon leaves spreading left & right */}
                    <g>
                      <path d="M160,268 C138,258 118,272 108,268 C123,280 144,276 160,268 Z" fill="url(#t-leaf-1)" />
                      <path d="M160,268 C138,258 118,272 108,268 Z" fill="none" stroke="#A9DFBF" strokeWidth="0.8" />
                      <path d="M160,268 C182,258 202,272 212,268 C197,280 176,276 160,268 Z" fill="url(#t-leaf-2)" />
                      <path d="M160,268 C182,258 202,272 212,268 Z" fill="none" stroke="#A9DFBF" strokeWidth="0.8" />
                    </g>
                    {/* First true notched tomato leaf at terminal bud */}
                    <g transform="translate(160, 265)">
                      <path d="M0,0 C-6,-12 -2,-20 0,-24 C2,-20 6,-12 0,0 Z" fill="#27AE60" />
                      <path d="M0,0 C-12,-8 -18,-2 -14,2 C-8,0 -4,-2 0,0 Z" fill="#2ECC71" />
                      <path d="M0,0 C12,-8 18,-2 14,2 C8,0 4,-2 0,0 Z" fill="#2ECC71" />
                    </g>
                  </g>
                )}

                {/* STAGE 5: VEGETATIVE GROWTH (streak 4 / day 5) */}
                {currentStageIndex === 5 && (
                  <g id="stage-5-vegetative">
                    {/* Subterranean taproot & lateral branches */}
                    <path d="M160,345 C160,368 162,388 156,400" fill="none" stroke="#F5E6CC" strokeWidth="3.8" strokeLinecap="round" />
                    <path d="M160,358 C144,370 126,382 115,388" fill="none" stroke="#D5C4A1" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M160,370 C176,382 194,390 205,395" fill="none" stroke="#D5C4A1" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M158,382 C146,391 134,396 124,399" fill="none" stroke="#C8B195" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Sturdy central stem with node joins */}
                    <path d="M160,345 C157,260 162,180 160,135" fill="none" stroke="url(#tomato-stem)" strokeWidth="6.5" strokeLinecap="round" />
                    {/* Lower compound serrated leaf branch */}
                    <g id="lower-leaves">
                      <path d="M160,265 C130,280 98,270 85,248 C100,228 132,238 160,265 Z" fill="url(#t-leaf-1)" />
                      <path d="M160,265 C130,280 98,270 85,248 Z" stroke="#1E8449" strokeWidth="0.8" fill="none" />
                      <path d="M160,265 C190,280 222,270 235,248 C220,228 188,238 160,265 Z" fill="url(#t-leaf-2)" />
                      <path d="M160,265 C190,280 222,270 235,248 Z" stroke="#1E8449" strokeWidth="0.8" fill="none" />
                    </g>
                    {/* Middle compound serrated leaf branch */}
                    <g id="middle-leaves">
                      <path d="M160,200 C130,215 104,204 94,184 C108,166 136,176 160,200 Z" fill="url(#t-leaf-1)" />
                      <path d="M160,200 C190,215 216,204 226,184 C212,166 184,176 160,200 Z" fill="url(#t-leaf-2)" />
                    </g>
                    {/* Upper compound leaf branch */}
                    <g id="upper-leaves">
                      <path d="M160,145 C138,158 116,148 108,132 C122,116 142,125 160,145 Z" fill="url(#t-leaf-1)" />
                      <path d="M160,145 C182,158 204,148 212,132 C198,116 178,125 160,145 Z" fill="url(#t-leaf-2)" />
                    </g>
                    {/* Terminal growing tip */}
                    <path d="M160,135 C158,124 162,114 160,105" fill="none" stroke="#7EBA65" strokeWidth="3.2" strokeLinecap="round" />
                  </g>
                )}

                {/* STAGE 6: FLOWERING (streak 5 / day 6) */}
                {currentStageIndex === 6 && (
                  <g id="stage-6-flowering">
                    {/* Underground roots */}
                    <path d="M160,345 C160,368 162,388 156,400" fill="none" stroke="#F5E6CC" strokeWidth="3.8" strokeLinecap="round" />
                    <path d="M160,358 C144,370 126,382 115,388" fill="none" stroke="#D5C4A1" strokeWidth="2.2" />
                    <path d="M160,370 C176,382 194,390 205,395" fill="none" stroke="#D5C4A1" strokeWidth="2.2" />
                    {/* Main stalk */}
                    <path d="M160,345 C154,240 165,140 158,100" fill="none" stroke="url(#tomato-stem)" strokeWidth="7" strokeLinecap="round" />
                    {/* Lush compound serrated leaves */}
                    <path d="M160,270 C130,285 98,275 85,253 C100,233 132,243 160,270 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,270 C190,285 222,275 235,253 C220,233 188,243 160,270 Z" fill="url(#t-leaf-2)" />
                    <path d="M160,205 C130,220 104,208 94,188 C108,170 136,180 160,205 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,205 C190,220 216,208 226,188 C212,170 184,180 160,205 Z" fill="url(#t-leaf-2)" />
                    <path d="M158,140 C136,152 114,144 106,128 C120,113 140,121 158,140 Z" fill="url(#t-leaf-1)" />
                    <path d="M158,140 C180,152 202,144 210,128 C196,113 176,121 158,140 Z" fill="url(#t-leaf-2)" />
                    {/* Side pedicels holding flower clusters */}
                    <path d="M158,175 Q132,165 118,148" fill="none" stroke="url(#tomato-stem)" strokeWidth="3" />
                    <path d="M158,138 Q185,128 200,116" fill="none" stroke="url(#tomato-stem)" strokeWidth="3" />
                    <path d="M158,108 Q144,100 140,92" fill="none" stroke="url(#tomato-stem)" strokeWidth="2.5" />
                    {/* Star-shaped bright yellow blooming flowers */}
                    <g transform="translate(118, 148) scale(0.9)">
                      <path d="M0,0 L-3,-12 L2,-13 L6,-4 L12,-11 L10,-2 L14,5 L5,5 L1,13 L-4,5 L-12,8 L-8,-1 Z" fill="#F4D03F" stroke="#B7950B" strokeWidth="0.5" />
                      <circle cx="0" cy="0" r="3.5" fill="#2ECC71" />
                    </g>
                    <g transform="translate(200, 116) scale(0.95)">
                      <path d="M0,0 L-3,-12 L2,-13 L6,-4 L12,-11 L10,-2 L14,5 L5,5 L1,13 L-4,5 L-12,8 L-8,-1 Z" fill="#F4D03F" stroke="#B7950B" strokeWidth="0.5" />
                      <circle cx="0" cy="0" r="3.5" fill="#2ECC71" />
                    </g>
                    <g transform="translate(140, 92) scale(0.8)">
                      <path d="M0,0 L-3,-12 L2,-13 L6,-4 L12,-11 L10,-2 L14,5 L5,5 L1,13 L-4,5 L-12,8 L-8,-1 Z" fill="#F4D03F" stroke="#B7950B" strokeWidth="0.5" />
                      <circle cx="0" cy="0" r="3" fill="#2ECC71" />
                    </g>
                  </g>
                )}

                {/* STAGE 7: FRUIT SET (streak 6 / day 7) */}
                {currentStageIndex === 7 && (
                  <g id="stage-7-fruit-set">
                    {/* Underground root system */}
                    <path d="M160,345 C160,368 162,388 156,400" fill="none" stroke="#F5E6CC" strokeWidth="3.8" strokeLinecap="round" />
                    <path d="M160,358 C144,370 126,382 115,388" fill="none" stroke="#D5C4A1" strokeWidth="2.2" />
                    {/* Sturdy main stem */}
                    <path d="M160,345 C154,230 165,128 158,88" fill="none" stroke="url(#tomato-stem)" strokeWidth="7.2" strokeLinecap="round" />
                    {/* Foliage */}
                    <path d="M160,270 C130,285 98,275 85,253 C100,233 132,243 160,270 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,270 C190,285 222,275 235,253 C220,233 188,243 160,270 Z" fill="url(#t-leaf-2)" />
                    <path d="M160,205 C130,220 104,208 94,188 C108,170 136,180 160,205 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,205 C190,220 216,208 226,188 C212,170 184,180 160,205 Z" fill="url(#t-leaf-2)" />
                    <path d="M158,135 C136,148 114,140 106,125 C120,110 140,118 158,135 Z" fill="url(#t-leaf-1)" />
                    <path d="M158,135 C180,148 202,140 210,125 C196,110 176,118 158,135 Z" fill="url(#t-leaf-2)" />
                    {/* Fruit pedicels */}
                    <path d="M158,195 Q130,185 112,185" fill="none" stroke="url(#tomato-stem)" strokeWidth="3.5" />
                    <path d="M158,160 Q188,150 208,155" fill="none" stroke="url(#tomato-stem)" strokeWidth="3.5" />
                    <path d="M158,118 Q140,110 130,110" fill="none" stroke="url(#tomato-stem)" strokeWidth="2.5" />
                    {/* Unripe green tomato berry clusters */}
                    <g transform="translate(112, 185)">
                      <circle cx="-8" cy="14" r="16" fill="url(#tomato-green-radial)" />
                      <path d="M-15,0 L-10,-5 L-6,2 L-2,-5 L3,0 L-4,3 L-8,-3 Z" fill="#1E8449" />
                      <ellipse cx="-12" cy="8" rx="4" ry="2" transform="rotate(-30 -12 8)" fill="white" opacity="0.4" />
                      <circle cx="12" cy="20" r="13" fill="url(#tomato-green-radial)" />
                    </g>
                    <g transform="translate(208, 155)">
                      <circle cx="0" cy="15" r="18" fill="url(#tomato-green-radial)" />
                      <path d="M-8,0 L-3,-5 L0,2 L4,-5 L8,0 L2,3 L-2,-3 Z" fill="#1E8449" />
                      <ellipse cx="-4" cy="9" rx="5" ry="2.5" transform="rotate(-30 -4 9)" fill="white" opacity="0.45" />
                      <circle cx="18" cy="11" r="12" fill="url(#tomato-green-radial)" />
                    </g>
                    <g transform="translate(130, 110)">
                      <circle cx="0" cy="11" r="13" fill="url(#tomato-green-radial)" />
                      <path d="M-6,0 L-2,-4 L0,2 L3,-4 L6,0 L2,2 L-2,-2 Z" fill="#1E8449" />
                    </g>
                    {/* Remaining top blooms */}
                    <g transform="translate(162, 85) scale(0.75)">
                      <path d="M0,0 L-3,-12 L2,-13 L6,-4 L12,-11 L10,-2 L14,5 L5,5 L1,13 L-4,5 L-12,8 L-8,-1 Z" fill="#F4D03F" />
                    </g>
                  </g>
                )}

                {/* STAGE 8: MATURITY & FRUITING (streak >= 7) */}
                {currentStageIndex === 8 && (
                  <g id="stage-8-maturity">
                    {/* Vertical wooden support stake driven into soil */}
                    <rect x="178" y="65" width="12" height="280" fill="url(#wooden-stake)" rx="2.5" />
                    <path d="M178,90 L190,90 M178,140 L190,140 M178,190 L190,190 M178,240 L190,240 M178,290 L190,290" stroke="#4A2E1A" strokeWidth="0.8" opacity="0.6" />
                    
                    {/* Yellow soft gardener's ties binding plant stem to stake */}
                    <rect x="156" y="248" width="24" height="5" rx="2" fill="#D4AC0D" stroke="#9A7D0A" strokeWidth="0.8" />
                    <rect x="157" y="178" width="23" height="5" rx="2" fill="#D4AC0D" stroke="#9A7D0A" strokeWidth="0.8" />
                    <rect x="158" y="118" width="22" height="5" rx="2" fill="#D4AC0D" stroke="#9A7D0A" strokeWidth="0.8" />

                    {/* Subterranean root network anchoring the plant */}
                    <path d="M160,345 C160,372 162,392 156,400" fill="none" stroke="#F5E6CC" strokeWidth="4" strokeLinecap="round" />
                    <path d="M160,358 C142,370 124,382 112,388" fill="none" stroke="#D5C4A1" strokeWidth="2.5" />
                    <path d="M160,370 C178,382 196,390 208,395" fill="none" stroke="#D5C4A1" strokeWidth="2.5" />

                    {/* Main tall stem */}
                    <path d="M160,345 C154,230 165,118 160,70" fill="none" stroke="url(#tomato-stem)" strokeWidth="7.8" strokeLinecap="round" />

                    {/* Lush compound serrated foliage */}
                    <path d="M160,270 C125,290 92,278 78,255 C95,232 128,242 160,270 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,270 C195,290 228,278 242,255 C225,232 192,242 160,270 Z" fill="url(#t-leaf-2)" />
                    <path d="M160,200 C128,218 98,208 86,188 C102,168 132,176 160,200 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,200 C192,218 222,208 234,188 C218,168 188,176 160,200 Z" fill="url(#t-leaf-2)" />
                    <path d="M160,130 C134,145 110,136 100,120 C114,104 136,112 160,130 Z" fill="url(#t-leaf-1)" />
                    <path d="M160,130 C186,145 210,136 220,120 C206,104 184,112 160,130 Z" fill="url(#t-leaf-2)" />

                    {/* Flowers blooming at top nodes */}
                    <g transform="translate(160, 70) scale(0.85)">
                      <path d="M0,0 L-3,-12 L2,-13 L6,-4 L12,-11 L10,-2 L14,5 L5,5 L1,13 L-4,5 L-12,8 L-8,-1 Z" fill="#F4D03F" stroke="#B7950B" strokeWidth="0.5" />
                      <circle cx="0" cy="0" r="3.5" fill="#2ECC71" />
                    </g>

                    {/* Large Glossy Red Ripe Tomatoes */}
                    {/* Bottom Left Big Red Tomato */}
                    <g transform="translate(108, 182)">
                      <ellipse cx="0" cy="23" rx="22" ry="5" fill="black" opacity="0.18" />
                      <circle cx="0" cy="0" r="23" fill="url(#tomato-radial)" />
                      {/* Star Calyx Cap */}
                      <path d="M-13,-13 L-2,-17 L-9,-7 L1,-14 L11,-12 L2,-17 L6,-20 L-2,-17 L-7,-20 Z" fill="#27AE60" />
                      {/* Glossy specular highlight */}
                      <ellipse cx="-8" cy="-8" rx="6" ry="3.5" transform="rotate(-28 -8 -8)" fill="white" opacity="0.65" />
                    </g>

                    {/* Middle Right Red Tomato */}
                    <g transform="translate(212, 148)">
                      <ellipse cx="0" cy="20" rx="19" ry="4" fill="black" opacity="0.16" />
                      <circle cx="0" cy="0" r="20" fill="url(#tomato-radial)" />
                      <path d="M-11,-11 L-2,-15 L-8,-6 L1,-12 L10,-10 L2,-15 L5,-18 L-2,-15 L-6,-18 Z" fill="#2ECC71" />
                      <ellipse cx="-7" cy="-7" rx="5" ry="3" transform="rotate(-28 -7 -7)" fill="white" opacity="0.6" />
                    </g>

                    {/* Bottom Center Large Red Tomato */}
                    <g transform="translate(145, 218)">
                      <ellipse cx="0" cy="25" rx="24" ry="5" fill="black" opacity="0.2" />
                      <circle cx="0" cy="0" r="25" fill="url(#tomato-radial)" />
                      <path d="M-14,-14 L-2,-18 L-10,-8 L1,-15 L12,-13 L2,-18 L7,-21 L-2,-18 L-8,-21 Z" fill="#27AE60" />
                      <ellipse cx="-9" cy="-9" rx="7" ry="4" transform="rotate(-28 -9 -9)" fill="white" opacity="0.7" />
                    </g>

                    {/* Warm Ripening Orange/Yellow Tomatoes */}
                    <g transform="translate(226, 185)">
                      <ellipse cx="0" cy="16" rx="15" ry="3" fill="black" opacity="0.12" />
                      <circle cx="0" cy="0" r="16" fill="url(#tomato-orange-radial)" />
                      <path d="M-9,-9 L-2,-12 L-6,-5 L1,-10 L8,-8 L2,-12 L4,-15 L-2,-12 L-5,-15 Z" fill="#27AE60" />
                      <ellipse cx="-5" cy="-5" rx="4" ry="2.2" transform="rotate(-28 -5 -5)" fill="white" opacity="0.55" />
                    </g>
                    <g transform="translate(93, 225)">
                      <ellipse cx="0" cy="15" rx="14" ry="3" fill="black" opacity="0.12" />
                      <circle cx="0" cy="0" r="15" fill="url(#tomato-orange-radial)" />
                      <path d="M-8,-8 L-2,-11 L-5,-4 L1,-9 L7,-7 L2,-11 L4,-14 L-2,-11 L-4,-14 Z" fill="#27AE60" />
                      <ellipse cx="-5" cy="-5" rx="4" ry="2.2" transform="rotate(-28 -5 -5)" fill="white" opacity="0.55" />
                    </g>

                    {/* Firm Green Unripe Tomatoes */}
                    <g transform="translate(196, 235)">
                      <circle cx="0" cy="0" r="14" fill="url(#tomato-green-radial)" />
                      <path d="M-7,-7 L-2,-10 L-4,-3 L1,-8 L6,-6 L2,-10 L3,-12 L-2,-10 L-3,-12 Z" fill="#1E8449" />
                    </g>
                    <g transform="translate(125, 118)">
                      <circle cx="0" cy="0" r="12" fill="url(#tomato-green-radial)" />
                      <path d="M-6,-6 L-1,-9 L-3,-2 L1,-7 L5,-5 L1,-9 L2,-11 L-1,-9 L-2,-11 Z" fill="#1E8449" />
                    </g>
                  </g>
                )}
              </g>
            )}





            {/* ==================== WITHERED EXTRA OVERLAYS (WHEN PLANT IS BROKEN) ==================== */}
            {isBroken && (
              <g id="withered-extra-overlays">
                {/* Dry cracked soil overlay at base */}
                <path d="M140,345 C150,342 170,342 180,345 C175,348 145,348 140,345 Z" fill="#2E1C12" opacity="0.9" />
                <line x1="148" y1="344" x2="155" y2="347" stroke="#8B5A2B" strokeWidth="0.8" />
                <line x1="165" y1="344" x2="172" y2="346" stroke="#8B5A2B" strokeWidth="0.8" />
                
                {/* Wilting brown drooping leaf curves */}
                <path d="M125,250 Q112,275 106,295" fill="none" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                <path d="M195,250 Q208,275 214,295" fill="none" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                <path d="M135,190 Q122,212 116,232" fill="none" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                <path d="M185,190 Q198,212 204,232" fill="none" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

                {/* Shriveled brown spots on plant stem */}
                <ellipse cx="160" cy="240" rx="3" ry="5" fill="#3E2723" opacity="0.75" />
                <ellipse cx="159" cy="180" rx="2.5" ry="4" fill="#3E2723" opacity="0.75" />
              </g>
            )}

            {/* ==================== FRONT DECORATION: WILD FLOWERS AND GRASS OVERLAYS ==================== */}
            <g id="front-decorations">
              {/* Sprouted base grass overlay for plant root stability */}
              <ellipse cx="160" cy="342" rx="35" ry="8" fill="#1B4F1C" opacity="0.12" />
              
              {/* Wildflowers */}
              <g transform="translate(70, 345) scale(0.7)">
                <line x1="0" y1="0" x2="0" y2="25" stroke="#1B4F1C" strokeWidth="2" />
                <circle cx="-5" cy="-5" r="4" fill="#FFF9E6" />
                <circle cx="5" cy="-5" r="4" fill="#FFF9E6" />
                <circle cx="-5" cy="5" r="4" fill="#FFF9E6" />
                <circle cx="5" cy="5" r="4" fill="#FFF9E6" />
                <circle cx="0" cy="0" r="3.5" fill="#F4D03F" />
              </g>

              <g transform="translate(250, 350) scale(0.65)">
                <line x1="0" y1="0" x2="2" y2="25" stroke="#1B4F1C" strokeWidth="2" />
                <circle cx="-6" cy="0" r="4.5" fill="#FADBD8" />
                <circle cx="6" cy="0" r="4.5" fill="#FADBD8" />
                <circle cx="0" cy="-6" r="4.5" fill="#FADBD8" />
                <circle cx="0" cy="6" r="4.5" fill="#FADBD8" />
                <circle cx="0" cy="0" r="4" fill="#E74C3C" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ==================== ACTIVE GROWTH STAGE INFORMATION PANEL ==================== */}
      {isBroken ? (
        <div className="w-full max-w-md bg-amber-50/95 border-2 border-amber-300 rounded-[2rem] p-5 shadow-xl mt-3 animate-fade-in relative z-10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
              🍂
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="text-base font-serif font-black text-amber-950">
                  {language === "zh"
                    ? `阶段 ${currentStageIndex}：植物已枯萎 🍂`
                    : language === "ms"
                    ? `Peringkat ${currentStageIndex}: Tumbuhan Layu 🍂`
                    : language === "ko"
                    ? `단계 ${currentStageIndex}: 식물이 시들었습니다 🍂`
                    : `Stage ${currentStageIndex}: Plant Withered 🍂`}
                </h4>
                <span className="text-xs font-black bg-amber-200 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  🪙 {coins} {language === "zh" ? "金币" : language === "ms" ? "Syiling" : language === "ko" ? "코인" : "Coins"}
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/90 mt-1 leading-relaxed">
                {language === "zh"
                  ? "植物因吸烟/电子烟或漏掉打卡而枯萎。使用 20 金币即可将其修复，重获健康生机！"
                  : language === "ms"
                  ? "Tumbuhan anda telah layu kerana merokok/vape atau terlepas daftar masuk. Gunakan 20 syiling untuk memulihkannya!"
                  : language === "ko"
                  ? "흡연/베이핑 또는 어제 체크인 미완료로 식물이 시들었습니다. 20 코인으로 식물을 다시 생생하게 복원하세요!"
                  : "Your plant withered due to smoking/vaping or missing a check-in. Restore it with 20 coins to bring back its health!"}
              </p>
            </div>
          </div>

          {/* Restore Action Button */}
          <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={onRestorePlant}
              disabled={coins < 20}
              className={`w-full sm:w-auto px-6 py-3 rounded-full font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                coins >= 20
                  ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-stone-950 hover:scale-103 active:scale-97 border-none"
                  : "bg-stone-200 text-stone-500 cursor-not-allowed border-none opacity-80"
              }`}
            >
              <span>🪙</span>
              <span>
                {coins >= 20
                  ? language === "zh"
                    ? "使用 20 金币修复植物 ✨"
                    : language === "ms"
                    ? "Pulihkan Tumbuhan (20 Syiling) ✨"
                    : language === "ko"
                    ? "20 코인으로 식물 복원 ✨"
                    : "Restore Plant (20 Coins) ✨"
                  : language === "zh"
                  ? `还需 ${20 - coins} 金币 (需要 20 金币)`
                  : language === "ms"
                  ? `Perlu ${20 - coins} Syiling Lagi (Perlu 20)`
                  : language === "ko"
                  ? `${20 - coins} 코인 더 필요 (총 20 코인)`
                  : `Need ${20 - coins} More Coins (Costs 20)`}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/85 backdrop-blur-md border border-emerald-100 rounded-[2rem] p-5 shadow-xl mt-3 animate-fade-in relative z-10 flex flex-col sm:flex-row items-start gap-4">
          
          {/* Dynamic icon box based on streak */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            {streak > 0 ? (
              <Flame className="w-6 h-6 text-emerald-700 animate-pulse" />
            ) : (
              <Info className="w-6 h-6 text-stone-400" />
            )}
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <h4 className="text-sm font-serif font-black text-emerald-950 flex items-center gap-1">
                {title}
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  🪙 {coins}
                </span>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full shadow-xs">
                  {getSeedLocalizedName()}
                </span>
              </div>
            </div>

            {description && (
              <p className="text-xs text-stone-600 leading-relaxed font-semibold mt-1">
                {description}
              </p>
            )}

            {/* Stepper progress dots */}
            <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-emerald-50">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const isActive = currentStageIndex >= i;
                const isCurrent = currentStageIndex === i;
                return (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isCurrent 
                        ? "w-5 bg-emerald-700" 
                        : isActive 
                          ? "w-1.5 bg-emerald-700/60" 
                          : "w-1.5 bg-stone-200"
                    }`} 
                    title={`Stage ${i}`}
                  />
                );
              })}
              <span className="text-[9px] font-bold text-stone-400 ml-auto flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-emerald-600" /> {streak} day streak
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
