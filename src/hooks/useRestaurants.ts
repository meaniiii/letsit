'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CategoryFilter, MoodType } from '@/types';

export const useRestaurants = () => {
  const router = useRouter();
  const {
    coords,
    pool,
    currentList,
    category,
    poolLoading,
    poolError,
    shownIds,
    setPool,
    setCategory,
    setPoolLoading,
    setPoolError,
    getNextRecommendations,
    resetShownIds,
    hasMoreRecommendations,
  } = useRestaurantStore();

  // 맛집 풀 로드
  const loadPool = useCallback(
    async (newCategory?: CategoryFilter, mood?: MoodType) => {
      if (!coords) {
        setPoolError('위치 정보가 필요합니다');
        return;
      }

      setPoolLoading(true);
      setPoolError(null);

      const categoryToUse = newCategory || category;
      if (newCategory) {
        setCategory(newCategory);
      }

      try {
        let url = `/api/restaurants?lat=${coords.lat}&lng=${coords.lng}&category=${categoryToUse}`;
        if (mood) {
          url += `&mood=${mood}`;
        }
        const res = await fetch(url);

        // Kakao API 한도 초과
        if (res.status === 429) {
          router.replace('/unavailable');
          return;
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setPool(data.data);

        // 첫 5개 추천
        getNextRecommendations();
      } catch (error) {
        setPoolError(
          error instanceof Error
            ? error.message
            : '맛집을 불러오는 중 오류가 발생했습니다'
        );
      } finally {
        setPoolLoading(false);
      }
    },
    [
      coords,
      category,
      setPool,
      setCategory,
      setPoolLoading,
      setPoolError,
      getNextRecommendations,
    ]
  );

  // 다시 추천
  const refreshRecommendations = useCallback(() => {
    if (hasMoreRecommendations()) {
      getNextRecommendations();
      return true;
    }
    return false;
  }, [getNextRecommendations, hasMoreRecommendations]);

  // 처음부터 다시
  const resetAndRecommend = useCallback(() => {
    resetShownIds();
    getNextRecommendations();
  }, [resetShownIds, getNextRecommendations]);

  return {
    restaurants: currentList,
    pool,
    category,
    isLoading: poolLoading,
    error: poolError,
    shownCount: shownIds.length,
    poolSize: pool.length,
    hasMore: hasMoreRecommendations(),
    loadPool,
    refreshRecommendations,
    resetAndRecommend,
    setCategory: (cat: CategoryFilter) => {
      setCategory(cat);
      loadPool(cat);
    },
  };
};
