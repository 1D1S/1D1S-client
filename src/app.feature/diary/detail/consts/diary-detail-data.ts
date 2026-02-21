export interface ChecklistItem {
  id: string;
  label: string;
}

export interface DiaryDetailData {
  id: string;
  title: string;
  dateLabel: string;
  weekdayLabel: string;
  connectedChallengeTitle: string;
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
  contentParagraphs: string[];
  imageUrl: string;
  tags: string[];
}

export function createMockDiaryDetail(id: string): DiaryDetailData {
  return {
    id,
    title: '고라니 밥주기 3일차 성공!',
    dateLabel: '2023.10.24',
    weekdayLabel: 'Tuesday',
    connectedChallengeTitle: '고라니 밥주기 챌린지',
    checklistItems: [
      { id: 'feed', label: '밥 주기' },
      { id: 'approach', label: '조용히 다가가기' },
      { id: 'photo', label: '사진 찍기' },
      { id: 'trash', label: '주변 쓰레기 줍기' },
    ],
    checkedChecklistIds: ['feed', 'approach', 'photo'],
    contentParagraphs: [
      '오늘도 어김없이 고라니가 나타났다. 3일째 같은 시간에 나타나는 걸 보니 이제 이곳을 안전하다고 느끼는 것 같다.',
      '미리 준비해둔 신선한 풀들을 조심스럽게 내놓아 보았다.',
      '처음에는 경계하던 눈치더니, 금방 다가와서 천천히 먹기 시작했다. 가까이서 보니 눈이 정말 맑고 예뻤다.',
      '소리가 나지 않게 숨죽이며 관찰했다. 성공적인 하루!',
    ],
    imageUrl: '/images/default-card.png',
    tags: ['고라니', '사진챌린지', '관찰', '환경챙기기'],
  };
}
