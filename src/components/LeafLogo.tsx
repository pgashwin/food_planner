import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { paletteTokens } from '../theme/theme';

interface LeafLogoProps {
  size?: number;
  sx?: SxProps<Theme>;
  /** Show soft beige tile behind the leaf (nav / header). */
  withTile?: boolean;
}

export function LeafLogo({ size = 40, sx, withTile = false }: LeafLogoProps) {
  const leaf = (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      aria-hidden
      sx={{ width: size, height: size, display: 'block', ...sx }}
    >
      {withTile && (
        <rect width="100" height="100" rx="22" fill={paletteTokens.beige.surfaceBright} />
      )}
      <path
        d="M50 18 C34 34 28 52 32 68 C36 78 44 84 50 86 C56 84 64 78 68 68 C72 52 66 34 50 18Z"
        fill={paletteTokens.green.primary}
      />
      <path
        d="M50 28 C46 44 44 58 50 78"
        fill="none"
        stroke={paletteTokens.green.dark}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M50 36 C42 46 40 54 44 62"
        fill="none"
        stroke={paletteTokens.green.light}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </Box>
  );

  return leaf;
}
