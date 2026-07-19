import { Link } from 'react-router-dom';
import type { ScoredRecipe } from '../types';
import { matchLevelLabel } from '../lib/suggestions';

interface MealCardProps {
  scored: ScoredRecipe;
  isFavorite?: boolean;
}

export function MealCard({ scored, isFavorite }: MealCardProps) {
  const { recipe, matchLevel, missingIngredients } = scored;
  const totalTime = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <Link to={`/meal/${recipe.id}`} className="meal-card">
      <div className="meal-card-header">
        <h3>{recipe.name}</h3>
        {isFavorite && <span className="fav-badge">★</span>}
      </div>
      <div className="meal-meta">
        <span>{recipe.cuisine}</span>
        <span>{totalTime} min</span>
        <span className={`match-badge match-${matchLevel}`}>
          {matchLevelLabel(matchLevel)}
        </span>
      </div>
      <div className="meal-tags">
        {recipe.vegetarian && <span className="tag">Veg</span>}
        {recipe.kidFriendly && <span className="tag">Kid-friendly</span>}
        {recipe.tags.slice(0, 2).map((t) => (
          <span key={t} className="tag">{t.replace(/_/g, ' ')}</span>
        ))}
      </div>
      {missingIngredients.length > 0 && (
        <p className="missing-hint">Missing: {missingIngredients.slice(0, 3).join(', ')}</p>
      )}
    </Link>
  );
}
