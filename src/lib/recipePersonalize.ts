import type { Recipe } from '../types';
import type { RecipeCuisineOverride } from '../types';
import { sanitizeRecipeTags } from './recipeTags';
import { isRecipeVegetarian } from './vegetarian';

export function applyRecipePersonalization(
  recipe: Recipe,
  cuisineOverrides: Record<string, RecipeCuisineOverride>,
): Recipe {
  const override = cuisineOverrides[recipe.id];
  const personalized = override
    ? {
        ...recipe,
        cuisine: override.cuisine,
        tags: sanitizeRecipeTags(override.tags),
      }
    : { ...recipe, tags: sanitizeRecipeTags(recipe.tags) };

  return {
    ...personalized,
    vegetarian: isRecipeVegetarian(personalized),
  };
}
