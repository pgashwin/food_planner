import type { Ingredient, Recipe } from '../types';

export function scaleIngredient(ingredient: Ingredient, factor: number): Ingredient {
  if (!ingredient.quantity || factor === 1) return { ...ingredient };

  const scaled = scaleQuantity(ingredient.quantity, factor);
  return { ...ingredient, quantity: scaled };
}

export function scaleQuantity(quantity: string, factor: number): string {
  const match = quantity.match(/^([\d./]+)\s*(.*)$/);
  if (!match) return quantity;

  const num = evalFraction(match[1]);
  const scaled = roundToNice(num * factor);
  const unit = match[2].trim();
  return unit ? `${scaled} ${unit}` : String(scaled);
}

function evalFraction(s: string): number {
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number);
    return a / b;
  }
  return Number(s);
}

function roundToNice(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const rounded = Math.round(n * 4) / 4;
  if (rounded === Math.floor(rounded)) return String(Math.floor(rounded));
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const fracMap: Record<number, string> = {
    0.25: '1/4',
    0.5: '1/2',
    0.75: '3/4',
  };
  const fracStr = fracMap[frac];
  if (fracStr && whole > 0) return `${whole} ${fracStr}`;
  if (fracStr) return fracStr;
  return String(Math.round(n * 10) / 10);
}

export function scaleRecipe(recipe: Recipe, targetServings: number): Recipe {
  const factor = targetServings / recipe.baseServings;
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((i) => scaleIngredient(i, factor)),
    steps: recipe.steps,
  };
}
