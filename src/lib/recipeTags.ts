/** Tags that map to home-page filters (cuisine sub-filters). */
export const FILTER_RECIPE_TAGS = ['south_indian', 'north_indian'] as const;
export type FilterRecipeTag = (typeof FILTER_RECIPE_TAGS)[number];

const FILTER_TAG_SET = new Set<string>(FILTER_RECIPE_TAGS);

const HIDDEN_TAGS = new Set(['ai_suggested', 'kid_friendly', 'vegetarian']);

export function recipeTagLabel(tag: string): string {
  return tag
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function sanitizeRecipeTags(tags: string[]): string[] {
  return tags.filter((t) => FILTER_TAG_SET.has(t));
}

export function visibleRecipeTags(tags: string[]): string[] {
  return tags.filter((t) => FILTER_TAG_SET.has(t) && !HIDDEN_TAGS.has(t));
}

export function toggleFilterTag(tags: string[], tag: FilterRecipeTag): string[] {
  const set = new Set(sanitizeRecipeTags(tags));
  if (set.has(tag)) set.delete(tag);
  else set.add(tag);
  return FILTER_RECIPE_TAGS.filter((t) => set.has(t));
}
