import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { MaterialSymbol } from '../components/MaterialSymbol';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { PROVIDER_MODELS } from '../lib/ai';
import {
  normalizePantryQuantities,
  parseQuantityStepsInput,
  stepsToInput,
} from '../lib/pantryQuantities';
import type { AISettings, PantryStatus, PortionMode } from '../types';

export function SettingsPage() {
  const {
    household,
    setHousehold,
    aiSettings,
    setAISettings,
    exportData,
    importData,
    resetAll,
  } = useApp();

  const [localAI, setLocalAI] = useState<AISettings>(aiSettings);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalAI(aiSettings);
  }, [aiSettings]);

  const saveAI = async () => {
    await setAISettings(localAI);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      alert('Data imported successfully');
    } catch {
      alert('Failed to import data');
    }
    e.target.value = '';
  };

  const handleReset = async () => {
    if (confirm('Delete all pantry, preferences, and settings? This cannot be undone.')) {
      await resetAll();
      window.location.href = import.meta.env.BASE_URL;
    }
  };

  const suggestedModels = PROVIDER_MODELS[localAI.provider];
  const qty = household.pantryQuantities;

  const updatePantryQuantities = (patch: Partial<typeof qty>) => {
    setHousehold({
      ...household,
      pantryQuantities: normalizePantryQuantities({ ...qty, ...patch }),
    });
  };

  const updateStatusQuantity = (status: PantryStatus, value: number) => {
    updatePantryQuantities({
      statusQuantities: { ...qty.statusQuantities, [status]: value },
    });
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Household, AI, and data preferences" />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Household</Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Family size
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
            {[1, 2, 3, 4, 5, 6, 8].map((n) => (
              <Chip
                key={n}
                label={n}
                onClick={() => setHousehold({ ...household, size: n })}
                color={household.size === n ? 'primary' : 'default'}
                variant={household.size === n ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Default portions
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {(['solo', 'family'] as PortionMode[]).map((mode) => (
              <Chip
                key={mode}
                label={mode === 'solo' ? 'Just me' : 'Family'}
                onClick={() => setHousehold({ ...household, defaultPortionMode: mode })}
                color={household.defaultPortionMode === mode ? 'primary' : 'default'}
                variant={household.defaultPortionMode === mode ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={household.dietaryTags.includes('vegetarian')}
                onChange={(e) => {
                  const tags = e.target.checked
                    ? [...household.dietaryTags.filter((t) => t !== 'vegetarian'), 'vegetarian']
                    : household.dietaryTags.filter((t) => t !== 'vegetarian');
                  setHousehold({ ...household, dietaryTags: tags });
                }}
              />
            }
            label="Prefer vegetarian"
          />
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Pantry quantities</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set discrete quantity steps and default amounts for enough / low / out.
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="Quantity steps (comma-separated)"
            value={stepsToInput(qty.steps)}
            onChange={(e) =>
              updatePantryQuantities({ steps: parseQuantityStepsInput(e.target.value) })
            }
            helperText="Tap quantity on pantry items to cycle through these values"
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Default quantity per status
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
            {(['enough', 'low', 'out'] as PantryStatus[]).map((status) => (
              <TextField
                key={status}
                size="small"
                type="number"
                label={status}
                value={qty.statusQuantities[status]}
                onChange={(e) => updateStatusQuantity(status, Math.max(0, Number(e.target.value)))}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>AI Assistant (BYOK)</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your API key stays in this browser only.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={localAI.enabled}
                onChange={(e) => setLocalAI({ ...localAI, enabled: e.target.checked })}
              />
            }
            label="Enable AI features"
            sx={{ mb: 2, display: 'block' }}
          />

          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Provider</InputLabel>
              <Select
                label="Provider"
                value={localAI.provider}
                onChange={(e) => {
                  const provider = e.target.value as AISettings['provider'];
                  setLocalAI({
                    ...localAI,
                    provider,
                    model: PROVIDER_MODELS[provider][0],
                  });
                }}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="gemini">Google Gemini</MenuItem>
                <MenuItem value="claude">Anthropic Claude</MenuItem>
                <MenuItem value="custom">Custom (OpenAI-compatible)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="password"
              label="API Key"
              placeholder="sk-… or your provider key"
              value={localAI.apiKey}
              onChange={(e) => setLocalAI({ ...localAI, apiKey: e.target.value })}
            />

            <TextField
              fullWidth
              size="small"
              label="Model"
              placeholder="e.g. gpt-4o-mini, gemini-2.0-flash, claude-3-5-haiku-latest"
              value={localAI.model}
              onChange={(e) => setLocalAI({ ...localAI, model: e.target.value })}
              helperText="Enter any model ID supported by your provider"
            />
            {suggestedModels.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Quick picks
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {suggestedModels.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      size="small"
                      variant={localAI.model === m ? 'filled' : 'outlined'}
                      color={localAI.model === m ? 'primary' : 'default'}
                      onClick={() => setLocalAI({ ...localAI, model: m })}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {localAI.provider === 'custom' && (
              <TextField
                fullWidth
                size="small"
                type="url"
                label="Base URL"
                placeholder="https://api.example.com/v1"
                value={localAI.customBaseUrl ?? ''}
                onChange={(e) => setLocalAI({ ...localAI, customBaseUrl: e.target.value })}
              />
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Custom system prompt (optional)"
              placeholder="e.g. Focus on South Indian home cooking…"
              value={localAI.systemPrompt ?? ''}
              onChange={(e) => setLocalAI({ ...localAI, systemPrompt: e.target.value })}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2 }}>
            <Button variant="contained" onClick={saveAI}>Save AI settings</Button>
            {saved && <Typography variant="body2" color="success.main">Saved!</Typography>}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Data</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<MaterialSymbol name="download" />}
              onClick={handleExport}
            >
              Export backup
            </Button>
            <Button
              variant="outlined"
              startIcon={<MaterialSymbol name="upload" />}
              onClick={() => fileRef.current?.click()}
            >
              Import backup
            </Button>
            <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="outlined"
            color="error"
            startIcon={<MaterialSymbol name="delete_forever" />}
            onClick={handleReset}
          >
            Clear all data
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
