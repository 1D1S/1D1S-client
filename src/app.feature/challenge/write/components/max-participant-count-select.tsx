import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextField,
} from '@1d1s/design-system';
import { type ChangeEvent } from 'react';

interface MaxParticipantCountSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
}

export function MaxParticipantCountSelect({
  value,
  onValueChange,
  customValue = '',
  onCustomValueChange,
}: MaxParticipantCountSelectProps): React.ReactElement {
  return (
    <div className="flex flex-col space-y-3">
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="h-11 w-full rounded-2xl hover:cursor-pointer">
          <SelectValue placeholder="참여 인원을 선택해주세요." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">2명</SelectItem>
          <SelectItem value="5">5명</SelectItem>
          <SelectItem value="10">10명</SelectItem>
          <SelectItem value="etc">직접 입력 (최대 50명)</SelectItem>
        </SelectContent>
      </Select>
      <Text size="body2" weight="regular" className="text-gray-600">
        단체 챌린지 운영을 위해 최대 인원을 설정하세요.
      </Text>
      {value === 'etc' && (
        <div className="flex flex-col space-y-2">
          <Text size="body2" weight="medium" className="text-gray-700">
            직접 입력 (최대 50명)
          </Text>
          <TextField
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full md:w-[240px]"
            value={customValue}
            maxLength={2}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onCustomValueChange?.(e.target.value.replace(/\D/g, ''));
            }}
          />
        </div>
      )}
    </div>
  );
}
