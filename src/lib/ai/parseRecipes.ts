import type { MealSlot, Recipe } from '../../types';
import { slugifyId } from '../recipeDedup';

function normalizeCuisine(cuisine?: string): { cuisine: string; extraTags: string[] } {
  const raw = cuisine?.trim().toLowerCase() || 'custom';
  if (raw.includes('south') && raw.includes('indian')) {
    return { cuisine: 'indian', extraTags: ['south_indian'] };
  }
  if (raw.includes('north') && raw.includes('indian')) {
    return { cuisine: 'indian', extraTags: ['north_indian'] };
  }
  return { cuisine: raw.replace(/\s+/g, '_'), extraTags: [] };
}

export interface AIRecipePayload {
  name: string;
  totalMinutes?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  cuisine?: string;
  vegetarian?: boolean;
  kidFriendly?: boolean;
  description?: string;
  ingredients: { name: string; quantity?: string; optional?: boolean }[];
  steps: string[];
}

function parseJsonArray(text: string): AIRecipePayload[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function splitMinutes(total: number): { prepMinutes: number; cookMinutes: number } {
  const prepMinutes = Math.max(5, Math.round(total * 0.3));
  const cookMinutes = Math.max(5, total - prepMinutes);
  return { prepMinutes, cookMinutes };
}

export function aiPayloadsToRecipes(
  payloads: AIRecipePayload[],
  mealSlot: MealSlot,
  baseServings: number,
): Recipe[] {
  const batchId = Date.now();

  return payloads
    .filter((p) => p.name && Array.isArray(p.ingredients) && Array.isArray(p.steps))
    .map((payload, index) => {
      const fromParts = (payload.prepMinutes ?? 0) + (payload.cookMinutes ?? 0);
      const totalMinutes = payload.totalMinutes ?? (fromParts || 30);
      const { prepMinutes, cookMinutes } = payload.prepMinutes || payload.cookMinutes
        ? {
            prepMinutes: payload.prepMinutes ?? 10,
            cookMinutes: payload.cookMinutes ?? 20,
          }
        : splitMinutes(totalMinutes);

      const { cuisine: normalizedCuisine, extraTags } = normalizeCuisine(payload.cuisine);
      const baseTags = payload.description ? ['quick'] : [];

      return {
        id: `ai-${slugifyId(payload.name)}-${batchId}-${index}`,
        name: payload.name.trim(),
        cuisine: normalizedCuisine,
        mealSlots: [mealSlot],
        prepMinutes,
        cookMinutes,
        baseServings,
        difficulty: totalMinutes <= 30 ? 'easy' : totalMinutes <= 50 ? 'medium' : 'hard',
        tags: [...baseTags, ...extraTags],
        kidFriendly: payload.kidFriendly ?? true,
        vegetarian: payload.vegetarian ?? false,
        spiceLevel: 'mild' as const,
        ingredients: payload.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          optional: i.optional,
        })),
        steps: payload.steps,
        aiGenerated: true,
      };
    });
}

export function parseAIRecipeResponse(
  response: string,
  mealSlot: MealSlot,
  baseServings: number,
): Recipe[] {
  const payloads = parseJsonArray(response);
  return aiPayloadsToRecipes(payloads, mealSlot, baseServings);
}
