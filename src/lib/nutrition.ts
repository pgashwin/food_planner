import type { Recipe } from '../types';

/** Approximate kcal per serving for built-in recipes. */
export function getCaloriesPerServing(recipe: Pick<Recipe, 'caloriesPerServing' | 'mealSlots' | 'ingredients' | 'prepMinutes' | 'cookMinutes'>): number {
  if (recipe.caloriesPerServing != null && recipe.caloriesPerServing > 0) {
    return recipe.caloriesPerServing;
  }
  return estimateCaloriesPerServing(recipe);
}

export function getTotalCalories(
  recipe: Pick<Recipe, 'caloriesPerServing' | 'mealSlots' | 'ingredients' | 'prepMinutes' | 'cookMinutes'>,
  servings: number,
): number {
  return Math.round(getCaloriesPerServing(recipe) * servings);
}

export function formatCalories(kcal: number): string {
  return `${kcal.toLocaleString()} kcal`;
}

export function formatCaloriesPerServing(recipe: Parameters<typeof getCaloriesPerServing>[0]): string {
  return `${formatCalories(getCaloriesPerServing(recipe))}/serving`;
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

  const names = recipe.ingredients
    .filter((i) => !i.optional)
    .map((i) => i.name.toLowerCase())
    .join(' ');

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
