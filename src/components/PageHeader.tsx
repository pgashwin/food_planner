import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1">{subtitle}</Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
