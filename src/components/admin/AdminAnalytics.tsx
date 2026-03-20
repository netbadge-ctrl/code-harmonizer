import React, { useState, useMemo } from 'react';
import { Building2, CalendarIcon, Check, ChevronsUpDown, Eye, Copy, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockCustomers } from '@/data/adminMockData';
import { format, subDays, subHours, subMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const ERROR_COLORS: Record<string, string> = {
  '429': 'hsl(45, 93%, 47%)',
  '500': 'hsl(0, 84%, 60%)',
  '503': 'hsl(25, 95%, 53%)',
  '504': 'hsl(270, 50%, 60%)',
  '400': 'hsl(213, 94%, 50%)',
  '401': 'hsl(0, 72%, 51%)',
};

const COLORS = ['hsl(213, 94%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

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

// 错误类型定义
const errorTypes = [
  { code: '429', name: '请求频率限制', description: 'Rate limit exceeded' },
  { code: '500', name: '服务器内部错误', description: 'Internal server error' },
  { code: '503', name: '服务不可用', description: 'Service unavailable' },
  { code: '504', name: '网关超时', description: 'Gateway timeout' },
  { code: '400', name: '请求参数错误', description: 'Bad request' },
  { code: '401', name: '认证失败', description: 'Unauthorized' },
];

// 模拟模型列表 (20个模型)
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

// 生成模型使用数据（包含完整指标）
const generateModelUsageData = (customerFilter: string | null) => {
  const baseMultiplier = customerFilter ? 0.15 : 1;
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
      tokens: Math.floor(Math.random() * 20000000) + 40000000,
      requests: Math.floor(Math.random() * 5000) + 15000,
    };
  });
};

// 生成模型调用趋势数据
const generateModelTrendData = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      'GPT-4 Turbo_tokens': Math.floor(Math.random() * 8000000) + 4000000,
      'GPT-4 Turbo_requests': Math.floor(Math.random() * 2000) + 1500,
      'GPT-4o_tokens': Math.floor(Math.random() * 6000000) + 3000000,
      'GPT-4o_requests': Math.floor(Math.random() * 2500) + 1800,
      'Claude 3.5 Sonnet_tokens': Math.floor(Math.random() * 9000000) + 5000000,
      'Claude 3.5 Sonnet_requests': Math.floor(Math.random() * 3000) + 2200,
      'DeepSeek V3_tokens': Math.floor(Math.random() * 5000000) + 2500000,
      'DeepSeek V3_requests': Math.floor(Math.random() * 4000) + 3500,
    };
  });
};

// 错误明细数据 (20条)
const generateErrorDetails = (customerFilter: string | null, modelFilter: string) => {
  const errorCodes = ['429', '500', '503', '504', '400', '401'];
  const errorMessages: Record<string, string> = {
    '429': 'Rate limit exceeded: Too many requests per minute',
    '500': 'Internal server error: Model inference failed',
    '503': 'Service temporarily unavailable: High load detected',
    '504': 'Gateway timeout: Response exceeded 30 seconds',
    '400': 'Bad request: Invalid message format',
    '401': 'Authentication failed: Invalid API key',
  };
  
  const customers = mockCustomers.map(c => c.companyName);
  
  return Array.from({ length: 20 }, (_, i) => {
    const modelIndex = i % availableModels.length;
    const errorIndex = i % 6;
    const customerIndex = i % customers.length;
    const errorCode = errorCodes[errorIndex];
    
    const model = modelFilter !== 'all' ? modelFilter : availableModels[modelIndex];
    const customer = customerFilter || customers[customerIndex];
    
    return {
      id: `err-${i}`,
      model,
      customer,
      errorCode,
      errorCount: Math.floor(Math.random() * 15) + 2,
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

// 生成错误趋势数据
const generateErrorTrendData = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const isBusinessHour = i >= 9 && i <= 21;
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      '429': Math.floor(Math.random() * (isBusinessHour ? 8 : 3)) + (isBusinessHour ? 3 : 1),
      '500': Math.floor(Math.random() * (isBusinessHour ? 5 : 2)) + (isBusinessHour ? 2 : 0),
      '503': Math.floor(Math.random() * (isBusinessHour ? 4 : 1)) + (isBusinessHour ? 1 : 0),
      '504': Math.floor(Math.random() * 3),
      '400': Math.floor(Math.random() * 2),
      '401': Math.floor(Math.random() * 1),
    };
  });
};

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

