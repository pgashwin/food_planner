import Dexie, { type EntityTable } from 'dexie';
import type {
  AISettings,
  FeedbackEntry,
  HouseholdSettings,
  PantryItem,
  PreferenceProfile,
} from '../types';
import { getDefaultPreferences } from '../lib/preferences';

const DEFAULT_HOUSEHOLD: HouseholdSettings = {
  size: 4,
  defaultPortionMode: 'family',
  dietaryTags: [],
  spicePreference: 'medium',
  onboardingComplete: false,
};

const DEFAULT_AI: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  enabled: false,
};

class FoodPlannerDB extends Dexie {
  pantry!: EntityTable<PantryItem, 'id'>;
  preferences!: EntityTable<PreferenceProfile & { id: number }, 'id'>;
  household!: EntityTable<HouseholdSettings & { id: number }, 'id'>;
  feedback!: EntityTable<FeedbackEntry, 'id'>;
  aiSettings!: EntityTable<AISettings & { id: number }, 'id'>;

  constructor() {
    super('FoodPlannerDB');
    this.version(1).stores({
      pantry: '++id, normalizedName, status',
      preferences: '++id',
      household: '++id',
      feedback: '++id, recipeId, timestamp',
      aiSettings: '++id',
    });
  }
}

export const db = new FoodPlannerDB();

export async function getHousehold(): Promise<HouseholdSettings> {
  const row = await db.household.get(1);
  return row ?? DEFAULT_HOUSEHOLD;
}

export async function saveHousehold(settings: HouseholdSettings): Promise<void> {
  await db.household.put({ ...settings, id: 1 });
}

export async function getPreferences(): Promise<PreferenceProfile> {
  const row = await db.preferences.get(1);
  return row ?? getDefaultPreferences();
}

export async function savePreferences(prefs: PreferenceProfile): Promise<void> {
  await db.preferences.put({ ...prefs, id: 1 });
}

export async function getPantry(): Promise<PantryItem[]> {
  return db.pantry.toArray();
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
  return row ?? DEFAULT_AI;
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await db.aiSettings.put({ ...settings, id: 1 });
}

export async function exportAllData() {
  const [pantry, household, preferences, aiSettings] = await Promise.all([
    getPantry(),
    getHousehold(),
    getPreferences(),
    getAISettings(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    pantry,
    household,
    preferences,
    aiSettings: {
      provider: aiSettings.provider,
      model: aiSettings.model,
      customBaseUrl: aiSettings.customBaseUrl,
      systemPrompt: aiSettings.systemPrompt,
      enabled: aiSettings.enabled,
      hasApiKey: !!aiSettings.apiKey,
    },
  };
}

export async function importAllData(data: {
  pantry?: PantryItem[];
  household?: HouseholdSettings;
  preferences?: PreferenceProfile;
}): Promise<void> {
  if (data.pantry) await savePantry(data.pantry);
  if (data.household) await saveHousehold(data.household);
  if (data.preferences) await savePreferences(data.preferences);
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.pantry.clear(),
    db.preferences.clear(),
    db.household.clear(),
    db.feedback.clear(),
    db.aiSettings.clear(),
  ]);
}
