export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'smoothie';
export type MealFilter = MealSlot | 'any';
export type PantryStatus = 'enough' | 'low' | 'out';
export type MatchLevel = 'ready' | 'missing_one' | 'need_shopping';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SpiceLevel = 'mild' | 'medium' | 'hot';
export type PortionMode = 'solo' | 'family';
export type QuantityProfile = 'count' | 'volume' | 'weight' | 'small_volume';
export type CuisineFilter =
  | 'any'
  | 'indian'
  | 'south_indian'
  | 'north_indian'
  | 'american'
  | 'italian'
  | 'asian'
  | 'mediterranean'
  | 'mexican';

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
  /** Approximate kcal per serving at baseServings. */
  caloriesPerServing?: number;
  /** Approximate macros per serving (grams). */
  macrosPerServing?: MacroNutrients;
  aiGenerated?: boolean;
}

export interface MacroNutrients {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface PantryQuantitySettings {
  steps: number[];
  statusQuantities: Record<PantryStatus, number>;
}

export interface PantryItem {
  id?: number;
  name: string;
  normalizedName: string;
  status: PantryStatus;
  quantity: number;
  quantityProfile?: QuantityProfile;
  addedAt: number;
}

export interface HouseholdSettings {
  size: number;
  defaultPortionMode: PortionMode;
  dietaryTags: string[];
  spicePreference: SpiceLevel;
  onboardingComplete: boolean;
  pantryQuantities: PantryQuantitySettings;
  cuisineFilter?: CuisineFilter;
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
  recipeCuisineOverrides: Record<string, RecipeCuisineOverride>;
}

export interface RecipeCuisineOverride {
  cuisine: string;
  tags: string[];
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
  pantryValidationMode: boolean;
}

export interface AiRecipeStackEntry {
  id?: number;
  recipe: Recipe;
  addedAt: number;
  mealSlot: MealSlot;
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
  isAiSuggested?: boolean;
  aiBadgeVariant?: 'new' | 'saved';
}

export interface AppExport {
  version: number;
  exportedAt: string;
  pantry: PantryItem[];
  household: HouseholdSettings;
  preferences: PreferenceProfile;
  aiSettings: Omit<AISettings, 'apiKey'> & { hasApiKey: boolean };
}
