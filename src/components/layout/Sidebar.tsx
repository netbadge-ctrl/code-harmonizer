import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Boxes,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// 独立菜单项
const standaloneItems = [
  { id: 'dashboard', label: '概览', icon: LayoutDashboard },
];

const menuGroups = [
  {
    id: 'statistics',
    label: '数据统计',
    items: [
      { id: 'usage', label: '用量看板', icon: BarChart3 },
      { id: 'callDetails', label: '调用明细', icon: FileText },
    ],
  },
  {
    id: 'service',
    label: '服务管理',
    items: [
      { id: 'models', label: '模型管理', icon: Boxes },
      { id: 'members', label: '组织成员管理', icon: Users },
      { id: 'security', label: 'IP白名单', icon: Shield },
      { id: 'settings', label: '系统设置', icon: Settings },
    ],
  },
];

export function Sidebar({ currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['statistics', 'service']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-14" : "w-48"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 h-12 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex items-center gap-1">
            <span className="text-sm font-semibold text-sidebar-foreground">智码云</span>
            <span className="text-xs text-sidebar-muted">控制台</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
      {/* 独立菜单项 - 概览 */}
        <div className="px-2 mb-1">
          {standaloneItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded text-sm font-semibold transition-colors",
                currentView === item.id 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              {!collapsed && <span>{item.label}</span>}
              {collapsed && <item.icon className="w-4 h-4 flex-shrink-0 mx-auto" />}
            </button>
          ))}
        </div>

        {menuGroups.map((group) => (
          <div key={group.id} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-sidebar-foreground hover:text-sidebar-foreground transition-colors"
              >
                <span>{group.label}</span>
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform",
                  expandedGroups.includes(group.id) ? "" : "-rotate-90"
                )} />
              </button>
            )}
            
            {(collapsed || expandedGroups.includes(group.id)) && (
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors",
                      currentView === item.id 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                        : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {!collapsed && <span>{item.label}</span>}
                    {collapsed && <item.icon className="w-4 h-4 flex-shrink-0 mx-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

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