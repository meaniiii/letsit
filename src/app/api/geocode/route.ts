import { NextRequest, NextResponse } from 'next/server';
import { getCoordsFromAddress } from '@/lib/api/kakao';

export async function GET(request: NextRequest) {
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
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: '주소 검색에 실패했습니다' },
      { status: 500 }
    );
  }
}
