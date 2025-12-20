import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  Boxes, 
  RefreshCw,
  CheckSquare,
  Square,
  Settings2,
  Power,
  PowerOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockDepartments } from '@/data/mockData';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TreeNodeProps {
  department: Department;
  level: number;
  selectedDepts: Set<string>;
  onToggleSelect: (id: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
}

function TreeNode({ 
  department, 
  level, 
  selectedDepts, 
  onToggleSelect,
  expandedNodes,
  onToggleExpand
}: TreeNodeProps) {
  const hasChildren = department.children && department.children.length > 0;
  const isExpanded = expandedNodes.has(department.id);
  const isSelected = selectedDepts.has(department.id);

  return (
    <div className="animate-fade-in">
      <div 
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer group",
          "hover:bg-muted/50",
          isSelected && "bg-primary/5 border border-primary/20"
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(department.id);
          }}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded transition-colors",
            hasChildren ? "hover:bg-muted" : "invisible"
          )}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </button>

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(department.id);
          }}
          className="flex items-center justify-center"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>

        {/* Department Info */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{department.name}</p>
            <p className="text-xs text-muted-foreground">{department.memberCount} 位成员</p>
          </div>
        </div>

        {/* AI Status */}
        <div className={cn(
          "status-badge",
          department.aiEnabled ? "status-badge-success" : "status-badge-neutral"
        )}>
          {department.aiEnabled ? 'AI 已开通' : 'AI 未开通'}
        </div>

        {/* Models */}
        {department.aiEnabled && department.allowedModels.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {department.allowedModels.slice(0, 2).map((model) => (
              <span 
                key={model}
                className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
              >
                {model}
              </span>
            ))}
            {department.allowedModels.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{department.allowedModels.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {department.children!.map((child) => (
            <TreeNode
              key={child.id}
              department={child}
              level={level + 1}
              selectedDepts={selectedDepts}
              onToggleSelect={onToggleSelect}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DepartmentManagement() {
  const [departments] = useState<Department[]>(mockDepartments);
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['dept-1', 'dept-1-2']));
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showBatchConfig, setShowBatchConfig] = useState(false);
  const [batchModels, setBatchModels] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedDepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSync = async () => {
    setShowSyncConfirm(false);
    setIsSyncing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsSyncing(false);
    toast({
      title: '同步完成',
      description: '已从身份源同步最新组织架构',
    });
  };

  const handleBatchEnable = () => {
    if (selectedDepts.size === 0) {
      toast({ title: '请先选择部门', variant: 'destructive' });
      return;
    }
    toast({
      title: 'AI 服务已开通',
      description: `已为 ${selectedDepts.size} 个部门开通 AI 服务`,
    });
    setSelectedDepts(new Set());
  };

  const handleBatchDisable = () => {
    if (selectedDepts.size === 0) {
      toast({ title: '请先选择部门', variant: 'destructive' });
      return;
    }
    toast({
      title: 'AI 服务已关闭',
      description: `已为 ${selectedDepts.size} 个部门关闭 AI 服务`,
    });
    setSelectedDepts(new Set());
  };

  const handleBatchConfig = () => {
    if (selectedDepts.size === 0) {
      toast({ title: '请先选择部门', variant: 'destructive' });
      return;
    }
    setShowBatchConfig(true);
  };

  const handleSaveBatchConfig = () => {
    toast({
      title: '模型权限已更新',
      description: `已为 ${selectedDepts.size} 个部门配置模型权限`,
    });
    setShowBatchConfig(false);
    setBatchModels([]);
    setSelectedDepts(new Set());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setShowSyncConfirm(true)}
          disabled={isSyncing}
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          {isSyncing ? '同步中...' : '立即同步'}
        </Button>
      </div>

      {/* Batch Actions */}
      {selectedDepts.size > 0 && (
        <div className="enterprise-card p-4 bg-primary/5 border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              已选择 <strong>{selectedDepts.size}</strong> 个部门
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleBatchEnable}>
                <Power className="w-4 h-4" />
                批量开通
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleBatchDisable}>
                <PowerOff className="w-4 h-4" />
                批量关闭
              </Button>
              <Button size="sm" className="gap-2" onClick={handleBatchConfig}>
                <Settings2 className="w-4 h-4" />
                配置模型
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Department Tree */}
      <div className="enterprise-card p-4">
        <div className="space-y-1">
          {departments.map((dept) => (
            <TreeNode
              key={dept.id}
              department={dept}
              level={0}
              selectedDepts={selectedDepts}
              onToggleSelect={handleToggleSelect}
              expandedNodes={expandedNodes}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      </div>

      {/* Sync Confirm Dialog */}
      <Dialog open={showSyncConfirm} onOpenChange={setShowSyncConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认同步组织架构</DialogTitle>
            <DialogDescription>
              将从身份源（WPS 365 / 企业微信）同步最新的组织架构数据。此操作需要进行二次授权确认。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning">
                ⚠️ 首次同步可能需要较长时间，请耐心等待
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncConfirm(false)}>
              取消
            </Button>
            <Button onClick={handleSync}>
              确认同步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Model Config Dialog */}
      <Dialog open={showBatchConfig} onOpenChange={setShowBatchConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量配置模型权限</DialogTitle>
            <DialogDescription>
              为选中的 {selectedDepts.size} 个部门统一配置可用的 AI 模型
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {['Kimi', 'Qwen 2.5', 'DeepSeek V3', 'GLM-4', 'ERNIE 4.0'].map((model) => (
              <div key={model} className="flex items-center space-x-3">
                <Checkbox 
                  id={model}
                  checked={batchModels.includes(model)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBatchModels(prev => [...prev, model]);
                    } else {
                      setBatchModels(prev => prev.filter(m => m !== model));
                    }
                  }}
                />
                <Label htmlFor={model} className="text-sm font-normal cursor-pointer">
                  {model}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchConfig(false)}>
              取消
            </Button>
            <Button onClick={handleSaveBatchConfig}>
              <Boxes className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
