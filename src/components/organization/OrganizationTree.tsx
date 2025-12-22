import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  Users, 
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDepartments, mockModels } from '@/data/mockData';
import { Department } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

interface TreeNodeProps {
  department: Department;
  level: number;
  expanded: Set<string>;
  selected: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  searchQuery: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  department,
  level,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
  searchQuery,
}) => {
  const isExpanded = expanded.has(department.id);
  const isSelected = selected.has(department.id);
  const hasChildren = department.children && department.children.length > 0;
  
  // Filter by search query
  const matchesSearch = department.name.toLowerCase().includes(searchQuery.toLowerCase());
  const hasMatchingChildren = department.children?.some(child => 
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.children?.some(grandChild => grandChild.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (searchQuery && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

  // Support up to 3 levels (level 0, 1, 2 = 3 levels total)
  if (level >= 3) return null;

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center gap-2 py-2.5 px-3 rounded-lg transition-colors cursor-pointer",
          isSelected ? "bg-primary/10" : "hover:bg-muted/50",
          matchesSearch && searchQuery ? "ring-1 ring-primary/30" : ""
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onToggleSelect(department.id)}
      >
        {/* Expand/Collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            hasChildren && onToggleExpand(department.id);
          }}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded hover:bg-muted",
            !hasChildren && "invisible"
          )}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(department.id)}
          onClick={(e) => e.stopPropagation()}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        {/* Department icon */}
        <Building2 className="w-4 h-4 text-primary" />

        {/* Department name */}
        <span className="font-medium text-foreground flex-1">{department.name}</span>

        {/* Member count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{department.memberCount}人</span>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {department.children?.map(child => (
            <TreeNode
              key={child.id}
              department={child}
              level={level + 1}
              expanded={expanded}
              selected={selected}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function OrganizationTree() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['dept-1', 'dept-1-2']));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Dialog states
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Sync status - in real app this would come from backend/localStorage
  // Authorization is persistent once done, only needs re-auth if identity source changes
  const [isAuthorized, setIsAuthorized] = useState(() => {
    // Check localStorage for existing authorization
    const stored = localStorage.getItem('org_sync_authorized');
    return stored === 'true';
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('org_last_sync_time');
  });
  const [authorizedIdentitySource, setAuthorizedIdentitySource] = useState<string | null>(() => {
    return localStorage.getItem('org_authorized_identity_source');
  });
  
  // Model configuration for selected departments
  const [modelConfig, setModelConfig] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    mockModels.forEach(m => {
      initial[m.id] = false;
    });
    return initial;
  });
  const [aiServiceEnabled, setAiServiceEnabled] = useState(true);

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  // Helper to get all descendant IDs of a department
  const getAllDescendantIds = (dept: Department): string[] => {
    const ids: string[] = [];
    if (dept.children) {
      for (const child of dept.children) {
        ids.push(child.id);
        ids.push(...getAllDescendantIds(child));
      }
    }
    return ids;
  };

  // Find a department by ID in the tree
  const findDepartment = (depts: Department[], id: string): Department | null => {
    for (const dept of depts) {
      if (dept.id === id) return dept;
      if (dept.children) {
        const found = findDepartment(dept.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    const dept = findDepartment(departments, id);
    
    if (newSelected.has(id)) {
      // Deselect this and all descendants
      newSelected.delete(id);
      if (dept) {
        const descendantIds = getAllDescendantIds(dept);
        descendantIds.forEach(descId => newSelected.delete(descId));
      }
    } else {
      // Select this and all descendants
      newSelected.add(id);
      if (dept) {
        const descendantIds = getAllDescendantIds(dept);
        descendantIds.forEach(descId => newSelected.add(descId));
      }
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    const getAllIds = (depts: Department[]): string[] => {
      return depts.flatMap(d => [d.id, ...getAllIds(d.children || [])]);
    };
    if (selected.size > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(getAllIds(departments)));
    }
  };

  const handleInitSync = () => {
    setShowAuthDialog(true);
  };

  const handleConfirmAuth = async () => {
    setIsSyncing(true);
    setShowAuthDialog(false);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const syncTime = new Date().toLocaleString('zh-CN');
    const currentIdentitySource = 'wps365'; // In real app, this would come from org settings
    
    setIsAuthorized(true);
    setLastSyncTime(syncTime);
    setAuthorizedIdentitySource(currentIdentitySource);
    
    // Persist authorization state
    localStorage.setItem('org_sync_authorized', 'true');
    localStorage.setItem('org_last_sync_time', syncTime);
    localStorage.setItem('org_authorized_identity_source', currentIdentitySource);
    
    setIsSyncing(false);
    
    toast({
      title: '组织架构同步成功',
      description: '已授权并完成首次同步，系统将在每天 0:00 和 12:00 自动同步',
    });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const syncTime = new Date().toLocaleString('zh-CN');
    setLastSyncTime(syncTime);
    localStorage.setItem('org_last_sync_time', syncTime);
    setIsSyncing(false);
    
    toast({
      title: '同步完成',
      description: '组织架构已更新至最新状态',
    });
  };

  const updateDepartments = (
    depts: Department[],
    ids: Set<string>,
    updater: (d: Department) => Department
  ): Department[] => {
    return depts.map(d => {
      const updated = ids.has(d.id) ? updater(d) : d;
      return {
        ...updated,
        children: d.children ? updateDepartments(d.children, ids, updater) : [],
      };
    });
  };

  const handleSaveModelConfig = () => {
    if (selected.size === 0) {
      toast({ title: '请先选择部门', variant: 'destructive' });
      return;
    }

    const enabledModels = Object.entries(modelConfig)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => id);
    
    setDepartments(prev => 
      updateDepartments(prev, selected, d => ({
        ...d,
        allowedModels: enabledModels,
        aiEnabled: aiServiceEnabled && enabledModels.length > 0,
      }))
    );
    
    setSelected(new Set());
    
    toast({
      title: '配置已保存',
      description: `已为 ${selected.size} 个部门更新模型权限`,
    });
  };

  // Get selected department names for display
  const getSelectedDeptNames = (): string[] => {
    const names: string[] = [];
    const collect = (depts: Department[]) => {
      depts.forEach(d => {
        if (selected.has(d.id)) names.push(d.name);
        if (d.children) collect(d.children);
      });
    };
    collect(departments);
    return names.slice(0, 3);
  };

  // Not authorized yet - show authorization prompt
  if (!isAuthorized) {
    return (
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-8 text-center bg-card">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
          <h3 className="text-xl font-semibold text-foreground mb-3">同步企业组织架构</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            首次使用需要授权同步企业组织架构。授权后，系统将在每天 0:00 和 12:00 自动同步两次组织架构数据。
          </p>
          <Button 
            size="lg" 
            onClick={handleInitSync}
            disabled={isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                同步中...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                授权并同步
              </>
            )}
          </Button>
        </div>

        {/* Auth Confirmation Dialog */}
        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>授权同步组织架构</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>您即将授权系统同步企业组织架构数据，请确认以下信息：</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>系统将获取您企业的部门结构和人员信息</li>
                  <li>同步后，系统将在每天 0:00 和 12:00 自动更新</li>
                  <li>您可以随时手动触发同步</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAuth}>
                确认授权
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  const selectedNames = getSelectedDeptNames();

  return (
    <div className="space-y-4">
      {/* Header with sync info - moved next to button */}
      <div className="flex items-center justify-end gap-4">
        {lastSyncTime && (
          <span className="text-sm text-muted-foreground">
            上次同步: {lastSyncTime} · 每日 0:00、12:00 自动同步
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          {isSyncing ? '同步中...' : '立即同步'}
        </Button>
      </div>

      {/* Main content - split layout */}
      <div className="flex gap-4">
        {/* Left Panel - Organization Tree */}
        <div className="flex-1 border border-border rounded-lg bg-card overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="按部门名称检索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selected.size > 0 ? '取消全选' : '全选'}
              </Button>
            </div>
            {selected.size > 0 && (
              <div className="mt-2 text-sm text-primary">
                已选择 {selected.size} 个部门
              </div>
            )}
          </div>

          {/* Tree */}
          <div className="p-4 max-h-[500px] overflow-y-auto">
            <div className="space-y-0.5">
              {departments.map(dept => (
                <TreeNode
                  key={dept.id}
                  department={dept}
                  level={0}
                  expanded={expanded}
                  selected={selected}
                  onToggleExpand={handleToggleExpand}
                  onToggleSelect={handleToggleSelect}
                  searchQuery={searchQuery}
                />
              ))}
            </div>

            {departments.length === 0 && (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">暂无组织架构数据</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Model Configuration */}
        <div className="w-80 border border-border rounded-lg bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground">模型配置</h3>
            {selected.size > 0 ? (
              <p className="text-sm text-muted-foreground mt-1">
                为 {selectedNames.join('、')}{selected.size > 3 ? ` 等 ${selected.size} 个部门` : ''} 配置可用模型
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                请在左侧选择要配置的部门
              </p>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {/* AI Service Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">AI 服务</p>
                <p className="text-xs text-muted-foreground">
                  {aiServiceEnabled ? '已开通' : '已关闭'}
                </p>
              </div>
              <Switch
                checked={aiServiceEnabled}
                onCheckedChange={setAiServiceEnabled}
                disabled={selected.size === 0}
              />
            </div>

            {/* Model List */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground mb-2">可用模型</p>
              {mockModels.filter(m => m.enabled).map(model => (
                <div
                  key={model.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    modelConfig[model.id] ? "border-primary bg-primary/5" : "border-border",
                    selected.size === 0 && "opacity-50"
                  )}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </div>
                  <Checkbox
                    checked={modelConfig[model.id] || false}
                    onCheckedChange={(checked) => 
                      setModelConfig(prev => ({ ...prev, [model.id]: !!checked }))
                    }
                    disabled={selected.size === 0 || !aiServiceEnabled}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-border">
            <Button 
              className="w-full"
              onClick={handleSaveModelConfig}
              disabled={selected.size === 0}
            >
              保存配置
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Confirmation Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>授权同步组织架构</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>您即将授权系统同步企业组织架构数据，请确认以下信息：</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>系统将获取您企业的部门结构和人员信息</li>
                <li>同步后，系统将在每天 0:00 和 12:00 自动更新</li>
                <li>您可以随时手动触发同步</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAuth}>
              确认授权
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}