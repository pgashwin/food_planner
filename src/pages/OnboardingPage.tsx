import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PANTRY_TEMPLATES, STAPLE_CATEGORIES } from '../data/staples';
import { useApp } from '../context/AppContext';
import { LeafLogo } from '../components/LeafLogo';

export function OnboardingPage() {
  const { household, setHousehold, addToPantry } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(household.size);
  const [selectedStaples, setSelectedStaples] = useState<Set<string>>(new Set());

  const toggleStaple = (name: string) => {
    setSelectedStaples((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const applyTemplate = (template: string[]) => {
    setSelectedStaples((prev) => {
      const next = new Set(prev);
      template.forEach((t) => next.add(t));
      return next;
    });
  };

  const finish = async (skipPantry = false) => {
    await setHousehold({
      ...household,
      size,
      onboardingComplete: true,
    });
    if (!skipPantry && selectedStaples.size > 0) {
      await addToPantry([...selectedStaples]);
    }
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
          <LeafLogo size={56} withTile />
          <Typography variant="h4" sx={{ textAlign: 'center' }}>Food Planner</Typography>
        </Stack>

        {step === 0 ? (
          <>
            <Typography variant="h5" gutterBottom>Welcome!</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Plan family meals in under a minute. No account needed.
            </Typography>

            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  How many people do you usually cook for?
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <Chip
                      key={n}
                      label={n}
                      onClick={() => setSize(n)}
                      color={size === n ? 'primary' : 'default'}
                      variant={size === n ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={1}>
              <Button variant="contained" size="large" fullWidth onClick={() => setStep(1)}>
                Next: Set up pantry
              </Button>
              <Button variant="text" fullWidth onClick={() => finish(true)}>
                Skip for now
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>What&apos;s in your kitchen?</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Tap staples you have — use specific types (all purpose flour, moong dal, basmati rice). Vague names like “flour” are not allowed.
            </Typography>

            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick templates
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {Object.entries(PANTRY_TEMPLATES).map(([name, items]) => (
                    <Chip
                      key={name}
                      label={`+ ${name}`}
                      onClick={() => applyTemplate(items)}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {Object.entries(STAPLE_CATEGORIES).map(([category, staples]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {category}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {staples.map((staple) => (
                    <Chip
                      key={staple}
                      label={staple.replace(/_/g, ' ')}
                      onClick={() => toggleStaple(staple)}
                      color={selectedStaples.has(staple) ? 'primary' : 'default'}
                      variant={selectedStaples.has(staple) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Box>
            ))}

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
              {selectedStaples.size} items selected
            </Typography>

            <Stack spacing={1}>
              <Button variant="contained" size="large" fullWidth onClick={() => finish()}>
                Start planning ({selectedStaples.size || 'no'} items)
              </Button>
              <Button variant="text" fullWidth onClick={() => finish(true)}>
                Skip pantry setup
              </Button>
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
}
