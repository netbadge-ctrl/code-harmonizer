import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Edit2, 
  Ban, 
  CheckCircle2,
  RefreshCw,
  Users,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockMembers } from '@/data/mockData';
import { Member } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'sso' | 'manual'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [isAdding, setIsAdding] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || member.source === filter;
    return matchesSearch && matchesFilter;
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

  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setMembers(prev => prev.map(m => 
      m.id === member.id ? { ...m, status: newStatus } : m
    ));
    toast({ 
      title: newStatus === 'active' ? '成员已启用' : '成员已禁用',
      description: `${member.name} 的状态已更新`,
    });
  };

  const handleResendKey = async (member: Member) => {
    toast({ 
      title: '密钥已重发',
      description: `新密钥已发送至 ${member.email}`,
    });
  };

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-badge-success">已激活</span>;
      case 'inactive':
        return <span className="status-badge status-badge-error">已禁用</span>;
      case 'pending':
        return <span className="status-badge status-badge-warning">待激活</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">成员管理</h2>
          <p className="text-sm text-muted-foreground">管理组织成员及其访问权限</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            导出
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            添加成员
          </Button>
        </div>
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
          <div className="flex gap-2">
            {[
              { value: 'all', label: '全部' },
              { value: 'sso', label: 'SSO 同步' },
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
        </div>
      </div>

      {/* Member Table */}
      <div className="enterprise-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>成员信息</th>
              <th>部门</th>
              <th>来源</th>
              <th>状态</th>
              <th>最后活跃</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="group">
                <td>
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
                <td>
                  <span className="text-sm text-foreground">{member.department || '-'}</span>
                </td>
                <td>
                  <span className={cn(
                    "status-badge",
                    member.source === 'sso' ? "status-badge-neutral" : "bg-primary/10 text-primary"
                  )}>
                    {member.source === 'sso' ? 'SSO 同步' : '手动添加'}
                  </span>
                </td>
                <td>{getStatusBadge(member.status)}</td>
                <td>
                  <span className="text-sm text-muted-foreground">
                    {member.lastActiveAt 
                      ? new Date(member.lastActiveAt).toLocaleDateString('zh-CN')
                      : '-'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.source === 'manual' && (
                          <>
                            <DropdownMenuItem>
                              <Edit2 className="w-4 h-4 mr-2" />
                              编辑信息
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendKey(member)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              重发密钥
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {member.source === 'sso' && (
                          <DropdownMenuItem disabled>
                            <Users className="w-4 h-4 mr-2" />
                            SSO 同步中
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                          {member.status === 'active' ? (
                            <>
                              <Ban className="w-4 h-4 mr-2" />
                              禁用成员
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              启用成员
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    </div>
  );
}
