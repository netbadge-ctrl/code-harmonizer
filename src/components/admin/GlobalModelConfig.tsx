import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Cpu, Eye, Users, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockCustomers } from '@/data/adminMockData';

interface GlobalModel {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'vision';
  typeLabel: string;
  description: string;
  contextLimit: string;
  enabled: boolean;
  enabledCustomerIds: string[]; // USS配置的可用客户（管理员控制）
  customerSelfEnabledIds: string[]; // 客户自行开通的（只读展示）
  lastCalledAt: string | null;
  customerLastCalled: Record<string, string | null>;
  defaultForCustomer: boolean;
}
const allGlobalModels: GlobalModel[] = [
  // 文本模型
  { id: 'gpt4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', type: 'text', typeLabel: '文本模型', description: '最强文本生成能力，支持128K上下文', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_005'], customerSelfEnabledIds: ['cust_001'], lastCalledAt: '2026-03-02 14:32', customerLastCalled: { 'cust_001': '2026-03-02 14:32', 'cust_005': '2026-03-01 09:15' }, defaultForCustomer: false },
  { id: 'gpt4o', name: 'GPT-4o', provider: 'OpenAI', type: 'text', typeLabel: '文本模型', description: '高性能多模态模型，速度与能力平衡', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_002', 'cust_004', 'cust_005', 'cust_006'], customerSelfEnabledIds: ['cust_001', 'cust_002', 'cust_005'], lastCalledAt: '2026-03-02 15:10', customerLastCalled: { 'cust_001': '2026-03-02 15:10', 'cust_002': '2026-03-02 11:45', 'cust_004': '2026-02-28 16:20', 'cust_005': '2026-03-01 20:30', 'cust_006': '2026-02-27 08:50' }, defaultForCustomer: false },
  { id: 'gpt4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', type: 'text', typeLabel: '文本模型', description: '轻量高效模型，适合日常任务', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_002', 'cust_003', 'cust_004', 'cust_005'], customerSelfEnabledIds: ['cust_001', 'cust_002', 'cust_003', 'cust_004'], lastCalledAt: '2026-03-02 16:05', customerLastCalled: { 'cust_001': '2026-03-02 16:05', 'cust_002': '2026-03-02 10:30', 'cust_003': '2026-02-25 14:10', 'cust_004': '2026-03-01 09:00', 'cust_005': '2026-03-02 12:45' }, defaultForCustomer: false },
  { id: 'claude35-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'text', typeLabel: '文本模型', description: '强大的推理和编程能力', contextLimit: '200K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_002', 'cust_005', 'cust_006'], customerSelfEnabledIds: ['cust_001', 'cust_005'], lastCalledAt: '2026-03-02 13:20', customerLastCalled: { 'cust_001': '2026-03-02 13:20', 'cust_002': '2026-03-01 17:40', 'cust_005': '2026-02-28 22:10', 'cust_006': '2026-02-26 11:30' }, defaultForCustomer: false },
  { id: 'claude3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'text', typeLabel: '文本模型', description: '最强推理能力，复杂任务首选', contextLimit: '200K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_005'], customerSelfEnabledIds: ['cust_001'], lastCalledAt: '2026-02-28 19:50', customerLastCalled: { 'cust_001': '2026-02-28 19:50', 'cust_005': '2026-02-27 15:30' }, defaultForCustomer: false },
  { id: 'claude3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', type: 'text', typeLabel: '文本模型', description: '极速响应，轻量任务优选', contextLimit: '200K', enabled: true, enabledCustomerIds: ['cust_005'], customerSelfEnabledIds: [], lastCalledAt: '2026-03-01 08:15', customerLastCalled: { 'cust_005': '2026-03-01 08:15' }, defaultForCustomer: false },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', type: 'text', typeLabel: '文本模型', description: '多模态理解与生成能力', contextLimit: '1M', enabled: true, enabledCustomerIds: ['cust_001', 'cust_005'], customerSelfEnabledIds: ['cust_001'], lastCalledAt: '2026-03-02 10:00', customerLastCalled: { 'cust_001': '2026-03-02 10:00', 'cust_005': '2026-02-28 14:20' }, defaultForCustomer: false },
  { id: 'ernie4', name: 'ERNIE-4.0', provider: '百度', type: 'text', typeLabel: '文本模型', description: '文心一言，中文理解能力出众', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_002', 'cust_003', 'cust_005', 'cust_006'], customerSelfEnabledIds: ['cust_001', 'cust_002', 'cust_003'], lastCalledAt: '2026-03-02 15:55', customerLastCalled: { 'cust_001': '2026-03-02 15:55', 'cust_002': '2026-03-02 09:30', 'cust_003': '2026-02-24 16:40', 'cust_005': '2026-03-01 18:20', 'cust_006': '2026-02-25 10:10' }, defaultForCustomer: false },
  { id: 'qwen-max', name: 'Qwen-Max', provider: '阿里巴巴', type: 'text', typeLabel: '文本模型', description: '通义千问旗舰模型', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_002', 'cust_005', 'cust_006'], customerSelfEnabledIds: ['cust_001', 'cust_002'], lastCalledAt: '2026-03-02 14:10', customerLastCalled: { 'cust_001': '2026-03-02 14:10', 'cust_002': '2026-03-01 20:15', 'cust_005': '2026-02-28 11:30', 'cust_006': '2026-02-27 09:45' }, defaultForCustomer: false },
  { id: 'qwen-turbo', name: 'Qwen-Turbo', provider: '阿里巴巴', type: 'text', typeLabel: '文本模型', description: '通义千问高速版', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_003', 'cust_005'], customerSelfEnabledIds: ['cust_003'], lastCalledAt: '2026-03-01 22:30', customerLastCalled: { 'cust_003': '2026-02-26 13:50', 'cust_005': '2026-03-01 22:30' }, defaultForCustomer: false },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', type: 'text', typeLabel: '文本模型', description: '代码理解与生成专家', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_005'], customerSelfEnabledIds: ['cust_001', 'cust_005'], lastCalledAt: '2026-03-02 11:25', customerLastCalled: { 'cust_001': '2026-03-02 11:25', 'cust_005': '2026-02-28 17:40' }, defaultForCustomer: false },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot', type: 'text', typeLabel: '文本模型', description: '长文本理解与生成，支持200K上下文', contextLimit: '200K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_002', 'cust_005'], customerSelfEnabledIds: ['cust_001', 'cust_002'], lastCalledAt: '2026-03-02 09:40', customerLastCalled: { 'cust_001': '2026-03-02 09:40', 'cust_002': '2026-03-01 14:55', 'cust_005': '2026-02-27 21:10' }, defaultForCustomer: true },
  // 视觉理解模型
  { id: 'gpt4-vision', name: 'GPT-4 Vision', provider: 'OpenAI', type: 'vision', typeLabel: '视觉理解', description: '图像理解与分析能力', contextLimit: '128K', enabled: true, enabledCustomerIds: ['cust_001', 'cust_005'], customerSelfEnabledIds: ['cust_001'], lastCalledAt: '2026-03-01 16:45', customerLastCalled: { 'cust_001': '2026-03-01 16:45', 'cust_005': '2026-02-28 10:30' }, defaultForCustomer: false },
  { id: 'qwen-vl-max', name: 'Qwen-VL-Max', provider: '阿里巴巴', type: 'vision', typeLabel: '视觉理解', description: '通义千问视觉语言模型', contextLimit: '32K', enabled: false, enabledCustomerIds: [], customerSelfEnabledIds: [], lastCalledAt: null, customerLastCalled: {}, defaultForCustomer: false },
  { id: 'gemini-vision', name: 'Gemini Pro Vision', provider: 'Google', type: 'vision', typeLabel: '视觉理解', description: '高精度图像识别与理解', contextLimit: '1M', enabled: true, enabledCustomerIds: ['cust_001'], customerSelfEnabledIds: [], lastCalledAt: '2026-02-27 13:20', customerLastCalled: { 'cust_001': '2026-02-27 13:20' }, defaultForCustomer: false },
  { id: 'claude3-vision', name: 'Claude 3 Vision', provider: 'Anthropic', type: 'vision', typeLabel: '视觉理解', description: '多图理解与跨图推理', contextLimit: '200K', enabled: false, enabledCustomerIds: [], customerSelfEnabledIds: [], lastCalledAt: null, customerLastCalled: {}, defaultForCustomer: false },
];

const typeIcons: Record<string, React.ReactNode> = {
  text: <Cpu className="w-3.5 h-3.5" />,
  vision: <Eye className="w-3.5 h-3.5" />,
};

const typeColors: Record<string, string> = {
  text: 'bg-blue-500/10 text-blue-600 border-blue-200',
  vision: 'bg-purple-500/10 text-purple-600 border-purple-200',
};

export function GlobalModelConfig() {
  const [models, setModels] = useState<GlobalModel[]>(allGlobalModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [selectedModel, setSelectedModel] = useState<GlobalModel | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const handleToggleCustomerForModel = (modelId: string, customerId: string, enabled: boolean) => {
    setModels(prev => prev.map(m => {
      if (m.id !== modelId) return m;
      const newIds = enabled
        ? [...m.enabledCustomerIds, customerId]
        : m.enabledCustomerIds.filter(id => id !== customerId);
      return { ...m, enabledCustomerIds: newIds };
    }));
    // Also update selectedModel if it's the current one
    setSelectedModel(prev => {
      if (!prev || prev.id !== modelId) return prev;
      const newIds = enabled
        ? [...prev.enabledCustomerIds, customerId]
        : prev.enabledCustomerIds.filter(id => id !== customerId);
      return { ...prev, enabledCustomerIds: newIds };
    });
  };

  const filteredModels = models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Group by type
  const groupedModels = filteredModels.reduce<Record<string, GlobalModel[]>>((acc, m) => {
    const key = m.typeLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const enabledCount = models.filter(m => m.enabled).length;
  const totalCustomersUsingModels = new Set(models.flatMap(m => m.enabledCustomerIds)).size;

  const openCustomerDialog = (model: GlobalModel) => {
    setSelectedModel(model);
    setCustomerDialogOpen(true);
  };

  const getCustomerInfo = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId);
  };

  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'text', label: '文本模型' },
    { value: 'vision', label: '视觉理解' },
  ];

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <Card className="enterprise-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模型名称或提供商..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="text-xs text-muted-foreground">
              已启用 {enabledCount}/{models.length} 个模型
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Groups */}
      {Object.entries(groupedModels).map(([typeLabel, typeModels]) => (
        <Card key={typeLabel} className="enterprise-card">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {typeIcons[typeModels[0].type]}
              {typeLabel}
              <Badge variant="secondary" className="text-xs font-normal">{typeModels.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {/* Table header */}
            <div className="flex items-center px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              <div className="w-[180px] shrink-0">模型名称</div>
              <div className="flex-1 min-w-0">描述</div>
              <div className="w-[140px] shrink-0">最后调用时间</div>
              <div className="w-[120px] shrink-0">模型可用客户</div>
              <div className="w-[110px] shrink-0 text-right">客户默认可用</div>
            </div>
            <div className="divide-y divide-border">
              {typeModels.map(model => (
                <div key={model.id} className="flex items-center justify-between px-3 py-3 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-[180px] shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{model.name}</span>
                        {model.contextLimit !== '-' && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {model.contextLimit}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{model.description}</p>
                    </div>

                    {/* Last called */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 w-[140px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{model.lastCalledAt || '暂无调用'}</span>
                    </div>

                    {/* Customer count */}
                    <button
                      onClick={() => openCustomerDialog(model)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-primary hover:bg-primary/10 cursor-pointer shrink-0"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-medium">{model.defaultForCustomer ? mockCustomers.length : model.enabledCustomerIds.length}</span>
                      <span className="text-muted-foreground">客户</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Default for customer checkbox */}
                  <div className="flex items-center gap-3 ml-4">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <Checkbox
                        checked={model.defaultForCustomer}
                        onCheckedChange={(checked) => {
                          setModels(prev => prev.map(m => m.id === model.id ? { ...m, defaultForCustomer: !!checked } : m));
                        }}
                      />
                      <span className="text-xs text-muted-foreground">客户默认可用</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredModels.length === 0 && (
        <Card className="enterprise-card">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">没有找到匹配的模型</p>
          </CardContent>
        </Card>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Cpu className="w-4 h-4" />
              {selectedModel?.name}
              <span className="text-muted-foreground font-normal">— 客户管理</span>
            </DialogTitle>
            <div className="flex gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">可用</Badge>
                <span>USS配置允许使用</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600">已开通</Badge>
                <span>客户自行开通</span>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客户名称</TableHead>
                  <TableHead>客户识别码</TableHead>
                  <TableHead>订阅方案</TableHead>
                  <TableHead>订阅状态</TableHead>
                  <TableHead>最后调用时间</TableHead>
                  <TableHead className="text-center">可用状态</TableHead>
                  <TableHead className="text-center">开通状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomers.map(customer => {
                  const isDefault = selectedModel?.defaultForCustomer ?? false;
                  const isAvailable = isDefault || (selectedModel?.enabledCustomerIds.includes(customer.id) ?? false);
                  const isSelfEnabled = selectedModel?.customerSelfEnabledIds.includes(customer.id) ?? false;
                  const lastCalled = selectedModel?.customerLastCalled[customer.id];
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.companyName}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{customer.customerCode}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.subscription.plan === 'professional' ? 'default' : 'secondary'} className="text-xs">
                          {customer.subscription.plan === 'professional' ? '专业版' : '基础版'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs",
                          customer.subscription.status === 'active' && 'border-emerald-300 text-emerald-600 bg-emerald-50',
                          customer.subscription.status === 'trial' && 'border-amber-300 text-amber-600 bg-amber-50',
                          customer.subscription.status === 'expired' && 'border-red-300 text-red-600 bg-red-50',
                        )}>
                          {customer.subscription.status === 'active' ? '正常' : customer.subscription.status === 'trial' ? '试用' : '已过期'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{lastCalled || '暂无调用'}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isDefault && (
                            <Badge variant="secondary" className="text-[10px]">默认</Badge>
                          )}
                          <Switch
                            checked={isAvailable}
                            disabled={isDefault}
                            onCheckedChange={(checked) => selectedModel && handleToggleCustomerForModel(selectedModel.id, customer.id, checked)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isAvailable ? (
                          isSelfEnabled ? (
                            <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 bg-emerald-50">已开通</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">未开通</Badge>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
