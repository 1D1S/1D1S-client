/**
 * 서버 컴포넌트에서 prefetch 용으로 호출되는 API 함수 모음.
 *
 * 클라이언트 axios 인스턴스(`apiClient`) 와 동일한 백엔드 엔드포인트를 호출하지만
 * - 들어온 요청의 쿠키를 그대로 백엔드에 포워딩하고
 * - 실패 시 throw 한다. prefetchQuery 가 내부에서 catch 하며, 실패한 쿼리는
 *   dehydrate 설정에 의해 캐시되지 않아 클라이언트가 마운트 시 새로 fetch 한다.
 *
 * 응답 정규화 로직은 클라이언트 API 와 동일하게 적용한다.
 */

import type {
  ChallengeDetailResponse,
  ChallengeListItem,
  ChallengeListParams,
  ChallengeListResponse,
  RandomChallengesParams,
} from '@feature/challenge/board/type/challenge';
import type {
  DiaryDetail,
  DiaryItem,
  DiaryListParams,
  DiaryListResponse,
  RandomDiaryParams,
} from '@feature/diary/board/type/diary';
import { resolveDiaryImageList } from '@feature/diary/shared/utils/diaryImageUrl';
import type {
  MemberDiaryPageInfo,
  MemberProfileData,
} from '@feature/member/type/member';

import { buildQueryString } from './request';
import { serverRequestBody, serverRequestData } from './serverClient';

type DiaryItemApi = Omit<DiaryItem, 'authorInfoDto' | 'diaryInfoDto'> & {
  authorInfoDto?: DiaryItem['authorInfoDto'] | null;
  diaryInfoDto?: DiaryItem['diaryInfoDto'] | null;
  author?: DiaryItem['authorInfoDto'] | null;
  diaryInfo?: DiaryItem['diaryInfoDto'] | null;
  imgUrl?: string[] | string | null;
};

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

export async function getServerRandomChallenges(
  params: RandomChallengesParams = {}
): Promise<ChallengeListItem[]> {
  const { size = 10 } = params;
  const query = buildQueryString({ size });
  return serverRequestData<ChallengeListItem[]>({
    url: `/challenges/random?${query}`,
    method: 'GET',
  });
}

export async function getServerRandomDiaries(
  params: RandomDiaryParams = {}
): Promise<DiaryItem[]> {
  const { size = 10 } = params;
  const query = buildQueryString({ size });
  const data = await serverRequestData<DiaryItemApi[]>({
    url: `/diaries/random?${query}`,
    method: 'GET',
  });
  return normalizeDiaryItems(data);
}

export async function getServerDiaryList(
  params: DiaryListParams = {}
): Promise<DiaryListResponse> {
  const query = buildQueryString({
    size: params.size,
    cursor: params.cursor,
  });
  const data = await serverRequestData<{
    items: DiaryItemApi[];
    pageInfo: DiaryListResponse['pageInfo'];
  }>({
    url: query ? `/diaries?${query}` : '/diaries',
    method: 'GET',
  });
  return {
    ...data,
    items: normalizeDiaryItems(data.items),
  };
}

export async function getServerChallengeList(
  params: ChallengeListParams = {}
): Promise<{ data: ChallengeListResponse; message: string }> {
  const query = buildQueryString({
    limit: params.limit,
    cursor: params.cursor,
    keyword: params.keyword,
    category: params.category,
  });
  return serverRequestBody<{
    data: ChallengeListResponse;
    message: string;
  }>({
    url: query ? `/challenges?${query}` : '/challenges',
    method: 'GET',
  });
}

export async function getServerChallengeDetail(
  challengeId: number
): Promise<ChallengeDetailResponse> {
  return serverRequestData<ChallengeDetailResponse>({
    url: `/challenges/${challengeId}`,
    method: 'GET',
  });
}

export async function getServerDiaryDetail(
  diaryId: number
): Promise<DiaryDetail> {
  return serverRequestData<DiaryDetail>({
    url: `/diaries/${diaryId}`,
    method: 'GET',
  });
}

export async function getServerMemberProfile(
  memberId: number,
  params: { page?: number; size?: number } = {}
): Promise<MemberProfileData> {
  const query = buildQueryString({
    page: params.page,
    size: params.size,
  });
  const response = await serverRequestData<
    Omit<MemberProfileData, 'diaryList'> & {
      diaryList: {
        items: DiaryItemApi[];
        pageInfo: MemberDiaryPageInfo;
      };
    }
  >({
    url: query
      ? `/member/profile/${memberId}?${query}`
      : `/member/profile/${memberId}`,
    method: 'GET',
  });
  return {
    ...response,
    diaryList: {
      items: normalizeDiaryItems(response.diaryList?.items ?? []),
      pageInfo: response.diaryList?.pageInfo ?? {
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        hasNextPage: false,
      },
    },
  };
}
