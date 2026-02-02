import { create } from 'zustand';
import { Restaurant, CategoryFilter, Coordinates } from '@/types';
import { getRandomItems, excludeItems } from '@/lib/utils';

interface RestaurantState {
  // 위치 상태
  coords: Coordinates | null;
  address: string | null;
  locationLoading: boolean;
  locationError: string | null;

  // 맛집 풀 상태
  pool: Restaurant[];
  currentList: Restaurant[];
  shownIds: string[];
  category: CategoryFilter;
  poolLoading: boolean;
  poolError: string | null;

  // 위치 액션
  setCoords: (coords: Coordinates) => void;
  setAddress: (address: string) => void;
  setLocationLoading: (loading: boolean) => void;
  setLocationError: (error: string | null) => void;

  // 맛집 액션
  setPool: (restaurants: Restaurant[]) => void;
  setCategory: (category: CategoryFilter) => void;
  setPoolLoading: (loading: boolean) => void;
  setPoolError: (error: string | null) => void;

  // 추천 액션
  getNextRecommendations: () => Restaurant[];
  resetShownIds: () => void;
  hasMoreRecommendations: () => boolean;
}

const RECOMMENDATIONS_COUNT = 5;

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  // 초기 상태
  coords: null,
  address: null,
  locationLoading: false,
  locationError: null,

  pool: [],
  currentList: [],
  shownIds: [],
  category: 'all',
  poolLoading: false,
  poolError: null,

  // 위치 액션
  setCoords: (coords) => set({ coords, locationError: null }),
  setAddress: (address) => set({ address }),
  setLocationLoading: (loading) => set({ locationLoading: loading }),
  setLocationError: (error) => set({ locationError: error }),

  // 맛집 액션
  setPool: (restaurants) =>
    set({
      pool: restaurants,
      shownIds: [],
      poolError: null,
    }),
  setCategory: (category) => set({ category, shownIds: [] }),
  setPoolLoading: (loading) => set({ poolLoading: loading }),
  setPoolError: (error) => set({ poolError: error }),

  // 추천 액션
  getNextRecommendations: () => {
    const { pool, shownIds } = get();

    // 이미 노출된 맛집 제외
    const available = excludeItems(pool, shownIds);

    // 랜덤으로 5개 선택
    const selected = getRandomItems(available, RECOMMENDATIONS_COUNT);

    // 노출된 ID 기록
    const newShownIds = [...shownIds, ...selected.map((r) => r.id)];

    set({
      currentList: selected,
      shownIds: newShownIds,
    });

    return selected;
  },

  resetShownIds: () => set({ shownIds: [], currentList: [] }),

  hasMoreRecommendations: () => {
    const { pool, shownIds } = get();
    return pool.length > shownIds.length;
  },
}));
