interface ChipSelectProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  label,
}: ChipSelectProps<T>) {
  return (
    <div className="chip-select">
      {label && <span className="chip-label">{label}</span>}
      <div className="chip-row">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`chip ${value === opt.value ? 'chip-active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
