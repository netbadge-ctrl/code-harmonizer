import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { MemberManagement } from '@/components/members/MemberManagement';
import { DepartmentManagement } from '@/components/departments/DepartmentTree';
import { UsageDashboard } from '@/components/usage/UsageDashboard';
import { ModelManagement } from '@/components/models/ModelManagement';
import { IpWhitelistConfig } from '@/components/security/IpWhitelistConfig';
import { SettingsView } from '@/components/settings/SettingsView';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { cn } from '@/lib/utils';

const viewConfig: Record<string, { title: string; description: string }> = {
  dashboard: { title: '控制台', description: '概览您的 AI Coding 服务状态' },
  members: { title: '成员管理', description: '管理组织成员及访问权限' },
  departments: { title: '组织架构', description: '查看和配置部门结构' },
  usage: { title: '用量统计', description: '分析 AI 服务使用情况' },
  models: { title: '模型管理', description: '配置可用的 AI 模型' },
  security: { title: '安全配置', description: '管理 IP 白名单规则' },
  settings: { title: '系统设置', description: '组织信息和系统配置' },
};

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // Set to true to see onboarding

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MemberManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'usage':
        return <UsageDashboard />;
      case 'models':
        return <ModelManagement />;
      case 'security':
        return <IpWhitelistConfig />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const config = viewConfig[currentView] || viewConfig.dashboard;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header 
          title={config.title}
          description={config.description}
        />
        <div className="p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
