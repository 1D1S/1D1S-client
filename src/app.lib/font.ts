import localFont from 'next/font/local';

const pretendard = localFont({
  src: [
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
      // Pretendard-Bold 는 700 페이스다. 과거 '600' 으로 잘못 선언돼
      // font-bold(700)/font-extrabold(800) 요청이 근사/합성으로 처리됐다.
      // ExtraBold(800) woff2 는 assets 에 없으므로 별도 선언하지 않는다.
      // font-extrabold 는 CSS 매칭상 가장 가까운 700(실제 Bold)로 렌더된다.
      path: '../../public/fonts/pretendard/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export { pretendard };
