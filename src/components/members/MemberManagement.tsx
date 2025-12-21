import React, { useState } from 'react';
import { 
  Plus, 
  Mail, 
  RefreshCw,
  Users,
  Building2,
  RotateCcw,
  UserPlus
} from 'lucide-react';
import { OrganizationTree } from '@/components/organization/OrganizationTree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockMembers } from '@/data/mockData';
import { Member } from '@/types';
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

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [isAdding, setIsAdding] = useState(false);

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
    
    const member: Member = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: 'member',
      source: 'manual',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setMembers(prev => [member, ...prev]);
    setShowAddDialog(false);
    setNewMember({ name: '', email: '' });
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

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowEditDialog(true);
  };

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
          <Button variant="outline" size="sm">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员信息</DialogTitle>
            <DialogDescription>
              修改成员的基本信息
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
    </div>
  );
}