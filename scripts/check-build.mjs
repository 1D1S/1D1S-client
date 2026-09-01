#!/usr/bin/env node
/**
 * 빌드 결과를 실제로 받아서 두 가지를 검사한다.
 *
 *   1. 초기 HTML 골든 — SEO 에 중요한 텍스트가 **JS 없이** 읽히는지.
 *      SSR 로 끌어올린 콘텐츠가 다시 클라이언트 로딩 뒤로 숨는 회귀를 잡는다.
 *      JS 를 실행하지 않는 AI 크롤러가 보는 것과 같은 조건으로 본다
 *      (script·template·style 을 통째로 제거하고 남는 텍스트).
 *
 *   2. 라우트별 초기 JS 예산 — 페이지가 받는 스크립트 총량.
 *      전역 셸을 가볍게 만든 뒤 조용히 되돌아가는 것을 막는다.
 *
 * 사용법:
 *   pnpm build && pnpm start &     # 또는 PORT=3100 pnpm start
 *   node scripts/check-build.mjs --base http://localhost:3000
 *
 * 종료 코드가 0 이 아니면 회귀다. 예산을 의도적으로 올릴 때는 이 파일의
 * ROUTES 를 함께 고쳐야 한다 — 숫자를 말없이 올리지 말 것.
 */

import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

// `pnpm check:build -- --base ...` 로 부르면 pnpm 이 `--` 를 그대로 넘겨
// parseArgs 가 그 뒤를 전부 위치 인자로 취급한다(옵션이 무시된다).
// 여기서 먼저 걸러내 직접 실행과 pnpm 실행이 같게 동작하게 한다.
const { values } = parseArgs({
  args: process.argv.slice(2).filter((arg) => arg !== '--'),
  allowPositionals: true,
  options: {
    base: { type: 'string', default: 'http://localhost:3000' },
    'skip-budget': { type: 'boolean', default: false },
  },
});

const BASE = values.base.replace(/\/$/, '');

/**
 * 라우트별 기대치.
 *
 * `must`: 초기 HTML(스크립트 제거 후)에 반드시 있어야 하는 문자열.
 *   실제 데이터에 의존하는 값(챌린지 제목 등)은 넣지 않는다 — dev/운영
 *   데이터가 달라 깨진다. 코드가 만드는 문구만 고정한다.
 * `minText`: 봇이 읽는 텍스트 최소 길이. 콘텐츠가 통째로 사라지면 잡힌다.
 * `jsBudgetKb`: 초기 스크립트 합계 상한(원본 기준, KB).
 */
const ROUTES = [
  {
    path: '/',
    must: ['1D1S'],
    minText: 150,
    jsBudgetKb: 940,
    canonical: '/',
    jsonLd: 2,
  },
  {
    path: '/challenge',
    must: ['챌린지 보드', '새로운 습관을 만들고'],
    minText: 400,
    jsBudgetKb: 1000,
    canonical: '/challenge',
  },
  {
    path: '/explore',
    must: ['탐색', '공식 챌린지', '습관·스트릭·독서 챌린지'],
    minText: 350,
    jsBudgetKb: 1070,
    canonical: '/explore',
  },
  {
    // /guide 만 예산이 크다. GuidePhoneMock 이 앱 화면들을 목업으로 그려
    // 달력·히트맵·배너 등 디자인 시스템을 폭넓게 끌어온다(react-day-picker
    // 포함). 다른 라우트와 성격이 다르니 숫자만 보고 놀라지 말 것.
    path: '/guide',
    must: ['주제별 가이드', '습관 만들기'],
    minText: 1500,
    jsBudgetKb: 1240,
    canonical: '/guide',
  },
  {
    path: '/guide/streak',
    must: ['스트릭', '자주 묻는 질문', '함께 읽으면 좋은 글'],
    minText: 1500,
    jsBudgetKb: 910,
    canonical: '/guide/streak',
    jsonLd: 3,
  },
  {
    path: '/inquiry',
    // 아코디언이 닫힌 채로도 답변이 DOM 에 있어야 한다(forceMount).
    must: ['1D1S는 어떤 서비스인가요', '습관 형성 플랫폼'],
    minText: 800,
    jsBudgetKb: 945,
    canonical: '/inquiry',
    jsonLd: 1,
  },
  {
    // 법적 고지는 상단 네비 없이 본문만 나온다(BARE_CHROME_ROUTES).
    // 막다른 길이 되지 않도록 문서 끝 복귀 CTA 가 반드시 있어야 한다.
    path: '/terms',
    must: ['제1조', '1D1S 홈으로', '챌린지 둘러보기'],
    minText: 2000,
    jsBudgetKb: 915,
    canonical: '/terms',
  },
];

