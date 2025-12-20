import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield, 
  Boxes,
  ChevronLeft,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: '控制台', icon: LayoutDashboard },
  { id: 'members', label: '成员管理', icon: Users },
  { id: 'departments', label: '组织架构', icon: Building2 },
  { id: 'usage', label: '用量统计', icon: BarChart3 },
  { id: 'models', label: '模型管理', icon: Boxes },
  { id: 'security', label: '安全配置', icon: Shield },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export function Sidebar({ currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-semibold text-sidebar-foreground">智码云</h1>
            <p className="text-xs text-sidebar-foreground/50">KSGC Enterprise</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full sidebar-item",
              currentView === item.id && "active"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={onToggleCollapse}
          className="w-full sidebar-item justify-center"
          title={collapsed ? "展开菜单" : "收起菜单"}
        >
          <ChevronLeft className={cn(
            "w-5 h-5 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span>收起菜单</span>}
        </button>
        <button className="w-full sidebar-item text-destructive/80 hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
}
