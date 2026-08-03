import React, { useState, useEffect } from "react";
import { HeartHandshake, X, Minimize2, Maximize2, RefreshCw, Trophy, Phone, Copy, Check, Volume2 } from "lucide-react";
import { Language } from "../translations";
import BloomChatPanel from "./BloomChatPanel";

interface UrgeQuestModalProps {
  language: Language;
  activeHabit?: string;
}

type ViewStep = "chat" | "better" | "memory_game" | "game_won";

// Audio sound tones for the 6 memory buttons (Frequencies in Hz)
const BUTTON_FREQS = [261.63, 329.63, 392.00, 440.00, 523.25, 587.33];

const BUTTON_STYLES = [
  { bg: "bg-red-500 hover:bg-red-600 border-red-300 shadow-red-500/40", activeBg: "bg-red-300 ring-4 ring-red-300 scale-105" },
  { bg: "bg-emerald-500 hover:bg-emerald-600 border-emerald-300 shadow-emerald-500/40", activeBg: "bg-emerald-300 ring-4 ring-emerald-300 scale-105" },
  { bg: "bg-blue-500 hover:bg-blue-600 border-blue-300 shadow-blue-500/40", activeBg: "bg-blue-300 ring-4 ring-blue-300 scale-105" },
  { bg: "bg-amber-400 hover:bg-amber-500 border-amber-200 shadow-amber-400/40", activeBg: "bg-amber-200 ring-4 ring-amber-200 scale-105" },
  { bg: "bg-purple-500 hover:bg-purple-600 border-purple-300 shadow-purple-500/40", activeBg: "bg-purple-300 ring-4 ring-purple-300 scale-105" },
  { bg: "bg-orange-500 hover:bg-orange-600 border-orange-300 shadow-orange-500/40", activeBg: "bg-orange-300 ring-4 ring-orange-300 scale-105" },
];

