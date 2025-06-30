// ChallengeCreateForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from 'react-hook-form';

import { useChallengeCreateForm } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { ChallengeCreateForm } from '@/app/challenge/create/step-pages/challenge-create-form';

// ✅ Jest mock을 먼저 선언하고 나중에 mockImplementation으로 제어
jest.mock('@/features/challenge/presentation/hooks/use-step-validation', () => ({
  useStepValidation: jest.fn(),
}));

// mock된 훅을 import
import { useStepValidation } from '@/features/challenge/presentation/hooks/use-step-validation';
const mockUseStepValidation = useStepValidation as jest.MockedFunction<typeof useStepValidation>;

// ✅ 테스트용 Wrapper 컴포넌트
function RenderWithFormProvider({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}): React.ReactElement {
  const methods = useChallengeCreateForm();

  return (
    <FormProvider {...methods}>
      <ChallengeCreateForm
        step={step}
        totalSteps={totalSteps}
        nextStep={jest.fn()}
        previousStep={jest.fn()}
      />
    </FormProvider>
  );
}

describe('ChallengeCreateForm', () => {
  beforeEach(() => {
    // 각 테스트 전에 mock을 초기화
    jest.clearAllMocks();
  });

  it('step 1 초기 UI에서 제목과 카테고리가 입력되기 전에는 다음 버튼이 비활성화된다', async () => {
    // 초기 상태에서는 validation이 false
    mockUseStepValidation.mockReturnValue(false);

    render(<RenderWithFormProvider step={1} totalSteps={4} />);

    // 챌린지 제목, 카테고리 필드 확인
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByText('카테고리')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: '다음' });

    // 초기 상태에서 버튼이 비활성화되는지 확인
    expect(nextButton).toBeDisabled();
  });

  it('step 1에서 제목과 카테고리를 입력하면 다음 버튼이 활성화된다', async () => {
    // 입력 후 validation이 true가 되도록 설정
    mockUseStepValidation.mockReturnValue(true);

    render(<RenderWithFormProvider step={1} totalSteps={4} />);

    const titleInput = screen.getByLabelText('제목');
    const nextButton = screen.getByRole('button', { name: '다음' });

    // 제목 입력
    await userEvent.type(titleInput, '새 챌린지');

    // 카테고리 선택 ("개발" 버튼 클릭)
    const devButton = screen.getByRole('radio', { name: /개발/ });
    await userEvent.click(devButton);

    // validation이 true를 반환하므로 버튼이 활성화되어야 함
    expect(nextButton).toBeEnabled();
  });

  it('validation이 실패할 때 다음 버튼이 비활성화된다', () => {
    // validation이 false를 반환하도록 설정
    mockUseStepValidation.mockReturnValue(false);

    render(<RenderWithFormProvider step={2} totalSteps={4} />);

    const nextButton = screen.getByRole('button', { name: '다음' });
    expect(nextButton).toBeDisabled();
  });
});

describe('ChallengeCreateForm - DOM 상태 확인', () => {
  it('초기 렌더링 시 폼 필드가 비어있는지 확인', async () => {
    mockUseStepValidation.mockReturnValue(false);

    render(<RenderWithFormProvider step={1} totalSteps={4} />);

    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    expect(titleInput.value).toBe('');

    // 카테고리가 선택되지 않았는지 확인
    const categoryRadios = screen.getAllByRole('radio');
    const isAnyCategoryChecked = categoryRadios.some(
      (radio) => (radio as HTMLInputElement).checked
    );
    expect(isAnyCategoryChecked).toBe(false);

    const nextButton = screen.getByRole('button', { name: '다음' });
    expect(nextButton).toBeDisabled();
  });
});

describe('ChallengeCreateForm - 사용자 인터랙션 테스트', () => {
  it('사용자가 필드를 채우면 validation 상태가 변경된다', async () => {
    // 초기에는 false, 나중에 true로 변경
    mockUseStepValidation.mockReturnValueOnce(false).mockReturnValue(true);

    const { rerender } = render(<RenderWithFormProvider step={1} totalSteps={4} />);

    const nextButton = screen.getByRole('button', { name: '다음' });
    expect(nextButton).toBeDisabled();

    // 입력 후 컴포넌트 재렌더링
    const titleInput = screen.getByLabelText('제목');
    await userEvent.type(titleInput, '새 챌린지');

    // validation 상태가 true로 변경된 후 재렌더링
    rerender(<RenderWithFormProvider step={1} totalSteps={4} />);

    expect(nextButton).toBeEnabled();
  });
});
