import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

interface VegIndicatorProps {
  vegetarian: boolean;
  size?: number;
}

export function VegIndicator({ vegetarian, size = 10 }: VegIndicatorProps) {
  const label = vegetarian ? 'Vegetarian' : 'Non-vegetarian';

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        role="img"
        aria-label={label}
        sx={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: vegetarian ? 'success.main' : 'error.main',
          flexShrink: 0,
          border: '1px solid',
          borderColor: vegetarian ? 'success.dark' : 'error.dark',
        }}
      />
    </Tooltip>
  );
}
