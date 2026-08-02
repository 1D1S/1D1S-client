import React from 'react';

import { LegalPageShell } from '../components/LegalPageShell';

const EFFECTIVE_DATE = '2026년 7월 29일';
const SUPPORT_EMAIL = 'onedayonestreak@gmail.com';
const ACCOUNT_DELETION_FOOTER = [
  'Account deletion requests are also accepted by email at',
  `${SUPPORT_EMAIL}.`,
].join(' ');

const ACCOUNT_DELETION_SECTIONS: Array<{
  heading: string;
  body: React.ReactNode;
}> = [
  {
    heading: '앱에서 계정 삭제하기',
    body: `1. 1D1S 앱에서 소셜 계정으로 로그인합니다.
2. 마이페이지에서 설정을 선택합니다.
3. 설정 화면의 회원 탈퇴를 선택합니다.
4. 안내 내용을 확인한 뒤 회원 탈퇴를 확정합니다.`,
  },
  {
    heading: '앱을 이용할 수 없는 경우',
    body: (
      <>
        가입한 소셜 계정의 이메일 주소와 함께 아래 이메일로 계정 삭제를 요청해
        주세요.{'\n'}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
            '[1D1S] 계정 삭제 요청'
          )}`}
          className="font-semibold text-orange-500 underline underline-offset-2"
        >
          {SUPPORT_EMAIL}
        </a>
      </>
    ),
  },
  {
    heading: '삭제되는 데이터',
    body: (
      <>
        계정 정보, 프로필, 일지, 챌린지, 댓글 등 계정과 연결된 데이터가
        삭제됩니다. 회원 탈퇴를 확정하면 계정과 데이터가 즉시 영구 삭제되며
        복구할 수 없습니다.
      </>
    ),
  },
  {
    heading: '보관될 수 있는 데이터',
    body: (
      <>
        관련 법령에 따라 보관이 필요한 데이터는 법정 기간 동안 분리하여 보관한
        뒤 안전하게 삭제합니다. 자세한 내용은 개인정보 처리방침에서 확인할 수
        있습니다.
      </>
    ),
  },
];

export default function AccountDeletionScreen(): React.ReactElement {
  return (
    <LegalPageShell
      title="1D1S 계정 삭제 안내"
      description="1D1S 계정과 관련 데이터의 삭제를 요청하는 방법입니다."
      effectiveDate={EFFECTIVE_DATE}
      sections={ACCOUNT_DELETION_SECTIONS}
      footer={ACCOUNT_DELETION_FOOTER}
    />
  );
}
