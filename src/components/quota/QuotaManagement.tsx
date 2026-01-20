import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Save, Settings2, Building2, User, Edit, AlertCircle, Plus, Trash2, Check, ChevronsUpDown, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hierarchical organization structure (3 levels)
interface DepartmentNode {
  id: string;
  name: string;
  memberCount: number;
  level: 1 | 2 | 3;
  parentId?: string;
  children?: DepartmentNode[];
}

const organizationTree: DepartmentNode[] = [
  {
    id: '1',
    name: '技术中心',
    memberCount: 45,
    level: 1,
    children: [
      {
        id: '1-1',
        name: '研发一部',
        memberCount: 20,
        level: 2,
        parentId: '1',
        children: [
          { id: '1-1-1', name: '前端组', memberCount: 8, level: 3, parentId: '1-1' },
          { id: '1-1-2', name: '后端组', memberCount: 7, level: 3, parentId: '1-1' },
          { id: '1-1-3', name: '测试组', memberCount: 5, level: 3, parentId: '1-1' },
        ]
      },
      {
        id: '1-2',
        name: '研发二部',
        memberCount: 15,
        level: 2,
        parentId: '1',
        children: [
          { id: '1-2-1', name: 'AI算法组', memberCount: 8, level: 3, parentId: '1-2' },
          { id: '1-2-2', name: '数据组', memberCount: 7, level: 3, parentId: '1-2' },
        ]
      },
      {
        id: '1-3',
        name: '架构部',
        memberCount: 10,
        level: 2,
        parentId: '1',
      }
    ]
  },
  {
    id: '2',
    name: '产品中心',
    memberCount: 20,
    level: 1,
    children: [
      {
        id: '2-1',
        name: '产品设计部',
        memberCount: 12,
        level: 2,
        parentId: '2',
        children: [
          { id: '2-1-1', name: 'UI设计组', memberCount: 6, level: 3, parentId: '2-1' },
          { id: '2-1-2', name: 'UX研究组', memberCount: 6, level: 3, parentId: '2-1' },
        ]
      },
      {
        id: '2-2',
        name: '产品运营部',
        memberCount: 8,
        level: 2,
        parentId: '2',
      }
    ]
  },
  {
    id: '3',
    name: '市场中心',
    memberCount: 15,
    level: 1,
    children: [
      { id: '3-1', name: '市场推广部', memberCount: 8, level: 2, parentId: '3' },
      { id: '3-2', name: '品牌部', memberCount: 7, level: 2, parentId: '3' },
    ]
  },
  {
    id: '4',
    name: '职能中心',
    memberCount: 18,
    level: 1,
    children: [
      { id: '4-1', name: '人力资源部', memberCount: 6, level: 2, parentId: '4' },
      { id: '4-2', name: '财务部', memberCount: 8, level: 2, parentId: '4' },
      { id: '4-3', name: '行政部', memberCount: 4, level: 2, parentId: '4' },
    ]
  },
];

// Flatten the tree for easier lookup
const flattenDepartments = (nodes: DepartmentNode[], result: DepartmentNode[] = []): DepartmentNode[] => {
  nodes.forEach(node => {
    result.push(node);
    if (node.children) {
      flattenDepartments(node.children, result);
    }
  });
  return result;
};

const allDepartmentsFlat = flattenDepartments(organizationTree);

const allMembers = [
  { id: '1', name: '张三', email: 'zhangsan@company.com', department: '技术研发部' },
  { id: '2', name: '李四', email: 'lisi@company.com', department: '技术研发部' },
  { id: '3', name: '王五', email: 'wangwu@company.com', department: '产品设计部' },
  { id: '4', name: '赵六', email: 'zhaoliu@company.com', department: '市场运营部' },
  { id: '5', name: '钱七', email: 'qianqi@company.com', department: '人力资源部' },
  { id: '6', name: '孙八', email: 'sunba@company.com', department: '财务部' },
];

interface DepartmentQuota {
  id: string;
  name: string;
  memberCount: number;
  quota: number;
  used: number;
}

interface MemberQuota {
  id: string;
  name: string;
  email: string;
  department: string;
  quota: number;
  used: number;
}

// Department Tree Selector Component for hierarchical selection
interface DepartmentTreeSelectorProps {
  nodes: DepartmentNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  configuredIds: string[];
  level?: number;
}

