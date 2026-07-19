import type { Recipe } from '../types';
import type { CuisineFilter } from '../types';

export const CUISINE_OPTIONS: { value: CuisineFilter; label: string }[] = [
  { value: 'any', label: 'Any cuisine' },
  { value: 'indian', label: 'Indian' },
  { value: 'south_indian', label: 'South Indian' },
  { value: 'north_indian', label: 'North Indian' },
  { value: 'american', label: 'American' },
  { value: 'italian', label: 'Italian' },
  { value: 'asian', label: 'Asian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'mexican', label: 'Mexican' },
];

export type RecipeCuisineValue = Exclude<CuisineFilter, 'any'>;

export const RECIPE_CUISINE_OPTIONS = CUISINE_OPTIONS.filter(
  (c): c is { value: RecipeCuisineValue; label: string } => c.value !== 'any',
);

function formatCuisineName(cuisine: string): string {
  return cuisine
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getRecipeCuisineValue(recipe: Recipe): RecipeCuisineValue {
  if (recipe.tags.includes('south_indian')) return 'south_indian';
  if (recipe.tags.includes('north_indian')) return 'north_indian';
  if (recipe.cuisine === 'indian') return 'indian';
  const match = RECIPE_CUISINE_OPTIONS.find((c) => c.value === recipe.cuisine);
  return match?.value ?? 'american';
}

/** Display label for cards — splits Indian into South / North when tagged. */
export function getRecipeCuisineLabel(recipe: Recipe): string {
  const value = getRecipeCuisineValue(recipe);
  return RECIPE_CUISINE_OPTIONS.find((c) => c.value === value)?.label ?? formatCuisineName(recipe.cuisine);
}

export function recipeFieldsFromCuisineValue(
  value: RecipeCuisineValue,
): { cuisine: string; tags: string[] } {
  switch (value) {
    case 'south_indian':
      return { cuisine: 'indian', tags: ['south_indian'] };
    case 'north_indian':
      return { cuisine: 'indian', tags: ['north_indian'] };
    case 'indian':
      return { cuisine: 'indian', tags: [] };
    default:
      return { cuisine: value, tags: [] };
  }
}

export function recipeMatchesCuisine(recipe: Recipe, filter: CuisineFilter): boolean {
  if (filter === 'any') return true;
  if (filter === 'south_indian') return recipe.tags.includes('south_indian');
  if (filter === 'north_indian') return recipe.tags.includes('north_indian');
  if (filter === 'indian') {
    return (
      recipe.cuisine === 'indian' ||
      recipe.tags.includes('south_indian') ||
      recipe.tags.includes('north_indian')
    );
  }
  return recipe.cuisine === filter;
}
