export interface MyTodayChallengeGoal {
  challengeGoalId: number;
  content: string;
}

// GET /challenges/my/today 응답 원소. 진행 중 챌린지의 오늘(KST) 작성 여부와
// 목표 목록만 담는다(카테고리·기간 등은 사이드바에서 보완).
export interface MyTodayChallenge {
  challengeId: number;
  title: string;
  todayWritten: boolean;
  goals: MyTodayChallengeGoal[];
}
