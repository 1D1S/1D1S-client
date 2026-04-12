import {
  ImagePicker,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/form';
import { CATEGORY_OPTIONS } from '@/app.constants/categories';

import { ChallengeCreateFormValues } from '../../hooks/use-challenge-create-form';

export function Step1(): React.ReactElement {
  const { control, setValue, getValues } =
    useFormContext<ChallengeCreateFormValues>();

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    getValues('thumbnailPreviewUrl')
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSelectFile = async (file: File): Promise<void> => {
    setUploadError(null);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setIsUploading(true);

    try {
      const { presignedUrl, objectKey } = await requestData<{
        presignedUrl: string;
        objectKey: string;
      }>(apiClient, {
        url: '/image/presigned-url',
        method: 'POST',
        data: { fileName: file.name, fileType: file.type },
      });

      // iOS에서 HEIC 등 일부 포맷은 file.type이 빈 문자열일 수 있음
      // Content-Type이 없으면 S3 서명 불일치(403)가 발생하므로 fallback 적용
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      });

      setValue('thumbnailImageKey', objectKey);
      setValue('thumbnailPreviewUrl', blobUrl);
    } catch {
      setUploadError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setPreviewUrl(undefined);
      setValue('thumbnailImageKey', undefined);
      setValue('thumbnailPreviewUrl', undefined);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = (): void => {
    setPreviewUrl(undefined);
    setValue('thumbnailImageKey', undefined);
    setValue('thumbnailPreviewUrl', undefined);
  };

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-6">
      {/* 대표 사진 */}
      <div className="flex flex-col gap-1.5 space-y-1.5">
        <Text size="body1" weight="bold" className="text-gray-900">
          대표 사진 <span className="text-gray-500">(선택)</span>
        </Text>
        <ImagePicker
          previewUrl={previewUrl}
          onSelectFile={handleSelectFile}
          onClear={handleClear}
          placeholderTitle="클릭하여 대표 사진을 추가하세요."
          placeholderSubtitle="또는 이미지를 드래그해서 놓아주세요."
          clearLabel="사진 제거"
          dropZoneClassName="aspect-[4/1]"
        />
        {isUploading && (
          <Text size="caption1" weight="regular" className="text-gray-500">
            업로드 중...
          </Text>
        )}
        {uploadError !== null && (
          <Text size="caption1" weight="regular" className="text-red-500">
            {uploadError}
          </Text>
        )}
      </div>

      {/* 제목 */}
      <div className="flex flex-col gap-1.5 space-y-1.5">
        <Text size="body1" weight="bold" className="text-gray-900">
          챌린지 제목 <span className="text-main-800">*</span>
        </Text>
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextField
                  id="title"
                  placeholder="예: 아침 30분 러닝"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-1.5 space-y-2">
        <Text size="body1" weight="bold" className="text-gray-900">
          카테고리
        </Text>
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    icon={option.icon}
                    aria-label={`${option.label} 카테고리`}
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 설명 */}
      <div className="flex flex-col gap-1.5 space-y-1.5">
        <Text size="body1" weight="bold" className="text-gray-900">
          설명 <span className="text-gray-500">(선택)</span>
        </Text>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextField
                  id="description"
                  multiline
                  rows={4}
                  placeholder="챌린지 소개와 진행 방법을 자유롭게 적어주세요."
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
