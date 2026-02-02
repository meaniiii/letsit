# letsit Constitution

프로젝트의 핵심 원칙과 표준을 정의합니다.

---

## 문서 구조

| 문서 | 내용 |
|------|------|
| **CONSTITUTION.md** (현재) | 공통 원칙 |
| [CONSTITUTION.frontend.md](./CONSTITUTION.frontend.md) | 프론트엔드 원칙 |
| [CONSTITUTION.backend.md](./CONSTITUTION.backend.md) | 백엔드 원칙 |

---

## 1. Code Quality

### 1.1 TypeScript Strict Mode
- `strict: true` 설정 필수
- `any` 타입 사용 금지 → 불가피한 경우 `unknown` 사용
- 모든 함수에 명시적 반환 타입 선언

### 1.2 함수 작성 규칙
- 화살표 함수 선호
- 매개변수 3개 초과 시 객체로 전달

```typescript
// ✅ Good
const fetchData = async (params: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<Data[]> => { ... }

// ❌ Bad
function fetchData(lat, lng, radius, category, sort) { ... }
```

### 1.3 Naming Conventions

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `RestaurantCard.tsx` |
| 훅 파일 | camelCase + `use` 접두사 | `useLocation.ts` |
| 유틸 파일 | camelCase | `formatDistance.ts` |
| 타입 파일 | camelCase | `restaurant.ts` |
| 상수 | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 인터페이스 | PascalCase (I 접두사 없음) | `Restaurant`, `AuthState` |
| 폴더명 | kebab-case 또는 camelCase | `features/`, `ui/` |

### 1.4 Code Review Standards
- PR은 400줄 이하 유지
- 모든 PR은 최소 1명의 리뷰 필수
- 자동화된 린트/타입 체크 통과 필수

---

## 2. Testing Standards

### 2.1 Coverage Requirements
- **최소 커버리지:** 80%
- **Critical paths:** 100% (인증, 결제, 데이터 처리)

### 2.2 Test Types
```
Unit Tests        → 개별 함수/컴포넌트
Integration Tests → API/컴포넌트 통합
E2E Tests         → 핵심 사용자 플로우
```

### 2.3 Test Naming
```typescript
// Pattern: should [expected behavior] when [condition]
it('should display error message when login fails', () => {})
it('should redirect to dashboard when authenticated', () => {})
```

### 2.4 Test Principles
- 구현이 아닌 동작을 테스트
- 각 테스트는 독립적으로 실행 가능해야 함
- Mock은 최소화, 실제 구현 우선
- Flaky 테스트는 즉시 수정 또는 제거

### 2.5 Test Files
- 테스트 파일: `*.test.ts` 또는 `*.spec.ts`
- 테스트 도구: Vitest 또는 Jest

---

## 3. User Experience

### 3.1 Accessibility (a11y)
- WCAG 2.1 AA 준수 필수
- 키보드 네비게이션 지원
- 색상 대비 최소 4.5:1

### 3.2 Loading & Error States
- 모든 비동기 작업에 로딩 상태 표시
- 의미 있는 에러 메시지 제공
- 사용자가 복구할 수 있는 방법 안내

### 3.3 Feedback
- 모든 사용자 액션에 즉각적인 피드백
- 폼 유효성 검사는 실시간으로
- 성공/실패 상태 명확히 표시

---

## 4. Performance

### 4.1 General Principles
- 불필요한 연산 최소화
- 적절한 캐싱 전략 적용
- 성능 모니터링 및 알림 설정

### 4.2 API Response Time
| Type | Target | Maximum |
|------|--------|---------|
| Read (GET) | < 200ms | < 500ms |
| Write (POST/PUT) | < 500ms | < 1000ms |

---

## 5. Security

### 5.1 Input Validation
- 모든 사용자 입력 검증
- SQL Injection, XSS 방지
- 타입 검증 + 비즈니스 로직 검증

### 5.2 Authentication & Authorization
- 민감한 데이터 암호화
- 적절한 권한 검사
- 세션/토큰 관리

### 5.3 환경 변수
- API 키는 절대 클라이언트 코드에 노출 금지
- `.env.local`은 `.gitignore`에 포함
- `console.log`는 프로덕션 빌드 전 제거

```bash
# 클라이언트 노출 필요 시
NEXT_PUBLIC_APP_URL=...

# 서버 전용 (접두사 없음)
KAKAO_REST_API_KEY=...
```

---

## Enforcement

이 원칙들은 다음을 통해 강제됩니다:

- **ESLint/Prettier:** 코드 스타일 자동화
- **TypeScript:** 타입 안전성
- **Husky + lint-staged:** 커밋 전 검사
- **CI/CD Pipeline:** 테스트 및 빌드 검증
- **Code Review:** 원칙 준수 확인

---

*Last updated: 2026-01-30*
