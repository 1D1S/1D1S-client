// app/challenge/create/components/Step1.tsx
import { OdosLabel } from '@/shared/components/odos-ui/label';

interface Props {
  data: { title: string };
  onChange(newData: { title: string }): void;
}

export function Step1({ data, onChange }: Props): React.ReactElement {
  return (
    <div>
      <h2 className="text-xl font-bold">1단계: 챌린지 제목 입력</h2>
      <OdosLabel>챌린지 제목</OdosLabel>
      <input
        type="text"
        value={data.title}
        onChange={(error) => onChange({ title: error.target.value })}
        className="rounded border p-2"
      />
    </div>
  );
}
