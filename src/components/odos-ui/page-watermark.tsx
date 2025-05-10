import { OdosLabel } from './label';
import Image from 'next/image';

export function OdosPageWatermark(): React.ReactElement {
  return (
    <div className="flex items-end gap-2">
      <Image src="/images/logo-gray.png" alt="로고" width={24} height={40} />
      <OdosLabel size="body1" weight="bold" className="my-2.5 text-gray-300">
        1D1S
      </OdosLabel>
    </div>
  );
}
