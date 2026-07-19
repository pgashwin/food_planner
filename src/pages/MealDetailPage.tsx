import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { matchRecipeToPantry } from '../lib/pantry';
import { isFavorite } from '../lib/preferences';
import { getTargetServings, scaleRecipe } from '../lib/portions';
import { matchLevelLabel } from '../lib/suggestions';
import type { PortionMode } from '../types';

export function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    recipes,
    pantry,
    household,
    preferences,
    giveFeedback,
    toggleRecipeFavorite,
  } = useApp();

  const recipe = recipes.find((r) => r.id === id);
  const [portionMode, setPortionMode] = useState<PortionMode>(household.defaultPortionMode);

  const servings = useMemo(
    () => (recipe ? getTargetServings(recipe.baseServings, household.size, portionMode) : 1),
    [recipe, household.size, portionMode],
  );

  const scaled = useMemo(
    () => (recipe ? scaleRecipe(recipe, servings) : null),
    [recipe, servings],
  );

  const pantryMatch = useMemo(
    () => (recipe ? matchRecipeToPantry(recipe, pantry) : null),
    [recipe, pantry],
  );

  if (!recipe || !scaled || !pantryMatch) {
    return (
      <div className="page">
        <p>Recipe not found.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  const favorite = isFavorite(preferences, recipe.id);
  const totalTime = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <div className="page meal-detail">
      <button type="button" className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="meal-detail-header">
        <h2>{recipe.name}</h2>
        <button
          type="button"
          className={`btn-icon fav-btn ${favorite ? 'active' : ''}`}
          onClick={() => toggleRecipeFavorite(recipe.id)}
          aria-label="Toggle favorite"
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="meal-meta detail-meta">
        <span>{recipe.cuisine}</span>
        <span>{totalTime} min</span>
        <span>{recipe.difficulty}</span>
        <span className={`match-badge match-${pantryMatch.matchLevel}`}>
          {matchLevelLabel(pantryMatch.matchLevel)}
        </span>
      </div>

      <div className="card">
        <h3>Portions</h3>
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${portionMode === 'solo' ? 'chip-active' : ''}`}
            onClick={() => setPortionMode('solo')}
          >
            Just me (1)
          </button>
          <button
            type="button"
            className={`chip ${portionMode === 'family' ? 'chip-active' : ''}`}
            onClick={() => setPortionMode('family')}
          >
            Family ({household.size})
          </button>
        </div>
        <p className="servings-note">Scaled for {servings} serving{servings > 1 ? 's' : ''}</p>
      </div>

      <div className="card">
        <h3>Ingredients</h3>
        <ul className="ingredient-list">
          {scaled.ingredients.map((ing, i) => {
            const has = pantryMatch.haveIngredients.some(
              (h) => h.toLowerCase().includes(ing.name.toLowerCase()) ||
                ing.name.toLowerCase().includes(h.toLowerCase()),
            );
            return (
              <li key={i} className={has ? 'have' : ing.optional ? 'optional' : 'missing'}>
                <span className="ing-check">{has ? '✓' : ing.optional ? '~' : '○'}</span>
                {ing.quantity ? `${ing.quantity} ` : ''}{ing.name}
                {ing.optional && <span className="opt-label"> (optional)</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card">
        <h3>Steps</h3>
        <ol className="steps-list">
          {scaled.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="feedback-row">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => giveFeedback(recipe, 'up', recipe.mealSlots[0])}
        >
          👍 Like
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => giveFeedback(recipe, 'down', recipe.mealSlots[0])}
        >
          👎 Pass
        </button>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={() => navigate(`/cook/${recipe.id}?servings=${servings}`)}
      >
        Start cooking
      </button>
    </div>
  );
}
