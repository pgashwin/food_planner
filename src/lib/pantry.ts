import type { MatchLevel, PantryItem, PantryQuantitySettings, Recipe } from '../types';
import { ingredientMatches, normalizeIngredient } from './ingredients';
import { scaledIngredientUnits } from './ingredientQuantities';
import {
  inferQuantityProfile,
  quantityForProfileStatus,
} from './pantryUnits';
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
  const profile = inferQuantityProfile(name);
  const quantity = quantitySettings
    ? quantityForStatus(quantitySettings, status)
    : quantityForProfileStatus(profile, status);
  const normalizedName = normalizeIngredient(name);
  return {
    name: name.replace(/_/g, ' '),
    normalizedName,
    status,
    quantity,
    quantityProfile: profile,
    addedAt: Date.now(),
  };
}

/** Fix legacy items saved with incorrect normalizedName keys. */
export function repairPantryItem(item: PantryItem): PantryItem {
  const normalizedName = normalizeIngredient(item.name);
  if (item.normalizedName === normalizedName) return item;
  return { ...item, normalizedName };
}

export function repairPantryItems(items: PantryItem[]): PantryItem[] {
  const map = new Map<string, PantryItem>();
  for (const item of items.map(repairPantryItem)) {
    const existing = map.get(item.normalizedName);
    if (!existing || (item.id != null && existing.id == null)) {
      map.set(item.normalizedName, item);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function pantryHasIngredient(pantry: PantryItem[], name: string): boolean {
  const norm = normalizeIngredient(name);
  return pantry.some((p) => p.normalizedName === norm);
}

export function findPantryItemByName(pantry: PantryItem[], name: string): PantryItem | undefined {
  const norm = normalizeIngredient(name);
  return pantry.find((p) => p.normalizedName === norm);
}

export function mergePantryItems(
  existing: PantryItem[],
  newNames: string[],
  quantitySettings?: PantryQuantitySettings,
): PantryItem[] {
  const map = new Map(repairPantryItems(existing).map((p) => [p.normalizedName, p]));

  for (const name of newNames) {
    const norm = normalizeIngredient(name);
    if (!map.has(norm)) {
      map.set(norm, createPantryItem(name, quantitySettings));
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