type TimeRangePreset = '15min' | '4hours' | '24hours' | '7days' | 'custom';

export function AdminAnalytics() {
  const { toast } = useToast();
  
  // 统一筛选状态
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  
  // 错误相关状态
  const [selectedErrorCode, setSelectedErrorCode] = useState<string | null>(null);
  const [errorPage, setErrorPage] = useState(1);
  const errorPageSize = 10;
  
  // 错误详情弹窗
  const [selectedError, setSelectedError] = useState<ReturnType<typeof generateErrorDetails>[0] | null>(null);
  const [errorDetailDialogOpen, setErrorDetailDialogOpen] = useState(false);

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

  const handleViewErrorDetail = (error: ReturnType<typeof generateErrorDetails>[0]) => {
    setSelectedError(error);
    setErrorDetailDialogOpen(true);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: `${label}已复制到剪贴板`,
    });
  };

  const selectedCustomer = mockCustomers.find(c => c.id === selectedCustomerId);

  // 模型性能指标排序状态
  const [sortColumn, setSortColumn] = useState<string>('tokens');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 排序处理
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // 计算数据
  const modelUsageData = useMemo(() => {
    let data = generateModelUsageData(selectedCustomer?.companyName || null);
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
  }, [selectedCustomer, modelFilter, sortColumn, sortDirection]);

  const dailyTrendData = useMemo(() => generateDailyTrendData(), []);
  const modelTrendData = useMemo(() => generateModelTrendData(), []);
  const errorTrendData = useMemo(() => generateErrorTrendData(), []);
  
  const errorDetails = useMemo(() => {
    return generateErrorDetails(
      selectedCustomer?.companyName || null, 
      modelFilter
    );
  }, [selectedCustomer, modelFilter]);

  // 汇总统计
  const stats = useMemo(() => {
    const data = modelUsageData;
    const totalTokens = data.reduce((sum, m) => sum + m.tokens, 0);
    const totalInputTokens = data.reduce((sum, m) => sum + m.inputTokens, 0);
    const totalOutputTokens = data.reduce((sum, m) => sum + m.outputTokens, 0);
    const totalRequests = data.reduce((sum, m) => sum + m.requests, 0);
    const totalErrors = data.reduce((sum, m) => sum + m.errorCount, 0);
    const avgTTFT = data.length > 0 ? (data.reduce((sum, m) => sum + m.ttftAvg, 0) / data.length).toFixed(2) : '0';
    const avgTPOT = data.length > 0 ? (data.reduce((sum, m) => sum + m.tpotAvg, 0) / data.length).toFixed(1) : '0';
    const avgSuccessRate = data.length > 0 ? (data.reduce((sum, m) => sum + m.successRate, 0) / data.length).toFixed(1) : '0';
    const avgInputLatency = (latencyPerKTokenMinute.reduce((sum, l) => sum + l.inputLatency, 0) / latencyPerKTokenMinute.length).toFixed(2);
    const avgOutputLatency = (latencyPerKTokenMinute.reduce((sum, l) => sum + l.outputLatency, 0) / latencyPerKTokenMinute.length).toFixed(2);
    
    // 活跃用户数
    const activeUsers = selectedCustomer 
      ? selectedCustomer.usage.activeUsers 
      : mockCustomers.reduce((sum, c) => sum + c.usage.activeUsers, 0);
    
    return {
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalRequests,
      totalErrors,
      avgTTFT,
      avgTPOT,
      avgSuccessRate,
      avgInputLatency,
      avgOutputLatency,
      activeUsers,
    };
  }, [modelUsageData, selectedCustomer]);

  // 错误类型统计
  const errorByType = useMemo(() => {
    const errorCounts: Record<string, number> = {};
    errorDetails.forEach(e => {
      errorCounts[e.errorCode] = (errorCounts[e.errorCode] || 0) + e.errorCount;
    });
    const total = Object.values(errorCounts).reduce((sum, c) => sum + c, 0);
    return errorTypes.map(et => ({
      ...et,
      count: errorCounts[et.code] || 0,
      percentage: total > 0 ? parseFloat(((errorCounts[et.code] || 0) / total * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [errorDetails]);

  // 客户版本分布
  const planDistribution = [
    { name: '专业版', value: mockCustomers.filter(c => c.subscription.plan === 'professional').length },
    { name: '基础版', value: mockCustomers.filter(c => c.subscription.plan === 'starter').length },
  ];

  // Token消耗排名
  const tokenRanking = [...mockCustomers]
    .sort((a, b) => b.usage.monthlyTokens - a.usage.monthlyTokens)
    .slice(0, 5)
    .map(c => ({
      name: c.companyName.length > 8 ? c.companyName.slice(0, 8) + '...' : c.companyName,
      tokens: c.usage.monthlyTokens,
    }));

  // 分页错误明细
  const paginatedErrorDetails = useMemo(() => {
    const totalPages = Math.ceil(errorDetails.length / errorPageSize);
    const data = errorDetails.slice((errorPage - 1) * errorPageSize, errorPage * errorPageSize);
    return { data, totalPages };
  }, [errorDetails, errorPage]);

  return (
    <div className="space-y-6">
      {/* 统一筛选栏 */}
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
        
        {/* 客户筛选 */}
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">客户：</span>
          <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={customerPopoverOpen}
                className="w-[200px] justify-between"
              >
                <Building2 className="mr-2 h-4 w-4" />
                {selectedCustomer ? selectedCustomer.companyName : '全部客户'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="搜索客户..." />
                <CommandList>
                  <CommandEmpty>未找到客户</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedCustomerId('');
                        setCustomerPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !selectedCustomerId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      全部客户
                    </CommandItem>
                    {mockCustomers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.companyName}
                        onSelect={() => {
                          setSelectedCustomerId(customer.id);
                          setCustomerPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {customer.companyName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">业务概览</TabsTrigger>
          <TabsTrigger value="modelMetrics">模型指标</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">

      {/* 概览统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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


      {/* 模型性能指标 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base">
            模型性能指标
            {selectedCustomer && ` - ${selectedCustomer.companyName}`}
            {modelFilter !== 'all' && ` - ${modelFilter}`}
          </CardTitle>
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
              {modelUsageData.map((item) => (
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
                  <TableCell className="text-right text-destructive">{item.errorCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 错误分析区域 */}
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
                    <TableCell className="text-right font-medium">{item.count}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.percentage}%</TableCell>
                  </TableRow>
                ))}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模型</TableHead>
                  <TableHead className="text-right">错误数</TableHead>
                  <TableHead className="text-right">成功率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelUsageData.slice(0, 7).map((item) => (
                  <TableRow key={item.model}>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">{item.errorCount}</TableCell>
                    <TableCell className="text-right">{item.successRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                <TableHead>客户</TableHead>
                <TableHead>错误代码</TableHead>
                <TableHead className="text-right">发生时间</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedErrorDetails.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.model}</TableCell>
                  <TableCell>{item.customer}</TableCell>
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
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedErrorDetails.totalPages > 1 && (
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
        </CardContent>
      </Card>

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
                  <p className="text-xs text-muted-foreground">客户</p>
                  <p className="font-medium">{selectedError.customer}</p>
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
                  <p className="text-xs text-muted-foreground">错误次数</p>
                  <p className="font-medium text-destructive">{selectedError.errorCount} 次</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">发生时间</p>
                  <p className="font-medium">{selectedError.timestamp}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">重试间隔</p>
                  <p className="font-medium">{selectedError.retryAfter}</p>
                </div>
              </div>

              {/* 请求信息 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">请求信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">请求ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{selectedError.requestId}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(selectedError.requestId, '请求ID')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">接口端点</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{selectedError.endpoint}</code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">输入Token数</p>
                    <p className="font-medium">{selectedError.inputTokens.toLocaleString()} tokens</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">客户端</p>
                    <p className="font-medium">{selectedError.userAgent}</p>
                  </div>
                </div>
              </div>

              {/* 错误信息 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">错误信息</h4>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <code className="text-sm text-destructive font-mono break-all">{selectedError.errorMessage}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(selectedError.errorMessage, '错误信息')}
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
