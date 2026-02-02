'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useLocation, useServiceStatus } from '@/hooks';
import { useRestaurantStore } from '@/stores/restaurantStore';

export default function HomePage() {
  const router = useRouter();
  const { coords, address, isLoading, error, requestLocation } = useLocation();
  const { setCoords, setAddress } = useRestaurantStore();
  const { isChecking } = useServiceStatus();

  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleClick = () => {
    if (coords) {
      router.push('/results');
    }
  };

  const handleAddressSearch = async () => {
    if (!addressInput.trim()) {
      setAddressError('주소를 입력해주세요');
      return;
    }

    setAddressLoading(true);
    setAddressError(null);

    try {
      const res = await fetch(
        `/api/geocode?address=${encodeURIComponent(addressInput)}`
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          router.replace('/unavailable');
          return;
        }
        setAddressError(data.error || '주소 검색에 실패했습니다');
        return;
      }

      // 스토어에 좌표와 주소 저장
      setCoords(data.coords);
      setAddress(data.address);
      setShowAddressInput(false);
    } catch {
      setAddressError('주소 검색에 실패했습니다');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };

  const isReady = coords && !isLoading && !addressLoading && !isChecking;

  // 서비스 상태 확인 중
  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Letsit</h1>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      {/* 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Letsit</h1>
        <p className="text-gray-500 mb-8">Let&apos;s Eat!</p>

        {/* 위치 표시 */}
        {!showAddressInput ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📍</span>
              {isLoading ? (
                <span className="text-gray-400">위치 확인 중...</span>
              ) : error ? (
                <span className="text-red-500 text-sm">{error}</span>
              ) : address ? (
                <span className="text-gray-700">{address}</span>
              ) : (
                <span className="text-gray-400">위치 정보 없음</span>
              )}
            </div>

            {/* 위치 옵션 버튼들 */}
            {!isLoading && (
              <div className="flex gap-4 mb-12">
                <button
                  onClick={requestLocation}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  위치 다시 불러오기
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setShowAddressInput(true)}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  주소 직접 입력
                </button>
              </div>
            )}
          </>
        ) : (
          /* 주소 입력 모드 */
          <div className="w-full max-w-sm mb-12">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="주소 또는 장소명 입력"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                autoFocus
              />
              <button
                onClick={handleAddressSearch}
                disabled={addressLoading}
                className="px-4 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:bg-gray-300"
              >
                {addressLoading ? '...' : '검색'}
              </button>
            </div>
            {addressError && (
              <p className="text-red-500 text-sm mb-2">{addressError}</p>
            )}
            <button
              onClick={() => {
                setShowAddressInput(false);
                setAddressError(null);
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← 현재 위치 사용하기
            </button>
          </div>
        )}

        {/* 메인 CTA */}
        <Button
          size="lg"
          onClick={handleClick}
          disabled={!isReady}
          fullWidth
        >
          오늘 뭐 먹지?
        </Button>

        <p className="text-sm text-gray-400 mt-4">
          20분 안에 갈 수 있는 맛집 추천
        </p>
      </div>
    </div>
  );
}
