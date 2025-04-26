import localFont from 'next/font/local';

// define a custom local font
const pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/pretendard/Pretendard-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pretendard/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pretendard/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pretendard/Pretendard-Bold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const suite = localFont({
  src: [
    {
      path: '../../public/fonts/suite/SUITE-Bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-suite',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export { pretendard, suite };
