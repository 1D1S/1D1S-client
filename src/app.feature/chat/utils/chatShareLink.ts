// 붙여넣은 1D1S 링크를 알아본다.
//
// 판정 자체는 서버가 한다(POST /chat/shares/resolve) — 삭제됐는지, 비공개인지,
// 남의 일지인지는 클라가 알 수 없다. 여기서 하는 일은 **물어볼 가치가 있는
// 링크인가** 하나다. 아무 링크나 서버에 물으면 붙여넣기마다 왕복이 는다.

const SHARE_HOSTS = new Set([
  '1day1streak.com',
  'www.1day1streak.com',
  'dev.1day1streak.com',
  'local.1day1streak.com',
  'local.dev.1day1streak.com',
]);

const SHARE_PATHS = new Set(['challenge', 'diary']);

/**
 * 이 글이 통째로 우리 공유 링크 하나인가. 맞으면 그 URL, 아니면 null.
 *
 * 글 중간에 섞인 링크는 건드리지 않는다 — "이거 봐 <링크> 어때?" 를
 * 공유 카드로 바꿔 버리면 하고 싶던 말이 사라진다.
 */
export function chatShareLinkIn(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  if (!SHARE_HOSTS.has(url.hostname.toLowerCase())) {
    return null;
  }
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2 || !SHARE_PATHS.has(segments[0])) {
    return null;
  }
  return Number.isInteger(Number(segments[1])) && segments[1] !== ''
    ? trimmed
    : null;
}

/** 본문 안의 URL. 링크가 없으면 대부분의 메시지처럼 그냥 글로 그린다. */
export const CHAT_URL_PATTERN = /(https?:\/\/[^\s<>"]+)/gi;

/**
 * 눌러도 되는 주소인가. http(s) 만 통과시킨다.
 *
 * 서버가 링크 프리뷰를 만들 때 실제로 가져온 주소만 내려주므로 현실에서는
 * 늘 http(s) 지만, 그 값이 그대로 `href` 로 들어가는 자리라 스킴을 여기서
 * 한 번 확인한다 — `javascript:` 가 href 에 닿으면 클릭 한 번이 스크립트
 * 실행이다. 본문 링크화는 정규식이 http(s) 로 시작하는 것만 잡아 이미
 * 안전하고, 서버를 그대로 믿는 자리는 프리뷰 카드뿐이다.
 */
export function isSafeHttpUrl(value?: string | null): boolean {
  if (!value) {
    return false;
  }
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** 링크 끝에 붙은 문장부호는 주소가 아니다 — "…watch?v=abc." 의 마침표. */
export function trimUrlTail(url: string): string {
  const trailing = '.,;:!?)]}\'"';
  let end = url.length;
  while (end > 0 && trailing.includes(url[end - 1])) {
    // 괄호가 짝을 이루면 주소의 일부다(위키 링크 등).
    if (url[end - 1] === ')') {
      const opens = (url.match(/\(/g) ?? []).length;
      const closes = (url.slice(0, end).match(/\)/g) ?? []).length;
      if (opens >= closes) {
        break;
      }
    }
    end -= 1;
  }
  return url.slice(0, end);
}
