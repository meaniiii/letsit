# QA Agent (품질 보증 에이전트)
# AI 기반 테스트 자동화 및 품질 검증 가이드

---

## 1. QA Agent 역할 정의

### 1.1 페르소나 정의

본 프로젝트에는 가상의 **'QA Agent(품질 보증 에이전트)'**가 존재한다.

- QA Agent는 AI가 수행하는 별도의 페르소나이다
- 새로운 기능 구현 완료 후, QA Agent 역할로 전환하여 품질 검증을 수행한다
- 개발자(AI)와 독립적인 관점에서 기능 동작, 엣지 케이스, 사용자 경험을 검증한다

### 1.2 QA Agent의 권한

- 구현된 기능에 대한 테스트 시나리오 작성
- 자동화 테스트 코드 생성 및 실행
- 버그 및 개선사항 리포트 작성
- 배포 전 품질 승인/반려 판정

---

## 2. QA 워크플로우 (5단계)

```
[기능 구현 완료]
       ↓
[1단계] 정보 수집
       ↓
[2단계] 테스트 시나리오 생성
       ↓
[3단계] 테스트 실행
       ↓
[4단계] 결과 분석 및 리포트
       ↓
[5단계] 품질 판정 (승인/반려)
```

---

## 3. 단계별 상세

### 3.1 [1단계] 정보 수집

QA 요청 시 다음 정보를 수집한다:

```
필수 정보:
- 테스트 대상 기능 설명
- 관련 파일 경로
- 예상 동작 (Happy Path)

선택 정보:
- 관련 API 엔드포인트
- 참조 문서 (PRD, 디자인 등)
- 알려진 제약사항
```

**Letsit 프로젝트 컨텍스트:**
| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 외부 API | Kakao Local API |
| 호스팅 | Vercel |
| 테스트 URL | https://letsit.vercel.app |

### 3.2 [2단계] 테스트 시나리오 생성

#### A. 시나리오 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| Happy Path | 정상 흐름 | 위치 허용 → 기분 선택 → 맛집 추천 |
| Edge Case | 경계값/예외 | 위치 거부, 빈 결과, 네트워크 오류 |
| Negative | 잘못된 입력 | 유효하지 않은 좌표, 잘못된 mood 값 |
| Performance | 성능 검증 | API 응답 시간, 렌더링 속도 |
| Security | 보안 검증 | Rate Limit, 입력 검증 |

#### B. 시나리오 템플릿

```markdown
## TC-[번호]: [테스트 케이스명]

### 사전 조건
- [필요한 상태/데이터]

### 테스트 단계
1. [액션 1]
2. [액션 2]
3. ...

### 예상 결과
- [기대하는 동작/출력]

### 실제 결과
- [ ] Pass
- [ ] Fail: [실패 내용]

### 우선순위
- [ ] Critical (서비스 불가)
- [ ] High (주요 기능 오류)
- [ ] Medium (부분 오류)
- [ ] Low (개선 권장)
```

### 3.3 [3단계] 테스트 실행

#### A. 수동 테스트 (UI/UX)

```bash
# 프로덕션 URL 테스트
https://letsit.vercel.app

# 로컬 테스트
npm run dev
# → http://localhost:3000
```

#### B. API 테스트

```bash
# 맛집 검색 API
curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&category=all"

# 기분 기반 검색
curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&moods=hearty,spicy"

# 주소 → 좌표 변환
curl "https://letsit.vercel.app/api/geocode?address=강남역"

# 좌표 → 주소 변환
curl "https://letsit.vercel.app/api/location?lat=37.5665&lng=126.9780"
```

#### C. 보안 테스트

```bash
# Rate Limit 테스트 (31회 이상 요청 시 429 응답 확인)
for i in {1..35}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780"
done

# 잘못된 mood 값 테스트 (필터링 확인)
curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&moods=invalid,<script>,hearty"
```

### 3.4 [4단계] 결과 분석 및 리포트

#### 리포트 템플릿

```markdown
## 🧪 QA Agent 테스트 리포트

### 테스트 요약
| 항목 | 결과 |
|------|------|
| 테스트 일시 | YYYY-MM-DD HH:MM |
| 테스트 대상 | [기능명] |
| 총 테스트 케이스 | N개 |
| 성공 | N개 (N%) |
| 실패 | N개 (N%) |
| 스킵 | N개 |

### 테스트 결과 상세

#### ✅ 성공 케이스
- TC-001: [케이스명]
- TC-002: [케이스명]

#### ❌ 실패 케이스
| TC | 내용 | 우선순위 | 재현 스텝 |
|----|------|----------|----------|
| TC-003 | [실패 내용] | Critical | [스텝] |

### 스크린샷/로그
[첨부]

### 개선 권장사항
1. [권장 1]
2. [권장 2]
```

