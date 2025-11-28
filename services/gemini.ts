
import { Difficulty, GameScenario, Clue, Character, Language, Location, Interactable, Role, Direction } from "../types";

// --- LOCAL DATABASE (No API Required) ---

interface GameData {
  titles: string[];
  descriptions: string[];
  roles: Record<string, string[]>;
  names: string[];
  locations: { name: string; desc: string }[];
  interactables: {
    FURNITURE: string[];
    DECOR: string[];
    HIDDEN: string[];
  };
  clues: { name: string; desc: string; power: number }[];
  dialogues: {
    intro: string[];
    win: string;
    lose: string;
  };
}

const DB: Record<Language, GameData> = {
  zh: {
    titles: ["陈氏家族遗产案", "李氏财团继承战", "王府百年家产风云", "赛博世家：加密密钥之争"],
    descriptions: [
      "家主突然离世，留下巨额资产和未公开的遗嘱。家族内部暗流涌动。",
      "一场关于控制权的血腥博弈。不仅是为了钱，更是为了生存。",
      "谁掌握了核心账本，谁就掌握了未来。现在的平静只是暴风雨的前奏。"
    ],
    roles: {
      RIVAL: ["贪婪的大伯", "刻薄的姑妈", "心机的继兄", "冷漠的私生子"],
      LAWYER: ["金牌律师", "家族顾问", "私人法务"],
      WITNESS: ["老管家", "贴身女仆", "私人医生"],
      NEUTRAL: ["不知情的远房表亲"]
    },
    names: ["张伟", "陈淑芬", "李明", "王强", "赵敏", "刘波", "Alice", "Robert", "Grace"],
    locations: [
      { name: "主卧室", desc: "空气中弥漫着陈旧的檀木香，这里隐藏着家主最后的秘密。" },
      { name: "私人书房", desc: "满墙的书籍和文件，账本通常藏在不起眼的角落。" },
      { name: "会客室", desc: "虚伪的寒暄发生地，沙发缝隙里也许有录音笔。" },
      { name: "地下金库", desc: "厚重的防盗门紧闭，只有极少数人知道密码。" },
      { name: "后花园", desc: "幽静的小径，泥土似乎最近被翻动过。" },
      { name: "餐厅", desc: "长桌尽头曾经坐着最有权力的人。" }
    ],
    interactables: {
      FURNITURE: ["红木办公桌", "丝绒沙发", "床头柜", "书架", "陈列柜"],
      DECOR: ["古董花瓶", "油画", "挂钟", "地毯", "雕塑"],
      HIDDEN: ["墙壁保险箱", "地板暗格", "通风口", "书本夹层"]
    },
    clues: [
      { name: "修改过的遗嘱", desc: "日期被涂改过，签字迹象可疑。", power: 85 },
      { name: "秘密账本", desc: "记录了数笔不明资金的去向。", power: 90 },
      { name: "录音笔", desc: "记录了一段激烈的争吵。", power: 75 },
      { name: "撕碎的信件", desc: "拼凑后隐约可见威胁的字眼。", power: 60 },
      { name: "神秘钥匙", desc: "不知道通向哪里的黄铜钥匙。", power: 40 },
      { name: "医疗记录", desc: "显示家主生前神智可能不清。", power: 80 },
      { name: "海外汇款单", desc: "巨额资金流向了开曼群岛。", power: 70 },
      { name: "旧照片", desc: "揭示了一段不为人知的私情。", power: 50 }
    ],
    dialogues: {
      intro: [
        "你以为你能拿走一分钱吗？别做梦了。",
        "有些事情，你最好不要知道得太清楚。",
        "我们是一家人，没必要闹得这么僵，对吧？（冷笑）",
        "法律是站在我这边的，你手里的废纸没用。"
      ],
      win: "这...这不可能！你怎么会有这个？！",
      lose: "哼，我就知道你是在虚张声势。"
    }
  },
  en: {
    titles: ["The Chen Legacy", "The Lee Syndicate War", "Manor of Deceit", "Cyber-Key Succession"],
    descriptions: [
      "The patriarch has fallen. The sharks are circling.",
      "A battle for control disguised as a family reunion.",
      "Whoever holds the ledger holds the future."
    ],
    roles: {
      RIVAL: ["Greedy Uncle", "Cruel Aunt", "Scheming Step-brother", "Cold Half-sibling"],
      LAWYER: ["Ace Attorney", "Family Advisor", "Legal Counsel"],
      WITNESS: ["The Old Butler", "The Maid", "Private Doctor"],
      NEUTRAL: ["Distant Cousin"]
    },
    names: ["James", "Victoria", "Charles", "Diana", "Richard", "Emily", "Marcus", "Sophia"],
    locations: [
      { name: "Master Bedroom", desc: "Scent of old sandalwood. The patriarch's secrets sleep here." },
      { name: "Private Study", desc: "Walls of books. The ledger is hidden somewhere." },
      { name: "Drawing Room", desc: "Where fake smiles are exchanged. Maybe a wiretap is hidden." },
      { name: "Underground Vault", desc: "Heavy steel doors. Only a few know the code." },
      { name: "Garden", desc: "Quiet paths. The dirt looks recently disturbed." },
      { name: "Dining Hall", desc: "The seat of power is now empty." }
    ],
    interactables: {
      FURNITURE: ["Mahogany Desk", "Velvet Sofa", "Nightstand", "Bookshelf", "Display Cabinet"],
      DECOR: ["Antique Vase", "Oil Painting", "Wall Clock", "Persian Rug", "Sculpture"],
      HIDDEN: ["Wall Safe", "Floor Hatch", "Ventilation Shaft", "Hollow Book"]
    },
    clues: [
      { name: "Altered Will", desc: "Dates are smudged. The signature looks shaky.", power: 85 },
      { name: "Secret Ledger", desc: "Records of unexplained off-shore transfers.", power: 90 },
      { name: "Voice Recorder", desc: "Captured a heated argument moments before death.", power: 75 },
      { name: "Torn Letter", desc: "Fragments threatening exposure.", power: 60 },
      { name: "Brass Key", desc: "Old and heavy. Unclear what it unlocks.", power: 40 },
      { name: "Medical Records", desc: "Suggests mental instability prior to signing.", power: 80 },
      { name: "Bank Statement", desc: "Millions moved to the Cayman Islands.", power: 70 },
      { name: "Old Photo", desc: "Reveals an illegitimate affair.", power: 50 }
    ],
    dialogues: {
      intro: [
        "You think you deserve a cut? Keep dreaming.",
        "Some secrets are better left buried.",
        "We are family. No need for lawyers, right? (Sneers)",
        "The law is on my side. That paper is trash."
      ],
      win: "W-what?! Where did you find that?!",
      lose: "Hah. I knew you were bluffing."
    }
  }
};

