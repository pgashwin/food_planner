import type { Recipe } from '../types';
import { slugifyId } from './recipeDedup';
import { sanitizeRecipeTags } from './recipeTags';

export function toSavedRecipe(source: Recipe): Recipe {
  const { aiGenerated: _, ...rest } = source;
  return {
    ...rest,
    id: `saved-${slugifyId(source.name)}-${Date.now()}`,
    tags: sanitizeRecipeTags(source.tags),
    cuisine: source.cuisine === 'AI suggested' ? 'Custom' : source.cuisine,
  };
}

export { visibleRecipeTags } from './recipeTags';
