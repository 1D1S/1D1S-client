import Image from 'next/image';
import { OdosLabel } from './label';

interface UserListItemProps {
  className?: string;
  userName: string;
  userImageSrc?: string;
  isAuthor: boolean;
  onAccept?(): void;
  onReject?(): void;
}

export function UserListItem({
  className,
  userName,
  userImageSrc,
  isAuthor = false,
  onAccept,
  onReject,
}: UserListItemProps): React.ReactElement {
  return (
    <div className={`rounded-odos-2 bg-main-200 flex items-center gap-2 p-4 ${className}`}>
      <Image
        src={userImageSrc ?? '/images/default-profile.png'}
        alt="user-profile-image"
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <div className="flex w-full items-center justify-between">
        <OdosLabel>{userName}</OdosLabel>
        {isAuthor && (
          <div className="flex gap-2">
            <OdosLabel
              size={'caption3'}
              weight={'medium'}
              onClick={onAccept}
              className="bg-mint-500 rounded-odos-1 cursor-pointer px-1.5 py-1"
            >
              수락
            </OdosLabel>
            <OdosLabel
              size={'caption3'}
              weight={'medium'}
              onClick={onReject}
              className="rounded-odos-1 cursor-pointer bg-red-400 px-1.5 py-1"
            >
              거절
            </OdosLabel>
          </div>
        )}
      </div>
    </div>
  );
}
