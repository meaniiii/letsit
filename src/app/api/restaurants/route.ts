import { NextRequest, NextResponse } from 'next/server';
import { validateSearchParams, validateMoods } from '@/lib/validators';
import { searchRestaurants } from '@/lib/api/kakao';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { CategoryFilter, RestaurantsResponse, ErrorResponse } from '@/types';

export async function GET(
  request: NextRequest
): Promise<NextResponse<RestaurantsResponse | ErrorResponse>> {
  try {
    // Rate Limit 체크
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          code: 'RATE_LIMIT_EXCEEDED',
          status: 429,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTime),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);

    // 파라미터 추출
    const params = {
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius') || '2000',
      category: searchParams.get('category') || 'all',
      moods: searchParams.get('moods') || '',
    };

    // 검증
    const validation = validateSearchParams(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, code: 'INVALID_PARAMS', status: 400 },
        { status: 400 }
      );
    }

    // moods 파라미터 검증 (화이트리스트 기반)
    const moods = validateMoods(searchParams.get('moods'));

    // 맛집 검색
    const restaurants = await searchRestaurants({
      coords: { lat: validation.data.lat, lng: validation.data.lng },
      radius: validation.data.radius,
      category: (params.category as CategoryFilter) || 'all',
      moods: moods.length > 0 ? moods : undefined,
    });

    // 응답
    return NextResponse.json({
      data: restaurants,
      meta: {
        total: restaurants.length,
        poolSize: restaurants.length,
      },
    });
  } catch (error) {
    // Kakao API 일일 한도 초과
    if (error instanceof Error && error.name === 'RateLimitError') {
      return NextResponse.json(
        {
          error: '일일 사용량이 소진되었습니다',
          code: 'RATE_LIMIT_EXCEEDED',
          status: 429,
        },
        { status: 429 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: '맛집 정보를 불러올 수 없습니다',
        code: 'INTERNAL_ERROR',
        status: 500,
      },
      { status: 500 }
    );
  }
}
