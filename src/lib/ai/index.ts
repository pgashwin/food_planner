import type { AISettings, CuisineFilter, MealFilter, MealSlot, Recipe } from '../../types';
import { CUISINE_OPTIONS } from '../cuisine';
import { parseAIRecipeResponse, parseAIDishPromptResponse } from './parseRecipes';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  chat(messages: ChatMessage[]): Promise<string>;
}

export async function createAIProvider(settings: AISettings): Promise<AIProvider | null> {
  if (!settings.enabled || !settings.apiKey) return null;

  switch (settings.provider) {
    case 'openai':
      return createOpenAIProvider(settings);
    case 'gemini':
      return createGeminiProvider(settings);
    case 'claude':
      return createClaudeProvider(settings);
    case 'custom':
      return createOpenAIProvider({
        ...settings,
        customBaseUrl: settings.customBaseUrl ?? 'https://api.openai.com/v1',
      });
    default:
      return null;
  }
}

function createOpenAIProvider(settings: AISettings): AIProvider {
  const baseUrl = settings.customBaseUrl ?? 'https://api.openai.com/v1';

  return {
    async chat(messages) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API error: ${res.status} ${err}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    },
  };
}

function createGeminiProvider(settings: AISettings): AIProvider {
  const model = settings.model || 'gemini-2.0-flash';

  return {
    async chat(messages) {
      const systemMsg = messages.find((m) => m.role === 'system');
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

      const body: Record<string, unknown> = { contents };
      if (systemMsg) {
        body.systemInstruction = { parts: [{ text: systemMsg.content }] };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${err}`);
      }

      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    },
  };
}

function createClaudeProvider(settings: AISettings): AIProvider {
  const model = settings.model || 'claude-3-5-haiku-latest';

  return {
    async chat(messages) {
      const systemMsg = messages.find((m) => m.role === 'system')?.content;
      const claudeMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system: systemMsg,
          messages: claudeMessages,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Claude API error: ${res.status} ${err}`);
      }

      const data = await res.json();
      return data.content[0].text;
    },
  };
}

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful home cooking assistant for a family food planner app.
Focus on practical, everyday meals with common ingredients.
When suggesting recipes, include name, ingredients with quantities, and clear numbered cooking steps.
Each step should be specific: mention heat level (low/medium/high), approximate time, visual or texture cues (golden, translucent, tender), and which ingredients to add at that stage.
Scale recipes for the requested number of servings.`;

export const AI_RECIPE_STEP_GUIDE = `Write 5–8 numbered cooking steps. Each step is one focused action with enough detail to follow accurately (heat, timing, doneness cues, and ingredient amounts where helpful). Do not combine multiple stages into one vague line.`;

export async function suggestMealsWithAI(
  provider: AIProvider,
  pantryItems: string[],
  mealSlot: MealSlot,
  maxMinutes: number,
  servings: number,
  excludeNames: string[] = [],
  pantryValidationMode = true,
  systemPrompt?: string,
  cuisineFilter: CuisineFilter = 'any',
  mealFilter: MealFilter = mealSlot,
): Promise<Recipe[]> {
  const excludeLine = excludeNames.length
    ? `\nDo NOT suggest meals similar to these existing options: ${excludeNames.join('; ')}.`
    : '';

  const cuisineLine =
    cuisineFilter === 'any'
      ? ''
      : `\nCuisine preference: ${CUISINE_OPTIONS.find((c) => c.value === cuisineFilter)?.label ?? cuisineFilter}. Use matching cuisine in the "cuisine" field (for South Indian use "south indian", for North Indian use "north indian").`;

  const mealLine =
    mealFilter === 'any'
      ? 'Suggest any type of meal (breakfast, lunch, dinner, snack, dessert, or smoothie).'
      : `Suggest ${mealFilter} recipes.`;

  const pantryRule = pantryValidationMode
    ? `STRICT PANTRY MODE: Use ONLY ingredients from the pantry list below. Every ingredient must be on that list. Use specific names (e.g. "all purpose flour", "atta", "moong dal", "basmati rice", "cheddar") — never vague terms like "flour", "rice", "lentil", or "cheese". Scale ingredient quantities for ${servings} people and ensure each ingredient amount fits within the listed pantry quantities.`
    : `RELAXED PANTRY MODE: Prefer pantry ingredients but you MAY include items not in the pantry when they improve the meal. Mark extra shopping items clearly in ingredient names if needed.`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt || DEFAULT_SYSTEM_PROMPT}
You must respond with ONLY a valid JSON array. No markdown, no code fences, no extra text.`,
    },
    {
      role: 'user',
      content: `${mealLine} Suggest 3 unique recipes under ${maxMinutes} minutes for ${servings} servings.
${pantryRule}${cuisineLine}
Available pantry: ${pantryItems.join(', ') || 'none — user has not added pantry items yet'}.${excludeLine}

${AI_RECIPE_STEP_GUIDE}

Return a JSON array of objects with this exact shape:
[
  {
    "name": "Recipe Name",
    "totalMinutes": 30,
    "cuisine": "indian",
    "vegetarian": true,
    "description": "One line why this works",
    "ingredients": [{"name": "rice", "quantity": "2 cups"}],
    "steps": ["Heat oil on medium. Add onion; cook 3–4 min until soft.", "Add main ingredients; stir 2 min.", "Simmer 10–12 min until sauce thickens and flavors meld."],
    "caloriesPerServing": 420,
    "macrosPerServing": { "proteinG": 18, "carbsG": 45, "fatG": 14 }
  }
]`,
    },
  ];

  const response = await provider.chat(messages);
  const resolvedSlot: MealSlot = mealFilter === 'any' ? mealSlot : mealFilter;
  return parseAIRecipeResponse(response, resolvedSlot, servings);
}

