import { Icon, ImagePicker, Text, TextField } from '@1d1s/design-system';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/Form';

import { ChallengeEditFormValues } from '../hooks/useChallengeEditForm';
import { ChallengeCreateChip } from './ChallengeCreateChip';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

export function ChallengeEditBannerSection(): React.ReactElement {
  const { control, getValues, setValue, watch } =
    useFormContext<ChallengeEditFormValues>();
  const title = watch('title') ?? '';
  const description = watch('description') ?? '';

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

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      });

      setValue('thumbnailImageKey', objectKey, { shouldDirty: true });
      setValue('thumbnailPreviewUrl', blobUrl, { shouldDirty: true });
      setValue('thumbnailRemoved', false, { shouldDirty: true });
    } catch {
      setUploadError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setPreviewUrl(getValues('thumbnailPreviewUrl'));
      setValue('thumbnailImageKey', undefined);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = (): void => {
    setPreviewUrl(undefined);
    setValue('thumbnailImageKey', undefined, { shouldDirty: true });
    setValue('thumbnailPreviewUrl', undefined, { shouldDirty: true });
    setValue('thumbnailRemoved', true, { shouldDirty: true });
  };

  return (
    <ChallengeCreateSectionCard step={1} title="간판 & 기본 정보">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <ImagePicker
            previewUrl={previewUrl}
            onSelectFile={handleSelectFile}
            onClear={handleClear}
            placeholderTitle="간판 사진 업로드"
            placeholderSubtitle="2100×900 권장 · JPG/PNG"
            clearLabel="사진 제거"
            dropZoneClassName="aspect-[21/9]"
          />
          {isUploading ? (
            <Text size="caption1" weight="regular" className="text-gray-500">
              업로드 중...
            </Text>
          ) : null}
          {uploadError !== null ? (
            <Text size="caption1" weight="regular" className="text-red-500">
              {uploadError}
            </Text>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Text
            size="caption1"
            weight="bold"
            className="block text-gray-600"
          >
            챌린지 제목
          </Text>
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TextField
                    id="title"
                    placeholder="예) 새벽 5시 러닝 챌린지"
                    maxLength={50}
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <div className="text-right text-[10px] text-gray-500">
                  {title.length}/50
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <Text
            size="caption1"
            weight="bold"
            className="block text-gray-600"
          >
            카테고리
          </Text>
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map((option) => (
                    <ChallengeCreateChip
                      key={option.value}
                      active={field.value === option.value}
                      onClick={() => field.onChange(option.value)}
                      icon={
                        <Icon
                          name={option.iconName}
                          className="h-3.5 w-3.5"
                        />
                      }
                      ariaLabel={`${option.label} 카테고리`}
                    >
                      {option.label}
                    </ChallengeCreateChip>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Text
            size="caption1"
            weight="bold"
            className="block text-gray-600"
          >
            설명 <span className="text-gray-400">(선택)</span>
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
                    maxLength={200}
                    placeholder="어떤 챌린지인지, 누구에게 추천하는지 자유롭게 적어주세요."
                    className="w-full"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <div className="text-right text-[10px] text-gray-500">
                  {description.length}/200
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </ChallengeCreateSectionCard>
  );
}
