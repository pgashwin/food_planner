import type { MatchLevel, PantryItem, PantryQuantitySettings, Recipe } from '../types';
import { ingredientMatches, normalizeIngredient } from './ingredients';
import {
  isPantryStaple,
  scaledIngredientUnits,
} from './ingredientQuantities';
import { quantityForStatus } from './pantryQuantities';

export interface PantryMatchOptions {
  servings?: number;
  baseServings?: number;
}

export interface PantryMatchResult {
  matchLevel: MatchLevel;
  missingIngredients: string[];
  haveIngredients: string[];
  pantryScore: number;
}

function findPantryItem(pantry: PantryItem[], ingredientName: string): PantryItem | undefined {
  return pantry.find((p) => ingredientMatches(p.normalizedName, ingredientName));
}

function availableUnits(item: PantryItem): number {
  if (item.status === 'out') return 0;
  return item.quantity;
}

export function matchRecipeToPantry(
  recipe: Recipe,
  pantry: PantryItem[],
  options?: PantryMatchOptions,
): PantryMatchResult {
  const servings = options?.servings ?? recipe.baseServings;
  const baseServings = options?.baseServings ?? recipe.baseServings;
  const scaleFactor = baseServings > 0 ? servings / baseServings : 1;

  const required = recipe.ingredients.filter((i) => !i.optional);
  const haveIngredients: string[] = [];
  const missingIngredients: string[] = [];

  for (const ing of required) {
    if (isPantryStaple(ing.name)) {
      haveIngredients.push(ing.name);
      continue;
    }

    const pantryItem = findPantryItem(pantry, ing.name);
    const requiredUnits = scaledIngredientUnits(ing.quantity, scaleFactor);

    if (!pantryItem) {
      missingIngredients.push(ing.name);
      continue;
    }

    if (availableUnits(pantryItem) < requiredUnits) {
      missingIngredients.push(ing.name);
      continue;
    }

    haveIngredients.push(ing.name);
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

export function filterRecipesByStrictPantry(
  recipes: Recipe[],
  pantry: PantryItem[],
  servings: number,
): Recipe[] {
  return recipes.filter((recipe) => {
    const match = matchRecipeToPantry(recipe, pantry, {
      servings,
      baseServings: recipe.baseServings,
    });
    return match.matchLevel === 'ready';
  });
}

export function createPantryItem(
  name: string,
  quantitySettings?: PantryQuantitySettings,
  status: PantryItem['status'] = 'enough',
): PantryItem {
  const quantity = quantitySettings
    ? quantityForStatus(quantitySettings, status)
    : 3;
  return {
    name: name.replace(/_/g, ' '),
    normalizedName: normalizeIngredient(name),
    status,
    quantity,
    addedAt: Date.now(),
  };
}

export function mergePantryItems(
  existing: PantryItem[],
  newNames: string[],
  quantitySettings?: PantryQuantitySettings,
): PantryItem[] {
  const map = new Map(existing.map((p) => [p.normalizedName, p]));

  for (const name of newNames) {
    const norm = normalizeIngredient(name);
    if (!map.has(norm)) {
      map.set(norm, createPantryItem(norm, quantitySettings));
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
