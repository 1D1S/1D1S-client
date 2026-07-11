// 참여자 수가 많은 챌린지는 하루 count 가 커서 raw count 를 그대로 level 에
// 매핑하면 대부분 4로 포화된다. 기간 내 최댓값 대비 비율로 0~4 를 매긴다.
export function toHeatmapLevel(count: number, max: number): number {
  if (count <= 0 || max <= 0) {
    return 0;
  }
  return Math.max(1, Math.min(4, Math.ceil((count / max) * 4)));
}
