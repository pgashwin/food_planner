import type {
  CuisineFilter,
  MatchLevel,
  MealFilter,
  MealSlot,
  PantryItem,
  PreferenceProfile,
  Recipe,
  ScoredRecipe,
} from '../types';
import { recipeMatchesCuisine } from './cuisine';
import { matchRecipeToPantry } from './pantry';
import { isRecipeVegetarian } from './vegetarian';
import {
  scoreRecipePreferences,
  varietyPenalty,
} from './preferences';

export interface SuggestionOptions {
  mealSlot: MealFilter;
  maxMinutes?: number;
  vegetarianOnly?: boolean;
  cuisineFilter?: CuisineFilter;
  limit?: number;
  servings?: number;
  pantryValidationMode?: boolean;
}

const MATCH_LEVEL_ORDER: Record<MatchLevel, number> = {
  ready: 0,
  missing_one: 1,
  need_shopping: 2,
};

function recipeTotalMinutes(recipe: Recipe): number {
  return recipe.prepMinutes + recipe.cookMinutes;
}

/** Group by pantry match, then fastest-first within each group, then preference score. */
export function sortSuggestions(recipes: ScoredRecipe[]): ScoredRecipe[] {
  return [...recipes].sort((a, b) => {
    const levelDiff = MATCH_LEVEL_ORDER[a.matchLevel] - MATCH_LEVEL_ORDER[b.matchLevel];
    if (levelDiff !== 0) return levelDiff;

    const timeDiff = recipeTotalMinutes(a.recipe) - recipeTotalMinutes(b.recipe);
    if (timeDiff !== 0) return timeDiff;

    return b.score - a.score;
  });
}

/** @deprecated Use sortSuggestions */
export function sortByMatchLevel(recipes: ScoredRecipe[]): ScoredRecipe[] {
  return sortSuggestions(recipes);
}

export function filterRecipes(
  recipes: Recipe[],
  options: Pick<SuggestionOptions, 'mealSlot' | 'maxMinutes' | 'vegetarianOnly' | 'cuisineFilter'>,
): Recipe[] {
  const { mealSlot, maxMinutes, vegetarianOnly, cuisineFilter = 'any' } = options;

  let filtered = recipes;

  if (mealSlot !== 'any') {
    filtered = filtered.filter((r) => r.mealSlots.includes(mealSlot));
  }
  if (maxMinutes) {
    filtered = filtered.filter((r) => recipeTotalMinutes(r) <= maxMinutes);
  }
  if (vegetarianOnly) {
    filtered = filtered.filter((r) => isRecipeVegetarian(r));
  }
  if (cuisineFilter !== 'any') {
    filtered = filtered.filter((r) => recipeMatchesCuisine(r, cuisineFilter));
  }

  return filtered;
}

export function scoreRecipe(
  recipe: Recipe,
  pantry: PantryItem[],
  preferences: PreferenceProfile,
  mealSlot: MealSlot,
  options?: {
    isAiSuggested?: boolean;
    aiBadgeVariant?: 'new' | 'saved';
    servings?: number;
  },
): ScoredRecipe {
  const pantryMatch = matchRecipeToPantry(recipe, pantry, {
    servings: options?.servings ?? recipe.baseServings,
    baseServings: recipe.baseServings,
  });
  const preferenceScore = scoreRecipePreferences(recipe, preferences, mealSlot);
  const variety = varietyPenalty(recipe, preferences);

  const pantryWeight = pantryMatch.pantryScore * 40;
  const matchBonus =
    pantryMatch.matchLevel === 'ready'
      ? 30
      : pantryMatch.matchLevel === 'missing_one'
        ? 10
        : -10;

  const aiBonus = options?.isAiSuggested ? 5 : 0;
  const score = pantryWeight + matchBonus + preferenceScore - variety + aiBonus;

  return {
    recipe,
    score,
    matchLevel: pantryMatch.matchLevel,
    missingIngredients: pantryMatch.missingIngredients,
    haveIngredients: pantryMatch.haveIngredients,
    preferenceScore,
    pantryScore: pantryMatch.pantryScore,
    varietyPenalty: variety,
    isAiSuggested: options?.isAiSuggested,
    aiBadgeVariant: options?.aiBadgeVariant,
  };
}

export function scoreRecipes(
  recipes: Recipe[],
  pantry: PantryItem[],
  preferences: PreferenceProfile,
  mealSlot: MealSlot,
  options?: {
    isAiSuggested?: boolean;
    aiBadgeVariant?: 'new' | 'saved';
    servings?: number;
  },
): ScoredRecipe[] {
  return recipes.map((recipe) =>
    scoreRecipe(recipe, pantry, preferences, mealSlot, options),
  );
}

export function getSuggestions(
  recipes: Recipe[],
  pantry: PantryItem[],
  preferences: PreferenceProfile,
  options: SuggestionOptions,
): ScoredRecipe[] {
  const {
    mealSlot,
    limit = 12,
    servings,
  } = options;

  const scoreMealSlot: MealSlot = mealSlot === 'any' ? 'dinner' : mealSlot;
  const filtered = filterRecipes(recipes, options);
  const scoreOptions = servings ? { servings } : undefined;

  const scored: ScoredRecipe[] = filtered.map((recipe) =>
    scoreRecipe(recipe, pantry, preferences, scoreMealSlot, scoreOptions),
  );

  const viable = scored.filter((s) => s.score > -500);
  return sortSuggestions(viable).slice(0, limit);
}

export function matchLevelLabel(level: ScoredRecipe['matchLevel']): string {
  switch (level) {
    case 'ready':
      return 'Ready now';
    case 'missing_one':
      return 'Missing 1 item';
    case 'need_shopping':
      return 'Need shopping';
  }
}
