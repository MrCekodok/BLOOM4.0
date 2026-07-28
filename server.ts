import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import webPush from "web-push";

dotenv.config();

const DB_FILE = process.env.VERCEL
  ? path.join("/tmp", "bloom-db.json")
  : path.join(process.cwd(), "bloom-db.json");

// Helper to load database
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: {}, userData: {} };
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, returning empty", err);
    return { users: {}, userData: {} };
  }
}

// Helper to save database
function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Hand-crafted fallback solutions in case Gemini API is not configured or fails
function getFallbackSolution(habit: string, reason: string, lang: string = "en"): string {
  const rawTrigger = (reason || "").trim();
  const trigger = rawTrigger ? `"${rawTrigger}"` : "this trigger";
  const lower = rawTrigger.toLowerCase();

  const isStress = /stress|anxiety|exam|work|pressure|angry|anger|tekanan|stres|学业|压力|考试|工作|生气|怒|스트레스|시험|업무/.test(lower);
  const isBored = /bored|boredom|idle|free|nothing|bosan|无聊|空闲|지루|심심/.test(lower);
  const isSocial = /friend|peer|party|social|club|rakan|kawan|pesta|朋友|聚会|同辈|社交|친구|모임|술자리/.test(lower);
  const isMeal = /meal|eat|food|coffee|makan|kopi|饭|吃|咖啡|식사|커피|밥/.test(lower);

  if (lang === "ms") {
    if (isStress) {
      return `### 🩺 Bimbingan Pemulihan Pakar (Tekanan)

**Punca**: Dicetuskan oleh ${trigger}.

**🎯 Tindakan Masa Hadapan Khusus**:
Apabila ${trigger} berlaku lagi, lakukan rutin tindakan ini serta-merta:
1. Alirkan air sejuk pada pergelangan tangan anda selama 30 saat.
2. Lakukan 4 kali pernafasan dalam (tarik 4s, tahan 7s, hembus 8s) sebelum membuat sebarang keputusan.

**💡 Mengapa Ia Berkesan (Mekanisme Sains)**:
Air sejuk pada titik nadi merangsang *mammalian dive reflex* sementara pernafasan 4-7-8 mengaktifkan saraf vagus. Ini menurunkan hormon kortisol dan kadar degupan jantung dalam masa 45 saat untuk menghapuskan keinginan nikotin akibat tekanan.`;
    }
    if (isBored) {
      return `### 🩺 Bimbingan Pemulihan Pakar (Kebosanan)

**Punca**: Dicetuskan oleh ${trigger}.

**🎯 Tindakan Masa Hadapan Khusus**:
Apabila rasa bosan melanda, gantikan tabiat dengan rutin fizikal aktif:
1. Serta-merta capai bola tekanan atau lakoni senaman regangan 2 minit.
2. Minum segelas air sejuk bersaiz besar untuk mengaktifkan deria mulut.

**💡 Mengapa Ia Berkesan (Mekanisme Sains)**:
Keinginan semasa bosan berpunca daripada penurunan paras dopamin secara mendadak. Pergerakan fizikal dan rangsangan deria merangsang pembebasan dopamin semula jadi, menggantikan pergerakan tangan-ke-mulut.`;
    }
    if (isSocial) {
      return `### 🩺 Bimbingan Pemulihan Pakar (Pengaruh Sosial)

**Punca**: Dicetuskan oleh ${trigger}.

**🎯 Tindakan Masa Hadapan Khusus**:
Apabila berada dalam situasi sosial dengan perokok/vaper lain:
1. Pegang minuman sejuk di tangan dominan anda (tangan yang biasa digunakan untuk memegang vape/rokok).
2. Sediakan ayat penolakan mesra: *"Saya sedang merehatkan paru-paru saya hari ini."*

**💡 Mengapa Ia Berkesan (Mekanisme Sains)**:
Menempati tangan dominan menghalang pergerakan automatik capai rokok, manakala cecair sejuk memberi rangsangan deria yang menekan dorongan fiksat mulut.`;
    }
    if (isMeal) {
      return `### 🩺 Bimbingan Pemulihan Pakar (Selepas Makan/Kopi)

**Punca**: Dicetuskan oleh ${trigger}.

**🎯 Tindakan Masa Hadapan Khusus**:
Serta-merta selepas selesai makan atau minum kopi:
1. Berus gigi dengan ubat gigi pudina kuat atau kunyah gula-gula getah pudina tebal.
2. Basuh muka dengan air sejuk untuk menukar keadaan deria.

**💡 Mengapa Ia Berkesan (Mekanisme Sains)**:
Pudina kuat mengubah reseptor rasa di mulut, menamatkan ritual pemakanan dan menjadikan rasa asap rokok atau vape menjadi sangat tidak menyenangkan.`;
    }

    return `### 🩺 Bimbingan Pemulihan Pakar

**Punca**: Dicetuskan oleh ${trigger}.

**🎯 Tindakan Masa Hadapan Khusus**:
Apabila ${trigger} berlaku lagi, jalankan **Peraturan Tangguh 5 Minit**:
1. Minum 200ml air sejuk dan kunyah pudina.
2. Tetapkan pemasa 5 minit sebelum mengambil sebarang tindakan.

**💡 Mengapa Ia Berkesan (Mekanisme Sains)**:
Gelombang keinginan nikotin fizikal mencapai puncaknya hanya selama 3 hingga 5 minit. Menangguh dengan rangsangan deria membolehkan gelombang ketagihan surut secara semula jadi tanpa tewas.`;
  }

  if (lang === "zh") {
    if (isStress) {
      return `### 🩺 戒烟与尼古丁戒断专家指导（针对压力）

**触发分析**：因 ${trigger} 产生欲望是典型的压力源神经应激反应。

**🎯 具体未来应对行动**：
下次当 ${trigger} 再次带来压力时，请立即执行以下预设流程：
1. 立即用冷水冲洗双手手腕 30 秒。
2. 进行 4 次 4-7-8 腹式深呼吸（吸气4秒，憋气7秒，呼气8秒）。

**💡 作用原理（为何有效）**：
冷水刺激手腕脉搏处能激活“哺乳动物潜水反射”，结合深呼吸可直接刺激迷走神经，在 45 秒内快速降低皮质醇（压力激素）与心率，从生理根源切断压力引发的吸烟冲动。`;
    }
    if (isBored) {
      return `### 🩺 戒烟与尼古丁戒断专家指导（针对无聊）

**触发分析**：因 ${trigger} 产生欲望是多巴胺水平下降引发的寻激反应。

**🎯 具体未来应对行动**：
下一次感觉无聊闲暇时，请立刻替代习惯动作：
1. 立即握紧握力器或打理桌面，进行 2 分钟身体站立拉伸。
2. 大口喝一杯冰水，激活口腔感官神经。

**💡 作用原理（为何有效）**：
无聊渴望源于脑内多巴胺短暂匮乏。肢体拉伸与感官刺激能促进自然多巴胺释放，重组神经通路，完美替代“手到嘴”的习惯性机械动作。`;
    }
    if (isSocial) {
      return `### 🩺 戒烟与尼古丁戒断专家指导（针对社交）

**触发分析**：因 ${trigger} 产生欲望受环境暗示与镜像神经元诱发。

**🎯 具体未来应对行动**：
下次处于社交或同辈聚会环境时：
1. 用您的主导手（习惯拿烟的手）全程握住一杯冰镇饮料。
2. 提前预设一句礼貌且明确的拒绝语：“我最近在清理肺部，喝冰水挺舒服。”

**💡 作用原理（为何有效）**：
占用主导手能从物理层面阻断无意识拿烟的肌肉记忆，而冰镇液体的口感刺激能有效抑制口唇期渴望。`;
    }
    if (isMeal) {
      return `### 🩺 戒烟与尼古丁戒断专家指导（针对饭后/习惯）

**触发分析**：因 ${trigger} 产生的欲望属于强化的巴甫洛夫习惯条件反射。

**🎯 具体未来应对行动**：
用餐或喝完咖啡结束后：
1. 立即使用强效薄荷牙膏刷牙，或口服嚼一片强薄荷口香糖。
2. 用凉水漱口并离开餐桌。

**💡 作用原理（为何有效）**：
强效薄荷能重置口腔味觉受体，向大脑发出明确的“进食结束”信号，且薄荷味与烟草/电子烟混合会产生不适味觉，阻断联想。`;
    }

    return `### 🩺 戒烟与尼古丁戒断专家指导

**触发分析**：因 ${trigger} 产生欲望是常见的神经反射。

**🎯 具体未来应对行动**：
当 ${trigger} 再次发生时，请启动 **5 分钟延迟法则**：
1. 大口饮用 200ml 冰水，嚼一片薄荷口香糖。
2. 设定 5 分钟倒计时，在此期间进行注意力转移小练习。

**💡 作用原理（为何有效）**：
尼古丁急性生理渴望的波峰仅持续 3 到 5 分钟。通过冰水感官刺激与倒计时延迟，能让冲动波峰自行自然消退。`;
  }

  if (lang === "ko") {
    if (isStress) {
      return `### 🩺 금연 전문가 맞춤 가이드 (스트레스)

**유발 분석**: ${trigger}(으)로 인한 욕구는 대표적인 자율신경계 응급 반응입니다.

**🎯 구체적 미래 예방 행동**:
향후 ${trigger} 상황으로 스트레스가 발생하면 다음 2단계 플랜을 가동하세요:
1. 즉시 찬물로 양 손목을 30초간 적십니다.
2. 4-7-8 복식 호흡(4초 흡입, 7초 멈춤, 8초 내쉼)을 4회 실시하세요.

**💡 작용 원리 (효과적인 이유)**:
손목의 찬물 자극은 '포유류 잠수 반사'를 일으키고, 깊은 호흡은 미교감 미공 신경을 자극합니다. 이는 45초 이내에 스트레스 호르몬(코르티솔)과 심박수를 떨어뜨려 스트레스성 갈망을 생리학적으로 차단합니다.`;
    }
    if (isBored) {
      return `### 🩺 금연 전문가 맞춤 가이드 (지루함)

**유발 분석**: ${trigger}(으)로 인한 갈망은 도파민 저하로 인한 자극 탐색 반응입니다.

**🎯 구체적 미래 예방 행동**:
지루함이나 공허함이 느껴질 때 즉시 행동을 전환하세요:
1. 손에 스트레스 볼을 쥐거나 2분간 일어서서 기지개를 켜세요.
2. 시원한 물 한 잔을 마셔 구강 감각을 깨우세요.

**💡 작용 원리 (효과적인 이유)**:
지루함은 뇌의 도파민 부족 신호입니다. 가벼운 운동과 촉각 자극은 천연 도파민 분비를 촉진하여 손-입 행동 루틴을 완벽히 대체합니다.`;
    }
    if (isSocial) {
      return `### 🩺 금연 전문가 맞춤 가이드 (주변 권유/모임)

**유발 분석**: ${trigger} 환경에서의 욕구는 거울 신경원과 환경적 자극 때문입니다.

**🎯 구체적 미래 예방 행동**:
흡연자가 있는 모임이나 자리에 참석할 때:
1. 자주 쓰는 손에 찬 음료 컵을 꼭 쥐고 계세요.
2. 거절 멘트를 미리 준비하세요: *"요즘 폐 건강 관리 중이라 시원한 물 마시는 게 더 좋아요."*

**💡 작용 원리 (효과적인 이유)**:
자주 쓰는 손을 사전 점유하면 무의식적인 흡연 동작을 물리적으로 차단하며, 찬 음료 감각이 구강 자극 욕구를 가라앉힙니다.`;
    }
    if (isMeal) {
      return `### 🩺 금연 전문가 맞춤 가이드 (식후/커피)

**유발 분석**: ${trigger} 후의 욕구는 조건 반사로 형성된 습관 루틴입니다.

**🎯 구체적 미래 예방 행동**:
식사나 커피를 마신 즉시:
1. 강한 민트 향 치약으로 양치질을 하거나 민트 껌을 씹으세요.
2. 식탁에서 즉시 일어나 장소를 이동하세요.

**💡 작용 원리 (효과적인 이유)**:
강한 민트 향은 미각 수용체를 변화시켜 뇌에 식사 완료 신호를 보내며, 담배/베이핑 맛을 불쾌하게 만들어 습관 연결 고리를 끊어냅니다.`;
    }

    return `### 🩺 금연 전문가 맞춤 가이드

**유발 분석**: ${trigger}(으)로 인한 욕구는 일시적인 신경 반응입니다.

**🎯 구체적 미래 예방 행동**:
향후 ${trigger} 상황이 오면 **5분 지연 법칙**을 실행하세요:
1. 찬물 200ml를 마시고 민트 껌을 씹으세요.
2. 5분 타이머를 설정하고 호흡을 가다듬으세요.

**💡 작용 원리 (효과적인 이유)**:
니코틴 갈망의 생리학적 최고조는 3분~5분 내에 자연적으로 소멸합니다. 감각 자극과 함께 시간을 지연시키면 갈망 파도가 자연스럽게 가라앉습니다.`;
  }

  // English default
  if (isStress) {
    return `### 🩺 Clinical Cessation Advisory (Stress)

**Trigger Analysis**: Cravings triggered by ${trigger} are acute physiological stress responses.

**🎯 Specific Future Action**:
When ${trigger} creates stress next time, execute this immediate 2-step routine:
1. Run cold water over both wrists for 30 seconds.
2. Perform 4 cycles of 4-7-8 diaphragmatic breathing (inhale 4s, hold 7s, exhale 8s).

**💡 Why It Works (Scientific Mechanism)**:
Cold water on wrist pulse points triggers the mammalian dive reflex while 4-7-8 breathing directly stimulates the vagus nerve. This drops cortisol and heart rate within 45 seconds to neutralize stress-induced cravings at the physiological level.`;
  }
  if (isBored) {
    return `### 🩺 Clinical Cessation Advisory (Boredom)

**Trigger Analysis**: Cravings caused by ${trigger} stem from a temporary dip in dopamine.

**🎯 Specific Future Action**:
When boredom or idle time strikes next:
1. Immediately squeeze a stress ball or perform a 2-minute standing stretch.
2. Drink a large glass of ice-cold water to engage oral sensory nerves.

**💡 Why It Works (Scientific Mechanism)**:
Physical movement and tactile stimulation trigger natural dopamine release, replacing the hand-to-mouth motor routine and satisfying the brain's search for stimulation.`;
  }
  if (isSocial) {
    return `### 🩺 Clinical Cessation Advisory (Social/Peer)

**Trigger Analysis**: Cravings around ${trigger} are triggered by mirror neurons and social cues.

**🎯 Specific Future Action**:
When in social settings or around other smokers/vapers:
1. Hold a cold iced beverage in your dominant hand (the hand you normally use to hold a vape or cigarette).
2. Use a friendly pre-planned line: *"I'm resetting my lungs today with cold water!"*

**💡 Why It Works (Scientific Mechanism)**:
Occupying your dominant hand physically prevents automatic reaching habit loops, while cold liquid provides oral sensory feedback that dampens craving intensity.`;
  }
  if (isMeal) {
    return `### 🩺 Clinical Cessation Advisory (Post-Meal/Routine)

**Trigger Analysis**: Cravings after ${trigger} are conditioned Pavlovian habit loops.

**🎯 Specific Future Action**:
Immediately after finishing your meal or beverage:
1. Brush your teeth with strong peppermint toothpaste or chew a strong mint gum.
2. Stand up and step away from the dining table.

**💡 Why It Works (Scientific Mechanism)**:
Strong menthol alters oral taste receptors, signaling to the brain that the meal ritual is complete, while creating an unpalatable taste contrast with nicotine.`;
  }

  return `### 🩺 Clinical Cessation Advisory

**Trigger Analysis**: Cravings triggered by ${trigger} are standard neural habit responses.

**🎯 Specific Future Action**:
When ${trigger} occurs in the future, activate the **5-Minute Delay Rule**:
1. Drink 200ml of ice-cold water and chew a mint.
2. Set a 5-minute timer before making any choice.

**💡 Why It Works (Scientific Mechanism)**:
Physical nicotine cravings peak in intensity for only 3 to 5 minutes. Delaying with sensory input allows the chemical craving wave to naturally collapse without giving in.`;
}

