import type { Recipe } from '../types';
import { slugifyId } from './recipeDedup';

export function toSavedRecipe(source: Recipe): Recipe {
  const { aiGenerated: _, ...rest } = source;
  return {
    ...rest,
    id: `saved-${slugifyId(source.name)}-${Date.now()}`,
    tags: source.tags.filter((t) => t !== 'ai_suggested'),
    cuisine: source.cuisine === 'AI suggested' ? 'Custom' : source.cuisine,
  };
}

export const HIDDEN_RECIPE_TAGS = new Set(['ai_suggested', 'kid_friendly', 'vegetarian']);

export function visibleRecipeTags(tags: string[]): string[] {
  return tags.filter((t) => !HIDDEN_RECIPE_TAGS.has(t));
}
