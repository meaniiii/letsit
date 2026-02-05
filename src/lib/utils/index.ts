/**
 * 거리(m)를 도보 시간(분)으로 변환
 * - 보정 계수 1.4 적용 (도시 환경에서 실제 도보 거리 ≈ 직선거리 × 1.4)
 * - 평균 도보 속도: 80m/분
 */
export const calculateWalkingTime = (distanceM: number): number => {
  const DETOUR_FACTOR = 1.4; // 우회 보정 계수
  const WALKING_SPEED = 80; // m/분
  return Math.ceil((distanceM * DETOUR_FACTOR) / WALKING_SPEED);
};

/**
 * 도보 시간이 제한 시간 이내인지 확인
 */
export const isWithinWalkingTime = (
  walkingTimeMin: number,
  maxMinutes: number = 10
): boolean => {
  return walkingTimeMin <= maxMinutes;
};

/**
 * 카테고리 문자열 파싱
 * "음식점 > 한식 > 백반" → "한식"
 */
export const parseCategory = (fullCategory: string): string => {
  const parts = fullCategory.split(' > ');
  return parts[1] || parts[0];
};

/**
 * 카테고리 상세 파싱
 * "음식점 > 한식 > 백반" → "백반"
 */
export const parseCategoryDetail = (fullCategory: string): string => {
  const parts = fullCategory.split(' > ');
  return parts[2] || parts[1] || parts[0];
};

/**
 * 거리 포맷팅
 * 350 → "350m"
 * 1200 → "1.2km"
 */
export const formatDistance = (distanceM: number): string => {
  if (distanceM < 1000) {
    return `${distanceM}m`;
  }
  return `${(distanceM / 1000).toFixed(1)}km`;
};

/**
 * 배열에서 랜덤으로 n개 추출 (Fisher-Yates 셔플)
 */
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array];

  // Fisher-Yates 셔플
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

/**
 * 배열에서 특정 항목들을 제외
 */
export const excludeItems = <T extends { id: string }>(
  array: T[],
  excludeIds: string[]
): T[] => {
  const excludeSet = new Set(excludeIds);
  return array.filter((item) => !excludeSet.has(item.id));
};
