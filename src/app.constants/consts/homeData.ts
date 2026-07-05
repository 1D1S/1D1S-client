export type HomeBannerKind = 'NEW' | 'HOT' | 'TIP';

export interface HomeMainBanner {
  id: string;
  kind: HomeBannerKind;
  title: string;
  subtitle: string;
  gradient: string;
  href: string;
}

export const HOME_MAIN_BANNERS: HomeMainBanner[] = [
  {
    id: 'popular-challenge',
    kind: 'HOT',
    title: '7월 챌린지 시즌\n오픈!',
    subtitle: '함께 도전할 챌린저를 찾아보세요',
    gradient: 'linear-gradient(135deg, #ff8a65 0%, #ff5722 100%)',
    href: '/challenge',
  },
  {
    id: 'community-diary',
    kind: 'TIP',
    title: '꾸준함이\n실력이 됩니다',
    subtitle: '매일 조금씩, 30일 후 달라진 나',
    gradient: 'linear-gradient(135deg, #7dd8b5 0%, #3eb489 100%)',
    href: '/diary',
  },
  {
    id: 'challenge-create',
    kind: 'NEW',
    title: '오늘의 일지\n인기글',
    subtitle: '챌린저들의 진솔한 하루를 만나보세요',
    gradient: 'linear-gradient(135deg, #7ab3ef 0%, #1666ba 100%)',
    href: '/diary',
  },
];
