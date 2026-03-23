import React, { useState, useMemo, useCallback, useRef } from 'react';
import { format, subDays, subHours, subMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft, Building2, Users, Zap, Shield, Clock, Activity, Settings, Globe, Eye, CalendarIcon, Cloud, Server, Database, Network, HardDrive, Cpu, MemoryStick, AlertTriangle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Copy, Check, ChevronsUpDown, ArrowUpDown, ArrowUp, ArrowDown, Search, ExternalLink } from 'lucide-react';
import { ActiveUserList } from './ActiveUserList';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CustomerDetail as CustomerDetailType } from '@/types/admin';
import { getCustomerDetail } from '@/data/adminMockData';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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

// 全局可见模型列表（从模型配置中获取已启用的模型）
const globalEnabledModels = [
  { id: 'gpt4-turbo', name: 'GPT-4 Turbo', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'gpt4o', name: 'GPT-4o', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'gpt4o-mini', name: 'GPT-4o Mini', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'claude35-sonnet', name: 'Claude 3.5 Sonnet', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'claude3-opus', name: 'Claude 3 Opus', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'claude3-haiku', name: 'Claude 3 Haiku', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'gemini-pro', name: 'Gemini Pro', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'ernie4', name: 'ERNIE-4.0', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'qwen-max', name: 'Qwen-Max', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'qwen-turbo', name: 'Qwen-Turbo', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'kimi-k2', name: 'Kimi K2', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'kimi-25', name: 'KIMI 2.5', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'glm-47', name: 'GLM-4.7', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'glm-5', name: 'GLM-5', type: 'text' as const, typeLabel: '文本模型' },
  { id: 'gpt4-vision', name: 'GPT-4 Vision', type: 'vision' as const, typeLabel: '视觉理解' },
  { id: 'gemini-vision', name: 'Gemini Pro Vision', type: 'vision' as const, typeLabel: '视觉理解' },
];

// 默认开启的模型ID
const defaultEnabledModelIds = ['kimi-25', 'glm-47', 'glm-5'];

// 客户已开通的模型ID（模拟数据：用户自行在控制台开通的模型）
const customerSelfEnabledModelIds = ['gpt4-turbo', 'gpt4o', 'claude35-sonnet', 'claude3-haiku', 'gemini-pro', 'deepseek-v3', 'kimi-25', 'glm-47', 'glm-5'];

