import type { AISettings } from '../../types';

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
Keep responses concise. When suggesting recipes, include name, ingredients with quantities, and simple steps.
Scale recipes for the requested number of servings.`;

export async function suggestMealsWithAI(
  provider: AIProvider,
  pantryItems: string[],
  mealSlot: string,
  maxMinutes: number,
  servings: number,
  systemPrompt?: string,
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Suggest 3 ${mealSlot} ideas under ${maxMinutes} minutes for ${servings} servings.
Available pantry: ${pantryItems.join(', ') || 'basic staples'}.
Format each as: **Name** | time | match level | short description | key ingredients`,
    },
  ];
  return provider.chat(messages);
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
Include ingredient list with quantities and numbered steps.`,
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
        '\nRespond ONLY with a JSON array of ingredient names, lowercase, no quantities.',
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
