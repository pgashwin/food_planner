import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

type SymbolColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'disabled'
  | 'action';

export interface MaterialSymbolProps {
  /** Material Symbols icon name (snake_case), e.g. "home". */
  name: string;
  filled?: boolean;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large' | number;
  color?: SymbolColor;
  sx?: SxProps<Theme>;
  className?: string;
}

const FONT_SIZES = {
  inherit: 'inherit',
  small: 20,
  medium: 24,
  large: 40,
} as const;

function resolveColor(theme: Theme, color: SymbolColor): string {
  if (color === 'inherit') return 'inherit';
  if (color === 'disabled') return theme.palette.text.disabled;
  if (color === 'action') return theme.palette.action.active;
  return theme.palette[color].main;
}

export function MaterialSymbol({
  name,
  filled = false,
  fontSize = 'medium',
  color = 'inherit',
  sx,
  className,
}: MaterialSymbolProps) {
  const theme = useTheme();
  const size = typeof fontSize === 'number' ? fontSize : FONT_SIZES[fontSize];
  const opsz = typeof size === 'number' ? Math.min(48, Math.max(20, size)) : 24;

  return (
    <Box
      component="span"
      className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
      aria-hidden
      sx={{
        fontFamily: '"Material Symbols Outlined"',
        fontWeight: 'normal',
        fontStyle: 'normal',
        lineHeight: 1,
        letterSpacing: 'normal',
        textTransform: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size,
        width: size === 'inherit' ? '1em' : size,
        height: size === 'inherit' ? '1em' : size,
        color: resolveColor(theme, color),
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${opsz}`,
        userSelect: 'none',
        ...sx,
      }}
    >
      {name}
    </Box>
  );
}
