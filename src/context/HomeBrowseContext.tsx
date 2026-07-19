import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MealFilter, MealSlot } from '../types';

const PEOPLE_STORAGE_KEY = 'food-planner-people';
const DEFAULT_PEOPLE = 4;
const MIN_PEOPLE = 1;
const MAX_PEOPLE = 12;

export interface HomeBrowseState {
  mealSlot: MealFilter;
  maxMinutes: number;
  people: number;
  favoritesOnly: boolean;
  dishPrompt: string;
  newAiIds: string[];
}

interface HomeBrowseContextValue extends HomeBrowseState {
  setMealSlot: (v: MealFilter) => void;
  setMaxMinutes: (v: number) => void;
  setPeople: (v: number) => void;
  setFavoritesOnly: (v: boolean) => void;
  setDishPrompt: (v: string) => void;
  setNewAiIds: (ids: Set<string>) => void;
}

const HomeBrowseContext = createContext<HomeBrowseContextValue | null>(null);

function clampPeople(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PEOPLE;
  return Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, Math.round(value)));
}

function readStoredPeople(): number {
  try {
    const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (raw != null) return clampPeople(Number(raw));
  } catch {
    /* ignore storage errors */
  }
  return DEFAULT_PEOPLE;
}

function persistPeople(value: number): void {
  try {
    localStorage.setItem(PEOPLE_STORAGE_KEY, String(value));
  } catch {
    /* ignore storage errors */
  }
}

function defaultMealSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export function HomeBrowseProvider({ children }: { children: ReactNode }) {
  const [mealSlot, setMealSlot] = useState<MealFilter>(defaultMealSlot);
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [people, setPeopleState] = useState(readStoredPeople);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dishPrompt, setDishPrompt] = useState('');
  const [newAiIds, setNewAiIdsState] = useState<string[]>([]);

  const setPeople = useCallback((value: number) => {
    const next = clampPeople(value);
    setPeopleState(next);
    persistPeople(next);
  }, []);

  const setNewAiIds = (ids: Set<string>) => {
    setNewAiIdsState([...ids]);
  };

  const value = useMemo<HomeBrowseContextValue>(
    () => ({
      mealSlot,
      maxMinutes,
      people,
      favoritesOnly,
      dishPrompt,
      newAiIds,
      setMealSlot,
      setMaxMinutes,
      setPeople,
      setFavoritesOnly,
      setDishPrompt,
      setNewAiIds,
    }),
    [mealSlot, maxMinutes, people, favoritesOnly, dishPrompt, newAiIds, setPeople],
  );

  return <HomeBrowseContext.Provider value={value}>{children}</HomeBrowseContext.Provider>;
}

export function useHomeBrowse() {
  const ctx = useContext(HomeBrowseContext);
  if (!ctx) throw new Error('useHomeBrowse must be used within HomeBrowseProvider');
  return ctx;
}