export interface DishPromptOptions {
  maxMinutes: number;
  servings: number;
  pantryValidationMode?: boolean;
  systemPrompt?: string;
  cuisineFilter?: CuisineFilter;
  mealFilter?: MealFilter;
  vegetarianOnly?: boolean;
}

export async function suggestDishFromUserPrompt(
  provider: AIProvider,
  dishPrompt: string,
  pantryItems: string[],
  mealSlot: MealSlot,
  options: DishPromptOptions,
): Promise<{ ok: true; recipe: Recipe } | { ok: false; reason: string }> {
  const {
    maxMinutes,
    servings,
    pantryValidationMode = true,
    systemPrompt,
    cuisineFilter = 'any',
    mealFilter = mealSlot,
    vegetarianOnly = false,
  } = options;

  const pantryRule = pantryValidationMode
    ? `STRICT PANTRY MODE: Use ONLY ingredients from the pantry list. Use specific ingredient names (e.g. "all purpose flour", "basmati rice", "moong dal") — never vague terms like "flour" or "rice".`
    : `RELAXED PANTRY MODE: Prefer pantry ingredients but you may include items not in the pantry.`;

  const cuisineLine =
    cuisineFilter === 'any'
      ? ''
      : ` Cuisine: ${CUISINE_OPTIONS.find((c) => c.value === cuisineFilter)?.label ?? cuisineFilter}.`;

  const vegLine = vegetarianOnly ? ' The recipe must be vegetarian.' : '';

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt || DEFAULT_SYSTEM_PROMPT}
You must respond with ONLY valid JSON. No markdown, no code fences, no extra text.`,
    },
    {
      role: 'user',
      content: `The user typed: "${dishPrompt.trim()}"

Step 1 — Decide if this prompt is relevant to a home food/meal planner app.
ACCEPT (isFoodRelated: true) when the user asks for:
- A specific dish or drink (e.g. "paneer tikka", "tomato soup")
- Meal ideas around ingredients (e.g. "something with tomato and paneer", "quick dinner with eggs and spinach")
- A style or constraint for one meal (e.g. "light lunch with yogurt", "quick pasta dinner")

REJECT (isFoodRelated: false) only when completely off-topic: not about food/cooking/meals (e.g. homework, weather, jokes, code, random gibberish, unrelated chit-chat).

Step 2 — If accepting, create ONE recipe that best matches the prompt, under ${maxMinutes} minutes for ${servings} servings.${vegLine}${cuisineLine}
If the prompt names ingredients, build a sensible dish that uses them. Give the recipe a clear dish name (not just the user's raw prompt).${pantryRule ? `\n${pantryRule}` : ''}
Available pantry: ${pantryItems.join(', ') || 'none'}.

${AI_RECIPE_STEP_GUIDE}

Return JSON in exactly one of these shapes:

If off-topic:
{"isFoodRelated": false, "rejectReason": "Short friendly reason"}

If food-related:
{
  "isFoodRelated": true,
  "recipe": {
    "name": "Recipe Name",
    "totalMinutes": 30,
    "cuisine": "indian",
    "vegetarian": true,
    "description": "One line summary",
    "ingredients": [{"name": "basmati rice", "quantity": "2 cups"}],
    "steps": ["Heat oil on medium. Add onion; cook 3–4 min until soft.", "Add main ingredients; stir 2 min.", "Simmer 10–12 min until sauce thickens and flavors meld."],
    "caloriesPerServing": 420,
    "macrosPerServing": { "proteinG": 18, "carbsG": 45, "fatG": 14 }
  }
}`,
    },
  ];

  const response = await provider.chat(messages);
  const resolvedSlot: MealSlot = mealFilter === 'any' ? mealSlot : mealFilter;
  const result = parseAIDishPromptResponse(response, resolvedSlot, servings);

  if (!result.isFoodRelated || !result.recipe) {
    return { ok: false, reason: result.rejectReason ?? 'That prompt is not about meals or cooking.' };
  }

  return { ok: true, recipe: result.recipe };
}

export async function generateRecipeWithAI(
  provider: AIProvider,
  mealName: string,
  pantryItems: string[],
  servings: number,
  systemPrompt?: string,
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Create a detailed recipe for "${mealName}" serving ${servings} people.
Prefer ingredients from: ${pantryItems.join(', ') || 'common pantry items'}.
Include ingredient list with quantities.
${AI_RECIPE_STEP_GUIDE}`,
    },
  ];
  return provider.chat(messages);
}

export async function parsePantryWithAI(
  provider: AIProvider,
  text: string,
  systemPrompt?: string,
): Promise<string[]> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: (systemPrompt || DEFAULT_SYSTEM_PROMPT) +
        '\nRespond ONLY with a JSON array of specific ingredient names (lowercase), no quantities. Never use vague terms like flour, rice, lentil, cheese, oil, or pasta — use types such as all purpose flour, basmati rice, moong dal, cheddar, vegetable oil, spaghetti.',
    },
    {
      role: 'user',
      content: `Extract ingredient names from this text:\n${text}`,
    },
  ];

  const response = await provider.chat(messages);
  try {
    const match = response.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    // fallback to line parsing
  }
  return response.split(/[,\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export const PROVIDER_MODELS: Record<AISettings['provider'], string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'],
  claude: ['claude-3-5-haiku-latest', 'claude-sonnet-4-20250514', 'claude-3-5-sonnet-latest'],
  custom: ['gpt-4o-mini'],
};
