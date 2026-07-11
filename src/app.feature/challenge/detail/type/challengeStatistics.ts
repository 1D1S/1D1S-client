// 서버 계약 (1D1S-server-v2 #322).
// GET /challenges/{challengeId}/statistics

export interface ChallengeDiaryTrendPoint {
  date: string; // yyyy-MM-dd
  count: number; // 해당 날짜(completedDate) 일지 수, 빈 날짜는 0
}

export interface ChallengeStatistics {
  // 참여율(%). 챌린지 시작 전이면 -1.
  participationRate: number;
  completedGoalCount: number;
  // 챌린지 기간(startDate~endDate, 무기한이면 ~오늘) 날짜별 일지 수.
  diaryTrend: ChallengeDiaryTrendPoint[];
}
