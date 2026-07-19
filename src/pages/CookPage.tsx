import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { scaleRecipe } from '../lib/portions';

export function CookPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { recipes, markCooked } = useApp();

  const recipe = recipes.find((r) => r.id === id);
  const servings = Number(searchParams.get('servings')) || recipe?.baseServings || 4;

  const scaled = useMemo(
    () => (recipe ? scaleRecipe(recipe, servings) : null),
    [recipe, servings],
  );

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [kidsLiked, setKidsLiked] = useState<boolean | undefined>(undefined);
  const [done, setDone] = useState(false);

  if (!recipe || !scaled) {
    return (
      <div className="page">
        <p>Recipe not found.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    );
  }

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleFinish = async () => {
    await markCooked(recipe, recipe.mealSlots[0], servings, kidsLiked);
    setDone(true);
  };

  if (done) {
    return (
      <div className="page cook-done">
        <h2>Enjoy your meal!</h2>
        <p>We&apos;ll suggest more meals like {recipe.name}.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          Plan next meal
        </button>
      </div>
    );
  }

  const progress = scaled.steps.length
    ? Math.round((completedSteps.size / scaled.steps.length) * 100)
    : 0;

  return (
    <div className="page cook">
      <button type="button" className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>{recipe.name}</h2>
      <p className="subtitle">Cook mode · {servings} servings</p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-text">{completedSteps.size} of {scaled.steps.length} steps</p>

      <div className="card">
        <h3>Ingredients checklist</h3>
        <ul className="cook-ingredients">
          {scaled.ingredients.map((ing, i) => (
            <li key={i}>
              {ing.quantity ? `${ing.quantity} ` : ''}{ing.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Steps</h3>
        <ul className="cook-steps">
          {scaled.steps.map((step, i) => (
            <li key={i}>
              <label className="step-check">
                <input
                  type="checkbox"
                  checked={completedSteps.has(i)}
                  onChange={() => toggleStep(i)}
                />
                <span className={completedSteps.has(i) ? 'done' : ''}>{step}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={kidsLiked === true}
            onChange={(e) => setKidsLiked(e.target.checked ? true : undefined)}
          />
          Kids liked it
        </label>
      </div>

      <button type="button" className="btn btn-primary btn-lg" onClick={handleFinish}>
        I cooked this
      </button>
    </div>
  );
}
