'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { DiaryCard, Text } from '@1d1s/design-system';

type DiaryCategory = 'all' | 'dev' | 'exercise' | 'reading' | 'design' | 'diet';
type SortMode = 'latest' | 'likes';

interface CommunityDiaryItem {
  id: number;
  category: Exclude<DiaryCategory, 'all'>;
  title: string;
  user: string;
  date: string;
  createdAt: string;
  likes: number;
  percent: number;
  emotion: 'happy' | 'soso' | 'sad';
  imageUrl: string;
  challengeLabel: string;
}

const COMMUNITY_DIARIES: CommunityDiaryItem[] = [
  {
    id: 1,
    category: 'dev',
    title: '오늘 알고리즘 문제 3개 풀기 완료! 역시 꾸준함이 답이다.',
    user: '고라니',
    date: '5분 전',
    createdAt: '2025-03-05T10:30:00',
    likes: 10,
    percent: 60,
    emotion: 'happy',
    imageUrl: '/images/default-card.png',
    challengeLabel: '개발',
  },
  {
    id: 2,
    category: 'diet',
    title: '오늘 점심은 샐러드로 가볍게! 생각보다 배부르네요.',
    user: '다이어터',
    date: '1시간 전',
    createdAt: '2025-03-05T09:15:00',
    likes: 7,
    percent: 100,
    emotion: 'happy',
    imageUrl: '/images/default-card.png',
    challengeLabel: '식단',
  },
  {
    id: 3,
    category: 'design',
    title: '디자인 시안 잡는 중인데 아이디어가 잘 안떠오르네요 ㅠㅠ',
    user: '디자이너리',
    date: '2시간 전',
    createdAt: '2025-03-05T08:20:00',
    likes: 3,
    percent: 30,
    emotion: 'soso',
    imageUrl: '/images/default-card.png',
    challengeLabel: '디자인',
  },
  {
    id: 4,
    category: 'reading',
    title: '경제 서적 읽기 1일차. 생각보다 어렵네요.',
    user: '김부자',
    date: '3시간 전',
    createdAt: '2025-03-05T07:10:00',
    likes: 1,
    percent: 20,
    emotion: 'sad',
    imageUrl: '/images/default-card.png',
    challengeLabel: '독서',
  },
  {
    id: 5,
    category: 'exercise',
    title: '아침 러닝 5km 인증합니다! 상쾌하네요.',
    user: '러닝조아',
    date: '5시간 전',
    createdAt: '2025-03-05T05:50:00',
    likes: 2,
    percent: 100,
    emotion: 'happy',
    imageUrl: '/images/default-card.png',
    challengeLabel: '운동',
  },
  {
    id: 6,
    category: 'dev',
    title: '사이드 프로젝트 배포 완료! 구경 오세요.',
    user: '웹마스터',
    date: '6시간 전',
    createdAt: '2025-03-05T04:30:00',
    likes: 33,
    percent: 90,
    emotion: 'happy',
    imageUrl: '/images/default-card.png',
    challengeLabel: '개발',
  },
  {
    id: 7,
    category: 'reading',
    title: '매일 매일 조금씩 성장하는 기분이 듭니다.',
    user: '성실맨',
    date: '8시간 전',
    createdAt: '2025-03-05T02:20:00',
    likes: 14,
    percent: 40,
    emotion: 'happy',
    imageUrl: '/images/default-card.png',
    challengeLabel: '독서',
  },
  {
    id: 8,
    category: 'design',
    title: '오늘의 목표 전부 달성했습니다. 뿌듯하네요.',
    user: '개발자킴',
    date: '10시간 전',
    createdAt: '2025-03-04T23:40:00',
    likes: 24,
    percent: 100,
    emotion: 'happy',
    imageUrl: '/images/default-card.png',
    challengeLabel: '일상',
  },
];

export default function DiaryList(): React.ReactElement {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>('latest');

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-2">
            <Text size="display1" weight="bold" className="text-gray-900">
              일지
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              다른 챌린저의 일지를 보며 동기부여를 얻어보세요
            </Text>
          </div>

          <button
            type="button"
            className="mt-1 flex items-center gap-1 rounded-full px-3 py-2 text-gray-600 transition hover:bg-gray-200"
            onClick={() => setSortMode((prev) => (prev === 'latest' ? 'likes' : 'latest'))}
          >
            <ArrowUpDown className="h-4 w-4" />
            <Text size="body2" weight="medium">
              {sortMode === 'latest' ? '최신순' : '좋아요순'}
            </Text>
          </button>
        </div>

        <div className="diary-grid-container mt-6">
          <div className="diary-card-grid grid grid-cols-2 gap-4">
          {COMMUNITY_DIARIES.map((item) => (
            <motion.div
              key={item.id}
              layout
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            >
              <DiaryCard
                imageUrl={item.imageUrl}
                percent={item.percent}
                likes={item.likes}
                title={item.title}
                user={item.user}
                userImage={'/images/default-profile.png'}
                challengeLabel={item.challengeLabel}
                challengeUrl={'/challenge'}
                date={item.date}
                emotion={item.emotion}
                onClick={() => router.push(`/diary/${item.id}`)}
              />
            </motion.div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
