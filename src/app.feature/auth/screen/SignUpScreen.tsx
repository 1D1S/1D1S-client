'use client';

import { Icon, StepIndicator, Text } from '@1d1s/design-system';
import { Form } from '@component/ui/Form';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
// 앱에서는 네이티브 다이얼로그로 위임하는 래퍼. DS ConfirmDialog 를 직접
// 쓰면 앱 안에서 이 모달만 웹 UI 로 떠 있었다.
import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import { getApiErrorCode } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { putToStorage } from '@module/api/presignedUpload';
import { useSignalAppReady } from '@module/hooks/useSignalAppReady';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { toast } from '@module/providers/toast';
import { authStorage } from '@module/utils/auth';
import { cn } from '@module/utils/cn';
import {
  normalizePhoneNumber,
  PHONE_NUMBER_DUPLICATE_MESSAGE,
} from '@module/utils/phoneNumber';
import { RETURN_TO_PARAM, sanitizeReturnTo } from '@module/utils/returnTo';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { authApi } from '../api/authApi';
import { BrandPanel } from '../components/BrandPanel';
import { useLogout } from '../hooks/useAuthMutations';
import { SignupFormValues, useSignUpForm } from '../hooks/useSignUpForm';
import { getLaunchStreakDay } from '../utils/streakDay';
import { Step1 } from './step-pages/Step1';
import { Step2 } from './step-pages/Step2';

type Step = 1 | 2;

const SIGN_UP_STEPS = [
  { id: 'profile', label: '프로필 정보' },
  { id: 'topics', label: '관심 카테고리' },
];

interface StepHeading {
  eyebrow: string;
  title: string;
  sub: string;
}

const STEP_HEADINGS: Record<Step, StepHeading> = {
  1: {
    eyebrow: 'STEP 01 / 02',
    title: '프로필을 알려주세요',
    sub: '또래·관심사 기반 챌린지 추천에 사용돼요',
  },
  2: {
    eyebrow: 'STEP 02 / 02',
    title: '어떤 챌린지에 관심 있으세요?',
    sub: '관심사 기반으로 첫 챌린지를 골라드릴게요',
  },
};

