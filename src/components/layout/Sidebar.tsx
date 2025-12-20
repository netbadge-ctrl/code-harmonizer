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
  ChevronDown,
  Sparkles,
  KeyRound,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuGroups = [
  {
    id: 'access',
    label: '访问控制',
    items: [
      { id: 'dashboard', label: '概览', icon: LayoutDashboard },
      { id: 'members', label: '成员管理', icon: Users },
      { id: 'departments', label: '组织架构', icon: Building2 },
    ],
  },
  {
    id: 'service',
    label: '服务管理',
    items: [
      { id: 'models', label: '模型管理', icon: Boxes },
      { id: 'usage', label: '用量统计', icon: BarChart3 },
    ],
  },
  {
    id: 'security',
    label: '安全设置',
    items: [
      { id: 'security', label: 'IP 白名单', icon: Shield },
      { id: 'settings', label: '系统设置', icon: Settings },
    ],
  },
];

export function Sidebar({ currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['access', 'service', 'security']);

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
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <div className="w-7 h-7 rounded gradient-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-sm font-semibold text-foreground">智码云</span>
            <span className="text-xs text-muted-foreground ml-2">控制台</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
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
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                      currentView === item.id 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={collapsed ? "展开菜单" : "收起菜单"}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span>收起</span>}
        </button>
      </div>
    </aside>
  );
}