import { apiClient } from '@module/api/client';
import {
  buildQueryString,
  requestBody,
  requestData,
} from '@module/api/request';

import { resolveDiaryImageList } from '../../shared/utils/diary-image-url';
import {
  DiaryItem,
  DiaryListParams,
  DiaryListResponse,
  MyDiariesResponse,
  RandomDiaryParams,
} from '../type/diary';

type DiaryItemApi = Omit<DiaryItem, 'authorInfoDto' | 'diaryInfoDto'> & {
  authorInfoDto?: DiaryItem['authorInfoDto'] | null;
  diaryInfoDto?: DiaryItem['diaryInfoDto'] | null;
  author?: DiaryItem['authorInfoDto'] | null;
  diaryInfo?: DiaryItem['diaryInfoDto'] | null;
  imgUrl?: string[] | string | null;
};

type DiaryListApiResponse = Omit<DiaryListResponse, 'items'> & {
  items: DiaryItemApi[];
};

type AllDiariesApiResponse = DiaryItemApi[] | { data?: DiaryItemApi[] };

const normalizeDiaryItem = (item: DiaryItemApi): DiaryItem => {
  const { author, diaryInfo, authorInfoDto, diaryInfoDto, ...rest } = item;

  return {
    ...rest,
    imgUrl: resolveDiaryImageList(item.imgUrl),
    authorInfoDto: authorInfoDto ?? author ?? null,
    diaryInfoDto: diaryInfoDto ?? diaryInfo ?? null,
  };
};

const normalizeDiaryItems = (items: DiaryItemApi[]): DiaryItem[] =>
  items.map(normalizeDiaryItem);

const normalizeAllDiariesResponse = (
  response: AllDiariesApiResponse
): DiaryItem[] => {
  if (Array.isArray(response)) {
    return normalizeDiaryItems(response);
  }

  return Array.isArray(response.data) ? normalizeDiaryItems(response.data) : [];
};

export const diaryBoardApi = {
  // 다이어리 모두 조회 (페이지네이션)
  getDiaryList: async (
    params: DiaryListParams = {}
  ): Promise<DiaryListResponse> => {
    const query = buildQueryString({
      size: params.size,
      cursor: params.cursor,
    });

    const response = await requestData<DiaryListApiResponse>(apiClient, {
      url: query ? `/diaries?${query}` : '/diaries',
      method: 'GET',
    });

    return {
      ...response,
      items: normalizeDiaryItems(response.items),
    };
  },

  // 다이어리 모두 조회 (전체)
  getAllDiaries: async (): Promise<DiaryItem[]> => {
    const response = await requestBody<AllDiariesApiResponse>(apiClient, {
      url: '/diaries/all',
      method: 'GET',
    });

    return normalizeAllDiariesResponse(response);
  },

  // 나의 다이어리 목록 조회
  getMyDiaries: async (size?: number): Promise<MyDiariesResponse> => {
    const query = size !== undefined ? buildQueryString({ size }) : '';
    const response = await requestData<{
      items: DiaryItemApi[];
      pageInfo: MyDiariesResponse['pageInfo'];
    }>(apiClient, {
      url: query ? `/diaries/my?${query}` : '/diaries/my',
      method: 'GET',
    });

    return {
      items: normalizeDiaryItems(response.items),
      pageInfo: response.pageInfo,
    };
  },

  // 특정 멤버의 다이어리 목록 조회
  getMemberDiaries: async (
    memberId: number,
    size?: number
  ): Promise<MyDiariesResponse> => {
    const query = size !== undefined ? buildQueryString({ size }) : '';
    const response = await requestData<{
      items: DiaryItemApi[];
      pageInfo: MyDiariesResponse['pageInfo'];
    }>(apiClient, {
      url: query
        ? `/diaries/member/${memberId}?${query}`
        : `/diaries/member/${memberId}`,
      method: 'GET',
    });

    return {
      items: normalizeDiaryItems(response.items),
      pageInfo: response.pageInfo,
    };
  },

  // 랜덤 다이어리 보여주기
  getRandomDiaries: async (
    params: RandomDiaryParams = {}
  ): Promise<DiaryItem[]> => {
    const { size = 10 } = params;
    const query = buildQueryString({ size });

    const response = await requestData<DiaryItemApi[]>(apiClient, {
      url: `/diaries/random?${query}`,
      method: 'GET',
    });

    return normalizeDiaryItems(response);
  },
};
