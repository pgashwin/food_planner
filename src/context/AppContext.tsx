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
  addSavedRecipe,
  addToAiRecipeStack,
  clearAiRecipeStack,
  clearAllData,
  exportAllData,
  getAISettings,
  getAiRecipeStack,
  getHousehold,
  getPantry,
  getPreferences,
  getSavedRecipes,
  importAllData,
  removeFromAiRecipeStack,
  removePantryItem,
  saveAISettings,
  saveHousehold,
  savePantry,
  savePreferences,
  updatePantryItem,
} from '../db/database';
import { recipes } from '../data/recipes';
import { mergePantryItems } from '../lib/pantry';
import { filterUniqueRecipes } from '../lib/recipeDedup';
import { toSavedRecipe } from '../lib/recipePromote';
import {
  applyFeedback,
  getDefaultPreferences,
  recordCook,
  toggleFavorite,
} from '../lib/preferences';
import type {
  AISettings,
  AiRecipeStackEntry,
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
  savedRecipes: Recipe[];
  allRecipes: Recipe[];
  aiRecipeStack: AiRecipeStackEntry[];
  findRecipe: (id: string) => Recipe | undefined;
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
  pushAiRecipesToStack: (recipes: Recipe[], mealSlot: MealSlot) => Promise<Recipe[]>;
  promoteAiRecipeToSaved: (recipeId: string) => Promise<void>;
  clearAiRecipeStackState: () => Promise<void>;
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
    pantryQuantities: { steps: [0, 1, 2, 3, 5, 10], statusQuantities: { enough: 3, low: 1, out: 0 } },
  });
  const [preferences, setPreferences] = useState<PreferenceProfile>(getDefaultPreferences());
  const [aiSettings, setAISettingsState] = useState<AISettings>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    enabled: false,
    pantryValidationMode: true,
  });
  const [aiRecipeStack, setAiRecipeStack] = useState<AiRecipeStackEntry[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const allRecipes = useMemo(
    () => [...recipes, ...savedRecipes],
    [savedRecipes],
  );

  const refresh = useCallback(async () => {
    const [p, h, pref, ai, stack, saved] = await Promise.all([
      getPantry(),
      getHousehold(),
      getPreferences(),
      getAISettings(),
      getAiRecipeStack(),
      getSavedRecipes(),
    ]);
    setPantry(p);
    setHouseholdState(h);
    setPreferences(pref);
    setAISettingsState(ai);
    setAiRecipeStack(stack);
    setSavedRecipes(saved);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const setHousehold = useCallback(async (h: HouseholdSettings) => {
    await saveHousehold(h);
    setHouseholdState(h);
  }, []);

  const addToPantry = useCallback(async (names: string[]) => {
    const merged = mergePantryItems(pantry, names, household.pantryQuantities);
    await savePantry(merged);
    setPantry(merged);
  }, [pantry, household.pantryQuantities]);

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

  const pushAiRecipesToStack = useCallback(async (incoming: Recipe[], mealSlot: MealSlot) => {
    const existing = await getAiRecipeStack();
    const existingRecipes = existing.map((e) => e.recipe);
    const unique = filterUniqueRecipes(incoming, existingRecipes);

    if (unique.length === 0) return [];

    const entries: AiRecipeStackEntry[] = unique.map((recipe) => ({
      recipe: { ...recipe, aiGenerated: true },
      addedAt: Date.now(),
      mealSlot,
    }));

    await addToAiRecipeStack(entries);
    const stack = await getAiRecipeStack();
    setAiRecipeStack(stack);
    return unique;
  }, []);

  const clearAiRecipeStackState = useCallback(async () => {
    await clearAiRecipeStack();
    setAiRecipeStack([]);
  }, []);

  const promoteAiRecipeToSaved = useCallback(async (recipeId: string) => {
    const entry = aiRecipeStack.find((e) => e.recipe.id === recipeId);
    if (!entry) return;

    const saved = toSavedRecipe(entry.recipe);
    await addSavedRecipe(saved);
    await removeFromAiRecipeStack(recipeId);

    const [stack, savedList] = await Promise.all([getAiRecipeStack(), getSavedRecipes()]);
    setAiRecipeStack(stack);
    setSavedRecipes(savedList);
  }, [aiRecipeStack]);

  const exportData = useCallback(async () => exportAllData(), []);

  const importDataHandler = useCallback(async (data: object) => {
    await importAllData(data as Parameters<typeof importAllData>[0]);
    await refresh();
  }, [refresh]);

  const resetAll = useCallback(async () => {
    await clearAllData();
    setAiRecipeStack([]);
    setSavedRecipes([]);
    await refresh();
  }, [refresh]);

  const findRecipe = useCallback(
    (id: string) => {
      const stacked = aiRecipeStack.find((e) => e.recipe.id === id)?.recipe;
      const saved = savedRecipes.find((r) => r.id === id);
      return stacked ?? saved ?? recipes.find((r) => r.id === id);
    },
    [aiRecipeStack, savedRecipes],
  );

  const value = useMemo<AppContextValue>(() => ({
    loading,
    pantry,
    household,
    preferences,
    aiSettings,
    recipes,
    savedRecipes,
    allRecipes,
    aiRecipeStack,
    findRecipe,
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
    pushAiRecipesToStack,
    promoteAiRecipeToSaved,
    clearAiRecipeStackState,
    exportData,
    importData: importDataHandler,
    resetAll,
  }), [
    loading, pantry, household, preferences, aiSettings, savedRecipes, allRecipes,
    aiRecipeStack, findRecipe, refresh, setHousehold, addToPantry, removeFromPantry,
    updatePantry, replacePantry, giveFeedback, markCooked, toggleRecipeFavorite,
    setAISettings, pushAiRecipesToStack, promoteAiRecipeToSaved, clearAiRecipeStackState,
    exportData, importDataHandler, resetAll,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
