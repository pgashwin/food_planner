import type { Recipe } from '../types';

export function normalizeRecipeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSimilarRecipeName(a: string, b: string): boolean {
  const na = normalizeRecipeName(a);
  const nb = normalizeRecipeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  const wordsA = na.split(' ').filter((w) => w.length > 2);
  const wordsB = new Set(nb.split(' ').filter((w) => w.length > 2));
  if (wordsA.length === 0 || wordsB.size === 0) return false;

  const overlap = wordsA.filter((w) => wordsB.has(w)).length;
  const ratio = overlap / Math.min(wordsA.length, wordsB.size);
  return ratio >= 0.7;
}

export function filterUniqueRecipes(
  candidates: Recipe[],
  existing: Recipe[],
): Recipe[] {
  const taken = [...existing];
  const unique: Recipe[] = [];

  for (const candidate of candidates) {
    const duplicate = taken.some((r) => isSimilarRecipeName(r.name, candidate.name));
    if (!duplicate) {
      unique.push(candidate);
      taken.push(candidate);
    }
  }

  return unique;
}

export function slugifyId(name: string): string {
  return normalizeRecipeName(name).replace(/\s+/g, '-').slice(0, 48);
}
