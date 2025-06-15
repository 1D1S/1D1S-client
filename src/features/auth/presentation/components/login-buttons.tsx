import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';

interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  img: string;
  text: string;
}

export function LoginButton({
  img,
  text,
  className,
  ...props
}: LoginButtonProps): React.ReactElement {
  return (
    <button
      className={cn(
        'flex flex-row items-center justify-between',
        'w-135 px-6 py-3',
        'rounded-odos-2',
        className
      )}
      {...props}
    >
      <Image src={img} alt="Login Icon" width={24} height={24} />
      <OdosLabel size="heading2" weight="bold">
        {text}
      </OdosLabel>
      <div className="h-6 w-6" />
    </button>
  );
}

export function LoginButtons(): React.ReactElement {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="h-0.5 w-45 bg-gray-300" />
        <OdosLabel size="heading1" weight="bold" className="text-gray-500">
          소셜 로그인
        </OdosLabel>
        <div className="h-0.5 w-45 bg-gray-300" />
      </div>
      <LoginButton
        img="/images/kakao-logo.png"
        text="카카오 로그인"
        className="bg-[#FEE500] text-black"
      />
      <LoginButton
        img="/images/naver-logo.png"
        text="네이버 로그인"
        className="bg-[#03C75A] text-white"
      />
    </div>
  );
}
