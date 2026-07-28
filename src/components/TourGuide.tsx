import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../translations";
import { 
  Sparkles, 
  X, 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Flower2, 
  ShieldCheck, 
  Globe
} from "lucide-react";

interface TourGuideProps {
  language: Language;
  onLanguageSelect?: (lang: Language) => void;
  isOpen?: boolean;
  onClose?: () => void;
  plantName?: string;
  plantEmoji?: string;
  manualTrigger?: boolean;
  onDismiss?: () => void;
}

export default function TourGuide({
  language,
  onLanguageSelect,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  plantName = "Bloom Guardian Plant",
  plantEmoji = "🌱",
  manualTrigger = false,
  onDismiss,
}: TourGuideProps) {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  // Determine if modal is active from external prop or internal state
  const isControlled = typeof externalIsOpen === "boolean";
  const activeIsOpen = isControlled ? externalIsOpen : internalIsOpen;

  // Freeze background page scrolling when TourGuide / Language / Tutorial modal is open
  useEffect(() => {
    if (activeIsOpen) {
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
  }, [activeIsOpen]);

  useEffect(() => {
    if (manualTrigger) {
      setInternalIsOpen(true);
      setStep(0);
      return;
    }

    if (!isControlled) {
      const seen = localStorage.getItem("bloom_tour_guide_seen");
      if (!seen) {
        const timer = setTimeout(() => {
          setInternalIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [manualTrigger, isControlled]);

  const handleClose = () => {
    setInternalIsOpen(false);
    localStorage.setItem("bloom_tour_guide_seen", "true");
    if (externalOnClose) externalOnClose();
    if (onDismiss) onDismiss();
  };

  const handleOpenManual = () => {
    setStep(0);
    if (isControlled && externalOnClose) {
      // If controlled externally, reset step
      setStep(0);
    } else {
      setInternalIsOpen(true);
    }
  };

  const slidesByLanguage = {
    en: [
      {
        title: "Welcome to Bloom 🌸",
        subtitle: "Your journey to a smoke & vape-free life starts here.",
        description: "Bloom nurtures your habit change with gentle daily check-ins, health quests, and a growing digital tomato plant.",
        highlights: [
          "💧 Daily check-ins water your plant & maintain streak",
          "🍅 Grow your Tomato Plant through 8 healthy stages",
          "🛡️ Earn coins & shields to protect your progress"
        ],
        accentBg: "from-emerald-600 via-teal-600 to-emerald-800",
        isLangPicker: true,
        emoji: "🌸",
      },
      {
        title: "Daily Check-Ins 📅",
        subtitle: "Building momentum one day at a time.",
        description: "Log your status every day in seconds. Record whether you stayed smoke-free or slipped, with complete compassion & zero judgment.",
        highlights: [
          "✨ Maintain your smoke-free streak and earn daily rewards",
          "📝 Identify craving triggers & track habit logs",
          "🪙 Earn coins & XP for every honest check-in"
        ],
        accentBg: "from-teal-600 via-emerald-600 to-teal-800",
        emoji: "📅",
      },
      {
        title: "Tomato Plant & Wither Care 🍅",
        subtitle: "Watch your commitment bloom & stay resilient.",
        description: "Your tomato plant grows as your streak increases. Consuming cigarettes/vape or missing a check-in causes your plant to wither 🍂.",
        highlights: [
          "🌱 Watch your tomato plant grow from seedling to ripe tomatoes",
          "🍂 Smoking/vaping or missing check-ins causes the plant to wither",
          "🪙 Use 20 coins to restore your plant back to full health!"
        ],
        accentBg: "from-emerald-600 via-green-600 to-emerald-800",
        emoji: "🍅",
      },
      {
        title: "Urgent SOS Button 🚨",
        subtitle: "Instant relief when cravings hit hard.",
        description: "Whenever a craving strikes, tap the floating Urgent button for guided 4D box breathing, distraction mini-quests, and fast urge relief.",
        highlights: [
          "🚨 Floating Urgent SOS button accessible anywhere",
          "🫁 4D Box Breathing animation to calm cravings",
          "🧩 Interactive mini-quests to redirect your focus"
        ],
        accentBg: "from-rose-600 via-red-600 to-rose-800",
        emoji: "🚨",
      },
      {
        title: "Quests, Themes & Safety 🔒",
        subtitle: "Personalized tools with 100% privacy.",
        description: "Complete Health Quests to earn bonus coins, switch visual themes, and manage your account safely with local storage.",
        highlights: [
          "🎯 Health Quests to build positive daily habits",
          "🎨 Customize themes & personal avatar anytime",
          "🔐 100% private local data storage with multi-language support"
        ],
        accentBg: "from-emerald-700 via-teal-700 to-emerald-900",
        emoji: "🔒",
      }
    ],
    ms: [
      {
        title: "Selamat Datang ke Bloom 🌸",
        subtitle: "Perjalanan anda ke arah kehidupan bebas rokok & vape bermula di sini.",
        description: "Bloom membimbing perubahan tabiat anda secara lembut melalui pendaftaran harian, misi kesihatan, dan pertumbuhan pokok tomato digital.",
        highlights: [
          "💧 Daftar masuk harian menyiram tumbuhan & mengekalkan rekod",
          "🍅 Tumbuhkan Pokok Tomato anda melalui 8 peringkat",
          "🛡️ Dapatkan syiling & perisai untuk melindungi kemajuan"
        ],
        accentBg: "from-emerald-600 via-teal-600 to-emerald-800",
        isLangPicker: true,
        emoji: "🌸",
      },
      {
        title: "Daftar Masuk Harian 📅",
        subtitle: "Membina momentum satu hari demi satu hari.",
        description: "Catat status anda setiap hari dalam beberapa saat. Pilih sama ada anda bebas merokok/vape atau catat jika terlanjur tanpa sebarang penilaian.",
        highlights: [
          "✨ Kekalkan rekod bebas rokok anda & dapatkan ganjaran harian",
          "📝 Kenal pasti punca ketagihan & jejak tabiat",
          "🪙 Dapatkan syiling & XP setiap kali mendaftar masuk"
        ],
        accentBg: "from-teal-600 via-emerald-600 to-teal-800",
        emoji: "📅",
      },
      {
        title: "Pokok Tomato & Pemulihan Layu 🍅",
        subtitle: "Lihat komitmen anda berkembang & kekal berdaya tahan.",
        description: "Pokok tomato anda membesar mengikut rekod anda. Mengambil rokok/vape atau terlepas daftar masuk semalam akan menyebabkan pokok anda layu 🍂.",
        highlights: [
          "🌱 Lihat pokok tomato berkembang dari benih ke buah ranum",
          "🍂 Merokok/vape atau terlepas daftar masuk menyebabkan pokok layu",
          "🪙 Gunakan 20 syiling untuk memulihkan pokok anda semula sihat!"
        ],
        accentBg: "from-emerald-600 via-green-600 to-emerald-800",
        emoji: "🍅",
      },
      {
        title: "Butang Kecemasan Urgent 🚨",
        subtitle: "Bantuan segera apabila ketagihan melanda.",
        description: "Setiap kali dorongan merokok datang, tekan butang terapung Urgent untuk latihan pernafasan 4D dan permainan alih tumpuan.",
        highlights: [
          "🚨 Butang terapung Urgent SOS boleh diakses bila-bila masa",
          "🫁 Pernafasan 4D untuk menenangkan dorongan",
          "🧩 Misi mini interaktif untuk mengalih fokus"
        ],
        accentBg: "from-rose-600 via-red-600 to-rose-800",
        emoji: "🚨",
      },
      {
        title: "Misi, Tema & Keselamatan 🔒",
        subtitle: "Alat diperibadikan dengan 100% kerahsiaan.",
        description: "Selesaikan Misi Kesihatan untuk bonus syiling, tukar tema visual, dan urus akaun anda secara selamat.",
        highlights: [
          "🎯 Misi Kesihatan untuk membina tabiat positif",
          "🎨 Sesuaikan tema & avatar peribadi bila-bila masa",
          "🔐 Simpanan data tempatan 100% sulit dengan sokongan pelbagai bahasa"
        ],
        accentBg: "from-emerald-700 via-teal-700 to-emerald-900",
        emoji: "🔒",
      }
    ],
    zh: [
      {
        title: "欢迎来到 Bloom 🌸",
        subtitle: "开启无烟/无电子烟健康生活的起点。",
        description: "Bloom 通过每日打卡、健康任务与番茄植物培育，陪伴您轻松戒烟。",
        highlights: [
          "💧 每日打卡浇水，积累戒烟连胜天数",
          "🍅 培育番茄植物，体验 8 个健康生长阶段",
          "🛡️ 赢取金币与保护盾，守护您的连续记录"
        ],
        accentBg: "from-emerald-600 via-teal-600 to-emerald-800",
        isLangPicker: true,
        emoji: "🌸",
      },
      {
        title: "每日打卡 📅",
        subtitle: "积少成多，见证每日改变。",
        description: "几秒钟轻松打卡。记录今日是否保持无烟，诚实面对自我，零压力零批判。",
        highlights: [
          "✨ 保持戒烟连胜天数，获取每日奖励",
          "📝 记录烟瘾触发因素与戒烟心得",
          "🪙 每次真实打卡均可获得金币与经验值"
        ],
        accentBg: "from-teal-600 via-emerald-600 to-teal-800",
        emoji: "📅",
      },
      {
        title: "番茄植物与枯萎复原 🍅",
        subtitle: "倾注坚持，见证复苏。",
        description: "番茄植物随戒烟天数生长。若吸烟/电子烟或漏打卡，植物将枯萎 🍂。",
        highlights: [
          "🌱 见证番茄从发芽到结出累累硕果",
          "🍂 吸烟/电子烟或错过昨日打卡会导致植物枯萎",
          "🪙 使用 20 金币即可复原植物，重获健康生机！"
        ],
        accentBg: "from-emerald-600 via-green-600 to-emerald-800",
        emoji: "🍅",
      },
      {
        title: "紧急 Urgent SOS 按钮 🚨",
        subtitle: "烟瘾来袭时的即时心理救助。",
        description: "每当渴望产生时，点击悬浮的 Urgent 紧急按钮，开启 4D 箱式呼吸与解压小练习。",
        highlights: [
          "🚨 随时可用的 Urgent 悬浮紧急 SOS 按钮",
          "🫁 4D 动画引导箱式深呼吸平静烟瘾",
          "🧩 趣味解压任务快速转移注意力"
        ],
        accentBg: "from-rose-600 via-red-600 to-rose-800",
        emoji: "🚨",
      },
      {
        title: "健康任务、主题与安全 🔒",
        subtitle: "个性化功能与 100% 隐私保护。",
        description: "完成健康任务赚取金币，随意切换主题风格，所有数据均在本地安全存储。",
        highlights: [
          "🎯 健康任务建立积极习惯",
          "🎨 随时自定义外观主题与个人头像",
          "🔐 100% 本地隐私存储，支持多语言"
        ],
        accentBg: "from-emerald-700 via-teal-700 to-emerald-900",
        emoji: "🔒",
      }
    ],
    ko: [
      {
        title: "블룸에 오신 것을 환영합니다 🌸",
        subtitle: "담배/베이핑 없는 건강한 삶을 위한 시작.",
        description: "Bloom은 일일 출석 체크, 건강 퀘스트, 토마토 식물 성장을 통해 금연 성공을 돕습니다.",
        highlights: [
          "💧 일일 출석으로 식물에 물주고 연속 기록 유지",
          "🍅 8단계 건강 성장 과정의 토마토 식물 키우기",
          "🛡️ 코인과 방어막으로 연속 기록 보호"
        ],
        accentBg: "from-emerald-600 via-teal-600 to-emerald-800",
        isLangPicker: true,
        emoji: "🌸",
      },
      {
        title: "일일 출석 체크 📅",
        subtitle: "매일 매일 쌓여가는 금연 성취감.",
        description: "몇 초 만에 출석을 완료하세요. 압박감 없이 솔직하게 금연 상태를 기록합니다.",
        highlights: [
          "✨ 금연 연속 기록 유지 및 일일 보상 획득",
          "📝 흡연 욕구 원인 분석 및 습관 기록",
          "🪙 솔직한 출석체크마다 코인과 XP 획득"
        ],
        accentBg: "from-teal-600 via-emerald-600 to-teal-800",
        emoji: "📅",
      },
      {
        title: "토마토 식물 & 시듦 복원 🍅",
        subtitle: "금연 노력의 결실과 회복력.",
        description: "연속 기록에 따라 토마토 식물이 성장합니다. 흡연/베이핑을 하거나 어제 출석을 놓치면 식물이 시듭니다 🍂.",
        highlights: [
          "🌱 새싹부터 정성껏 자라나는 토마토 식물",
          "🍂 흡연 또는 출석 미완료 시 식물이 시듦",
          "🪙 20 코인으로 식물을 다시 건강하게 복원!"
        ],
        accentBg: "from-emerald-600 via-green-600 to-emerald-800",
        emoji: "🍅",
      },
      {
        title: "긴급 Urgent SOS 버튼 🚨",
        subtitle: "갑작스러운 흡연 욕구 즉시 완화.",
        description: "흡연 욕구가 생기면 화면 상의 Urgent SOS 버튼을 눌러 4D 박스 호흡과 전환 미션을 시작하세요.",
        highlights: [
          "🚨 언제나 이용 가능한 Urgent 플로팅 SOS 버튼",
          "🫁 욕구를 진정시키는 4D 박스 호흡법",
          "🧩 주의를 환기하는 재미있는 미니 퀘스트"
        ],
        accentBg: "from-rose-600 via-red-600 to-rose-800",
        emoji: "🚨",
      },
      {
        title: "퀘스트, 테마 & 보안 🔒",
        subtitle: "100% 개인정보 보호와 맞춤 기능.",
        description: "건강 퀘스트로 보너스 코인을 얻고, 테마를 변경하며, 안전한 기기 내 저장으로 개인정보를 보호하세요.",
        highlights: [
          "🎯 건강 퀘스트로 좋은 습관 형성",
          "🎨 언제든지 테마와 프로필 아바타 변경",
          "🔐 100% 기기 내 로컬 저장 및 다국어 지원"
        ],
        accentBg: "from-emerald-700 via-teal-700 to-emerald-900",
        emoji: "🔒",
      }
    ]
  };

  const slides = slidesByLanguage[language] || slidesByLanguage.en;
  const currentSlide = slides[step] || slides[0];
  const isLast = step === slides.length - 1;

  const navLabels = {
    en: { prev: "Back", next: "Next Step", start: "Get Started! 🌱", skip: "Skip" },
    ms: { prev: "Kembali", next: "Seterusnya", start: "Mula Sekarang! 🌱", skip: "Langkah" },
    zh: { prev: "上一步", next: "下一步", start: "开启无烟之旅！🌱", skip: "跳过" },
    ko: { prev: "이전", next: "다음 단계", start: "시작하기! 🌱", skip: "건너뛰기" },
  }[language] || { prev: "Back", next: "Next Step", start: "Get Started! 🌱", skip: "Skip" };

  return (
    <>
      {/* Main Tour Modal Overlay */}
      {activeIsOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-md animate-fade-in select-none overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col relative max-h-[90vh] my-auto">
            
            {/* Top Banner with Dynamic Accent Gradient */}
            <div className={`p-6 sm:p-8 bg-gradient-to-br ${currentSlide.accentBg} text-white relative flex flex-col items-center text-center transition-all duration-500`}>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/15 hover:bg-black/25 p-2 rounded-full cursor-pointer transition-all border-none"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full mb-3 text-white border border-white/20">
                {step + 1} / {slides.length}
              </span>

              <motion.div
                key={`emoji-${step}`}
                initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg mb-3 border border-white/30"
              >
                {currentSlide.emoji}
              </motion.div>

              <motion.h3
                key={`title-${step}`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-serif font-black tracking-tight drop-shadow-xs"
              >
                {currentSlide.title}
              </motion.h3>

              <p className="text-xs text-white/90 font-medium mt-1 max-w-xs leading-snug">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-7 space-y-4 overflow-y-auto max-h-[60vh] sm:max-h-[65vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`body-${step}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {currentSlide.description}
                  </p>

                  {/* Interactive Language Selector on Step 1 */}
                  {currentSlide.isLangPicker && onLanguageSelect && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Select Preferred Language</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { code: "en" as Language, label: "English 🇬🇧" },
                          { code: "ms" as Language, label: "Bahasa Melayu 🇲🇾" },
                          { code: "zh" as Language, label: "中文 🇨🇳" },
                          { code: "ko" as Language, label: "한국어 🇰🇷" },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => onLanguageSelect(lang.code)}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-left flex items-center justify-between ${
                              language === lang.code
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-emerald-50 hover:border-emerald-300"
                            }`}
                          >
                            <span>{lang.label}</span>
                            {language === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature Highlights List */}
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 space-y-2">
                    {currentSlide.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots Indicator */}
              <div className="flex justify-center items-center gap-2 pt-1">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStep(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === step ? "w-8 bg-emerald-600" : "w-2 bg-stone-200 hover:bg-stone-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Footer Navigation Controls */}
            <div className="p-4 sm:px-7 bg-stone-50/90 border-t border-stone-100 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep((prev) => prev - 1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 cursor-pointer transition-all flex items-center gap-1 border-none shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{navLabels.prev}</span>
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="text-xs text-stone-400 hover:text-stone-600 font-bold cursor-pointer bg-transparent border-none px-2"
                >
                  {navLabels.skip}
                </button>
              )}

              {isLast ? (
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 ml-auto border-none"
                >
                  <Flower2 className="w-4 h-4" />
                  <span>{navLabels.start}</span>
                </button>
              ) : (
                <button
                  onClick={() => setStep((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 ml-auto border-none"
                >
                  <span>{navLabels.next}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
