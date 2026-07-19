import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
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
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChipSelect } from '../components/ChipSelect';
import { MealCard } from '../components/MealCard';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { createAIProvider, suggestDishFromUserPrompt, suggestMealsWithAI } from '../lib/ai';
import { CUISINE_OPTIONS } from '../lib/cuisine';
import { filterRecipesByStrictPantry } from '../lib/pantry';
import { filterUniqueRecipes } from '../lib/recipeDedup';
import {
  filterRecipes,
  getSuggestions,
  getSurpriseMeal,
  scoreRecipes,
  sortSuggestions,
} from '../lib/suggestions';
import { isFavorite } from '../lib/preferences';
import type { CuisineFilter, MealFilter, MealSlot, Recipe } from '../types';

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

function defaultMealSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
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
    clearAiRecipeStackState,
    setAISettings,
  } = useApp();
  const navigate = useNavigate();
  const [mealSlot, setMealSlot] = useState<MealFilter>(defaultMealSlot);
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [people, setPeople] = useState(household.size);
  const [newAiIds, setNewAiIds] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dishPrompt, setDishPrompt] = useState('');

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

  const suggestions = useMemo(
    () =>
      getSuggestions(allRecipes, pantry, preferences, {
        ...filterOptions,
        limit: 12,
        servings: people,
        pantryValidationMode: aiSettings.pantryValidationMode,
      }),
    [allRecipes, pantry, preferences, filterOptions, people, aiSettings.pantryValidationMode],
  );

  const stackedAiScored = useMemo(() => {
    const stackedRecipes = filterRecipes(
      aiRecipeStack.map((entry) => entry.recipe),
      filterOptions,
    );
    const scoreMealSlot: MealSlot = mealSlot === 'any' ? 'dinner' : mealSlot;
    return scoreRecipes(stackedRecipes, pantry, preferences, scoreMealSlot, {
      isAiSuggested: true,
      aiBadgeVariant: 'saved',
      servings: people,
    }).map((scored) => ({
      ...scored,
      aiBadgeVariant: newAiIds.has(scored.recipe.id) ? 'new' as const : 'saved' as const,
    }));
  }, [aiRecipeStack, pantry, preferences, filterOptions, mealSlot, newAiIds, people]);

  const displaySuggestions = useMemo(() => {
    const stackedIds = new Set(stackedAiScored.map((s) => s.recipe.id));
    const regular = suggestions.filter((s) => !stackedIds.has(s.recipe.id));
    const combined = [...stackedAiScored, ...regular];
    return sortSuggestions(combined);
  }, [stackedAiScored, suggestions]);

  const handleVegetarianToggle = async (checked: boolean) => {
    const tags = checked
      ? [...household.dietaryTags.filter((t) => t !== 'vegetarian'), 'vegetarian']
      : household.dietaryTags.filter((t) => t !== 'vegetarian');
    await setHousehold({ ...household, dietaryTags: tags });
  };

  const handleCuisineChange = async (value: string) => {
    await setHousehold({ ...household, cuisineFilter: value as CuisineFilter });
  };

  const handleSurprise = () => {
    const pick = getSurpriseMeal(allRecipes, pantry, preferences, {
      ...filterOptions,
      servings: people,
      pantryValidationMode: aiSettings.pantryValidationMode,
    });
    if (pick) navigate(`/meal/${pick.recipe.id}`);
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
      ...suggestions.map((s) => s.recipe),
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
        ...suggestions.map((s) => s.recipe.name),
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

  const handleAddToList = async (recipeId: string) => {
    await promoteAiRecipeToSaved(recipeId);
    setNewAiIds((prev) => {
      const next = new Set(prev);
      next.delete(recipeId);
      return next;
    });
  };

  const clearAiStack = async () => {
    await clearAiRecipeStackState();
    setNewAiIds(new Set());
  };

  const aiStackCount = aiRecipeStack.length;

  return (
    <Box>
      <PageHeader title="Home" subtitle="Find your next meal" />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3, p: 1 }}>
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<CasinoRoundedIcon />}
              onClick={handleSurprise}
              fullWidth
            >
              Surprise me
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={handleAISuggest}
              disabled={aiLoading}
              fullWidth
            >
              {aiLoading ? 'Thinking…' : dishPrompt.trim() ? 'AI suggest from prompt' : 'AI suggest'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {aiError && <Alert severity="error" sx={{ mb: 2 }}>{aiError}</Alert>}

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <Typography variant="h5">Suggestions</Typography>
        <Chip label={displaySuggestions.length} color="primary" size="small" />
        {aiStackCount > 0 && (
          <>
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label={`${aiStackCount} in AI stack`}
              size="small"
              variant="outlined"
              sx={{ color: 'text.secondary' }}
            />
            <Button size="small" onClick={clearAiStack}>Clear AI stack</Button>
          </>
        )}
      </Stack>

      {pantry.length === 0 && aiSettings.pantryValidationMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add items to your pantry for better matches.{' '}
          <RouterLink to="/pantry">Go to Pantry</RouterLink>
        </Alert>
      )}

      {displaySuggestions.length === 0 ? (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No matches found. Try relaxing filters, adding pantry items, or use AI suggest.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {displaySuggestions.map((s) => (
            <Grid key={s.recipe.id} size={{ xs: 12, sm: 6 }}>
              <MealCard
                scored={s}
                isFavorite={isFavorite(preferences, s.recipe.id)}
                onAddToList={
                  s.isAiSuggested || s.recipe.aiGenerated
                    ? () => handleAddToList(s.recipe.id)
                    : undefined
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
