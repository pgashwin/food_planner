import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChipSelect } from '../components/ChipSelect';
import { MealCard } from '../components/MealCard';
import { useApp } from '../context/AppContext';
import { createAIProvider, suggestMealsWithAI } from '../lib/ai';
import { getSuggestions, getSurpriseMeal } from '../lib/suggestions';
import { isFavorite } from '../lib/preferences';
import type { MealSlot } from '../types';

const MEAL_OPTIONS: { value: MealSlot; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const TIME_OPTIONS = [
  { value: 0, label: 'Any time' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

export function HomePage() {
  const { pantry, household, preferences, recipes, aiSettings } = useApp();
  const navigate = useNavigate();
  const [mealSlot, setMealSlot] = useState<MealSlot>(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 21) return 'dinner';
    return 'snack';
  });
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [vegetarianOnly, setVegetarianOnly] = useState(
    household.dietaryTags.includes('vegetarian'),
  );
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const suggestions = useMemo(
    () =>
      getSuggestions(recipes, pantry, preferences, {
        mealSlot,
        maxMinutes: maxMinutes || undefined,
        vegetarianOnly,
        limit: 12,
      }),
    [recipes, pantry, preferences, mealSlot, maxMinutes, vegetarianOnly],
  );

  const handleSurprise = () => {
    const pick = getSurpriseMeal(recipes, pantry, preferences, {
      mealSlot,
      maxMinutes: maxMinutes || undefined,
      vegetarianOnly,
    });
    if (pick) navigate(`/meal/${pick.recipe.id}`);
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
      const pantryNames = pantry.map((p) => p.name);
      const servings = household.defaultPortionMode === 'family' ? household.size : 1;
      const result = await suggestMealsWithAI(
        provider,
        pantryNames,
        mealSlot,
        maxMinutes || 60,
        servings,
        aiSettings.systemPrompt,
      );
      setAiSuggestions(result);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page home">
      <ChipSelect options={MEAL_OPTIONS} value={mealSlot} onChange={setMealSlot} label="Meal" />

      <ChipSelect
        options={TIME_OPTIONS.map((t) => ({ value: String(t.value), label: t.label }))}
        value={String(maxMinutes)}
        onChange={(v) => setMaxMinutes(Number(v))}
        label="Time available"
      />

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={vegetarianOnly}
          onChange={(e) => setVegetarianOnly(e.target.checked)}
        />
        Vegetarian only
      </label>

      <div className="action-row">
        <button type="button" className="btn btn-primary" onClick={handleSurprise}>
          Surprise me
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAISuggest}
          disabled={aiLoading}
        >
          {aiLoading ? 'Thinking…' : 'AI suggest'}
        </button>
      </div>

      {aiError && <p className="error-text">{aiError}</p>}

      {aiSuggestions && (
        <div className="card ai-suggestions">
          <div className="card-header-row">
            <h3>AI Suggestions</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAiSuggestions(null)}>
              Dismiss
            </button>
          </div>
          <pre className="ai-text">{aiSuggestions}</pre>
        </div>
      )}

      <h2 className="section-title">
        Suggestions
        <span className="count">{suggestions.length}</span>
      </h2>

      {pantry.length === 0 && (
        <p className="hint-banner">
          Add items to your pantry for better matches.{' '}
          <Link to="/pantry">Go to Pantry →</Link>
        </p>
      )}

      {suggestions.length === 0 ? (
        <div className="empty-state">
          <p>No matches found. Try relaxing filters or adding more pantry items.</p>
        </div>
      ) : (
        <div className="meal-grid">
          {suggestions.map((s) => (
            <MealCard
              key={s.recipe.id}
              scored={s}
              isFavorite={isFavorite(preferences, s.recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
