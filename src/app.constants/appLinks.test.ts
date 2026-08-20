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

  it('업로드 키와 Play 앱 서명 키 지문을 모두 싣는다', () => {
    const fingerprints = (buildAssetLinks(PROD) as AssetLink[])[0].target
      .sha256_cert_fingerprints;
    // 하나만 있으면 한쪽 설치 경로가 검증에 실패한다 — 업로드 키만이면
    // 스토어 설치본이, 앱 서명 키만이면 로컬 APK 가 막힌다.
    expect(fingerprints).toEqual([
      'E3:32:B9:86:FD:C8:0E:A0:67:B9:71:A7:E7:A5:3A:FE:8B:BB:92:21:47:6C:70:36:7A:96:D5:C5:54:7C:00:14',
      '75:DA:D6:EC:C2:12:33:B8:C9:E3:DE:22:46:CE:A3:7F:41:BC:FB:66:99:7D:2A:7B:23:0F:98:9E:F1:78:32:8F',
    ]);
  });

  it('지문 형식이 Google 이 받는 대문자 콜론 구분 SHA-256 이다', () => {
    const fingerprints = (buildAssetLinks(PROD) as AssetLink[])[0].target
      .sha256_cert_fingerprints;
    fingerprints.forEach((value) => {
      // 32바이트 = 콜론으로 이어진 2자리 16진수 32개.
      expect(value).toMatch(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
    });
  });

  it('relation 은 handle_all_urls 한 가지다', () => {
    expect((buildAssetLinks(PROD) as AssetLink[])[0].relation).toEqual([
      'delegate_permission/common.handle_all_urls',
    ]);
  });
});
