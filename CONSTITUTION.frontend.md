# Frontend Constitution

Next.js + React 프론트엔드 개발 원칙.

---

## 아키텍처: 3-Layer 분리

코드 수정이 쉽도록 **UI / Logic / Data** 3개 레이어로 분리합니다.

```
┌─────────────────────────────────────────┐
│  컴포넌트 (UI Layer)                     │
│  - 화면에 보여주기만 담당                  │
│  - props로 데이터 받음                    │
│  - 비즈니스 로직 없음                     │
└─────────────────┬───────────────────────┘
                  │ props / 훅 호출
┌─────────────────▼───────────────────────┐
│  커스텀 훅 (Logic Layer)                 │
│  - 상태 관리 (로딩, 에러)                 │
│  - 데이터 가공 / 필터링                   │
│  - 이벤트 핸들러 로직                     │
└─────────────────┬───────────────────────┘
                  │ API 함수 호출
┌─────────────────▼───────────────────────┐
│  API 함수 (Data Layer)                   │
│  - 서버 요청만 담당                       │
│  - fetch / axios 호출                    │
│  - 응답 타입 변환                         │
└─────────────────────────────────────────┘
```

### 레이어별 역할과 규칙

| 레이어 | 위치 | 역할 | 금지 사항 |
|--------|------|------|----------|
| UI | `components/` | 렌더링만 | API 호출, 복잡한 로직 |
| Logic | `hooks/` | 상태/로직 처리 | 직접 렌더링, fetch 직접 호출 |
| Data | `lib/api/` | 서버 통신만 | 상태 관리, UI 관련 코드 |

### 레이어 분리 예시

```typescript
// ❌ Bad: 컴포넌트에 모든 게 섞여있음
const RestaurantList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants?lat=...&lng=...')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(r => r.distance < 800);
        setData(filtered);
        setLoading(false);
      });
  }, []);

  return <div>{...}</div>;
};

// ✅ Good: 레이어별로 분리

// 1) lib/api/restaurants.ts (Data Layer)
export const getRestaurants = async (lat: number, lng: number) => {
  const res = await fetch(`/api/restaurants?lat=${lat}&lng=${lng}`);
  return res.json();
};

// 2) hooks/useRestaurants.ts (Logic Layer)
export const useRestaurants = (lat: number, lng: number) => {
  const [data, setData] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRestaurants(lat, lng)
      .then(setData)
      .catch(() => setError('불러오기 실패'))
      .finally(() => setIsLoading(false));
  }, [lat, lng]);

  const nearbyOnly = data.filter(r => r.distance < 800);
  return { data: nearbyOnly, isLoading, error };
};

// 3) components/features/restaurant/RestaurantList.tsx (UI Layer)
const RestaurantList = () => {
  const { lat, lng } = useLocationStore();
  const { data, isLoading, error } = useRestaurants(lat, lng);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <ul>
      {data.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
    </ul>
  );
};
```

---

## 폴더 구조

```
src/
├── components/          # UI Layer
│   ├── ui/              # 범용 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   ├── features/        # 기능별 컴포넌트
│   │   ├── restaurant/
│   │   │   ├── RestaurantCard.tsx
│   │   │   └── RestaurantList.tsx
│   │   ├── search/
│   │   │   └── CategoryFilter.tsx
│   │   └── location/
│   │       └── LocationStatus.tsx
│   └── layouts/
│       ├── Header.tsx
│       └── PageLayout.tsx
├── hooks/               # Logic Layer
│   ├── useRestaurants.ts
│   ├── useLocation.ts
│   └── useCategories.ts
├── lib/                 # Data Layer + 유틸
│   ├── api/
│   │   ├── restaurants.ts
│   │   └── location.ts
│   └── utils/
│       ├── distance.ts
│       └── format.ts
├── stores/              # 전역 상태 (Zustand)
│   └── locationStore.ts
└── types/               # 타입 정의
    └── restaurant.ts
```

### 컴포넌트 분류 기준

| 폴더 | 역할 | 예시 |
|------|------|------|
| `components/ui/` | 범용 UI | Button, Card, Skeleton |
| `components/features/` | 기능별 UI | RestaurantCard, CategoryFilter |
| `components/layouts/` | 페이지 레이아웃 | Header, PageLayout |
| `hooks/` | 상태/로직 처리 | useRestaurants, useLocation |
| `lib/api/` | 서버 통신 | restaurants.ts, location.ts |
| `lib/utils/` | 순수 유틸 함수 | distance.ts, format.ts |

---

## 컴포넌트 작성 규칙

### 기본 원칙
- 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
- 한 파일에 하나의 export 컴포넌트
- 컴포넌트 파일명은 PascalCase: `RestaurantCard.tsx`

### 기본 구조

```typescript
// components/features/restaurant/RestaurantCard.tsx
import { Restaurant } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect?: (id: string) => void;
}

const RestaurantCard = ({ restaurant, onSelect }: RestaurantCardProps) => {
  const handleClick = () => {
    onSelect?.(restaurant.id);
  };

  return (
    <article
      className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* 컴포넌트 내용 */}
    </article>
  );
};

export default RestaurantCard;
```

### 필수 체크리스트

