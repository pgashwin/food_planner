import type { PantryQuantitySettings, PantryStatus } from '../types';

export const DEFAULT_PANTRY_QUANTITIES: PantryQuantitySettings = {
  steps: [0, 1, 2, 3, 5, 10],
  statusQuantities: {
    enough: 3,
    low: 1,
    out: 0,
  },
};

export function normalizePantryQuantities(
  settings?: Partial<PantryQuantitySettings>,
): PantryQuantitySettings {
  const steps = settings?.steps?.length
    ? [...new Set(settings.steps)].sort((a, b) => a - b)
    : DEFAULT_PANTRY_QUANTITIES.steps;

  return {
    steps,
    statusQuantities: {
      enough: settings?.statusQuantities?.enough ?? DEFAULT_PANTRY_QUANTITIES.statusQuantities.enough,
      low: settings?.statusQuantities?.low ?? DEFAULT_PANTRY_QUANTITIES.statusQuantities.low,
      out: settings?.statusQuantities?.out ?? DEFAULT_PANTRY_QUANTITIES.statusQuantities.out,
    },
  };
}

export function quantityForStatus(
  settings: PantryQuantitySettings,
  status: PantryStatus,
): number {
  return settings.statusQuantities[status];
}

export function cycleQuantity(
  settings: PantryQuantitySettings,
  current: number,
  direction: 1 | -1 = 1,
): number {
  const { steps } = settings;
  if (steps.length === 0) return current;

  const idx = steps.findIndex((s) => s === current);
  if (idx === -1) {
    const next = steps.find((s) => s > current);
    return next ?? steps[steps.length - 1];
  }

  const nextIdx = (idx + direction + steps.length) % steps.length;
  return steps[nextIdx];
}

export function formatQuantity(value: number): string {
  return `Qty: ${value}`;
}

export function parseQuantityStepsInput(input: string): number[] {
  const values = input
    .split(/[,;\s]+/)
    .map((v) => Number(v.trim()))
    .filter((n) => !Number.isNaN(n) && n >= 0);

  return values.length > 0 ? [...new Set(values)].sort((a, b) => a - b) : DEFAULT_PANTRY_QUANTITIES.steps;
}

export function stepsToInput(steps: number[]): string {
  return steps.join(', ');
}
