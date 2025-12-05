import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

describe('Accordion', () => {
  afterEach(() => {
    resetAxe();
  });
  describe('기본 렌더링', () => {
    it('Accordion이 렌더링되어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(screen.getByText('항목 1')).toBeInTheDocument();
    });

    it('여러 AccordionItem이 렌더링되어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(screen.getByText('항목 1')).toBeInTheDocument();
      expect(screen.getByText('항목 2')).toBeInTheDocument();
    });
  });

  describe('단일 열기 모드 (type="single")', () => {
    it('초기에는 모든 항목이 닫혀있어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const trigger = screen.getByText('항목 1');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('트리거 클릭 시 항목이 열려야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      const trigger = screen.getByText('항목 1');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('내용 1')).toBeVisible();
    });

    it('다른 항목 클릭 시 이전 항목이 닫혀야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('항목 1');
      const trigger2 = screen.getByText('항목 2');

      fireEvent.click(trigger1);
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(trigger2);
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    it('같은 항목을 다시 클릭하면 닫혀야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('항목 1');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('다중 열기 모드 (type="multiple")', () => {
    it('여러 항목이 동시에 열릴 수 있어야 한다', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('항목 1');
      const trigger2 = screen.getByText('항목 2');

      fireEvent.click(trigger1);
      fireEvent.click(trigger2);

      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    it('항목을 개별적으로 닫을 수 있어야 한다', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('항목 1');
      const trigger2 = screen.getByText('항목 2');

      fireEvent.click(trigger1);
      fireEvent.click(trigger2);

      fireEvent.click(trigger1);

      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('제어 모드 (controlled)', () => {
    it('value prop으로 열린 항목을 제어할 수 있어야 한다 (single)', () => {
      render(
        <Accordion type="single" value="item-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('항목 1');
      const trigger2 = screen.getByText('항목 2');

      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    it('value prop으로 열린 항목들을 제어할 수 있어야 한다 (multiple)', () => {
      render(
        <Accordion type="multiple" value={['item-1', 'item-2']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('항목 1');
      const trigger2 = screen.getByText('항목 2');

      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    it('onValueChange 콜백이 호출되어야 한다 (single)', () => {
      const handleValueChange = vi.fn();
      render(
        <Accordion type="single" onValueChange={handleValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      fireEvent.click(screen.getByText('항목 1'));
      expect(handleValueChange).toHaveBeenCalledWith('item-1');
    });

    it('onValueChange 콜백이 호출되어야 한다 (multiple)', () => {
      const handleValueChange = vi.fn();
      render(
        <Accordion type="multiple" onValueChange={handleValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      fireEvent.click(screen.getByText('항목 1'));
      expect(handleValueChange).toHaveBeenCalledWith(['item-1']);
    });
  });

  describe('비제어 모드 (uncontrolled)', () => {
    it('defaultValue로 초기 열린 항목을 설정할 수 있어야 한다 (single)', () => {
      render(
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('항목 1')).toHaveAttribute('aria-expanded', 'true');
    });

    it('defaultValue로 초기 열린 항목들을 설정할 수 있어야 한다 (multiple)', () => {
      render(
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>항목 2</AccordionTrigger>
            <AccordionContent>내용 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('항목 1')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('항목 2')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('disabled 상태', () => {
    it('disabled 항목은 클릭할 수 없어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('항목 1');
      expect(trigger).toBeDisabled();

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('disabled 항목에 disabled 스타일이 적용되어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('항목 1');
      expect(trigger).toHaveClass('disabled:opacity-50');
    });
  });

  describe('접근성', () => {
    it('올바른 ARIA 속성이 적용되어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('항목 1');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-controls');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('트리거와 콘텐츠가 ID로 연결되어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('항목 1');
      fireEvent.click(trigger);

      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId!);

      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('내용 1');
    });

    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      await runAxe(container);
    });
  });

  describe('커스텀 스타일', () => {
    it('Accordion에 커스텀 className이 적용되어야 한다', () => {
      const { container } = render(
        <Accordion type="single" className="custom-accordion">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(container.firstChild).toHaveClass('custom-accordion');
    });

    it('AccordionItem에 커스텀 className이 적용되어야 한다', () => {
      render(
        <Accordion type="single">
          <AccordionItem value="item-1" className="custom-item">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(screen.getByText('항목 1').closest('div')).toHaveClass('custom-item');
    });
  });

  describe('ref 전달', () => {
    it('Accordion ref가 전달되어야 한다', () => {
      const ref = vi.fn();
      render(
        <Accordion type="single" ref={ref}>
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('AccordionTrigger ref가 전달되어야 한다', () => {
      const ref = vi.fn();
      render(
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger ref={ref}>항목 1</AccordionTrigger>
            <AccordionContent>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('AccordionContent ref가 전달되어야 한다', () => {
      const ref = vi.fn();
      render(
        <Accordion type="single" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>항목 1</AccordionTrigger>
            <AccordionContent ref={ref}>내용 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});
