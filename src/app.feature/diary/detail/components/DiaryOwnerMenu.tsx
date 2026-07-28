import { Button } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Edit3, MoreVertical, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface DiaryOwnerMenuProps {
  onEdit(): void;
  onDelete(): void;
}

// 일지 소유자 액션 메뉴(수정/삭제) — 외부 클릭 시 닫힘.
// DiaryDetailScreen 에서 분리한 컴포넌트(마크업/동작 불변).
export function DiaryOwnerMenu({
  onEdit,
  onDelete,
}: DiaryOwnerMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="secondary"
        size="md"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen ? (
        <div
          className={cn(
            'absolute top-full right-0 z-10 mt-1 w-32',
            'overflow-hidden rounded-lg border border-gray-200',
            'bg-white shadow-md'
          )}
        >
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-2',
              'px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50'
            )}
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          >
            <Edit3 className="h-4 w-4" />
            일지 수정
          </button>
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-2',
              'px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-50'
            )}
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            일지 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
