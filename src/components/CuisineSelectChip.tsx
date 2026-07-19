import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import type { Recipe } from '../types';
import {
  getRecipeCuisineLabel,
  getRecipeCuisineValue,
  RECIPE_CUISINE_OPTIONS,
  type RecipeCuisineValue,
} from '../lib/cuisine';
import { MaterialSymbol } from './MaterialSymbol';

interface CuisineSelectChipProps {
  recipe: Recipe;
  onChange?: (value: RecipeCuisineValue) => void;
  size?: 'small' | 'medium';
}

export function CuisineSelectChip({ recipe, onChange, size = 'small' }: CuisineSelectChipProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const currentValue = getRecipeCuisineValue(recipe);
  const label = getRecipeCuisineLabel(recipe);

  if (!onChange) {
    return <Chip label={label} size={size} variant="outlined" color="primary" />;
  }

  return (
    <>
      <Chip
        label={label}
        size={size}
        variant="outlined"
        color="primary"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        onDelete={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        deleteIcon={<MaterialSymbol name="arrow_drop_down" fontSize="small" />}
        sx={{ cursor: 'pointer' }}
      />
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {RECIPE_CUISINE_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === currentValue}
            onClick={() => {
              onChange(opt.value);
              setAnchor(null);
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
