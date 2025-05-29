'use client';
import { OdosButton } from '@/shared/components/odos-ui/button';
import {
  OdosSelect,
  OdosSelectContent,
  OdosSelectItem,
  OdosSelectTrigger,
  OdosSelectValue,
} from '@/shared/components/odos-ui/dropdown';
import { OdosImagePicker } from '@/shared/components/odos-ui/impage-picker';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosTextField } from '@/shared/components/odos-ui/text-field';
import { OdosToggle } from '@/shared/components/odos-ui/toggle';

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <div className="w-full">menu</div>
        <OdosPageBackground className="min-h-screen min-w-150 px-5">
          <OdosSpacing className="h-20" />
          <OdosPageTitle title="1D1S" subtitle="추가 정보 입력" variant="withSubtitle" />

          <OdosSpacing className="h-20" />
          <OdosImagePicker />

          <OdosSpacing className="h-10" />

          <OdosTextField
            label="닉네임"
            placeholder="닉네임을 입력해주세요."
            id="nickname"
            className="w-135"
          />

          <OdosSpacing className="h-8.5" />

          <div className="flex w-135 flex-col gap-0.5">
            <OdosLabel size="body2" weight="bold">
              생년월일
            </OdosLabel>
            <div className="flex w-full flex-row justify-between">
              <OdosSelect>
                <OdosSelectTrigger>
                  <OdosSelectValue placeholder="연도" />
                </OdosSelectTrigger>
                <OdosSelectContent>
                  <OdosSelectItem value="1999">1999</OdosSelectItem>
                </OdosSelectContent>
              </OdosSelect>
              <OdosSelect>
                <OdosSelectTrigger>
                  <OdosSelectValue placeholder="월" />
                </OdosSelectTrigger>
                <OdosSelectContent>
                  <OdosSelectItem value="1">1</OdosSelectItem>
                </OdosSelectContent>
              </OdosSelect>
              <OdosSelect>
                <OdosSelectTrigger>
                  <OdosSelectValue placeholder="일" />
                </OdosSelectTrigger>
                <OdosSelectContent>
                  <OdosSelectItem value="1">1</OdosSelectItem>
                </OdosSelectContent>
              </OdosSelect>
            </div>
          </div>

          <OdosSpacing className="h-10" />
          <div className="flex w-135 flex-col gap-0.5">
            <OdosLabel size="body2" weight="bold">
              성별
            </OdosLabel>
            <OdosSelect>
              <OdosSelectTrigger>
                <OdosSelectValue placeholder="성별" />
              </OdosSelectTrigger>
              <OdosSelectContent>
                <OdosSelectItem value="남성">남성</OdosSelectItem>
                <OdosSelectItem value="여성">여성</OdosSelectItem>
              </OdosSelectContent>
            </OdosSelect>
          </div>

          <OdosSpacing className="h-10" />
          <div className="flex w-135 flex-col gap-0.5">
            <OdosLabel size="body2" weight="bold">
              직업
            </OdosLabel>
            <OdosSelect>
              <OdosSelectTrigger>
                <OdosSelectValue placeholder="직업" />
              </OdosSelectTrigger>
              <OdosSelectContent>
                <OdosSelectItem value="개발자">개발자</OdosSelectItem>
              </OdosSelectContent>
            </OdosSelect>
          </div>

          <OdosSpacing className="h-10" />
          <div className="flex w-135 flex-col gap-0.5">
            <OdosLabel size="body2" weight="bold">
              관심 카테고리
            </OdosLabel>
            <div className="flex flex-wrap gap-x-2.5 gap-y-2.5">
              <OdosToggle>개발</OdosToggle>
              <OdosToggle>디자인</OdosToggle>
            </div>
          </div>

          <OdosSpacing className="h-17.5" />
          <OdosButton className="w-full min-w-140">가입하기</OdosButton>
        </OdosPageBackground>
        <div className="w-full" />
      </div>
    </div>
  );
}
