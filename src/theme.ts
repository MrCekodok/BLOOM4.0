export type ThemeId = "emerald" | "sunset" | "lavender" | "ocean" | "twilight";

export interface ColorTheme {
  id: ThemeId;
  nameEn: string;
  nameZh: string;
  nameMs: string;
  nameKo: string;
  descEn: string;
  descZh: string;
  descMs: string;
  descKo: string;
  emoji: string;
  previewBg: string;
  previewAccent: string;
  previewSecondary: string;
  isDark?: boolean;
}

export const THEMES: ColorTheme[] = [
  {
    id: "emerald",
    nameEn: "Botanical Emerald & Ocean Blue (Default)",
    nameZh: "翡翠海蓝 (默认)",
    nameMs: "Zamrud & Biru Laut (Lalai)",
    nameKo: "에메랄드 & 오션 블루 (기본)",
    descEn: "Refreshing, harmonious blend of botanical emerald green and serene ocean blue.",
    descZh: "融合植物翡翠绿与柔和海洋蓝的清爽配色，令人身心舒畅。",
    descMs: "Pilihan warna segar yang menggabungkan hijau zamrud dan biru laut yang menenangkan.",
    descKo: "상쾌한 그린 에메랄드와 세련된 오션 블루가 조화롭게 어우러집니다.",
    emoji: "🌿🌊",
    previewBg: "from-emerald-100 via-teal-100 to-sky-200",
    previewAccent: "#0284C7",
    previewSecondary: "#059669"
  },
  {
    id: "ocean",
    nameEn: "Ocean Azure",
    nameZh: "湛蓝海洋",
    nameMs: "Biru Laut Ketenangan",
    nameKo: "오션 아주르",
    descEn: "Refreshing, crisp blue tones that enhance readability, calm the mind & boost focus.",
    descZh: "清爽醒目的海洋湛蓝调，提高界面易读性，舒缓情绪并提升专注力。",
    descMs: "Nada biru laut segar yang meningkatkan kejelasan, menenangkan fikiran & fokus.",
    descKo: "가독성을 높이고 마음을 안정시켜 주는 시원하고 선명한 블루 톤입니다.",
    emoji: "🌊",
    previewBg: "from-blue-100 via-sky-100 to-indigo-200",
    previewAccent: "#0284C7",
    previewSecondary: "#2563EB"
  },
  {
    id: "sunset",
    nameEn: "Warm Sunset & Terracotta",
    nameZh: "暖阳赤陶",
    nameMs: "Matahari Terbenam Warm",
    nameKo: "웜 썬셋 & 테라코타",
    descEn: "Cozy amber, warm sand, and soothing terracotta earth tones for relaxing comfort.",
    descZh: "温暖的琥珀色、沙滩黄与赤陶土色，营造平心静气的温馨氛围。",
    descMs: "Nada ambar hangat, pasir, dan terakota yang memberikan keselesaan dan ketenangan.",
    descKo: "따뜻한 엠버와 샌드, 차분한 테라코타 컬러로 안락함을 선사합니다.",
    emoji: "🌅",
    previewBg: "from-amber-100 via-orange-100 to-rose-200",
    previewAccent: "#C85A32",
    previewSecondary: "#F59E0B"
  },
  {
    id: "lavender",
    nameEn: "Calming Lavender & Iris",
    nameZh: "宁静薰衣草",
    nameMs: "Lavender & Iris Tenang",
    nameKo: "칼밍 라벤더 & 아이리스",
    descEn: "Serene purple and lavender hues known to lower mental stress and calm nerves.",
    descZh: "柔和舒缓的紫罗兰与薰衣草色调，有效舒缓焦虑，安抚情绪。",
    descMs: "Nada ungu dan lavender lembut yang menenangkan fikiran dan mengurangkan tekanan.",
    descKo: "마음의 스트레스를 낮추고 안정을 주는 평온한 라벤더 톤입니다.",
    emoji: "🪻",
    previewBg: "from-purple-100 via-fuchsia-100 to-indigo-200",
    previewAccent: "#7E22CE",
    previewSecondary: "#A855F7"
  },
  {
    id: "twilight",
    nameEn: "Midnight Twilight (Dark)",
    nameZh: "暗夜星空 (深色模式)",
    nameMs: "Malam Senja (Gelap)",
    nameKo: "미드나잇 트와일라잇 (다크)",
    descEn: "Sleek, eye-safe midnight dark canvas with luminous emerald and cyan highlights.",
    descZh: "深沉护眼的夜间暗色主题，搭配荧光绿与高对比度柔光，夜间使用不伤眼。",
    descMs: "Tema gelap malam yang melindungi mata dengan sorotan hijau berasap yang anggun.",
    descKo: "눈이 편안한 미드나잇 다크 테마로 밤에도 편안하게 사용할 수 있습니다.",
    emoji: "🌙",
    previewBg: "from-slate-900 via-slate-800 to-zinc-900",
    previewAccent: "#10B981",
    previewSecondary: "#38BDF8",
    isDark: true
  }
];

export function getStoredTheme(): ThemeId {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("bloom_color_theme") as ThemeId;
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
  }
  return "emerald";
}

export function applyTheme(themeId: ThemeId): void {
  if (typeof document === "undefined") return;
  
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  localStorage.setItem("bloom_color_theme", themeId);
}
