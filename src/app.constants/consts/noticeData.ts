export type NoticeCategory = '공지' | '점검' | '업데이트' | '이벤트';

export interface NoticeItem {
  id: string;
  category: NoticeCategory;
  title: string;
  body: string;
  /** 표시용 ISO 날짜 문자열 (YYYY-MM-DD) */
  createdAt: string;
}

export const NOTICE_ITEMS: NoticeItem[] = [
  {
    id: 'notice-2026-07-11',
    category: '업데이트',
    title: '통계 기능이 추가됐어요! 나의 기록을 한눈에',
    body: '마이페이지에 통계 기능이 새로 추가됐습니다. 주·월·연 단위 활동 요약부터 감정 분포, 일지 작성 추이, 친구들과 나의 활동까지 한눈에 확인할 수 있어요. 마이페이지 > 활동 통계의 더보기에서 만나보세요. 꾸준히 쌓아온 기록이 얼마나 성장했는지 지금 확인해 보세요!',
    createdAt: '2026-07-11',
  },
  {
    id: 'notice-2026-05-23',
    category: '공지',
    title: '1D1S 정식 오픈! 오늘부터 함께 갓생 살아봐요',
    body: '드디어 1D1S가 정식 오픈했습니다. 매일 한 가지 챌린지, 매일 한 줄의 일지로 꾸준함을 쌓아가는 1Day 1Streak의 여정에 여러분을 초대합니다. 작은 습관 하나가 모여 인생을 바꿉니다. 오늘부터 1D1S와 함께 갓생 살아봐요!',
    createdAt: '2026-05-23',
  },
];