- [ ] Props 인터페이스 명시
- [ ] 기본값 필요한 props는 optional + 기본값 처리
- [ ] 이벤트 핸들러는 `on` 접두사 (onSelect, onClick)
- [ ] 시맨틱 HTML 태그 사용
- [ ] 접근성 속성 포함 (aria-*, role)

### 금지 사항

- ❌ 인라인 스타일 사용
- ❌ 컴포넌트 내부에서 API 직접 호출
- ❌ 하드코딩된 텍스트 (상수 또는 props로)
- ❌ any 타입
- ❌ 불필요한 div 중첩

---

## 상태 관리 패턴

### 상태 종류별 도구 선택

| 상태 종류 | 도구 | 예시 |
|----------|------|------|
| UI 상태 (로컬) | useState | 모달 열림, 입력값 |
| 공유 UI 상태 | useContext | 테마, 토스트 |
| 전역 앱 상태 | Zustand | 현재 위치, 필터 설정 |
| 서버 상태 | fetch + useState | 맛집 목록 |
| 서버 상태 (고급) | React Query / SWR | 캐싱, 자동 갱신 필요 시 |

### Zustand 스토어 예시

```typescript
// stores/locationStore.ts
import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (lat: number, lng: number) => void;
  setError: (error: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lng: null,
  isLoading: false,
  error: null,
  setLocation: (lat, lng) => set({ lat, lng, error: null }),
  setError: (error) => set({ error }),
}));
```

### 커스텀 훅 패턴

```typescript
// hooks/useRestaurants.ts
interface UseRestaurantsParams {
  lat: number;
  lng: number;
  radius?: number;
}

export const useRestaurants = ({ lat, lng, radius = 800 }: UseRestaurantsParams) => {
  const [data, setData] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/restaurants?lat=${lat}&lng=${lng}&radius=${radius}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        setError('맛집 정보를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [lat, lng, radius]);

  return { data, isLoading, error };
};
```

---

## Tailwind CSS 규칙

### 클래스 순서

```
레이아웃 → 크기 → 간격 → 타이포 → 색상 → 효과 → 상태
flex    → w-80 → p-4  → text-lg → bg-white → shadow → hover:
```

### 반응형 접근 (Mobile First)

```typescript
<div className="
  flex flex-col      // 모바일: 세로 정렬
  md:flex-row        // 태블릿+: 가로 정렬
  gap-4
  p-4 md:p-6         // 모바일: p-4, 태블릿+: p-6
">
```

### 자주 쓰는 패턴

```typescript
// 카드 컨테이너
"bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"

// 텍스트 계층
"text-lg font-semibold text-gray-900"  // 제목
"text-sm text-gray-500"                 // 보조 텍스트

// 버튼
"px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"

// 로딩 스켈레톤
"animate-pulse bg-gray-200 rounded"
```

---

## Figma Make 워크플로우

### Export 후 정제 과정

```
피그마 디자인 → Figma Make Export → 코드 정제 → 로직 추가
```

### 정제 체크리스트

- [ ] 불필요한 wrapper div 제거
- [ ] 클래스명 정리 (중복, 불필요한 것 제거)
- [ ] 하드코딩된 값 → props로 변환
- [ ] 정적 텍스트 → props 또는 상수로
- [ ] 이미지 → Next.js Image 컴포넌트로 교체
- [ ] 링크 → Next.js Link 컴포넌트로 교체

### 정제 전후 예시

```typescript
// ❌ Figma Make Export 원본
const Card = () => (
  <div className="flex flex-col w-[320px] h-[180px] bg-[#FFFFFF] rounded-[12px]">
    <div className="text-[18px] font-[600] text-[#1A1A1A]">맛집 이름</div>
    <div className="text-[14px] text-[#666666]">한식 > 백반</div>
  </div>
);

// ✅ 정제 후
interface RestaurantCardProps {
  name: string;
  category: string;
}

const RestaurantCard = ({ name, category }: RestaurantCardProps) => (
  <article className="flex flex-col w-80 h-44 bg-white rounded-xl p-4">
    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
    <p className="text-sm text-gray-500">{category}</p>
  </article>
);
```

---

## 성능 최적화

### 이미지
- Next.js `Image` 컴포넌트 사용 필수
- 적절한 `width`, `height` 지정
- lazy loading 기본 적용

```typescript
import Image from 'next/image';

<Image
  src="/restaurant.jpg"
  alt="식당 이미지"
  width={320}
  height={180}
/>
```

### 컴포넌트 최적화
- 불필요한 리렌더링 방지: `useMemo`, `useCallback` 적절히 사용
- 무거운 연산은 메모이제이션
- 리스트 렌더링 시 고유한 `key` 필수

```typescript
// 비용이 큰 계산
const filteredData = useMemo(() =>
  data.filter(item => item.distance < radius),
  [data, radius]
);

// 자식에게 전달하는 콜백
const handleSelect = useCallback((id: string) => {
  setSelected(id);
}, []);
```

### API 호출
- 중복 요청 방지
- 로딩/에러 상태 표시
- 적절한 캐싱 전략 (stale-while-revalidate)

---

## 접근성 (a11y) 체크리스트

- [ ] 이미지에 alt 속성
- [ ] 버튼에 명확한 레이블
- [ ] 폼 요소에 label 연결
- [ ] 충분한 색상 대비 (4.5:1 이상)
- [ ] 키보드 네비게이션 가능
- [ ] 포커스 스타일 visible

---

*Last updated: 2026-01-30*