// --- HELPER FUNCTIONS ---

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomColor = () => {
  const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
  return getRandom(colors);
};

// --- CORE SERVICES ---

export const generateScenario = async (difficulty: Difficulty, lang: Language): Promise<GameScenario> => {
  // Simulate a tiny delay for effect (UI feels better)
  await new Promise(resolve => setTimeout(resolve, 800));

  const data = DB[lang];

  // 1. Basic Info
  const title = getRandom(data.titles);
  const description = getRandom(data.descriptions);
  const totalAssetValue = (Math.floor(Math.random() * 900) + 100) + " M";

  // 2. Locations
  const locTemplates = getRandomSubset(data.locations, 4);
  const locations: Location[] = locTemplates.map(t => {
    const interactables: Interactable[] = [];
    const dirs: Direction[] = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
    
    // Add 4 interactables per room
    dirs.forEach(dir => {
      const type = Math.random() > 0.8 ? 'HIDDEN' : (Math.random() > 0.5 ? 'FURNITURE' : 'DECOR');
      const name = getRandom(data.interactables[type as keyof typeof data.interactables]);
      
      interactables.push({
        id: generateId(),
        name: name,
        type: type as any,
        description: lang === 'zh' ? `位于房间的${translateDir(dir, lang)}面。` : `Located on the ${dir} side.`,
        direction: dir,
        isSearched: false,
        hasClue: Math.random() > 0.6 // 40% chance to have a clue
      });
    });

    return {
      id: generateId(),
      name: t.name,
      description: t.desc,
      interactables
    };
  });

  // 3. Characters
  const charCount = 3;
  const chars: Character[] = [];
  const roles: Role[] = ['RIVAL', 'LAWYER', 'WITNESS'];
  const usedNames = new Set<string>();

  for (let i = 0; i < charCount; i++) {
    const roleType = roles[i % roles.length];
    const roleName = getRandom(data.roles[roleType]);
    let name = getRandom(data.names);
    while (usedNames.has(name)) name = getRandom(data.names);
    usedNames.add(name);

    chars.push({
      id: generateId(),
      name: name,
      role: roleType,
      relation: roleName,
      personality: "Aggressive",
      weakness: "Evidence of Fraud",
      share: 0, // Calculated below
      avatarColor: getRandomColor(),
      isDefeated: false,
      dialogueIntro: getRandom(data.dialogues.intro),
      locationId: getRandom(locations).id
    });
  }

  // 4. Share Logic
  const playerShare = 5;
  const remaining = 95;
  // Distribute unevenly
  let currentSum = 0;
  const shares = chars.map(() => Math.random());
  const sumRandom = shares.reduce((a, b) => a + b, 0);
  
  chars.forEach((c, idx) => {
    const raw = (shares[idx] / sumRandom) * remaining;
    c.share = parseFloat(raw.toFixed(1));
    currentSum += c.share;
  });

  // Fix rounding
  const diff = remaining - currentSum;
  chars[0].share = parseFloat((chars[0].share + diff).toFixed(1));

  return {
    title,
    description,
    totalAssetValue,
    playerShare,
    characters: chars,
    locations
  };
};

