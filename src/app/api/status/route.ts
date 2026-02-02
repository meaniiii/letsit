import { NextResponse } from 'next/server';
import { isServiceAvailable, getRemainingCalls } from '@/lib/rateLimit';

export async function GET() {
  try {
    const available = await isServiceAvailable();
    const remaining = await getRemainingCalls();

    return NextResponse.json({
      available,
      remaining,
    });
  } catch (error) {
    console.error('Status check error:', error);
    // 에러 시에도 서비스 사용 가능으로 처리
    return NextResponse.json({
      available: true,
      remaining: 30000,
    });
  }
}
