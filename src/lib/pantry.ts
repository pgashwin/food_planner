import type { MatchLevel, PantryItem, Recipe } from '../types';
import { ingredientMatches, normalizeIngredient } from './ingredients';

export interface PantryMatchResult {
  matchLevel: MatchLevel;
  missingIngredients: string[];
  haveIngredients: string[];
  pantryScore: number;
}

export function matchRecipeToPantry(recipe: Recipe, pantry: PantryItem[]): PantryMatchResult {
  const available = pantry.filter((p) => p.status !== 'out');
  const required = recipe.ingredients.filter((i) => !i.optional);

  const haveIngredients: string[] = [];
  const missingIngredients: string[] = [];

  for (const ing of required) {
    const hasIt = available.some((p) => ingredientMatches(p.normalizedName, ing.name));
    if (hasIt) {
      haveIngredients.push(ing.name);
    } else {
      missingIngredients.push(ing.name);
    }
  }

  let matchLevel: MatchLevel;
  if (missingIngredients.length === 0) {
    matchLevel = 'ready';
  } else if (missingIngredients.length === 1) {
    matchLevel = 'missing_one';
  } else {
    matchLevel = 'need_shopping';
  }

  const pantryScore =
    required.length === 0 ? 1 : haveIngredients.length / required.length;

  return { matchLevel, missingIngredients, haveIngredients, pantryScore };
}

export function createPantryItem(name: string): PantryItem {
  return {
    name: name.replace(/_/g, ' '),
    normalizedName: normalizeIngredient(name),
    status: 'enough',
    addedAt: Date.now(),
  };
}

export function mergePantryItems(existing: PantryItem[], newNames: string[]): PantryItem[] {
  const map = new Map(existing.map((p) => [p.normalizedName, p]));

  for (const name of newNames) {
    const norm = normalizeIngredient(name);
    if (!map.has(norm)) {
      map.set(norm, createPantryItem(norm));
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
