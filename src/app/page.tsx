'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useLocation } from '@/hooks';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { MoodType, MOOD_LABELS } from '@/types';

const MOODS: MoodType[] = ['hearty', 'light', 'simple', 'spicy', 'cool', 'warm', 'rich', 'protein'];

export default function HomePage() {
  const router = useRouter();
  const { coords, address, isLoading, error, requestLocation } = useLocation();
  const { setCoords, setAddress } = useRestaurantStore();

  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleClick = () => {
    if (coords) {
      const params = new URLSearchParams();
      if (selectedMoods.length > 0) {
        params.set('moods', selectedMoods.join(','));
      }
      const query = params.toString();
      router.push(query ? `/results?${query}` : '/results');
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

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const isReady = coords && !isLoading && !addressLoading;

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
              <div className="flex gap-4 mb-8">
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
          <div className="w-full max-w-sm mb-8">
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

        {/* 기분 선택 */}
        <div className="w-full max-w-sm mb-6">
          <p className="text-sm text-gray-500 text-center mb-3">
            오늘 기분이 어때? (선택)
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMoods.includes(mood)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {MOOD_LABELS[mood]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            복수 선택 가능
          </p>
        </div>

        {/* 메인 CTA */}
        <Button
          size="lg"
          onClick={handleClick}
          disabled={!isReady}
          fullWidth
        >
          {selectedMoods.length > 0
            ? `${selectedMoods.map((m) => MOOD_LABELS[m]).join(' + ')} 먹으러 가자!`
            : '오늘 뭐 먹지?'}
        </Button>

        <p className="text-sm text-gray-400 mt-4">
          20분 안에 갈 수 있는 맛집 추천
        </p>
      </div>
    </div>
  );
}
