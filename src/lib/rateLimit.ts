/**
 * 간단한 In-Memory Rate Limiter
 * Vercel Serverless 환경에서는 인스턴스별로 동작하므로 완벽하지 않지만,
 * 기본적인 남용 방지에는 효과적
 *
 * 프로덕션 환경에서는 Upstash Redis 등 외부 저장소 권장
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// IP별 요청 기록 (인스턴스별 메모리)
const requestCounts = new Map<string, RateLimitEntry>();

// 설정
const WINDOW_MS = 60 * 1000; // 1분
const MAX_REQUESTS = 30; // 분당 최대 30회

// 오래된 엔트리 정리 (메모리 누수 방지)
const cleanup = () => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
};

// 5분마다 정리
setInterval(cleanup, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate Limit 체크
 * @param identifier - IP 주소 또는 고유 식별자
 * @returns 허용 여부 및 남은 요청 수
 */
export const checkRateLimit = (identifier: string): RateLimitResult => {
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  // 새로운 윈도우 시작
  if (!entry || now > entry.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: now + WINDOW_MS,
    };
  }

  // 기존 윈도우 내 요청
  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
};

/**
 * 요청에서 클라이언트 IP 추출
 */
export const getClientIP = (request: Request): string => {
  // Vercel/Cloudflare 프록시 헤더
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // 기본값 (개발 환경)
  return 'unknown';
};
