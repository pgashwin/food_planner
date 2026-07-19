import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MealFilter, MealSlot } from '../types';
import { useApp } from './AppContext';

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

function defaultMealSlot(): MealSlot {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export function HomeBrowseProvider({ children }: { children: ReactNode }) {
  const { household } = useApp();
  const initializedPeople = useRef(false);

  const [mealSlot, setMealSlot] = useState<MealFilter>(defaultMealSlot);
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [people, setPeople] = useState(household.size);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dishPrompt, setDishPrompt] = useState('');
  const [newAiIds, setNewAiIdsState] = useState<string[]>([]);

  useEffect(() => {
    if (!initializedPeople.current) {
      initializedPeople.current = true;
      setPeople(household.size);
    }
  }, [household.size]);

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
    [mealSlot, maxMinutes, people, favoritesOnly, dishPrompt, newAiIds],
  );

  return <HomeBrowseContext.Provider value={value}>{children}</HomeBrowseContext.Provider>;
}

export function useHomeBrowse() {
  const ctx = useContext(HomeBrowseContext);
  if (!ctx) throw new Error('useHomeBrowse must be used within HomeBrowseProvider');
  return ctx;
}
