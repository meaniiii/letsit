import { NextRequest, NextResponse } from 'next/server';
import { validateCoordinates } from '@/lib/validators';
import { getAddressFromCoords } from '@/lib/api/kakao';
import { ErrorResponse } from '@/types';

interface LocationResponse {
  address: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<LocationResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // 검증
    const validation = validateCoordinates(lat, lng);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, code: 'INVALID_PARAMS', status: 400 },
        { status: 400 }
      );
    }

    // 주소 변환
    const address = await getAddressFromCoords(validation.data);

    return NextResponse.json({ address });
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
        error: '위치 정보를 불러올 수 없습니다',
        code: 'INTERNAL_ERROR',
        status: 500,
      },
      { status: 500 }
    );
  }
}