export default function UrgeQuestModal({ language, activeHabit = "vape" }: UrgeQuestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [viewStep, setViewStep] = useState<ViewStep>("chat");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);

  // Memory Game States
  const [gameStage, setGameStage] = useState(1); // 1 to 5
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<number[]>([]);
  const [isPlayingPattern, setIsPlayingPattern] = useState(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);
  const [gameStatusText, setGameStatusText] = useState("");
  const [flashError, setFlashError] = useState(false);

  // Freeze background scrolling when modal is open and active
  useEffect(() => {
    if (isOpen && !isMinimized) {
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
  }, [isOpen, isMinimized]);

  // Sound Synthesizer via Web Audio API
  const playTone = (freq: number, duration: number = 0.3) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  };

  // Helper to generate 5 random indices (0..5)
  const generateNewSequence = (): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < 5; i++) {
      seq.push(Math.floor(Math.random() * 6));
    }
    return seq;
  };

  // Start a fresh game
  const startMemoryGame = () => {
    const newSeq = generateNewSequence();
    setTargetSequence(newSeq);
    setGameStage(1);
    setUserInputs([]);
    setViewStep("memory_game");
    playStageSequence(1, newSeq);
  };

  // Play pattern for given stage
  const playStageSequence = async (stageNum: number, sequence: number[]) => {
    setIsPlayingPattern(true);
    setUserInputs([]);
    setGameStatusText(
      language === "ms"
        ? `Peringkat ${stageNum}/5 - Perhatikan & Dengar...`
        : language === "zh"
        ? `阶段 ${stageNum}/5 - 请观察并聆听声音...`
        : language === "ko"
        ? `${stageNum}/5 단계 - 집중해서 듣고 기억하세요...`
        : `Stage ${stageNum}/5 - Watch & Listen carefully...`
    );

    // Give 400ms buffer before playing
    await new Promise((r) => setTimeout(r, 400));

    for (let i = 0; i < stageNum; i++) {
      const btnIdx = sequence[i];
      setActiveButtonIndex(btnIdx);
      playTone(BUTTON_FREQS[btnIdx], 0.35);
      await new Promise((r) => setTimeout(r, 450));
      setActiveButtonIndex(null);
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsPlayingPattern(false);
    setGameStatusText(
      language === "ms"
        ? `Peringkat ${stageNum}/5 - Giliran Anda! Tekan urutan.`
        : language === "zh"
        ? `阶段 ${stageNum}/5 - 轮到您了！按顺序点击。`
        : language === "ko"
        ? `${stageNum}/5 단계 - 당신의 순서입니다! 순서대로 누르세요.`
        : `Stage ${stageNum}/5 - Your Turn! Repeat the sequence.`
    );
  };

  // User clicks a color sound button
  const handleGameButtonClick = (btnIndex: number) => {
    if (isPlayingPattern || viewStep !== "memory_game") return;

    // Flash & Sound
    setActiveButtonIndex(btnIndex);
    playTone(BUTTON_FREQS[btnIndex], 0.25);
    setTimeout(() => setActiveButtonIndex(null), 250);

    const stepIndex = userInputs.length;
    const expected = targetSequence[stepIndex];

    if (btnIndex === expected) {
      const newUserInputs = [...userInputs, btnIndex];
      setUserInputs(newUserInputs);

      // Check if stage is complete
      if (newUserInputs.length === gameStage) {
        if (gameStage < 5) {
          const nextStage = gameStage + 1;
          setGameStage(nextStage);
          setGameStatusText(
            language === "ms"
              ? `Tepat! Sedia untuk Peringkat ${nextStage}/5...`
              : language === "zh"
              ? `正确！准备进入阶段 ${nextStage}/5...`
              : language === "ko"
              ? `정답입니다! ${nextStage}/5 단계 준비...`
              : `Correct! Get ready for Stage ${nextStage}/5...`
          );
          setTimeout(() => playStageSequence(nextStage, targetSequence), 900);
        } else {
          // WON STAGE 5!
          setTimeout(() => {
            setViewStep("game_won");
          }, 500);
        }
      }
    } else {
      // WRONG BUTTON - RESTART FROM STAGE 1 WITH BRAND NEW PATTERN
      playTone(150, 0.5); // Low error buzz
      setFlashError(true);
      setGameStatusText(
        language === "ms"
          ? `❌ Urutan salah! Corak berubah. Bermula semula dari Peringkat 1...`
          : language === "zh"
          ? `❌ 顺序错误！序列已更新，重新从阶段 1 开始...`
          : language === "ko"
          ? `❌ 잘못된 순서입니다! 패턴이 새로 변경되어 1단계부터 다시 시작합니다...`
          : `❌ Wrong sequence! Pattern changed. Restarting from Stage 1...`
      );

      setTimeout(() => {
        setFlashError(false);
        const freshSeq = generateNewSequence();
        setTargetSequence(freshSeq);
        setGameStage(1);
        setUserInputs([]);
        playStageSequence(1, freshSeq);
      }, 1300);
    }
  };

  const buttonText: Record<Language, string> = {
    en: "Urgent",
    ms: "Urgent",
    zh: "Urgent",
    ko: "Urgent",
  };

  const modalTitle: Record<Language, string> = {
    en: "Urgent Button",
    ms: "Butang Kecemasan",
    zh: "紧急按钮",
    ko: "긴급 버튼",
  };

  const subtitleText: Record<Language, string> = {
    en: "Quit-Smoking Counselor & Support Group",
    ms: "Kaunselor & Kumpulan Sokongan",
    zh: "戒烟互助小组与心理咨询",
    ko: "금연 상담사 & 지원 그룹",
  };

  const feelingBetterTitle: Record<Language, string> = {
    en: "🎉 Outstanding Progress!",
    ms: "🎉 Kemajuan Yang Cemerlang!",
    zh: "🎉 优秀的表现！",
    ko: "🎉 대단한 발전입니다!",
  };

  const feelingBetterDesc: Record<Language, string> = {
    en: "You successfully rode the craving wave! Every urge you conquer rewires your brain towards freedom.",
    ms: "Anda berjaya mengatasi gelombang ketagihan! Setiap keinginan yang diatasi menguatkan minda anda.",
    zh: "您成功战胜了这次渴望冲动！每一次的坚持都在重塑更强大的自我。",
    ko: "갈망의 파도를 성공적으로 이겨냈습니다! 충동을 이겨낼 때마다 뇌는 금연 체질로 재배선됩니다.",
  };

  const gameTitle: Record<Language, string> = {
    en: "🧠 Surprise Memory Challenge",
    ms: "🧠 Cabaran Memori Urutan",
    zh: "🧠 记忆序列脑力挑战",
    ko: "🧠 기습 기억력 시퀀스 게임",
  };

  const gameDesc: Record<Language, string> = {
    en: "Complete 5 stages of sound & color sequence to break the brain's nicotine memory loop!",
    ms: "Lengkapkan 5 peringkat urutan warna & bunyi untuk mematikan kitaran ketagihan!",
    zh: "完成5个阶段的声音与颜色序列，彻底冲刷大脑对尼古丁的记忆依赖！",
    ko: "5단계 소리와 색상 기억 게임을 완수하여 갈망 회로를 끊어내세요!",
  };

  const gameWonTitle: Record<Language, string> = {
    en: "🏆 Stage 5 Cleared! Craving Loop Broken!",
    ms: "🏆 Peringkat 5 Selesai! Ketagihan Terputus!",
    zh: "🏆 5个阶段全通关！冲刷渴望成功！",
    ko: "🏆 5단계 완벽 클리어! 갈망 회로 차단 성공!",
  };

  const gameWonDesc: Record<Language, string> = {
    en: "By keeping your focus on all 5 memory stages, you gave your brain enough time to clear the peak craving chemicals naturally!",
    ms: "Dengan memfokuskan ingatan dalam 5 peringkat, anda memberi masa secukupnya untuk dopamin semula jadi meredakan ketagihan!",
    zh: "通过全神贯注地通关5阶段记忆游戏，您成功给予大脑足够的时间自然消退尼古丁渴望高峰！",
    ko: "5단계 기억력 게임에 몰입하는 동안, 뇌가 피크 갈망 화학 물질을 자연스럽게 씻어내었습니다!",
  };

  const hotlineTitle: Record<Language, string> = {
    en: "📞 Official Quitline Support Services",
    ms: "📞 Perkhidmatan Talian Bantuan Berhenti",
    zh: "📞 官方戒烟热线与专业咨询",
    ko: "📞 공식 금연 상담 전화 지원",
  };

  const handleCopyHotline = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleResetToChat = () => {
    setViewStep("chat");
    setChatKey((k) => k + 1);
  };

  const openModal = () => {
    setIsOpen(true);
    setViewStep("chat");
  };

  return (
    <>
      {/* 1. FLOATING URGE BUTTON AT BOTTOM LEFT - PERFECTLY ROUND CIRCLE SHAPE */}
      {!isOpen && !isMinimized && (
        <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-45 select-none">
          <button
            id="urge-button-trigger"
            onClick={openModal}
            className="group w-14 h-14 sm:w-16 sm:h-16 rounded-full aspect-square flex flex-col items-center justify-center p-1.5 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 hover:scale-110 active:scale-95 transition-all duration-300 border-2 sm:border-3 border-red-200 cursor-pointer animate-soft-pulse text-center relative overflow-hidden"
            title={buttonText[language] || buttonText.en}
          >
            <span className="text-base sm:text-lg leading-none mb-0.5">🚨</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-none text-white drop-shadow-xs px-1 text-center truncate max-w-full">
              {buttonText[language] || buttonText.en}
            </span>
          </button>
        </div>
      )}

      {/* 2. MINIMIZED FLOATING BADGE - PERFECTLY ROUND CIRCLE SHAPE */}
      {isMinimized && (
        <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-45 select-none">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full aspect-square flex flex-col items-center justify-center p-1 bg-red-700/95 backdrop-blur-md text-white border-2 border-red-300 shadow-2xl shadow-red-700/40 hover:scale-110 active:scale-95 cursor-pointer transition-all text-center"
            title={buttonText[language] || buttonText.en}
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-300 mb-0.5" />
            <span className="text-[8.5px] font-black leading-none truncate max-w-full px-0.5">Urgent</span>
          </button>
        </div>
      )}

      {/* 3. URGE BUTTON MODAL */}
      {isOpen && !isMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-5 sm:p-7 shadow-2xl border-2 border-rose-100 z-10 my-auto animate-soft-pulse max-h-[92vh] flex flex-col justify-between overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-rose-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-700" />
                    {subtitleText[language] || subtitleText.en}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-black text-stone-900 mt-1 flex items-center gap-2">
                  <span>🚨</span>
                  <span>{modalTitle[language] || modalTitle.en}</span>
                </h3>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-4">
              {viewStep === "chat" && (
                <BloomChatPanel
                  key={chatKey}
                  language={language}
                  activeHabit={activeHabit}
                  onFeelingBetter={() => setViewStep("better")}
                  onStillCraving={startMemoryGame}
                  onLeave={() => setIsOpen(false)}
                />
              )}

              {/* STEP 3A: FEELING BETTER CELEBRATION */}
              {viewStep === "better" && (
                <div className="py-6 px-4 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Trophy className="w-8 h-8 animate-bounce" />
                  </div>

                  <h4 className="text-lg font-serif font-black text-stone-900">
                    {feelingBetterTitle[language] || feelingBetterTitle.en}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto font-medium">
                    {feelingBetterDesc[language] || feelingBetterDesc.en}
                  </p>

                  <button
                    onClick={handleResetToChat}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    Continue chatting
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl transition-all cursor-pointer border-none"
                  >
                    Done & Return to Bloom
                  </button>
                </div>
              )}

              {/* STEP 3B: SURPRISE MEMORY SEQUENCE GAME */}
              {viewStep === "memory_game" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-4 rounded-3xl border border-indigo-100 shadow-xs text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-indigo-600" />
                        Stage {gameStage} / 5
                      </span>

                      {/* Stage Progress Pills */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-all ${
                              s < gameStage
                                ? "bg-emerald-500 scale-110"
                                : s === gameStage
                                ? "bg-indigo-600 animate-pulse ring-2 ring-indigo-300"
                                : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-stone-900 flex items-center justify-center gap-1.5">
                      {gameTitle[language] || gameTitle.en}
                    </h4>

                    <p className="text-[11px] text-stone-600 font-medium">
                      {gameDesc[language] || gameDesc.en}
                    </p>

                    <div
                      className={`p-2.5 rounded-2xl text-xs font-black transition-all ${
                        flashError
                          ? "bg-red-500 text-white animate-bounce"
                          : isPlayingPattern
                          ? "bg-indigo-100 text-indigo-950"
                          : "bg-emerald-100 text-emerald-950"
                      }`}
                    >
                      {gameStatusText}
                    </div>
                  </div>

                  {/* 6 SOUND BUTTONS GRID (CLEAN: NO COLOR NAMES OR PICTURES) */}
                  <div className="grid grid-cols-3 gap-3 p-2 bg-stone-50 rounded-3xl border border-stone-200/80">
                    {BUTTON_STYLES.map((btn, idx) => {
                      const isActive = activeButtonIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isPlayingPattern}
                          onClick={() => handleGameButtonClick(idx)}
                          className={`h-20 sm:h-22 rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer border-2 shadow-md ${
                            isActive ? btn.activeBg : btn.bg
                          } ${isPlayingPattern ? "cursor-not-allowed opacity-90" : "hover:scale-102 active:scale-95"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full transition-all ${isActive ? "bg-white scale-150 animate-ping" : "bg-white/30"}`} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={startMemoryGame}
                      disabled={isPlayingPattern}
                      className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restart Sequence</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: GAME WON - CATCHY & UNDERSTANDABLE WITHIN 5 SECONDS */}
              {viewStep === "game_won" && (
                <div className="space-y-4 animate-fadeIn text-center">
                  <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl space-y-2">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner text-3xl">
                      🎉
                    </div>
                    <h4 className="text-xl font-serif font-black tracking-tight">
                      {language === "ms"
                        ? "KEINGINAN BERJAYA DIATASI!"
                        : language === "zh"
                        ? "战胜渴望！"
                        : language === "ko"
                        ? "갈망 극복 성공!"
                        : "CRAVING CONQUERED!"}
                    </h4>
                    <p className="text-xs font-bold text-emerald-100">
                      {language === "ms"
                        ? "5/5 Peringkat Selesai • Otak Anda Kembali Tenang!"
                        : language === "zh"
                        ? "5/5 阶段全通关 • 大脑已摆脱香烟/电子烟诱惑！"
                        : language === "ko"
                        ? "5/5 단계 완벽 클리어 • 갈망 회로 차단 완료!"
                        : "5/5 Stages Cleared • Brain Craving Cleared!"}
                    </p>
                  </div>

                  {/* QUICK 5-SECOND HELPLINE CALLOUT */}
                  <div className="bg-stone-900 text-white p-4 rounded-3xl text-left space-y-2 shadow-md">
                    <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-amber-300" />
                      <span>{hotlineTitle[language] || hotlineTitle.en}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono font-black">
                      <a
                        href="tel:0388834400"
                        className="bg-stone-800 p-2.5 rounded-xl border border-stone-700 flex flex-col hover:bg-stone-700 transition-colors"
                      >
                        <span className="text-[9px] font-sans font-bold text-stone-400">🇲🇾 Malaysia</span>
                        <span className="text-emerald-400">03-8883 4400</span>
                      </a>
                      <a
                        href="tel:15449030"
                        className="bg-stone-800 p-2.5 rounded-xl border border-stone-700 flex flex-col hover:bg-stone-700 transition-colors"
                      >
                        <span className="text-[9px] font-sans font-bold text-stone-400">🇰🇷 Korea</span>
                        <span className="text-emerald-400">1544-9030</span>
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Done 🌸
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
