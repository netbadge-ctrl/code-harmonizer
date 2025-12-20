import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { MemberManagement } from '@/components/members/MemberManagement';
import { UsageDashboard } from '@/components/usage/UsageDashboard';
import { CallDetails } from '@/components/usage/CallDetails';
import { ModelManagement } from '@/components/models/ModelManagement';
import { IpWhitelistConfig } from '@/components/security/IpWhitelistConfig';
import { SettingsView } from '@/components/settings/SettingsView';
import { cn } from '@/lib/utils';

const viewConfig: Record<string, { title: string; description: string }> = {
  dashboard: { title: '概览', description: '概览您的 AI Coding 服务状态' },
  usage: { title: '用量看板', description: '分析 AI 服务使用情况' },
  callDetails: { title: '调用明细', description: '查看 API 调用详细记录' },
  models: { title: '模型管理', description: '配置可用的 AI 模型' },
  members: { title: '组织成员管理', description: '管理组织成员及访问权限' },
  security: { title: 'IP白名单', description: '管理 IP 白名单规则' },
  settings: { title: '系统设置', description: '系统配置' },
};

export function Console() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'usage':
        return <UsageDashboard />;
      case 'callDetails':
        return <CallDetails />;
      case 'models':
        return <ModelManagement />;
      case 'members':
        return <MemberManagement />;
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
}

export default Console;
