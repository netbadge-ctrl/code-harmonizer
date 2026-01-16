import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Header } from '@/components/layout/Header';
import { CustomerList } from '@/components/admin/CustomerList';
import { CustomerDetail } from '@/components/admin/CustomerDetail';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { CreditRatioManagement } from '@/components/admin/CreditRatioManagement';
import { AdminView } from '@/types/admin';
import { cn } from '@/lib/utils';

const viewConfig: Record<AdminView, { title: string; description: string }> = {
  customers: { title: '客户管理', description: '查看和管理所有客户信息' },
  customerDetail: { title: '客户详情', description: '查看客户详细信息' },
  analytics: { title: '全局统计', description: '查看平台整体使用情况' },
  creditRatio: { title: '积分倍率', description: '配置不同模型的积分消耗倍率' },
  settings: { title: '系统设置', description: '管理后台系统配置' },
};

export function USS() {
  const [currentView, setCurrentView] = useState<AdminView>('customers');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleViewChange = (view: AdminView) => {
    setCurrentView(view);
    if (view !== 'customerDetail') {
      setSelectedCustomerId(null);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentView('customerDetail');
  };

  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setCurrentView('customers');
  };

  const renderView = () => {
    switch (currentView) {
      case 'customers':
        return <CustomerList onSelectCustomer={handleSelectCustomer} />;
      case 'customerDetail':
        if (selectedCustomerId) {
          return <CustomerDetail customerId={selectedCustomerId} onBack={handleBackToList} />;
        }
        return <CustomerList onSelectCustomer={handleSelectCustomer} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'creditRatio':
        return <CreditRatioManagement />;
      case 'settings':
        return (
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                系统设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">管理后台系统设置功能即将推出...</p>
            </CardContent>
          </Card>
        );
      default:
        return <CustomerList onSelectCustomer={handleSelectCustomer} />;
    }
  };

  const config = currentView === 'customerDetail' 
    ? viewConfig.customerDetail 
    : viewConfig[currentView] || viewConfig.customers;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-14" : "ml-48"
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

export default USS;
