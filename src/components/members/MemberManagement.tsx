import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  RefreshCw,
  Users,
  Download,
  Building2
} from 'lucide-react';
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

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'sso' | 'manual'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [isAdding, setIsAdding] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || member.source === filter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesFilter && matchesStatus;
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

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-badge-success">正常</span>;
      case 'inactive':
        return <span className="status-badge status-badge-error">禁用</span>;
      case 'pending':
        return <span className="status-badge status-badge-warning">待激活</span>;
    }
  };

  const renderActionButtons = (member: Member) => {
    const buttons = [];

    // 禁用/启用按钮
    if (member.status === 'active' || member.status === 'pending') {
      buttons.push(
        <Button
          key="disable"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => handleToggleStatus(member, 'disable')}
        >
          禁用
        </Button>
      );
    } else {
      buttons.push(
        <Button
          key="enable"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => handleToggleStatus(member, 'enable')}
        >
          启用
        </Button>
      );
    }

    // 仅手动添加的用户显示编辑和重新发送秘钥
    if (member.source === 'manual') {
      buttons.push(
        <Button
          key="edit"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => handleEditMember(member)}
        >
          编辑
        </Button>
      );
      buttons.push(
        <Button
          key="resend"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => handleResendKey(member)}
        >
          重新发送秘钥
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            成员管理
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="w-4 h-4" />
            组织管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6 mt-6">
          {/* Header */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              导出
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              添加成员
            </Button>
          </div>

          {/* Filters */}
          <div className="enterprise-card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="搜索姓名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-1 items-center">
                  <span className="text-sm text-muted-foreground mr-1">来源:</span>
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'sso', label: 'SSO' },
                    { value: 'manual', label: '手动添加' },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      variant={filter === item.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(item.value as typeof filter)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-sm text-muted-foreground mr-1">状态:</span>
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'active', label: '正常' },
                    { value: 'pending', label: '待激活' },
                    { value: 'inactive', label: '禁用' },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      variant={statusFilter === item.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(item.value as typeof statusFilter)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Member Table */}
          <div className="enterprise-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">成员信息</th>
                  <th className="text-left">部门</th>
                  <th className="text-left">来源</th>
                  <th className="text-left">状态</th>
                  <th className="text-left">最后活跃</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="group">
                    <td className="text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{member.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-left">
                      <span className="text-sm text-foreground">{member.department || '-'}</span>
                    </td>
                    <td className="text-left">
                      <span className={cn(
                        "status-badge",
                        member.source === 'sso' ? "status-badge-neutral" : "bg-primary/10 text-primary"
                      )}>
                        {member.source === 'sso' ? 'SSO 同步' : '手动添加'}
                      </span>
                    </td>
                    <td className="text-left">{getStatusBadge(member.status)}</td>
                    <td className="text-left">
                      <span className="text-sm text-muted-foreground">
                        {member.lastActiveAt 
                          ? new Date(member.lastActiveAt).toLocaleDateString('zh-CN')
                          : '-'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {renderActionButtons(member)}
                      </div>
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

        <TabsContent value="organization" className="space-y-6 mt-6">
          <div className="enterprise-card p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">组织管理</h3>
            <p className="text-muted-foreground">组织结构管理功能即将上线</p>
          </div>
        </TabsContent>
      </Tabs>

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
