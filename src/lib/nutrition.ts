import type { MacroNutrients, Recipe } from '../types';

type NutritionRecipe = Pick<
  Recipe,
  'caloriesPerServing' | 'macrosPerServing' | 'mealSlots' | 'ingredients' | 'prepMinutes' | 'cookMinutes'
>;

export interface NutritionTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Approximate kcal per serving for built-in recipes. */
export function getCaloriesPerServing(recipe: NutritionRecipe): number {
  if (recipe.caloriesPerServing != null && recipe.caloriesPerServing > 0) {
    return recipe.caloriesPerServing;
  }
  return estimateCaloriesPerServing(recipe);
}

export function getMacrosPerServing(recipe: NutritionRecipe): MacroNutrients {
  if (
    recipe.macrosPerServing &&
    recipe.macrosPerServing.proteinG >= 0 &&
    recipe.macrosPerServing.carbsG >= 0 &&
    recipe.macrosPerServing.fatG >= 0
  ) {
    return roundMacros(recipe.macrosPerServing);
  }
  return estimateMacrosPerServing(recipe);
}

export function getNutritionPerServing(recipe: NutritionRecipe): NutritionTotals {
  const macros = getMacrosPerServing(recipe);
  return {
    calories: getCaloriesPerServing(recipe),
    ...macros,
  };
}

export function getTotalNutrition(recipe: NutritionRecipe, servings: number): NutritionTotals {
  const perServing = getNutritionPerServing(recipe);
  return {
    calories: Math.round(perServing.calories * servings),
    proteinG: Math.round(perServing.proteinG * servings),
    carbsG: Math.round(perServing.carbsG * servings),
    fatG: Math.round(perServing.fatG * servings),
  };
}

export function getTotalCalories(recipe: NutritionRecipe, servings: number): number {
  return getTotalNutrition(recipe, servings).calories;
}

export function formatCalories(kcal: number): string {
  return `${kcal.toLocaleString()} kcal`;
}

export function formatCaloriesPerServing(recipe: NutritionRecipe): string {
  return `${formatCalories(getCaloriesPerServing(recipe))}/serving`;
}

export function formatMacroGrams(grams: number): string {
  return `${grams}g`;
}

function roundMacros(macros: MacroNutrients): MacroNutrients {
  return {
    proteinG: Math.round(macros.proteinG),
    carbsG: Math.round(macros.carbsG),
    fatG: Math.round(macros.fatG),
  };
}

function ingredientNames(recipe: Pick<Recipe, 'ingredients'>): string {
  return recipe.ingredients
    .filter((i) => !i.optional)
    .map((i) => i.name.toLowerCase())
    .join(' ');
}

/** Fallback when calories are missing (saved or older AI recipes). */
export function estimateCaloriesPerServing(
  recipe: Pick<Recipe, 'mealSlots' | 'ingredients' | 'prepMinutes' | 'cookMinutes'>,
): number {
  const slots = recipe.mealSlots;
  let base = 380;
  if (slots.includes('smoothie')) base = 190;
  else if (slots.includes('snack')) base = 240;
  else if (slots.includes('dessert')) base = 320;
  else if (slots.includes('breakfast')) base = 340;

  const names = ingredientNames(recipe);

  let cal = base + recipe.ingredients.filter((i) => !i.optional).length * 10;

  if (/chicken|fish|beef|mutton|pork|egg|paneer|tofu|dal|bean|chickpea|kidney|lentil|yogurt|cheese|milk/.test(names)) {
    cal += 70;
  }
  if (/cream|butter|ghee|oil|coconut milk|cheese|peanut/.test(names)) {
    cal += 55;
  }
  if (/rice|pasta|noodle|bread|flour|potato|macaroni/.test(names)) {
    cal += 45;
  }

  const totalTime = recipe.prepMinutes + recipe.cookMinutes;
  if (totalTime > 50) cal += 35;

  return Math.round(Math.min(900, Math.max(120, cal)) / 10) * 10;
}

/** Estimate P/C/F from calories and ingredient profile. */
export function estimateMacrosPerServing(recipe: NutritionRecipe): MacroNutrients {
  const calories = getCaloriesPerServing(recipe);
  const names = ingredientNames(recipe);

  let proteinShare = 0.22;
  let fatShare = 0.32;
  let carbShare = 0.46;

  if (/chicken|fish|beef|mutton|pork|egg|paneer|tofu|dal|bean|chickpea|kidney|lentil|yogurt|cheese|milk|moong|toor|rajma/.test(names)) {
    proteinShare += 0.1;
    carbShare -= 0.05;
  }
  if (/cream|butter|ghee|oil|coconut milk|peanut|alfredo|mac and cheese/.test(names)) {
    fatShare += 0.12;
    carbShare -= 0.08;
  }
  if (/rice|pasta|noodle|bread|flour|potato|macaroni|oats|semolina|poha|basmati|spaghetti/.test(names)) {
    carbShare += 0.12;
    proteinShare -= 0.04;
  }
  if (/salad|spinach|cucumber|tomato|lettuce|broccoli|green beans/.test(names)) {
    carbShare -= 0.06;
    proteinShare -= 0.02;
    fatShare -= 0.04;
  }

  const totalShare = proteinShare + fatShare + carbShare;
  proteinShare /= totalShare;
  fatShare /= totalShare;
  carbShare /= totalShare;

  return roundMacros({
    proteinG: (calories * proteinShare) / 4,
    carbsG: (calories * carbShare) / 4,
    fatG: (calories * fatShare) / 9,
  });
}

export function parseMacroNutrients(value: unknown): MacroNutrients | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  const proteinG = Number(v.proteinG ?? v.protein);
  const carbsG = Number(v.carbsG ?? v.carbs);
  const fatG = Number(v.fatG ?? v.fat);
  if (![proteinG, carbsG, fatG].every((n) => Number.isFinite(n) && n >= 0)) return undefined;
  return roundMacros({ proteinG, carbsG, fatG });
}
