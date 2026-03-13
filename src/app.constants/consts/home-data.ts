import { type BannerCarouselItem } from '@1d1s/design-system';

export interface MainBannerItem extends BannerCarouselItem {
  href: string;
}

export const HOME_MAIN_BANNERS: MainBannerItem[] = [
  {
    id: 'popular-challenge',
    type: '이번 주 추천',
    title: '지금 인기 챌린지 보러가기',
    subtitle: '가장 많이 참여 중인 챌린지를 확인해보세요.',
    href: '/challenge',
  },
  {
    id: 'community-diary',
    type: '커뮤니티 인기',
    title: '오늘의 커뮤니티 일지 보기',
    subtitle: '다른 챌린저들의 기록에서 동기를 받아보세요.',
    href: '/diary',
  },
  {
    id: 'challenge-create',
    type: '빠른 시작',
    title: '새 챌린지 만들기',
    subtitle: '지금 바로 목표를 정하고 챌린지를 시작해보세요.',
    href: '/challenge/create',
  },
];
