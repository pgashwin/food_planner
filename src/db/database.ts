import Dexie, { type EntityTable } from 'dexie';
import type {
  AISettings,
  AiRecipeStackEntry,
  FeedbackEntry,
  HouseholdSettings,
  PantryItem,
  PreferenceProfile,
  Recipe,
} from '../types';
import { getDefaultPreferences } from '../lib/preferences';
import { DEFAULT_PANTRY_QUANTITIES, normalizePantryQuantities } from '../lib/pantryQuantities';

const DEFAULT_HOUSEHOLD: HouseholdSettings = {
  size: 4,
  defaultPortionMode: 'family',
  dietaryTags: [],
  spicePreference: 'medium',
  onboardingComplete: false,
  pantryQuantities: DEFAULT_PANTRY_QUANTITIES,
};

const DEFAULT_AI: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  enabled: false,
  pantryValidationMode: true,
};

function normalizePantryItem(
  item: PantryItem,
  household: HouseholdSettings,
): PantryItem {
  const qtySettings = normalizePantryQuantities(household.pantryQuantities);
  return {
    ...item,
    quantity:
      item.quantity ?? qtySettings.statusQuantities[item.status] ?? qtySettings.statusQuantities.enough,
  };
}

function normalizeHousehold(row: HouseholdSettings): HouseholdSettings {
  return {
    ...DEFAULT_HOUSEHOLD,
    ...row,
    pantryQuantities: normalizePantryQuantities(row.pantryQuantities),
  };
}

function normalizeAISettings(row: AISettings): AISettings {
  return {
    ...DEFAULT_AI,
    ...row,
    pantryValidationMode: row.pantryValidationMode ?? true,
  };
}

class FoodPlannerDB extends Dexie {
  pantry!: EntityTable<PantryItem, 'id'>;
  preferences!: EntityTable<PreferenceProfile & { id: number }, 'id'>;
  household!: EntityTable<HouseholdSettings & { id: number }, 'id'>;
  feedback!: EntityTable<FeedbackEntry, 'id'>;
  aiSettings!: EntityTable<AISettings & { id: number }, 'id'>;
  aiRecipeStack!: EntityTable<AiRecipeStackEntry, 'id'>;
  savedRecipes!: EntityTable<Recipe, 'id'>;

  constructor() {
    super('FoodPlannerDB');
    this.version(1).stores({
      pantry: '++id, normalizedName, status',
      preferences: '++id',
      household: '++id',
      feedback: '++id, recipeId, timestamp',
      aiSettings: '++id',
    });
    this.version(2).stores({
      pantry: '++id, normalizedName, status',
      preferences: '++id',
      household: '++id',
      feedback: '++id, recipeId, timestamp',
      aiSettings: '++id',
      aiRecipeStack: '++id, addedAt, mealSlot',
    });
    this.version(3).stores({
      pantry: '++id, normalizedName, status',
      preferences: '++id',
      household: '++id',
      feedback: '++id, recipeId, timestamp',
      aiSettings: '++id',
      aiRecipeStack: '++id, addedAt, mealSlot',
      savedRecipes: 'id, name',
    });
  }
}

export const db = new FoodPlannerDB();

export async function getHousehold(): Promise<HouseholdSettings> {
  const row = await db.household.get(1);
  return normalizeHousehold(row ?? DEFAULT_HOUSEHOLD);
}

export async function saveHousehold(settings: HouseholdSettings): Promise<void> {
  await db.household.put({
    ...settings,
    pantryQuantities: normalizePantryQuantities(settings.pantryQuantities),
    id: 1,
  });
}

export async function getPreferences(): Promise<PreferenceProfile> {
  const row = await db.preferences.get(1);
  return row ?? getDefaultPreferences();
}

export async function savePreferences(prefs: PreferenceProfile): Promise<void> {
  await db.preferences.put({ ...prefs, id: 1 });
}

