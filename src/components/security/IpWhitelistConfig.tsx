import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  Globe,
  Server,
  RefreshCw,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockIpRules } from '@/data/mockData';
import { IpRule } from '@/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Helper to parse IP to number
function ipToNum(ip: string): number {
  const parts = ip.split('.').map(Number);
  let num = 0;
  for (let i = 0; i < 4; i++) {
    num = (num << 8) + parts[i];
  }
  return num >>> 0; // Convert to unsigned
}

// Helper to check if an IP is within a CIDR range
function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  if (!bits) return ip === cidr;
  
  const ipNum = ipToNum(ip);
  const rangeNum = ipToNum(range);
  const mask = parseInt(bits, 10);
  const maskNum = (~((1 << (32 - mask)) - 1)) >>> 0;
  
  return (ipNum & maskNum) === (rangeNum & maskNum);
}

// Helper to check if a CIDR range is contained within another CIDR range
function cidrInCidr(smallerCidr: string, largerCidr: string): boolean {
  const [smallRange, smallBits] = smallerCidr.split('/');
  const [largeRange, largeBits] = largerCidr.split('/');
  
  if (!largeBits) return false;
  if (!smallBits) {
    // It's a single IP, check if it's in the larger CIDR
    return ipInCidr(smallRange, largerCidr);
  }
  
  const smallMask = parseInt(smallBits, 10);
  const largeMask = parseInt(largeBits, 10);
  
  // Smaller CIDR must have a larger or equal mask number to be contained
  if (smallMask < largeMask) return false;
  
  // Check if the network addresses match when applying the larger mask
  const smallNum = ipToNum(smallRange);
  const largeNum = ipToNum(largeRange);
  const maskNum = (~((1 << (32 - largeMask)) - 1)) >>> 0;
  
  return (smallNum & maskNum) === (largeNum & maskNum);
}

// Helper to check if an IP is a private/internal IP
function isPrivateIp(ip: string): boolean {
  const num = ipToNum(ip);
  
  // 10.0.0.0 - 10.255.255.255 (10.0.0.0/8)
  const tenStart = ipToNum('10.0.0.0');
  const tenEnd = ipToNum('10.255.255.255');
  if (num >= tenStart && num <= tenEnd) return true;
  
  // 172.16.0.0 - 172.31.255.255 (172.16.0.0/12)
  const oneSevenTwoStart = ipToNum('172.16.0.0');
  const oneSevenTwoEnd = ipToNum('172.31.255.255');
  if (num >= oneSevenTwoStart && num <= oneSevenTwoEnd) return true;
  
  // 192.168.0.0 - 192.168.255.255 (192.168.0.0/16)
  const oneNineTwoStart = ipToNum('192.168.0.0');
  const oneNineTwoEnd = ipToNum('192.168.255.255');
  if (num >= oneNineTwoStart && num <= oneNineTwoEnd) return true;
  
  return false;
}

// Helper to check if a CIDR range contains any private IPs
function cidrContainsPrivateIp(cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  if (!bits) return isPrivateIp(range);
  
  const rangeNum = ipToNum(range);
  const mask = parseInt(bits, 10);
  const hostBits = 32 - mask;
  const networkSize = Math.pow(2, hostBits);
  
  // Check start and end of the range
  const startIp = rangeNum;
  const endIp = rangeNum + networkSize - 1;
  
  // Check if any part of the range overlaps with private ranges
  const privateRanges = [
    { start: ipToNum('10.0.0.0'), end: ipToNum('10.255.255.255') },
    { start: ipToNum('172.16.0.0'), end: ipToNum('172.31.255.255') },
    { start: ipToNum('192.168.0.0'), end: ipToNum('192.168.255.255') },
  ];
  
  for (const pr of privateRanges) {
    if (startIp <= pr.end && endIp >= pr.start) return true;
  }
  
  return false;
}

