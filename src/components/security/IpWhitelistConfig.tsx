import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  Globe,
  Server,
  RefreshCw
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Helper to check if an IP is within a CIDR range
function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  if (!bits) return ip === cidr;
  
  const ipParts = ip.split('.').map(Number);
  const rangeParts = range.split('.').map(Number);
  const mask = parseInt(bits, 10);
  
  let ipNum = 0;
  let rangeNum = 0;
  
  for (let i = 0; i < 4; i++) {
    ipNum = (ipNum << 8) + ipParts[i];
    rangeNum = (rangeNum << 8) + rangeParts[i];
  }
  
  const maskNum = ~((1 << (32 - mask)) - 1);
  return (ipNum & maskNum) === (rangeNum & maskNum);
}

export function IpWhitelistConfig() {
  const [rules, setRules] = useState<IpRule[]>(mockIpRules);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRule, setNewRule] = useState({ value: '', type: 'single' as 'single' | 'cidr', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [redundancyWarning, setRedundancyWarning] = useState<string | null>(null);

  const checkRedundancy = (value: string, type: 'single' | 'cidr') => {
    if (type === 'single') {
      // Check if this IP is covered by any existing CIDR
      for (const rule of rules) {
        if (rule.type === 'cidr' && ipInCidr(value, rule.value)) {
          return `该 IP 已被网段 ${rule.value} 包含`;
        }
        if (rule.type === 'single' && rule.value === value) {
          return '该 IP 已存在于白名单中';
        }
      }
    }
    return null;
  };

  const handleValueChange = (value: string) => {
    setNewRule(prev => ({ ...prev, value }));
    const warning = checkRedundancy(value, newRule.type);
    setRedundancyWarning(warning);
  };

  const handleAddRule = async () => {
    if (!newRule.value) {
      toast({ title: '请输入 IP 地址或网段', variant: 'destructive' });
      return;
    }

    if (redundancyWarning) {
      toast({ title: '规则冗余', description: redundancyWarning, variant: 'destructive' });
      return;
    }

    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const rule: IpRule = {
      id: Date.now().toString(),
      value: newRule.value,
      type: newRule.type,
      description: newRule.description || (newRule.type === 'single' ? '单个 IP' : 'CIDR 网段'),
      createdAt: new Date().toISOString(),
      createdBy: '张明',
    };

    setRules(prev => [rule, ...prev]);
    setShowAddDialog(false);
    setNewRule({ value: '', type: 'single', description: '' });
    setRedundancyWarning(null);
    setIsAdding(false);

    toast({
      title: 'IP 规则已添加',
      description: `${rule.value} 已加入白名单`,
    });
  };

  const handleDeleteRule = (rule: IpRule) => {
    setRules(prev => prev.filter(r => r.id !== rule.id));
    toast({
      title: 'IP 规则已删除',
      description: `${rule.value} 已从白名单移除`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">安全配置</h2>
          <p className="text-sm text-muted-foreground">管理 IP 白名单规则，保护 API 访问安全</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4" />
          添加规则
        </Button>
      </div>

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

      {/* Rules List */}
      <div className="enterprise-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>IP / 网段</th>
              <th>类型</th>
              <th>描述</th>
              <th>添加时间</th>
              <th>操作人</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="group">
                <td>
                  <div className="flex items-center gap-2">
                    {rule.type === 'single' ? (
                      <Server className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    )}
                    <code className="text-sm font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                      {rule.value}
                    </code>
                  </div>
                </td>
                <td>
                  <span className={cn(
                    "status-badge",
                    rule.type === 'single' ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                  )}>
                    {rule.type === 'single' ? '单个 IP' : 'CIDR'}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-foreground">{rule.description}</span>
                </td>
                <td>
                  <span className="text-sm text-muted-foreground">
                    {new Date(rule.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-foreground">{rule.createdBy}</span>
                </td>
                <td>
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteRule(rule)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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
              onClick={() => setShowAddDialog(true)}
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
                value={newRule.type}
                onValueChange={(value: 'single' | 'cidr') => setNewRule(prev => ({ ...prev, type: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer">单个 IP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cidr" id="cidr" />
                  <Label htmlFor="cidr" className="font-normal cursor-pointer">CIDR 网段</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip-value">
                {newRule.type === 'single' ? 'IP 地址' : 'CIDR 网段'}
              </Label>
              <Input 
                id="ip-value"
                placeholder={newRule.type === 'single' ? '例如: 192.168.1.100' : '例如: 192.168.1.0/24'}
                value={newRule.value}
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
              <Label htmlFor="description">描述 (可选)</Label>
              <Input 
                id="description"
                placeholder="例如: 办公室网络"
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddRule} disabled={isAdding || !!redundancyWarning}>
              {isAdding ? (
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
    </div>
  );
}
