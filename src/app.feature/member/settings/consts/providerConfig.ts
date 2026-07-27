// 연동 계정(소셜 프로바이더) 표시 설정.
//
// ⚠️ 조회는 반드시 getProviderConfig() 로 한다. 과거 PROVIDER_CONFIG[provider]
// 로 직접 인덱싱해, 서버가 새로 내려준 APPLE 에서 undefined 가 되어
// `config.bg` 접근이 TypeError 로 터지며 프로필 설정 페이지가 죽었다.
// 새 프로바이더가 추가돼도 폴백으로 살아남게 한다.
export interface ProviderConfig {
  label: string;
  bg: string;
  textColor: string;
  // 전용 로고 에셋이 있으면 이미지로, 없으면 null → 라벨 텍스트로 표시한다.
  icon: string | null;
}

export const PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  KAKAO: {
    label: '카카오',
    bg: 'bg-[#FEE500]',
    textColor: 'text-black',
    icon: '/images/kakao-logo.png',
  },
  NAVER: {
    label: '네이버',
    bg: 'bg-[#03C75A]',
    textColor: 'text-white',
    icon: '/images/naver-logo.png',
  },
  GOOGLE: {
    label: '구글',
    bg: 'bg-white border border-gray-300',
    textColor: 'text-gray-700',
    icon: null,
  },
  // 애플 브랜드 가이드에 맞춰 검정 배경 + 흰 텍스트, 표기는 'Apple'.
  // 전용 로고 에셋이 없어 GOOGLE 과 동일하게 라벨 텍스트로 노출한다.
  APPLE: {
    label: 'Apple',
    bg: 'bg-black',
    textColor: 'text-white',
    icon: null,
  },
};

// 알 수 없는 프로바이더 폴백 — 크래시 대신 중립 칩으로 표시한다.
const FALLBACK_PROVIDER_CONFIG: ProviderConfig = {
  label: '',
  bg: 'bg-gray-100',
  textColor: 'text-gray-700',
  icon: null,
};

/**
 * 프로바이더 표시 설정 조회. 미등록 값이면 원문을 라벨로 쓰는 중립 스타일을
 * 돌려주어, 서버가 새 프로바이더를 추가해도 화면이 죽지 않는다.
 */
export function getProviderConfig(provider: string): ProviderConfig {
  return (
    PROVIDER_CONFIG[provider] ?? {
      ...FALLBACK_PROVIDER_CONFIG,
      label: provider,
    }
  );
}
