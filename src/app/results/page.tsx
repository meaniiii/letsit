'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  RestaurantList,
  CategoryFilter,
} from '@/components/features/restaurant';
import { useLocation, useRestaurants } from '@/hooks';
import { Restaurant, MoodType, MOOD_LABELS } from '@/types';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moodsParam = searchParams.get('moods');
  const moods = moodsParam ? (moodsParam.split(',') as MoodType[]) : [];

  const { coords } = useLocation();
  const {
    restaurants,
    category,
    isLoading,
    error,
    shownCount,
    poolSize,
    hasMore,
    loadPool,
    refreshRecommendations,
    resetAndRecommend,
    setCategory,
  } = useRestaurants();

  // 위치가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!coords) {
      router.replace('/');
      return;
    }
    loadPool(undefined, moods.length > 0 ? moods : undefined);
  }, [coords, router, loadPool, moods.join(',')]);

  const handleCardClick = (restaurant: Restaurant) => {
    // 상세 페이지로 이동 (restaurant ID를 쿼리 파라미터로)
    router.push(`/detail?id=${restaurant.id}`);
  };

  const handleRefresh = () => {
    if (hasMore) {
      refreshRecommendations();
    } else {
      resetAndRecommend();
    }
  };

  const getHeaderTitle = () => {
    if (moods.length > 0) {
      return `${moods.map((m) => MOOD_LABELS[m]).join(' + ')} 추천`;
    }
    return '오늘의 추천';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {getHeaderTitle()}
          </h1>
        </div>
      </header>

      {/* 카테고리 필터 */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {/* 맛집 리스트 */}
      <div className="flex-1 px-6 py-4">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => loadPool()}>
              다시 시도
            </Button>
          </div>
        ) : (
          <RestaurantList
            restaurants={restaurants}
            isLoading={isLoading}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      {/* 하단 버튼 */}
      {!isLoading && !error && restaurants.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <div className="text-center text-xs text-gray-400 mb-2">
            {shownCount} / {poolSize}개 확인
          </div>
          <Button onClick={handleRefresh} fullWidth variant="secondary">
            {hasMore ? '다시 추천' : '처음부터 다시 보기'}
          </Button>
        </div>
      )}

      {/* 풀 소진 안내 */}
      {!hasMore && !isLoading && restaurants.length > 0 && (
        <div className="px-6 pb-2 text-center">
          <p className="text-sm text-orange-500">
            모든 맛집을 다 봤어요! 🎉
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
