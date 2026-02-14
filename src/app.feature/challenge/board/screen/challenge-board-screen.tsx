'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  ChallengeCard,
  Icon,
  Pagination,
  Text,
  TextField,
  Toggle,
} from '@1d1s/design-system';
import {
  CHALLENGE_BOARD_CATEGORY_FILTERS,
  CHALLENGE_BOARD_ITEMS_PER_PAGE,
  CHALLENGE_BOARD_LIST,
  type ChallengeCategory,
  getChallengeCategoryLabel,
} from '../consts/challenge-board-data';

export default function ChallengeList(): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredChallenges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return CHALLENGE_BOARD_LIST.filter((challenge) => {
      const categoryMatched =
        selectedCategory === 'all' || challenge.category === selectedCategory;

      if (!categoryMatched) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        challenge.title.toLowerCase().includes(normalizedQuery) ||
        challenge.description.toLowerCase().includes(normalizedQuery) ||
        challenge.challengeType.toLowerCase().includes(normalizedQuery) ||
        getChallengeCategoryLabel(challenge.category).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredChallenges.length / CHALLENGE_BOARD_ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedChallenges = useMemo(() => {
    const start = (safeCurrentPage - 1) * CHALLENGE_BOARD_ITEMS_PER_PAGE;
    return filteredChallenges.slice(start, start + CHALLENGE_BOARD_ITEMS_PER_PAGE);
  }, [filteredChallenges, safeCurrentPage]);

  return (
    <div className="flex min-h-screen w-full flex-col p-4">
      <section className="w-full rounded-4 px-1 pb-6">
        <div className="flex flex-col gap-2">
          <Text size="display1" weight="bold" className="text-gray-900">
            전체 챌린지
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            새로운 습관을 만들고 함께 성장할 챌린지를 찾아보세요.
          </Text>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-[460px]">
            <TextField
              variant="search"
              className="w-full"
              placeholder="챌린지 검색 (이름, 설명)"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button
            size="medium"
            onClick={() => router.push('/challenge/create')}
            className="whitespace-nowrap"
          >
            <span className="flex items-center gap-1">
              <Icon name="Plus" size={16} />
              새 챌린지 생성
            </span>
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CHALLENGE_BOARD_CATEGORY_FILTERS.map((filter) => (
            <Toggle
              key={filter.key}
              shape="rounded"
              icon={filter.icon}
              pressed={selectedCategory === filter.key}
              onPressedChange={(pressed) => {
                if (pressed) {
                  setSelectedCategory(filter.key);
                  setCurrentPage(1);
                }
              }}
              className="h-10 px-4"
            >
              {filter.label}
            </Toggle>
          ))}
        </div>

        <div className="challenge-grid-container mt-8">
          <div className="challenge-card-grid grid grid-cols-1 gap-4">
          {paginatedChallenges.map((challenge) => (
            <div key={challenge.id} className="min-w-0">
              <ChallengeCard
                challengeTitle={challenge.title}
                challengeType={challenge.challengeType}
                challengeCategory={getChallengeCategoryLabel(challenge.category)}
                currentUserCount={challenge.currentParticipants}
                maxUserCount={challenge.maxParticipants}
                startDate={challenge.startDate}
                endDate={challenge.endDate}
                isOngoing={challenge.status === 'closingSoon'}
                isEnded={challenge.status === 'ended'}
                className="h-full"
                onClick={() => router.push(`/challenge/${challenge.id}`)}
              />
            </div>
          ))}
          </div>
        </div>

        {paginatedChallenges.length === 0 ? (
          <div className="mt-8 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              조건에 맞는 챌린지가 없습니다.
            </Text>
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-center">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </section>
    </div>
  );
}