function createApp() {
  const app = express();

  // Ensure VAPID keys on startup
  const startupDb = loadDB();
  if (!startupDb.vapidKeys) {
    try {
      startupDb.vapidKeys = webPush.generateVAPIDKeys();
      saveDB(startupDb);
      console.log("Generated and saved new VAPID keys on startup.");
    } catch (err) {
      console.error("Error generating VAPID keys on startup:", err);
    }
  }

  if (startupDb.vapidKeys) {
    webPush.setVapidDetails(
      "mailto:amberchai717@gmail.com",
      startupDb.vapidKeys.publicKey,
      startupDb.vapidKeys.privateKey
    );
  }

  app.use(express.json());

  // API endpoints FIRST

  // 1. SIGNUP ENDPOINT
  app.post("/api/auth/signup", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const db = loadDB();
    const key = username.toLowerCase().trim();

    if (db.users[key]) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Save password
    db.users[key] = password;
    db.userData[key] = { logs: [], journals: [] };
    saveDB(db);

    res.json({ success: true, username: username.trim() });
  });

  // 2. LOGIN ENDPOINT
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const db = loadDB();
    const key = username.toLowerCase().trim();

    if (!db.users[key] || db.users[key] !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Retrieve synced data
    const userPayload = db.userData[key] || { logs: [], journals: [], seedType: "" };
    res.json({
      success: true,
      username: username.trim(),
      logs: userPayload.logs || [],
      journals: userPayload.journals || [],
      seedType: userPayload.seedType || "",
      notificationSettings: userPayload.notificationSettings || null
    });
  });

  // 3. SYNC PUSH ENDPOINT
  app.post("/api/sync/push", (req, res) => {
    const { username, logs, journals, seedType } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = loadDB();
    const key = username.toLowerCase().trim();

    if (!db.users[key]) {
      return res.status(404).json({ error: "User not found" });
    }

    // Store user data
    db.userData[key] = {
      logs: logs || [],
      journals: journals || [],
      seedType: seedType || "",
      notificationSettings: db.userData[key]?.notificationSettings || null
    };
    saveDB(db);

    res.json({ success: true });
  });

  // 4. SYNC PULL ENDPOINT
  app.post("/api/sync/pull", (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = loadDB();
    const key = username.toLowerCase().trim();

    if (!db.users[key]) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPayload = db.userData[key] || { logs: [], journals: [], seedType: "" };
    res.json({
      success: true,
      logs: userPayload.logs || [],
      journals: userPayload.journals || [],
      seedType: userPayload.seedType || "",
      notificationSettings: userPayload.notificationSettings || null
    });
  });

  // 5. NOTIFICATION ENDPOINTS
  app.get("/api/notifications/vapid-public-key", (req, res) => {
    const db = loadDB();
    if (db.vapidKeys && db.vapidKeys.publicKey) {
      res.json({ publicKey: db.vapidKeys.publicKey });
    } else {
      res.status(500).json({ error: "VAPID keys not configured" });
    }
  });

  app.post("/api/notifications/subscribe", (req, res) => {
    const { username, subscription, enabled, time, timezone } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = loadDB();
    const key = username.toLowerCase().trim();

    if (!db.users[key]) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!db.userData[key]) {
      db.userData[key] = { logs: [], journals: [] };
    }

    db.userData[key].notificationSettings = {
      enabled: enabled !== undefined ? enabled : true,
      time: time || "19:00",
      timezone: timezone || "UTC",
      subscription: subscription || db.userData[key]?.notificationSettings?.subscription || null,
      lastSentDate: db.userData[key]?.notificationSettings?.lastSentDate || ""
    };

    saveDB(db);
    res.json({ success: true, settings: db.userData[key].notificationSettings });
  });

  app.post("/api/notifications/get-settings", (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = loadDB();
    const key = username.toLowerCase().trim();

    if (!db.users[key]) {
      return res.status(404).json({ error: "User not found" });
    }

    const settings = db.userData[key]?.notificationSettings || {
      enabled: false,
      time: "19:00",
      timezone: "UTC",
      subscription: null
    };

    res.json({ success: true, settings });
  });

  app.post("/api/notifications/test-send", async (req, res) => {
    const { username, subscription } = req.body;
    if (!username && !subscription) {
      return res.status(400).json({ error: "Username or subscription required" });
    }

    let sub = subscription;
    if (!sub && username) {
      const db = loadDB();
      const key = username.toLowerCase().trim();
      sub = db.userData[key]?.notificationSettings?.subscription;
    }

    if (!sub) {
      return res.status(404).json({ error: "No subscription found to test" });
    }

    const payload = JSON.stringify({
      title: "Bloom Test 🌸",
      body: "🌱 Testing, testing! Your Bloom reminders are ready to help you thrive.",
      data: { url: "/" }
    });

    try {
      await webPush.sendNotification(sub, payload);
      res.json({ success: true, message: "Test notification sent successfully" });
    } catch (err: any) {
      console.error("Error sending test notification:", err);
      res.status(500).json({ error: "Failed to send notification", details: err.message });
    }
  });

  app.post("/api/bloom-solution", async (req, res) => {
    try {
      const { habit, reason, lang } = req.body;
      if (!habit || !reason) {
        return res.status(400).json({ error: "Missing habit or reason" });
      }

      const selectedLang = lang || "en";
      const langNameMap: Record<string, string> = {
        en: "English",
        ms: "Malay (Bahasa Melayu)",
        zh: "Simplified Chinese (简体中文)",
        ko: "Korean (한국어)",
      };
      const languageName = langNameMap[selectedLang] || "English";

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.log("Gemini API key is not configured or is default placeholder. Serving fallback advice.");
        return res.json({
          solution: getFallbackSolution(habit, reason, selectedLang),
          isFallback: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a certified Tobacco and Nicotine Cessation Specialist.

The user logged that they consumed or felt a craving for "${habit}" today due to this specific trigger:
"${reason}"

Write a concise, highly specific, and actionable clinical cessation guidance in "${languageName}".

REQUIRED STRUCTURE IN MARKDOWN:
1. **🩺 Trigger Analysis**: Briefly analyze "${reason}" as a recognized neural trigger.
2. **🎯 Specific Future Action**: Provide 1-2 VERY SPECIFIC, practical, and realistic replacement steps designed specifically for "${reason}" when it happens again in the future.
3. **💡 Why It Works (Scientific Mechanism)**: Explain in 1-2 short sentences WHY this specific action works scientifically/neurologically to reduce cravings or interrupt the nicotine habit loop (e.g. vagus nerve stimulation, dopamine regulation, motor substitution, cognitive reframing).

Keep the entire text around 50-70 words total, structured, readable, and highly actionable.
`;

      let systemInstruction = "You are a certified Tobacco and Nicotine Cessation Specialist. You provide expert, compassionate, concise advice focusing on a trigger-specific future action and the scientific reason why it works.";
      if (selectedLang === "ms") {
        systemInstruction = "Anda adalah Pakar Penghentian Merokok dan Nikotin bertauliah. Anda memberikan nasihat terperinci dengan tindakan masa hadapan yang khusus mengikut pencetus dan penjelasan sains mengapa ia berkesan.";
      } else if (selectedLang === "zh") {
        systemInstruction = "您是一位持证戒烟与尼古丁戒断专家。您提供专业、具体的指导，重点提供针对具体诱因的未来应对行动，并解释其为何在科学上有效的原理解析。";
      } else if (selectedLang === "ko") {
        systemInstruction = "당신은 공인 금연 및 니코틴 중단 전문가입니다. 유발 원인에 특화된 구체적 미래 예방 행동과 이것이 효과적인 과학적 작용 원리를 명확히 제시합니다.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text || "I'm right here with you, and you are doing so well. Let's take it one step at a time.";
      res.json({ solution: text, isFallback: false });
    } catch (error: any) {
      console.error("Error generating solution:", error);
      res.json({
        solution: getFallbackSolution(req.body.habit || "vape", req.body.reason || "", req.body.lang || "en"),
        isFallback: true,
        error: error.message
      });
    }
  });

  // 6. URGE BUTTON COUNSELOR ENDPOINT
  app.post("/api/urge-quest", async (req, res) => {
    try {
      const { habit, reason, lang } = req.body;
      const selectedLang = lang || "en";
      const habitName = habit === "cigarettes" ? "cigarettes" : "vaping";
      const userReason = (reason || "").trim();
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.json({ 
          solution: getFallbackSolution(habitName, userReason, selectedLang), 
          isFallback: true 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const langNameMap: Record<string, string> = {
        en: "English",
        ms: "Malay (Bahasa Melayu)",
        zh: "Simplified Chinese",
        ko: "Korean",
      };
      const languageName = langNameMap[selectedLang] || "English";

      const prompt = `You are a warm, empathetic quit-smoking and quit-vaping counselor and support group leader for teenagers and young adults.

The user shared why they feel an urge to ${habitName} right now:
"${userReason || "I feel a strong craving and urge to vape or smoke right now."}"

Please write a supportive, non-judgmental, and comforting counselor response in Markdown, strictly in "${languageName}".

CRITICAL BREVITY REQUIREMENT: Keep the entire response EXTREMELY SHORT so the user can read and understand it in under 10 seconds (UNDER 40 WORDS TOTAL).

Requirements:
1. 1 short comforting sentence validating their feeling (under 10 words).
2. "3 Quick Actions & Evidence:" followed by EXACTLY 3 bullet points with brief evidence of why it works (e.g. "* 🫁 **Deep Breath**: Calms vagus nerve & heart rate").
3. Conclude with 1 short encouraging scientific fact line (under 10 words).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text || getFallbackSolution(habitName, userReason, selectedLang);
      res.json({ solution: text, isFallback: false });
    } catch (error: any) {
      console.error("Error generating counselor advice:", error);
      res.json({ 
        solution: getFallbackSolution(req.body.habit || "vape", req.body.reason || "", req.body.lang || "en"), 
        isFallback: true, 
        error: error.message 
      });
    }
  });

  // Serve the Service Worker dynamically with push capability
  app.get("/sw.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '🌱 Bloom Check-in', body: event.data.text() };
    }
  }

  const title = data.title || '🌱 Bloom Check-in';
  const options = {
    body: data.body || 'Time for your daily Bloom check-in! Keep your streak growing. 🌸',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'bloom-daily-reminder',
    renotify: true,
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
    `);
  });

  return app;
}

const app = createApp();
export default app;

async function startServer() {
  const PORT = 3000;

  // Background notification check-in job (every 60 seconds) — local/long-running only
  if (!process.env.VERCEL) {
    setInterval(() => {
      try {
        const db = loadDB();
        const now = new Date();

        Object.keys(db.userData).forEach(async (usernameKey) => {
          const userPayload = db.userData[usernameKey];
          const settings = userPayload?.notificationSettings;

          if (settings && settings.enabled === true && settings.subscription) {
            const timezone = settings.timezone || "UTC";
            try {
              // Get local hour and minute in the user's specific timezone
              const options = {
                timeZone: timezone,
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
              } as const;
              
              const formatter = new Intl.DateTimeFormat('en-US', options);
              const parts = formatter.formatToParts(now);
              const hourVal = parts.find(p => p.type === 'hour')?.value;
              const minVal = parts.find(p => p.type === 'minute')?.value;

              if (hourVal && minVal) {
                const localTimeStr = `${hourVal.padStart(2, "0")}:${minVal.padStart(2, "0")}`; // "HH:MM"
                
                if (localTimeStr === settings.time) {
                  // Get local date in their timezone to check if already sent today
                  const dateOptions = {
                    timeZone: timezone,
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                  } as const;
                  const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
                  const localDateStr = dateFormatter.format(now); // e.g. "7/20/2026"

                  if (settings.lastSentDate !== localDateStr) {
                    // Message choices:
                    const messages = [
                      "🌱 Time for your daily Bloom check-in!",
                      "🌸 Keep your streak growing—visit Bloom today!",
                      "💧 Take a moment to care for yourself today."
                    ];
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

                    const payload = JSON.stringify({
                      title: "Bloom Daily Check-in 🌸",
                      body: randomMsg,
                      data: { url: "/" }
                    });

                    // Update database immediately before sending to prevent double-sends
                    settings.lastSentDate = localDateStr;
                    userPayload.notificationSettings = settings;
                    saveDB(db);

                    try {
                      await webPush.sendNotification(settings.subscription, payload);
                      console.log(`Successfully sent scheduled daily notification to user ${usernameKey}`);
                    } catch (pushErr: any) {
                      console.error(`Error sending push notification to user ${usernameKey}:`, pushErr);
                      // Handle expired subscription (410 Gone / 404 Not Found)
                      if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                        console.log(`Subscription for user ${usernameKey} is inactive. Disabling daily reminders.`);
                        settings.enabled = false;
                        userPayload.notificationSettings = settings;
                        saveDB(db);
                      }
                    }
                  }
                }
              }
            } catch (tzErr) {
              console.error(`Timezone formatting error for user ${usernameKey} with timezone ${timezone}:`, tzErr);
            }
          }
        });
      } catch (dbErr) {
        console.error("Error in background check-in timer job:", dbErr);
      }
    }, 60000); // every 1 minute
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Bloom Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}