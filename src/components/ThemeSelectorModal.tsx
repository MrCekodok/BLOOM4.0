import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, X, Check, Sparkles, Moon, Sun } from "lucide-react";
import { THEMES, ThemeId, ColorTheme } from "../theme";
import { Language } from "../translations";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  language: Language;
}

export default function ThemeSelectorModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  language
}: ThemeSelectorModalProps) {
  // Freeze background scrolling when ThemeSelectorModal is open
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

  if (!isOpen) return null;

  const t = {
    en: {
      title: "Color Theme Studio 🎨",
      subtitle: "Customize your personal environment. Choose a palette that brings you tranquility & focus.",
      active: "Active Theme",
      select: "Apply Theme",
      close: "Done",
      darkNotice: "Night Mode Enabled: Optimized for low light and eye comfort."
    },
    zh: {
      title: "色彩主题工坊 🎨",
      subtitle: "自定义您的个人戒烟与健康环境。选择最符合您心境与舒缓氛围的色彩。",
      active: "当前使用",
      select: "启用此主题",
      close: "完成",
      darkNotice: "夜间模式已开启：专为低光环境与护眼设计。"
    },
    ms: {
      title: "Studio Tema Warna 🎨",
      subtitle: "Suaikan persekitaran peribadi anda. Pilih palet yang memberikan ketenangan & fokus.",
      active: "Tema Aktif",
      select: "Guna Tema",
      close: "Selesai",
      darkNotice: "Mod Malam Diaktifkan: Dioptimumkan untuk keselesaan mata."
    },
    ko: {
      title: "컬러 테마 스튜디오 🎨",
      subtitle: "나만의 맞춤 환경을 설정하세요. 마음의 평온과 집중을 주는 팔레트를 선택하세요.",
      active: "사용 중",
      select: "테마 적용",
      close: "완료",
      darkNotice: "야간 모드 활성화: 눈이 편안한 저조도 최적화 모드."
    }
  };

  const currentT = t[language] || t.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden border border-stone-200 flex flex-col relative"
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
            title={currentT.close}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/30 flex items-center gap-1 shadow-xs">
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              Bloom Themes
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight flex items-center gap-2">
            {currentT.title}
          </h2>
          <p className="text-xs text-emerald-100/90 font-medium leading-relaxed mt-1">
            {currentT.subtitle}
          </p>
        </div>

        {/* Theme List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-stone-50/50">
          {THEMES.map((theme: ColorTheme) => {
            const isSelected = currentTheme === theme.id;

            const name =
              language === "zh"
                ? theme.nameZh
                : language === "ms"
                ? theme.nameMs
                : language === "ko"
                ? theme.nameKo
                : theme.nameEn;

            const desc =
              language === "zh"
                ? theme.descZh
                : language === "ms"
                ? theme.descMs
                : language === "ko"
                ? theme.descKo
                : theme.descEn;

            return (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden ${
                  isSelected
                    ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-200"
                    : "bg-white/80 border-stone-200 hover:border-emerald-300 hover:bg-white hover:shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Swatch Circle */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.previewBg} p-1 border border-stone-200 shadow-xs shrink-0 flex items-center justify-center text-xl`}>
                    {theme.emoji}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-serif font-black text-stone-900">
                        {name}
                      </h4>
                      {theme.isDark && (
                        <span className="bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Moon className="w-3 h-3 text-amber-300" />
                          Dark
                        </span>
                      )}
                      {isSelected && (
                        <span className="bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3" />
                          {currentT.active}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-medium leading-snug mt-1">
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Apply Action Button */}
                <div className="self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTheme(theme.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-none shadow-2xs ${
                      isSelected
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900"
                    }`}
                  >
                    {isSelected ? currentT.active : currentT.select}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Changes apply instantly across all pages.</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
          >
            {currentT.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
