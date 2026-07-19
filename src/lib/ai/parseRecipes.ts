import type { MealSlot, Recipe } from '../../types';
import { slugifyId } from '../recipeDedup';
import { sanitizeRecipeTags } from '../recipeTags';
import { ingredientsAreVegetarian } from '../vegetarian';

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

      const ingredients = payload.ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        optional: i.optional,
      }));

      return {
        id: `ai-${slugifyId(payload.name)}-${batchId}-${index}`,
        name: payload.name.trim(),
        cuisine: normalizedCuisine,
        mealSlots: [mealSlot],
        prepMinutes,
        cookMinutes,
        baseServings,
        difficulty: totalMinutes <= 30 ? 'easy' : totalMinutes <= 50 ? 'medium' : 'hard',
        tags: sanitizeRecipeTags(extraTags),
        kidFriendly: payload.kidFriendly ?? true,
        vegetarian: ingredientsAreVegetarian(ingredients),
        spiceLevel: 'mild' as const,
        ingredients,
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

export interface AIDishPromptResult {
  isFoodRelated: boolean;
  rejectReason?: string;
  recipe?: Recipe;
}

function isAcceptedPrompt(parsed: Record<string, unknown>): boolean {
  if (parsed.isFoodRelated === true || parsed.isDish === true) return true;
  return false;
}

function isRejectedPrompt(parsed: Record<string, unknown>): boolean {
  if (parsed.isFoodRelated === false || parsed.isDish === false) return true;
  return false;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function parseAIDishPromptResponse(
  response: string,
  mealSlot: MealSlot,
  baseServings: number,
): AIDishPromptResult {
  const parsed = parseJsonObject(response);
  if (!parsed) {
    return { isFoodRelated: false, rejectReason: 'Could not understand the response. Try again.' };
  }

  if (isRejectedPrompt(parsed)) {
    return {
      isFoodRelated: false,
      rejectReason:
        typeof parsed.rejectReason === 'string' && parsed.rejectReason.trim()
          ? parsed.rejectReason.trim()
          : 'That prompt is not about meals or cooking. Try a dish name or ingredients you want to use.',
    };
  }

  if (!isAcceptedPrompt(parsed)) {
    return {
      isFoodRelated: false,
      rejectReason: 'Could not tell if that was a meal idea. Try a dish name or ingredients to cook with.',
    };
  }

  const recipePayload = parsed.recipe as AIRecipePayload | undefined;
  if (!recipePayload?.name || !Array.isArray(recipePayload.ingredients) || !Array.isArray(recipePayload.steps)) {
    return { isFoodRelated: false, rejectReason: 'AI did not return a valid recipe. Try rephrasing your prompt.' };
  }

  const recipes = aiPayloadsToRecipes([recipePayload], mealSlot, baseServings);
  if (recipes.length === 0) {
    return { isFoodRelated: false, rejectReason: 'Could not build a recipe from the response.' };
  }

  return { isFoodRelated: true, recipe: recipes[0] };
}
