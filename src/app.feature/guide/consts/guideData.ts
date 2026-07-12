import {
  CalendarDays,
  Camera,
  Flag,
  Flame,
  Heart,
  type LucideIcon,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

export type GuideMockKey =
  | 'browse'
  | 'create'
  | 'diary'
  | 'together'
  | 'stats';

export interface GuideStep {
  n: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  mock: GuideMockKey;
}

interface GuideItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const GUIDE_SUMMARY: GuideItem[] = [
  {
    icon: Flag,
    title: '참여 또는 생성',
    desc: '챌린지를 찾아 참여하거나 직접 만들어요.',
  },
  {
    icon: CalendarDays,
    title: '매일 일지 기록',
    desc: '하루하루 달성률과 사진으로 남겨요.',
  },
  {
    icon: Sparkles,
    title: '함께, 그리고 통계',
    desc: '동료와 응원하고 성장을 확인해요.',
  },
];

export const GUIDE_STEPS: GuideStep[] = [
  {
    n: '01',
    icon: Search,
    kicker: '둘러보기',
    title: '마음에 드는 챌린지에 참여하기',
    body: '운동·독서·건강·학습 등 다양한 챌린지를 둘러보고, 혼자 하는 개인 챌린지든 여럿이 함께하는 단체 챌린지든 마음에 드는 걸 골라 참여하세요.',
    mock: 'browse',
  },
  {
    n: '02',
    icon: Plus,
    kicker: '만들기',
    title: '나만의 챌린지 만들기',
    body: '원하는 챌린지가 없다면 직접 만들어요. 이름·기간·목표를 정하고, 개인/단체와 사진 인증 여부만 설정하면 끝. 친구를 초대해 함께 도전할 수도 있어요.',
    mock: 'create',
  },
  {
    n: '03',
    icon: CalendarDays,
    kicker: '기록하기',
    title: '매일 일지로 하루를 기록하기',
    body: '1D1S의 핵심이에요. 챌린지마다 매일 일지를 남기며 오늘의 달성률을 체크하고, 사진과 짧은 글로 하루를 기록하세요. 기록이 쌓일수록 연속 스트릭이 이어집니다.',
    mock: 'diary',
  },
  {
    n: '04',
    icon: Users,
    kicker: '함께하기',
    title: '동료들과 함께 성장하기',
    body: '같은 챌린지 참여자들의 일지에 좋아요와 댓글을 남기고, 뜸한 동료는 콕 찌르기로 응원하세요. 리더보드에서 서로의 연속 기록을 확인하며 자극받을 수 있어요.',
    mock: 'together',
  },
  {
    n: '05',
    icon: Sparkles,
    kicker: '돌아보기',
    title: '통계로 성장을 확인하기',
    body: '참여율, 목표 완료율, 날짜별 일지 추이를 한눈에. 내가 얼마나 꾸준했는지 데이터로 돌아보고, 다음 챌린지의 동기로 삼으세요.',
    mock: 'stats',
  },
];

export const GUIDE_TIPS: GuideItem[] = [
  {
    icon: Flame,
    title: '스트릭을 지켜요',
    desc: '하루도 빠지지 않고 기록하면 연속 스트릭이 이어집니다. 짧게라도 매일 남기는 게 비결.',
  },
  {
    icon: Camera,
    title: '사진으로 인증해요',
    desc: '사진 인증 챌린지는 오늘의 활동을 담은 한 장이면 충분해요.',
  },
  {
    icon: Heart,
    title: '서로 응원해요',
    desc: '동료의 일지에 반응을 남기면 나도 힘이 나요. 콕 찌르기로 서로를 챙겨보세요.',
  },
];
