import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { VegIndicator } from './VegIndicator';

interface DishTitleRowProps {
  name: string;
  vegetarian: boolean;
  variant?: 'h6' | 'h4';
}

export function DishTitleRow({ name, vegetarian, variant = 'h6' }: DishTitleRowProps) {
  const indicatorSize = variant === 'h4' ? 16 : 14;

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        gap: 1,
        mb: variant === 'h4' ? 0 : 1,
        fontSize: theme.typography[variant].fontSize,
        lineHeight: theme.typography[variant].lineHeight,
        fontWeight: theme.typography[variant].fontWeight,
        letterSpacing: theme.typography[variant].letterSpacing,
      })}
    >
      <Box
        sx={{
          height: '1lh',
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <VegIndicator vegetarian={vegetarian} size={indicatorSize} />
      </Box>
      <Typography
        component={variant === 'h4' ? 'h1' : 'h3'}
        variant={variant}
        sx={{
          lineHeight: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          letterSpacing: 'inherit',
          flex: 1,
          m: 0,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}
