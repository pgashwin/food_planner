import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MaterialSymbol } from '../components/MaterialSymbol';
import { useApp } from '../context/AppContext';
import { useHomeBrowse } from '../context/HomeBrowseContext';
import { scaleRecipe } from '../lib/portions';

export function CookPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { findRecipe, markCooked } = useApp();
  const { people } = useHomeBrowse();

  const recipe = id ? findRecipe(id) : undefined;
  const servings = Number(searchParams.get('servings')) || people;

  const scaled = useMemo(
    () => (recipe ? scaleRecipe(recipe, servings) : null),
    [recipe, servings],
  );

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  if (!recipe || !scaled) {
    return (
      <Box>
        <Typography>Recipe not found.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Home</Button>
      </Box>
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
    await markCooked(recipe, recipe.mealSlots[0], servings);
    setDone(true);
  };

  if (done) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <MaterialSymbol name="celebration" color="primary" fontSize={64} sx={{ mb: 2 }} />
        <Typography variant="h4" gutterBottom>Enjoy your meal!</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          We&apos;ll suggest more meals like {recipe.name}.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          Plan next meal
        </Button>
      </Box>
    );
  }

  const progress = scaled.steps.length
    ? Math.round((completedSteps.size / scaled.steps.length) * 100)
    : 0;

  return (
    <Box>
      <Button startIcon={<MaterialSymbol name="arrow_back" />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" gutterBottom>{recipe.name}</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Cook mode · {servings} servings
      </Typography>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, borderRadius: 1, height: 8 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {completedSteps.size} of {scaled.steps.length} steps
      </Typography>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Ingredients checklist</Typography>
          <List dense>
            {scaled.ingredients.map((ing, i) => (
              <ListItem key={i} disableGutters>
                <ListItemText primary={`${ing.quantity ? `${ing.quantity} ` : ''}${ing.name}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Typography variant="h6" sx={{ px: 2, pt: 2, pb: 1 }}>Steps</Typography>
          <List disablePadding>
            {scaled.steps.map((step, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton onClick={() => toggleStep(i)} dense>
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <Checkbox
                      edge="start"
                      checked={completedSteps.has(i)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    slotProps={{
                      primary: {
                        sx: completedSteps.has(i)
                          ? { textDecoration: 'line-through', color: 'text.secondary' }
                          : undefined,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Button variant="contained" size="large" fullWidth onClick={handleFinish} sx={{ mt: 1 }}>
        I cooked this
      </Button>
    </Box>
  );
}
