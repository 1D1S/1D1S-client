# Tailwind CSS 스타일링 가이드

---

## 핵심 원칙

1. **모바일 우선** — 기본 스타일은 모바일 기준, PC 확장은 `md:` 또는 커스텀 브레이크포인트
2. **`cn()` 분리 필수** — `className`이 포함된 줄이 **80자를 넘으면 반드시 `cn()`으로 분리** (인라인 문자열/템플릿 리터럴 금지)
3. **Tailwind 최우선** — CSS Modules는 예외 상황에만 허용
4. **컴포넌트 내부 margin 금지** — 간격은 부모에서 `className`으로 제어
5. **디자인 시스템 변수 활용** — `colors.css`, `typography.css` 정의된 변수 사용

---

## 반응형

### 컨테이너 쿼리 기반 그리드

```css
/* globals.css에 정의된 반응형 그리드 */
/* 일지 그리드: 2 -> 3 -> 4 -> 6 columns */
/* 챌린지 그리드: 1 -> 2 -> 3 -> 4 columns */
```

### 표시 / 숨김 패턴

```ts
// 모바일 표시, PC 숨김
className="flex md:hidden"

// 모바일 숨김, PC 표시
className="hidden md:block"
```

---

## 단위 변환 (PX -> Tailwind)

```ts
// 기본 공식: px / 4
// 24px -> 6,  1080px -> 270
className="mt-6 md:max-w-270"

// 소수점은 0.25 단위까지
// 불가피한 경우만 arbitrary value
<div className="w-[26.2px]">...</div>
```

---

## `cn()` 사용법

### 사용 기준

`cn()`은 **복수 인수** 또는 **조건부 클래스**가 있을 때만 사용한다.
한 줄이 80자를 넘지 않는 정적 문자열에는 `cn()`을 쓰지 않는다.

```ts
// 금지 — 80자 이하 정적 문자열에 cn() 불필요
<span className={cn('text-sm text-gray-500')} />

// 올바른 사용 — 문자열 그대로
<span className="text-sm text-gray-500" />

// 80자를 넘으면 cn()으로 분리 (불변량 #8)
<div
  className={cn(
    'flex w-full items-center justify-between',
    'border-b border-gray-200 px-4 py-2',
  )}
/>
```

`cn()`을 써야 하는 경우:

```ts
// 1. 복수 문자열 분리 (80자 초과 시)
<div
  className={cn(
    'flex w-full items-center justify-between',
    'border-b border-gray-200 bg-white shadow-sm',
    'px-4 py-2',
  )}
/>

// 2. 조건부 클래스 (템플릿 리터럴 대신)
<ChevronIcon
  className={cn(
    'h-5 w-5 transition duration-300',
    isCollapsed ? 'rotate-90' : '-rotate-90',
  )}
/>

// 3. 외부 className prop 병합
function MyComponent({ className, ...props }: Props) {
  return (
    <button
      className={cn(
        'flex bg-main-500 hover:bg-main-600',
        className,
      )}
      {...props}
    />
  );
}
```

---

## 색상 — CSS 변수 활용

### 색상 팔레트 (`src/app.styles/colors.css`)

| 계열  | 범위      | 용도                   |
| ----- | --------- | ---------------------- |
| Gray  | 50 - 900  | 중립 톤, 배경, 텍스트  |
| Main  | 100 - 900 | 브랜드 색상 (오렌지/피치) |
| Green | 다양      | 성공, 긍정적 상태      |
| Blue  | 다양      | 정보, 링크             |
| Red   | 다양      | 에러, 위험             |
| Mint  | 다양      | 보조 강조              |

```ts
// CSS 변수로 정의된 색상 사용
<div className="bg-main-500 text-gray-900">
<div className="border-gray-200">

// 하드코딩 지양 -> CSS 변수 활용
// 중복 선언 금지
className="border-t border-[#d9d9d9] border-b border-[#d9d9d9]"
// 축약
className="border-y border-[#d9d9d9]"
```

---

## 타이포그래피 (`src/app.styles/typography.css`)

| 클래스     | 크기    | 용도         |
| ---------- | ------- | ------------ |
| `text-xs`  | 12px    | 캡션         |
| `text-sm`  | 14px    | 보조 텍스트  |
| `text-base`| 16px    | 본문         |
| `text-lg`  | 18px    | 소제목       |
| `text-xl`  | 20px    | 제목         |
| `text-2xl` | 24px    | 큰 제목      |

폰트 패밀리: **Pretendard** (기본), **Suite** (보조)

---

## 상태 스타일링

```ts
// hover / focus
<button className="bg-main-500 hover:bg-main-600 focus:ring-2">

// 그룹 호버
<div className="group hover:bg-gray-100">
  <span className="text-gray-500 group-hover:text-main-500">
    텍스트
  </span>
</div>
```

---

## 다크 모드

```css
/* globals.css에서 :is(.dark *) 선택자 사용 */
/* 색상 변수가 light/dark 두 벌로 정의되어 있음 */
```

---

## CSS Modules 허용 예외

1. 외부 라이브러리 스타일 오버라이드
2. 20줄 이상 복잡한 keyframe 애니메이션
3. 레거시 호환성이 절대적인 경우

---

## 디자인 시스템 연동

```ts
// @1d1s/design-system 컴포넌트 사용
import { Button } from '@1d1s/design-system';

// Tailwind 테마 변수는 globals.css @theme에서 정의
// 디자인 시스템 소스도 Tailwind 스캔 대상:
// @source "../node_modules/@1d1s/design-system/**/*.{ts,tsx}"
```
