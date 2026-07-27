export type HomeBannerKind = 'NEW' | 'HOT' | 'TIP';

export interface HomeMainBanner {
  id: string;
  kind: HomeBannerKind;
  title: string;
  subtitle: string;
  gradient: string;
  href: string;
}

// 캐러셀 맨 뒤에 항상 고정되는 배너(디스코드·사용가이드·통계).
// admin(서버) 배너 설정과 무관하게 이 순서로 항상 노출된다. 서버 배너가
// 있으면 그 뒤에 붙고, 서버 배너가 없으면(빈 배열/404/에러) 이 3개만 나온다.
//
// 과거 HOME_MAIN_BANNERS 에 있던 'official-challenge'(공식 챌린지)와
// 'community-diary'(꾸준함이 실력) 는 이제 admin 이 서버 배너로 관리하는
// 영역이라 항상노출 대상에서 제외했다. 되살리려면 git 이력에서 복구.
export const PINNED_HOME_BANNERS: HomeMainBanner[] = [
  {
    id: 'discord-community',
    kind: 'HOT',
    title: '디스코드\n참여하기',
    subtitle: '챌린저들과 실시간으로 이야기 나눠요',
    gradient: 'linear-gradient(135deg, #7289da 0%, #5865f2 100%)',
    href: 'https://discord.gg/JaHRYHtrE7',
  },
  {
    id: 'usage-guide',
    kind: 'TIP',
    title: '1D1S가\n처음이라면',
    subtitle: '5단계로 시작하는 사용 가이드 보기',
    gradient: 'linear-gradient(135deg, #ff8a65 0%, #ff5722 100%)',
    href: '/guide',
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
