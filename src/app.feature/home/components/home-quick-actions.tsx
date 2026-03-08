import { InfoButton } from '@1d1s/design-system';
import React from 'react';

interface HomeQuickActionsProps {
  onNavigate(path: string): void;
}

const QUICK_ACTION_ITEMS: Array<{
  mainText: string;
  subText: string;
  imageSrc: string;
  gradientFrom: string;
  gradientTo: string;
  href: string;
}> = [
  {
    mainText: '1D1S가 처음이신가요?',
    subText: '온보딩',
    imageSrc: '/images/logo-white.png',
    gradientFrom: '#1D9C6D',
    gradientTo: '#5EC69D',
    href: '/onboarding',
  },
  {
    mainText: '불편한 점이 있으신가요?',
    subText: '문의',
    imageSrc: '/images/message.png',
    gradientFrom: '#1666BA',
    gradientTo: '#7AB3EF',
    href: '/inquiry',
  },
  {
    mainText: '새로운 목표를 시작해보세요',
    subText: '챌린지 생성',
    imageSrc: '/images/add-white.png',
    gradientFrom: '#FF6D2D',
    gradientTo: '#FF9A3E',
    href: '/challenge/create',
  },
];

export default function HomeQuickActions({
  onNavigate,
}: HomeQuickActionsProps): React.ReactElement {
  return (
    <div className="w-full px-4">
      <div className="grid grid-cols-3 gap-3">
        {QUICK_ACTION_ITEMS.map((item) => (
          <div key={item.href} className="h-[90px] sm:h-[140px] lg:h-[180px]">
            <InfoButton
              mainText={item.mainText}
              subText={item.subText}
              imageSrc={item.imageSrc}
              gradientFrom={item.gradientFrom}
              gradientTo={item.gradientTo}
              className="!sm:h-full !sm:w-full !h-full !w-full cursor-pointer"
              onClick={() => onNavigate(item.href)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
