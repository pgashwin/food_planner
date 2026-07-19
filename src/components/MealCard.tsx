import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import type { ScoredRecipe } from '../types';
import type { RecipeCuisineValue } from '../lib/cuisine';
import { matchLevelLabel } from '../lib/suggestions';
import { formatCaloriesPerServing } from '../lib/nutrition';
import { isRecipeVegetarian } from '../lib/vegetarian';
import { CuisineSelectChip } from './CuisineSelectChip';
import { DishTitleRow } from './DishTitleRow';
import { MaterialSymbol } from './MaterialSymbol';

interface MealCardProps {
  scored: ScoredRecipe;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToList?: () => void;
  onDelete?: () => void;
  onCuisineChange?: (value: RecipeCuisineValue) => void;
}

const MATCH_COLORS: Record<ScoredRecipe['matchLevel'], 'success' | 'warning' | 'error'> = {
  ready: 'success',
  missing_one: 'warning',
  need_shopping: 'error',
};

export function MealCard({
  scored,
  isFavorite,
  onToggleFavorite,
  onAddToList,
  onDelete,
  onCuisineChange,
}: MealCardProps) {
  const { recipe, matchLevel, missingIngredients, isAiSuggested, aiBadgeVariant } = scored;
  const totalTime = recipe.prepMinutes + recipe.cookMinutes;
  const showAiBadge = isAiSuggested || recipe.aiGenerated;
  const isNewAi = aiBadgeVariant === 'new';
  const vegetarian = isRecipeVegetarian(recipe);
  const hasActions = onToggleFavorite || onAddToList || onDelete;

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 1,
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/meal/${recipe.id}`}
        sx={{ flexGrow: 1, display: 'block' }}
      >
        <CardContent>
          <DishTitleRow name={recipe.name} vegetarian={vegetarian} />

          <Box sx={{ mb: 1.5 }} onClick={(e) => e.stopPropagation()}>
            <CuisineSelectChip recipe={recipe} onChange={onCuisineChange} />
          </Box>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
              <Chip
                icon={<MaterialSymbol name="schedule" fontSize="small" />}
                label={`${totalTime} min`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<MaterialSymbol name="local_fire_department" fontSize="small" />}
                label={formatCaloriesPerServing(recipe)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={matchLevelLabel(matchLevel)}
                size="small"
                color={MATCH_COLORS[matchLevel]}
                variant={matchLevel === 'ready' ? 'outlined' : 'filled'}
              />
            </Stack>

            {showAiBadge && (
              <Chip
                icon={<MaterialSymbol name="auto_awesome" fontSize="small" />}
                label="Suggested by AI"
                size="small"
                color="info"
                variant={isNewAi ? 'filled' : 'outlined'}
                sx={
                  isNewAi
                    ? { mb: missingIngredients.length > 0 ? 1 : 0 }
                    : { borderColor: 'info.main', color: 'info.main', mb: missingIngredients.length > 0 ? 1 : 0 }
                }
              />
            )}

            {missingIngredients.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Missing: {missingIngredients.slice(0, 3).join(', ')}
              </Typography>
            )}
          </CardContent>
      </CardActionArea>

      {hasActions && (
        <>
          <Divider />
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ justifyContent: 'flex-end', px: 1, py: 0.75 }}
            onClick={(e) => e.stopPropagation()}
          >
            {onToggleFavorite && (
              <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <IconButton
                  size="small"
                  color={isFavorite ? 'secondary' : 'default'}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={onToggleFavorite}
                >
                  <MaterialSymbol name="star" fontSize="small" filled={!!isFavorite} />
                </IconButton>
              </Tooltip>
            )}
            {onAddToList && (
              <Tooltip title="Add to My Meals">
                <IconButton
                  size="small"
                  color="primary"
                  aria-label="Add to My Meals"
                  onClick={onAddToList}
                >
                  <MaterialSymbol name="add" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove meal"
                  onClick={onDelete}
                >
                  <MaterialSymbol name="delete" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </>
      )}
    </Card>
  );
}
