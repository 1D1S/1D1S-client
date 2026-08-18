import { describe, expect, it } from 'vitest';

import { buildAppleAppSiteAssociation, buildAssetLinks } from './appLinks';

interface Aasa {
  applinks: { details: Array<{ appIDs: string[]; components: unknown[] }> };
}

interface AssetLink {
  relation: string[];
  target: { package_name: string; sha256_cert_fingerprints: string[] };
}

const PROD = '1day1streak.com';
const DEV = 'dev.1day1streak.com';

describe('buildAppleAppSiteAssociation', () => {
  it('운영 호스트는 운영 appID 를 준다', () => {
    const aasa = buildAppleAppSiteAssociation(PROD) as Aasa;
    expect(aasa.applinks.details[0].appIDs).toEqual([
      'VF3TAS8J2N.com.onedayonestreak.app',
    ]);
  });

  it('dev 호스트와 로컬 별칭은 dev appID 를 준다', () => {
    const dev = buildAppleAppSiteAssociation(DEV) as Aasa;
    const local = buildAppleAppSiteAssociation(
      'local.dev.1day1streak.com:3000'
    ) as Aasa;
    expect(dev.applinks.details[0].appIDs).toEqual([
      'VF3TAS8J2N.com.onedayonestreak.app.dev',
    ]);
    expect(local.applinks.details[0].appIDs).toEqual(
      dev.applinks.details[0].appIDs
    );
  });

  it('앱 intent-filter 와 같은 두 갈래만 가로챈다', () => {
    const aasa = buildAppleAppSiteAssociation(PROD) as Aasa;
    expect(aasa.applinks.details[0].components).toEqual([
      { '/': '/challenge/*' },
      { '/': '/diary/*' },
    ]);
  });
});

describe('buildAssetLinks', () => {
  it('호스트에 맞는 패키지를 준다', () => {
    expect((buildAssetLinks(PROD) as AssetLink[])[0].target.package_name).toBe(
      'com.onedayonestreak.app'
    );
    expect((buildAssetLinks(DEV) as AssetLink[])[0].target.package_name).toBe(
      'com.onedayonestreak.app.dev'
    );
  });

  it('지금은 업로드 키 지문 하나뿐 — Play 앱 서명 키가 오면 둘이 된다', () => {
    const fingerprints = (buildAssetLinks(PROD) as AssetLink[])[0].target
      .sha256_cert_fingerprints;
    expect(fingerprints).toHaveLength(1);
    expect(fingerprints[0]).toMatch(/^E3:32:B9:86/);
    // 빈 슬롯이 그대로 새어 나가지 않는지(null 이 배열에 섞이면 검증 실패).
    expect(fingerprints.every((value) => typeof value === 'string')).toBe(true);
  });
});
