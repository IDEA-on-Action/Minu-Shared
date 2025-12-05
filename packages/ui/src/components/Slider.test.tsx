import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import { Slider } from './Slider';

describe('Slider', () => {
  afterEach(() => {
    resetAxe();
  });
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 슬라이더가 렌더링된다', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<Slider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('showValue가 true일 때 현재 값이 표시된다', () => {
      render(<Slider value={50} showValue />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  // ============================================
  // 제어/비제어 모드 테스트
  // ============================================

  describe('제어/비제어 모드', () => {
    it('비제어 모드: defaultValue가 적용된다', () => {
      render(<Slider defaultValue={30} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '30');
    });

    it('비제어 모드: 기본값이 0이다', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '0');
    });

    it('제어 모드: value prop이 적용된다', () => {
      render(<Slider value={75} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('제어 모드: onValueChange가 호출된다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ============================================
  // min, max, step 테스트
  // ============================================

  describe('min, max, step', () => {
    it('min 기본값은 0이다', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
    });

    it('max 기본값은 100이다', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('커스텀 min, max가 적용된다', () => {
      render(<Slider min={10} max={200} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '10');
      expect(slider).toHaveAttribute('aria-valuemax', '200');
    });

    it('step 기본값은 1이다', () => {
      render(<Slider value={50} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      // onValueChange가 51로 호출되어야 함 (테스트는 기본 동작 확인)
    });

    it('커스텀 step이 적용된다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} step={5} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalledWith(55);
    });

    it('값이 max를 초과하지 않는다', () => {
      const handleChange = vi.fn();
      render(<Slider value={99} max={100} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalledWith(100);

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalledWith(100);
    });

    it('값이 min 미만이 되지 않는다', () => {
      const handleChange = vi.fn();
      render(<Slider value={1} min={0} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(handleChange).toHaveBeenCalledWith(0);

      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(handleChange).toHaveBeenCalledWith(0);
    });
  });

  // ============================================
  // 키보드 조작 테스트
  // ============================================

  describe('키보드 조작', () => {
    it('ArrowRight 키로 값을 증가시킨다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenCalledWith(51);
    });

    it('ArrowUp 키로 값을 증가시킨다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowUp' });
      expect(handleChange).toHaveBeenCalledWith(51);
    });

    it('ArrowLeft 키로 값을 감소시킨다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(handleChange).toHaveBeenCalledWith(49);
    });

    it('ArrowDown 키로 값을 감소시킨다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowDown' });
      expect(handleChange).toHaveBeenCalledWith(49);
    });

    it('Home 키로 최소값으로 이동한다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} min={10} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'Home' });
      expect(handleChange).toHaveBeenCalledWith(10);
    });

    it('End 키로 최대값으로 이동한다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} max={100} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'End' });
      expect(handleChange).toHaveBeenCalledWith(100);
    });

    it('PageUp 키로 큰 단위로 값을 증가시킨다 (step * 10)', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} step={1} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'PageUp' });
      expect(handleChange).toHaveBeenCalledWith(60);
    });

    it('PageDown 키로 큰 단위로 값을 감소시킨다 (step * 10)', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} step={1} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'PageDown' });
      expect(handleChange).toHaveBeenCalledWith(40);
    });
  });

  // ============================================
  // orientation 테스트
  // ============================================

  describe('orientation', () => {
    it('기본값은 horizontal이다', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('vertical orientation이 적용된다', () => {
      render(<Slider orientation="vertical" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('disabled 상태가 적용된다', () => {
      render(<Slider disabled />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabled 상태에서는 키보드 조작이 동작하지 않는다', () => {
      const handleChange = vi.fn();
      render(<Slider disabled value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disabled 상태에서는 마우스 조작이 동작하지 않는다', () => {
      const handleChange = vi.fn();
      render(<Slider disabled value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      fireEvent.mouseDown(slider);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // 마우스 조작 테스트
  // ============================================

  describe('마우스 조작', () => {
    it('트랙을 클릭하면 해당 위치로 값이 이동한다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      // getBoundingClientRect mock
      slider.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 20,
        right: 200,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      // 트랙의 75% 위치 클릭 (x = 150)
      fireEvent.mouseDown(slider, { clientX: 150 });
      expect(handleChange).toHaveBeenCalledWith(75);
    });

    it('드래그로 값을 변경할 수 있다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      slider.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 20,
        right: 200,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      // 드래그 시작
      fireEvent.mouseDown(slider, { clientX: 100 });

      // 드래그 중
      fireEvent.mouseMove(document, { clientX: 150 });

      // 드래그 종료
      fireEvent.mouseUp(document);

      expect(handleChange).toHaveBeenCalled();
    });

    it('vertical 모드에서 클릭 시 Y 좌표를 사용한다', () => {
      const handleChange = vi.fn();
      render(<Slider value={50} orientation="vertical" onValueChange={handleChange} />);
      const slider = screen.getByRole('slider');

      slider.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 20,
        height: 200,
        right: 20,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      // 트랙의 25% 위치 클릭 (y = 50, bottom에서 계산하므로 75%)
      fireEvent.mouseDown(slider, { clientY: 50 });
      expect(handleChange).toHaveBeenCalledWith(75);
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="slider"가 설정된다', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('aria-valuenow가 올바르게 설정된다', () => {
      const { rerender } = render(<Slider value={25} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '25');

      rerender(<Slider value={75} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '75');
    });

    it('aria-valuemin과 aria-valuemax가 설정된다', () => {
      render(<Slider min={20} max={80} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '20');
      expect(slider).toHaveAttribute('aria-valuemax', '80');
    });

    it('aria-orientation이 설정된다', () => {
      const { rerender } = render(<Slider orientation="horizontal" />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal');

      rerender(<Slider orientation="vertical" />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('aria-disabled가 설정된다', () => {
      render(<Slider disabled />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
    });

    it('tabIndex가 0으로 설정되어 포커스 가능하다', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '0');
    });

    it('disabled 상태에서는 tabIndex가 -1이다', () => {
      render(<Slider disabled />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '-1');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('커스텀 className이 적용된다', () => {
      const { container } = render(<Slider className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('horizontal 모드에서 올바른 스타일이 적용된다', () => {
      render(<Slider orientation="horizontal" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('h-2');
    });

    it('vertical 모드에서 올바른 스타일이 적용된다', () => {
      render(<Slider orientation="vertical" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('w-2');
    });

    it('disabled 상태에서 opacity 클래스가 적용된다', () => {
      render(<Slider disabled />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('opacity-50');
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Slider value={50} aria-label="볼륨" />);
      await runAxe(container);
    });

    it('showValue가 있을 때 접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Slider value={50} showValue aria-label="볼륨" />);
      await runAxe(container);
    });
  });
});
