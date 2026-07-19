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

function nameContainsNonVegKeyword(name: string): boolean {
  const normalized = normalizeIngredient(name);
  const tokens = normalized.split(/\s+/);
  return NON_VEG_KEYWORDS.some((kw) => tokens.includes(kw) || normalized.includes(kw));
}

export function ingredientIsNonVegetarian(name: string): boolean {
  return nameContainsNonVegKeyword(name);
}

export function ingredientsAreVegetarian(ingredients: Ingredient[]): boolean {
  return !ingredients.some((ing) => !ing.optional && ingredientIsNonVegetarian(ing.name));
}

export function isRecipeVegetarian(recipe: Pick<Recipe, 'ingredients'>): boolean {
  return ingredientsAreVegetarian(recipe.ingredients);
}