### 3.5 [5단계] 품질 판정

#### 판정 기준

| 등급 | 조건 | 조치 |
|------|------|------|
| ✅ **승인** | Critical 0개, 성공률 90% 이상 | 배포 가능 |
| ⚠️ **조건부 승인** | Critical 0개, High 2개 이하 | 알려진 이슈와 함께 배포 |
| ❌ **반려** | Critical 1개 이상 또는 성공률 70% 미만 | 수정 후 재테스트 |

---

## 4. Letsit 필수 테스트 체크리스트

### 4.1 핵심 기능

```
[ ] 위치 권한 요청 및 처리
[ ] 주소 직접 입력 기능
[ ] 기분 단일/다중 선택
[ ] 맛집 추천 결과 표시
[ ] 추천 메뉴 표시 (기분 선택 시)
[ ] 카테고리 필터링
[ ] "다시 추천" 기능
[ ] "처음부터 다시 보기" 기능
[ ] 카카오맵 링크 동작
```

### 4.2 예외 처리

```
[ ] 위치 권한 거부 시 안내
[ ] 검색 결과 없음 처리
[ ] API 오류 시 에러 메시지
[ ] Rate Limit 초과 시 안내
[ ] Kakao API 한도 초과 시 /unavailable 리다이렉트
```

### 4.3 반응형/크로스 브라우저

```
[ ] 모바일 (iOS Safari)
[ ] 모바일 (Android Chrome)
[ ] 데스크톱 (Chrome)
[ ] 데스크톱 (Safari)
```

---

## 5. QA 요청 방법

### 5.1 전체 QA 요청

```
"QA Agent로서 현재 배포된 버전 전체 테스트 진행해줘"
```

### 5.2 특정 기능 QA 요청

```
"QA Agent로서 기분 다중 선택 기능 테스트해줘"
```

### 5.3 회귀 테스트 요청

```
"QA Agent로서 [수정 내용] 변경 후 회귀 테스트 진행해줘"
```

---

## 6. 자동화 테스트 (향후 확장)

### 6.1 E2E 테스트 (Playwright)

```typescript
// 예시: tests/e2e/recommendation.spec.ts
import { test, expect } from '@playwright/test';

test('기분 선택 후 맛집 추천', async ({ page }) => {
  await page.goto('/');

  // 위치 권한 모킹
  await page.context().setGeolocation({ latitude: 37.5665, longitude: 126.9780 });

  // 기분 선택
  await page.click('text=든든하게');
  await page.click('text=먹으러 가자');

  // 결과 확인
  await expect(page).toHaveURL(/\/results/);
  await expect(page.locator('[data-testid="restaurant-card"]')).toBeVisible();
});
```

### 6.2 API 테스트 (Jest)

```typescript
// 예시: tests/api/restaurants.test.ts
describe('GET /api/restaurants', () => {
  it('유효한 좌표로 맛집 반환', async () => {
    const res = await fetch('/api/restaurants?lat=37.5665&lng=126.9780');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toBeInstanceOf(Array);
  });

  it('잘못된 moods는 필터링됨', async () => {
    const res = await fetch('/api/restaurants?lat=37.5665&lng=126.9780&moods=invalid,hearty');
    const data = await res.json();
    // invalid는 무시되고 hearty만 적용됨
    expect(res.status).toBe(200);
  });
});
```

---

## 7. 테스트 케이스 목록 (TC Registry)

### 7.1 API 테스트

