export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PantryStatus = 'enough' | 'low' | 'out';
export type MatchLevel = 'ready' | 'missing_one' | 'need_shopping';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SpiceLevel = 'mild' | 'medium' | 'hot';
export type PortionMode = 'solo' | 'family';

export interface Ingredient {
  name: string;
  quantity?: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  mealSlots: MealSlot[];
  prepMinutes: number;
  cookMinutes: number;
  baseServings: number;
  difficulty: Difficulty;
  tags: string[];
  kidFriendly: boolean;
  vegetarian: boolean;
  spiceLevel: SpiceLevel;
  ingredients: Ingredient[];
  steps: string[];
}

export interface PantryItem {
  id?: number;
  name: string;
  normalizedName: string;
  status: PantryStatus;
  addedAt: number;
}

export interface HouseholdSettings {
  size: number;
  defaultPortionMode: PortionMode;
  dietaryTags: string[];
  spicePreference: SpiceLevel;
  onboardingComplete: boolean;
}

export interface TagWeight {
  tag: string;
  weight: number;
}

export interface PreferenceProfile {
  id?: number;
  tagWeights: Record<string, number>;
  dishScores: Record<string, number>;
  blockedDishes: string[];
  favoriteDishes: string[];
  cookHistory: CookHistoryEntry[];
}

export interface CookHistoryEntry {
  recipeId: string;
  recipeName: string;
  cookedAt: number;
  mealSlot: MealSlot;
  servings: number;
  kidsLiked?: boolean;
}

export interface FeedbackEntry {
  id?: number;
  recipeId: string;
  rating: 'up' | 'down';
  timestamp: number;
  mealSlot: MealSlot;
}

export interface AISettings {
  provider: 'openai' | 'gemini' | 'claude' | 'custom';
  apiKey: string;
  model: string;
  customBaseUrl?: string;
  systemPrompt?: string;
  enabled: boolean;
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  matchLevel: MatchLevel;
  missingIngredients: string[];
  haveIngredients: string[];
  preferenceScore: number;
  pantryScore: number;
  varietyPenalty: number;
}

export interface AppExport {
  version: number;
  exportedAt: string;
  pantry: PantryItem[];
  household: HouseholdSettings;
  preferences: PreferenceProfile;
  aiSettings: Omit<AISettings, 'apiKey'> & { hasApiKey: boolean };
}
