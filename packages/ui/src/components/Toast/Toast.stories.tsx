import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import { Button } from '../Button';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Button onClick={() => toast({ title: '기본 알림' })}>
        기본 토스트
      </Button>
    </div>
  );
}

function ToastVariantsDemo() {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '250px' }}>
      <Button
        variant="default"
        onClick={() => toast({ title: '기본 알림', description: '이것은 기본 토스트입니다.' })}
      >
        기본
      </Button>
      <Button
        variant="default"
        onClick={() =>
          toast({ title: '성공', description: '작업이 성공적으로 완료되었습니다.', variant: 'success' })
        }
      >
        성공
      </Button>
      <Button
        variant="default"
        onClick={() =>
          toast({ title: '경고', description: '주의가 필요한 상황입니다.', variant: 'warning' })
        }
      >
        경고
      </Button>
      <Button
        variant="default"
        onClick={() =>
          toast({ title: '오류', description: '작업 중 오류가 발생했습니다.', variant: 'error' })
        }
      >
        오류
      </Button>
      <Button
        variant="default"
        onClick={() =>
          toast({ title: '정보', description: '추가 정보를 확인하세요.', variant: 'info' })
        }
      >
        정보
      </Button>
    </div>
  );
}

function ToastWithActionDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: '파일 삭제',
          description: '정말로 이 파일을 삭제하시겠습니까?',
          variant: 'warning',
          action: {
            label: '실행 취소',
            onClick: () => console.log('취소됨'),
          },
        })
      }
    >
      액션이 있는 토스트
    </Button>
  );
}

function ToastDurationDemo() {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '250px' }}>
      <Button onClick={() => toast({ title: '짧은 알림 (2초)', duration: 2000 })}>
        2초 후 사라짐
      </Button>
      <Button onClick={() => toast({ title: '보통 알림 (5초)', duration: 5000 })}>
        5초 후 사라짐
      </Button>
      <Button onClick={() => toast({ title: '긴 알림 (10초)', duration: 10000 })}>
        10초 후 사라짐
      </Button>
      <Button onClick={() => toast({ title: '영구 알림', duration: 0 })}>
        자동으로 사라지지 않음
      </Button>
    </div>
  );
}

function ToastMultipleDemo() {
  const { toast } = useToast();

  const showMultiple = () => {
    toast({ title: '첫 번째 알림', variant: 'info' });
    setTimeout(() => toast({ title: '두 번째 알림', variant: 'success' }), 500);
    setTimeout(() => toast({ title: '세 번째 알림', variant: 'warning' }), 1000);
  };

  return (
    <Button onClick={showMultiple}>
      여러 토스트 표시
    </Button>
  );
}

function ToastPositionsDemo() {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '250px' }}>
      <Button onClick={() => toast({ title: '토스트 알림', description: '기본 위치는 top-right입니다.' })}>
        토스트 표시
      </Button>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
        위치 변경은 ToastProvider의 position prop으로 설정합니다.
      </p>
    </div>
  );
}

export const Default: Story = {
  args: { children: null },
  render: () => <ToastDemo />,
};

export const AllVariants: Story = {
  args: { children: null },
  render: () => <ToastVariantsDemo />,
};

export const Success: Story = {
  args: { children: null },
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        onClick={() =>
          toast({
            title: '저장 완료',
            description: '변경사항이 성공적으로 저장되었습니다.',
            variant: 'success',
          })
        }
      >
        성공 토스트
      </Button>
    );
  },
};

export const Warning: Story = {
  args: { children: null },
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        onClick={() =>
          toast({
            title: '주의 필요',
            description: '디스크 공간이 부족합니다.',
            variant: 'warning',
          })
        }
      >
        경고 토스트
      </Button>
    );
  },
};

export const Error: Story = {
  args: { children: null },
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        onClick={() =>
          toast({
            title: '오류 발생',
            description: '네트워크 연결을 확인해주세요.',
            variant: 'error',
          })
        }
      >
        오류 토스트
      </Button>
    );
  },
};

export const Info: Story = {
  args: { children: null },
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        onClick={() =>
          toast({
            title: '새로운 업데이트',
            description: '새 버전이 출시되었습니다.',
            variant: 'info',
          })
        }
      >
        정보 토스트
      </Button>
    );
  },
};

export const WithAction: Story = {
  args: { children: null },
  render: () => <ToastWithActionDemo />,
};

export const CustomDuration: Story = {
  args: { children: null },
  render: () => <ToastDurationDemo />,
};

export const MultipleToasts: Story = {
  args: { children: null },
  render: () => <ToastMultipleDemo />,
};

export const PositionDemo: Story = {
  args: { children: null },
  render: () => <ToastPositionsDemo />,
};

export const NotificationExample: Story = {
  args: { children: null },
  render: () => {
    const { toast } = useToast();

    const handleSave = () => {
      toast({
        title: '프로젝트 저장됨',
        description: 'Minu Shared 프로젝트가 성공적으로 저장되었습니다.',
        variant: 'success',
        duration: 3000,
      });
    };

    const handleDelete = () => {
      toast({
        title: '파일 삭제',
        description: '이 작업은 되돌릴 수 없습니다.',
        variant: 'warning',
        action: {
          label: '실행 취소',
          onClick: () => toast({ title: '삭제 취소됨', variant: 'info' }),
        },
        duration: 0,
      });
    };

    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button onClick={handleSave}>저장</Button>
        <Button variant="destructive" onClick={handleDelete}>삭제</Button>
      </div>
    );
  },
};
