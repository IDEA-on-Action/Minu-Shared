import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { type: 'single' },
  render: () => (
    <Accordion type="single" style={{ width: '400px' }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>첫 번째 항목</AccordionTrigger>
        <AccordionContent>
          이것은 첫 번째 아코디언 항목의 내용입니다. 자유롭게 내용을 추가할 수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>두 번째 항목</AccordionTrigger>
        <AccordionContent>
          이것은 두 번째 아코디언 항목의 내용입니다. 다양한 콘텐츠를 넣을 수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>세 번째 항목</AccordionTrigger>
        <AccordionContent>
          이것은 세 번째 아코디언 항목의 내용입니다. HTML 요소도 자유롭게 사용 가능합니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleType: Story = {
  args: { type: 'single' },
  render: () => (
    <Accordion type="single" defaultValue="item-1" style={{ width: '400px' }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>한 번에 하나만 열림</AccordionTrigger>
        <AccordionContent>
          Single 타입 아코디언은 한 번에 하나의 항목만 열 수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>다른 항목 선택 시 닫힘</AccordionTrigger>
        <AccordionContent>
          다른 항목을 클릭하면 이전에 열린 항목은 자동으로 닫힙니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>세 번째 항목</AccordionTrigger>
        <AccordionContent>
          이것이 Single 타입의 기본 동작입니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleType: Story = {
  args: { type: 'multiple' },
  render: () => (
    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} style={{ width: '400px' }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>여러 항목 동시 열기</AccordionTrigger>
        <AccordionContent>
          Multiple 타입 아코디언은 여러 항목을 동시에 열 수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>독립적으로 동작</AccordionTrigger>
        <AccordionContent>
          각 항목은 서로 독립적으로 열고 닫을 수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>세 번째 항목</AccordionTrigger>
        <AccordionContent>
          모든 항목을 동시에 열어둘 수도 있습니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithDisabled: Story = {
  args: { type: 'single' },
  render: () => (
    <Accordion type="single" style={{ width: '400px' }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>활성화된 항목</AccordionTrigger>
        <AccordionContent>
          이 항목은 정상적으로 동작합니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>비활성화된 항목</AccordionTrigger>
        <AccordionContent>
          이 내용은 표시되지 않습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>또 다른 활성 항목</AccordionTrigger>
        <AccordionContent>
          비활성화된 항목은 클릭할 수 없습니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Controlled: Story = {
  args: { type: 'single' },
  render: () => {
    const [value, setValue] = useState<string>('item-1');

    return (
      <div style={{ width: '400px' }}>
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            현재 열린 항목: {value || '없음'}
          </p>
        </div>
        <Accordion type="single" value={value} onValueChange={setValue}>
          <AccordionItem value="item-1">
            <AccordionTrigger>제어되는 아코디언</AccordionTrigger>
            <AccordionContent>
              이 아코디언은 외부 상태로 제어됩니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>상태 확인</AccordionTrigger>
            <AccordionContent>
              위의 상태 표시를 통해 현재 열린 항목을 확인할 수 있습니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>프로그래밍 제어</AccordionTrigger>
            <AccordionContent>
              setValue 함수를 통해 프로그래밍 방식으로 항목을 열고 닫을 수 있습니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
};

export const RichContent: Story = {
  args: { type: 'single' },
  render: () => (
    <Accordion type="single" style={{ width: '500px' }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>프로젝트 정보</AccordionTrigger>
        <AccordionContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <strong>이름:</strong> Minu Shared Packages
            </div>
            <div>
              <strong>버전:</strong> 1.2.0
            </div>
            <div>
              <strong>설명:</strong> Minu 서비스 간 공유 패키지 모노레포
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>패키지 목록</AccordionTrigger>
        <AccordionContent>
          <ul style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>@idea-on-action/ui - UI 컴포넌트</li>
            <li>@idea-on-action/utils - 유틸리티 함수</li>
            <li>@idea-on-action/types - 타입 정의</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>기술 스택</AccordionTrigger>
        <AccordionContent>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ padding: '4px 8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
              React
            </span>
            <span style={{ padding: '4px 8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
              TypeScript
            </span>
            <span style={{ padding: '4px 8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
              Tailwind CSS
            </span>
            <span style={{ padding: '4px 8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
              Storybook
            </span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQExample: Story = {
  args: { type: 'single' },
  render: () => (
    <div style={{ width: '600px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>자주 묻는 질문</h3>
      <Accordion type="single">
        <AccordionItem value="faq-1">
          <AccordionTrigger>Minu Shared는 무엇인가요?</AccordionTrigger>
          <AccordionContent>
            Minu Shared는 Minu 서비스(Find, Frame, Build, Keep) 간 공유되는 패키지들을 관리하는 모노레포 프로젝트입니다.
            UI 컴포넌트, 유틸리티 함수, 타입 정의 등을 포함합니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger>어떻게 설치하나요?</AccordionTrigger>
          <AccordionContent>
            pnpm을 사용하여 필요한 패키지를 설치할 수 있습니다. 예를 들어:
            <code style={{ display: 'block', marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              pnpm add @idea-on-action/ui @idea-on-action/utils
            </code>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionTrigger>어떤 컴포넌트가 포함되어 있나요?</AccordionTrigger>
          <AccordionContent>
            Button, Card, Input, Modal, Toast, Accordion, Tabs 등 27개의 UI 컴포넌트와
            10개의 커스텀 훅, 4개의 프리미티브 컴포넌트가 포함되어 있습니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-4">
          <AccordionTrigger>문서는 어디서 확인할 수 있나요?</AccordionTrigger>
          <AccordionContent>
            Storybook을 통해 모든 컴포넌트의 문서와 예제를 확인할 수 있습니다.
            또한 TypeDoc으로 생성된 API 문서도 제공됩니다.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
