// 서버 공개 배너(오늘 활성) 응답 — GET /banners (BannerResponse[]).
// admin(/admin/banners)이 관리하는 이미지 배너다.
export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  // 배너 태그 칩 라벨(nullable). null/미지정이면 칩 미표시.
  tag?: string | null;
  // 게시 기간(YYYY-MM-DD). 서버가 "오늘 활성"만 내려주므로 클라 필터는 불필요.
  startDate: string;
  endDate: string;
}