export const findClue = async (location: Location, interactable: Interactable, lang: Language): Promise<Clue> => {
  // Instant result
  const data = DB[lang];
  const template = getRandom(data.clues);
  
  return {
    id: generateId(),
    name: template.name,
    description: template.desc,
    power: template.power + Math.floor(Math.random() * 20 - 10), // Variance +/- 10
    isUsed: false,
    foundInLocation: location.id
  };
};

interface BattleResult {
  dialogue: string;
  shareChange: number;
  isCriticalSuccess: boolean;
}

export const resolveBattle = async (
  playerClue: Clue,
  target: Character,
  scenarioContext: string,
  lang: Language
): Promise<BattleResult> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Suspense delay
  
  const data = DB[lang];
  
  // Logic: Clue Power vs RNG
  const roll = Math.random() * 100;
  const success = (playerClue.power + roll) > 100;
  const crit = (playerClue.power + roll) > 150;

  let shareChange = 0;
  let dialogue = "";

  if (crit) {
    shareChange = 15 + Math.random() * 10;
    dialogue = `${data.dialogues.win} (${lang === 'zh' ? '暴击！完美证据！' : 'Critical Hit! Perfect evidence!'})`;
  } else if (success) {
    shareChange = 5 + Math.random() * 10;
    dialogue = data.dialogues.win;
  } else {
    shareChange = -5; // Backfire
    dialogue = data.dialogues.lose;
  }

  return {
    dialogue: dialogue,
    shareChange: parseFloat(shareChange.toFixed(1)),
    isCriticalSuccess: crit
  };
};

// Helper for UI translation
function translateDir(dir: Direction, lang: Language): string {
  if (lang === 'en') return dir;
  const map = { NORTH: '北', SOUTH: '南', EAST: '东', WEST: '西' };
  return map[dir];
}
