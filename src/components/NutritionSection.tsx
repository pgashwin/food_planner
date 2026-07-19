import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  formatCalories,
  formatMacroGrams,
  getNutritionPerServing,
  type NutritionTotals,
} from '../lib/nutrition';
import type { Recipe } from '../types';

interface NutritionSectionProps {
  recipe: Recipe;
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ textAlign: 'center', py: 0.5 }}>
      <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function MacroGrid({ totals }: { totals: NutritionTotals }) {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MacroStat label="Calories" value={formatCalories(totals.calories)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MacroStat label="Protein" value={formatMacroGrams(totals.proteinG)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MacroStat label="Carbs" value={formatMacroGrams(totals.carbsG)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MacroStat label="Fat" value={formatMacroGrams(totals.fatG)} />
      </Grid>
    </Grid>
  );
}

export function NutritionSection({ recipe }: NutritionSectionProps) {
  const perServing = getNutritionPerServing(recipe);

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Nutrition
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Approximate values per serving
        </Typography>
        <MacroGrid totals={perServing} />
      </CardContent>
    </Card>
  );
}
