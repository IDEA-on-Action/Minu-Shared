import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: '350px' }}>
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명이 여기에 표시됩니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>카드 내용입니다. 다양한 정보를 표시할 수 있습니다.</p>
      </CardContent>
      <CardFooter>
        <Button>액션</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card style={{ width: '300px', padding: '16px' }}>
      <p>간단한 카드 내용</p>
    </Card>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Card style={{ width: '350px' }}>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>알림 수신 방법을 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" defaultChecked />
            이메일 알림
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" />
            SMS 알림
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" defaultChecked />
            푸시 알림
          </label>
        </div>
      </CardContent>
      <CardFooter style={{ gap: '8px' }}>
        <Button variant="outline">취소</Button>
        <Button>저장</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card style={{ width: '300px' }}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            👤
          </div>
          <div>
            <CardTitle>홍길동</CardTitle>
            <CardDescription>개발자</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: '14px', color: '#666' }}>
          안녕하세요! Minu 팀에서 개발을 담당하고 있습니다.
        </p>
      </CardContent>
      <CardFooter style={{ gap: '8px' }}>
        <Button variant="outline" size="sm">메시지</Button>
        <Button size="sm">팔로우</Button>
      </CardFooter>
    </Card>
  ),
};
