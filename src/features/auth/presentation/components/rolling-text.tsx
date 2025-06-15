'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HeroText } from './hero-text';

const items = ['운동', '독서', '1일 1커밋'];

export default function RollingText(): React.ReactElement {
  const [index, setIndex] = useState(0);

  // 아이템을 계속해서 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-34 w-40 overflow-hidden text-center">
      {/* 상하 그라데이션 */}
      <div className="pointer-events-none absolute top-0 z-10 h-[50px] w-40 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute bottom-0 z-10 h-[50px] w-40 bg-gradient-to-t from-white to-transparent" />

      <div className="relative flex h-34 flex-col-reverse items-center justify-center">
        {/* 애니메이션 적용된 텍스트 */}
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ y: -40, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0.5 }}
            transition={{ duration: 0.5, ease: 'linear' }}
            className="flex w-40 flex-col items-end justify-end"
          >
            <HeroText className="text-main-900">{items[index]}</HeroText>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
