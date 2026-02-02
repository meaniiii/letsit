# Backend Constitution

Next.js API Routes 기반 백엔드 개발 원칙.
DB 없이 외부 API를 프록시하고 데이터를 가공하는 구조.

### 핵심 원칙
- 모든 외부 API 호출은 `/api/*` 라우트를 경유
- 클라이언트에 API 키 노출 절대 금지
- **단일 책임 원칙:** 한 라우트는 한 가지 역할만

---

## 아키텍처 개요

```
┌─────────────────────────────────────────┐
│  클라이언트 (Frontend)                   │
└─────────────────┬───────────────────────┘
                  │ fetch
┌─────────────────▼───────────────────────┐
│  API Routes (app/api/)                   │
│  - 요청 파라미터 검증                      │
│  - 비즈니스 로직                          │
│  - 응답 구조화                            │
└─────────────────┬───────────────────────┘
                  │ proxy
┌─────────────────▼───────────────────────┐
│  External API (카카오 로컬 등)            │
│  - API 키 서버에서만 사용                  │
│  - Rate limiting 고려                    │
└─────────────────────────────────────────┘
```

---

## 폴더 구조

```
src/
├── app/
│   └── api/                    # API Routes
│       ├── restaurants/
│       │   ├── route.ts        # GET /api/restaurants
│       │   └── [id]/
│       │       └── route.ts    # GET /api/restaurants/:id
│       ├── categories/
│       │   └── route.ts        # GET /api/categories
│       ├── search/
│       │   └── route.ts        # GET /api/search
│       ├── location/
│       │   └── route.ts        # GET /api/location
│       └── health/
│           └── route.ts        # GET /api/health (서버 상태 체크)
├── lib/
│   ├── api/
│   │   └── kakao.ts            # 카카오 API 클라이언트
│   ├── validators/
│   │   └── index.ts            # 입력값 검증 (Zod)
│   └── utils/
│       └── index.ts            # 유틸리티 함수
└── types/
    ├── api.ts                  # API 요청/응답 타입
    └── external.ts             # 외부 API 타입 (카카오)
```

---

## API Route 작성 규칙

### 기본 구조

```typescript
// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateCoordinates } from '@/lib/validators';
import { searchRestaurants } from '@/lib/api/kakao';

export async function GET(request: NextRequest) {
  try {
    // 1. 파라미터 추출
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // 2. 검증
    const coords = validateCoordinates(lat, lng);
    if (!coords.success) {
      return NextResponse.json(
        { error: coords.error, code: 'INVALID_PARAMS' },
        { status: 400 }
      );
    }

    // 3. 비즈니스 로직
    const restaurants = await searchRestaurants(coords.data);

    // 4. 응답
    return NextResponse.json({
      data: restaurants,
      meta: { total: restaurants.length }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

### 필수 체크리스트

- [ ] 모든 입력값 검증 (lat/lng 범위, 타입 등)
- [ ] try-catch로 에러 핸들링
- [ ] 환경 변수로 API 키 관리
- [ ] 응답 타입 명시
- [ ] 적절한 HTTP 상태 코드 사용

### 금지 사항

- ❌ 클라이언트에 API 키 노출
- ❌ any 타입 사용
- ❌ 에러 무시 (빈 catch 블록)
- ❌ 하드코딩된 설정값
- ❌ console.log 프로덕션 코드에 남기기

---

## 응답 포맷

### 성공 응답

```typescript
// 목록 조회
{
  "data": [...],
  "meta": {
    "total": 15,
    "page": 1,
    "hasMore": true
  }
}

// 단일 조회
{
  "data": { ... }
}
```

### 에러 응답

```typescript
{
  "error": "위치 정보가 필요합니다",
  "code": "MISSING_LOCATION",
  "status": 400
}
```

### HTTP 상태 코드

| 코드 | 용도 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 (파라미터 오류) |
| 401 | 인증 필요 |
| 404 | 리소스 없음 |
| 429 | Rate limit 초과 |
| 500 | 서버 오류 |

---

## 입력값 검증 (Zod)

```typescript
// lib/validators/index.ts
import { z } from 'zod';

