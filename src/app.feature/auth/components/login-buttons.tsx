import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';

interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        'w-full max-w-[320px] px-6 py-3',
        'rounded-odos-2',
        className
      )}
      {...props}
    >
      <Image src={img} alt="Login Icon" width={24} height={24} />
      <Text size="heading2" weight="bold">
        {text}
      </Text>
      <div className="h-6 w-6" />
    </button>
  );
}

export function LoginButtons(): React.ReactElement {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full max-w-[320px] items-center justify-between gap-4">
        <div className="h-0.5 flex-1 bg-gray-300" />
        <Text size="heading1" weight="bold" className="shrink-0 text-gray-500">
          소셜 로그인
        </Text>
        <div className="h-0.5 flex-1 bg-gray-300" />
      </div>
      <div className="flex w-full flex-col items-center gap-3">
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
    </div>
  );
}
