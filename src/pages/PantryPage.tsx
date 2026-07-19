import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
import { useState } from 'react';
import { PANTRY_TEMPLATES, QUICK_STAPLES } from '../data/staples';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { createPantryItem } from '../lib/pantry';
import { parseBulkIngredients } from '../lib/ingredients';
import { createAIProvider, parsePantryWithAI } from '../lib/ai';
import { cycleQuantity, formatQuantity, quantityForStatus } from '../lib/pantryQuantities';
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

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    await addToPantry([newItem.trim()]);
    setNewItem('');
    showMessage('Item added');
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    const items = parseBulkIngredients(pasteText);
    if (items.length === 0) {
      showMessage('No ingredients detected');
      return;
    }
    await addToPantry(items);
    setPasteText('');
    showMessage(`Added ${items.length} items`);
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
      await addToPantry(items);
      setPasteText('');
      showMessage(`AI added ${items.length} items`);
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
    const order: PantryStatus[] = ['enough', 'low', 'out'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    await updatePantry({
      ...item,
      status: next,
      quantity: quantityForStatus(qtySettings, next),
    });
  };

  const cycleItemQuantity = async (id: number | undefined, current: number) => {
    if (!id) return;
    const item = pantry.find((p) => p.id === id);
    if (!item) return;
    const nextQty = cycleQuantity(qtySettings, current);
    let nextStatus = item.status;
    if (nextQty === qtySettings.statusQuantities.out) nextStatus = 'out';
    else if (nextQty <= qtySettings.statusQuantities.low) nextStatus = 'low';
    else nextStatus = 'enough';
    await updatePantry({ ...item, quantity: nextQty, status: nextStatus });
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
            <Button variant="contained" onClick={handleAddItem} startIcon={<AddRoundedIcon />}>
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
              startIcon={<AutoAwesomeRoundedIcon />}
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
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {QUICK_STAPLES.map((staple) => {
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
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>Inventory</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Tap status or quantity to cycle. Steps: {qtySettings.steps.join(', ')}
      </Typography>
      {pantry.length === 0 ? (
        <Alert severity="info">No items yet. Tap staples above to get started.</Alert>
      ) : (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <List disablePadding>
            {pantry.map((item) => (
              <ListItem
                key={item.id}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    onClick={() => item.id && removeFromPantry(item.id)}
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.name}
                  slotProps={{ primary: { sx: { textTransform: 'capitalize' } } }}
                />
                <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
                  <Chip
                    label={formatQuantity(item.quantity)}
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