export async function getPantry(): Promise<PantryItem[]> {
  const household = await getHousehold();
  const items = await db.pantry.toArray();
  return items.map((item) => normalizePantryItem(item, household));
}

export async function savePantry(items: PantryItem[]): Promise<void> {
  await db.pantry.clear();
  await db.pantry.bulkAdd(items);
}

export async function addPantryItems(items: PantryItem[]): Promise<void> {
  await db.pantry.bulkPut(items);
}

export async function removePantryItem(id: number): Promise<void> {
  await db.pantry.delete(id);
}

export async function updatePantryItem(item: PantryItem): Promise<void> {
  if (item.id) await db.pantry.put(item);
}

export async function addFeedback(entry: FeedbackEntry): Promise<void> {
  await db.feedback.add(entry);
}

export async function getAISettings(): Promise<AISettings> {
  const row = await db.aiSettings.get(1);
  return normalizeAISettings(row ?? DEFAULT_AI);
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await db.aiSettings.put({ ...normalizeAISettings(settings), id: 1 });
}

export async function getAiRecipeStack(): Promise<AiRecipeStackEntry[]> {
  const rows = await db.aiRecipeStack.orderBy('addedAt').reverse().toArray();
  return rows.map((row) => ({
    ...row,
    recipe: { ...row.recipe, aiGenerated: true },
  }));
}

export async function addToAiRecipeStack(entries: AiRecipeStackEntry[]): Promise<void> {
  await db.aiRecipeStack.bulkAdd(entries);
}

export async function clearAiRecipeStack(): Promise<void> {
  await db.aiRecipeStack.clear();
}

export async function removeFromAiRecipeStack(recipeId: string): Promise<void> {
  const rows = await db.aiRecipeStack.toArray();
  const matches = rows.filter((r) => r.recipe.id === recipeId);
  await Promise.all(matches.map((r) => (r.id ? db.aiRecipeStack.delete(r.id) : Promise.resolve())));
}

export async function getSavedRecipes(): Promise<Recipe[]> {
  return db.savedRecipes.toArray();
}

export async function addSavedRecipe(recipe: Recipe): Promise<void> {
  await db.savedRecipes.put(recipe);
}

export async function exportAllData() {
  const [pantry, household, preferences, aiSettings, aiRecipeStack, savedRecipes] = await Promise.all([
    getPantry(),
    getHousehold(),
    getPreferences(),
    getAISettings(),
    getAiRecipeStack(),
    getSavedRecipes(),
  ]);

  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    pantry,
    household,
    preferences,
    aiRecipeStack,
    savedRecipes,
    aiSettings: {
      provider: aiSettings.provider,
      model: aiSettings.model,
      customBaseUrl: aiSettings.customBaseUrl,
      systemPrompt: aiSettings.systemPrompt,
      enabled: aiSettings.enabled,
      pantryValidationMode: aiSettings.pantryValidationMode,
      hasApiKey: !!aiSettings.apiKey,
    },
  };
}

export async function importAllData(data: {
  pantry?: PantryItem[];
  household?: HouseholdSettings;
  preferences?: PreferenceProfile;
  aiRecipeStack?: AiRecipeStackEntry[];
  savedRecipes?: Recipe[];
}): Promise<void> {
  if (data.pantry) await savePantry(data.pantry);
  if (data.household) await saveHousehold(normalizeHousehold(data.household));
  if (data.preferences) await savePreferences(data.preferences);
  if (data.aiRecipeStack) {
    await clearAiRecipeStack();
    await addToAiRecipeStack(data.aiRecipeStack);
  }
  if (data.savedRecipes) {
    await db.savedRecipes.clear();
    await db.savedRecipes.bulkPut(data.savedRecipes);
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.pantry.clear(),
    db.preferences.clear(),
    db.household.clear(),
    db.feedback.clear(),
    db.aiSettings.clear(),
    db.aiRecipeStack.clear(),
    db.savedRecipes.clear(),
  ]);
}
