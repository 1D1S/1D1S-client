// 챌린지 배너(상세 히어로)·썸네일이 공유하는 종횡비 — **모바일 히어로 3:2 가
// 기준**이다. 크롭 출력/카드 썸네일/스켈레톤이 전부 이 비율을 따라야 배너와
// 썸네일이 같은 그림으로 보인다(비율이 갈리면 object-cover 가 서로 다르게
// 잘라낸다). 데스크톱은 와이드 배너로 상한(360px)만 두어 가로로 넓게 쓴다.
export const CHALLENGE_HERO_ASPECT =
  'aspect-[3/2] lg:aspect-[21/9] lg:max-h-[360px]';

// 썸네일 크롭 출력 픽셀. 3:2 — 위 기준과 같은 비율.
//
// 2100 은 어느 화면에서도 그만큼 쓰이지 않는다(데스크톱 히어로 상한이
// 1200px 폭). CDN 리사이즈가 없어 올린 픽셀이 그대로 내려가므로 표시
// 크기에 맞춘다. 2x DPR 을 감안해도 1200 이면 충분하다.
export const CHALLENGE_THUMBNAIL_SIZE = { width: 1200, height: 800 } as const;

// 업로더 드롭존·카드 썸네일 등 "썸네일이 그대로 보이는 곳" 의 비율.
export const CHALLENGE_THUMBNAIL_ASPECT = 'aspect-[3/2]';
