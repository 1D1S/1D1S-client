import { Button } from '@1d1s/design-system';
import { API_BASE_URL } from '@module/api/config';
import Image from 'next/image';

import { OAuthProvider } from '../type/auth';

const handleSocialLogin = (provider: OAuthProvider): void => {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
};

interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  img: string;
  text: string;
  provider: OAuthProvider;
}

export function LoginButton({
  img,
  text,
  provider,
  className,
}: LoginButtonProps): React.ReactElement {
  return (
    <Button
      size="large"
      onClick={() => handleSocialLogin(provider)}
      className={className}
    >
      <span className="absolute left-5">
        <Image src={img} alt={text} width={22} height={22} />
      </span>
      {text}
    </Button>
  );
}
