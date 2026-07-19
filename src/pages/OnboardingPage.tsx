import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PANTRY_TEMPLATES, QUICK_STAPLES } from '../data/staples';
import { useApp } from '../context/AppContext';

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

  if (step === 0) {
    return (
      <div className="page onboarding">
        <h2>Welcome!</h2>
        <p className="subtitle">Plan family meals in under a minute. No account needed.</p>
        <div className="card">
          <label className="field-label">How many people do you usually cook for?</label>
          <div className="chip-row">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                className={`chip ${size === n ? 'chip-active' : ''}`}
                onClick={() => setSize(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setStep(1)}>
          Next: Set up pantry
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => finish(true)}>
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="page onboarding">
      <h2>What&apos;s in your kitchen?</h2>
      <p className="subtitle">Tap staples you usually have. You can always add more later.</p>

      <div className="card">
        <p className="field-label">Quick templates</p>
        <div className="chip-row">
          {Object.entries(PANTRY_TEMPLATES).map(([name, items]) => (
            <button
              key={name}
              type="button"
              className="chip"
              onClick={() => applyTemplate(items)}
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      <div className="chip-grid">
        {QUICK_STAPLES.map((staple) => (
          <button
            key={staple}
            type="button"
            className={`chip ${selectedStaples.has(staple) ? 'chip-active' : ''}`}
            onClick={() => toggleStaple(staple)}
          >
            {staple.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <p className="selected-count">{selectedStaples.size} items selected</p>

      <button type="button" className="btn btn-primary" onClick={() => finish()}>
        Start planning ({selectedStaples.size || 'no'} items)
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => finish(true)}>
        Skip pantry setup
      </button>
    </div>
  );
}
