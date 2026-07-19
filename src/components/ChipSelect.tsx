import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';

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
    <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
      {label && (
        <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
          {label}
        </FormLabel>
      )}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => onChange(opt.value)}
            color={value === opt.value ? 'primary' : 'default'}
            variant={value === opt.value ? 'filled' : 'outlined'}
            sx={{ fontWeight: value === opt.value ? 600 : 400 }}
          />
        ))}
      </Stack>
    </FormControl>
  );
}
