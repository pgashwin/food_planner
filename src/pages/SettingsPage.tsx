import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PROVIDER_MODELS } from '../lib/ai';
import type { AISettings, PortionMode } from '../types';

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

  const models = PROVIDER_MODELS[localAI.provider];

  return (
    <div className="page settings">
      <h2>Settings</h2>

      <div className="card">
        <h3>Household</h3>
        <label className="field-label">Family size</label>
        <div className="chip-row">
          {[1, 2, 3, 4, 5, 6, 8].map((n) => (
            <button
              key={n}
              type="button"
              className={`chip ${household.size === n ? 'chip-active' : ''}`}
              onClick={() => setHousehold({ ...household, size: n })}
            >
              {n}
            </button>
          ))}
        </div>

        <label className="field-label">Default portions</label>
        <div className="chip-row">
          {(['solo', 'family'] as PortionMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`chip ${household.defaultPortionMode === mode ? 'chip-active' : ''}`}
              onClick={() => setHousehold({ ...household, defaultPortionMode: mode })}
            >
              {mode === 'solo' ? 'Just me' : 'Family'}
            </button>
          ))}
        </div>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={household.dietaryTags.includes('vegetarian')}
            onChange={(e) => {
              const tags = e.target.checked
                ? [...household.dietaryTags.filter((t) => t !== 'vegetarian'), 'vegetarian']
                : household.dietaryTags.filter((t) => t !== 'vegetarian');
              setHousehold({ ...household, dietaryTags: tags });
            }}
          />
          Prefer vegetarian
        </label>
      </div>

      <div className="card">
        <h3>AI Assistant (BYOK)</h3>
        <p className="subtitle">Your API key stays in this browser only.</p>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={localAI.enabled}
            onChange={(e) => setLocalAI({ ...localAI, enabled: e.target.checked })}
          />
          Enable AI features
        </label>

        <label className="field-label">Provider</label>
        <select
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
          <option value="openai">OpenAI</option>
          <option value="gemini">Google Gemini</option>
          <option value="claude">Anthropic Claude</option>
          <option value="custom">Custom (OpenAI-compatible)</option>
        </select>

        <label className="field-label">API Key</label>
        <input
          type="password"
          placeholder="sk-… or your provider key"
          value={localAI.apiKey}
          onChange={(e) => setLocalAI({ ...localAI, apiKey: e.target.value })}
        />

        <label className="field-label">Model</label>
        <select
          value={localAI.model}
          onChange={(e) => setLocalAI({ ...localAI, model: e.target.value })}
        >
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {localAI.provider === 'custom' && (
          <>
            <label className="field-label">Base URL</label>
            <input
              type="url"
              placeholder="https://api.example.com/v1"
              value={localAI.customBaseUrl ?? ''}
              onChange={(e) => setLocalAI({ ...localAI, customBaseUrl: e.target.value })}
            />
          </>
        )}

        <label className="field-label">Custom system prompt (optional)</label>
        <textarea
          rows={3}
          placeholder="e.g. Focus on South Indian home cooking…"
          value={localAI.systemPrompt ?? ''}
          onChange={(e) => setLocalAI({ ...localAI, systemPrompt: e.target.value })}
        />

        <button type="button" className="btn btn-primary" onClick={saveAI}>
          Save AI settings
        </button>
        {saved && <span className="saved-badge">Saved!</span>}
      </div>

      <div className="card">
        <h3>Data</h3>
        <div className="action-row">
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            Export backup
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleImport}
          />
        </div>
        <button type="button" className="btn btn-danger" onClick={handleReset}>
          Clear all data
        </button>
      </div>
    </div>
  );
}
