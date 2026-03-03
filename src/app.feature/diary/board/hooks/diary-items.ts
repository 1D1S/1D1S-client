// shared/hooks/useDiaryItems.ts

import { useCallback,useEffect, useState } from 'react';

export interface DiaryItem {
  id: number;
  imageUrl: string;
  percent: number;
  likes: number;
  title: string;
  user: string;
  userImage: string;
  challengeLabel: string;
  challengeUrl: string;
  date: string;
  emotion: 'happy' | 'soso' | 'sad';
}

export function useDiaryItems(
  initialCount = 12,
  batchSize = 12
): { items: DiaryItem[]; loading: boolean } {
  const [items, setItems] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const generateItems = useCallback(
    (startId: number, count: number): DiaryItem[] =>
      Array.from({ length: count }).map((_, idx) => ({
        id: startId + idx,
        imageUrl: 'https://placehold.co/600x400',
        percent: 60,
        likes: 10,
        title: '고라니 밥준 일지고라니 밥준 일지고라니 밥준 일지',
        user: '고라니',
        userImage: '',
        challengeLabel: '1D1S 공식 챌린지',
        challengeUrl: '/challenges/1d1s',
        date: '2025.03.05',
        emotion: 'happy',
      })),
    []
  );

  useEffect(() => {
    setItems(generateItems(0, initialCount));
  }, [generateItems, initialCount]);

  useEffect(() => {
    const handleScroll = (): void => {
      if (loading) {
        return;
      }

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 100;
      if (scrollPosition >= threshold) {
        setLoading(true);
        setTimeout(() => {
          setItems((prev) => [
            ...prev,
            ...generateItems(prev.length, batchSize),
          ]);
          setLoading(false);
        }, 1000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, generateItems, batchSize]);

  return { items, loading };
}
