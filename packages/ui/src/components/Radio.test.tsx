import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import { RadioGroup, Radio } from './Radio';

describe('Radio', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('RadioGroup과 Radio가 렌더링된다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('label이 렌더링된다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="라벨 텍스트" />
        </RadioGroup>
      );

      expect(screen.getByText('라벨 텍스트')).toBeInTheDocument();
    });

    it('description이 렌더링된다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="라벨" description="설명 텍스트" />
        </RadioGroup>
      );

      expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(
        <RadioGroup>
          <Radio ref={ref} value="option1" />
        </RadioGroup>
      );
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // ============================================
  // 제어/비제어 모드 테스트
  // ============================================

  describe('제어/비제어 모드', () => {
    it('비제어 모드: 클릭 시 선택 상태가 변경된다', () => {
      render(
        <RadioGroup defaultValue="option1">
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      const radio1 = screen.getByLabelText('옵션 1');
      const radio2 = screen.getByLabelText('옵션 2');

      expect(radio1).toBeChecked();
      expect(radio2).not.toBeChecked();

      fireEvent.click(radio2);
      expect(radio1).not.toBeChecked();
      expect(radio2).toBeChecked();
    });

    it('비제어 모드: defaultValue가 적용된다', () => {
      render(
        <RadioGroup defaultValue="option2">
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      expect(screen.getByLabelText('옵션 2')).toBeChecked();
    });

    it('제어 모드: value prop이 적용된다', () => {
      render(
        <RadioGroup value="option2">
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      expect(screen.getByLabelText('옵션 2')).toBeChecked();
    });

    it('제어 모드: onValueChange가 호출된다', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup value="option1" onValueChange={handleChange}>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('옵션 2'));
      expect(handleChange).toHaveBeenCalledWith('option2');
    });
  });

  // ============================================
  // 키보드 네비게이션 테스트
  // ============================================

  describe('키보드 네비게이션', () => {
    it('ArrowDown/ArrowRight로 다음 옵션으로 이동한다', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
          <Radio value="option3" label="옵션 3" />
        </RadioGroup>
      );

      const radiogroup = screen.getByRole('radiogroup');
      fireEvent.keyDown(radiogroup, { key: 'ArrowDown' });
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('ArrowUp/ArrowLeft로 이전 옵션으로 이동한다', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup defaultValue="option2" onValueChange={handleChange}>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
          <Radio value="option3" label="옵션 3" />
        </RadioGroup>
      );

      const radiogroup = screen.getByRole('radiogroup');
      fireEvent.keyDown(radiogroup, { key: 'ArrowUp' });
      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('마지막에서 ArrowDown 시 처음으로 이동한다', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup defaultValue="option3" onValueChange={handleChange}>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
          <Radio value="option3" label="옵션 3" />
        </RadioGroup>
      );

      const radiogroup = screen.getByRole('radiogroup');
      fireEvent.keyDown(radiogroup, { key: 'ArrowDown' });
      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('처음에서 ArrowUp 시 마지막으로 이동한다', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
          <Radio value="option3" label="옵션 3" />
        </RadioGroup>
      );

      const radiogroup = screen.getByRole('radiogroup');
      fireEvent.keyDown(radiogroup, { key: 'ArrowUp' });
      expect(handleChange).toHaveBeenCalledWith('option3');
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('RadioGroup disabled 시 모든 라디오가 비활성화된다', () => {
      render(
        <RadioGroup disabled>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      expect(screen.getByLabelText('옵션 1')).toBeDisabled();
      expect(screen.getByLabelText('옵션 2')).toBeDisabled();
    });

    it('개별 Radio disabled가 적용된다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" disabled />
        </RadioGroup>
      );

      expect(screen.getByLabelText('옵션 1')).not.toBeDisabled();
      expect(screen.getByLabelText('옵션 2')).toBeDisabled();
    });

    it('disabled 상태에서 클릭해도 변경되지 않는다', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup disabled onValueChange={handleChange}>
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('옵션 1'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // error 상태 테스트
  // ============================================

  describe('error', () => {
    it('error 상태에서 aria-invalid가 true이다', () => {
      render(
        <RadioGroup error>
          <Radio value="option1" label="옵션 1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
    });

    it('error 상태에서 라벨에 에러 스타일이 적용된다', () => {
      render(
        <RadioGroup error>
          <Radio value="option1" label="에러 옵션" />
        </RadioGroup>
      );

      const label = screen.getByText('에러 옵션');
      expect(label).toHaveClass('text-destructive');
    });
  });

  // ============================================
  // orientation 테스트
  // ============================================

  describe('orientation', () => {
    it('vertical orientation이 기본값이다', () => {
      render(
        <RadioGroup data-testid="radiogroup">
          <Radio value="option1" label="옵션 1" />
        </RadioGroup>
      );

      const group = screen.getByTestId('radiogroup');
      expect(group).toHaveAttribute('aria-orientation', 'vertical');
      expect(group).toHaveClass('flex-col');
    });

    it('horizontal orientation이 적용된다', () => {
      render(
        <RadioGroup orientation="horizontal" data-testid="radiogroup">
          <Radio value="option1" label="옵션 1" />
        </RadioGroup>
      );

      const group = screen.getByTestId('radiogroup');
      expect(group).toHaveAttribute('aria-orientation', 'horizontal');
      expect(group).toHaveClass('flex-row');
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="radiogroup" 속성이 있다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="옵션 1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('label을 클릭하면 라디오가 선택된다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="클릭 라벨" />
        </RadioGroup>
      );

      const label = screen.getByText('클릭 라벨');
      fireEvent.click(label);
      expect(screen.getByRole('radio')).toBeChecked();
    });

    it('aria-describedby가 description과 연결된다', () => {
      render(
        <RadioGroup>
          <Radio value="option1" label="라벨" description="설명" />
        </RadioGroup>
      );

      const radio = screen.getByRole('radio');
      const description = screen.getByText('설명');
      expect(radio).toHaveAttribute('aria-describedby', description.id);
    });

    it('name 속성이 모든 라디오에 적용된다', () => {
      render(
        <RadioGroup name="my-group">
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'my-group');
      });
    });
  });

  // ============================================
  // 에러 처리 테스트
  // ============================================

  describe('에러 처리', () => {
    it('RadioGroup 없이 Radio 사용 시 에러가 발생한다', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<Radio value="test" />)).toThrow(
        'Radio 컴포넌트는 RadioGroup 내부에서 사용해야 합니다.'
      );

      consoleError.mockRestore();
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('RadioGroup에 커스텀 className이 병합된다', () => {
      render(
        <RadioGroup className="custom-class" data-testid="radiogroup">
          <Radio value="option1" label="옵션 1" />
        </RadioGroup>
      );

      const group = screen.getByTestId('radiogroup');
      expect(group).toHaveClass('custom-class');
      expect(group).toHaveClass('flex');
    });

    it('Radio에 커스텀 className이 병합된다', () => {
      const { container } = render(
        <RadioGroup>
          <Radio value="option1" label="옵션 1" className="custom-radio" />
        </RadioGroup>
      );

      const radioWrapper = container.querySelector('.custom-radio');
      expect(radioWrapper).toBeInTheDocument();
      expect(radioWrapper).toHaveClass('flex');
    });
  });

  describe('axe 접근성 테스트', () => {
    afterEach(() => {
      resetAxe();
    });

    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <RadioGroup defaultValue="option1">
          <Radio value="option1" label="옵션 1" />
          <Radio value="option2" label="옵션 2" />
        </RadioGroup>
      );
      await runAxe(container);
    });
  });
});