export function IpWhitelistConfig() {
  const [rules, setRules] = useState<IpRule[]>(mockIpRules);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<IpRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<IpRule | null>(null);
  const [formData, setFormData] = useState({ value: '', type: 'single' as 'single' | 'cidr', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redundancyWarning, setRedundancyWarning] = useState<string | null>(null);

  // Calculate which rules are contained within other rules
  const containedRules = useMemo(() => {
    const contained: Record<string, string> = {}; // ruleId -> containing rule value
    
    for (const rule of rules) {
      for (const otherRule of rules) {
        if (rule.id === otherRule.id) continue;
        if (otherRule.type !== 'cidr') continue;
        
        let isContained = false;
        if (rule.type === 'single') {
          isContained = ipInCidr(rule.value, otherRule.value);
        } else if (rule.type === 'cidr') {
          isContained = cidrInCidr(rule.value, otherRule.value);
        }
        
        if (isContained) {
          contained[rule.id] = otherRule.value;
          break;
        }
      }
    }
    
    return contained;
  }, [rules]);

  const checkRedundancy = (value: string, type: 'single' | 'cidr', excludeId?: string) => {
    const filteredRules = excludeId ? rules.filter(r => r.id !== excludeId) : rules;
    
    if (type === 'single') {
      for (const rule of filteredRules) {
        if (rule.type === 'cidr' && ipInCidr(value, rule.value)) {
          return `该 IP 已被网段 ${rule.value} 包含`;
        }
        if (rule.type === 'single' && rule.value === value) {
          return '该 IP 已存在于白名单中';
        }
      }
    } else {
      for (const rule of filteredRules) {
        if (rule.type === 'cidr' && rule.value === value) {
          return '该网段已存在于白名单中';
        }
      }
    }
    return null;
  };

  const handleValueChange = (value: string) => {
    setFormData(prev => ({ ...prev, value }));
    const warning = checkRedundancy(value, formData.type, editingRule?.id);
    setRedundancyWarning(warning);
  };

  const resetForm = () => {
    setFormData({ value: '', type: 'single', description: '' });
    setRedundancyWarning(null);
    setEditingRule(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (rule: IpRule) => {
    setEditingRule(rule);
    setFormData({
      value: rule.value,
      type: rule.type,
      description: rule.description,
    });
    setRedundancyWarning(null);
    setShowEditDialog(true);
  };

  const handleOpenDelete = (rule: IpRule) => {
    setDeletingRule(rule);
    setShowDeleteDialog(true);
  };

  const handleAddRule = async () => {
    if (!formData.value) {
      toast({ title: '请输入 IP 地址或网段', variant: 'destructive' });
      return;
    }

    // Validate private IP
    const isPrivate = formData.type === 'single' 
      ? isPrivateIp(formData.value.split('/')[0])
      : cidrContainsPrivateIp(formData.value);
    
    if (isPrivate) {
      toast({ 
        title: '不支持内网 IP', 
        description: '仅支持添加公网 IP 或网段，不支持 10.x.x.x、192.168.x.x、172.16-31.x.x 等内网地址',
        variant: 'destructive' 
      });
      return;
    }

    if (redundancyWarning) {
      toast({ title: '规则冗余', description: redundancyWarning, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const rule: IpRule = {
      id: Date.now().toString(),
      value: formData.value,
      type: formData.type,
      description: formData.description || (formData.type === 'single' ? '单个 IP' : 'CIDR 网段'),
      createdAt: new Date().toISOString(),
      createdBy: '张明',
    };

    setRules(prev => [rule, ...prev]);
    setShowAddDialog(false);
    resetForm();
    setIsSubmitting(false);

    toast({
      title: 'IP 规则已添加',
      description: `${rule.value} 已加入白名单`,
    });
  };

  const handleEditRule = async () => {
    if (!editingRule || !formData.value) {
      toast({ title: '请输入 IP 地址或网段', variant: 'destructive' });
      return;
    }

    // Validate private IP
    const isPrivate = formData.type === 'single' 
      ? isPrivateIp(formData.value.split('/')[0])
      : cidrContainsPrivateIp(formData.value);
    
    if (isPrivate) {
      toast({ 
        title: '不支持内网 IP', 
        description: '仅支持添加公网 IP 或网段，不支持 10.x.x.x、192.168.x.x、172.16-31.x.x 等内网地址',
        variant: 'destructive' 
      });
      return;
    }

    if (redundancyWarning) {
      toast({ title: '规则冗余', description: redundancyWarning, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setRules(prev => prev.map(r => 
      r.id === editingRule.id 
        ? { ...r, value: formData.value, type: formData.type, description: formData.description || r.description }
        : r
    ));
    setShowEditDialog(false);
    resetForm();
    setIsSubmitting(false);

    toast({
      title: 'IP 规则已更新',
      description: `规则已成功修改`,
    });
  };

  const handleDeleteRule = async () => {
    if (!deletingRule) return;
    
    setRules(prev => prev.filter(r => r.id !== deletingRule.id));
    setShowDeleteDialog(false);
    
    toast({
      title: 'IP 规则已删除',
      description: `${deletingRule.value} 已从白名单移除`,
    });
    setDeletingRule(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Info Card */}
      <div className="enterprise-card p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">IP 白名单说明</p>
            <p className="text-sm text-muted-foreground mt-1">
              只有来自白名单 IP 的请求才能访问 AI 服务 API。支持单个 IP 地址和 CIDR 网段格式。
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-end">
        <Button size="sm" className="gap-2" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          添加规则
        </Button>
      </div>

      {/* Rules List */}
      <div className="enterprise-card overflow-hidden">
        <table className="data-table w-full table-fixed">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>IP / 网段</th>
              <th style={{ width: '10%' }}>类型</th>
              <th style={{ width: '25%' }}>描述</th>
              <th style={{ width: '22%' }}>状态</th>
              <th style={{ width: '12%' }}>添加时间</th>
              <th style={{ width: '13%' }} className="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              const containingRule = containedRules[rule.id];
              
              return (
                <tr key={rule.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {rule.type === 'single' ? (
                        <Server className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <code className="text-sm font-mono text-foreground bg-muted px-2 py-0.5 rounded truncate">
                        {rule.value}
                      </code>
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "status-badge whitespace-nowrap",
                      rule.type === 'single' ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                    )}>
                      {rule.type === 'single' ? '单个 IP' : 'CIDR'}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-foreground truncate block">{rule.description}</span>
                  </td>
                  <td>
                    {containingRule ? (
                      <div className="flex items-center gap-1.5 text-warning">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs truncate">被 {containingRule} 包含</span>
                      </div>
                    ) : (
                      <span className="status-badge status-badge-success">正常</span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(rule.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleOpenEdit(rule)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleOpenDelete(rule)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rules.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">暂无 IP 白名单规则</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={handleOpenAdd}
            >
              添加第一条规则
            </Button>
          </div>
        )}
      </div>

      {/* Add Rule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加 IP 白名单规则</DialogTitle>
            <DialogDescription>
              添加允许访问 API 的 IP 地址或网段
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>规则类型</Label>
              <RadioGroup 
                value={formData.type}
                onValueChange={(value: 'single' | 'cidr') => setFormData(prev => ({ ...prev, type: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="add-single" />
                  <Label htmlFor="add-single" className="font-normal cursor-pointer">单个 IP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cidr" id="add-cidr" />
                  <Label htmlFor="add-cidr" className="font-normal cursor-pointer">CIDR 网段</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-ip-value">
                {formData.type === 'single' ? 'IP 地址' : 'CIDR 网段'}
              </Label>
              <Input 
                id="add-ip-value"
                placeholder={formData.type === 'single' ? '例如: 116.228.89.156' : '例如: 203.119.24.0/24'}
                value={formData.value}
                onChange={(e) => handleValueChange(e.target.value)}
              />
              {redundancyWarning && (
                <div className="flex items-center gap-2 text-xs text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {redundancyWarning}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">描述 (可选)</Label>
              <Input 
                id="add-description"
                placeholder="例如: 办公室网络"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddRule} disabled={isSubmitting || !!redundancyWarning}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  添加中...
                </>
              ) : (
                '添加规则'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑 IP 白名单规则</DialogTitle>
            <DialogDescription>
              修改 IP 地址或网段配置
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>规则类型</Label>
              <RadioGroup 
                value={formData.type}
                onValueChange={(value: 'single' | 'cidr') => setFormData(prev => ({ ...prev, type: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="edit-single" />
                  <Label htmlFor="edit-single" className="font-normal cursor-pointer">单个 IP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cidr" id="edit-cidr" />
                  <Label htmlFor="edit-cidr" className="font-normal cursor-pointer">CIDR 网段</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ip-value">
                {formData.type === 'single' ? 'IP 地址' : 'CIDR 网段'}
              </Label>
              <Input 
                id="edit-ip-value"
                placeholder={formData.type === 'single' ? '例如: 116.228.89.156' : '例如: 203.119.24.0/24'}
                value={formData.value}
                onChange={(e) => handleValueChange(e.target.value)}
              />
              {redundancyWarning && (
                <div className="flex items-center gap-2 text-xs text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {redundancyWarning}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">描述 (可选)</Label>
              <Input 
                id="edit-description"
                placeholder="例如: 办公室网络"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditRule} disabled={isSubmitting || !!redundancyWarning}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存修改'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 IP 规则 <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">{deletingRule?.value}</code> 吗？删除后，来自该地址的请求将无法访问 API。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}