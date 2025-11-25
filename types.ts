
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
  dialogueIntro: string;
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  interactables: Interactable[]; // Specific things to search
}

export interface GameScenario {
  title: string;
  description: string;
  totalAssetValue: string;
  characters: Character[];
  locations: Location[];
  playerShare: number;
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
  NAVIGATION, // Map view
  LOCATION_VIEW, // Inside a room
  CONFRONTATION, // Battling an NPC
  GAME_OVER
}
