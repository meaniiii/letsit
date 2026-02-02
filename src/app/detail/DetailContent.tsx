'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Badge, Card } from '@/components/ui';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { formatDistance } from '@/lib/utils';

export default function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { pool, currentList } = useRestaurantStore();

  // pool 또는 currentList에서 맛집 찾기
  const restaurant =
    currentList.find((r) => r.id === id) || pool.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
              aria-label="뒤로가기"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900">상세 정보</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">맛집 정보를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  const handleOpenMap = () => {
    window.open(restaurant.url, '_blank');
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
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {restaurant.name}
          </h1>
        </div>
      </header>

      {/* 내용 */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {/* 기본 정보 카드 */}
        <Card className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {restaurant.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {restaurant.category}
                {restaurant.categoryDetail !== restaurant.category &&
                  ` · ${restaurant.categoryDetail}`}
              </p>
            </div>
            <Badge>도보 {restaurant.walkingTime}분</Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-gray-400 w-16 flex-shrink-0">주소</span>
              <span className="text-gray-700">{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 w-16 flex-shrink-0">거리</span>
              <span className="text-gray-700">
                {formatDistance(restaurant.distance)} · 도보{' '}
                {restaurant.walkingTime}분
              </span>
            </div>
            {restaurant.phone && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-16 flex-shrink-0">전화</span>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-orange-500 hover:underline"
                >
                  {restaurant.phone}
                </a>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-3">
        <Button onClick={handleOpenMap} fullWidth>
          카카오맵에서 보기
        </Button>
        {restaurant.phone && (
          <Button onClick={handleCall} fullWidth variant="outline">
            전화하기
          </Button>
        )}
      </div>
    </div>
  );
}
