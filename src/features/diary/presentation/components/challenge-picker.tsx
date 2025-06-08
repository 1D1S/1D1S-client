// components/ChallengePicker.tsx

import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosTag } from '@/shared/components/odos-ui/tag';
import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface ChallengePickerProps {
  onSelect?(): void;
  className?: string;
}

export function ChallengePicker({
  onSelect,
  className = '',
}: ChallengePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const challenges = [
    {
      id: 1,
      title: '고라니 밥주기 챌린지',
      labels: ['개발', '고정 목표', '모집중'],
      dateRange: '2025.03.05 - 2025.03.20',
      participants: 12,
      capacity: 20,
    },
    {
      id: 2,
      title: '아침 운동 챌린지',
      labels: ['운동', '자기계발', '모집완료'],
      dateRange: '2025.04.01 - 2025.04.30',
      participants: 8,
      capacity: 10,
    },
    {
      id: 3,
      title: '매일 독서하기 챌린지',
      labels: ['독서', '취미', '모집중'],
      dateRange: '2025.05.01 - 2025.05.31',
      participants: 5,
      capacity: 20,
    },
    {
      id: 4,
      title: '코딩 문제 풀이 챌린지',
      labels: ['개발', '상시', '모집중'],
      dateRange: '2025.06.01 - 2025.06.30',
      participants: 20,
      capacity: 30,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOverlayClick = (): void => setIsOpen(false);

  return (
    <div className={className}>
      {/* 토글 버튼 */}
      <div
        className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:border-gray-400"
        onClick={() => setIsOpen(true)}
      >
        <OdosLabel className="text-gray-500">챌린지를 선택해주세요.</OdosLabel>
      </div>

      {/* 모달: 항상 렌더링되지만 opacity & pointer-events로 제어 */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'transition-opacity duration-300 ease-in-out',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-modal="true"
        role="dialog"
        onClick={handleOverlayClick}
      >
        {/* 반투명 오버레이 */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 다이얼로그 박스 */}
        <div
          className="relative mx-auto w-11/12 max-w-md rounded-xl bg-white p-6 text-center shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <OdosLabel size="heading1" weight="bold" className="mb-4 block">
            챌린지 선택
          </OdosLabel>
          <div className="flex max-h-[60vh] flex-col space-y-2 overflow-y-auto pr-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => {
                  onSelect?.();
                  setIsOpen(false);
                }}
                className="flex cursor-pointer items-center rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
                <div className="ml-4 flex flex-col">
                  <OdosLabel>{challenge.title}</OdosLabel>
                  <div className="mt-1 flex space-x-2">
                    {challenge.labels.map((label, idx) => (
                      <OdosTag key={idx}>{label}</OdosTag>
                    ))}
                  </div>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-sm text-gray-500">{challenge.dateRange}</span>
                  <span className="mt-1 text-sm font-medium text-gray-700">{`${challenge.participants} / ${challenge.capacity}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