export const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const searchParamsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(2000).default(800),
  page: z.coerce.number().min(1).default(1),
});

export function validateCoordinates(lat: unknown, lng: unknown) {
  return coordinatesSchema.safeParse({ lat, lng });
}
```

---

## 외부 API 연동

### 카카오 로컬 API

| 기능 | 엔드포인트 | 용도 |
|------|-----------|------|
| 음식점 검색 | `/v2/local/search/category.json` | FD6 카테고리 |
| 키워드 검색 | `/v2/local/search/keyword.json` | 메뉴/가게명 |
| 좌표→주소 | `/v2/local/geo/coord2address.json` | 위치 표시 |

### API 클라이언트 패턴

```typescript
// lib/api/kakao.ts
const KAKAO_BASE_URL = 'https://dapi.kakao.com';

async function kakaoFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, KAKAO_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Kakao API Error: ${res.status}`);
  }

  return res.json();
}

export async function searchRestaurants(coords: Coords, radius = 800): Promise<Restaurant[]> {
  const data = await kakaoFetch<KakaoSearchResponse>(
    '/v2/local/search/category.json',
    {
      category_group_code: 'FD6',
      x: String(coords.lng),
      y: String(coords.lat),
      radius: String(radius),
      sort: 'distance',
    }
  );

  return data.documents.map(transformToRestaurant);
}
```

### 데이터 변환

```typescript
// 카카오 원본 타입
interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  distance: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  place_url: string;
  x: string;  // 경도
  y: string;  // 위도
}

// 프론트엔드 타입
interface Restaurant {
  id: string;
  name: string;
  category: string;
  distance: number;
  walkingTime: number;
  address: string;
  phone: string;
  url: string;
  position: { lat: number; lng: number };
}

// 변환 함수
function transformToRestaurant(place: KakaoPlace): Restaurant {
  const distance = parseInt(place.distance, 10);
  return {
    id: place.id,
    name: place.place_name,
    category: parseCategory(place.category_name),
    distance,
    walkingTime: calculateWalkingTime(distance),
    address: place.road_address_name || place.address_name,
    phone: place.phone,
    url: place.place_url,
    position: {
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
    },
  };
}
```

---

## 유틸리티 함수

```typescript
// lib/utils/index.ts

// 도보 시간 계산 (평균 80m/분)
export function calculateWalkingTime(distanceM: number): number {
  return Math.ceil(distanceM / 80);
}

// 반경 내 여부 확인
export function isWithinRadius(distanceM: number, maxRadius: number): boolean {
  return distanceM <= maxRadius;
}

// 카테고리 파싱 ("음식점 > 한식 > 백반" → "한식")
export function parseCategory(fullCategory: string): string {
  const parts = fullCategory.split(' > ');
  return parts[1] || parts[0];
}
```

---

## 환경 변수

```bash
# .env.local
KAKAO_REST_API_KEY=your_api_key_here
```

```typescript
// 사용 시 타입 체크
if (!process.env.KAKAO_REST_API_KEY) {
  throw new Error('KAKAO_REST_API_KEY is not defined');
}
```

---

## 테스트 가이드

### MSW로 외부 API 모킹

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://dapi.kakao.com/v2/local/search/category.json', () => {
    return HttpResponse.json({
      documents: [
        { id: '1', place_name: '테스트 식당', distance: '100', ... }
      ],
      meta: { total_count: 1 }
    });
  }),
];
```

### 테스트 케이스

- [ ] 정상 요청 → 200 + 데이터
- [ ] 잘못된 좌표 → 400 + 에러 메시지
- [ ] 빈 결과 → 200 + 빈 배열
- [ ] 외부 API 오류 → 500 + 에러 메시지
- [ ] Rate limit → 429 + 에러 메시지

---

*Last updated: 2026-01-30*
