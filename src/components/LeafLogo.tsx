import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { paletteTokens } from '../theme/theme';

interface LeafLogoProps {
  size?: number;
  sx?: SxProps<Theme>;
  /** Show soft beige tile behind the leaf (nav / header). */
  withTile?: boolean;
}

function TwinLeaves() {
  const leafFill = paletteTokens.green.primary;
  const stemStroke = paletteTokens.green.dark;
  const veinStroke = paletteTokens.green.light;

  const leaf = (
    <>
      <path
        d="M50 16 C36 30 30 48 34 64 C38 74 44 80 50 82 C56 80 62 74 66 64 C70 48 64 30 50 16Z"
        fill={leafFill}
      />
      <path
        d="M50 26 C47 40 45 54 50 72"
        fill="none"
        stroke={stemStroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M50 34 C43 44 41 52 45 60"
        fill="none"
        stroke={veinStroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </>
  );

  return (
    <>
      <g transform="rotate(-26 50 52)">{leaf}</g>
      <g transform="rotate(26 50 52)">{leaf}</g>
      <path
        d="M50 72 C50 78 50 84 50 88"
        fill="none"
        stroke={stemStroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </>
  );
}

export function LeafLogo({ size = 40, sx, withTile = false }: LeafLogoProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      aria-hidden
      sx={{ width: size, height: size, display: 'block', ...sx }}
    >
      {withTile && (
        <rect width="100" height="100" rx="22" fill={paletteTokens.beige.surfaceBright} />
      )}
      <TwinLeaves />
    </Box>
  );
}
