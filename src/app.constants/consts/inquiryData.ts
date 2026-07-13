export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const DISCORD_INVITE_URL = 'https://discord.gg/JaHRYHtrE7';

export const INQUIRY_ABOUT_ITEMS: FaqItem[] = [
  {
    id: 'about-1',
    question: '1D1S는 왜 시즌 4부터 시작하나요?',
    answer:
      '기존에는 노션과 디스코드로 시즌 3까지 운영되었습니다. 1D1S 주인장의 개인적인 사정으로 인해 잠시 중단되었다가 웹 서비스와 함께 시즌 4로 찾아오게 되었습니다.',
  },
  {
    id: 'about-2',
    question: '1D1S는 어쩌다가 만들어진 서비스인가요?',
    answer:
      '사실 서비스라고 하기엔 뭐하고 동아리에 조금 더 가깝고, 제 개인적인 동기로 만들어진 동아리입니다. 매일 무언가를 한다는 것은 힘들지만, 다 같이 함께 한다면 그걸 조금 더 쉽게 할 수 있음을 느껴 이를 동기로 만들게 되었습니다.',
  },
  {
    id: 'about-3',
    question: '1D1S 동아리?',
    answer: `동아리이고 디스코드 채널도 있습니다. 시즌3을 마무리하면서 개인적인 사정으로 인해 관리가 잘 안되어 있긴 하지만... 이제 다시 활발해지리라 믿습니다...!\n디스코드 참여하실 분은 ${DISCORD_INVITE_URL} 여기로 와주세요!`,
  },
];

export const INQUIRY_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'item-1',
    question: '1D1S는 어떤 서비스인가요?',
    answer:
      '1D1S(1Day 1Streak)는 매일 하나의 챌린지에 도전하고 일지를 작성하며 성장하는 습관 형성 플랫폼입니다.',
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
