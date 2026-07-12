import {
  Icon,
  ImagePicker,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import { ImageCropDialog } from '@component/ImageCropDialog';
import { CATEGORY_OPTIONS } from '@constants/categories';
import { apiClient } from '@module/api/client';
import { putToStorage } from '@module/api/presignedUpload';
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
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

const CHALLENGE_THUMBNAIL_SIZE = {
  width: 2100,
  height: 900,
} as const;

export function ChallengeEditBannerSection(): React.ReactElement {
  const { control, getValues, setValue, watch } =
    useFormContext<ChallengeEditFormValues>();
  const title = watch('title') ?? '';
  const description = watch('description') ?? '';

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    getValues('thumbnailPreviewUrl')
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<void> => {
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

      await putToStorage(presignedUrl, file);

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

  const handleSelectFile = (file: File): void => {
    setPendingFile(file);
    setIsCropDialogOpen(true);
  };

  const handleCropDialogOpenChange = (open: boolean): void => {
    setIsCropDialogOpen(open);

    if (!open) {
      setPendingFile(null);
    }
  };

  const handleCropApply = (file: File): void => {
    setPendingFile(null);
    void uploadFile(file);
  };

  const handleClear = (): void => {
    setPreviewUrl(undefined);
    setValue('thumbnailImageKey', undefined, { shouldDirty: true });
    setValue('thumbnailPreviewUrl', undefined, { shouldDirty: true });
    setValue('thumbnailRemoved', true, { shouldDirty: true });
  };

  return (
    <ChallengeCreateSectionCard step={1} title="간판 & 기본 정보">
      <div className="space-y-5">
        <div className="space-y-2">
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

        <div className="space-y-2">
          <Text size="caption1" weight="bold" className="block text-gray-600">
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
          <Text size="caption1" weight="bold" className="block text-gray-600">
            카테고리
          </Text>
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <ToggleGroup
                  type="single"
                  // 미선택(undefined)에서도 controlled 상태를 유지하도록 '' 로
                  // 보정한다. uncontrolled→controlled 전환 경고 방지.
                  value={field.value ?? ''}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                  className="gap-1.5"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      size="sm"
                      icon={
                        <Icon name={option.iconName} className="h-3.5 w-3.5" />
                      }
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

        <div className="space-y-2">
          <Text size="caption1" weight="bold" className="block text-gray-600">
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

      <ImageCropDialog
        open={isCropDialogOpen}
        file={pendingFile}
        title="챌린지 사진 맞추기"
        outputSize={CHALLENGE_THUMBNAIL_SIZE}
        onOpenChange={handleCropDialogOpenChange}
        onApply={handleCropApply}
      />
    </ChallengeCreateSectionCard>
  );
}
