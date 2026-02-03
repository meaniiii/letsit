import { NextRequest, NextResponse } from 'next/server';
import { getCoordsFromAddress } from '@/lib/api/kakao';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  // Rate Limit 체크
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: '주소를 입력해주세요' },
      { status: 400 }
    );
  }

  try {
    const result = await getCoordsFromAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    // Kakao API 일일 한도 초과
    if (error instanceof Error && error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: '일일 사용량이 소진되었습니다', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: '주소 검색에 실패했습니다' },
      { status: 500 }
    );
  }
}
