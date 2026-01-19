import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Mail, 
  RefreshCw,
  Users,
  Building2,
  RotateCcw,
  UserPlus,
  X,
  Cpu,
  Lock
} from 'lucide-react';
import { OrganizationTree } from '@/components/organization/OrganizationTree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockMembers, mockDepartments } from '@/data/mockData';
import { Member, Department } from '@/types';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubscriptionUpgradeDialog } from '@/components/subscription/SubscriptionUpgradeDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Mock available models list
const availableModels = [
  { id: "kimi-k2-thinking-turbo", name: "kimi-k2-thinking-turbo", type: "text" },
  { id: "qwen3-coder-480b-a35b-instruct", name: "qwen3-coder-480b-a35b-instruct", type: "text" },
  { id: "kimi-k2-turbo-preview", name: "kimi-k2-turbo-preview", type: "text" },
  { id: "yi-vision-v2", name: "yi-vision-v2", type: "vision" },
  { id: "kimi-k2-ksyun", name: "kimi-k2-ksyun", type: "text" },
  { id: "minimax_m2", name: "minimax_m2", type: "vision" },
  { id: "deepseek-v3.2", name: "deepseek-v3.2", type: "text" },
  { id: "glm-4v-plus", name: "glm-4v-plus", type: "vision" },
];

interface ExtendedMember extends Member {
  allowedModels?: string[];
}

