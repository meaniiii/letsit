# Letsit (Let's Eat)

현재 위치 기반으로 도보 10분 내 맛집을 추천하는 서비스.
1인 사이드 프로젝트 (기획/디자인/개발 전담).

## Tech Stack

### Core
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand / React Hooks

### APIs
- **맛집 데이터:** 카카오 로컬 API (일 30,000회 무료)
- **위치 정보:** 브라우저 Geolocation API

### Infrastructure
- **배포:** Vercel
- **버전 관리:** GitHub
- **디자인:** Figma + Figma Make

## Core Features

1. **랜덤 맛집 추천** - "오늘 뭐 먹지?" 버튼으로 5개 랜덤 추천
2. **위치 기반 검색** - 현재 위치에서 도보 10분(800m) 내 음식점
3. **카테고리 필터** - 한식, 중식, 일식, 양식, 분식 등
4. **상세 정보** - 가게 정보, 전화, 카카오맵 링크

자세한 기획은 [SPEC.md](./SPEC.md) 참조.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/                # API Routes (카카오 프록시)
│       └── restaurants/
├── components/
│   ├── ui/                 # 공통 UI (Button, Card)
│   ├── features/           # 기능별 (RestaurantCard)
│   └── layouts/            # 레이아웃 (Header)
├── hooks/                  # 커스텀 훅 (useRestaurants)
├── lib/
│   ├── api/                # API 클라이언트 (kakao.ts)
│   └── utils/              # 유틸리티 함수
├── stores/                 # Zustand 스토어
└── types/                  # TypeScript 타입
```

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 실행
```

## Development Workflow

### Figma Make → Claude Code
1. Figma에서 디자인 완성
2. Figma Make로 React 컴포넌트 export
3. Claude Code로 로직 추가 및 리팩토링
4. Vercel로 배포

### Git Branch
- `main` - 프로덕션 배포
- `develop` - 개발 통합
- `feature/*` - 기능 개발

### Commit Convention
```
feat: 새로운 기능 추가
fix: 버그 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
docs: 문서 수정
chore: 빌드, 설정 파일 수정
```

## Environment Variables

```bash
# .env.local
KAKAO_REST_API_KEY=your_kakao_rest_api_key    # 서버 전용
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_js_key    # 클라이언트 (지도 SDK용)
```

## Code Conventions

- 모든 새 파일은 TypeScript 사용
- 스타일링은 Tailwind CSS 사용
- Next.js App Router 패턴 준수
- `@/*` import alias 사용 (src 디렉토리)

## Documentation

| 문서 | 내용 |
|------|------|
| [SPEC.md](./SPEC.md) | 서비스 기획서 (화면별 상세, MVP 범위) |
| [DESIGN.md](./DESIGN.md) | 디자인 가이드 (컬러, 타이포, 컴포넌트) |
| [CONSTITUTION.md](./CONSTITUTION.md) | 공통 원칙 (Code Quality, Testing, Security) |
| [CONSTITUTION.frontend.md](./CONSTITUTION.frontend.md) | 3-Layer 아키텍처, 컴포넌트 규칙, Tailwind |
| [CONSTITUTION.backend.md](./CONSTITUTION.backend.md) | API Routes, 외부 API 연동, 에러 핸들링 |

## References

- [카카오 로컬 API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
