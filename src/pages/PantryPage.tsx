import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { PANTRY_TEMPLATES, STAPLE_CATEGORIES } from '../data/staples';
import { MaterialSymbol } from '../components/MaterialSymbol';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { createPantryItem } from '../lib/pantry';
import { parseBulkIngredients } from '../lib/ingredients';
import { filterSpecificPantryNames, isVaguePantryTerm, vaguePantryMessage } from '../lib/specificIngredients';
import { createAIProvider, parsePantryWithAI } from '../lib/ai';
import {
  cycleProfileQuantity,
  formatProfileQuantity,
  inferQuantityProfile,
  quantityForProfileStatus,
  statusFromProfileQuantity,
} from '../lib/pantryUnits';
import type { PantryStatus } from '../types';

const STATUS_COLORS: Record<PantryStatus, 'success' | 'warning' | 'error'> = {
  enough: 'success',
  low: 'warning',
  out: 'error',
};

export function PantryPage() {
  const { pantry, household, addToPantry, removeFromPantry, updatePantry, aiSettings } = useApp();
  const qtySettings = household.pantryQuantities;
  const [pasteText, setPasteText] = useState('');
  const [newItem, setNewItem] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
  };

  const sortedPantry = useMemo(
    () => [...pantry].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [pantry],
  );

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    if (isVaguePantryTerm(newItem.trim())) {
      showMessage(vaguePantryMessage(newItem.trim()));
      return;
    }
    await addToPantry([newItem.trim()]);
    setNewItem('');
    showMessage('Item added');
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    const parsed = parseBulkIngredients(pasteText);
    const { accepted, rejected } = filterSpecificPantryNames(parsed);
    if (accepted.length === 0) {
      showMessage(
        rejected.length > 0
          ? `Skipped vague items (${rejected.join(', ')}). Use specific names like all purpose flour or moong dal.`
          : 'No ingredients detected',
      );
      return;
    }
    await addToPantry(accepted);
    setPasteText('');
    const skipped = rejected.length > 0 ? ` Skipped vague: ${rejected.join(', ')}.` : '';
    showMessage(`Added ${accepted.length} items.${skipped}`);
  };

  const handleAIParse = async () => {
    if (!pasteText.trim()) return;
    setAiLoading(true);
    try {
      const provider = await createAIProvider(aiSettings);
      if (!provider) {
        showMessage('Enable AI in Settings first');
        return;
      }
      const items = await parsePantryWithAI(provider, pasteText, aiSettings.systemPrompt);
      const { accepted, rejected } = filterSpecificPantryNames(items);
      if (accepted.length === 0) {
        showMessage(
          rejected.length > 0
            ? 'AI returned vague items only. Add specific types (e.g. atta, basmati rice).'
            : 'No ingredients detected',
        );
        return;
      }
      await addToPantry(accepted);
      setPasteText('');
      const skipped = rejected.length > 0 ? ` Skipped vague: ${rejected.join(', ')}.` : '';
      showMessage(`AI added ${accepted.length} items.${skipped}`);
    } catch (e) {
      showMessage(e instanceof Error ? e.message : 'AI parse failed');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleStaple = async (name: string) => {
    const norm = createPantryItem(name, qtySettings).normalizedName;
    const exists = pantry.some((p) => p.normalizedName === norm);
    if (exists) {
      const item = pantry.find((p) => p.normalizedName === norm);
      if (item?.id) await removeFromPantry(item.id);
    } else {
      await addToPantry([name]);
    }
  };

  const cycleStatus = async (id: number | undefined, current: PantryStatus) => {
    if (!id) return;
    const item = pantry.find((p) => p.id === id);
    if (!item) return;
    const profile = item.quantityProfile ?? inferQuantityProfile(item.normalizedName);
    const order: PantryStatus[] = ['enough', 'low', 'out'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    await updatePantry({
      ...item,
      status: next,
      quantity: quantityForProfileStatus(profile, next),
      quantityProfile: profile,
    });
  };

  const cycleItemQuantity = async (id: number | undefined, current: number) => {
    if (!id) return;
    const item = pantry.find((p) => p.id === id);
    if (!item) return;
    const profile = item.quantityProfile ?? inferQuantityProfile(item.normalizedName);
    const nextQty = cycleProfileQuantity(profile, current);
    const nextStatus = statusFromProfileQuantity(profile, nextQty);
    await updatePantry({
      ...item,
      quantity: nextQty,
      status: nextStatus,
      quantityProfile: profile,
    });
  };

  return (
    <Box>
      <PageHeader title="Pantry" subtitle={`${pantry.length} items tracked`} />

      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Quick add</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add ingredient…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Button variant="contained" onClick={handleAddItem} startIcon={<MaterialSymbol name="add" />}>
              Add
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Bulk paste</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Paste grocery list, one item per line…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={handlePaste}>Parse & add</Button>
            <Button
              variant="outlined"
              startIcon={<MaterialSymbol name="auto_awesome" />}
              onClick={handleAIParse}
              disabled={aiLoading}
            >
              {aiLoading ? 'Parsing…' : 'AI parse'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Templates</Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {Object.entries(PANTRY_TEMPLATES).map(([name, items]) => (
              <Chip
                key={name}
                label={`+ ${name}`}
                onClick={() => addToPantry(items).then(() => showMessage(`Added ${name} template`))}
                variant="outlined"
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Common staples</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tap to add or remove. Use specific types (e.g. all purpose flour, atta, moong dal) — vague names like “flour” or “rice” are not allowed.
          </Typography>
          {Object.entries(STAPLE_CATEGORIES).map(([category, staples]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {category}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {staples.map((staple) => {
                  const norm = createPantryItem(staple, qtySettings).normalizedName;
                  const active = pantry.some((p) => p.normalizedName === norm);
                  return (
                    <Chip
                      key={staple}
                      label={staple.replace(/_/g, ' ')}
                      onClick={() => toggleStaple(staple)}
                      color={active ? 'primary' : 'default'}
                      variant={active ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>Inventory</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Tap status or quantity to cycle. Units adapt per item (pcs, cups, g, tbsp).
      </Typography>
      {pantry.length === 0 ? (
        <Alert severity="info">No items yet. Tap staples above to get started.</Alert>
      ) : (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <List disablePadding>
            {sortedPantry.map((item) => (
              <ListItem
                key={item.id}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    onClick={() => item.id && removeFromPantry(item.id)}
                  >
                    <MaterialSymbol name="close" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.name}
                  slotProps={{ primary: { sx: { textTransform: 'capitalize' } } }}
                />
                <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
                  <Chip
                    label={formatProfileQuantity(
                      item.quantity,
                      item.quantityProfile ?? inferQuantityProfile(item.normalizedName),
                    )}
                    size="small"
                    variant="outlined"
                    onClick={() => cycleItemQuantity(item.id, item.quantity)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label={item.status}
                    size="small"
                    color={STATUS_COLORS[item.status]}
                    onClick={() => cycleStatus(item.id, item.status)}
                    sx={{ textTransform: 'capitalize', cursor: 'pointer' }}
                  />
                </Stack>
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