// 20个模型列表（用于使用统计）
const availableModels = [
  'GPT-4 Turbo', 'GPT-4o', 'GPT-4o Mini', 'Claude 3.5 Sonnet', 'Claude 3 Opus',
  'DeepSeek V3', 'Kimi K2', 'Qwen 2.5 Max', 'GLM-4', 'Gemini 1.5 Pro',
  'Gemini 1.5 Flash', 'Mistral Large', 'Llama 3.1 405B', 'Yi Large',
  'Baichuan 4', 'InternLM 2.5', 'Doubao Pro', 'Moonshot V1', 'Spark Max', 'Hunyuan Pro',
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

type TimeRangePreset = '15min' | '4hours' | '24hours' | '7days' | 'custom';

// 千Token时延数据
const latencyPerKTokenMinute = [
  { time: '10:00', inputLatency: 0.42, outputLatency: 1.85 },
  { time: '10:01', inputLatency: 0.38, outputLatency: 1.92 },
  { time: '10:02', inputLatency: 0.45, outputLatency: 1.78 },
  { time: '10:03', inputLatency: 0.41, outputLatency: 2.05 },
  { time: '10:04', inputLatency: 0.39, outputLatency: 1.88 },
  { time: '10:05', inputLatency: 0.44, outputLatency: 1.95 },
  { time: '10:06', inputLatency: 0.37, outputLatency: 1.82 },
  { time: '10:07', inputLatency: 0.43, outputLatency: 2.12 },
  { time: '10:08', inputLatency: 0.40, outputLatency: 1.90 },
  { time: '10:09', inputLatency: 0.42, outputLatency: 1.87 },
];

export function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const customer = getCustomerDetail(customerId);
  const { toast } = useToast();
  const errorAnalysisRef = useRef<HTMLDivElement>(null);
  // 时间范围筛选
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  // 模型筛选
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  
  // 模型性能指标排序状态
  const [sortColumn, setSortColumn] = useState<string>('tokens');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // 错误相关状态
  const [selectedErrorCode, setSelectedErrorCode] = useState<string | null>(null);
  const [errorPage, setErrorPage] = useState(1);
  const errorPageSize = 10;
  
  // 错误详情弹窗
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [errorDetailDialogOpen, setErrorDetailDialogOpen] = useState(false);

  // 错误分析 - 模型筛选（从模型性能表点击错误数时设置）
  const [errorModelFilter, setErrorModelFilter] = useState<string | null>(null);
  

  // 可见模型配置状态
  const [customerModelConfig, setCustomerModelConfig] = useState<Record<string, boolean>>(() => {
    const config: Record<string, boolean> = {};
    globalEnabledModels.forEach(m => {
      config[m.id] = defaultEnabledModelIds.includes(m.id);
    });
    return config;
  });
  const [modelConfigDialogOpen, setModelConfigDialogOpen] = useState(false);
  const [modelConfigSearch, setModelConfigSearch] = useState('');
  const [modelConfigTypeFilter, setModelConfigTypeFilter] = useState<string>('all');

  // 关闭已开通模型可见性的二次确认
  const [confirmDisableModel, setConfirmDisableModel] = useState<{ id: string; name: string } | null>(null);

  const handlePresetChange = (preset: TimeRangePreset) => {
    setTimeRangePreset(preset);
    const now = new Date();
    switch (preset) {
      case '15min':
        setDateRange({ from: subMinutes(now, 15), to: now });
        break;
      case '4hours':
        setDateRange({ from: subHours(now, 4), to: now });
        break;
      case '24hours':
        setDateRange({ from: subHours(now, 24), to: now });
        break;
      case '7days':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleViewErrorDetail = (error: any) => {
    setSelectedError(error);
    setErrorDetailDialogOpen(true);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '已复制',
      description: `${label}已复制到剪贴板`,
    });
  };

  // early return moved after hooks

  // 生成模型使用数据（包含完整指标）- 与AdminAnalytics一致
  const generateModelUsageData = () => {
    const baseMultiplier = 0.15; // 单客户数据比例
    return availableModels.map((model, i) => {
      const factor = Math.max(0.02, 0.18 - i * 0.008);
      const totalTokens = Math.floor((45000000 * factor + Math.random() * 5000000) * baseMultiplier);
      const inputTokens = Math.floor(totalTokens * (0.3 + Math.random() * 0.15));
      const outputTokens = totalTokens - inputTokens;
      const totalRequests = Math.floor((12500 * factor + Math.random() * 1000) * baseMultiplier);
      const successfulRequests = Math.floor(totalRequests * (0.985 + Math.random() * 0.01));
      const peakTPM = Math.floor(Math.random() * 150000) + 80000;
      const avgTPMDaily = Math.floor(peakTPM * (0.5 + Math.random() * 0.2));
      const avgTPMBusiness = Math.floor(peakTPM * (0.7 + Math.random() * 0.15));
      
      return {
        model,
        tokens: totalTokens,
        inputTokens,
        outputTokens,
        requests: totalRequests,
        successfulRequests: Math.min(successfulRequests, totalRequests),
        peakTPM,
        avgTPMDaily,
        avgTPMBusiness,
        ttftAvg: +(Math.random() * 0.4 + 0.2).toFixed(2),
        ttftP98: +(Math.random() * 0.8 + 0.5).toFixed(2),
        tpotAvg: +(Math.random() * 20 + 25).toFixed(1),
        errorCount: Math.floor(Math.random() * 50 + 10),
        successRate: +(99 - Math.random() * 1.5).toFixed(1),
        inputLatencyPerKToken: +(Math.random() * 0.3 + 0.2).toFixed(3),
        outputLatencyPerKToken: +(Math.random() * 1.5 + 0.8).toFixed(3),
      };
    });
  };

  // 生成每日趋势数据
  const generateDailyTrendData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        tokens: Math.floor(Math.random() * 5000000) + 2000000,
        requests: Math.floor(Math.random() * 1500) + 500,
      };
    });
  };

  // 生成错误趋势数据
  const generateErrorTrendData = () => {
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
  };

  // 错误明细数据 (20条) - 去掉客户字段
  const generateErrorDetails = (modelFilterValue: string) => {
    const errorCodes = ['429', '500', '503', '504', '400', '401'];
    const errorMessages: Record<string, string> = {
      '429': 'Rate limit exceeded: Too many requests per minute',
      '500': 'Internal server error: Model inference failed',
      '503': 'Service temporarily unavailable: High load detected',
      '504': 'Gateway timeout: Response exceeded 30 seconds',
      '400': 'Bad request: Invalid message format',
      '401': 'Authentication failed: Invalid API key',
    };
    
    return Array.from({ length: 20 }, (_, i) => {
      const modelIndex = i % availableModels.length;
      const errorIndex = i % 6;
      const errorCode = errorCodes[errorIndex];
      
      const model = modelFilterValue !== 'all' ? modelFilterValue : availableModels[modelIndex];
      
      return {
        id: `err-${i}`,
        model,
        errorCode,
        timestamp: `2025-01-22 ${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        requestId: `req-${Math.random().toString(36).substring(2, 14)}`,
        endpoint: '/v1/chat/completions',
        inputTokens: Math.floor(Math.random() * 5000) + 500,
        errorMessage: errorMessages[errorCode],
        retryAfter: errorCode === '429' ? '60s' : (errorCode === '503' ? '30s' : '-'),
        userAgent: 'KSGC-CLI/2.3.1',
      };
    });
  };

  // 计算模型使用数据（带筛选和排序）
  const modelUsageData = useMemo(() => {
    let data = generateModelUsageData();
    if (modelFilter !== 'all') {
      data = data.filter(m => m.model === modelFilter);
    }
    
    // 排序
    return [...data].sort((a, b) => {
      let aVal: number | string, bVal: number | string;
      switch (sortColumn) {
        case 'model': aVal = a.model; bVal = b.model; break;
        case 'tokens': aVal = a.tokens; bVal = b.tokens; break;
        case 'peakTPM': aVal = a.peakTPM; bVal = b.peakTPM; break;
        case 'avgTPMDaily': aVal = a.avgTPMDaily; bVal = b.avgTPMDaily; break;
        case 'avgTPMBusiness': aVal = a.avgTPMBusiness; bVal = b.avgTPMBusiness; break;
        case 'ttftAvg': aVal = a.ttftAvg; bVal = b.ttftAvg; break;
        case 'ttftP98': aVal = a.ttftP98; bVal = b.ttftP98; break;
        case 'tpotAvg': aVal = a.tpotAvg; bVal = b.tpotAvg; break;
        case 'requests': aVal = a.requests; bVal = b.requests; break;
        case 'errorCount': aVal = a.errorCount; bVal = b.errorCount; break;
        default: aVal = a.tokens; bVal = b.tokens;
      }
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string) 
          : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
    });
  }, [modelFilter, sortColumn, sortDirection]);

  const dailyTrendData = useMemo(() => generateDailyTrendData(), []);
  const errorTrendData = useMemo(() => generateErrorTrendData(), []);
  const errorDetails = useMemo(() => generateErrorDetails(modelFilter), [modelFilter]);

  // 汇总统计
  const stats = useMemo(() => {
    const data = modelUsageData;
    const totalTokens = data.reduce((sum, m) => sum + m.tokens, 0);
    const totalInputTokens = data.reduce((sum, m) => sum + m.inputTokens, 0);
    const totalOutputTokens = data.reduce((sum, m) => sum + m.outputTokens, 0);
    const totalRequests = data.reduce((sum, m) => sum + m.requests, 0);
    const totalErrors = data.reduce((sum, m) => sum + m.errorCount, 0);
    
    return {
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalRequests,
      totalErrors,
      activeUsers: customer?.usage?.activeUsers ?? 0,
    };
  }, [modelUsageData, customer]);

  // 错误类型统计（响应模型筛选和错误代码筛选）
  const errorByType = useMemo(() => {
    let filteredData = errorDetails;
    if (errorModelFilter) {
      filteredData = filteredData.filter(e => e.model === errorModelFilter);
    }
    const errorCounts: Record<string, number> = {};
    filteredData.forEach(e => {
      errorCounts[e.errorCode] = (errorCounts[e.errorCode] || 0) + 1;
    });
    const total = Object.values(errorCounts).reduce((sum, c) => sum + c, 0);
    return errorTypes.map(et => ({
      ...et,
      count: errorCounts[et.code] || 0,
      percentage: total > 0 ? parseFloat(((errorCounts[et.code] || 0) / total * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [errorDetails, errorModelFilter]);

  // 过滤错误明细（按模型+错误代码）
  const filteredErrorDetails = useMemo(() => {
    let data = errorDetails;
    if (errorModelFilter) {
      data = data.filter(e => e.model === errorModelFilter);
    }
    if (selectedErrorCode) {
      data = data.filter(e => e.errorCode === selectedErrorCode);
    }
    return data;
  }, [errorDetails, errorModelFilter, selectedErrorCode]);

  // 分页错误明细
  const paginatedErrorDetails = useMemo(() => {
    const totalPages = Math.ceil(filteredErrorDetails.length / errorPageSize);
    const data = filteredErrorDetails.slice((errorPage - 1) * errorPageSize, errorPage * errorPageSize);
    return { data, totalPages };
  }, [filteredErrorDetails, errorPage]);

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

  return (
    <div className="flex flex-col h-full">
      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-background border-b pb-0 -mx-6 px-6 pt-2">
        {/* 返回按钮和标题 */}
        <div className="flex items-center gap-4 mb-3">
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

        {/* Tabs 标签 */}
        <Tabs defaultValue="usage" className="space-y-0">
          <TabsList>
            <TabsTrigger value="usage">使用统计</TabsTrigger>
            <TabsTrigger value="overview">配置信息</TabsTrigger>
            <TabsTrigger value="users">活跃用户</TabsTrigger>
            <TabsTrigger value="logs">操作日志</TabsTrigger>
            <TabsTrigger value="cloud">云服务信息</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto pt-6">
        <Tabs defaultValue="usage" className="space-y-4">

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

            {/* 账号配置 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  账号配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 企业认证方式 */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">企业认证方式</span>
                  <span className={cn(
                    "status-badge",
                    customer.authConfig.enterpriseAuthMethod !== 'none' ? 'status-badge-success' : 'status-badge-neutral'
                  )}>
                    {authMethodLabels[customer.authConfig.enterpriseAuthMethod]}
                  </span>
                </div>
                {/* IP白名单 */}
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
                {/* 模型切换 */}
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium">模型切换</span>
                    <p className="text-xs text-muted-foreground">允许用户在模型异常时手动切换至备用模型</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                {/* 可见模型 */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">可见模型</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {Object.values(customerModelConfig).filter(Boolean).length} / {globalEnabledModels.length} 个
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => setModelConfigDialogOpen(true)}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 可见模型配置弹窗 */}
          <Dialog open={modelConfigDialogOpen} onOpenChange={setModelConfigDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Cpu className="w-4 h-4" />
                  可见模型配置
                  <span className="text-muted-foreground font-normal">— {customer.companyName}</span>
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(customerModelConfig).filter(Boolean).length}/{globalEnabledModels.length}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              {/* 搜索和筛选 */}
              <div className="flex items-center gap-3 py-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索模型..."
                    value={modelConfigSearch}
                    onChange={e => setModelConfigSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <select
                  value={modelConfigTypeFilter}
                  onChange={e => setModelConfigTypeFilter(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">全部类型</option>
                  <option value="text">文本模型</option>
                  <option value="vision">视觉理解</option>
                </select>
              </div>
              {/* 模型列表 */}
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">模型名称</TableHead>
                      <TableHead className="w-[100px]">模型类型</TableHead>
                      <TableHead className="w-[100px]">开通状态</TableHead>
                      <TableHead className="w-[80px] text-right">可见</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = globalEnabledModels.filter(m => {
                        const matchesSearch = m.name.toLowerCase().includes(modelConfigSearch.toLowerCase());
                        const matchesType = modelConfigTypeFilter === 'all' || m.type === modelConfigTypeFilter;
                        return matchesSearch && matchesType;
                      });
                      // 按模型类型（文本优先）+ 模型名称排序
                      const sorted = [...filtered].sort((a, b) => {
                        const typeOrder = a.type === b.type ? 0 : a.type === 'text' ? -1 : 1;
                        if (typeOrder !== 0) return typeOrder;
                        return a.name.localeCompare(b.name);
                      });
                      return sorted.map(model => {
                        const isEnabled = customerSelfEnabledModelIds.includes(model.id);
                        const isDefault = defaultEnabledModelIds.includes(model.id);
                        const isVisible = isDefault || (customerModelConfig[model.id] || false);
                        return (
                          <TableRow key={model.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{model.name}</span>
                                {isDefault && (
                                  <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 bg-emerald-50">默认可见</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {model.type === 'text' ? '文本模型' : '视觉理解'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isEnabled ? (
                                <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600 bg-blue-50">已开通</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">未开通</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Switch
                                checked={isVisible}
                                disabled={isDefault}
                                onCheckedChange={(checked) => {
                                  if (!isDefault) {
                                    if (!checked && isEnabled) {
                                      setConfirmDisableModel({ id: model.id, name: model.name });
                                    } else {
                                      setCustomerModelConfig(prev => ({ ...prev, [model.id]: checked }));
                                    }
                                  }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          {/* 关闭已开通模型可见性的二次确认 */}
          <AlertDialog open={!!confirmDisableModel} onOpenChange={(open) => { if (!open) setConfirmDisableModel(null); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认关闭模型可见性</AlertDialogTitle>
                <AlertDialogDescription>
                  模型 <span className="font-semibold text-foreground">{confirmDisableModel?.name}</span> 当前处于已开通状态。关闭可见性后，该用户将无法继续使用此模型。是否确认关闭？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    if (confirmDisableModel) {
                      setCustomerModelConfig(prev => ({ ...prev, [confirmDisableModel.id]: false }));
                      setConfirmDisableModel(null);
                    }
                  }}
                >
                  确认关闭
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {/* 统一筛选栏 - 与数据看板保持一致 */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {/* 时间范围 */}
            <div className="flex items-center gap-2 flex-nowrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">查询时间：</span>
              <div className="flex items-center gap-2 flex-nowrap">
                <Button
                  variant={timeRangePreset === '15min' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetChange('15min')}
                  className="whitespace-nowrap"
                >
                  最近15分钟
                </Button>
                <Button
                  variant={timeRangePreset === '4hours' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetChange('4hours')}
                  className="whitespace-nowrap"
                >
                  最近4小时
                </Button>
                <Button
                  variant={timeRangePreset === '24hours' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetChange('24hours')}
                  className="whitespace-nowrap"
                >
                  最近24小时
                </Button>
                <Button
                  variant={timeRangePreset === '7days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetChange('7days')}
                  className="whitespace-nowrap"
                >
                  最近7天
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={timeRangePreset === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[200px] justify-start whitespace-nowrap"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {timeRangePreset === 'custom' ? (
                        <>
                          {format(dateRange.from, 'yyyy/MM/dd', { locale: zhCN })} - {format(dateRange.to, 'yyyy/MM/dd', { locale: zhCN })}
                        </>
                      ) : (
                        '自定义日期'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                          setTimeRangePreset('custom');
                        } else if (range?.from) {
                          setDateRange({ from: range.from, to: range.from });
                          setTimeRangePreset('custom');
                        }
                      }}
                      numberOfMonths={2}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* 模型筛选 */}
            <div className="flex items-center gap-2 flex-nowrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">模型：</span>
              <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={modelPopoverOpen}
                    className="w-[180px] justify-between"
                  >
                    {modelFilter === 'all' ? '全部模型' : modelFilter}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="搜索模型..." />
                    <CommandList>
                      <CommandEmpty>未找到模型</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setModelFilter('all');
                            setModelPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              modelFilter === 'all' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          全部模型
                        </CommandItem>
                        {availableModels.map((model) => (
                          <CommandItem
                            key={model}
                            value={model}
                            onSelect={() => {
                              setModelFilter(model);
                              setModelPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                modelFilter === model ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {model}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 概览统计卡片 - 3个卡片与数据看板一致 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{formatTokens(stats.totalTokens)}</p>
                  <p className="text-xs text-muted-foreground">Token 消耗</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    输入 {formatTokens(stats.totalInputTokens)} / 输出 {formatTokens(stats.totalOutputTokens)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">请求总数</p>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">活跃用户</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 模型性能指标表格 - 支持排序 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">模型性能指标</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('model')}
                    >
                      <div className="flex items-center gap-1">
                        模型
                        {sortColumn === 'model' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('tokens')}
                    >
                      <div className="flex items-center gap-1">
                        Token消耗（入/出）
                        {sortColumn === 'tokens' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('peakTPM')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        峰值每分钟Token数
                        {sortColumn === 'peakTPM' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('avgTPMDaily')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        每分钟均Token数
                        {sortColumn === 'avgTPMDaily' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('avgTPMBusiness')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        工作时段每分钟均Token数
                        {sortColumn === 'avgTPMBusiness' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('ttftAvg')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        首Token平均时延
                        {sortColumn === 'ttftAvg' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('ttftP98')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        首Token P98时延
                        {sortColumn === 'ttftP98' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('tpotAvg')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Token生成速度
                        {sortColumn === 'tpotAvg' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('requests')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        请求数 (成功/总)
                        {sortColumn === 'requests' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('errorCount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        错误数
                        {sortColumn === 'errorCount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelUsageData.slice(0, 10).map((item) => (
                    <TableRow key={item.model}>
                      <TableCell className="font-medium">{item.model}</TableCell>
                      <TableCell className="font-medium">
                        {formatTokens(item.tokens)}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({formatTokens(item.inputTokens)}/{formatTokens(item.outputTokens)})
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatTokens(item.peakTPM)}</TableCell>
                      <TableCell className="text-right">{formatTokens(item.avgTPMDaily)}</TableCell>
                      <TableCell className="text-right">{formatTokens(item.avgTPMBusiness)}</TableCell>
                      <TableCell className="text-right">{item.ttftAvg} 秒</TableCell>
                      <TableCell className="text-right">{item.ttftP98} 秒</TableCell>
                      <TableCell className="text-right">{item.tpotAvg} t/s</TableCell>
                      <TableCell className="text-right">{item.successfulRequests.toLocaleString()}/{item.requests.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-destructive hover:text-destructive hover:underline font-medium"
                          onClick={() => {
                            setErrorModelFilter(item.model);
                            setSelectedErrorCode(null);
                            setErrorPage(1);
                            setTimeout(() => {
                              errorAnalysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                        >
                          {item.errorCount}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Token 消耗趋势 - 全宽 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">Token 消耗趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis 
                      yAxisId="tokens"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatTokens(value)}
                    />
                    <YAxis 
                      yAxisId="requests"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'tokens') return [formatTokens(value), 'Token 消耗'];
                        return [value.toLocaleString(), '请求数'];
                      }}
                    />
                    <Bar 
                      yAxisId="tokens"
                      dataKey="tokens" 
                      fill="hsl(213, 94%, 50%)"
                      opacity={0.8}
                      name="tokens"
                    />
                    <Line 
                      yAxisId="requests"
                      type="monotone" 
                      dataKey="requests" 
                      stroke="hsl(142, 76%, 36%)" 
                      strokeWidth={2}
                      dot={false}
                      name="requests"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(213, 94%, 50%)' }} />
                  <span>Token (柱)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                  <span>请求数 (线)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 千Token平均时长趋势 - 全宽 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">千Token平均时长趋势 (分钟级)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyPerKTokenMinute}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="s" />
                    <Tooltip formatter={(value: number) => `${value}s`} />
                    <Line 
                      type="monotone" 
                      dataKey="inputLatency" 
                      stroke="hsl(213, 94%, 50%)" 
                      strokeWidth={2}
                      name="输入时长"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outputLatency" 
                      stroke="hsl(142, 76%, 36%)" 
                      strokeWidth={2}
                      name="输出时长"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: 'hsl(213, 94%, 50%)' }} />
                  <span>输入时长</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                  <span>输出时长</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 错误分析 - 统一模块 */}
          <div ref={errorAnalysisRef}>
            <Card className="enterprise-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    错误分析
                  </CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* 模型筛选 */}
                    {errorModelFilter && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">模型：</span>
                        <Badge variant="secondary" className="gap-1">
                          {errorModelFilter}
                          <button 
                            onClick={() => setErrorModelFilter(null)} 
                            className="ml-0.5 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      </div>
                    )}
                    {/* 错误代码筛选 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">错误代码：</span>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant={selectedErrorCode === null ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => { setSelectedErrorCode(null); setErrorPage(1); }}
                        >
                          全部
                        </Button>
                        {errorTypes.map((et) => (
                          <Button
                            key={et.code}
                            variant={selectedErrorCode === et.code ? 'default' : 'outline'}
                            size="sm"
                            className="h-6 px-2 text-xs gap-1"
                            onClick={() => {
                              setSelectedErrorCode(selectedErrorCode === et.code ? null : et.code);
                              setErrorPage(1);
                            }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ERROR_COLORS[et.code] }} />
                            {et.code}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 第一层：错误概览 - 统计条 + 趋势图并排 */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* 左侧：错误代码统计 */}
                  <div className="lg:col-span-2">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">按错误代码分布</h4>
                    <div className="space-y-2">
                      {(selectedErrorCode
                        ? errorByType.filter(e => e.code === selectedErrorCode)
                        : errorByType
                      ).map((item) => (
                        <div 
                          key={item.code} 
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                            selectedErrorCode === item.code ? "bg-muted" : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setSelectedErrorCode(selectedErrorCode === item.code ? null : item.code);
                            setErrorPage(1);
                          }}
                        >
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-mono font-medium min-w-[40px] text-center",
                            item.code === '429' && "bg-yellow-500/10 text-yellow-600",
                            item.code === '500' && "bg-destructive/10 text-destructive",
                            item.code === '503' && "bg-orange-500/10 text-orange-600",
                            item.code === '504' && "bg-purple-500/10 text-purple-600",
                            item.code === '400' && "bg-blue-500/10 text-blue-600",
                            item.code === '401' && "bg-red-500/10 text-red-600",
                          )}>
                            {item.code}
                          </span>
                          <span className="text-sm flex-1 truncate">{item.name}</span>
                          <span className="text-sm font-medium tabular-nums">{item.count}</span>
                          <div className="w-16">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: ERROR_COLORS[item.code]
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右侧：错误趋势图 */}
                  <div className="lg:col-span-3">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">错误趋势 (每小时)</h4>
                    <div className="h-56">
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
                          {selectedErrorCode ? (
                            <Bar dataKey={selectedErrorCode} fill={ERROR_COLORS[selectedErrorCode]} name={selectedErrorCode} />
                          ) : (
                            <>
                              <Bar dataKey="429" stackId="errors" fill={ERROR_COLORS['429']} name="429" />
                              <Bar dataKey="500" stackId="errors" fill={ERROR_COLORS['500']} name="500" />
                              <Bar dataKey="503" stackId="errors" fill={ERROR_COLORS['503']} name="503" />
                              <Bar dataKey="504" stackId="errors" fill={ERROR_COLORS['504']} name="504" />
                              <Bar dataKey="400" stackId="errors" fill={ERROR_COLORS['400']} name="400" />
                              <Bar dataKey="401" stackId="errors" fill={ERROR_COLORS['401']} name="401" />
                            </>
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="border-t" />

                {/* 第二层：错误明细 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground">错误明细</h4>
                    <span className="text-xs text-muted-foreground">
                      共 {filteredErrorDetails.length} 条记录
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模型</TableHead>
                        <TableHead>错误代码</TableHead>
                        <TableHead className="text-right">发生时间</TableHead>
                        <TableHead className="text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedErrorDetails.data.map((item) => (
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
                          <TableCell className="text-right text-muted-foreground">{item.timestamp}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewErrorDetail(item)}
                              className="h-7 px-2"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedErrorDetails.totalPages > 1 && (
                        <TableRow>
                          <TableCell colSpan={4} className="py-2">
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
                                第 {errorPage} / {paginatedErrorDetails.totalPages} 页
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setErrorPage(p => Math.min(paginatedErrorDetails.totalPages, p + 1))}
                                disabled={errorPage === paginatedErrorDetails.totalPages}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <ActiveUserList topUsers={customer.topUsers} />
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

      {/* 错误详情弹窗 */}
      <Dialog open={errorDetailDialogOpen} onOpenChange={setErrorDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>错误详情</DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">模型</p>
                  <p className="font-medium">{selectedError.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">错误代码</p>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded text-xs font-mono font-medium",
                    selectedError.errorCode === '429' && "bg-yellow-500/10 text-yellow-600",
                    selectedError.errorCode === '500' && "bg-destructive/10 text-destructive",
                    selectedError.errorCode === '503' && "bg-orange-500/10 text-orange-600",
                    selectedError.errorCode === '504' && "bg-purple-500/10 text-purple-600",
                    selectedError.errorCode === '400' && "bg-blue-500/10 text-blue-600",
                    selectedError.errorCode === '401' && "bg-red-500/10 text-red-600",
                  )}>
                    {selectedError.errorCode}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">发生时间</p>
                  <p className="font-medium">{selectedError.timestamp}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Endpoint</p>
                  <p className="font-mono text-sm">{selectedError.endpoint}</p>
                </div>
              </div>
              
              {/* Request ID */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Request ID</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                    {selectedError.requestId}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyText(selectedError.requestId, 'Request ID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* 错误消息 */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">错误消息</p>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{selectedError.errorMessage}</p>
                </div>
              </div>
              
              {/* 其他信息 */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Input Tokens</p>
                  <p className="font-medium">{selectedError.inputTokens.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Retry After</p>
                  <p className="font-medium">{selectedError.retryAfter}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">User Agent</p>
                  <p className="font-mono text-sm">{selectedError.userAgent}</p>
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
