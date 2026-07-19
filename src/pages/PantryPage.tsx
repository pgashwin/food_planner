import { useState } from 'react';
import { PANTRY_TEMPLATES, QUICK_STAPLES } from '../data/staples';
import { useApp } from '../context/AppContext';
import { createPantryItem } from '../lib/pantry';
import { parseBulkIngredients } from '../lib/ingredients';
import { createAIProvider, parsePantryWithAI } from '../lib/ai';
import type { PantryStatus } from '../types';

export function PantryPage() {
  const { pantry, addToPantry, removeFromPantry, updatePantry, aiSettings } = useApp();
  const [pasteText, setPasteText] = useState('');
  const [newItem, setNewItem] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
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
    const exists = pantry.some((p) => p.normalizedName === createPantryItem(name).normalizedName);
    if (exists) {
      const item = pantry.find((p) => p.normalizedName === createPantryItem(name).normalizedName);
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
    await updatePantry({ ...item, status: next });
  };

  return (
    <div className="page pantry">
      <h2>Your Pantry</h2>
      <p className="subtitle">{pantry.length} items tracked</p>

      {message && <p className="toast">{message}</p>}

      <div className="card">
        <h3>Quick add</h3>
        <div className="input-row">
          <input
            type="text"
            placeholder="Add ingredient…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <button type="button" className="btn btn-primary" onClick={handleAddItem}>
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Bulk paste</h3>
        <textarea
          placeholder="Paste grocery list, one item per line…"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={4}
        />
        <div className="action-row">
          <button type="button" className="btn btn-secondary" onClick={handlePaste}>
            Parse & add
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAIParse}
            disabled={aiLoading}
          >
            {aiLoading ? 'Parsing…' : 'AI parse'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Templates</h3>
        <div className="chip-row">
          {Object.entries(PANTRY_TEMPLATES).map(([name, items]) => (
            <button
              key={name}
              type="button"
              className="chip"
              onClick={() => addToPantry(items).then(() => showMessage(`Added ${name} template`))}
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Common staples</h3>
        <div className="chip-grid">
          {QUICK_STAPLES.map((staple) => {
            const norm = createPantryItem(staple).normalizedName;
            const active = pantry.some((p) => p.normalizedName === norm);
            return (
              <button
                key={staple}
                type="button"
                className={`chip ${active ? 'chip-active' : ''}`}
                onClick={() => toggleStaple(staple)}
              >
                {staple.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>
      </div>

      <h3 className="section-title">Inventory</h3>
      {pantry.length === 0 ? (
        <p className="empty-state">No items yet. Tap staples above to get started.</p>
      ) : (
        <ul className="pantry-list">
          {pantry.map((item) => (
            <li key={item.id} className={`pantry-item status-${item.status}`}>
              <span className="pantry-name">{item.name}</span>
              <button
                type="button"
                className={`status-btn status-${item.status}`}
                onClick={() => cycleStatus(item.id, item.status)}
                title="Tap to cycle: enough → low → out"
              >
                {item.status}
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => item.id && removeFromPantry(item.id)}
                aria-label="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