function DepartmentTreeSelector({ 
  nodes, 
  selectedId, 
  onSelect, 
  expandedNodes, 
  onToggleExpand,
  configuredIds,
  level = 0 
}: DepartmentTreeSelectorProps) {
  const getLevelBadge = (nodeLevel: 1 | 2 | 3) => {
    const badges: Record<number, { label: string; className: string }> = {
      1: { label: '一级', className: 'bg-primary/10 text-primary' },
      2: { label: '二级', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      3: { label: '三级', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    };
    return badges[nodeLevel];
  };

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes[node.id];
        const isConfigured = configuredIds.includes(node.id);
        const isSelected = selectedId === node.id;
        const badge = getLevelBadge(node.level);

        return (
          <div key={node.id}>
            <div 
              className={cn(
                "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                isSelected && "bg-primary/10 ring-1 ring-primary",
                isConfigured && "opacity-50 cursor-not-allowed"
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(node.id);
                  }}
                  className="p-0.5 hover:bg-muted-foreground/20 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}
              
              <div 
                className="flex-1 flex items-center gap-2"
                onClick={() => !isConfigured && onSelect(node.id)}
              >
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className={cn("text-sm", isSelected && "font-medium")}>
                  {node.name}
                </span>
                <Badge variant="outline" className={cn("text-xs px-1.5 py-0", badge.className)}>
                  {badge.label}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {node.memberCount}人
                </span>
                {isConfigured && (
                  <Badge variant="secondary" className="text-xs">已配置</Badge>
                )}
              </div>
            </div>
            
            {hasChildren && isExpanded && (
              <DepartmentTreeSelector
                nodes={node.children!}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                configuredIds={configuredIds}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function QuotaManagement() {
  // Global quota state
  const [globalQuota, setGlobalQuota] = useState({
    enabled: true,
    monthlyBudget: 50000,
    alertThreshold: 80,
  });

  // Department quota state
  const [departmentQuotaEnabled, setDepartmentQuotaEnabled] = useState(true);
  const [defaultDepartmentQuota, setDefaultDepartmentQuota] = useState(5000);
  const [customDepartments, setCustomDepartments] = useState<DepartmentQuota[]>([
    { id: '1-1-1', name: '前端组', memberCount: 8, quota: 8000, used: 5200 },
  ]);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentQuota | null>(null);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [newDepartmentQuota, setNewDepartmentQuota] = useState(5000);
  const [departmentPopoverOpen, setDepartmentPopoverOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  // Member quota state
  const [memberQuotaEnabled, setMemberQuotaEnabled] = useState(true);
  const [defaultMemberQuota, setDefaultMemberQuota] = useState(200);
  const [customMembers, setCustomMembers] = useState<MemberQuota[]>([
    { id: '1', name: '张三', email: 'zhangsan@company.com', department: '技术研发部', quota: 500, used: 320 },
    { id: '4', name: '赵六', email: 'zhaoliu@company.com', department: '市场运营部', quota: 300, used: 200 },
  ]);
  const [editingMember, setEditingMember] = useState<MemberQuota | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newMemberQuota, setNewMemberQuota] = useState(200);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);

  const handleSaveGlobalQuota = () => {
    toast.success('全局配额设置已保存');
  };

  const handleSaveDepartmentDefaults = () => {
    toast.success('部门默认配额已保存');
  };

  const handleSaveMemberDefaults = () => {
    toast.success('成员默认配额已保存');
  };

  const handleSaveDepartmentQuota = () => {
    if (editingDepartment) {
      setCustomDepartments(prev => 
        prev.map(d => d.id === editingDepartment.id ? editingDepartment : d)
      );
      setDepartmentDialogOpen(false);
      setEditingDepartment(null);
      toast.success('部门配额已更新');
    }
  };

  const handleAddDepartmentQuota = () => {
    const dept = allDepartmentsFlat.find(d => d.id === selectedDepartmentId);
    if (dept) {
      setCustomDepartments(prev => [...prev, {
        id: dept.id,
        name: dept.name,
        memberCount: dept.memberCount,
        quota: newDepartmentQuota,
        used: 0,
      }]);
      setAddDepartmentDialogOpen(false);
      setSelectedDepartmentId('');
      setNewDepartmentQuota(5000);
      setExpandedNodes({});
      toast.success('已添加部门自定义配额');
    }
  };

  const handleDeleteDepartmentQuota = (id: string) => {
    setCustomDepartments(prev => prev.filter(d => d.id !== id));
    toast.success('已移除部门自定义配额，将使用默认配额');
  };

  const handleSaveMemberQuota = () => {
    if (editingMember) {
      setCustomMembers(prev => 
        prev.map(m => m.id === editingMember.id ? editingMember : m)
      );
      setMemberDialogOpen(false);
      setEditingMember(null);
      toast.success('成员配额已更新');
    }
  };

  const handleAddMemberQuota = () => {
    const member = allMembers.find(m => m.id === selectedMemberId);
    if (member) {
      setCustomMembers(prev => [...prev, {
        id: member.id,
        name: member.name,
        email: member.email,
        department: member.department,
        quota: newMemberQuota,
        used: 0,
      }]);
      setAddMemberDialogOpen(false);
      setSelectedMemberId('');
      setNewMemberQuota(200);
      toast.success('已添加成员自定义配额');
    }
  };

  const handleDeleteMemberQuota = (id: string) => {
    setCustomMembers(prev => prev.filter(m => m.id !== id));
    toast.success('已移除成员自定义配额，将使用默认配额');
  };

  const filteredCustomMembers = customMembers.filter(m => 
    m.name.includes(memberSearch) || 
    m.email.includes(memberSearch) ||
    m.department.includes(memberSearch)
  );

  // Get available departments/members (not already configured)
  const availableDepartmentsFlat = allDepartmentsFlat.filter(
    d => !customDepartments.some(cd => cd.id === d.id)
  );

  // Filter organization tree to only show departments not yet configured
  const filterAvailableTree = (nodes: DepartmentNode[]): DepartmentNode[] => {
    return nodes.map(node => {
      const isConfigured = customDepartments.some(cd => cd.id === node.id);
      const filteredChildren = node.children ? filterAvailableTree(node.children) : undefined;
      return { ...node, children: filteredChildren };
    }).filter(node => {
      const isConfigured = customDepartments.some(cd => cd.id === node.id);
      const hasAvailableChildren = node.children && node.children.length > 0;
      return !isConfigured || hasAvailableChildren;
    });
  };

  const availableOrganizationTree = filterAvailableTree(organizationTree);

  const availableMembers = allMembers.filter(
    m => !customMembers.some(cm => cm.id === m.id)
  );

  const getUsagePercentage = (used: number, quota: number) => {
    return Math.round((used / quota) * 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Global Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                全局配置
              </CardTitle>
              <CardDescription>
                设置组织级别的配额策略
              </CardDescription>
            </div>
            <Switch
              checked={globalQuota.enabled}
              onCheckedChange={(checked) => 
                setGlobalQuota(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </CardHeader>
        {globalQuota.enabled && (
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">月度总预算（元）</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  value={globalQuota.monthlyBudget}
                  onChange={(e) => 
                    setGlobalQuota(prev => ({ ...prev, monthlyBudget: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertThreshold">预警阈值（%）</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  min={0}
                  max={100}
                  value={globalQuota.alertThreshold}
                  onChange={(e) => 
                    setGlobalQuota(prev => ({ ...prev, alertThreshold: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">本月使用</span>
                <span className="font-medium">¥32,500 / ¥{globalQuota.monthlyBudget.toLocaleString()}</span>
                <Progress value={65} className="h-2 w-32" />
                <span className="text-muted-foreground">65%</span>
              </div>
              <Button onClick={handleSaveGlobalQuota} className="gap-2">
                <Save className="w-4 h-4" />
                保存设置
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Department Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                部门配置
              </CardTitle>
              <CardDescription>
                为部门设置配额限制
              </CardDescription>
            </div>
            <Switch
              checked={departmentQuotaEnabled}
              onCheckedChange={setDepartmentQuotaEnabled}
            />
          </div>
        </CardHeader>
        {departmentQuotaEnabled && (
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs space-y-2">
                <Label htmlFor="defaultDepartmentQuota">默认部门配额（元/月）</Label>
                <Input
                  id="defaultDepartmentQuota"
                  type="number"
                  value={defaultDepartmentQuota}
                  onChange={(e) => setDefaultDepartmentQuota(Number(e.target.value))}
                />
              </div>
              <Button variant="outline" onClick={handleSaveDepartmentDefaults} className="gap-2">
                <Save className="w-4 h-4" />
                保存默认配额
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">自定义部门配额</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddDepartmentDialogOpen(true)}
                  disabled={availableDepartmentsFlat.length === 0}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加部门配置
                </Button>
              </div>

              {customDepartments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>部门名称</TableHead>
                      <TableHead>成员数</TableHead>
                      <TableHead>月度配额（元）</TableHead>
                      <TableHead>已使用</TableHead>
                      <TableHead>使用率</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customDepartments.map((dept) => {
                      const percentage = getUsagePercentage(dept.used, dept.quota);
                      return (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell>{dept.memberCount}</TableCell>
                          <TableCell>¥{dept.quota.toLocaleString()}</TableCell>
                          <TableCell>¥{dept.used.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="h-2 w-20" />
                              <Badge variant={getUsageStatus(percentage)}>
                                {percentage}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingDepartment(dept);
                                  setDepartmentDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDepartmentQuota(dept.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无自定义部门配额，所有部门使用默认配额 ¥{defaultDepartmentQuota.toLocaleString()}/月
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Member Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                成员配置
              </CardTitle>
              <CardDescription>
                为成员设置配额限制
              </CardDescription>
            </div>
            <Switch
              checked={memberQuotaEnabled}
              onCheckedChange={setMemberQuotaEnabled}
            />
          </div>
        </CardHeader>
        {memberQuotaEnabled && (
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-xs space-y-2">
                <Label htmlFor="defaultMemberQuota">默认成员配额（元/月）</Label>
                <Input
                  id="defaultMemberQuota"
                  type="number"
                  value={defaultMemberQuota}
                  onChange={(e) => setDefaultMemberQuota(Number(e.target.value))}
                />
              </div>
              <Button variant="outline" onClick={handleSaveMemberDefaults} className="gap-2">
                <Save className="w-4 h-4" />
                保存默认配额
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h4 className="text-sm font-medium">自定义成员配额</h4>
                  <Input
                    placeholder="搜索成员..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-48"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddMemberDialogOpen(true)}
                  disabled={availableMembers.length === 0}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加成员配置
                </Button>
              </div>

              {filteredCustomMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>成员</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>月度配额（元）</TableHead>
                      <TableHead>已使用</TableHead>
                      <TableHead>使用率</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomMembers.map((member) => {
                      const percentage = getUsagePercentage(member.used, member.quota);
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>¥{member.quota.toLocaleString()}</TableCell>
                          <TableCell>¥{member.used.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="h-2 w-20" />
                              <Badge variant={getUsageStatus(percentage)}>
                                {percentage}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMember(member);
                                  setMemberDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMemberQuota(member.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : customMembers.length > 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  未找到匹配的成员
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无自定义成员配额，所有成员使用默认配额 ¥{defaultMemberQuota.toLocaleString()}/月
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={addDepartmentDialogOpen} onOpenChange={(open) => {
        setAddDepartmentDialogOpen(open);
        if (!open) {
          setSelectedDepartmentId('');
          setExpandedNodes({});
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加部门自定义配额</DialogTitle>
            <DialogDescription>
              选择部门并设置自定义月度配额（支持1级、2级、3级组织）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选择部门</Label>
              <div className="border rounded-md max-h-64 overflow-y-auto p-2">
                {availableOrganizationTree.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    所有部门已配置
                  </div>
                ) : (
                  <DepartmentTreeSelector
                    nodes={availableOrganizationTree}
                    selectedId={selectedDepartmentId}
                    onSelect={setSelectedDepartmentId}
                    expandedNodes={expandedNodes}
                    onToggleExpand={(id) => setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }))}
                    configuredIds={customDepartments.map(d => d.id)}
                  />
                )}
              </div>
              {selectedDepartmentId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  已选择: {allDepartmentsFlat.find(d => d.id === selectedDepartmentId)?.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDeptQuota">月度配额（元）</Label>
              <Input
                id="newDeptQuota"
                type="number"
                value={newDepartmentQuota}
                onChange={(e) => setNewDepartmentQuota(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDepartmentDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddDepartmentQuota} disabled={!selectedDepartmentId}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑部门配额</DialogTitle>
            <DialogDescription>
              修改 {editingDepartment?.name} 的月度配额
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deptQuota">月度配额（元）</Label>
                <Input
                  id="deptQuota"
                  type="number"
                  value={editingDepartment.quota}
                  onChange={(e) => 
                    setEditingDepartment(prev => prev ? {
                      ...prev,
                      quota: Number(e.target.value)
                    } : null)
                  }
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  当前已使用 ¥{editingDepartment.used.toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepartmentDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveDepartmentQuota}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加成员自定义配额</DialogTitle>
            <DialogDescription>
              选择成员并设置自定义月度配额
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选择成员</Label>
              <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={memberPopoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedMemberId
                      ? availableMembers.find(m => m.id === selectedMemberId)?.name
                      : "选择成员..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="搜索成员..." />
                    <CommandList>
                      <CommandEmpty>未找到成员</CommandEmpty>
                      <CommandGroup>
                        {availableMembers.map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.name}
                            onSelect={() => {
                              setSelectedMemberId(member.id);
                              setMemberPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedMemberId === member.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <p>{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.department}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newMemberQuota">月度配额（元）</Label>
              <Input
                id="newMemberQuota"
                type="number"
                value={newMemberQuota}
                onChange={(e) => setNewMemberQuota(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddMemberQuota} disabled={!selectedMemberId}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员配额</DialogTitle>
            <DialogDescription>
              修改 {editingMember?.name} 的月度配额
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="memberQuota">月度配额（元）</Label>
                <Input
                  id="memberQuota"
                  type="number"
                  value={editingMember.quota}
                  onChange={(e) => 
                    setEditingMember(prev => prev ? {
                      ...prev,
                      quota: Number(e.target.value)
                    } : null)
                  }
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  当前已使用 ¥{editingMember.used.toLocaleString()}，所属部门：{editingMember.department}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMemberQuota}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
