import { NextRequest, NextResponse } from 'next/server';
import { getCoordsFromAddress } from '@/lib/api/kakao';
import { isServiceAvailable, incrementApiCount } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  // 서비스 사용 가능 여부 확인
  const available = await isServiceAvailable();
  if (!available) {
    return NextResponse.json(
      { error: '일일 사용량이 소진되었습니다', code: 'RATE_LIMIT_EXCEEDED' },
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

    // API 호출 횟수 기록
    await incrementApiCount(1);

    if (!result) {
      return NextResponse.json(
        { error: '주소를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: '주소 검색에 실패했습니다' },
      { status: 500 }
    );
  }
}
