import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  Users, 
  RefreshCw,
  Search,
  CheckCircle2,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDepartments, mockModels } from '@/data/mockData';
import { Department } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';

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

  // Limit to 3 levels
  if (level >= 3) return null;

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-colors",
          isSelected ? "bg-primary/10" : "hover:bg-muted/50",
          matchesSearch && searchQuery ? "ring-1 ring-primary/30" : ""
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => hasChildren && onToggleExpand(department.id)}
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
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        {/* Department icon */}
        <Building2 className="w-4 h-4 text-muted-foreground" />

        {/* Department name */}
        <span className="font-medium text-foreground flex-1">{department.name}</span>

        {/* Member count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{department.memberCount}人</span>
        </div>

        {/* AI status */}
        <div className={cn(
          "status-badge text-xs",
          department.aiEnabled ? "status-badge-success" : "status-badge-neutral"
        )}>
          {department.aiEnabled ? '已开通' : '未开通'}
        </div>

        {/* Allowed models count */}
        {department.aiEnabled && department.allowedModels.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {department.allowedModels.length}个模型
          </span>
        )}
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
  const [showBatchModelDialog, setShowBatchModelDialog] = useState(false);
  const [showBatchServiceDialog, setShowBatchServiceDialog] = useState(false);
  
  // Sync status - in real app this would come from backend
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Batch operation states
  const [batchModels, setBatchModels] = useState<Record<string, boolean>>({});
  const [batchServiceEnabled, setBatchServiceEnabled] = useState(true);

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
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
    
    setIsAuthorized(true);
    setLastSyncTime(new Date().toLocaleString('zh-CN'));
    setIsSyncing(false);
    
    toast({
      title: '组织架构同步成功',
      description: '已授权并完成首次同步，系统将在每天 0:00 和 12:00 自动同步',
    });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastSyncTime(new Date().toLocaleString('zh-CN'));
    setIsSyncing(false);
    
    toast({
      title: '同步完成',
      description: '组织架构已更新至最新状态',
    });
  };

  const handleBatchModelConfig = () => {
    if (selected.size === 0) {
      toast({ title: '请先选择部门', variant: 'destructive' });
      return;
    }
    // Initialize batch models state
    const initialModels: Record<string, boolean> = {};
    mockModels.forEach(m => {
      initialModels[m.id] = false;
    });
    setBatchModels(initialModels);
    setShowBatchModelDialog(true);
  };

  const handleBatchServiceToggle = () => {
    if (selected.size === 0) {
      toast({ title: '请先选择部门', variant: 'destructive' });
      return;
    }
    setShowBatchServiceDialog(true);
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

  const handleConfirmBatchModels = () => {
    const enabledModels = Object.entries(batchModels)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => id);
    
    setDepartments(prev => 
      updateDepartments(prev, selected, d => ({
        ...d,
        allowedModels: enabledModels,
        aiEnabled: enabledModels.length > 0,
      }))
    );
    
    setShowBatchModelDialog(false);
    setSelected(new Set());
    
    toast({
      title: '模型配置已更新',
      description: `已为 ${selected.size} 个部门更新模型权限`,
    });
  };

  const handleConfirmBatchService = () => {
    setDepartments(prev =>
      updateDepartments(prev, selected, d => ({
        ...d,
        aiEnabled: batchServiceEnabled,
        allowedModels: batchServiceEnabled ? d.allowedModels : [],
      }))
    );
    
    setShowBatchServiceDialog(false);
    setSelected(new Set());
    
    toast({
      title: batchServiceEnabled ? 'AI 服务已开通' : 'AI 服务已关闭',
      description: `已为 ${selected.size} 个部门${batchServiceEnabled ? '开通' : '关闭'} AI 服务`,
    });
  };

  // Not authorized yet - show authorization prompt
  if (!isAuthorized) {
    return (
      <div className="space-y-6">
        <div className="enterprise-card p-8 text-center">
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

  return (
    <div className="space-y-4">
      {/* Header with sync info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastSyncTime && (
            <span>上次同步: {lastSyncTime} · 每日 0:00、12:00 自动同步</span>
          )}
        </div>
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

      {/* Search and batch actions */}
      <div className="enterprise-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="按部门名称检索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selected.size > 0 ? '取消全选' : '全选'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchServiceToggle}
              disabled={selected.size === 0}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              批量开通/关闭服务
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchModelConfig}
              disabled={selected.size === 0}
              className="gap-2"
            >
              <Settings2 className="w-4 h-4" />
              批量配置模型
            </Button>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="mt-3 text-sm text-primary">
            已选择 {selected.size} 个部门
          </div>
        )}
      </div>

      {/* Department Tree */}
      <div className="enterprise-card p-4">
        <div className="space-y-1">
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

      {/* Batch Service Toggle Dialog */}
      <Dialog open={showBatchServiceDialog} onOpenChange={setShowBatchServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量调整 AI 服务</DialogTitle>
            <DialogDescription>
              为选中的 {selected.size} 个部门批量开通或关闭 AI 服务
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label className="text-base font-medium">AI 服务状态</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {batchServiceEnabled ? '开通后部门成员可使用 AI 功能' : '关闭后部门成员将无法使用 AI 功能'}
                </p>
              </div>
              <Switch
                checked={batchServiceEnabled}
                onCheckedChange={setBatchServiceEnabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchServiceDialog(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmBatchService}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Model Config Dialog */}
      <Dialog open={showBatchModelDialog} onOpenChange={setShowBatchModelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>批量配置模型权限</DialogTitle>
            <DialogDescription>
              为选中的 {selected.size} 个部门配置可用的 AI 模型
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {mockModels.filter(m => m.enabled).map(model => (
              <div
                key={model.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-foreground">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.provider}</p>
                </div>
                <Checkbox
                  checked={batchModels[model.id] || false}
                  onCheckedChange={(checked) => 
                    setBatchModels(prev => ({ ...prev, [model.id]: !!checked }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchModelDialog(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmBatchModels}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
