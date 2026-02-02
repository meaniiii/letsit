# Letsit 디자인 가이드

---

## 컬러 시스템

| 용도 | 컬러 | Tailwind |
|------|------|----------|
| Primary | #FF5C00 | `orange-500` |
| Primary Hover | - | `orange-600` |
| Primary Active | - | `orange-700` |
| Primary Disabled | - | `orange-300` |
| Background | #FFFFFF | `white` |
| Background Alt | #F9FAFB | `gray-50` |
| Text Primary | #111827 | `gray-900` |
| Text Secondary | #6B7280 | `gray-500` |
| Text Muted | #9CA3AF | `gray-400` |
| Border | #F3F4F6 | `gray-100` |

---

## 타이포그래피

| 요소 | 스타일 | Tailwind |
|------|--------|----------|
| 제목 (h1) | 36px Bold | `text-4xl font-bold` |
| 제목 (h2) | 20px Bold | `text-xl font-bold` |
| 카드 제목 | 14px Bold | `text-sm font-bold` |
| 본문 | 16px Medium | `text-base font-medium` |
| 보조 텍스트 | 14px Regular | `text-sm text-gray-500` |
| 캡션 | 12px Medium | `text-xs font-medium` |

---

## 컴포넌트 스타일

### 버튼 (Primary)

```tsx
<button className="
  px-8 py-5
  bg-orange-500 text-white
  font-semibold text-lg
  rounded-2xl shadow-lg
  hover:bg-orange-600
  active:bg-orange-700
  disabled:bg-orange-300
">
  오늘 뭐 먹지?
</button>
```

### 카드

```tsx
<div className="
  bg-white
  rounded-2xl shadow-md
  border border-gray-100
  hover:shadow-lg
  transition-shadow
">
  {/* 카드 내용 */}
</div>
```

### 배지 (도보 시간)

```tsx
<span className="
  bg-orange-500 text-white
  px-2.5 py-1
  rounded-full
  text-xs font-semibold
">
  도보 5분
</span>
```

### 카테고리 필터 버튼

```tsx
// 선택됨
<button className="
  bg-orange-500 text-white
  shadow-md rounded-full
  px-6 py-2.5 font-semibold
">
  한식
</button>

// 미선택
<button className="
  bg-white text-gray-700
  border border-gray-200
  rounded-full
  px-6 py-2.5
">
  중식
</button>
```

---

## 레이아웃

| 요소 | 값 | Tailwind |
|------|-----|----------|
| 최대 너비 | 448px | `max-w-md` |
| 기본 패딩 | 24px | `px-6` |
| 카드 간격 | 12px | `gap-3` |
| 섹션 간격 | 32px | `space-y-8` |

---

## 둥근 모서리

| 용도 | 값 | Tailwind |
|------|-----|----------|
| 버튼/카드 | 16px | `rounded-2xl` |
| 배지 | pill | `rounded-full` |
| 슬롯머신 컨테이너 | 24px | `rounded-3xl` |

---

## 그림자

| 용도 | Tailwind |
|------|----------|
| 카드 기본 | `shadow-md` |
| 카드 호버 | `shadow-lg` |
| 버튼 | `shadow-lg` |
| 플로팅 버튼 | `shadow-xl` |

---

## 반응형 (Mobile First)

```tsx
// 기본: 모바일
<div className="flex flex-col gap-4 p-4">

// 태블릿 이상
<div className="flex flex-col gap-4 p-4 md:flex-row md:p-6">
```

### Breakpoints

| 이름 | 너비 | 용도 |
|------|------|------|
| 기본 | - | 모바일 (< 768px) |
| `md:` | 768px | 태블릿 이상 |
| `lg:` | 1024px | 데스크톱 |

---

## Tailwind Config (참고)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5C00',
          hover: '#EA5500',  // orange-600 근사값
          active: '#C2410C', // orange-700
          disabled: '#FDBA74', // orange-300
        },
      },
    },
  },
}
```

---

*Last updated: 2026-01-30*
