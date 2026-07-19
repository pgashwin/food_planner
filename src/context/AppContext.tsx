import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addFeedback,
  clearAllData,
  exportAllData,
  getAISettings,
  getHousehold,
  getPantry,
  getPreferences,
  importAllData,
  removePantryItem,
  saveAISettings,
  saveHousehold,
  savePantry,
  savePreferences,
  updatePantryItem,
} from '../db/database';
import { recipes } from '../data/recipes';
import { createPantryItem, mergePantryItems } from '../lib/pantry';
import {
  applyFeedback,
  getDefaultPreferences,
  recordCook,
  toggleFavorite,
} from '../lib/preferences';
import type {
  AISettings,
  HouseholdSettings,
  MealSlot,
  PantryItem,
  PreferenceProfile,
  Recipe,
} from '../types';

interface AppContextValue {
  loading: boolean;
  pantry: PantryItem[];
  household: HouseholdSettings;
  preferences: PreferenceProfile;
  aiSettings: AISettings;
  recipes: Recipe[];
  refresh: () => Promise<void>;
  setHousehold: (h: HouseholdSettings) => Promise<void>;
  addToPantry: (names: string[]) => Promise<void>;
  removeFromPantry: (id: number) => Promise<void>;
  updatePantry: (item: PantryItem) => Promise<void>;
  replacePantry: (items: PantryItem[]) => Promise<void>;
  giveFeedback: (recipe: Recipe, rating: 'up' | 'down', mealSlot: MealSlot) => Promise<void>;
  markCooked: (recipe: Recipe, mealSlot: MealSlot, servings: number, kidsLiked?: boolean) => Promise<void>;
  toggleRecipeFavorite: (recipeId: string) => Promise<void>;
  setAISettings: (s: AISettings) => Promise<void>;
  exportData: () => Promise<object>;
  importData: (data: object) => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [household, setHouseholdState] = useState<HouseholdSettings>({
    size: 4,
    defaultPortionMode: 'family',
    dietaryTags: [],
    spicePreference: 'medium',
    onboardingComplete: false,
  });
  const [preferences, setPreferences] = useState<PreferenceProfile>(getDefaultPreferences());
  const [aiSettings, setAISettingsState] = useState<AISettings>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    enabled: false,
  });

  const refresh = useCallback(async () => {
    const [p, h, pref, ai] = await Promise.all([
      getPantry(),
      getHousehold(),
      getPreferences(),
      getAISettings(),
    ]);
    setPantry(p);
    setHouseholdState(h);
    setPreferences(pref);
    setAISettingsState(ai);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const setHousehold = useCallback(async (h: HouseholdSettings) => {
    await saveHousehold(h);
    setHouseholdState(h);
  }, []);

  const addToPantry = useCallback(async (names: string[]) => {
    const items = names.map((n) => createPantryItem(n));
    const merged = mergePantryItems(pantry, names);
    await savePantry(merged);
    setPantry(merged);
    void items;
  }, [pantry]);

  const removeFromPantry = useCallback(async (id: number) => {
    await removePantryItem(id);
    setPantry((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePantry = useCallback(async (item: PantryItem) => {
    await updatePantryItem(item);
    setPantry((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  }, []);

  const replacePantry = useCallback(async (items: PantryItem[]) => {
    await savePantry(items);
    setPantry(items);
  }, []);

  const giveFeedback = useCallback(async (recipe: Recipe, rating: 'up' | 'down', mealSlot: MealSlot) => {
    await addFeedback({ recipeId: recipe.id, rating, timestamp: Date.now(), mealSlot });
    const updated = applyFeedback(preferences, recipe, rating);
    await savePreferences(updated);
    setPreferences(updated);
  }, [preferences]);

  const markCooked = useCallback(async (
    recipe: Recipe,
    mealSlot: MealSlot,
    servings: number,
    kidsLiked?: boolean,
  ) => {
    const updated = recordCook(preferences, recipe, mealSlot, servings, kidsLiked);
    await savePreferences(updated);
    setPreferences(updated);
  }, [preferences]);

  const toggleRecipeFavorite = useCallback(async (recipeId: string) => {
    const updated = toggleFavorite(preferences, recipeId);
    await savePreferences(updated);
    setPreferences(updated);
  }, [preferences]);

  const setAISettings = useCallback(async (s: AISettings) => {
    await saveAISettings(s);
    setAISettingsState(s);
  }, []);

  const exportData = useCallback(async () => exportAllData(), []);

  const importDataHandler = useCallback(async (data: object) => {
    await importAllData(data as Parameters<typeof importAllData>[0]);
    await refresh();
  }, [refresh]);

  const resetAll = useCallback(async () => {
    await clearAllData();
    await refresh();
  }, [refresh]);

  const value = useMemo<AppContextValue>(() => ({
    loading,
    pantry,
    household,
    preferences,
    aiSettings,
    recipes,
    refresh,
    setHousehold,
    addToPantry,
    removeFromPantry,
    updatePantry,
    replacePantry,
    giveFeedback,
    markCooked,
    toggleRecipeFavorite,
    setAISettings,
    exportData,
    importData: importDataHandler,
    resetAll,
  }), [
    loading, pantry, household, preferences, aiSettings,
    refresh, setHousehold, addToPantry, removeFromPantry, updatePantry,
    replacePantry, giveFeedback, markCooked, toggleRecipeFavorite,
    setAISettings, exportData, importDataHandler, resetAll,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
