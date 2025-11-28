
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, GameScenario, Clue, Character, Language, Location, Interactable } from "../types";

// Support both variable names for easier deployment
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper to clean Markdown from JSON response
const cleanJson = (text: string | undefined): string => {
  if (!text) return "{}";
  // Remove ```json and ``` markers
  let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return cleaned;
};

// --- Scenario Generation ---

export const generateScenario = async (difficulty: Difficulty, lang: Language): Promise<GameScenario> => {
  const targetLang = lang === 'zh' ? "SIMPLIFIED CHINESE (简体中文)" : "ENGLISH";
  
  const prompt = `
  ROLE: You are a game master for a high-stakes detective RPG.
  STRICT OUTPUT LANGUAGE: ${targetLang}. ALL strings (names, descriptions, titles) MUST be in ${targetLang}.
  
  TASK: Create an inheritance mystery scenario.
  DIFFICULTY: ${difficulty}.
  
  REQUIREMENTS:
  1. Title & Description: Dramatic, relating to a wealthy family.
  2. LOCATIONS: Create 4 distinct rooms in a mansion.
  3. INTERACTABLES: For EACH location, list 3-4 specific objects (safe, bookshelf, desk, painting) to search.
  4. CHARACTERS: Create 3 rivals (e.g., The Greedy Uncle, The Cunning Lawyer, The Jealous Sibling).
     - Assign them 'share' values.
     - IMPORTANT: Player starts with exactly 5% share. The Rivals should hold the rest.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `You are a creative writer. You must output valid JSON. You must write in ${targetLang}.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          totalAssetValue: { type: Type.STRING },
          playerShare: { type: Type.NUMBER },
          locations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                interactables: {
                  type: Type.ARRAY,
                  items: {
                     type: Type.OBJECT,
                     properties: {
                       id: { type: Type.STRING },
                       name: { type: Type.STRING },
                       type: { type: Type.STRING, enum: ['FURNITURE', 'DECOR', 'HIDDEN']},
                       description: { type: Type.STRING },
                       direction: { type: Type.STRING, enum: ['NORTH', 'SOUTH', 'EAST', 'WEST']},
                       hasClue: { type: Type.BOOLEAN },
                       isSearched: { type: Type.BOOLEAN }
                     },
                     required: ["id", "name", "type", "description", "direction", "hasClue", "isSearched"]
                  }
                }
              },
              required: ["id", "name", "description", "interactables"]
            }
          },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING, enum: ['RIVAL', 'LAWYER', 'WITNESS', 'NEUTRAL'] },
                relation: { type: Type.STRING },
                personality: { type: Type.STRING },
                weakness: { type: Type.STRING },
                share: { type: Type.NUMBER },
                avatarColor: { type: Type.STRING },
                isDefeated: { type: Type.BOOLEAN },
                dialogueIntro: { type: Type.STRING },
                locationId: { type: Type.STRING }
              },
              required: ["id", "name", "role", "relation", "personality", "weakness", "share", "avatarColor", "isDefeated", "dialogueIntro", "locationId"]
            }
          }
        },
        required: ["title", "description", "totalAssetValue", "playerShare", "characters", "locations"]
      }
    }
  });

  const scenario = JSON.parse(cleanJson(response.text)) as GameScenario;
  
  // --- MATH FIX: Ensure shares sum to 100 ---
  // Previous bug: added all remainder to player.
  // New logic: Player stays low (5%), remainder goes to Rivals.
  
  // 1. Force player share to be low to start
  scenario.playerShare = 5;

  // 2. Calculate current rival total
  const rivalTotal = scenario.characters.reduce((acc, r) => acc + r.share, 0);
  const targetRivalTotal = 95; // 100 - 5

  if (rivalTotal === 0) {
    // Fallback if AI gave 0 to everyone
    const perChar = targetRivalTotal / scenario.characters.length;
    scenario.characters.forEach(c => c.share = perChar);
  } else {
    // 3. Scale rivals to fit exactly 95%
    const scale = targetRivalTotal / rivalTotal;
    scenario.characters.forEach(c => {
      c.share = parseFloat((c.share * scale).toFixed(1));
    });
    
    // 4. Fix rounding errors by dumping diff into the first character
    const newTotal = scenario.characters.reduce((acc, r) => acc + r.share, 0);
    const diff = targetRivalTotal - newTotal;
    if (scenario.characters.length > 0) {
      scenario.characters[0].share += diff;
    }
  }

  // Ensure characters are in valid locations
  const locationIds = scenario.locations.map(l => l.id);
  scenario.characters = scenario.characters.map(c => ({
    ...c,
    locationId: locationIds.includes(c.locationId) ? c.locationId : locationIds[0]
  }));

  // Ensure interactables default to not searched
  scenario.locations.forEach(l => {
    l.interactables.forEach(i => {
      i.isSearched = false;
      // Randomize clue distribution slightly if AI made everything false
      if (Math.random() > 0.7) i.hasClue = true;
    })
  });

  return scenario;
};

// --- Clue Discovery ---

export const findClue = async (location: Location, interactable: Interactable, lang: Language): Promise<Clue> => {
  const targetLang = lang === 'zh' ? "SIMPLIFIED CHINESE (简体中文)" : "ENGLISH";
  
  const prompt = `
    STRICT LANGUAGE REQUIREMENT: ${targetLang}.
    Context: Player is searching the "${interactable.name}" inside the "${location.name}".
    Interactable Description: ${interactable.description}.
    
    Generate 1 piece of evidence found here.
    It could be a document, a digital device, or a physical object.
    
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          power: { type: Type.NUMBER },
          isUsed: { type: Type.BOOLEAN },
        },
        required: ["id", "name", "description", "power", "isUsed"]
      }
    }
  });

  return JSON.parse(cleanJson(response.text)) as Clue;
};

// --- Battle/Debate Logic ---

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
  const targetLang = lang === 'zh' ? "SIMPLIFIED CHINESE (简体中文)" : "ENGLISH";

  const prompt = `
    STRICT LANGUAGE REQUIREMENT: ${targetLang}.
    Scenario: ${scenarioContext}
    
    Action: Player confronts ${target.name} (${target.role}) using evidence: "${playerClue.name}".
    Target Weakness: ${target.weakness}.
    
    Write a short, dramatic interaction script (Player vs Target).
    Determine if the evidence hits the weakness.
    
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dialogue: { type: Type.STRING },
          shareChange: { type: Type.NUMBER, description: "Positive if player wins share, negative if backfires. Range -10 to +25." },
          isCriticalSuccess: { type: Type.BOOLEAN }
        },
        required: ["dialogue", "shareChange", "isCriticalSuccess"]
      }
    }
  });

  return JSON.parse(cleanJson(response.text)) as BattleResult;
};
