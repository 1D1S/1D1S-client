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
    id: 'notice-2026-05-20',
    category: '업데이트',
    title: '홈 화면 개편 및 추천 챌린지 섹션이 추가되었어요',
    body: '홈 화면이 새롭게 단장되었습니다. 매일 변경되는 추천 챌린지와 인기 일지를 한눈에 확인해보세요. 더 가볍고 빠른 탐색 경험을 제공합니다.',
    createdAt: '2026-05-20',
  },
  {
    id: 'notice-2026-05-12',
    category: '이벤트',
    title: '5월 챌린지 시즌 오픈 — 함께 도전할 친구를 찾아보세요',
    body: '5월 한 달간 진행되는 시즌 챌린지가 오픈되었습니다. 친구를 초대하고 함께 스트릭을 쌓아보세요. 이벤트 기간 동안 다양한 혜택이 준비되어 있어요.',
    createdAt: '2026-05-12',
  },
  {
    id: 'notice-2026-04-30',
    category: '점검',
    title: '5월 1일 새벽 정기 서버 점검 안내 (00:00 ~ 02:00)',
    body: '안정적인 서비스 제공을 위해 5월 1일 새벽 0시부터 2시까지 약 2시간 동안 서버 점검이 진행됩니다. 점검 시간 동안에는 일부 기능 이용이 제한될 수 있습니다.',
    createdAt: '2026-04-30',
  },
  {
    id: 'notice-2026-04-15',
    category: '공지',
    title: '커뮤니티 가이드라인이 새롭게 업데이트되었습니다',
    body: '건강한 챌린지 문화를 위해 커뮤니티 가이드라인이 일부 개정되었습니다. 변경된 내용은 마이페이지 > 약관 메뉴에서 자세히 확인하실 수 있습니다.',
    createdAt: '2026-04-15',
  },
  {
    id: 'notice-2026-04-01',
    category: '업데이트',
    title: '일지 작성 에디터에 이미지 첨부 기능이 추가되었어요',
    body: '이제 일지를 작성할 때 이미지를 첨부할 수 있습니다. 하루의 기록을 더욱 풍성하게 남겨보세요. 자세한 사용 방법은 도움말 페이지를 참고해주세요.',
    createdAt: '2026-04-01',
  },
];
