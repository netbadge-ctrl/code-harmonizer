import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Save, Settings2, Users, Building2, User, Edit, AlertCircle } from 'lucide-react';

// Mock data
const mockDepartments = [
  { id: '1', name: '技术研发部', memberCount: 25, quota: 5000, used: 3200, inherited: false },
  { id: '2', name: '产品设计部', memberCount: 12, quota: 3000, used: 1800, inherited: true },
  { id: '3', name: '市场运营部', memberCount: 8, quota: 2000, used: 1500, inherited: true },
  { id: '4', name: '人力资源部', memberCount: 5, quota: 1000, used: 400, inherited: true },
];

const mockMembers = [
  { id: '1', name: '张三', email: 'zhangsan@company.com', department: '技术研发部', quota: 500, used: 320, customQuota: true },
  { id: '2', name: '李四', email: 'lisi@company.com', department: '技术研发部', quota: 200, used: 180, customQuota: false },
  { id: '3', name: '王五', email: 'wangwu@company.com', department: '产品设计部', quota: 250, used: 120, customQuota: false },
  { id: '4', name: '赵六', email: 'zhaoliu@company.com', department: '市场运营部', quota: 250, used: 200, customQuota: true },
  { id: '5', name: '钱七', email: 'qianqi@company.com', department: '人力资源部', quota: 200, used: 50, customQuota: false },
];

export function QuotaManagement() {
  const [activeTab, setActiveTab] = useState('global');
  
  // Global quota state
  const [globalQuota, setGlobalQuota] = useState({
    enabled: true,
    monthlyBudget: 50000,
    alertThreshold: 80,
    defaultUserQuota: 200,
    defaultDepartmentQuota: 5000,
  });
  
  // Department quota state
  const [departments, setDepartments] = useState(mockDepartments);
  const [editingDepartment, setEditingDepartment] = useState<typeof mockDepartments[0] | null>(null);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  
  // Member quota state
  const [members, setMembers] = useState(mockMembers);
  const [editingMember, setEditingMember] = useState<typeof mockMembers[0] | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const handleSaveGlobalQuota = () => {
    toast.success('全局配额设置已保存');
  };

  const handleSaveDepartmentQuota = () => {
    if (editingDepartment) {
      setDepartments(prev => 
        prev.map(d => d.id === editingDepartment.id ? editingDepartment : d)
      );
      setDepartmentDialogOpen(false);
      setEditingDepartment(null);
      toast.success('部门配额已更新');
    }
  };

  const handleSaveMemberQuota = () => {
    if (editingMember) {
      setMembers(prev => 
        prev.map(m => m.id === editingMember.id ? { ...editingMember, customQuota: true } : m)
      );
      setMemberDialogOpen(false);
      setEditingMember(null);
      toast.success('成员配额已更新');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.includes(memberSearch) || 
    m.email.includes(memberSearch) ||
    m.department.includes(memberSearch)
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="global" className="gap-2">
            <Settings2 className="w-4 h-4" />
            全局配置
          </TabsTrigger>
          <TabsTrigger value="department" className="gap-2">
            <Building2 className="w-4 h-4" />
            部门配置
          </TabsTrigger>
          <TabsTrigger value="member" className="gap-2">
            <User className="w-4 h-4" />
            成员配置
          </TabsTrigger>
        </TabsList>

        {/* Global Configuration Tab */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用配额管理</Label>
                  <p className="text-sm text-muted-foreground">
                    开启后将根据配额限制用户使用
                  </p>
                </div>
                <Switch
                  checked={globalQuota.enabled}
                  onCheckedChange={(checked) => 
                    setGlobalQuota(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

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
                    disabled={!globalQuota.enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    组织每月可使用的最大金额
                  </p>
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
                    disabled={!globalQuota.enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    达到此比例时发送预警通知
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultUserQuota">默认成员配额（元/月）</Label>
                  <Input
                    id="defaultUserQuota"
                    type="number"
                    value={globalQuota.defaultUserQuota}
                    onChange={(e) => 
                      setGlobalQuota(prev => ({ ...prev, defaultUserQuota: Number(e.target.value) }))
                    }
                    disabled={!globalQuota.enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    新成员的默认月度配额
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultDepartmentQuota">默认部门配额（元/月）</Label>
                  <Input
                    id="defaultDepartmentQuota"
                    type="number"
                    value={globalQuota.defaultDepartmentQuota}
                    onChange={(e) => 
                      setGlobalQuota(prev => ({ ...prev, defaultDepartmentQuota: Number(e.target.value) }))
                    }
                    disabled={!globalQuota.enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    新部门的默认月度配额
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveGlobalQuota} className="gap-2">
                  <Save className="w-4 h-4" />
                  保存设置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>本月使用概览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>总预算使用</span>
                  <span className="font-medium">¥32,500 / ¥{globalQuota.monthlyBudget.toLocaleString()}</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">已使用 65%，距离预警阈值还有 15%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Configuration Tab */}
        <TabsContent value="department" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                部门配额配置
              </CardTitle>
              <CardDescription>
                为各部门设置独立的配额限制，未单独配置的部门将使用全局默认值
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>部门名称</TableHead>
                    <TableHead>成员数</TableHead>
                    <TableHead>月度配额（元）</TableHead>
                    <TableHead>已使用</TableHead>
                    <TableHead>使用率</TableHead>
                    <TableHead>配置来源</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => {
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
                        <TableCell>
                          <Badge variant={dept.inherited ? 'outline' : 'default'}>
                            {dept.inherited ? '继承全局' : '自定义'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingDepartment(dept);
                              setDepartmentDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Configuration Tab */}
        <TabsContent value="member" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    成员配额配置
                  </CardTitle>
                  <CardDescription>
                    为特定成员设置独立配额，未单独配置的成员将继承部门或全局配额
                  </CardDescription>
                </div>
                <Input
                  placeholder="搜索成员..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>成员</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>月度配额（元）</TableHead>
                    <TableHead>已使用</TableHead>
                    <TableHead>使用率</TableHead>
                    <TableHead>配置来源</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
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
                        <TableCell>
                          <Badge variant={member.customQuota ? 'default' : 'outline'}>
                            {member.customQuota ? '自定义' : '继承'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMember(member);
                              setMemberDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Department Edit Dialog */}
      <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑部门配额</DialogTitle>
            <DialogDescription>
              为 {editingDepartment?.name} 设置独立的月度配额
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>配置方式</Label>
                <Select
                  value={editingDepartment.inherited ? 'inherit' : 'custom'}
                  onValueChange={(value) => 
                    setEditingDepartment(prev => prev ? {
                      ...prev,
                      inherited: value === 'inherit',
                      quota: value === 'inherit' ? globalQuota.defaultDepartmentQuota : prev.quota
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">继承全局配置</SelectItem>
                    <SelectItem value="custom">自定义配额</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingDepartment.inherited && (
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
              )}

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

      {/* Member Edit Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员配额</DialogTitle>
            <DialogDescription>
              为 {editingMember?.name} 设置独立的月度配额
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>配置方式</Label>
                <Select
                  value={editingMember.customQuota ? 'custom' : 'inherit'}
                  onValueChange={(value) => 
                    setEditingMember(prev => prev ? {
                      ...prev,
                      customQuota: value === 'custom',
                      quota: value === 'inherit' ? globalQuota.defaultUserQuota : prev.quota
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">继承部门/全局配置</SelectItem>
                    <SelectItem value="custom">自定义配额</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingMember.customQuota && (
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
              )}

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
