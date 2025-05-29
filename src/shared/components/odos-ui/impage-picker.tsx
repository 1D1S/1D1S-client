'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';

export function OdosImagePicker({
  ...props
}: React.ComponentPropsWithoutRef<'input'>): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClick = (): void => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    console.log('handleChange', event);
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="relative h-25 w-25" onClick={handleClick}>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
        {...props}
      />
      <div className="bg-main-300 flex h-full w-full items-center justify-center rounded-full">
        {preview ? (
          <Image
            src={preview}
            alt="이미지 미리보기"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        ) : (
          <Image src="/images/logo-main-700.png" alt="이미지 업로드 로고" width={30} height={50} />
        )}
      </div>
      <div className="absolute right-0 bottom-0 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white inset-ring-1 inset-ring-gray-400">
        <Image src="/images/plus-gray.png" alt="이미지 업로드 아이콘" width={24} height={24} />
      </div>
    </div>
  );
}
