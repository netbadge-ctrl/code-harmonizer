import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminView } from '@/types/admin';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'customers' as AdminView, label: '客户管理', icon: Building2 },
  { id: 'analytics' as AdminView, label: '数据看板', icon: BarChart3 },
  { id: 'creditRatio' as AdminView, label: '积分倍率', icon: Coins },
  { id: 'settings' as AdminView, label: '系统设置', icon: Settings },
];

export function AdminSidebar({ currentView, onViewChange, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-14" : "w-48"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 h-12 border-b border-sidebar-border">
        <img 
          src="/assets/logo.png" 
          alt="Logo" 
          className="w-7 h-7 rounded-md flex-shrink-0"
        />
        {!collapsed && (
          <div className="animate-fade-in flex items-center gap-1">
            <span className="text-sm font-semibold text-sidebar-foreground">智码云</span>
            <span className="text-xs text-destructive font-medium">USS</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                currentView === item.id || (currentView === 'customerDetail' && item.id === 'customers')
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Back to Console Button */}
      <div className="px-2 py-2 border-t border-sidebar-border">
        <button
          onClick={() => navigate('/console')}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
          title={collapsed ? "返回控制台" : undefined}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>返回控制台</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title={collapsed ? "展开菜单" : "收起菜单"}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
        </button>
      </div>
    </aside>
  );
}
