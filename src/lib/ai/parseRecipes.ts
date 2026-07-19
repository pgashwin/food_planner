import type { MealSlot, Recipe } from '../../types';
import { slugifyId } from '../recipeDedup';

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

      return {
        id: `ai-${slugifyId(payload.name)}-${batchId}-${index}`,
        name: payload.name.trim(),
        cuisine: payload.cuisine?.trim() || 'Custom',
        mealSlots: [mealSlot],
        prepMinutes,
        cookMinutes,
        baseServings,
        difficulty: totalMinutes <= 30 ? 'easy' : totalMinutes <= 50 ? 'medium' : 'hard',
        tags: payload.description ? ['quick'] : [],
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
