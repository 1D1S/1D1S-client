import Image from 'next/image';
import { OdosLabel } from './label';

/**
 * OdosFooter
 * 공통 하단 정보 영역 컴포넌트
 * - 로고 및 서비스명 표시
 * - 고객문의 이메일 제공
 * - 이용약관 / 개인정보처리방침 / 운영정책 링크 항목 포함
 */
export function OdosFooter(): React.ReactElement {
  return (
    <footer className="flex w-screen items-center justify-center bg-gray-900 pt-14 pb-21.5">
      <div className="flex w-250 flex-col gap-7.5 px-7.5">
        <div className="flex flex-row items-center gap-5">
          <Image src="/images/logo-white.png" alt="로고" width={30} height={50} />
          <OdosLabel size="heading1" weight="bold" className="text-white">
            1D1S
          </OdosLabel>
        </div>
        <div className="flex flex-row gap-2.5">
          <OdosLabel size="body2" weight="medium" className="text-white">
            고객문의
          </OdosLabel>
          <OdosLabel size="body2" weight="regular" className="text-white">
            1d1s@gmail.com
          </OdosLabel>
        </div>
        <div className="flex flex-row gap-12.5">
          <OdosLabel size="body2" weight="medium" className="text-white">
            서비스 이용약관
          </OdosLabel>
          <OdosLabel size="body2" weight="medium" className="text-white">
            개인정보 처리방침
          </OdosLabel>
          <OdosLabel size="body2" weight="medium" className="text-white">
            운영정책
          </OdosLabel>
        </div>
      </div>
    </footer>
  );
}
