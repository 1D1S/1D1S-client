import { describe, expect, it } from 'vitest';

import { toJpegFileName } from './compressImage';

// canvas 가 없는 환경(jsdom)이라 압축 자체는 테스트할 수 없다. 재인코딩 후
// 오브젝트 키에 그대로 실리는 파일명 규칙만 고정한다.
describe('toJpegFileName', () => {
  it('확장자를 .jpg 로 바꾼다', () => {
    expect(toJpegFileName('photo.png')).toBe('photo.jpg');
    expect(toJpegFileName('IMG_0001.HEIC')).toBe('IMG_0001.jpg');
    expect(toJpegFileName('shot.jpeg')).toBe('shot.jpg');
  });

  it('점이 여러 개면 마지막 것만 확장자로 본다', () => {
    expect(toJpegFileName('my.photo.v2.png')).toBe('my.photo.v2.jpg');
  });

  it('확장자가 없으면 붙인다', () => {
    expect(toJpegFileName('screenshot')).toBe('screenshot.jpg');
  });

  it('숨김 파일처럼 점으로 시작하면 이름을 지우지 않는다', () => {
    expect(toJpegFileName('.gitkeep')).toBe('.gitkeep.jpg');
  });

  it('빈 이름은 기본값으로 채운다', () => {
    expect(toJpegFileName('')).toBe('image.jpg');
    expect(toJpegFileName('   ')).toBe('image.jpg');
  });
});
