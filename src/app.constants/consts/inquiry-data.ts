export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const INQUIRY_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'item-1',
    question: '1D1S는 어떤 서비스인가요?',
    answer:
      '1D1S(One Day One Step)는 매일 하나의 챌린지에 도전하고 일지를 작성하며 성장하는 습관 형성 플랫폼입니다.',
  },
  {
    id: 'item-2',
    question: '챌린지는 어떻게 참여하나요?',
    answer:
      '챌린지 목록에서 원하는 챌린지를 선택한 후 상세 페이지 하단의 "챌린지 참여 신청" 버튼을 누르면 참여할 수 있습니다.',
  },
  {
    id: 'item-3',
    question: '일지는 언제 작성할 수 있나요?',
    answer:
      '참여 중인 챌린지가 있다면 언제든지 일지를 작성할 수 있습니다. 매일 기록하며 여러분의 성장을 확인해보세요!',
  },
];
