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
    id: 'usage-guide',
    kind: 'TIP',
    title: '1D1S가\n처음이라면',
    subtitle: '5단계로 시작하는 사용 가이드 보기',
    gradient: 'linear-gradient(135deg, #ff8a65 0%, #ff5722 100%)',
    href: '/guide',
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
  {
    id: 'my-statistics',
    kind: 'TIP',
    title: '내 기록을\n통계로 보기',
    subtitle: '참여율·작성 추이를 한눈에',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    href: '/mypage/statistics',
  },
];
