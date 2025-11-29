
export type Language = 'en' | 'zh';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export type Role = 'RELATIVE' | 'LAWYER' | 'WITNESS' | 'RIVAL' | 'NEUTRAL';
export type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

export interface Clue {
  id: string;
  name: string;
  description: string;
  power: number;
  isUsed: boolean;
  foundInLocation?: string;
}

export interface Interactable {
  id: string;
  name: string;
  type: 'FURNITURE' | 'DECOR' | 'HIDDEN';
  description: string;
  direction: Direction;
  isSearched: boolean;
  hasClue: boolean;
}

export interface Character {
  id: string;
  name: string;
  role: Role;
  relation: string;
  personality: string;
  weakness: string;
  share: number;
  avatarColor: string;
  isDefeated: boolean;
  dialogueIntro: string; // Used for current dialogue state
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  interactables: Interactable[];
}

export interface GameScenario {
  title: string;
  description: string;
  totalAssetValue: string;
  characters: Character[];
  locations: Location[];
  playerShare: number;
  prologueText: string[]; // New field for the specific generated prologue
}

export interface LogEntry {
  id: string;
  speaker: 'System' | 'Player' | string;
  text: string;
  type: 'info' | 'success' | 'danger' | 'neutral';
}

export enum GamePhase {
  MENU,
  LOADING_SCENARIO,
  PROLOGUE,
  NAVIGATION,
  LOCATION_VIEW,
  CONFRONTATION,
  GAME_OVER
}

export interface TutorialContent {
  title: string;
  steps: { title: string; desc: string }[];
  button: string;
}

export interface NarratorContent {
  intro: string;
  move: string[];
  search_start: string[];
  search_empty: string[];
  search_found: string[];
  battle_start: string;
  low_ap: string;
  inventory_full: string;
}
