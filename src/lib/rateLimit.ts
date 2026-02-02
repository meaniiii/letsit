import { Redis } from '@upstash/redis';

const DAILY_LIMIT = 30000;

// Upstash Redis 클라이언트 (환경변수가 없으면 null)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * 오늘 날짜 키 생성 (KST 기준)
 */
const getTodayKey = (): string => {
  const now = new Date();
  // KST = UTC + 9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kst.toISOString().split('T')[0];
  return `kakao_api:${dateStr}`;
};

/**
 * API 호출 횟수 증가
 */
export const incrementApiCount = async (count: number = 1): Promise<number> => {
  if (!redis) {
    // Redis가 설정되지 않으면 제한 없음
    return 0;
  }

  const key = getTodayKey();
  const newCount = await redis.incrby(key, count);

  // 키가 처음 생성되면 24시간 후 만료 설정
  if (newCount === count) {
    await redis.expire(key, 60 * 60 * 24);
  }

  return newCount;
};

/**
 * 현재 API 호출 횟수 조회
 */
export const getApiCount = async (): Promise<number> => {
  if (!redis) {
    return 0;
  }

  const key = getTodayKey();
  const count = await redis.get<number>(key);
  return count || 0;
};

/**
 * 서비스 사용 가능 여부 확인
 */
export const isServiceAvailable = async (): Promise<boolean> => {
  // 환경변수로 수동 비활성화 가능
  if (process.env.SERVICE_DISABLED === 'true') {
    return false;
  }

  if (!redis) {
    // Redis가 설정되지 않으면 항상 사용 가능
    return true;
  }

  const count = await getApiCount();
  return count < DAILY_LIMIT;
};

/**
 * 남은 API 호출 횟수
 */
export const getRemainingCalls = async (): Promise<number> => {
  if (!redis) {
    return DAILY_LIMIT;
  }

  const count = await getApiCount();
  return Math.max(0, DAILY_LIMIT - count);
};
