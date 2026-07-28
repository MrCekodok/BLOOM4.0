import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../translations";
import { Globe, Check, X } from "lucide-react";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
];

export default function LanguageSelector({ currentLanguage, onSelectLanguage }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Freeze background page scrolling when the language menu is open
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

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  const labelByLanguage: Record<Language, string> = {
    en: "Language",
    ms: "Bahasa",
    zh: "语言",
    ko: "언어",
  };
  const label = labelByLanguage[currentLanguage] || "Language";

  const handleSelect = (code: Language) => {
    onSelectLanguage(code);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Bottom-Right Language Selection Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 z-[45] flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-teal-500/25 cursor-pointer transition-all border border-emerald-300/40 active:scale-95"
        title="Select App Language"
      >
        <Globe className="w-4 h-4 text-sky-100" />
        <span className="font-extrabold tracking-tight">Language</span>
      </motion.button>

      {/* Language Selection Modal / Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-md animate-fade-in select-none">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-emerald-100 relative z-10 space-y-4"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-black text-emerald-950">
                      {currentLanguage === "zh" ? "选择语言" : currentLanguage === "ms" ? "Pilih Bahasa" : currentLanguage === "ko" ? "언어 선택" : "Select Language"}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {currentLanguage === "zh" ? "请选择您偏好的应用语言" : currentLanguage === "ms" ? "Pilih bahasa pilihan anda" : currentLanguage === "ko" ? "선호하는 언어를 선택하세요" : "Choose your preferred app language"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-all border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Language Options List */}
              <div className="space-y-2 pt-1">
                {LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer border text-left ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white border-blue-500 shadow-md font-bold scale-[1.01]"
                          : "bg-stone-50/80 hover:bg-emerald-50/80 text-stone-800 border-stone-200/80 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{lang.flag}</span>
                        <div>
                          <div className={`text-sm font-black ${isSelected ? "text-white" : "text-emerald-950"}`}>
                            {lang.nativeName}
                          </div>
                          <div className={`text-[10px] font-semibold ${isSelected ? "text-emerald-100" : "text-stone-400"}`}>
                            {lang.name}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Close / Confirm Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all border-none mt-2"
              >
                {currentLanguage === "zh" ? "完成" : currentLanguage === "ms" ? "Tutup" : currentLanguage === "ko" ? "닫기" : "Close"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
