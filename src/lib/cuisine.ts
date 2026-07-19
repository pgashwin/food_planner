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

function formatCuisineName(cuisine: string): string {
  return cuisine
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Display label for cards — splits Indian into South / North when tagged. */
export function getRecipeCuisineLabel(recipe: Recipe): string {
  if (recipe.tags.includes('south_indian')) return 'South Indian';
  if (recipe.tags.includes('north_indian')) return 'North Indian';
  return formatCuisineName(recipe.cuisine);
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
