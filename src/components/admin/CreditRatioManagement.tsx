import React, { useState } from 'react';
import { 
  Coins, 
  Search, 
  Save, 
  RotateCcw, 
  Info,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ModelCreditConfig {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'vision';
  tier: 'premium' | 'standard' | 'basic';
  inputRatio: number;  // 输入token倍率
  outputRatio: number; // 输出token倍率
  enabled: boolean;
  description: string;
}

const mockModelConfigs: ModelCreditConfig[] = [
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    type: 'text',
    tier: 'premium',
    inputRatio: 1.5,
    outputRatio: 2.0,
    enabled: true,
    description: '最新一代Claude模型，综合能力最强',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'vision',
    tier: 'premium',
    inputRatio: 1.2,
    outputRatio: 1.8,
    enabled: true,
    description: '支持多模态的GPT-4模型',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    type: 'text',
    tier: 'basic',
    inputRatio: 0.5,
    outputRatio: 0.8,
    enabled: true,
    description: '高性价比的开源模型',
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: '阿里云',
    type: 'text',
    tier: 'standard',
    inputRatio: 0.8,
    outputRatio: 1.2,
    enabled: true,
    description: '通义千问旗舰版模型',
  },
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'Moonshot',
    type: 'text',
    tier: 'standard',
    inputRatio: 1.0,
    outputRatio: 1.5,
    enabled: true,
    description: '支持超长上下文的模型',
  },
  {
    id: 'glm-4v',
    name: 'GLM-4V',
    provider: '智谱AI',
    type: 'vision',
    tier: 'standard',
    inputRatio: 0.9,
    outputRatio: 1.3,
    enabled: true,
    description: '智谱多模态大模型',
  },
  {
    id: 'yi-vision',
    name: 'Yi Vision',
    provider: '零一万物',
    type: 'vision',
    tier: 'basic',
    inputRatio: 0.6,
    outputRatio: 0.9,
    enabled: true,
    description: '高效的视觉理解模型',
  },
  {
    id: 'minimax-m2',
    name: 'MiniMax M2',
    provider: 'MiniMax',
    type: 'text',
    tier: 'standard',
    inputRatio: 0.7,
    outputRatio: 1.0,
    enabled: false,
    description: '擅长创意写作的模型',
  },
];

const tierConfig = {
  premium: { label: '高级', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Sparkles },
  standard: { label: '标准', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Star },
  basic: { label: '基础', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Zap },
};

