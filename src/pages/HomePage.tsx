import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ChipSelect } from '../components/ChipSelect';
import { MealCard } from '../components/MealCard';
import { MaterialSymbol } from '../components/MaterialSymbol';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { useHomeBrowse } from '../context/HomeBrowseContext';
import { createAIProvider, suggestDishFromUserPrompt, suggestMealsWithAI } from '../lib/ai';
import { CUISINE_OPTIONS, recipeFieldsFromCuisineValue, type RecipeCuisineValue } from '../lib/cuisine';
import { filterRecipesByStrictPantry } from '../lib/pantry';
import { filterUniqueRecipes } from '../lib/recipeDedup';
import {
  filterRecipes,
  getSuggestions,
  scoreRecipe,
  scoreRecipes,
  sortSuggestions,
} from '../lib/suggestions';
import { isFavorite } from '../lib/preferences';
import { surfacePanelSx } from '../theme/theme';
import type { CuisineFilter, MealFilter, MealSlot, PreferenceProfile, Recipe, ScoredRecipe } from '../types';

function defaultMealSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

const MEAL_OPTIONS: { value: MealFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'smoothie', label: 'Smoothie' },
];

const TIME_OPTIONS = [
  { value: 0, label: 'Any time' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  value: String(n),
  label: n === 1 ? '1 person' : `${n} people`,
}));

