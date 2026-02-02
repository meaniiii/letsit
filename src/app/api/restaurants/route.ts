import { NextRequest, NextResponse } from 'next/server';
import { validateSearchParams } from '@/lib/validators';
import { searchRestaurants } from '@/lib/api/kakao';
import { CategoryFilter, RestaurantsResponse, ErrorResponse } from '@/types';
import { isServiceAvailable, incrementApiCount } from '@/lib/rateLimit';

export async function GET(
  request: NextRequest
): Promise<NextResponse<RestaurantsResponse | ErrorResponse>> {
  try {
    // 서비스 사용 가능 여부 확인
    const available = await isServiceAvailable();
    if (!available) {
      return NextResponse.json(
        {
          error: '일일 사용량이 소진되었습니다',
          code: 'RATE_LIMIT_EXCEEDED',
          status: 429,
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 파라미터 추출
    const params = {
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius') || '2000',
      category: searchParams.get('category') || 'all',
    };

    // 검증
    const validation = validateSearchParams(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, code: 'INVALID_PARAMS', status: 400 },
        { status: 400 }
      );
    }

    // 맛집 검색 (2페이지 요청 = 2건 카운트)
    const restaurants = await searchRestaurants({
      coords: { lat: validation.data.lat, lng: validation.data.lng },
      radius: validation.data.radius,
      category: (params.category as CategoryFilter) || 'all',
    });

    // API 호출 횟수 기록 (페이지 2개 요청)
    await incrementApiCount(2);

    // 응답
    return NextResponse.json({
      data: restaurants,
      meta: {
        total: restaurants.length,
        poolSize: restaurants.length,
      },
    });
  } catch (error) {
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
