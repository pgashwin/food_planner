/** Ingredients treated as always available (no pantry stock check). */
export const PANTRY_STAPLES = new Set([
  'salt',
  'pepper',
  'oil',
  'water',
  'sugar',
]);

export function evalFraction(value: string): number {
  const trimmed = value.trim();
  if (trimmed.includes('/')) {
    const [a, b] = trimmed.split('/').map(Number);
    if (!b) return Number(trimmed) || 0;
    return a / b;
  }
  return Number(trimmed) || 0;
}

/** Parse a numeric amount from a free-text ingredient quantity string. */
export function parseIngredientUnits(quantity?: string): number {
  if (!quantity?.trim()) return 1;

  const leading = quantity.match(/^([\d./]+)/);
  if (leading) return Math.max(evalFraction(leading[1]), 0.25);

  const embedded = quantity.match(/([\d./]+)/);
  if (embedded) return Math.max(evalFraction(embedded[1]), 0.25);

  return 1;
}

export function scaledIngredientUnits(quantity: string | undefined, scaleFactor: number): number {
  const units = parseIngredientUnits(quantity) * scaleFactor;
  return Math.round(units * 4) / 4;
}

export function isPantryStaple(ingredientName: string): boolean {
  const normalized = ingredientName.toLowerCase().replace(/\s+/g, '_');
  if (PANTRY_STAPLES.has(normalized)) return true;
  return [...PANTRY_STAPLES].some((s) => normalized.includes(s));
}
