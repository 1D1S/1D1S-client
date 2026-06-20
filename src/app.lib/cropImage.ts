export type ImageCropMode = 'cover' | 'contain';

export interface ImageCropSize {
  width: number;
  height: number;
}

export interface ImageCropOptions {
  mode: ImageCropMode;
  outputSize: ImageCropSize;
  zoom: number;
  offsetX: number;
  offsetY: number;
  backgroundColor: string;
}

interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 불러오지 못했습니다.'));
    };

    image.src = objectUrl;
  });
}

function getOutputFileName(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf('.');
  const baseName =
    extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  return `${baseName || 'image'}-cropped.jpg`;
}

function getDrawMetrics({
  imageSize,
  outputSize,
  mode,
  zoom,
  offsetX,
  offsetY,
}: {
  imageSize: ImageCropSize;
  outputSize: ImageCropSize;
  mode: ImageCropMode;
  zoom: number;
  offsetX: number;
  offsetY: number;
}): {
  drawWidth: number;
  drawHeight: number;
  drawX: number;
  drawY: number;
} {
  const widthScale = outputSize.width / imageSize.width;
  const heightScale = outputSize.height / imageSize.height;
  const baseScale =
    mode === 'cover'
      ? Math.max(widthScale, heightScale)
      : Math.min(widthScale, heightScale);
  const scale = baseScale * zoom;
  const drawWidth = imageSize.width * scale;
  const drawHeight = imageSize.height * scale;
  const overflowX = Math.max(0, drawWidth - outputSize.width);
  const overflowY = Math.max(0, drawHeight - outputSize.height);

  return {
    drawWidth,
    drawHeight,
    drawX: (outputSize.width - drawWidth) / 2 - (overflowX * offsetX) / 2,
    drawY: (outputSize.height - drawHeight) / 2 - (overflowY * offsetY) / 2,
  };
}

export async function cropImageFile(
  file: File,
  options: ImageCropOptions
): Promise<File> {
  const loaded = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = options.outputSize.width;
  canvas.height = options.outputSize.height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('이미지 편집을 시작하지 못했습니다.');
  }

  context.fillStyle = options.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const metrics = getDrawMetrics({
    imageSize: {
      width: loaded.width,
      height: loaded.height,
    },
    outputSize: options.outputSize,
    mode: options.mode,
    zoom: options.zoom,
    offsetX: options.offsetX,
    offsetY: options.offsetY,
  });

  context.drawImage(
    loaded.image,
    metrics.drawX,
    metrics.drawY,
    metrics.drawWidth,
    metrics.drawHeight
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error('이미지를 저장하지 못했습니다.'));
      },
      'image/jpeg',
      0.92
    );
  });

  return new File([blob], getOutputFileName(file.name), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}
