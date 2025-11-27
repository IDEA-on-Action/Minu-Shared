import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: '입력 타입',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더',
    },
    error: {
      control: 'boolean',
      description: '에러 상태',
    },
    errorMessage: {
      control: 'text',
      description: '에러 메시지',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '텍스트를 입력하세요',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '비밀번호를 입력하세요',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '숫자를 입력하세요',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: '입력된 값',
  },
};

export const Error: Story = {
  args: {
    error: true,
    errorMessage: '필수 입력 항목입니다',
    placeholder: '필수 입력',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '비활성화됨',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input placeholder="기본 상태" />
      <Input placeholder="비활성화" disabled />
      <Input placeholder="에러 상태" error errorMessage="에러 메시지입니다" />
      <Input type="password" placeholder="비밀번호" />
    </div>
  ),
};
