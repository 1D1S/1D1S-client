import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosTag } from '@/shared/components/odos-ui/tag';
import { useState, useEffect } from 'react';

interface ChallengePickerProps {
  className?: string; // 외부에서 추가할 Tailwind 클래스(예: 마진) 등을 받도록 선언
}

export function ChallengePicker({ className = '' }: ChallengePickerProps): React.ReactElement {
  // 모달 열림 상태 관리
  const [isOpen, setIsOpen] = useState(false);

  // 데모용 챌린지 데이터
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

  // ESC 키 입력 시 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 모달 오버레이 클릭 시 닫기
  const handleOverlayClick = (): void => {
    setIsOpen(false);
  };

  return (
    // 최상위 div에 전달된 className을 합쳐 줍니다.
    <div className={`${className}`}>
      <div
        className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:border-gray-400"
        onClick={() => setIsOpen(true)}
      >
        <OdosLabel className="text-gray-500">챌린지를 선택해주세요.</OdosLabel>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          onClick={handleOverlayClick}
        >
          <div className="bg-opacity-40 absolute inset-0 bg-black/50" />

          <div
            className="relative mx-auto w-11/12 max-w-md justify-center rounded-xl bg-white p-6 text-center shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <OdosLabel size={'heading1'} weight={'bold'} className="mb-4 block w-full text-center">
              챌린지 선택
            </OdosLabel>

            {/* 챌린지 리스트 */}
            <div className="flex max-h-[60vh] flex-col space-y-2 overflow-y-auto pr-2">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
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
                    <span className="mt-1 text-sm font-medium text-gray-700">
                      {`${challenge.participants} / ${challenge.capacity}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
