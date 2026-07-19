import type {
  FeedbackEntry,
  MealSlot,
  PreferenceProfile,
  Recipe,
} from '../types';

const DEFAULT_PROFILE: PreferenceProfile = {
  tagWeights: {},
  dishScores: {},
  blockedDishes: [],
  favoriteDishes: [],
  cookHistory: [],
};

export function getDefaultPreferences(): PreferenceProfile {
  return structuredClone(DEFAULT_PROFILE);
}

export function scoreRecipePreferences(
  recipe: Recipe,
  profile: PreferenceProfile,
  mealSlot: MealSlot,
): number {
  let score = 0;

  if (profile.blockedDishes.includes(recipe.id)) return -1000;
  if (profile.favoriteDishes.includes(recipe.id)) score += 5;

  const dishScore = profile.dishScores[recipe.id] ?? 0;
  score += dishScore * 2;

  for (const tag of recipe.tags) {
    score += (profile.tagWeights[tag] ?? 0) * 0.5;
  }

  score += (profile.tagWeights[recipe.cuisine] ?? 0) * 1.5;
  score += (profile.tagWeights[mealSlot] ?? 0) * 0.3;

  return score;
}

export function varietyPenalty(
  recipe: Recipe,
  profile: PreferenceProfile,
  daysBack = 7,
): number {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const recent = profile.cookHistory.filter((h) => h.cookedAt > cutoff);
  const count = recent.filter((h) => h.recipeId === recipe.id).length;
  return count * 3;
}

export function applyFeedback(
  profile: PreferenceProfile,
  recipe: Recipe,
  rating: 'up' | 'down',
): PreferenceProfile {
  const updated = structuredClone(profile);
  const delta = rating === 'up' ? 1 : -1;

  updated.dishScores[recipe.id] = (updated.dishScores[recipe.id] ?? 0) + delta * 2;

  for (const tag of [...recipe.tags, recipe.cuisine]) {
    updated.tagWeights[tag] = (updated.tagWeights[tag] ?? 0) + delta;
  }

  return updated;
}

export function recordCook(
  profile: PreferenceProfile,
  recipe: Recipe,
  mealSlot: MealSlot,
  servings: number,
  kidsLiked?: boolean,
): PreferenceProfile {
  const updated = structuredClone(profile);

  updated.cookHistory.unshift({
    recipeId: recipe.id,
    recipeName: recipe.name,
    cookedAt: Date.now(),
    mealSlot,
    servings,
    kidsLiked,
  });

  updated.cookHistory = updated.cookHistory.slice(0, 100);

  updated.dishScores[recipe.id] = (updated.dishScores[recipe.id] ?? 0) + 3;

  for (const tag of [...recipe.tags, recipe.cuisine]) {
    updated.tagWeights[tag] = (updated.tagWeights[tag] ?? 0) + 1;
  }

  return updated;
}

export function toggleFavorite(profile: PreferenceProfile, recipeId: string): PreferenceProfile {
  const updated = structuredClone(profile);
  const idx = updated.favoriteDishes.indexOf(recipeId);
  if (idx >= 0) {
    updated.favoriteDishes.splice(idx, 1);
  } else {
    updated.favoriteDishes.push(recipeId);
  }
  return updated;
}

export function isFavorite(profile: PreferenceProfile, recipeId: string): boolean {
  return profile.favoriteDishes.includes(recipeId);
}

export async function saveFeedback(
  saveFn: (entry: FeedbackEntry) => Promise<void>,
  recipeId: string,
  rating: 'up' | 'down',
  mealSlot: MealSlot,
): Promise<void> {
  await saveFn({ recipeId, rating, timestamp: Date.now(), mealSlot });
}
