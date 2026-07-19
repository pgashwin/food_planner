import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import type { ScoredRecipe } from '../types';
import { getRecipeCuisineLabel } from '../lib/cuisine';
import { visibleRecipeTags } from '../lib/recipePromote';
import { matchLevelLabel } from '../lib/suggestions';

interface MealCardProps {
  scored: ScoredRecipe;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToList?: () => void;
}

const MATCH_COLORS: Record<ScoredRecipe['matchLevel'], 'success' | 'warning' | 'error'> = {
  ready: 'success',
  missing_one: 'warning',
  need_shopping: 'error',
};

export function MealCard({ scored, isFavorite, onToggleFavorite, onAddToList }: MealCardProps) {
  const { recipe, matchLevel, missingIngredients, isAiSuggested, aiBadgeVariant } = scored;
  const totalTime = recipe.prepMinutes + recipe.cookMinutes;
  const showAiBadge = isAiSuggested || recipe.aiGenerated;
  const isNewAi = aiBadgeVariant === 'new';
  const tags = visibleRecipeTags(recipe.tags);
  const cuisineLabel = getRecipeCuisineLabel(recipe);

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%', position: 'relative' }}>
      {onToggleFavorite && (
        <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            color={isFavorite ? 'secondary' : 'default'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            {isFavorite ? <StarRoundedIcon fontSize="small" /> : <StarOutlineRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      {onAddToList && (
        <Tooltip title="Add to my meals">
          <IconButton
            size="small"
            color="primary"
            aria-label="Add to my meals"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToList();
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <CardActionArea
        component={RouterLink}
        to={`/meal/${recipe.id}`}
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <CardContent sx={{ pl: onToggleFavorite ? 6 : 2, pr: onAddToList ? 6 : 2 }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ lineHeight: 1.3 }}>
              {recipe.name}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
            <Chip label={cuisineLabel} size="small" variant="outlined" color="primary" />
            <Chip
              icon={<AccessTimeRoundedIcon />}
              label={`${totalTime} min`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={matchLevelLabel(matchLevel)}
              size="small"
              color={MATCH_COLORS[matchLevel]}
            />
          </Stack>

          <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {isFavorite && (
              <Chip icon={<StarRoundedIcon />} label="Favorite" size="small" color="secondary" variant="outlined" />
            )}
            {showAiBadge && (
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label="Suggested by AI"
                size="small"
                color="info"
                variant={isNewAi ? 'filled' : 'outlined'}
                sx={
                  isNewAi
                    ? undefined
                    : { borderColor: 'info.main', color: 'info.main' }
                }
              />
            )}
            {recipe.vegetarian && <Chip label="Veg" size="small" />}
            {recipe.kidFriendly && <Chip label="Kid-friendly" size="small" />}
            {tags.slice(0, 2).map((t) => (
              <Chip key={t} label={t.replace(/_/g, ' ')} size="small" variant="outlined" />
            ))}
          </Stack>

          {missingIngredients.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Missing: {missingIngredients.slice(0, 3).join(', ')}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