export function SignUpScreen(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useSignUpForm();
  const logout = useLogout();
  const [step, setStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showExitDialog, setShowExitDialog] = React.useState(false);
  const [streakDay] = React.useState<number>(() => getLaunchStreakDay());

  // 신규 가입은 앱이 부트스트랩 직후 여기로 바로 보낸다(홈을 거치지 않는다).
  // 그동안 네이티브 스플래시가 덮고 있으므로 이 화면도 랜딩 루트처럼
  // app_ready 를 쏴야 걷힌다. 폼은 서버 데이터 없이 즉시 그려진다.
  useSignalAppReady(true);
  useSignalPageReady('signup', true);

  // 뒤로가기(브라우저 back 버튼·앱 웹뷰 history back)를 가로채 회원가입 이탈
  // 확인 모달을 띄운다. 웹 헤더의 back 버튼(handleBack)은 앱에선 native-hide 라
  // 안 보이고, 브라우저 back 은 원래 이 화면 로직을 안 타 모달 없이 그냥
  // 나가졌다. 마운트 시 센티넬 히스토리 항목을 쌓고 popstate 마다 다시 쌓아
  // 페이지에 머무르며, step2→step1, step1→로그아웃 확인 모달로 보낸다.
  // (앱 네이티브 back 바가 native 네비게이션으로 직접 나가는 경로는 앱 세션에서
  //  웹뷰 history back 으로 태워야 이 가드가 함께 동작한다.)
  const stepRef = React.useRef(step);
  React.useEffect(() => {
    stepRef.current = step;
  }, [step]);
  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const onPopState = (): void => {
      window.history.pushState(null, '', window.location.href);
      if (stepRef.current === 2) {
        setStep(1);
        return;
      }
      setShowExitDialog(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const onSubmit = async (values: SignupFormValues): Promise<void> => {
    if (!authStorage.hasTokens()) {
      toast.error('로그인이 필요합니다.');
      router.replace('/login');
      return;
    }

    // 생년월일은 선택 항목 — 세 값이 모두 있을 때만 전송한다(부분 입력은 미전송).
    const birth =
      values.year && values.month && values.day
        ? `${values.year}-${values.month.padStart(2, '0')}-${values.day.padStart(2, '0')}`
        : undefined;

    setIsSubmitting(true);
    try {
      let profileImageKey: string | undefined;

      if (values.img) {
        const { data: presigned } = await authApi.getPresignedUrl({
          fileName: values.img.name,
          fileType: values.img.type,
        });
        await putToStorage(presigned.presignedUrl, values.img);
        profileImageKey = presigned.objectKey;
      }

      await authApi.completeSignUpInfo({
        nickname: values.nickname,
        // 선택 항목은 미입력 시 키를 넣지 않는다(undefined → JSON 에서 제외).
        phoneNumber: values.phoneNumber
          ? normalizePhoneNumber(values.phoneNumber)
          : undefined,
        job: values.job,
        birth,
        gender: values.gender,
        isPublic: values.isPublic,
        category: values.topics,
        profileImageKey,
      });

      toast.success('가입이 완료되었습니다!');
      // 홈/탐색의 프로필 가드(AppLayoutShell)는 sidebar.nickname 으로 가입
      // 완료를 판정한다. invalidateQueries(refetchType 기본 'active')는 /signup
      // 에서 사이드바 옵저버가 없어 refetch 를 안 걸고 stale(nickname 없음) 캐시가
      // 남아, 이동 시 다시 /signup 으로 튕겼다(버그). 이동 전에 refetch 로
      // 완료된 프로필을 캐시에 확정해 가드가 통과하게 한다.
      await queryClient.refetchQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
      // 로그인 → 프로필 설정으로 우회한 경우 원래 보던 경로로 복귀
      const returnTo = sanitizeReturnTo(
        new URLSearchParams(window.location.search).get(RETURN_TO_PARAM)
      );
      router.replace(returnTo ?? '/');
    } catch (error) {
      // 전화번호 중복(409, USER-010)은 토스트 대신 입력 단계의 필드
      // 에러로 노출해 사용자가 바로 수정할 수 있게 한다.
      if (getApiErrorCode(error) === 'USER-010') {
        form.setError('phoneNumber', {
          message: PHONE_NUMBER_DUPLICATE_MESSAGE,
        });
        setStep(1);
        return;
      }
      notifyApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = (): void => {
    if (step === 2) {
      setStep(1);
      return;
    }

    setShowExitDialog(true);
  };

  const handleExitConfirm = (): void => {
    // 토큰만 지우면 **웹에서만** 로그아웃된 상태가 된다. 앱은 네이티브 세션을
    // 따로 들고 있어(HybridShell) 곧바로 웹 세션을 복구해 버려 로그아웃이
    // 되돌아왔다. 설정 화면과 같은 로그아웃 경로를 탄다 — 서버 세션 정리와
    // 네이티브 쉘 통지(postNativeMessage({type:'logout'}))가 함께 돈다.
    setShowExitDialog(false);
    logout.mutate();
    router.replace('/');
  };

  const handleNextStep = async (): Promise<void> => {
    const stepOneValid = await form.trigger([
      'nickname',
      'phoneNumber',
      'year',
      'month',
      'day',
      'gender',
      'job',
    ]);

    if (!stepOneValid) {
      return;
    }

    setStep(2);
  };

  const heading = STEP_HEADINGS[step];

  return (
    <div
      className={cn(
        'grid min-h-screen w-full grid-cols-1 bg-white',
        'lg:grid-cols-[1.05fr_1fr]'
      )}
    >
      <ConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        tone="danger"
        icon="Close"
        title="정말 나가시겠어요?"
        description="정보를 입력하지 않으면 서비스 사용이 어렵습니다."
        confirmLabel="확인"
        cancelLabel="계속 입력하기"
        pendingLabel="처리 중..."
        isPending={logout.isPending}
        isDisabled={false}
        onCancel={() => setShowExitDialog(false)}
        onConfirm={handleExitConfirm}
      />

      <BrandPanel
        heading={'당신의 첫 챌린지가\n곧 시작됩니다'}
        subtitle={
          'SNS로 가입하셨네요!\n프로필 정보만 입력하면 바로 시작할 수 있어요.'
        }
        streakDay={streakDay}
      />

      <section className="relative flex min-h-screen flex-col">
        <header
          className={cn(
            // 앱(웹뷰)에선 네이티브 back bar 가 상단/뒤로가기를 대신하므로 이 웹
            // 모바일 헤더는 숨긴다(native-hide). 다른 화면(TopNav/BottomNav)과
            // 동일 규칙. 브라우저(비앱)·모바일에선 그대로 노출, 데스크톱은
            // lg:hidden. 진행 표시는 본문 StepIndicator 가 계속 담당.
            'flex h-14 items-center justify-between border-b border-gray-100',
            'native-hide bg-white px-4 lg:hidden'
          )}
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="가입 나가기"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              'text-gray-700 transition hover:bg-gray-100'
            )}
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <Text size="caption1" weight="regular" className="text-gray-500">
            {step}/2
          </Text>
        </header>

        <Text
          size="caption1"
          weight="regular"
          as="div"
          className={cn('absolute top-7 right-8 hidden text-gray-600 lg:block')}
        >
          이미 계정이 있으세요?{' '}
          <Link
            href="/login"
            className="text-main-800 ml-1 font-extrabold hover:underline"
          >
            로그인 →
          </Link>
        </Text>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div
              className={cn(
                'mx-auto flex w-full max-w-[460px] flex-1 flex-col',
                'px-5 pt-6 pb-10 lg:px-0 lg:pt-16'
              )}
            >
              <StepIndicator
                steps={SIGN_UP_STEPS}
                currentStep={step}
                size="sm"
                className="mb-5 w-full"
              />

              <Text
                size="caption2"
                weight="extrabold"
                as="div"
                className="text-main-800 mb-1.5 tracking-[0.2em]"
              >
                {heading.eyebrow}
              </Text>
              <Text
                size="display2"
                weight="extrabold"
                as="h1"
                className="block tracking-tight text-gray-900"
              >
                {heading.title}
              </Text>
              <Text
                size="body2"
                weight="regular"
                as="p"
                className="mt-2 mb-5 block text-gray-500"
              >
                {heading.sub}
              </Text>

              {step === 1 ? (
                <Step1
                  onNext={handleNextStep}
                  onExit={() => setShowExitDialog(true)}
                />
              ) : (
                <Step2
                  onPrev={() => setStep(1)}
                  onSubmit={() => void form.handleSubmit(onSubmit)()}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}