function MealCardGrid({
  items,
  preferences,
  onToggleFavorite,
  onCuisineChange,
  onAddToList,
  onDelete,
}: {
  items: ScoredRecipe[];
  preferences: PreferenceProfile;
  onToggleFavorite: (id: string) => void;
  onCuisineChange: (id: string, value: RecipeCuisineValue) => void;
  onAddToList?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Grid container spacing={2}>
      {items.map((s) => (
        <Grid key={s.recipe.id} size={{ xs: 12, sm: 6 }}>
          <MealCard
            scored={s}
            isFavorite={isFavorite(preferences, s.recipe.id)}
            onToggleFavorite={() => onToggleFavorite(s.recipe.id)}
            onCuisineChange={(value) => onCuisineChange(s.recipe.id, value)}
            onAddToList={onAddToList ? () => onAddToList(s.recipe.id) : undefined}
            onDelete={onDelete ? () => onDelete(s.recipe.id) : undefined}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function SectionHeader({
  title,
  count,
  action,
}: {
  title: string;
  count: number;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}
      useFlexGap
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} useFlexGap>
        <Typography variant="h5">{title}</Typography>
        <Chip label={count} color="primary" size="small" />
      </Stack>
      {action}
    </Stack>
  );
}

export function HomePage() {
  const {
    pantry,
    household,
    preferences,
    setHousehold,
    allRecipes,
    aiSettings,
    aiRecipeStack,
    savedRecipes,
    pushAiRecipesToStack,
    promoteAiRecipeToSaved,
    removeAiSuggestion,
    removeFromMyMeals,
    clearAiRecipeStackState,
    setAISettings,
    toggleRecipeFavorite,
    updateRecipeCuisine,
  } = useApp();
  const {
    mealSlot,
    setMealSlot,
    maxMinutes,
    setMaxMinutes,
    people,
    setPeople,
    favoritesOnly,
    setFavoritesOnly,
    dishPrompt,
    setDishPrompt,
    newAiIds,
    setNewAiIds,
  } = useHomeBrowse();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const vegetarianOnly = household.dietaryTags.includes('vegetarian');
  const cuisineFilter: CuisineFilter = household.cuisineFilter ?? 'any';

  const filterOptions = useMemo(
    () => ({
      mealSlot,
      maxMinutes: maxMinutes || undefined,
      vegetarianOnly,
      cuisineFilter,
    }),
    [mealSlot, maxMinutes, vegetarianOnly, cuisineFilter],
  );

  const scoreMealSlot: MealSlot = mealSlot === 'any' ? 'dinner' : mealSlot;

  const stackedAiScored = useMemo(() => {
    const stackedRecipes = filterRecipes(
      aiRecipeStack.map((entry) => entry.recipe),
      filterOptions,
    );
    return scoreRecipes(stackedRecipes, pantry, preferences, scoreMealSlot, {
      isAiSuggested: true,
      aiBadgeVariant: 'saved',
      servings: people,
    }).map((scored) => ({
      ...scored,
      aiBadgeVariant: newAiIds.includes(scored.recipe.id) ? 'new' as const : 'saved' as const,
    }));
  }, [aiRecipeStack, pantry, preferences, filterOptions, scoreMealSlot, newAiIds, people]);

  const aiSuggestions = useMemo(() => {
    let list = stackedAiScored;
    if (favoritesOnly) {
      list = list.filter((s) => isFavorite(preferences, s.recipe.id));
    }
    return sortSuggestions(list);
  }, [stackedAiScored, favoritesOnly, preferences]);

  const myMeals = useMemo(() => {
    if (favoritesOnly) {
      const favIds = new Set(preferences.favoriteDishes);
      if (favIds.size === 0) return [];

      const recipeById = new Map<string, Recipe>();
      for (const recipe of allRecipes) {
        if (favIds.has(recipe.id) && !preferences.blockedDishes.includes(recipe.id)) {
          recipeById.set(recipe.id, recipe);
        }
      }

      const filtered = filterRecipes([...recipeById.values()], filterOptions);
      return sortSuggestions(
        filtered.map((recipe) =>
          scoreRecipe(recipe, pantry, preferences, scoreMealSlot, { servings: people }),
        ),
      );
    }

    return getSuggestions(allRecipes, pantry, preferences, {
      ...filterOptions,
      limit: 12,
      servings: people,
      pantryValidationMode: aiSettings.pantryValidationMode,
    });
  }, [
    favoritesOnly,
    preferences,
    allRecipes,
    filterOptions,
    pantry,
    scoreMealSlot,
    people,
    aiSettings.pantryValidationMode,
  ]);

  const handleVegetarianToggle = async (checked: boolean) => {
    const tags = checked
      ? [...household.dietaryTags.filter((t) => t !== 'vegetarian'), 'vegetarian']
      : household.dietaryTags.filter((t) => t !== 'vegetarian');
    await setHousehold({ ...household, dietaryTags: tags });
  };

  const handleCuisineChange = async (value: string) => {
    await setHousehold({ ...household, cuisineFilter: value as CuisineFilter });
  };

  const handlePantryValidationToggle = async (enabled: boolean) => {
    await setAISettings({ ...aiSettings, pantryValidationMode: enabled });
  };

  const stackAiRecipes = async (incoming: Recipe[], aiMealSlot: MealSlot) => {
    const pantryValidated = aiSettings.pantryValidationMode
      ? filterRecipesByStrictPantry(incoming, pantry, people)
      : incoming;

    const cuisineFiltered = filterRecipes(pantryValidated, filterOptions);

    if (cuisineFiltered.length === 0) {
      setAiError(
        aiSettings.pantryValidationMode
          ? 'No AI meals matched your pantry and filters. Try relaxing cuisine or adding stock.'
          : 'No AI meals matched your filters. Try a different cuisine or meal type.',
      );
      return false;
    }

    const uniqueIncoming = filterUniqueRecipes(cuisineFiltered, [
      ...myMeals.map((s) => s.recipe),
      ...aiRecipeStack.map((e) => e.recipe),
      ...savedRecipes,
    ]);

    if (uniqueIncoming.length === 0) {
      setAiError('AI returned meals already in your list. Try again or change filters.');
      return false;
    }

    const added = await pushAiRecipesToStack(uniqueIncoming, aiMealSlot);
    if (added.length === 0) {
      setAiError('Could not add AI meals to your stack.');
      return false;
    }

    setNewAiIds(new Set(added.map((r) => r.id)));
    return true;
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const provider = await createAIProvider(aiSettings);
      if (!provider) {
        setAiError('Enable AI in Settings and add your API key.');
        return;
      }

      const pantryNames = pantry
        .filter((p) => p.status !== 'out')
        .map((p) => `${p.name} (qty ${p.quantity})`);

      const excludeNames = [
        ...myMeals.map((s) => s.recipe.name),
        ...aiRecipeStack.map((e) => e.recipe.name),
        ...savedRecipes.map((r) => r.name),
      ];

      const aiMealSlot: MealSlot = mealSlot === 'any' ? defaultMealSlot() : mealSlot;
      const trimmedPrompt = dishPrompt.trim();

      if (trimmedPrompt) {
        const dishResult = await suggestDishFromUserPrompt(
          provider,
          trimmedPrompt,
          pantryNames,
          aiMealSlot,
          {
            maxMinutes: maxMinutes || 60,
            servings: people,
            pantryValidationMode: aiSettings.pantryValidationMode,
            systemPrompt: aiSettings.systemPrompt,
            cuisineFilter,
            mealFilter: mealSlot,
            vegetarianOnly,
          },
        );

        if (!dishResult.ok) {
          setAiError(dishResult.reason);
          return;
        }

        const stacked = await stackAiRecipes([dishResult.recipe], aiMealSlot);
        if (stacked) setDishPrompt('');
        return;
      }

      const aiRecipes = await suggestMealsWithAI(
        provider,
        pantryNames,
        aiMealSlot,
        maxMinutes || 60,
        people,
        excludeNames,
        aiSettings.pantryValidationMode,
        aiSettings.systemPrompt,
        cuisineFilter,
        mealSlot,
      );

      if (aiRecipes.length === 0) {
        setAiError('Could not parse AI suggestions. Try again.');
        return;
      }

      await stackAiRecipes(aiRecipes, aiMealSlot);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRecipeCuisineChange = async (recipeId: string, value: RecipeCuisineValue) => {
    const { cuisine, tags } = recipeFieldsFromCuisineValue(value);
    await updateRecipeCuisine(recipeId, cuisine, tags);
  };

  const handleAddToMyMeals = async (recipeId: string) => {
    await promoteAiRecipeToSaved(recipeId);
    setNewAiIds(new Set(newAiIds.filter((id) => id !== recipeId)));
  };

  const handleRemoveAiSuggestion = async (recipeId: string) => {
    await removeAiSuggestion(recipeId);
    setNewAiIds(new Set(newAiIds.filter((id) => id !== recipeId)));
  };

  const handleRemoveFromMyMeals = async (recipeId: string) => {
    if (!confirm('Remove this meal from My Meals?')) return;
    await removeFromMyMeals(recipeId);
  };

  const handleClearAiSuggestions = async () => {
    if (!confirm('Clear all AI suggestions?')) return;
    await clearAiRecipeStackState();
    setNewAiIds(new Set());
  };

  return (
    <Box>
      <PageHeader title="Home" subtitle="Find your next meal" />

      <Card sx={{ ...surfacePanelSx, mb: 3, p: 1 }}>
        <CardContent>
          <ChipSelect options={MEAL_OPTIONS} value={mealSlot} onChange={setMealSlot} label="Meal" />
          <ChipSelect
            options={TIME_OPTIONS.map((t) => ({ value: String(t.value), label: t.label }))}
            value={String(maxMinutes)}
            onChange={(v) => setMaxMinutes(Number(v))}
            label="Time available"
          />
          <ChipSelect
            options={CUISINE_OPTIONS}
            value={cuisineFilter}
            onChange={handleCuisineChange}
            label="Cuisine"
          />
          <ChipSelect
            options={PEOPLE_OPTIONS}
            value={String(people)}
            onChange={(v) => setPeople(Number(v))}
            label="Number of people"
          />
          <FormControlLabel
            control={
              <Switch
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
              />
            }
            label="Favorites only"
          />
          <FormControlLabel
            control={
              <Switch
                checked={vegetarianOnly}
                onChange={(e) => handleVegetarianToggle(e.target.checked)}
              />
            }
            label="Vegetarian only"
          />
          <FormControlLabel
            control={
              <Switch
                checked={aiSettings.pantryValidationMode}
                onChange={(e) => handlePantryValidationToggle(e.target.checked)}
              />
            }
            label="Pantry validation (match & sort by what you have)"
          />
          {!aiSettings.pantryValidationMode && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mb: 1 }}>
              Off: AI may suggest items you need to buy. Cards still group by pantry match, fastest first.
            </Typography>
          )}
          {aiSettings.pantryValidationMode && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mb: 1 }}>
              On: AI only suggests meals your pantry can cover. Cards group Ready now → Missing 1 → Need shopping.
            </Typography>
          )}
          <TextField
            size="small"
            fullWidth
            label="Meal idea (optional)"
            placeholder="e.g. paneer tikka, or something with tomato and eggs"
            value={dishPrompt}
            onChange={(e) => setDishPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !aiLoading) handleAISuggest();
            }}
            sx={{ mt: 2 }}
            slotProps={{
              input: { 'aria-label': 'Dish prompt for AI suggest' },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1 }}>
            Leave blank for 3 AI ideas, or describe a dish or ingredients — off-topic prompts are rejected.
          </Typography>
          <Button
            variant="contained"
            startIcon={<MaterialSymbol name="auto_awesome" />}
            onClick={handleAISuggest}
            disabled={aiLoading}
            fullWidth
            sx={{ mt: 1.5 }}
          >
            {aiLoading ? 'Thinking…' : dishPrompt.trim() ? 'AI suggest from prompt' : 'AI suggest'}
          </Button>
        </CardContent>
      </Card>

      {aiError && <Alert severity="error" sx={{ mb: 2 }}>{aiError}</Alert>}

      {pantry.length === 0 && aiSettings.pantryValidationMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add items to your pantry for better matches.{' '}
          <RouterLink to="/pantry">Go to Pantry</RouterLink>
        </Alert>
      )}

      {aiSuggestions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title="Suggestions"
            count={aiSuggestions.length}
            action={
              <Button size="small" color="inherit" onClick={handleClearAiSuggestions}>
                Clear all
              </Button>
            }
          />
          <MealCardGrid
            items={aiSuggestions}
            preferences={preferences}
            onToggleFavorite={toggleRecipeFavorite}
            onCuisineChange={handleRecipeCuisineChange}
            onAddToList={handleAddToMyMeals}
            onDelete={handleRemoveAiSuggestion}
          />
        </Box>
      )}

      <SectionHeader title="My Meals" count={myMeals.length} />

      {myMeals.length === 0 ? (
        <Card sx={{ ...surfacePanelSx, p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {favoritesOnly
              ? 'No favorite meals match your filters. Star meals from cards or meal details to save them here.'
              : 'No meals match your filters. Try relaxing filters, adding pantry items, or use AI suggest.'}
          </Typography>
        </Card>
      ) : (
        <MealCardGrid
          items={myMeals}
          preferences={preferences}
          onToggleFavorite={toggleRecipeFavorite}
          onCuisineChange={handleRecipeCuisineChange}
          onDelete={handleRemoveFromMyMeals}
        />
      )}
    </Box>
  );
}