function botText(html) {
  const body = html.includes('<body') ? html.split('<body')[1] : html;
  return body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<template[\s\S]*?<\/template>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .join(' ')
    .trim();
}

function scriptChunks(html) {
  const matches = html.match(/\/_next\/static\/chunks\/[^"']+?\.js/g) ?? [];
  return [...new Set(matches)];
}

async function chunkBytes(chunks) {
  let total = 0;
  for (const chunk of chunks) {
    const path = join('.next', chunk.replace('/_next/', ''));
    try {
      total += (await stat(path)).size;
    } catch {
      // 서버가 다른 빌드로 떠 있으면 파일을 못 찾는다. 조용히 넘기면
      // 예산이 0 으로 통과하므로 알린다.
      console.warn(`  ! 청크를 찾을 수 없음: ${chunk}`);
    }
  }
  return total;
}

const failures = [];

function check(route, label, ok, detail) {
  if (!ok) {
    failures.push(`${route} — ${label}${detail ? `: ${detail}` : ''}`);
  }
  return ok;
}

async function run() {
  console.log(`기준: ${BASE}\n`);

  for (const route of ROUTES) {
    const res = await fetch(`${BASE}${route.path}`);
    const html = await res.text();
    const text = botText(html);

    check(route.path, `HTTP ${res.status}`, res.ok);
    check(
      route.path,
      `봇 가시 텍스트 ${text.length}자 < 최소 ${route.minText}`,
      text.length >= route.minText
    );

    for (const needle of route.must) {
      check(route.path, `초기 HTML 에 "${needle}" 없음`, text.includes(needle));
    }

    if (route.canonical) {
      const found = html.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? '';
      // 도메인은 환경마다 다르므로 경로만 비교한다.
      const pathname = found ? new URL(found).pathname.replace(/\/$/, '') : '';
      const expected = route.canonical.replace(/\/$/, '');
      check(
        route.path,
        `canonical 경로 불일치(기대 "${expected}")`,
        pathname === expected,
        found || '없음'
      );
    }

    if (route.jsonLd !== undefined) {
      const count = (html.match(/application\/ld\+json/g) ?? []).length;
      check(
        route.path,
        `JSON-LD ${count}개 (기대 ${route.jsonLd}개 이상)`,
        count >= route.jsonLd
      );
    }

    let budgetLine = '';
    if (!values['skip-budget']) {
      const bytes = await chunkBytes(scriptChunks(html));
      const kb = Math.round(bytes / 1024);
      budgetLine = ` · JS ${kb}KB/${route.jsBudgetKb}KB`;
      check(
        route.path,
        `초기 JS ${kb}KB 가 예산 ${route.jsBudgetKb}KB 초과`,
        kb <= route.jsBudgetKb
      );
    }

    console.log(`  ${route.path} — 텍스트 ${text.length}자${budgetLine}`);
  }

  console.log('');
  if (failures.length) {
    console.error(`실패 ${failures.length}건:`);
    failures.forEach((line) => console.error(`  - ${line}`));
    process.exit(1);
  }
  console.log('모두 통과');
}

// package.json 이 있는 곳에서 실행되는지 확인 — .next 경로가 상대경로다.
await readFile('package.json', 'utf8').catch(() => {
  console.error('레포 루트에서 실행하세요.');
  process.exit(1);
});

await run();
