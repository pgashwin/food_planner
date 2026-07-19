import type { MealSlot, PantryItem, PreferenceProfile, Recipe, ScoredRecipe } from '../types';
import { matchRecipeToPantry } from './pantry';
import {
  scoreRecipePreferences,
  varietyPenalty,
} from './preferences';

export interface SuggestionOptions {
  mealSlot: MealSlot;
  maxMinutes?: number;
  vegetarianOnly?: boolean;
  kidFriendlyOnly?: boolean;
  limit?: number;
}

export function getSuggestions(
  recipes: Recipe[],
  pantry: PantryItem[],
  preferences: PreferenceProfile,
  options: SuggestionOptions,
): ScoredRecipe[] {
  const { mealSlot, maxMinutes, vegetarianOnly, kidFriendlyOnly, limit = 12 } = options;

  let filtered = recipes.filter((r) => r.mealSlots.includes(mealSlot));

  if (maxMinutes) {
    filtered = filtered.filter((r) => r.prepMinutes + r.cookMinutes <= maxMinutes);
  }
  if (vegetarianOnly) {
    filtered = filtered.filter((r) => r.vegetarian);
  }
  if (kidFriendlyOnly) {
    filtered = filtered.filter((r) => r.kidFriendly);
  }

  const scored: ScoredRecipe[] = filtered.map((recipe) => {
    const pantryMatch = matchRecipeToPantry(recipe, pantry);
    const preferenceScore = scoreRecipePreferences(recipe, preferences, mealSlot);
    const variety = varietyPenalty(recipe, preferences);

    const pantryWeight = pantryMatch.pantryScore * 40;
    const matchBonus =
      pantryMatch.matchLevel === 'ready'
        ? 30
        : pantryMatch.matchLevel === 'missing_one'
          ? 10
          : -10;

    const score = pantryWeight + matchBonus + preferenceScore - variety;

    return {
      recipe,
      score,
      matchLevel: pantryMatch.matchLevel,
      missingIngredients: pantryMatch.missingIngredients,
      haveIngredients: pantryMatch.haveIngredients,
      preferenceScore,
      pantryScore: pantryMatch.pantryScore,
      varietyPenalty: variety,
    };
  });

  return scored
    .filter((s) => s.score > -500)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getSurpriseMeal(
  recipes: Recipe[],
  pantry: PantryItem[],
  preferences: PreferenceProfile,
  options: SuggestionOptions,
): ScoredRecipe | null {
  const suggestions = getSuggestions(recipes, pantry, preferences, {
    ...options,
    limit: 5,
  });
  if (suggestions.length === 0) return null;
  const top = suggestions.filter((s) => s.matchLevel !== 'need_shopping');
  const pool = top.length > 0 ? top : suggestions;
  return pool[Math.floor(Math.random() * pool.length)];
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
