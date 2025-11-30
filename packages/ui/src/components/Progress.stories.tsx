import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: '진행률 값 (0-100)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '프로그레스 바 크기',
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'error'],
      description: '프로그레스 바 색상',
    },
    indeterminate: {
      control: 'boolean',
      description: '불확정 상태 (로딩 애니메이션)',
    },
    showLabel: {
      control: 'boolean',
      description: '라벨 표시 여부',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    showLabel: true,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    showLabel: true,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    showLabel: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const Small: Story = {
  args: {
    value: 60,
    size: 'sm',
    showLabel: true,
  },
};

export const Medium: Story = {
  args: {
    value: 60,
    size: 'md',
    showLabel: true,
  },
};

export const Large: Story = {
  args: {
    value: 60,
    size: 'lg',
    showLabel: true,
  },
};

export const Success: Story = {
  args: {
    value: 100,
    color: 'success',
    showLabel: true,
  },
};

export const Warning: Story = {
  args: {
    value: 60,
    color: 'warning',
    showLabel: true,
  },
};

export const Error: Story = {
  args: {
    value: 30,
    color: 'error',
    showLabel: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Small</div>
        <Progress value={65} size="sm" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Medium</div>
        <Progress value={65} size="md" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Large</div>
        <Progress value={65} size="lg" showLabel />
      </div>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Primary</div>
        <Progress value={65} color="primary" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Success</div>
        <Progress value={100} color="success" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Warning</div>
        <Progress value={60} color="warning" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Error</div>
        <Progress value={30} color="error" showLabel />
      </div>
    </div>
  ),
};

export const FileUpload: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
        파일 업로드 중...
      </div>
      <Progress value={45} showLabel aria-label="파일 업로드 진행률" />
    </div>
  ),
};

export const DownloadProgress: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>document.pdf (2.5 MB)</div>
        <Progress value={85} color="success" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>image.png (1.2 MB)</div>
        <Progress value={45} showLabel />
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>video.mp4 (15 MB)</div>
        <Progress value={12} showLabel />
      </div>
    </div>
  ),
};
