import { normalizeIngredient } from './ingredients';

/** Umbrella terms that are too vague for pantry tracking. */
export const VAGUE_PANTRY_TERMS = new Set([
  'flour',
  'lentil',
  'lentils',
  'dal',
  'rice',
  'cheese',
  'beans',
  'oil',
  'pasta',
  'noodles',
  'bread',
]);

export const SPECIFIC_ALTERNATIVES: Record<string, string[]> = {
  flour: ['all purpose flour', 'atta', 'semolina', 'maida'],
  lentil: ['moong dal', 'toor dal', 'masoor dal', 'kidney beans', 'chickpeas', 'black beans'],
  lentils: ['moong dal', 'toor dal', 'masoor dal', 'kidney beans', 'chickpeas', 'black beans'],
  dal: ['moong dal', 'toor dal', 'masoor dal'],
  rice: ['basmati rice', 'poha', 'arborio rice', 'jasmine rice'],
  cheese: ['cheddar', 'mozzarella', 'parmesan', 'feta'],
  beans: ['green beans', 'kidney beans', 'black beans', 'chickpeas'],
  oil: ['vegetable oil', 'olive oil'],
  pasta: ['spaghetti', 'penne', 'macaroni'],
  noodles: ['hakka noodles', 'rice noodles'],
  bread: ['sandwich bread', 'tortillas', 'pita bread'],
};

export function isVaguePantryTerm(name: string): boolean {
  const norm = normalizeIngredient(name);
  return VAGUE_PANTRY_TERMS.has(norm);
}

export function vaguePantryMessage(name: string): string {
  const norm = normalizeIngredient(name);
  const alts = SPECIFIC_ALTERNATIVES[norm];
  if (!alts) {
    return `"${name}" is too vague. Use a specific ingredient (e.g. all purpose flour, not flour).`;
  }
  return `"${name}" is too vague. Try: ${alts.join(', ')}.`;
}

export function filterSpecificPantryNames(names: string[]): {
  accepted: string[];
  rejected: string[];
} {
  const accepted: string[] = [];
  const rejected: string[] = [];
  for (const name of names) {
    if (isVaguePantryTerm(name)) rejected.push(name);
    else accepted.push(name);
  }
  return { accepted, rejected };
}
