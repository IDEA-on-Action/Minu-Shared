import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '체크 상태 (제어 모드)',
    },
    defaultChecked: {
      control: 'boolean',
      description: '기본 체크 상태 (비제어 모드)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '스위치 크기',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    label: {
      control: 'text',
      description: '라벨 텍스트',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '알림 받기',
  },
};

export const Small: Story = {
  args: {
    label: '작은 스위치',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    label: '중간 스위치',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    label: '큰 스위치',
    size: 'lg',
  },
};

export const Checked: Story = {
  args: {
    label: '체크된 상태',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: '비활성화됨',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: '비활성화 (체크됨)',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    defaultChecked: false,
  },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          label="다크 모드"
        />
        <p style={{ fontSize: '14px', color: '#666' }}>
          현재 상태: {checked ? 'ON' : 'OFF'}
        </p>
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch size="sm" label="작은 스위치" defaultChecked />
      <Switch size="md" label="중간 스위치" defaultChecked />
      <Switch size="lg" label="큰 스위치" defaultChecked />
    </div>
  ),
};

export const SettingsExample: Story = {
  render: () => (
    <div style={{ width: '350px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>알림 설정</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Switch label="이메일 알림" defaultChecked />
        <Switch label="푸시 알림" defaultChecked />
        <Switch label="SMS 알림" />
        <Switch label="마케팅 정보 수신" disabled />
      </div>
    </div>
  ),
};
