/**
 * 서버 컴포넌트에서 prefetch 용으로 호출되는 API 함수 모음.
 *
 * 클라이언트 axios 인스턴스(`apiClient`) 와 동일한 백엔드 엔드포인트를 호출하지만
 * - 들어온 요청의 쿠키를 그대로 백엔드에 포워딩하고
 * - 실패 시 throw 한다. prefetchQuery 가 내부에서 catch 하며, 실패한 쿼리는
 *   dehydrate 설정에 의해 캐시되지 않아 클라이언트가 마운트 시 새로 fetch 한다.
 *
 * 응답 정규화 로직은 클라이언트 API 와 동일하게 적용한다.
 *
 * NOTE: 핫 라우트(홈/보드/상세/멤버 프로필)의 프리페치는 클라이언트 React
 * Query 로 이관되어 이 파일에는 `/member/[memberId]/diary` 서브 라우트가
 * 쓰는 `getServerMemberProfile` 만 남는다.
 */

import type { DiaryItem } from '@feature/diary/board/type/diary';
import type {
  MemberDiaryPageInfo,
  MemberProfileData,
} from '@feature/member/type/member';
import { resolveDiaryImageList } from '@module/utils/diaryImageUrl';

import { buildQueryString } from './request';
import { serverRequestData } from './serverClient';

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
