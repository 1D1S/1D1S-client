import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '1Day 1Streak',
    short_name: '1D1S',
    description: '매일 하나의 챌린지로 꾸준함을 기록하는 1Day 1Streak',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FF7043',
    orientation: 'portrait',
    lang: 'ko',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