export function CreditRatioManagement() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ModelCreditConfig[]>(mockModelConfigs);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'vision'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'premium' | 'standard' | 'basic'>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 编辑对话框
  const [editingModel, setEditingModel] = useState<ModelCreditConfig | null>(null);
  const [tempInputRatio, setTempInputRatio] = useState('');
  const [tempOutputRatio, setTempOutputRatio] = useState('');
  const [tempTier, setTempTier] = useState<'premium' | 'standard' | 'basic'>('standard');

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || config.type === typeFilter;
    const matchesTier = tierFilter === 'all' || config.tier === tierFilter;
    return matchesSearch && matchesType && matchesTier;
  });

  const handleEditModel = (model: ModelCreditConfig) => {
    setEditingModel(model);
    setTempInputRatio(model.inputRatio.toString());
    setTempOutputRatio(model.outputRatio.toString());
    setTempTier(model.tier);
  };

  const handleSaveModelEdit = () => {
    if (!editingModel) return;
    
    const inputRatio = parseFloat(tempInputRatio);
    const outputRatio = parseFloat(tempOutputRatio);
    
    if (isNaN(inputRatio) || isNaN(outputRatio) || inputRatio <= 0 || outputRatio <= 0) {
      toast({
        title: '无效的倍率值',
        description: '倍率必须是大于0的数字',
        variant: 'destructive',
      });
      return;
    }

    setConfigs(prev => prev.map(c => 
      c.id === editingModel.id 
        ? { ...c, inputRatio, outputRatio, tier: tempTier }
        : c
    ));
    setHasChanges(true);
    setEditingModel(null);
    toast({
      title: '模型配置已更新',
      description: `${editingModel.name} 的积分倍率已修改`,
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
    toast({
      title: '配置已保存',
      description: '所有积分倍率配置已保存到服务器',
    });
  };

  const handleReset = () => {
    setConfigs(mockModelConfigs);
    setHasChanges(false);
    toast({
      title: '已重置',
      description: '所有配置已恢复到初始状态',
    });
  };

  // 统计信息
  const stats = {
    total: configs.length,
    premium: configs.filter(c => c.tier === 'premium').length,
    standard: configs.filter(c => c.tier === 'standard').length,
    basic: configs.filter(c => c.tier === 'basic').length,
    avgInputRatio: (configs.reduce((sum, c) => sum + c.inputRatio, 0) / configs.length).toFixed(2),
    avgOutputRatio: (configs.reduce((sum, c) => sum + c.outputRatio, 0) / configs.length).toFixed(2),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 标题和说明 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            积分倍率配置
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            配置不同模型的积分消耗倍率，影响用户调用时的积分扣除
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveAll}
            disabled={!hasChanges || isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">模型总数</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className={tierConfig.premium.color}>
                  {stats.premium}
                </Badge>
                <Badge variant="outline" className={tierConfig.standard.color}>
                  {stats.standard}
                </Badge>
                <Badge variant="outline" className={tierConfig.basic.color}>
                  {stats.basic}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">平均输入倍率</p>
            <p className="text-2xl font-bold">{stats.avgInputRatio}x</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">平均输出倍率</p>
            <p className="text-2xl font-bold">{stats.avgOutputRatio}x</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">计费公式</p>
                <p className="text-xs mt-1">
                  积分 = 输入Token × 输入倍率 + 输出Token × 输出倍率
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索模型或提供商..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-card border-border w-56"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'text' | 'vision')}>
          <SelectTrigger className="w-32 h-9 bg-card border-border">
            <SelectValue placeholder="模型类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="text">文本模型</SelectItem>
            <SelectItem value="vision">视觉模型</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as 'all' | 'premium' | 'standard' | 'basic')}>
          <SelectTrigger className="w-28 h-9 bg-card border-border">
            <SelectValue placeholder="等级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部等级</SelectItem>
            <SelectItem value="premium">高级</SelectItem>
            <SelectItem value="standard">标准</SelectItem>
            <SelectItem value="basic">基础</SelectItem>
          </SelectContent>
        </Select>
        {hasChanges && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            有未保存的更改
          </Badge>
        )}
      </div>

      {/* 模型列表 */}
      <Card className="enterprise-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">模型名称</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>等级</TableHead>
                <TableHead className="text-right">输入倍率</TableHead>
                <TableHead className="text-right">输出倍率</TableHead>
                <TableHead className="text-right">状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.map((config) => {
                const TierIcon = tierConfig[config.tier].icon;
                return (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{config.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {config.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{config.provider}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {config.type === 'text' ? '文本' : '视觉'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs gap-1", tierConfig[config.tier].color)}
                      >
                        <TierIcon className="w-3 h-3" />
                        {tierConfig[config.tier].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {config.inputRatio}x
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {config.outputRatio}x
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline" 
                        className={config.enabled 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : 'bg-muted text-muted-foreground'
                        }
                      >
                        {config.enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditModel(config)}
                      >
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

      {/* 编辑对话框 */}
      <Dialog open={!!editingModel} onOpenChange={(open) => !open && setEditingModel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑积分倍率</DialogTitle>
            <DialogDescription>
              配置 {editingModel?.name} 的积分消耗倍率
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>输入Token倍率</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={tempInputRatio}
                  onChange={(e) => setTempInputRatio(e.target.value)}
                  placeholder="如: 1.0"
                />
                <p className="text-xs text-muted-foreground">
                  每1000输入Token消耗的积分系数
                </p>
              </div>
              <div className="space-y-2">
                <Label>输出Token倍率</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={tempOutputRatio}
                  onChange={(e) => setTempOutputRatio(e.target.value)}
                  placeholder="如: 1.5"
                />
                <p className="text-xs text-muted-foreground">
                  每1000输出Token消耗的积分系数
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>模型等级</Label>
              <Select value={tempTier} onValueChange={(v) => setTempTier(v as 'premium' | 'standard' | 'basic')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      高级 - 旗舰模型
                    </div>
                  </SelectItem>
                  <SelectItem value="standard">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      标准 - 主流模型
                    </div>
                  </SelectItem>
                  <SelectItem value="basic">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      基础 - 经济型模型
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-accent rounded-lg p-3">
              <p className="text-sm">
                <span className="text-muted-foreground">示例计算：</span>
                假设调用使用 1000 输入Token 和 500 输出Token
              </p>
              <p className="text-sm font-medium mt-1">
                积分消耗 = 1000 × {tempInputRatio || '0'} + 500 × {tempOutputRatio || '0'} = {' '}
                <span className="text-primary">
                  {((parseFloat(tempInputRatio) || 0) * 1000 + (parseFloat(tempOutputRatio) || 0) * 500).toFixed(0)}
                </span>
                {' '}积分
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingModel(null)}>
              取消
            </Button>
            <Button onClick={handleSaveModelEdit}>
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
