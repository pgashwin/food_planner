import { normalizeIngredient } from './ingredients';
import type { PantryStatus, QuantityProfile } from '../types';

export type { QuantityProfile };

export interface QuantityProfileConfig {
  steps: number[];
  unit: string;
  enoughIndex: number;
  lowIndex: number;
}

export const QUANTITY_PROFILES: Record<QuantityProfile, QuantityProfileConfig> = {
  count: {
    steps: [0, 1, 2, 3, 4, 5, 6, 8, 10],
    unit: '',
    enoughIndex: 3,
    lowIndex: 1,
  },
  volume: {
    steps: [0, 0.5, 1, 2, 3, 5, 8],
    unit: 'cup',
    enoughIndex: 3,
    lowIndex: 1,
  },
  weight: {
    steps: [0, 100, 200, 250, 500, 750, 1000],
    unit: 'g',
    enoughIndex: 3,
    lowIndex: 1,
  },
  small_volume: {
    steps: [0, 1, 2, 3, 5, 8],
    unit: 'tbsp',
    enoughIndex: 3,
    lowIndex: 1,
  },
};

const COUNT_ITEMS = new Set([
  'tomato', 'onion', 'egg', 'potato', 'banana', 'carrot', 'lemon', 'bread',
  'bell_pepper', 'mushroom', 'avocado', 'chili', 'beans', 'spinach',
]);

const VOLUME_ITEMS = new Set([
  'milk', 'cream', 'yogurt', 'vegetable_oil', 'olive_oil', 'vegetable_stock', 'coconut_milk', 'water', 'juice',
  'white_vinegar', 'soy_sauce', 'honey', 'oats',
]);

const WEIGHT_ITEMS = new Set([
  'chicken_breast', 'paneer', 'cheddar', 'mozzarella', 'parmesan', 'feta',
  'all_purpose_flour', 'atta', 'semolina', 'maida',
  'basmati_rice', 'poha', 'arborio_rice',
  'moong_dal', 'toor_dal', 'masoor_dal', 'kidney_beans', 'chickpeas', 'black_beans',
  'butter', 'tofu', 'sugar', 'peanut_butter',
]);

const SMALL_VOLUME_ITEMS = new Set([
  'salt', 'black_pepper', 'turmeric_powder', 'cumin_seeds', 'ginger', 'garlic', 'ghee',
  'red_chili',
]);

export function inferQuantityProfile(name: string): QuantityProfile {
  const norm = normalizeIngredient(name);

  if (COUNT_ITEMS.has(norm)) return 'count';
  if (VOLUME_ITEMS.has(norm)) return 'volume';
  if (WEIGHT_ITEMS.has(norm)) return 'weight';
  if (SMALL_VOLUME_ITEMS.has(norm)) return 'small_volume';

  if (norm.includes('milk') || norm.includes('cream') || norm.includes('oil')) return 'volume';
  if (norm.includes('chicken') || norm.includes('paneer') || norm.includes('dal')) return 'weight';
  if (norm.includes('flour') || norm.includes('atta') || norm.includes('semolina') || norm.includes('maida')) {
    return 'weight';
  }

  return 'count';
}

export function getProfileSteps(profile: QuantityProfile): number[] {
  return QUANTITY_PROFILES[profile].steps;
}

export function cycleProfileQuantity(
  profile: QuantityProfile,
  current: number,
  direction: 1 | -1 = 1,
): number {
  const steps = getProfileSteps(profile);
  if (steps.length === 0) return current;

  const idx = steps.findIndex((s) => s === current);
  if (idx === -1) {
    const next = steps.find((s) => s > current);
    return next ?? steps[steps.length - 1];
  }

  const nextIdx = (idx + direction + steps.length) % steps.length;
  return steps[nextIdx];
}

export function quantityForProfileStatus(profile: QuantityProfile, status: PantryStatus): number {
  const config = QUANTITY_PROFILES[profile];
  const steps = config.steps;
  const index =
    status === 'out' ? 0 : status === 'low' ? config.lowIndex : config.enoughIndex;
  return steps[Math.min(index, steps.length - 1)];
}

export function statusFromProfileQuantity(profile: QuantityProfile, quantity: number): PantryStatus {
  const config = QUANTITY_PROFILES[profile];
  const steps = config.steps;
  if (quantity <= steps[0]) return 'out';
  if (quantity <= steps[config.lowIndex]) return 'low';
  return 'enough';
}

export function formatProfileQuantity(value: number, profile: QuantityProfile): string {
  const { unit } = QUANTITY_PROFILES[profile];
  if (profile === 'count') {
    return value === 1 ? '1 pc' : `${value} pcs`;
  }
  if (value === 0) return 'Out';
  if (unit === 'cup' && value === 0.5) return '½ cup';
  return unit ? `${value} ${unit}` : `Qty: ${value}`;
}
