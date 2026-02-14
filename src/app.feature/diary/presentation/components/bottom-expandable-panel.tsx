import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageWatermark,
  Text,
  DatePicker,
} from '@1d1s/design-system';
import { cn } from '@module/lib/utils';
import { Mood, MoodToggle } from './mood-toggle';

export default function BottomExpandablePanel(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const togglePanel = (): void => setIsOpen((prev) => !prev);
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // 외부 클릭 시 패널 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed bottom-0 left-0 flex w-full flex-col items-center"
    >
      {/* 확장 컨텐츠 패널: 높이를 content에 맞춰 자동으로 조절 */}
      <motion.div
        layout
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pointer-events-auto relative w-full overflow-hidden rounded-t-2xl bg-white shadow-lg"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {/* 컨텐츠 */}
              <div
                className={cn(
                  'flex flex-col space-y-4',
                  isOpen ? 'mx-auto w-250 justify-center self-center' : 'w-full'
                )}
              >
                <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                  <PageWatermark />
                  <Text size="heading2" weight="bold">
                    제출
                  </Text>
                </div>
                <div className="flex items-center justify-start">
                  <Text size="heading2" weight="bold" className="mr-2">
                    작성일
                  </Text>
                  <DatePicker
                    value={date}
                    onChange={function (date: Date | undefined): void {
                      setDate(date);
                    }}
                    disableClickPropagation={true}
                  />
                </div>
                <Text size="heading2" weight="bold" className="mt-8">
                  오늘의 기분
                </Text>
                <MoodToggle selected={mood} onSelect={setMood} />

                <div className="h-24" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 버튼 바: 레이아웃 모션으로 부드럽게 이동 */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          isOpen ? 'justify-center' : 'justify-between',
          'pointer-events-auto fixed bottom-0 left-0 z-10 flex h-16 w-full items-center bg-white px-5 shadow-lg'
        )}
      >
        {!isOpen && <PageWatermark />}
        <motion.button
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-main-900 rounded-full px-4 py-2 text-white focus:outline-none"
          onClick={togglePanel}
        >
          {isOpen ? '접기' : '작성 완료'}
        </motion.button>
      </motion.div>
    </div>
  );
}
