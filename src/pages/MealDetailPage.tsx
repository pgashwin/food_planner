import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRecipeCuisineLabel } from '../lib/cuisine';
import { ingredientMatches } from '../lib/ingredients';
import { matchRecipeToPantry } from '../lib/pantry';
import { isFavorite } from '../lib/preferences';
import { getTargetServings, scaleRecipe } from '../lib/portions';
import { matchLevelLabel } from '../lib/suggestions';
import type { PortionMode } from '../types';

const MATCH_COLORS = {
  ready: 'success',
  missing_one: 'warning',
  need_shopping: 'error',
} as const;

export function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    findRecipe,
    pantry,
    household,
    preferences,
    giveFeedback,
    toggleRecipeFavorite,
  } = useApp();

  const recipe = id ? findRecipe(id) : undefined;
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
    () =>
      recipe
        ? matchRecipeToPantry(recipe, pantry, {
            servings,
            baseServings: recipe.baseServings,
          })
        : null,
    [recipe, pantry, servings],
  );

  if (!recipe || !scaled || !pantryMatch) {
    return (
      <Box>
        <Typography>Recipe not found.</Typography>
        <Button component={RouterLink} to="/">Back home</Button>
      </Box>
    );
  }

  const favorite = isFavorite(preferences, recipe.id);
  const totalTime = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h4" component="h1">{recipe.name}</Typography>
        <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            onClick={() => toggleRecipeFavorite(recipe.id)}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            color={favorite ? 'secondary' : 'default'}
          >
            {favorite ? <StarRoundedIcon /> : <StarOutlineRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 3 }}>
        {favorite && (
          <Chip icon={<StarRoundedIcon />} label="Favorite" size="small" color="secondary" />
        )}
        <Chip label={getRecipeCuisineLabel(recipe)} variant="outlined" color="primary" />
        <Chip label={`${totalTime} min`} variant="outlined" />
        <Chip label={recipe.difficulty} variant="outlined" />
        <Chip
          label={matchLevelLabel(pantryMatch.matchLevel)}
          color={MATCH_COLORS[pantryMatch.matchLevel]}
        />
      </Stack>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Portions</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label="Just me (1)"
              onClick={() => setPortionMode('solo')}
              color={portionMode === 'solo' ? 'primary' : 'default'}
              variant={portionMode === 'solo' ? 'filled' : 'outlined'}
            />
            <Chip
              label={`Family (${household.size})`}
              onClick={() => setPortionMode('family')}
              color={portionMode === 'family' ? 'primary' : 'default'}
              variant={portionMode === 'family' ? 'filled' : 'outlined'}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Scaled for {servings} serving{servings > 1 ? 's' : ''}
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Ingredients</Typography>
          <List dense disablePadding>
            {scaled.ingredients.map((ing, i) => {
              const has =
                ing.optional ||
                pantryMatch.haveIngredients.some((h) => ingredientMatches(h, ing.name));
              return (
                <ListItem key={i} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {has ? (
                      <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedRoundedIcon
                        color={ing.optional ? 'disabled' : 'error'}
                        fontSize="small"
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${ing.quantity ? `${ing.quantity} ` : ''}${ing.name}${ing.optional ? ' (optional)' : ''}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Steps</Typography>
          <List component="ol" sx={{ pl: 2 }}>
            {scaled.steps.map((step, i) => (
              <ListItem key={i} component="li" sx={{ display: 'list-item', py: 0.5 }}>
                <Typography>{step}</Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ThumbUpAltRoundedIcon />}
          onClick={() => giveFeedback(recipe, 'up', recipe.mealSlots[0])}
        >
          Like
        </Button>
        <Button
          variant="outlined"
          startIcon={<ThumbDownAltRoundedIcon />}
          onClick={() => giveFeedback(recipe, 'down', recipe.mealSlots[0])}
        >
          Pass
        </Button>
      </Stack>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={() => navigate(`/cook/${recipe.id}?servings=${servings}`)}
      >
        Start cooking
      </Button>
    </Box>
  );
}