export function MemberManagement() {
  const [members, setMembers] = useState<ExtendedMember[]>(
    mockMembers.map(m => ({ ...m, allowedModels: [] }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<ExtendedMember | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', allowedModels: [] as string[] });
  const [isAdding, setIsAdding] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({ title: '请填写完整信息', variant: 'destructive' });
      return;
    }

    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const member: ExtendedMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: 'member',
      source: 'manual',
      status: 'pending',
      createdAt: new Date().toISOString(),
      allowedModels: newMember.allowedModels,
    };
    
    setMembers(prev => [member, ...prev]);
    setShowAddDialog(false);
    setNewMember({ name: '', email: '', allowedModels: [] });
    setIsAdding(false);
    
    toast({ 
      title: '成员添加成功',
      description: `密钥已发送至 ${member.email}`,
    });
  };

  const handleToggleStatus = async (member: Member, action: 'enable' | 'disable') => {
    const newStatus = action === 'enable' ? 'active' : 'inactive';
    setMembers(prev => prev.map(m => 
      m.id === member.id ? { ...m, status: newStatus } : m
    ));
    toast({ 
      title: action === 'enable' ? '成员已启用' : '成员已禁用',
      description: `${member.name} 的状态已更新`,
    });
  };

  const handleResendKey = async (member: Member) => {
    toast({ 
      title: '密钥已重发',
      description: `新密钥已发送至 ${member.email}`,
    });
  };

  const handleEditMember = (member: ExtendedMember) => {
    setEditingMember({ ...member, allowedModels: member.allowedModels || [] });
    setShowEditDialog(true);
  };

  // Helper function to find department by name recursively
  const findDepartmentByName = (departments: Department[], name: string): Department | null => {
    for (const dept of departments) {
      if (dept.name === name) return dept;
      if (dept.children && dept.children.length > 0) {
        const found = findDepartmentByName(dept.children, name);
        if (found) return found;
      }
    }
    return null;
  };

  // Get organization inherited models for the editing member
  const organizationInheritedModels = useMemo(() => {
    if (!editingMember?.department) return [];
    const dept = findDepartmentByName(mockDepartments, editingMember.department);
    return dept?.allowedModels || [];
  }, [editingMember?.department]);

  const toggleEditingMemberModel = (modelId: string, isInherited: boolean) => {
    if (!editingMember) return;
    // Prevent unchecking inherited models
    if (isInherited) {
      toast({
        title: '无法取消组织继承的模型',
        description: '该模型由组织统一配置，如需修改请联系组织管理员',
        variant: 'destructive',
      });
      return;
    }
    const currentModels = editingMember.allowedModels || [];
    const newModels = currentModels.includes(modelId)
      ? currentModels.filter(id => id !== modelId)
      : [...currentModels, modelId];
    setEditingMember({ ...editingMember, allowedModels: newModels });
  };

  const toggleNewMemberModel = (modelId: string) => {
    setNewMember(prev => {
      const currentModels = prev.allowedModels || [];
      const newModels = currentModels.includes(modelId)
        ? currentModels.filter(id => id !== modelId)
        : [...currentModels, modelId];
      return { ...prev, allowedModels: newModels };
    });
  };

  const getModelName = (id: string) => availableModels.find(m => m.id === id)?.name || id;

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    setMembers(prev => prev.map(m => 
      m.id === editingMember.id ? editingMember : m
    ));
    setShowEditDialog(false);
    setEditingMember(null);
    
    toast({ 
      title: '成员信息已更新',
      description: `${editingMember.name} 的信息已保存`,
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-success text-success">正常</span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-destructive text-destructive">禁用</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-warning text-warning">未激活</span>;
    }
  };

  const renderActionButtons = (member: Member) => {
    const actions: { key: string; label: string; onClick: () => void }[] = [];

    // 禁用/启用按钮
    if (member.status === 'active' || member.status === 'pending') {
      actions.push({
        key: 'disable',
        label: '禁用',
        onClick: () => handleToggleStatus(member, 'disable'),
      });
    } else {
      actions.push({
        key: 'enable',
        label: '启用',
        onClick: () => handleToggleStatus(member, 'enable'),
      });
    }

    // 仅手动添加的用户显示编辑和重新发送秘钥
    if (member.source === 'manual') {
      actions.push({
        key: 'edit',
        label: '编辑',
        onClick: () => handleEditMember(member),
      });
      actions.push({
        key: 'resend',
        label: '重发秘钥',
        onClick: () => handleResendKey(member),
      });
    } else {
      // SSO用户也可以编辑
      actions.push({
        key: 'edit',
        label: '编辑',
        onClick: () => handleEditMember(member),
      });
    }

    return (
      <div className="flex items-center justify-end">
        {actions.map((action, index) => (
          <React.Fragment key={action.key}>
            <button
              className="text-primary hover:text-primary/80 text-sm transition-colors"
              onClick={action.onClick}
            >
              {action.label}
            </button>
            {index < actions.length - 1 && (
              <span className="text-muted-foreground/50 mx-2">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Subscription data (mock)
  const subscriptionData = {
    usedSeats: 5,
    totalSeats: 50,
  };

  return (
    <div className="animate-fade-in">
      {/* Subscription Seats Header */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="text-sm text-muted-foreground mb-2">订阅席位使用情况</div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(subscriptionData.usedSeats / subscriptionData.totalSeats) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {subscriptionData.usedSeats} / {subscriptionData.totalSeats} 人
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowUpgradeDialog(true)}>
            订阅管理 / 扩容
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-6">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="members">
                成员管理
              </TabsTrigger>
              <TabsTrigger value="organization">
                组织管理
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-0">
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">姓名:</span>
                  <Input 
                    placeholder="输入姓名"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 h-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">状态:</span>
                  <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
                    <SelectTrigger className="w-24 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="active">正常</SelectItem>
                      <SelectItem value="pending">未激活</SelectItem>
                      <SelectItem value="inactive">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  重置
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4" />
                  添加成员
                </Button>
              </div>

              {/* Member Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">用户</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">部门</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">状态</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr 
                        key={member.id} 
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          index !== filteredMembers.length - 1 && "border-b border-border"
                        )}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-foreground">{member.name[0]}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{member.name}</p>
                              <p className="text-sm text-primary">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-foreground">{member.department || '-'}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-4 py-4">
                          {renderActionButtons(member)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredMembers.length === 0 && (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">没有找到匹配的成员</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="organization" className="mt-0">
              <OrganizationTree />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加外部成员</DialogTitle>
            <DialogDescription>
              添加后，系统将自动发送访问密钥至成员邮箱
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input 
                id="name"
                placeholder="请输入成员姓名"
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input 
                id="email"
                type="email"
                placeholder="请输入成员邮箱"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {/* 可用模型配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">可用模型</Label>
                <span className="text-xs text-muted-foreground">(留空表示使用默认配置)</span>
              </div>
              {newMember.allowedModels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newMember.allowedModels.map(id => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1 text-xs">
                      {getModelName(id)}
                      <button onClick={() => toggleNewMemberModel(id)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-1">
                  {availableModels.map(model => (
                    <div
                      key={model.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                        newMember.allowedModels.includes(model.id) && "bg-primary/10"
                      )}
                      onClick={() => toggleNewMemberModel(model.id)}
                    >
                      <Checkbox checked={newMember.allowedModels.includes(model.id)} />
                      <span className="text-sm">{model.name}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {model.type === "text" ? "文本" : "视觉"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddMember} disabled={isAdding}>
              {isAdding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  添加中...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  发送邀请
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑成员信息</DialogTitle>
            <DialogDescription>
              修改成员的基本信息和可用模型配置
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">姓名</Label>
                <Input 
                  id="edit-name"
                  placeholder="请输入成员姓名"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">邮箱</Label>
                <Input 
                  id="edit-email"
                  type="email"
                  placeholder="请输入成员邮箱"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              {/* 可用模型配置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">可用模型</Label>
                </div>
                {organizationInheritedModels.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                    <Lock className="w-3 h-3" />
                    <span>带有"组织继承"标记的模型由组织统一配置，无法在成员管理中取消</span>
                  </div>
                )}
                {/* Selected models badges */}
                {(() => {
                  const allSelectedModels = [...new Set([
                    ...organizationInheritedModels,
                    ...(editingMember.allowedModels || [])
                  ])];
                  return allSelectedModels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {allSelectedModels.map(id => {
                        const isInherited = organizationInheritedModels.includes(id);
                        return (
                          <Badge 
                            key={id} 
                            variant={isInherited ? "default" : "secondary"} 
                            className={cn(
                              "flex items-center gap-1 text-xs",
                              isInherited && "bg-primary/20 text-primary border-primary/30"
                            )}
                          >
                            {isInherited && <Lock className="w-3 h-3" />}
                            {getModelName(id)}
                            {!isInherited && (
                              <button 
                                onClick={() => toggleEditingMemberModel(id, false)} 
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  );
                })()}
                <ScrollArea className="h-40 border rounded-md p-2">
                  <div className="space-y-1">
                    {availableModels.map(model => {
                      const isInherited = organizationInheritedModels.includes(model.id);
                      const isChecked = isInherited || (editingMember.allowedModels?.includes(model.id) || false);
                      return (
                        <div
                          key={model.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded transition-colors",
                            isInherited 
                              ? "bg-primary/5 cursor-not-allowed" 
                              : "cursor-pointer hover:bg-muted/50",
                            isChecked && !isInherited && "bg-primary/10"
                          )}
                          onClick={() => toggleEditingMemberModel(model.id, isInherited)}
                        >
                          <Checkbox 
                            checked={isChecked} 
                            disabled={isInherited}
                            className={isInherited ? "opacity-70" : ""}
                          />
                          <span className={cn("text-sm", isInherited && "text-muted-foreground")}>
                            {model.name}
                          </span>
                          {isInherited && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                              <Lock className="w-3 h-3 mr-1" />
                              组织继承
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs ml-auto">
                            {model.type === "text" ? "文本" : "视觉"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SubscriptionUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentPlan="professional"
        currentSeats={subscriptionData.totalSeats}
      />
    </div>
  );
}