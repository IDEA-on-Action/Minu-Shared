import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { Button } from './Button';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Tabs defaultValue="tab1" style={{ width: '400px' }}>
      <TabsList>
        <TabsTrigger value="tab1">탭 1</TabsTrigger>
        <TabsTrigger value="tab2">탭 2</TabsTrigger>
        <TabsTrigger value="tab3">탭 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          첫 번째 탭의 내용입니다.
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          두 번째 탭의 내용입니다.
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          세 번째 탭의 내용입니다.
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  args: {},
  render: () => (
    <Tabs defaultValue="home" style={{ width: '450px' }}>
      <TabsList>
        <TabsTrigger value="home">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈
          </span>
        </TabsTrigger>
        <TabsTrigger value="settings">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            설정
          </span>
        </TabsTrigger>
        <TabsTrigger value="profile">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            프로필
          </span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>홈</h3>
          <p style={{ color: '#666' }}>대시보드 콘텐츠가 여기에 표시됩니다.</p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>설정</h3>
          <p style={{ color: '#666' }}>애플리케이션 설정을 관리합니다.</p>
        </div>
      </TabsContent>
      <TabsContent value="profile">
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>프로필</h3>
          <p style={{ color: '#666' }}>사용자 프로필 정보를 확인합니다.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  args: {},
  render: () => (
    <Tabs defaultValue="available" style={{ width: '400px' }}>
      <TabsList>
        <TabsTrigger value="available">사용 가능</TabsTrigger>
        <TabsTrigger value="disabled" disabled>비활성화</TabsTrigger>
        <TabsTrigger value="another">다른 탭</TabsTrigger>
      </TabsList>
      <TabsContent value="available">
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          이 탭은 정상적으로 작동합니다.
        </div>
      </TabsContent>
      <TabsContent value="disabled">
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          이 내용은 표시되지 않습니다.
        </div>
      </TabsContent>
      <TabsContent value="another">
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          비활성화된 탭은 클릭할 수 없습니다.
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const Controlled: Story = {
  args: {},
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
      <div style={{ width: '500px' }}>
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            현재 활성 탭: {activeTab}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" onClick={() => setActiveTab('overview')}>개요로 이동</Button>
            <Button size="sm" onClick={() => setActiveTab('details')}>상세로 이동</Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="details">상세</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              프로젝트 개요 정보
            </div>
          </TabsContent>
          <TabsContent value="details">
            <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              상세 정보 및 통계
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              프로젝트 설정
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

export const RichContent: Story = {
  args: {},
  render: () => (
    <Tabs defaultValue="packages" style={{ width: '600px' }}>
      <TabsList>
        <TabsTrigger value="packages">패키지</TabsTrigger>
        <TabsTrigger value="components">컴포넌트</TabsTrigger>
        <TabsTrigger value="hooks">훅</TabsTrigger>
      </TabsList>
      <TabsContent value="packages">
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>패키지 목록</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <strong>@idea-on-action/ui</strong>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                React UI 컴포넌트 라이브러리 (27개 컴포넌트)
              </p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <strong>@idea-on-action/utils</strong>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                공통 유틸리티 함수 모음
              </p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <strong>@idea-on-action/types</strong>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                TypeScript 타입 정의
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="components">
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>주요 컴포넌트</h3>
          <ul style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Button - 다양한 스타일의 버튼</li>
            <li>Card - 카드 레이아웃 컴포넌트</li>
            <li>Modal - 모달 다이얼로그</li>
            <li>Toast - 알림 메시지</li>
            <li>Tabs - 탭 네비게이션</li>
            <li>Accordion - 아코디언 메뉴</li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="hooks">
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>커스텀 훅</h3>
          <ul style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>useControllableState - 제어/비제어 상태 관리</li>
            <li>useId - 고유 ID 생성</li>
            <li>useMediaQuery - 반응형 쿼리</li>
            <li>useDebounce - 디바운스 처리</li>
            <li>useLocalStorage - 로컬 스토리지 연동</li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const VerticalStyle: Story = {
  args: {},
  render: () => (
    <Tabs defaultValue="account" style={{ width: '500px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <TabsList style={{ flexDirection: 'column', height: 'auto', alignItems: 'stretch' }}>
          <TabsTrigger value="account" style={{ justifyContent: 'flex-start' }}>
            계정
          </TabsTrigger>
          <TabsTrigger value="security" style={{ justifyContent: 'flex-start' }}>
            보안
          </TabsTrigger>
          <TabsTrigger value="notifications" style={{ justifyContent: 'flex-start' }}>
            알림
          </TabsTrigger>
          <TabsTrigger value="billing" style={{ justifyContent: 'flex-start' }}>
            결제
          </TabsTrigger>
        </TabsList>
        <div style={{ flex: 1 }}>
          <TabsContent value="account">
            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>계정 설정</h3>
              <p style={{ color: '#666' }}>계정 정보를 관리합니다.</p>
            </div>
          </TabsContent>
          <TabsContent value="security">
            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>보안 설정</h3>
              <p style={{ color: '#666' }}>비밀번호 및 2단계 인증을 설정합니다.</p>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>알림 설정</h3>
              <p style={{ color: '#666' }}>알림 수신 방법을 선택합니다.</p>
            </div>
          </TabsContent>
          <TabsContent value="billing">
            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>결제 정보</h3>
              <p style={{ color: '#666' }}>결제 수단 및 청구 내역을 확인합니다.</p>
            </div>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  ),
};

export const ProjectExample: Story = {
  args: {},
  render: () => (
    <div style={{ width: '700px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Minu Shared 프로젝트</h2>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="structure">구조</TabsTrigger>
          <TabsTrigger value="status">상태</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div style={{ padding: '20px', marginTop: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ marginBottom: '12px' }}>
              Minu 서비스(Find, Frame, Build, Keep) 간 공유 패키지 모노레포
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 12px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '14px' }}>
                v1.2.0
              </span>
              <span style={{ padding: '6px 12px', backgroundColor: '#e8f5e9', borderRadius: '4px', fontSize: '14px' }}>
                Phase 6 완료
              </span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="structure">
          <div style={{ padding: '20px', marginTop: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <ul style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>packages/ui</strong> - React UI 컴포넌트 (27개)</li>
              <li><strong>packages/utils</strong> - 유틸리티 함수</li>
              <li><strong>packages/types</strong> - TypeScript 타입</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="status">
          <div style={{ padding: '20px', marginTop: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Phase 6: 고급 기능 & 통합</span>
                <span style={{ color: '#4caf50', fontWeight: 600 }}>100%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', backgroundColor: '#4caf50' }}></div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};
