import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { paletteTokens } from '../theme/theme';

interface VegIndicatorProps {
  vegetarian: boolean;
  size?: number;
}

const VEG_COLOR = paletteTokens.green.primary;
const NON_VEG_COLOR = '#9B4D3A';

export function VegIndicator({ vegetarian, size = 14 }: VegIndicatorProps) {
  const label = vegetarian ? 'Vegetarian' : 'Non-vegetarian';
  const color = vegetarian ? VEG_COLOR : NON_VEG_COLOR;
  const borderWidth = Math.max(1.5, size * 0.14);
  const dotSize = size * 0.52;

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        role="img"
        aria-label={label}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          flexShrink: 0,
          border: `${borderWidth}px solid ${color}`,
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            bgcolor: color,
          }}
        />
      </Box>
    </Tooltip>
  );
}
