import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

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
  const theme = useTheme();

  return (
    <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
      {label && (
        <FormLabel
          component="legend"
          sx={{
            mb: 1,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'text.secondary',
            letterSpacing: 0.2,
          }}
        >
          {label}
        </FormLabel>
      )}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => onChange(opt.value)}
              variant={selected ? 'filled' : 'outlined'}
              sx={{
                fontWeight: selected ? 600 : 500,
                ...(selected
                  ? {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }
                  : {
                      bgcolor: 'background.paper',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        borderColor: 'primary.light',
                      },
                    }),
              }}
            />
          );
        })}
      </Stack>
    </FormControl>
  );
}
