import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Building2, Users, Zap, Shield, Clock, Activity, Settings, Globe, Eye, CalendarIcon, Cloud, Server, Database, Network, HardDrive, Cpu, MemoryStick, AlertTriangle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomerDetail as CustomerDetailType } from '@/types/admin';
import { getCustomerDetail } from '@/data/adminMockData';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

const planLabels: Record<string, string> = {
  starter: '基础版',
  professional: '专业版',
};

const statusLabels: Record<string, string> = {
  trial: '试用',
  active: '正常',
  expired: '已过期',
};

const authMethodLabels: Record<string, string> = {
  wps365: '金山协作',
  wecom: '企业微信',
  dingtalk: '钉钉',
  feishu: '飞书',
  none: '未配置',
};

const COLORS = ['hsl(213, 94%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(220, 9%, 46%)'];

const ERROR_COLORS: Record<string, string> = {
  '429': 'hsl(45, 93%, 47%)',
  '500': 'hsl(0, 84%, 60%)',
  '503': 'hsl(25, 95%, 53%)',
  '504': 'hsl(270, 50%, 60%)',
  '400': 'hsl(213, 94%, 50%)',
  '401': 'hsl(0, 72%, 51%)',
};

const errorTypes = [
  { code: '429', name: '请求频率限制', description: 'Rate limit exceeded' },
  { code: '500', name: '服务器内部错误', description: 'Internal server error' },
  { code: '503', name: '服务不可用', description: 'Service unavailable' },
  { code: '504', name: '网关超时', description: 'Gateway timeout' },
  { code: '400', name: '请求参数错误', description: 'Bad request' },
  { code: '401', name: '认证失败', description: 'Unauthorized' },
];

// 20个模型列表
const availableModels = [
  'GPT-4 Turbo',
  'GPT-4o',
  'GPT-4o Mini',
  'Claude 3.5 Sonnet',
  'Claude 3 Opus',
  'DeepSeek V3',
  'Kimi K2',
  'Qwen 2.5 Max',
  'GLM-4',
  'Gemini 1.5 Pro',
  'Gemini 1.5 Flash',
  'Mistral Large',
  'Llama 3.1 405B',
  'Yi Large',
  'Baichuan 4',
  'InternLM 2.5',
  'Doubao Pro',
  'Moonshot V1',
  'Spark Max',
  'Hunyuan Pro',
];