| TC | 테스트명 | 유형 | 명령어 |
|----|----------|------|--------|
| TC-001 | 맛집 검색 API (정상) | Happy Path | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&category=all"` |
| TC-002 | 기분 기반 검색 (단일) | Happy Path | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&moods=hearty"` |
| TC-003 | 기분 기반 검색 (다중) | Happy Path | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&moods=hearty,spicy"` |
| TC-004 | 잘못된 mood 필터링 | Security | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&moods=invalid,<script>,hearty"` |
| TC-005 | 주소 → 좌표 변환 | Happy Path | `curl "https://letsit.vercel.app/api/geocode?address=강남역"` |
| TC-006 | 좌표 → 주소 변환 | Happy Path | `curl "https://letsit.vercel.app/api/location?lat=37.5665&lng=126.9780"` |
| TC-007 | 잘못된 좌표 검증 | Negative | `curl "https://letsit.vercel.app/api/restaurants?lat=999&lng=999"` |
| TC-008 | 필수 파라미터 누락 | Negative | `curl "https://letsit.vercel.app/api/restaurants"` |
| TC-009 | 거리순 정렬 확인 | Happy Path | 응답 데이터의 distance 필드 오름차순 정렬 확인 |
| TC-010 | matchedKeyword 포함 | Happy Path | 기분 선택 시 추천 메뉴(matchedKeyword) 필드 존재 확인 |
| TC-011 | API 응답 시간 | Performance | 응답 시간 5초 이내 확인 |
| TC-012 | 존재하지 않는 주소 | Edge Case | `curl "https://letsit.vercel.app/api/geocode?address=존재하지않는주소12345"` |
| TC-013 | 카테고리 필터링 (한식) | Happy Path | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&category=korean"` |
| TC-014 | 카테고리 필터링 (일식) | Happy Path | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&category=japanese"` |
| TC-015 | radius 파라미터 테스트 | Happy Path | `curl "https://letsit.vercel.app/api/restaurants?lat=37.5665&lng=126.9780&radius=1000"` |
| TC-016 | 풀 사이즈 30개 제한 | Happy Path | 응답 데이터의 meta.poolSize ≤ 30 확인 |
| TC-017 | Rate Limit 동작 | Security | 31회 연속 요청 시 429 응답 확인 |

### 7.2 예상 결과

| TC | 예상 결과 |
|----|----------|
| TC-001 | 200 OK + `data` 배열에 맛집 목록 반환 |
| TC-002 | 200 OK + 각 항목에 `matchedKeyword` 포함 (예: "보쌈") |
| TC-003 | 200 OK + hearty와 spicy 키워드 합집합 결과 |
| TC-004 | 200 OK + invalid 값 무시, hearty만 적용 |
| TC-005 | 200 OK + `coords`와 `address` 반환 |
| TC-006 | 200 OK + `address` 반환 (예: "서울 중구 태평로1가") |
| TC-007 | 400 Bad Request + `INVALID_PARAMS` 에러 |
| TC-008 | 200 OK + 빈 배열 `{"data":[]}` |
| TC-009 | distance 값이 오름차순 정렬 |
| TC-010 | `matchedKeyword` 필드 존재 및 값 확인 |
| TC-011 | 응답 시간 < 5초 |
| TC-012 | 404 + "주소를 찾을 수 없습니다" 메시지 |
| TC-013 | 200 OK + 한식 카테고리 맛집 반환 |
| TC-014 | 200 OK + 일식 카테고리 맛집 반환 |
| TC-015 | 200 OK + radius 1000m 이내 결과만 반환 |
| TC-016 | meta.poolSize ≤ 30 |
| TC-017 | 31번째 요청부터 429 Too Many Requests |

---

## 8. 테스트 실행 이력

### 2026-02-02 전체 QA

| TC | 결과 | 비고 |
|----|------|------|
| TC-001 | ✅ Pass | 데이터 정상 반환 |
| TC-002 | ✅ Pass | matchedKeyword: "보쌈" |
| TC-003 | ✅ Pass | hearty+spicy 합집합 동작 |
| TC-004 | ✅ Pass | invalid 값 필터링 정상 |
| TC-005 | ✅ Pass | 강남역 좌표 반환 |
| TC-006 | ✅ Pass | "서울 중구 태평로1가" |
| TC-007 | ✅ Pass | 400 에러 정상 반환 |
| TC-008 | ✅ Pass | 빈 배열 반환 (graceful) |
| TC-009 | ✅ Pass | [96, 154, 174, 213, 214] 오름차순 |
| TC-010 | ✅ Pass | 김밥, 국수 등 키워드 포함 |
| TC-011 | ✅ Pass | 1.86초 (5초 이내) |
| TC-012 | ✅ Pass | 404 + 에러 메시지 |

**결과: ✅ 승인 (12/12 Pass, 100%)**

### 2026-02-02 추가 TC (SPEC.md 기반)

| TC | 결과 | 비고 |
|----|------|------|
| TC-013 | ✅ Pass | 한식 카테고리 필터 정상 동작 |
| TC-014 | ✅ Pass | 일식 카테고리 필터 정상 동작 |
| TC-015 | ✅ Pass | radius=1000 파라미터 적용 확인 |
| TC-016 | ✅ Pass | poolSize = 30 |
| TC-017 | ✅ Pass | 429 응답 정상 (rate limit 동작) |

**결과: ✅ 승인 (17/17 Pass, 100%)**

---

*본 가이드는 AI와의 모든 QA 협업에 적용된다.*
*수정 시 QA Agent의 검토가 필요하다.*

최종 수정일: 2026-02-02 (TC-013~TC-017 추가)
