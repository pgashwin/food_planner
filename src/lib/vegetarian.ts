import type { Ingredient, Recipe } from '../types';
import { normalizeIngredient } from './ingredients';

const NON_VEG_KEYWORDS = [
  'egg',
  'chicken',
  'fish',
  'prawn',
  'shrimp',
  'mutton',
  'lamb',
  'beef',
  'pork',
  'bacon',
  'mince',
  'turkey',
  'duck',
  'sausage',
  'ham',
  'salami',
  'anchovy',
  'crab',
  'lobster',
  'squid',
  'calamari',
  'venison',
];

/** Whole-word match so "eggplant" and "eggplant" variants are not treated as egg. */
function matchesNonVegKeyword(normalized: string, keyword: string): boolean {
  const pattern = keyword === 'egg' ? /\beggs?\b/ : new RegExp(`\\b${keyword}s?\\b`);
  return pattern.test(normalized);
}

export function ingredientIsNonVegetarian(name: string): boolean {
  const normalized = normalizeIngredient(name);
  return NON_VEG_KEYWORDS.some((kw) => matchesNonVegKeyword(normalized, kw));
}

export function ingredientsAreVegetarian(ingredients: Ingredient[]): boolean {
  return !ingredients.some((ing) => !ing.optional && ingredientIsNonVegetarian(ing.name));
}

export function isRecipeVegetarian(recipe: Pick<Recipe, 'ingredients'>): boolean {
  return ingredientsAreVegetarian(recipe.ingredients);
}
