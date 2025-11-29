
import { Difficulty, GameScenario, Clue, Character, Language, Location, Interactable, Role, Direction, TutorialContent, NarratorContent } from "../types";

// --- LOCAL DATABASE (No API Required) ---

// 10 Unique Prologue Storylines per language
// UPDATED: All roles now have LEGITIMATE inheritance claims (Blood/Law).
const PROLOGUE_VARIANTS: Record<Language, string[][]> = {
  zh: [
    [
      "身份：流放的长孙",
      "爷爷去世的消息传来时，我正在九龙寨城的廉租房里吃泡面。",
      "十年前，继母为了让她的儿子上位，伪造证据将我逐出家门。",
      "但她不知道，爷爷在神志不清前，把真正控制家族信托的私钥藏在了我的护身符里。",
      "今晚我不是来奔丧的。我是来拿回原本就属于长房的一切。"
    ],
    [
      "身份：雪藏的私生子",
      "作为父亲在外的'意外'，我这二十年像幽灵一样活着。",
      "家族聚会上没人认识我，他们以为我是新来的司机。",
      "但我口袋里装着刚出炉的亲子鉴定书，和父亲生前录下的承认视频。",
      "看着这些所谓哥哥姐姐们虚伪的嘴脸，我决定不再沉默。",
      "今晚，私生子要上主桌吃饭。"
    ],
    [
      "身份：秘密注册的配偶",
      "他们叫我'狐狸精'，说我为了钱才嫁给一个八十岁的老人。",
      "无所谓。重要的是那张三周前在拉斯维加斯签署的结婚证，合法且有效。",
      "作为法律上的第一顺位继承人，我有权冻结所有资产。",
      "既然你们不尊重我这位'继母'，那我就教教你们尊重法律。"
    ],
    [
      "身份：死而复生的二少爷",
      "五年前的海难，所有人都以为我喂了鲨鱼。",
      "看着灵堂上挂着的我的黑白照片，感觉真是讽刺。",
      "既然户籍已经被注销，那我就用这'鬼魂'的身份查查当年的船为什么会漏水。",
      "当然，属于我的那份遗产，少一个子儿都不行。"
    ],
    [
      "身份：合法的养子",
      "在这个讲究血统的家族里，我永远是那个'外人'。",
      "即便我通过了律师考试，即便我打理着家族最赚钱的生意。",
      "父亲走了，他们立刻想把我和我的养母扫地出门。",
      "可惜，父亲最信任的人是我。他在遗嘱里留了一个反杀条款。",
      "现在，让这种族主义的闹剧结束吧。"
    ],
    [
      "身份：冷冻胚胎继承人",
      "技术上讲，我是爷爷最小的儿子。虽然我今年才25岁，而大哥已经60了。",
      "作为30年前冷冻胚胎计划的唯一幸存者，我在法律上拥有极高优先权。",
      "看着这些比我大两轮的'侄子侄女'们惊恐的眼神，我觉得很有趣。",
      "我不懂家族生意，但我知道我的基因值多少钱。"
    ],
    [
      "身份：持有否决权的叛逆女",
      "我发誓过永远不回这个充满了铜臭味的家。",
      "我去搞摇滚，去流浪，就是为了切断和这些吸血鬼的联系。",
      "但律师告诉我，如果我不回来签字，慈善基金就会被大伯挪用去赌博。",
      "虽然我讨厌钱，但我更讨厌人渣。",
      "这字我签了，这钱我也要定了。"
    ],
    [
      "身份：前妻之子",
      "母亲被逼疯疯癫癫离开陈家时，发誓要让他们付出代价。",
      "如今那个男人死了，现任妻子正忙着转移资产。",
      "她忘记了当年的离婚协议里有一条'回拨条款'。",
      "我是来执行契约的。顺便，送那个女人进监狱。"
    ],
    [
      "身份：影武者双胞胎",
      "从小我就是哥哥的替身。他生病我替他上课，他闯祸我替他受罚。",
      "现在他吸毒过量死了，家族为了股价秘不发丧，让我继续扮演他。",
      "可笑。既然我是'完美继承人'，那我为什么还要听你们的摆布？",
      "从今天起，影子要成为主人。真正的哥哥已经死了，但我活着。"
    ],
    [
      "身份：家族信托受益人",
      "我没有经营权，没有投票权，他们都把我当成只会花钱的废物。",
      "但在家族信托的架构图里，我的名字写在最顶层。",
      "只要我证明现任管理者（我的叔叔）存在重大过失，我就能启动'熔断机制'。",
      "在这个家里，扮猪吃老虎是活下来的唯一技能。现在，老虎醒了。"
    ]
  ],
  en: [
    [
      "Identity: The Exiled Grandson",
      "I was eating instant noodles in a slum when the news broke.",
      "Ten years ago, my stepmother framed me to pave the way for her own son.",
      "She didn't know grandfather hid the private ledger key in my amulet before he lost his mind.",
      "I'm not here to mourn tonight. I'm here to take back what belongs to the first bloodline."
    ],
    [
      "Identity: The Illegitimate Child",
      "I've lived as a ghost for twenty years. Father's 'little accident'.",
      "At the wake, they thought I was the new driver.",
      "But in my pocket burns a fresh DNA test and a video confession from the old man.",
      "Watching my 'siblings' shed fake tears makes me sick.",
      "Tonight, the bastard takes a seat at the head table."
    ],
    [
      "Identity: The Secret Spouse",
      "They call me a gold digger. They say I seduced a dying 80-year-old.",
      "It doesn't matter. What matters is the marriage certificate signed three weeks ago.",
      "As the primary legal heir, I have the power to freeze all assets.",
      "If you won't respect me as your 'step-mother', you will respect the law."
    ],
    [
      "Identity: The Returned 'Dead' Sibling",
      "Five years ago, the yacht sank. Everyone thought I fed the sharks.",
      "It's ironic seeing my black-and-white photo at the altar.",
      "Since I'm legally dead, I'm the perfect ghost to investigate why that boat leaked.",
      "And of course, I'm taking my share of the inheritance. With interest."
    ],
    [
      "Identity: The Adopted Heir",
      "In this blood-obsessed dynasty, I was always the 'outsider'.",
      "Even though I passed the Bar and ran the business, they hate me.",
      "Now father is gone, they want to kick me and my mother out.",
      "Too bad father trusted me most. He left a 'Poison Pill' clause in the will.",
      "Time to end this racist charade."
    ],
    [
      "Identity: The Cryo-Embryo Heir",
      "Technically, I am grandfather's youngest son. Even though I'm 25 and my brother is 60.",
      "I am the sole survivor of the Cryo-Preservation Project from 1995.",
      "Legally, my claim supersedes the grandchildren.",
      "The look of terror on my 'nephews' faces is priceless.",
      "I don't know business, but I know the value of my DNA."
    ],
    [
      "Identity: The Disowned Rebel",
      "I swore I'd never return to this house of greed.",
      "I lived as a musician to cut ties with these vampires.",
      "But the lawyer said if I don't sign, Uncle will gamble away the charity fund.",
      "I hate money. But I hate scumbags more.",
      "I'm signing the papers. And I'm taking control."
    ],
    [
      "Identity: The First Wife's Son",
      "When my mother was driven mad and forced out, she swore revenge.",
      "Now that man is dead, and his current wife is busy moving assets offshore.",
      "She forgot the 'Clawback Clause' in the divorce settlement from 1990.",
      "I'm here to execute the contract. And put her in jail."
    ],
    [
      "Identity: The Shadow Twin",
      "I was always his double. He got the glory, I took the blame.",
      "Now he died of an overdose, and the family is hiding it to save the stock price.",
      "They want me to keep playing him. But why should I be a puppet?",
      "Since I am the 'Perfect Heir', I'm taking charge.",
      "My brother is dead. I am alive. And I want it all."
    ],
    [
      "Identity: The Trust Fund Beneficiary",
      "I have no voting rights. They treat me like a useless spender.",
      "But on the Trust structure chart, my name is at the very top.",
      "As long as I prove 'Gross Negligence' by the current manager (my uncle), I trigger the kill switch.",
      "Playing dumb is a survival skill. But the tiger is awake now."
    ]
  ]
};

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
  tutorial: TutorialContent;
  narrator: NarratorContent;
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
    },
    tutorial: {
      title: "任务简报：遗产接管协议",
      steps: [
        { title: "搜寻", desc: "前往不同房间，通过【调查】家具寻找隐藏的关键证据。" },
        { title: "收集", desc: "将有价值的证据放入公文包（上限5个），根据情况取舍。" },
        { title: "对质", desc: "找到家族成员，使用手中的证据【谈判】或【恐吓】，夺取他们的股份。" },
        { title: "获胜", desc: "在8个周期内，从5%的份额提升至51%以上即可完全接管家族。" }
      ],
      button: "接受任务"
    },
    narrator: {
      intro: "战术分析系统已启动。目标：在竞争对手反应过来之前，收集足够筹码。",
      move: [
        "进入新区域。建议先观察环境，注意任何不自然的摆设。",
        "环境扫描完成。该区域存在潜在的信息源。",
        "小心行事。这里可能有其他家族成员在监视。"
      ],
      search_start: [
        "正在解析物体结构...",
        "正在扫描夹层与暗格...",
        "开始深度搜索..."
      ],
      search_empty: [
        "扫描结果：无价值。只是普通的杂物。",
        "这里被清理得很干净，没有留下痕迹。",
        "一无所获。浪费了宝贵的行动力。"
      ],
      search_found: [
        "警告：检测到高价值物品！",
        "发现异常数据！这可能就是我们要找的证据。",
        "目标锁定。建议立即回收。"
      ],
      battle_start: "检测到敌对目标。分析其弱点，准备投放证据打击。",
      low_ap: "警报：行动力耗尽。请结束当前周期以补充能量。",
      inventory_full: "存储空间已满。请丢弃低价值物品以腾出空间。"
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
    },
    tutorial: {
      title: "Mission Briefing: Estate Protocol",
      steps: [
        { title: "INVESTIGATE", desc: "Move between rooms and scan furniture to uncover hidden evidence." },
        { title: "COLLECT", desc: "Secure high-value clues in your briefcase (Max 5). Discard weak data." },
        { title: "CONFRONT", desc: "Locate rivals and leverage your evidence to seize their equity shares." },
        { title: "DOMINATE", desc: "Increase your share from 5% to 51% within 8 cycles to win." }
      ],
      button: "ACKNOWLEDGE"
    },
    narrator: {
      intro: "Tactical Advisor Online. Objective: Secure majority control before rivals consolidate.",
      move: [
        "Entering new sector. Maintain vigilance.",
        "Environment scan complete. Potential assets detected.",
        "Tread carefully. Rivals may be monitoring this area."
      ],
      search_start: [
        "Analyzing object structure...",
        "Scanning for hidden compartments...",
        "Initiating deep search..."
      ],
      search_empty: [
        "Scan negative. Just debris.",
        "Area clean. No actionable intelligence found.",
        "Waste of energy. Nothing here."
      ],
      search_found: [
        "Alert: High-value asset detected.",
        "Anomaly found. This evidence is critical.",
        "Target locked. Recommend immediate acquisition."
      ],
      battle_start: "Hostile entity engaged. Deploy evidence to exploit weaknesses.",
      low_ap: "Warning: Action Points depleted. Recharge required (End Cycle).",
      inventory_full: "Storage capacity reached. Purge low-value assets."
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

export const getDB = (lang: Language) => DB[lang];

export const generateScenario = async (difficulty: Difficulty, lang: Language): Promise<GameScenario> => {
  // Simulate a tiny delay for effect (UI feels better)
  await new Promise(resolve => setTimeout(resolve, 800));

  const data = DB[lang];

  // 1. Prologue Selection
  // Randomly select 1 of 10 prologues
  const prologuePool = PROLOGUE_VARIANTS[lang];
  const prologueText = getRandom(prologuePool);

  // 2. Basic Info
  const title = getRandom(data.titles);
  const description = getRandom(data.descriptions);
  const totalAssetValue = (Math.floor(Math.random() * 900) + 100) + " M";

  // 3. Locations
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

  // 4. Characters
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

  // 5. Share Logic
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
    locations,
    prologueText // Attach the selected prologue
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
