import {
  INQUIRY_ABOUT_ITEMS,
  INQUIRY_FAQ_ITEMS,
} from '@constants/consts/inquiryData';
import { GUIDE_ARTICLES } from '@feature/guide/consts/guideArticles';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@module/metadata/seo';

/**
 * /llms.txt — AI 답변엔진이 사이트를 파악할 때 먼저 읽는 마크다운 요약.
 *
 * 정적 파일(public/llms.txt) 대신 route 로 두는 이유는 두 가지다.
 * (1) 링크를 SITE_URL 로 만들어 dev 배포가 상용 주소를 광고하지 않게 한다.
 * (2) FAQ 를 화면과 같은 상수에서 가져와, 문구가 바뀔 때 이 파일만 낡는 일을
 *     막는다.
 *
 * 챌린지 개별 URL 은 싣지 않는다 — 그건 sitemap.xml 의 일이고, 여기에 수백
 * 줄을 붙이면 정작 읽히길 바라는 개요가 묻힌다.
 */
export const dynamic = 'force-static';

function section(title: string, lines: string[]): string {
  return `## ${title}\n\n${lines.join('\n')}\n`;
}

function link(path: string, label: string, note = ''): string {
  const url = new URL(path, SITE_URL).toString();
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`;
}

export function GET(): Response {
  const body = [
    `# ${SITE_TITLE} (1D1S, 일디일스)`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    [
      '1D1S 는 매일 하나의 챌린지를 정해 꾸준히 실천하고, 그날의 기록을',
      '일지로 남기는 한국어 습관 형성 커뮤니티입니다. 혼자 하면 쉽게 끊기는',
      '일을 여러 사람이 같은 챌린지에 참여해 서로의 기록을 보며 이어갑니다.',
      '개발·운동·독서·식단·건강·취미·어학·자기계발 등 카테고리가 있고,',
      '운영진이 여는 공식 챌린지와 사용자가 직접 만드는 챌린지가 함께',
      '있습니다.',
    ].join('\n'),
    '',
    section('핵심 기능', [
      '- **챌린지**: 기간·목표·인증 방식을 정해 참여하거나 직접 개설합니다. 개인/단체, 고정 목표/자유 목표, 공개/비공개를 고를 수 있습니다.',
      '- **일지**: 참여 중인 챌린지에 매일 기록을 남깁니다. 사진 인증을 필수로 걸 수 있고, 호스트가 일지 양식을 지정할 수 있습니다.',
      '- **독서·운동 등 카테고리 챌린지**: 같은 관심사끼리 모여 진행합니다.',
      '- **통계**: 연속 달성일(스트릭), 목표 달성률, 일지 추이를 확인합니다.',
      '- **커뮤니티**: 친구, 챌린지별 그룹 채팅, 참여자 순위와 응원(콕 찌르기).',
    ]),
    '',
    section('주요 페이지', [
      link('/', '홈', '오늘의 기록과 추천 챌린지'),
      link('/challenge', '챌린지 목록', '공개 챌린지 검색·카테고리 필터'),
      link('/explore', '탐색', '다른 사람들의 기록 둘러보기'),
      link('/guide', '사용 가이드', '참여부터 일지 작성까지 단계별 안내'),
      link('/guide/official', '공식 챌린지 가이드', '운영진 챌린지 운영 방식'),
      link('/notice', '공지사항', '서비스 공지'),
      link('/inquiry', '문의하기 · FAQ', '자주 묻는 질문과 문의 경로'),
      link('/install', '홈 화면에 추가', 'PWA 설치 안내'),
      link('/terms', '이용약관'),
      link('/privacy', '개인정보 처리방침'),
      link('/sitemap.xml', '사이트맵', '공개 챌린지 전체 URL 목록'),
    ]),
    '',
    section(
      '주제별 가이드',
      GUIDE_ARTICLES.map(({ slug, title, description }) =>
        link(`/guide/${slug}`, title, description)
      )
    ),
    '',
    section(
      '자주 묻는 질문',
      [...INQUIRY_FAQ_ITEMS, ...INQUIRY_ABOUT_ITEMS].map(
        ({ question, answer }) =>
          `- **${question}** ${answer.replaceAll('\n', ' ')}`
      )
    ),
    '',
    section('참고', [
      '- 챌린지 상세 페이지는 로그인 없이 볼 수 있으며 제목·소개·기간·참여자 수가 HTML 에 포함됩니다.',
      '- 일지 상세와 회원 페이지는 비공개라 크롤링 대상이 아닙니다(robots.txt 참조).',
      '- 비공개(비밀번호) 챌린지는 목록·사이트맵·메타데이터 어디에도 노출하지 않습니다.',
      link('/inquiry', '문의', '자주 묻는 질문과 문의 경로'),
    ]),
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
