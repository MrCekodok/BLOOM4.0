import React, { useState } from "react";
import { motion } from "motion/react";
import { Language } from "../translations";
import { SmokingProfile } from "../types";
import { Flame, Target, Calendar, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface SmokingProfileSetupProps {
  language: Language;
  onSaveProfile: (profile: SmokingProfile) => void;
  initialProfile?: SmokingProfile | null;
}

export default function SmokingProfileSetup({ language, onSaveProfile, initialProfile }: SmokingProfileSetupProps) {
  const [habitType, setHabitType] = useState<"cigarette" | "vape" | "both" | "shisha">(
    initialProfile?.habitType || "vape"
  );
  const [frequency, setFrequency] = useState<string>(
    initialProfile?.frequency || "6-15"
  );
  const [quitGoal, setQuitGoal] = useState<"complete" | "gradual" | "control_triggers">(
    initialProfile?.quitGoal || "complete"
  );
  const [targetTimeline, setTargetTimeline] = useState<"7_days" | "14_days" | "30_days" | "60_days">(
    initialProfile?.targetTimeline || "30_days"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: SmokingProfile = {
      habitType,
      frequency,
      quitGoal,
      targetTimeline,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
    };
    onSaveProfile(profile);
  };

  // Translations helper
  const labels = {
    en: {
      badge: "Habit Profile Setup",
      title: "Your Habit Profile",
      subtitle: "Personalized to your goal. 100% confidential & judgment-free.",
      
      sec1Title: "1. Primary Product",
      habCigarette: "Cigarettes",
      habCigaretteSub: "Traditional tobacco",
      habVape: "Vape / E-Cigarette",
      habVapeSub: "Pods, disposables",
      habBoth: "Cigarettes & Vape",
      habBothSub: "Dual usage",
      habShisha: "Shisha / Hookah",
      habShishaSub: "Waterpipe",

      sec2Title: "2. Daily Usage",
      freqLight: "1 – 5 daily",
      freqLightTag: "Light",
      freqMod: "6 – 15 daily",
      freqModTag: "Moderate",
      freqHeavy: "16+ daily",
      freqHeavyTag: "Heavy",
      freqOccasional: "Social only",
      freqOccasionalTag: "Occasional",

      sec3Title: "3. Primary Goal",
      goalComplete: "Quit Completely",
      goalCompleteSub: "Aim for zero consumption & clean streak",
      goalGradual: "Gradual Step-Down",
      goalGradualSub: "Reduce daily quantity step by step",
      goalTriggers: "Control Urges & Triggers",
      goalTriggersSub: "Manage stress & craving spikes",

      sec4Title: "4. Recovery Timeline",
      time7: "7 Days",
      time14: "14 Days",
      time30: "30 Days",
      time60: "60 Days",

      btnSubmit: "Save Profile & Plant Tomato Seed 🍅",
    },
    ms: {
      badge: "Tetapan Profil Tabiat",
      title: "Profil Tabiat Anda",
      subtitle: "Disesuaikan mengikut matlamat anda. 100% sulit.",

      sec1Title: "1. Produk Utama",
      habCigarette: "Rokok",
      habCigaretteSub: "Tembakau tradisional",
      habVape: "Vape / E-Cigarette",
      habVapeSub: "Pod & pakai buang",
      habBoth: "Rokok & Vape",
      habBothSub: "Campuran produk",
      habShisha: "Shisha / Hookah",
      habShishaSub: "Paip air",

      sec2Title: "2. Kekerapan Harian",
      freqLight: "1 – 5 sehari",
      freqLightTag: "Ringan",
      freqMod: "6 – 15 sehari",
      freqModTag: "Sederhana",
      freqHeavy: "16+ sehari",
      freqHeavyTag: "Tinggi",
      freqOccasional: "Sosial sahaja",
      freqOccasionalTag: "Kadang-kadang",

      sec3Title: "3. Matlamat Utama",
      goalComplete: "Berhenti Sepenuhnya",
      goalCompleteSub: "Sasarkan sifar penggunaan & bina rekod",
      goalGradual: "Pengurangan Berperingkat",
      goalGradualSub: "Kurangkan secara berperingkat",
      goalTriggers: "Kawal Keinginan",
      goalTriggersSub: "Urus tekanan & dorongan keinginan",

      sec4Title: "4. Tempoh Pemulihan",
      time7: "7 Hari",
      time14: "14 Hari",
      time30: "30 Hari",
      time60: "60 Hari",

      btnSubmit: "Simpan Profil & Mula Tanam Tomato 🍅",
    },
    zh: {
      badge: "习惯档案设置",
      title: "您的习惯档案",
      subtitle: "为您个性化定制策略，100% 严格保密。",

      sec1Title: "1. 主要使用产品",
      habCigarette: "传统香烟",
      habCigaretteSub: "卷烟、纸烟",
      habVape: "电子烟 / Vape",
      habVapeSub: "烟弹、一次性",
      habBoth: "香烟 + 电子烟",
      habBothSub: "混合使用",
      habShisha: "水烟 / Shisha",
      habShishaSub: "传统水烟",

      sec2Title: "2. 每日使用频率",
      freqLight: "每日 1 – 5 次/支",
      freqLightTag: "轻度",
      freqMod: "每日 6 – 15 次/支",
      freqModTag: "中度",
      freqHeavy: "每日 16+ 次/支",
      freqHeavyTag: "重度",
      freqOccasional: "仅社交/聚会",
      freqOccasionalTag: "偶尔",

      sec3Title: "3. 您的目标",
      goalComplete: "彻底戒断",
      goalCompleteSub: "目标零抽吸，建立清爽连续天数",
      goalGradual: "逐步减量",
      goalGradualSub: "循序渐进减少每日使用量",
      goalTriggers: "控制冲动",
      goalTriggersSub: "缓解压力，掌控渴求时刻",

      sec4Title: "4. 恢复时间线",
      time7: "7 天",
      time14: "14 天",
      time30: "30 天",
      time60: "60 天",

      btnSubmit: "保存档案并种植番茄种子 🍅",
    },
    ko: {
      badge: "습관 프로필 설정",
      title: "습관 프로필",
      subtitle: "목표에 맞춘 맞춤 가이드. 100% 비밀 보장.",

      sec1Title: "1. 주요 사용 제품",
      habCigarette: "일반 담배",
      habCigaretteSub: "궐련, 연초",
      habVape: "전자담배 / 베이프",
      habVapeSub: "팟, 일회용",
      habBoth: "연초 + 전자담배",
      habBothSub: "혼용",
      habShisha: "물담배 / 시샤",
      habShishaSub: "물담배",

      sec2Title: "2. 하루 사용 빈도",
      freqLight: "하루 1 – 5 회/개비",
      freqLightTag: "가벼움",
      freqMod: "하루 6 – 15 회/개비",
      freqModTag: "보통",
      freqHeavy: "하루 16회 이상",
      freqHeavyTag: "높음",
      freqOccasional: "사교 모임 시에만",
      freqOccasionalTag: "가끔",

      sec3Title: "3. 주된 목표",
      goalComplete: "완전 금연",
      goalCompleteSub: "목표 0건 달성 및 연속 기록",
      goalGradual: "단계적 감연",
      goalGradualSub: "매일 조금씩 줄이기",
      goalTriggers: "욕구 조절",
      goalTriggersSub: "스트레스 및 욕구 관리",

      sec4Title: "4. 목표 회복 기간",
      time7: "7일",
      time14: "14일",
      time30: "30일",
      time60: "60일",

      btnSubmit: "프로필 저장 및 토마토 심기 🍅",
    }
  };

  const t = labels[language] || labels.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-8 border border-white/70 shadow-2xl max-w-2xl mx-auto w-full relative z-10 select-none"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-emerald-100/90 text-emerald-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            {t.badge}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-black text-emerald-950">
          {t.title} 🚬💨
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Product / Habit Type */}
        <div className="space-y-2.5">
          <label className="text-xs font-serif font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-700" />
            {t.sec1Title}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "vape", emoji: "💨", title: t.habVape },
              { id: "cigarette", emoji: "🚬", title: t.habCigarette },
              { id: "both", emoji: "🚬💨", title: t.habBoth },
              { id: "shisha", emoji: "🌬️", title: t.habShisha },
            ].map((item) => {
              const isSelected = habitType === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setHabitType(item.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 backdrop-blur-xs ${
                    isSelected
                      ? "bg-white/80 border-2 border-emerald-600 shadow-sm scale-[1.01]"
                      : "bg-white/50 hover:bg-white/75 border-white/80"
                  }`}
                >
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 flex-1 justify-between">
                    <span>{item.title}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Frequency */}
        <div className="space-y-2.5">
          <label className="text-xs font-serif font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-700" />
            {t.sec2Title}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "1-5", title: t.freqLight, tag: t.freqLightTag, emoji: "🌱" },
              { id: "6-15", title: t.freqMod, tag: t.freqModTag, emoji: "⚡" },
              { id: "16+", title: t.freqHeavy, tag: t.freqHeavyTag, emoji: "🔥" },
              { id: "occasional", title: t.freqOccasional, tag: t.freqOccasionalTag, emoji: "🤝" },
            ].map((item) => {
              const isSelected = frequency === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFrequency(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between backdrop-blur-xs ${
                    isSelected
                      ? "bg-white/80 border-2 border-emerald-600 shadow-sm"
                      : "bg-white/50 hover:bg-white/75 border-white/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-xs font-bold text-emerald-950">{item.title}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-emerald-700 text-white" : "bg-emerald-100/80 text-emerald-950"
                  }`}>
                    {item.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Quit Goal */}
        <div className="space-y-2.5">
          <label className="text-xs font-serif font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-700" />
            {t.sec3Title}
          </label>
          <div className="space-y-2">
            {[
              { id: "complete", emoji: "🎯", title: t.goalComplete },
              { id: "gradual", emoji: "📉", title: t.goalGradual },
              { id: "control_triggers", emoji: "🛡️", title: t.goalTriggers },
            ].map((item) => {
              const isSelected = quitGoal === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setQuitGoal(item.id as any)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 backdrop-blur-xs ${
                    isSelected
                      ? "bg-white/80 border-2 border-emerald-600 shadow-sm"
                      : "bg-white/50 hover:bg-white/75 border-white/80"
                  }`}
                >
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <div className="text-xs font-bold text-emerald-950 flex-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Target Recovery Timeline */}
        <div className="space-y-2.5">
          <label className="text-xs font-serif font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            {t.sec4Title}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "7_days", title: t.time7, emoji: "⚡" },
              { id: "14_days", title: t.time14, emoji: "🌿" },
              { id: "30_days", title: t.time30, emoji: "🌸" },
              { id: "60_days", title: t.time60, emoji: "🌳" },
            ].map((item) => {
              const isSelected = targetTimeline === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setTargetTimeline(item.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer backdrop-blur-xs ${
                    isSelected
                      ? "bg-emerald-700 text-white border-emerald-700 font-black shadow-xs"
                      : "bg-white/50 hover:bg-white/75 border-white/80 text-emerald-950 font-bold"
                  }`}
                >
                  <div className="text-lg">{item.emoji}</div>
                  <div className="text-[10px] leading-tight mt-1">{item.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-emerald-100 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-850 text-white font-black text-xs rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md border-none uppercase tracking-wider"
          >
            <span>{t.btnSubmit}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