function formatTokens(tokens: number): string {
  if (tokens >= 1000000000) {
    return (tokens / 1000000000).toFixed(1) + 'B';
  }
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(1) + 'M';
  }
  if (tokens >= 1000) {
    return (tokens / 1000).toFixed(1) + 'K';
  }
  return tokens.toString();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const customer = getCustomerDetail(customerId);
  const { toast } = useToast();
  
  const [timeRangePreset, setTimeRangePreset] = useState<string>('7days');
  const [usageDateRange, setUsageDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [selectedErrorCode, setSelectedErrorCode] = useState<string | null>(null);
  const [errorPage, setErrorPage] = useState(1);
  const [selectedErrorDetail, setSelectedErrorDetail] = useState<any | null>(null);
  const usersPerPage = 10;
  const errorPageSize = 10;

  // 时间范围预设选项
  const timeRangePresets = [
    { value: '15min', label: '最近15分钟', duration: 15 * 60 * 1000 },
    { value: '4hours', label: '最近4小时', duration: 4 * 60 * 60 * 1000 },
    { value: '24hours', label: '最近24小时', duration: 24 * 60 * 60 * 1000 },
    { value: '7days', label: '最近7天', duration: 7 * 24 * 60 * 60 * 1000 },
    { value: 'custom', label: '自定义' },
  ];

  const handleTimeRangePresetChange = (preset: string) => {
    setTimeRangePreset(preset);
    if (preset !== 'custom') {
      const presetConfig = timeRangePresets.find(p => p.value === preset);
      if (presetConfig && presetConfig.duration) {
        setUsageDateRange({
          from: new Date(Date.now() - presetConfig.duration),
          to: new Date(),
        });
      }
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '已复制',
      description: `${label}已复制到剪贴板`,
    });
  };

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">客户信息未找到</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          返回列表
        </Button>
      </div>
    );
  }

  // 生成模型使用数据 (20个模型)
  const modelUsageData = useMemo(() => {
    return availableModels.map((model, i) => {
      const factor = Math.max(0.02, 0.18 - i * 0.008);
      const totalTokens = Math.floor(customer.usage.monthlyTokens * factor + Math.random() * 100000);
      const inputTokens = Math.floor(totalTokens * (0.3 + Math.random() * 0.15));
      const outputTokens = totalTokens - inputTokens;
      const totalRequests = Math.floor(customer.usage.monthlyRequests * factor + Math.random() * 100);
      const successfulRequests = Math.floor(totalRequests * 0.99 + Math.random() * 50);
      
      return {
        model,
        tokens: totalTokens,
        inputTokens,
        outputTokens,
        requests: totalRequests,
        successfulRequests: Math.min(successfulRequests, totalRequests),
        ttftAvg: +(Math.random() * 0.4 + 0.2).toFixed(2),
        ttftP98: +(Math.random() * 0.8 + 0.5).toFixed(2),
        tpotAvg: +(Math.random() * 20 + 25).toFixed(1),
        errorCount: Math.floor(Math.random() * 30 + 5),
        errorRate: +(Math.random() * 1.2 + 0.2).toFixed(2),
        successRate: +(99 - Math.random() * 1.5).toFixed(1),
        inputLatencyPerKToken: +(Math.random() * 0.3 + 0.2).toFixed(3),
        outputLatencyPerKToken: +(Math.random() * 1.5 + 0.8).toFixed(3),
      };
    });
  }, [customer]);

  // 按模型筛选后的数据
  const filteredModelUsageData = useMemo(() => {
    if (modelFilter === 'all') {
      return modelUsageData;
    }
    return modelUsageData.filter(m => m.model === modelFilter);
  }, [modelUsageData, modelFilter]);

  // 汇总统计
  const stats = useMemo(() => {
    const data = filteredModelUsageData;
    return {
      totalTokens: data.reduce((sum, m) => sum + m.tokens, 0),
      totalInputTokens: data.reduce((sum, m) => sum + m.inputTokens, 0),
      totalOutputTokens: data.reduce((sum, m) => sum + m.outputTokens, 0),
      totalRequests: data.reduce((sum, m) => sum + m.requests, 0),
      totalSuccessfulRequests: data.reduce((sum, m) => sum + m.successfulRequests, 0),
      avgTTFT: data.length > 0 ? (data.reduce((sum, m) => sum + m.ttftAvg, 0) / data.length).toFixed(2) : '0',
      avgTPOT: data.length > 0 ? (data.reduce((sum, m) => sum + m.tpotAvg, 0) / data.length).toFixed(1) : '0',
      totalErrors: data.reduce((sum, m) => sum + m.errorCount, 0),
      avgErrorRate: data.length > 0 ? (data.reduce((sum, m) => sum + m.errorRate, 0) / data.length).toFixed(2) : '0',
      avgSuccessRate: data.length > 0 ? (data.reduce((sum, m) => sum + m.successRate, 0) / data.length).toFixed(1) : '0',
      avgInputLatencyPerKToken: data.length > 0 ? (data.reduce((sum, m) => sum + m.inputLatencyPerKToken, 0) / data.length).toFixed(3) : '0',
      avgOutputLatencyPerKToken: data.length > 0 ? (data.reduce((sum, m) => sum + m.outputLatencyPerKToken, 0) / data.length).toFixed(3) : '0',
    };
  }, [filteredModelUsageData]);

  // 使用趋势数据
  const usageTrendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: format(date, 'MM-dd'),
        tokens: Math.floor(Math.random() * 5000000) + 2000000,
        requests: Math.floor(Math.random() * 5000) + 2000,
      };
    });
  }, []);

  // 错误类型分布
  const errorByType = useMemo(() => {
    const totalErrors = stats.totalErrors;
    return [
      { code: '429', name: '请求频率限制', count: Math.floor(totalErrors * 0.35), percentage: 35.0 },
      { code: '500', name: '服务器内部错误', count: Math.floor(totalErrors * 0.25), percentage: 25.0 },
      { code: '503', name: '服务不可用', count: Math.floor(totalErrors * 0.18), percentage: 18.0 },
      { code: '504', name: '网关超时', count: Math.floor(totalErrors * 0.12), percentage: 12.0 },
      { code: '400', name: '请求参数错误', count: Math.floor(totalErrors * 0.07), percentage: 7.0 },
      { code: '401', name: '认证失败', count: Math.floor(totalErrors * 0.03), percentage: 3.0 },
    ];
  }, [stats.totalErrors]);

  // 错误趋势数据
  const errorTrendData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const isBusinessHour = i >= 9 && i <= 21;
      return {
        hour: `${String(i).padStart(2, '0')}:00`,
        '429': Math.floor(Math.random() * (isBusinessHour ? 5 : 2)) + (isBusinessHour ? 2 : 0),
        '500': Math.floor(Math.random() * (isBusinessHour ? 3 : 1)) + (isBusinessHour ? 1 : 0),
        '503': Math.floor(Math.random() * (isBusinessHour ? 2 : 1)),
        '504': Math.floor(Math.random() * 2),
        '400': Math.floor(Math.random() * 1),
        '401': Math.floor(Math.random() * 1),
      };
    });
  }, []);

  // 错误明细数据 (20条)
  const errorDetails = useMemo(() => {
    const errorCodes = ['429', '500', '503', '504', '400', '401'];
    const errorMessages = [
      'Rate limit exceeded: Too many requests',
      'Internal server error: Processing failed',
      'Service temporarily unavailable',
      'Gateway timeout: Upstream too slow',
      'Bad request: Invalid parameters',
      'Authentication failed: Invalid token'
    ];
    return Array.from({ length: 20 }, (_, i) => {
      const modelIndex = i % availableModels.length;
      const errorIndex = i % 6;
      return {
        id: `err-${i}`,
        model: availableModels[modelIndex],
        errorCode: errorCodes[errorIndex],
        errorCount: Math.floor(Math.random() * 15) + 2,
        timestamp: `2025-01-22 ${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        requestId: `req-${Math.random().toString(36).substring(2, 14)}`,
        endpoint: '/v1/chat/completions',
        inputTokens: Math.floor(Math.random() * 5000) + 500,
        errorMessage: errorMessages[errorIndex],
        retryAfter: errorIndex === 0 ? '60s' : (errorIndex === 2 ? '30s' : '-'),
        userAgent: `KSGC-CLI/2.3.1`,
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{customer.companyName}</h1>
            <p className="text-sm text-muted-foreground">{customer.customerCode}</p>
          </div>
          <span className={cn(
            "status-badge ml-2",
            customer.subscription.status === 'active' ? 'status-badge-success' :
            customer.subscription.status === 'expired' ? 'status-badge-error' :
            'status-badge-neutral'
          )}>
            {statusLabels[customer.subscription.status]}
          </span>
        </div>
      </div>

      {/* 详细信息 Tabs */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">使用统计</TabsTrigger>
          <TabsTrigger value="overview">配置信息</TabsTrigger>
          <TabsTrigger value="users">活跃用户</TabsTrigger>
          <TabsTrigger value="logs">操作日志</TabsTrigger>
          <TabsTrigger value="cloud">云服务信息</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 订阅信息 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  订阅信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">版本</span>
                  <span className={cn(
                    "status-badge",
                    customer.subscription.plan === 'professional' ? 'status-badge-success' :
                    'status-badge-neutral'
                  )}>
                    {planLabels[customer.subscription.plan]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">计费方式</span>
                  <span className="text-sm">{customer.subscription.billingType === 'prepaid' ? '预付费' : '后付费'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">开通日期</span>
                  <span className="text-sm">{formatDate(customer.subscription.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">到期日期</span>
                  <span className="text-sm">{formatDate(customer.subscription.expiresAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">席位使用</span>
                  <span className="text-sm">{customer.subscription.usedSeats} / {customer.subscription.seats}</span>
                </div>
              </CardContent>
            </Card>

            {/* 认证配置 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  认证配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">企业认证方式</span>
                  <span className={cn(
                    "status-badge",
                    customer.authConfig.enterpriseAuthMethod !== 'none' ? 'status-badge-success' : 'status-badge-neutral'
                  )}>
                    {authMethodLabels[customer.authConfig.enterpriseAuthMethod]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IP 白名单</span>
                  <div className="flex items-center gap-2">
                    {customer.authConfig.ipWhitelistEnabled ? (
                      <>
                        <span className="status-badge status-badge-success">
                          {customer.authConfig.ipWhitelist.length} 条规则
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>IP 白名单</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {customer.authConfig.ipWhitelist.map((ip, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                  <span className="text-sm font-mono">{ip}</span>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <span className="status-badge status-badge-neutral">未启用</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">已开通模型</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{customer.enabledModels.length} 个</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>已开通模型列表</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {customer.enabledModels.map((model, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm">{model}</span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 账户配置 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  账户配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium">模型切换</span>
                    <p className="text-xs text-muted-foreground">允许用户在模型异常时手动切换至备用模型</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {/* 筛选器 - 同一行 */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 flex-nowrap">
            {/* 时间范围 */}
            <div className="flex items-center gap-2 flex-nowrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">查询时间：</span>
              <div className="flex items-center gap-2 flex-nowrap">
                {timeRangePresets.filter(p => p.value !== 'custom').map(preset => (
                  <Button
                    key={preset.value}
                    variant={timeRangePreset === preset.value ? 'default' : 'outline'}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleTimeRangePresetChange(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={timeRangePreset === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[200px] justify-start whitespace-nowrap"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {timeRangePreset === 'custom' && usageDateRange.from && usageDateRange.to ? (
                        <>
                          {format(usageDateRange.from, 'yyyy/MM/dd', { locale: zhCN })} - {format(usageDateRange.to, 'yyyy/MM/dd', { locale: zhCN })}
                        </>
                      ) : (
                        '自定义日期'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={usageDateRange}
                      onSelect={(range) => {
                        setUsageDateRange({ from: range?.from, to: range?.to });
                        setTimeRangePreset('custom');
                      }}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 模型筛选 */}
            <div className="flex items-center gap-2 flex-nowrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">模型筛选：</span>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent className="bg-background border max-h-[300px]">
                  <SelectItem value="all">全部模型</SelectItem>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 概览统计卡片 - 8个 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatTokens(stats.totalTokens)} <span className="text-sm font-normal text-muted-foreground">tokens</span></p>
                  <p className="text-xs text-muted-foreground">Token 消耗</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.totalRequests.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">次</span></p>
                  <p className="text-xs text-muted-foreground">请求总数</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{customer.usage.activeUsers} <span className="text-sm font-normal text-muted-foreground">人</span></p>
                  <p className="text-xs text-muted-foreground">活跃用户</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.avgTTFT} <span className="text-sm font-normal text-muted-foreground">秒</span></p>
                  <p className="text-xs text-muted-foreground">平均首Token时延</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.avgTPOT} <span className="text-sm font-normal text-muted-foreground">t/s</span></p>
                  <p className="text-xs text-muted-foreground">Token 生成速度</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground text-success">{stats.avgSuccessRate}%</p>
                  <p className="text-xs text-muted-foreground">成功率</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground text-destructive">{stats.totalErrors} <span className="text-sm font-normal text-muted-foreground">次</span></p>
                  <p className="text-xs text-muted-foreground">错误总数</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.avgErrorRate}%</p>
                  <p className="text-xs text-muted-foreground">平均错误率</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 使用趋势图 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">使用趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={usageTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis 
                      yAxisId="tokens"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatTokens(value)}
                      label={{ value: 'Tokens', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                    />
                    <YAxis 
                      yAxisId="requests"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      label={{ value: '请求数', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Token 消耗') return [formatTokens(value), name];
                        return [value.toLocaleString(), name];
                      }}
                    />
                    <Bar 
                      yAxisId="requests"
                      dataKey="requests" 
                      fill="hsl(142, 76%, 36%)" 
                      name="请求数"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="tokens"
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="hsl(213, 94%, 50%)" 
                      strokeWidth={2}
                      name="Token 消耗"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                  <span>请求数</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(213, 94%, 50%)' }} />
                  <span>Token 消耗</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 模型使用明细表 - 不分页 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">模型使用明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>模型</TableHead>
                      <TableHead className="text-right">Token 消耗</TableHead>
                      <TableHead className="text-right">Token 占比</TableHead>
                      <TableHead className="text-right">请求数 (成功/总)</TableHead>
                      <TableHead className="text-right">首Token时延 (秒)</TableHead>
                      <TableHead className="text-right">P98时延 (秒)</TableHead>
                      <TableHead className="text-right">Token生成速度 (t/s)</TableHead>
                      <TableHead className="text-right">千Token输入时长 (秒)</TableHead>
                      <TableHead className="text-right">千Token输出时长 (秒)</TableHead>
                      <TableHead className="text-right">成功率</TableHead>
                      <TableHead className="text-right">错误数 (次)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModelUsageData.map((item) => {
                      const tokenPercentage = stats.totalTokens > 0 
                        ? ((item.tokens / stats.totalTokens) * 100).toFixed(1)
                        : '0';
                      return (
                        <TableRow key={item.model}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span>{formatTokens(item.tokens)}</span>
                              <span className="text-xs text-muted-foreground">
                                (入: {formatTokens(item.inputTokens)}, 出: {formatTokens(item.outputTokens)})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{tokenPercentage}%</TableCell>
                          <TableCell className="text-right">
                            <span className="text-success">{item.successfulRequests.toLocaleString()}</span>
                            <span className="text-muted-foreground">/{item.requests.toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right">{item.ttftAvg} 秒</TableCell>
                          <TableCell className="text-right">{item.ttftP98} 秒</TableCell>
                          <TableCell className="text-right">{item.tpotAvg} t/s</TableCell>
                          <TableCell className="text-right">{item.inputLatencyPerKToken} 秒</TableCell>
                          <TableCell className="text-right">{item.outputLatencyPerKToken} 秒</TableCell>
                          <TableCell className="text-right text-success font-medium">{item.successRate}%</TableCell>
                          <TableCell className="text-right text-destructive font-medium">{item.errorCount} 次</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 错误统计区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 按错误代码统计 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">按错误代码统计</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>错误代码</TableHead>
                      <TableHead>错误类型</TableHead>
                      <TableHead className="text-right">次数</TableHead>
                      <TableHead className="text-right">占比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorByType.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-mono font-medium",
                            item.code === '429' && "bg-yellow-500/10 text-yellow-600",
                            item.code === '500' && "bg-destructive/10 text-destructive",
                            item.code === '503' && "bg-orange-500/10 text-orange-600",
                            item.code === '504' && "bg-purple-500/10 text-purple-600",
                            item.code === '400' && "bg-blue-500/10 text-blue-600",
                            item.code === '401' && "bg-red-500/10 text-red-600",
                          )}>
                            {item.code}
                          </span>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right font-medium">{item.count} 次</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.percentage}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-medium">
                      <TableCell colSpan={2}>总计</TableCell>
                      <TableCell className="text-right">{errorByType.reduce((sum, e) => sum + e.count, 0)} 次</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 按模型错误分布 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">按模型错误分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模型</TableHead>
                        <TableHead className="text-right">错误数 (次)</TableHead>
                        <TableHead className="text-right">错误率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModelUsageData.map((item) => (
                        <TableRow key={item.model}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell className="text-right text-destructive font-medium">{item.errorCount} 次</TableCell>
                          <TableCell className="text-right">{item.errorRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 错误趋势图 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">错误趋势 (每小时)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={errorTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const total = payload.reduce((sum, entry) => {
                            if (entry.dataKey !== 'trendLine') {
                              return sum + (Number(entry.value) || 0);
                            }
                            return sum;
                          }, 0);
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-2">{label}</p>
                              {payload.filter(p => p.dataKey !== 'trendLine').map((entry: any) => (
                                <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                                  <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                                  <span>{entry.dataKey} {errorTypes.find(e => e.code === entry.dataKey)?.name}：{entry.value}</span>
                                </div>
                              ))}
                              <div className="border-t mt-2 pt-2 font-medium text-sm">
                                总错误数：{total}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="429" stackId="errors" fill={ERROR_COLORS['429']} name="429" />
                    <Bar dataKey="500" stackId="errors" fill={ERROR_COLORS['500']} name="500" />
                    <Bar dataKey="503" stackId="errors" fill={ERROR_COLORS['503']} name="503" />
                    <Bar dataKey="504" stackId="errors" fill={ERROR_COLORS['504']} name="504" />
                    <Bar dataKey="400" stackId="errors" fill={ERROR_COLORS['400']} name="400" />
                    <Bar dataKey="401" stackId="errors" fill={ERROR_COLORS['401']} name="401" />
                    {selectedErrorCode && (
                      <Line 
                        type="monotone" 
                        dataKey={selectedErrorCode}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        dot={false}
                        name={`${selectedErrorCode} 趋势`}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
                {errorTypes.map((et) => (
                  <div 
                    key={et.code}
                    className={cn(
                      "flex items-center gap-1 cursor-pointer px-2 py-1 rounded transition-colors",
                      selectedErrorCode === et.code ? "bg-muted ring-1 ring-foreground" : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedErrorCode(
                      selectedErrorCode === et.code ? null : et.code
                    )}
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS[et.code] }} />
                    <span>{et.code}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 错误明细表格 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">错误明细</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模型</TableHead>
                    <TableHead>错误代码</TableHead>
                    <TableHead className="text-right">错误数 (次)</TableHead>
                    <TableHead className="text-right">最近发生时间</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const totalPages = Math.ceil(errorDetails.length / errorPageSize);
                    const paginatedData = errorDetails.slice((errorPage - 1) * errorPageSize, errorPage * errorPageSize);
                    return (
                      <>
                        {paginatedData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.model}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-mono font-medium",
                                item.errorCode === '429' && "bg-yellow-500/10 text-yellow-600",
                                item.errorCode === '500' && "bg-destructive/10 text-destructive",
                                item.errorCode === '503' && "bg-orange-500/10 text-orange-600",
                                item.errorCode === '504' && "bg-purple-500/10 text-purple-600",
                                item.errorCode === '400' && "bg-blue-500/10 text-blue-600",
                                item.errorCode === '401' && "bg-red-500/10 text-red-600",
                              )}>
                                {item.errorCode}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-destructive font-medium">{item.errorCount} 次</TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.timestamp}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedErrorDetail(item)}
                                className="h-7 px-2"
                              >
                                查看详情
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {totalPages > 1 && (
                          <TableRow>
                            <TableCell colSpan={5} className="py-2">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setErrorPage(p => Math.max(1, p - 1))}
                                  disabled={errorPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                  第 {errorPage} / {totalPages} 页
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setErrorPage(p => Math.min(totalPages, p + 1))}
                                  disabled={errorPage === totalPages}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">活跃用户排行</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>Token 消耗</th>
                    <th>请求次数</th>
                    <th>最后活跃</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.topUsers
                    .slice((userCurrentPage - 1) * usersPerPage, userCurrentPage * usersPerPage)
                    .map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                          index === 1 ? "bg-gray-500/20 text-gray-600" :
                          index === 2 ? "bg-orange-500/20 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {(userCurrentPage - 1) * usersPerPage + index + 1}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{formatTokens(user.tokens)}</td>
                      <td>{user.requests.toLocaleString()}</td>
                      <td className="text-muted-foreground">{formatDateTime(user.lastActiveAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {customer.topUsers.length > usersPerPage && (
                <div className="p-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))}
                          className={userCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(customer.topUsers.length / usersPerPage) }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setUserCurrentPage(i + 1)}
                            isActive={userCurrentPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setUserCurrentPage(p => Math.min(Math.ceil(customer.topUsers.length / usersPerPage), p + 1))}
                          className={userCurrentPage === Math.ceil(customer.topUsers.length / usersPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">最近操作日志</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>操作类型</th>
                    <th>操作详情</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-muted-foreground">{formatDateTime(new Date().toISOString())}</td>
                    <td>
                      <span className="status-badge status-badge-neutral">配置变更</span>
                    </td>
                    <td className="text-muted-foreground">修改了IP白名单配置</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground">{formatDateTime(new Date(Date.now() - 86400000).toISOString())}</td>
                    <td>
                      <span className="status-badge status-badge-success">订阅更新</span>
                    </td>
                    <td className="text-muted-foreground">升级至专业版</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground">{formatDateTime(new Date(Date.now() - 172800000).toISOString())}</td>
                    <td>
                      <span className="status-badge status-badge-neutral">添加用户</span>
                    </td>
                    <td className="text-muted-foreground">添加了5名新用户</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud" className="space-y-4">
          {/* 云服务监控 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* SLB 监控 */}
            <Card className="enterprise-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  负载均衡 (SLB)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">状态</span>
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    正常
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">当前连接数</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">QPS</span>
                  <span className="text-sm font-medium">856/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">带宽使用</span>
                  <span className="text-sm font-medium">245 Mbps</span>
                </div>
              </CardContent>
            </Card>

            {/* 应用服务器 */}
            <Card className="enterprise-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  应用服务器
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">实例状态</span>
                  <span className="text-sm font-medium">3/3 运行中</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">平均 CPU</span>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">平均内存</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">磁盘使用</span>
                  <span className="text-sm font-medium">156 GB / 500 GB</span>
                </div>
              </CardContent>
            </Card>

            {/* 数据库 */}
            <Card className="enterprise-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  数据库 (RDS)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">状态</span>
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    正常
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">连接数</span>
                  <span className="text-sm font-medium">89 / 500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">CPU 使用率</span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">存储空间</span>
                  <span className="text-sm font-medium">234 GB / 1 TB</span>
                </div>
              </CardContent>
            </Card>

            {/* Elasticsearch */}
            <Card className="enterprise-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Elasticsearch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">集群状态</span>
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    Green
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">节点数</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">索引数</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">存储使用</span>
                  <span className="text-sm font-medium">89 GB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 错误详情对话框 */}
      <Dialog open={!!selectedErrorDetail} onOpenChange={(open) => !open && setSelectedErrorDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>错误详情</DialogTitle>
          </DialogHeader>
          {selectedErrorDetail && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">请求 ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{selectedErrorDetail.requestId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(selectedErrorDetail.requestId, '请求 ID')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">发生时间</p>
                  <p className="font-medium">{selectedErrorDetail.timestamp}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">模型</p>
                  <p className="font-medium">{selectedErrorDetail.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">错误代码</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-mono font-medium inline-block",
                    selectedErrorDetail.errorCode === '429' && "bg-yellow-500/10 text-yellow-600",
                    selectedErrorDetail.errorCode === '500' && "bg-destructive/10 text-destructive",
                    selectedErrorDetail.errorCode === '503' && "bg-orange-500/10 text-orange-600",
                    selectedErrorDetail.errorCode === '504' && "bg-purple-500/10 text-purple-600",
                    selectedErrorDetail.errorCode === '400' && "bg-blue-500/10 text-blue-600",
                    selectedErrorDetail.errorCode === '401' && "bg-red-500/10 text-red-600",
                  )}>
                    {selectedErrorDetail.errorCode}
                  </span>
                </div>
              </div>

              {/* 请求详情 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">请求详情</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">请求端点</p>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded block">{selectedErrorDetail.endpoint}</code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">重试建议</p>
                    <p className="font-medium">{selectedErrorDetail.retryAfter}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">输入Token数</p>
                    <p className="font-medium">{selectedErrorDetail.inputTokens?.toLocaleString()} tokens</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">客户端</p>
                    <p className="font-medium">{selectedErrorDetail.userAgent}</p>
                  </div>
                </div>
              </div>

              {/* 错误信息 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">错误信息</h4>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <code className="text-sm text-destructive font-mono break-all">{selectedErrorDetail.errorMessage}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(selectedErrorDetail.errorMessage, '错误信息')}
                      className="h-6 w-6 p-0 shrink-0 ml-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerDetail;
