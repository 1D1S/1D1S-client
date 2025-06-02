import { OdosLabel } from '@/shared/components/odos-ui/label';
import ToggleButton from '../components/toggle-buttons';
import { useState } from 'react';

interface Props {
  data: { title: string };
  onChange(newData: { title: string }): void;
}

export function Step1({ data, onChange }: Props): React.ReactElement {
  const [isActive, setIsActive] = useState(true);

  const toggleIsActive = (): void => {
    setIsActive((prev) => !prev);
  };

  return (
    <div>
      <h2 className="text-xl font-bold">1단계: 챌린지 제목 입력</h2>
      <OdosLabel>챌린지 제목</OdosLabel>
      <div className="flex gap-2">
        <ToggleButton
          title={'무한기간'}
          subtitle="종료일 없이 진행할 수 있는 챌린지입니다.루틴 형성이나 장기적인 습관 구축에 적합합니다"
          isActive={isActive}
          activeImageSrc={'/images/endless-white.png'}
          inactiveImageSrc={'/images/endless-gray.png'}
          imageWidth={100}
          imageHeight={100}
          onClick={toggleIsActive}
        />
        <ToggleButton
          title="무한기간"
          subtitle="종료일 없이 진행할 수 있는 챌린지입니다.루틴 형성이나 장기적인 습관 구축에 적합합니다"
          isActive={false}
          activeImageSrc={'/images/endless.png'}
          inactiveImageSrc={'/images/endless.png'}
          imageWidth={100}
          imageHeight={100}
        />
      </div>
      <input
        type="text"
        value={data.title}
        onChange={(error) => onChange({ title: error.target.value })}
        className="rounded border p-2"
      />
    </div>
  );
}
