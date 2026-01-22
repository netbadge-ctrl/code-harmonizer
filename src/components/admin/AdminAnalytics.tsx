import React, { useState, useMemo } from 'react';
import { Building2, Users, Zap, TrendingUp, Activity, AlertTriangle, Clock, CalendarIcon, Check, ChevronsUpDown, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCustomers } from '@/data/adminMockData';
import { format, subDays, subHours, subMinutes, differenceInHours } from 'date-fns';
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

// 模拟按错误类型的统计数据
const errorByType = [
  { code: '429', name: '请求频率限制', count: 45, percentage: 36.9 },
  { code: '500', name: '服务器内部错误', count: 28, percentage: 23.0 },
  { code: '503', name: '服务不可用', count: 22, percentage: 18.0 },
  { code: '504', name: '网关超时', count: 15, percentage: 12.3 },
  { code: '400', name: '请求参数错误', count: 8, percentage: 6.6 },
  { code: '401', name: '认证失败', count: 4, percentage: 3.3 },
];

// 模拟按客户+模型的错误数据（增加错误类型）
const errorByCustomerModel = [
  { customer: '科技创新有限公司', model: 'GPT-4 Turbo', errorCode: '429', errorCount: 12 },
  { customer: '科技创新有限公司', model: 'GPT-4 Turbo', errorCode: '500', errorCount: 8 },
  { customer: '科技创新有限公司', model: 'GPT-4 Turbo', errorCode: '503', errorCount: 3 },
  { customer: '科技创新有限公司', model: 'Claude 3.5 Sonnet', errorCode: '429', errorCount: 5 },
  { customer: '科技创新有限公司', model: 'Claude 3.5 Sonnet', errorCode: '504', errorCount: 3 },
  { customer: '金融数据服务公司', model: 'GPT-4o', errorCode: '500', errorCount: 10 },
  { customer: '金融数据服务公司', model: 'GPT-4o', errorCode: '503', errorCount: 5 },
  { customer: '金融数据服务公司', model: 'GPT-4 Turbo', errorCode: '429', errorCount: 5 },
  { customer: '医疗健康科技', model: 'GPT-4 Turbo', errorCode: '429', errorCount: 18 },
  { customer: '医疗健康科技', model: 'GPT-4 Turbo', errorCode: '500', errorCount: 15 },
  { customer: '医疗健康科技', model: 'GPT-4 Turbo', errorCode: '504', errorCount: 9 },
  { customer: '医疗健康科技', model: 'Claude 3.5 Sonnet', errorCode: '503', errorCount: 12 },
  { customer: '医疗健康科技', model: 'Claude 3.5 Sonnet', errorCode: '400', errorCount: 6 },
  { customer: '医疗健康科技', model: 'GPT-4o Mini', errorCode: '401', errorCount: 4 },
  { customer: '医疗健康科技', model: 'GPT-4o Mini', errorCode: '429', errorCount: 3 },
  { customer: '教育科技集团', model: 'GPT-4o Mini', errorCode: '400', errorCount: 2 },
  { customer: '教育科技集团', model: 'GPT-4o Mini', errorCode: '500', errorCount: 1 },
  { customer: '智能制造有限公司', model: 'GPT-4o', errorCode: '504', errorCount: 1 },
];

// 模拟分钟级千Token时长数据
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

// 模拟模型列表
const availableModels = [
  'GPT-4 Turbo',
  'GPT-4o',
  'GPT-4o Mini',
  'Claude 3.5 Sonnet',
  'Claude 3 Opus',
  'DeepSeek V3',
  'Kimi K2',
];

// 模拟按模型的使用数据
const modelUsageData = [
  { model: 'GPT-4 Turbo', tokens: 45000000, requests: 12500, avgLatency: 1.85, errors: 42 },
  { model: 'GPT-4o', tokens: 38000000, requests: 15200, avgLatency: 1.52, errors: 28 },
  { model: 'GPT-4o Mini', tokens: 28000000, requests: 22000, avgLatency: 0.95, errors: 15 },
  { model: 'Claude 3.5 Sonnet', tokens: 52000000, requests: 18000, avgLatency: 1.68, errors: 35 },
  { model: 'Claude 3 Opus', tokens: 15000000, requests: 4500, avgLatency: 2.45, errors: 12 },
  { model: 'DeepSeek V3', tokens: 32000000, requests: 28000, avgLatency: 0.78, errors: 8 },
  { model: 'Kimi K2', tokens: 18000000, requests: 9800, avgLatency: 1.25, errors: 18 },
];

// 模拟按模型的趋势数据（包含Token和请求数）
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

const modelTrendData = generateModelTrendData();

type TimeRangePreset = '15min' | '4hours' | '24hours' | '7days' | 'custom';

// 模型性能指标数据
const modelPerformanceData = [
  { 
    model: 'GPT-4 Turbo', 
    peakTPM: 125000, 
    avgTPMDaily: 85000, 
    avgTPMBusiness: 98000, 
    ttftAvg: 0.42, 
    ttftP98: 1.25, 
    tpotAvg: 28.5,
    tokens: 45000000,
    requests: 12500,
    successRate: 99.2
  },
  { 
    model: 'GPT-4o', 
    peakTPM: 180000, 
    avgTPMDaily: 120000, 
    avgTPMBusiness: 145000, 
    ttftAvg: 0.35, 
    ttftP98: 0.98, 
    tpotAvg: 35.2,
    tokens: 38000000,
    requests: 15200,
    successRate: 99.5
  },
  { 
    model: 'GPT-4o Mini', 
    peakTPM: 250000, 
    avgTPMDaily: 180000, 
    avgTPMBusiness: 210000, 
    ttftAvg: 0.22, 
    ttftP98: 0.65, 
    tpotAvg: 48.6,
    tokens: 28000000,
    requests: 22000,
    successRate: 99.8
  },
  { 
    model: 'Claude 3.5 Sonnet', 
    peakTPM: 150000, 
    avgTPMDaily: 95000, 
    avgTPMBusiness: 115000, 
    ttftAvg: 0.38, 
    ttftP98: 1.15, 
    tpotAvg: 32.1,
    tokens: 52000000,
    requests: 18000,
    successRate: 99.3
  },
  { 
    model: 'Claude 3 Opus', 
    peakTPM: 80000, 
    avgTPMDaily: 45000, 
    avgTPMBusiness: 55000, 
    ttftAvg: 0.85, 
    ttftP98: 2.45, 
    tpotAvg: 18.5,
    tokens: 15000000,
    requests: 4500,
    successRate: 98.9
  },
  { 
    model: 'DeepSeek V3', 
    peakTPM: 320000, 
    avgTPMDaily: 220000, 
    avgTPMBusiness: 280000, 
    ttftAvg: 0.18, 
    ttftP98: 0.52, 
    tpotAvg: 65.8,
    tokens: 32000000,
    requests: 28000,
    successRate: 99.6
  },
  { 
    model: 'Kimi K2', 
    peakTPM: 200000, 
    avgTPMDaily: 140000, 
    avgTPMBusiness: 165000, 
    ttftAvg: 0.28, 
    ttftP98: 0.78, 
    tpotAvg: 42.3,
    tokens: 18000000,
    requests: 9800,
    successRate: 99.4
  },
];

// 生成每小时性能趋势数据
const generateHourlyPerformanceData = (model: string) => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    ttft: Math.random() * 0.3 + 0.2,
    ttftP98: Math.random() * 0.8 + 0.5,
    tpot: Math.random() * 20 + 25,
    tpm: Math.floor(Math.random() * 50000) + (i >= 9 && i <= 21 ? 100000 : 50000),
  }));
};

export function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<'global' | 'customer' | 'model'>('global');
  
  // Global tab state
  const [globalTimeRangePreset, setGlobalTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [globalDateRange, setGlobalDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [globalModelFilter, setGlobalModelFilter] = useState<string>('all');
  const [globalModelPopoverOpen, setGlobalModelPopoverOpen] = useState(false);
  
  // Customer data tab state
  const [customerTimeRangePreset, setCustomerTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [customerDateRange, setCustomerDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  
  // Model data tab state
  const [modelTimeRangePreset, setModelTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [modelDateRange, setModelDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [modelTabFilter, setModelTabFilter] = useState<string>('all');
  const [modelTabPopoverOpen, setModelTabPopoverOpen] = useState(false);

  const handleGlobalPresetChange = (preset: TimeRangePreset) => {
    setGlobalTimeRangePreset(preset);
    const now = new Date();
    switch (preset) {
      case '15min':
        setGlobalDateRange({ from: subMinutes(now, 15), to: now });
        break;
      case '4hours':
        setGlobalDateRange({ from: subHours(now, 4), to: now });
        break;
      case '24hours':
        setGlobalDateRange({ from: subHours(now, 24), to: now });
        break;
      case '7days':
        setGlobalDateRange({ from: subDays(now, 7), to: now });
        break;
    }
  };

  const handleCustomerPresetChange = (preset: TimeRangePreset) => {
    setCustomerTimeRangePreset(preset);
    const now = new Date();
    switch (preset) {
      case '15min':
        setCustomerDateRange({ from: subMinutes(now, 15), to: now });
        break;
      case '4hours':
        setCustomerDateRange({ from: subHours(now, 4), to: now });
        break;
      case '24hours':
        setCustomerDateRange({ from: subHours(now, 24), to: now });
        break;
      case '7days':
        setCustomerDateRange({ from: subDays(now, 7), to: now });
        break;
    }
  };

  const handleModelPresetChange = (preset: TimeRangePreset) => {
    setModelTimeRangePreset(preset);
    const now = new Date();
    switch (preset) {
      case '15min':
        setModelDateRange({ from: subMinutes(now, 15), to: now });
        break;
      case '4hours':
        setModelDateRange({ from: subHours(now, 4), to: now });
        break;
      case '24hours':
        setModelDateRange({ from: subHours(now, 24), to: now });
        break;
      case '7days':
        setModelDateRange({ from: subDays(now, 7), to: now });
        break;
    }
  };

  const selectedCustomer = mockCustomers.find(c => c.id === selectedCustomerId);

  // 统计数据
  const stats = {
    totalCustomers: mockCustomers.length,
    activeCustomers: mockCustomers.filter(c => c.subscription.status === 'active').length,
    totalUsers: mockCustomers.reduce((sum, c) => sum + c.subscription.usedSeats, 0),
    activeUsers: mockCustomers.reduce((sum, c) => sum + c.usage.activeUsers, 0),
    totalTokens: mockCustomers.reduce((sum, c) => sum + c.usage.totalTokens, 0),
    monthlyTokens: mockCustomers.reduce((sum, c) => sum + c.usage.monthlyTokens, 0),
    totalRequests: mockCustomers.reduce((sum, c) => sum + c.usage.totalRequests, 0),
    monthlyRequests: mockCustomers.reduce((sum, c) => sum + c.usage.monthlyRequests, 0),
    totalErrors: errorByCustomerModel.reduce((sum, e) => sum + e.errorCount, 0),
  };

  // 按版本分布
  const planDistribution = [
    { name: '专业版', value: mockCustomers.filter(c => c.subscription.plan === 'professional').length },
    { name: '基础版', value: mockCustomers.filter(c => c.subscription.plan === 'starter').length },
  ];

  // 按客户 Token 消耗排名
  const tokenRanking = [...mockCustomers]
    .sort((a, b) => b.usage.monthlyTokens - a.usage.monthlyTokens)
    .slice(0, 5)
    .map(c => ({
      name: c.companyName.length > 8 ? c.companyName.slice(0, 8) + '...' : c.companyName,
      tokens: c.usage.monthlyTokens,
    }));

  // 模拟每日趋势数据
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      tokens: Math.floor(Math.random() * 20000000) + 40000000,
      requests: Math.floor(Math.random() * 5000) + 15000,
    };
  });

  // 计算平均时延
  const avgInputLatency = (latencyPerKTokenMinute.reduce((sum, l) => sum + l.inputLatency, 0) / latencyPerKTokenMinute.length).toFixed(2);
  const avgOutputLatency = (latencyPerKTokenMinute.reduce((sum, l) => sum + l.outputLatency, 0) / latencyPerKTokenMinute.length).toFixed(2);

  // 过滤后的模型数据
  const filteredModelUsageData = useMemo(() => {
    if (globalModelFilter === 'all') {
      return modelUsageData;
    }
    return modelUsageData.filter(m => m.model === globalModelFilter);
  }, [globalModelFilter]);

  // 模型视角统计
  const modelStats = useMemo(() => {
    const data = filteredModelUsageData;
    return {
      totalTokens: data.reduce((sum, m) => sum + m.tokens, 0),
      totalRequests: data.reduce((sum, m) => sum + m.requests, 0),
      avgLatency: data.length > 0 
        ? (data.reduce((sum, m) => sum + m.avgLatency, 0) / data.length).toFixed(2)
        : '0',
      totalErrors: data.reduce((sum, m) => sum + m.errors, 0),
    };
  }, [filteredModelUsageData]);

  // 根据时间范围生成客户趋势数据
  const generateCustomerTrendData = () => {
    const hours = differenceInHours(customerDateRange.to, customerDateRange.from);
    
    if (hours <= 4) {
      // 分钟级
      return Array.from({ length: Math.min(60, hours * 60) }, (_, i) => ({
        time: `${Math.floor(i / 60)}:${String(i % 60).padStart(2, '0')}`,
        tokens: Math.floor(Math.random() * 50000) + 10000,
        requests: Math.floor(Math.random() * 100) + 20,
        activeUsers: Math.floor(Math.random() * 10) + 1,
      }));
    } else if (hours <= 96) {
      // 小时级
      return Array.from({ length: Math.min(hours, 96) }, (_, i) => ({
        time: `${i}时`,
        tokens: Math.floor(Math.random() * 500000) + 100000,
        requests: Math.floor(Math.random() * 500) + 100,
        activeUsers: Math.floor(Math.random() * 30) + 5,
      }));
    } else {
      // 天级
      const days = Math.ceil(hours / 24);
      return Array.from({ length: Math.min(days, 30) }, (_, i) => {
        const date = new Date(customerDateRange.from);
        date.setDate(date.getDate() + i);
        return {
          time: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          tokens: Math.floor(Math.random() * 2000000) + 500000,
          requests: Math.floor(Math.random() * 2000) + 500,
          activeUsers: Math.floor(Math.random() * 50) + 10,
        };
      });
    }
  };

  const customerTrendData = generateCustomerTrendData();

  const renderTimeRangePicker = (
    preset: TimeRangePreset,
    dateRange: { from: Date; to: Date },
    onPresetChange: (preset: TimeRangePreset) => void,
    onDateRangeChange: (range: { from: Date; to: Date }) => void,
    onPresetSet: (preset: TimeRangePreset) => void
  ) => (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">查询时间：</span>
      <div className="flex items-center gap-2 flex-nowrap">
        <Button
          variant={preset === '15min' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('15min')}
          className="whitespace-nowrap"
        >
          最近15分钟
        </Button>
        <Button
          variant={preset === '4hours' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('4hours')}
          className="whitespace-nowrap"
        >
          最近4小时
        </Button>
        <Button
          variant={preset === '24hours' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('24hours')}
          className="whitespace-nowrap"
        >
          最近24小时
        </Button>
        <Button
          variant={preset === '7days' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('7days')}
          className="whitespace-nowrap"
        >
          最近7天
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="min-w-[200px] justify-start whitespace-nowrap"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {preset === 'custom' ? (
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
                  onDateRangeChange({ from: range.from, to: range.to });
                  onPresetSet('custom');
                } else if (range?.from) {
                  onDateRangeChange({ from: range.from, to: range.from });
                  onPresetSet('custom');
                }
              }}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const renderGlobalTab = () => (
    <div className="space-y-6">
      {/* 时间范围和模型筛选 - 同一行不折行 */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">查询时间：</span>
          <div className="flex items-center gap-2 flex-nowrap">
            <Button
              variant={globalTimeRangePreset === '15min' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGlobalPresetChange('15min')}
              className="whitespace-nowrap"
            >
              最近15分钟
            </Button>
            <Button
              variant={globalTimeRangePreset === '4hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGlobalPresetChange('4hours')}
              className="whitespace-nowrap"
            >
              最近4小时
            </Button>
            <Button
              variant={globalTimeRangePreset === '24hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGlobalPresetChange('24hours')}
              className="whitespace-nowrap"
            >
              最近24小时
            </Button>
            <Button
              variant={globalTimeRangePreset === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGlobalPresetChange('7days')}
              className="whitespace-nowrap"
            >
              最近7天
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={globalTimeRangePreset === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-[200px] justify-start whitespace-nowrap"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {globalTimeRangePreset === 'custom' ? (
                    <>
                      {format(globalDateRange.from, 'yyyy/MM/dd', { locale: zhCN })} - {format(globalDateRange.to, 'yyyy/MM/dd', { locale: zhCN })}
                    </>
                  ) : (
                    '自定义日期'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: globalDateRange.from, to: globalDateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setGlobalDateRange({ from: range.from, to: range.to });
                      setGlobalTimeRangePreset('custom');
                    } else if (range?.from) {
                      setGlobalDateRange({ from: range.from, to: range.from });
                      setGlobalTimeRangePreset('custom');
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
          <span className="text-sm text-muted-foreground whitespace-nowrap">模型筛选：</span>
          <Popover open={globalModelPopoverOpen} onOpenChange={setGlobalModelPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={globalModelPopoverOpen}
                className="w-[200px] justify-between"
              >
                <Cpu className="mr-2 h-4 w-4" />
                {globalModelFilter === 'all' ? '全部模型' : globalModelFilter}
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
                        setGlobalModelFilter('all');
                        setGlobalModelPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          globalModelFilter === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      全部模型
                    </CommandItem>
                    {availableModels.map((model) => (
                      <CommandItem
                        key={model}
                        value={model}
                        onSelect={() => {
                          setGlobalModelFilter(model);
                          setGlobalModelPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            globalModelFilter === model ? "opacity-100" : "opacity-0"
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
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                <p className="text-xs text-muted-foreground">
                  总客户数 ({stats.activeCustomers} 活跃)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">
                  活跃用户 / {stats.totalUsers} 总用户
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatTokens(stats.monthlyTokens)}</p>
                <p className="text-xs text-muted-foreground">
                  所选日期累计 Token
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Activity className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.monthlyRequests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  所选日期累计请求数
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 错误统计和时延统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalErrors}</p>
                <p className="text-xs text-muted-foreground">输出错误总数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {avgInputLatency}s / {avgOutputLatency}s
                </p>
                <p className="text-xs text-muted-foreground">千Token平均时长 (输入/输出)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 每日 Token 趋势 */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              每日 Token 消耗趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatTokens(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatTokens(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(213, 94%, 50%)" 
                    strokeWidth={2}
                    name="Token 消耗"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 客户版本分布 */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              客户版本分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Token 消耗排名 */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              客户 Token 消耗排名 (本月)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokenRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatTokens(value)}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatTokens(value)}
                  />
                  <Bar 
                    dataKey="tokens" 
                    fill="hsl(213, 94%, 50%)"
                    radius={[0, 4, 4, 0]}
                    name="Token 消耗"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 千Token时延趋势 (分钟级) */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              千Token平均时长趋势 (分钟级)
            </CardTitle>
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
          </CardContent>
        </Card>
      </div>

      {/* 模型视角数据 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            模型使用数据 {globalModelFilter !== 'all' && `- ${globalModelFilter}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 模型统计概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Token 消耗</p>
              <p className="text-xl font-bold">{formatTokens(modelStats.totalTokens)}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">请求次数</p>
              <p className="text-xl font-bold">{modelStats.totalRequests.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">平均时延</p>
              <p className="text-xl font-bold">{modelStats.avgLatency}s</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">错误数</p>
              <p className="text-xl font-bold text-destructive">{modelStats.totalErrors}</p>
            </div>
          </div>
          
          {/* 模型数据表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型</TableHead>
                <TableHead className="text-right">Token 消耗</TableHead>
                <TableHead className="text-right">请求次数</TableHead>
                <TableHead className="text-right">平均时延</TableHead>
                <TableHead className="text-right">错误数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModelUsageData.map((item) => (
                <TableRow key={item.model}>
                  <TableCell className="font-medium">{item.model}</TableCell>
                  <TableCell className="text-right">{formatTokens(item.tokens)}</TableCell>
                  <TableCell className="text-right">{item.requests.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.avgLatency}s</TableCell>
                  <TableCell className="text-right text-destructive font-medium">{item.errors}</TableCell>
                </TableRow>
              ))}
              {/* 总计行 */}
              <TableRow className="bg-muted/30 font-medium">
                <TableCell>总计</TableCell>
                <TableCell className="text-right">{formatTokens(modelStats.totalTokens)}</TableCell>
                <TableCell className="text-right">{modelStats.totalRequests.toLocaleString()}</TableCell>
                <TableCell className="text-right">{modelStats.avgLatency}s</TableCell>
                <TableCell className="text-right text-destructive">{modelStats.totalErrors}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 模型调用趋势 */}
      {globalModelFilter === 'all' && (
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              模型调用趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={modelTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    yAxisId="tokens"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatTokens(value)}
                    label={{ value: 'Token', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                  />
                  <YAxis 
                    yAxisId="requests"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    label={{ value: '请求数', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name.includes('_tokens')) {
                        return [formatTokens(value), name.replace('_tokens', ' (Token)')];
                      }
                      return [value.toLocaleString(), name.replace('_requests', ' (请求数)')];
                    }}
                  />
                  {/* Token 消耗线 - 实线 */}
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="GPT-4 Turbo_tokens" 
                    stroke="hsl(213, 94%, 50%)" 
                    strokeWidth={2}
                    dot={false}
                    name="GPT-4 Turbo_tokens"
                  />
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="GPT-4o_tokens" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={false}
                    name="GPT-4o_tokens"
                  />
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="Claude 3.5 Sonnet_tokens" 
                    stroke="hsl(38, 92%, 50%)" 
                    strokeWidth={2}
                    dot={false}
                    name="Claude 3.5 Sonnet_tokens"
                  />
                  <Line 
                    yAxisId="tokens"
                    type="monotone" 
                    dataKey="DeepSeek V3_tokens" 
                    stroke="hsl(280, 65%, 60%)" 
                    strokeWidth={2}
                    dot={false}
                    name="DeepSeek V3_tokens"
                  />
                  {/* 请求数线 - 虚线 */}
                  <Line 
                    yAxisId="requests"
                    type="monotone" 
                    dataKey="GPT-4 Turbo_requests" 
                    stroke="hsl(213, 94%, 50%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="GPT-4 Turbo_requests"
                  />
                  <Line 
                    yAxisId="requests"
                    type="monotone" 
                    dataKey="GPT-4o_requests" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="GPT-4o_requests"
                  />
                  <Line 
                    yAxisId="requests"
                    type="monotone" 
                    dataKey="Claude 3.5 Sonnet_requests" 
                    stroke="hsl(38, 92%, 50%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Claude 3.5 Sonnet_requests"
                  />
                  <Line 
                    yAxisId="requests"
                    type="monotone" 
                    dataKey="DeepSeek V3_requests" 
                    stroke="hsl(280, 65%, 60%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="DeepSeek V3_requests"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 justify-center">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(213, 94%, 50%)' }} />
                <span>GPT-4 Turbo</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                <span>GPT-4o</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                <span>Claude 3.5 Sonnet</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(280, 65%, 60%)' }} />
                <span>DeepSeek V3</span>
              </div>
              <div className="flex items-center gap-2 text-xs ml-4 border-l pl-4">
                <div className="w-6 h-0.5 bg-foreground" />
                <span>Token (实线)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-foreground" />
                <span>请求数 (虚线)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误代码统计 */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              按错误代码统计
            </CardTitle>
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
      </div>

      {/* 按客户+模型+错误类型的输出错误数表格 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            按客户+模型的错误明细
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客户</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>错误代码</TableHead>
                <TableHead className="text-right">错误数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorByCustomerModel
                .filter(item => globalModelFilter === 'all' || item.model === globalModelFilter)
                .map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.customer}</TableCell>
                  <TableCell>{item.model}</TableCell>
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
                  <TableCell className="text-right text-destructive font-medium">{item.errorCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomerTab = () => (
    <div className="space-y-6">
      {/* 客户筛选和时间范围选择 - 同一行不折行 */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">选择客户：</span>
          <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={customerPopoverOpen}
                className="w-[280px] justify-between"
              >
                {selectedCustomer
                  ? `${selectedCustomer.companyName} (${selectedCustomer.customerCode})`
                  : "请选择客户"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              <Command>
                <CommandInput placeholder="搜索客户名称或识别码..." />
                <CommandList>
                  <CommandEmpty>未找到客户</CommandEmpty>
                  <CommandGroup>
                    {mockCustomers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={`${customer.companyName} ${customer.customerCode}`}
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
                        {customer.companyName} ({customer.customerCode})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* 时间范围选择 - 内联 */}
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">查询时间：</span>
          <div className="flex items-center gap-2 flex-nowrap">
            <Button
              variant={customerTimeRangePreset === '15min' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCustomerPresetChange('15min')}
              className="whitespace-nowrap"
            >
              最近15分钟
            </Button>
            <Button
              variant={customerTimeRangePreset === '4hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCustomerPresetChange('4hours')}
              className="whitespace-nowrap"
            >
              最近4小时
            </Button>
            <Button
              variant={customerTimeRangePreset === '24hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCustomerPresetChange('24hours')}
              className="whitespace-nowrap"
            >
              最近24小时
            </Button>
            <Button
              variant={customerTimeRangePreset === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCustomerPresetChange('7days')}
              className="whitespace-nowrap"
            >
              最近7天
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={customerTimeRangePreset === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-[200px] justify-start whitespace-nowrap"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customerTimeRangePreset === 'custom' ? (
                    <>
                      {format(customerDateRange.from, 'yyyy/MM/dd', { locale: zhCN })} - {format(customerDateRange.to, 'yyyy/MM/dd', { locale: zhCN })}
                    </>
                  ) : (
                    '自定义日期'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: customerDateRange.from, to: customerDateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setCustomerDateRange({ from: range.from, to: range.to });
                      setCustomerTimeRangePreset('custom');
                    } else if (range?.from) {
                      setCustomerDateRange({ from: range.from, to: range.from });
                      setCustomerTimeRangePreset('custom');
                    }
                  }}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {selectedCustomer ? (
        <>
          {/* 客户统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Zap className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatTokens(selectedCustomer.usage.monthlyTokens)}</p>
                    <p className="text-xs text-muted-foreground">Token 消耗</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Activity className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{selectedCustomer.usage.monthlyRequests.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">请求次数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{selectedCustomer.usage.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">活跃用户</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="enterprise-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Clock className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{(Math.random() * 2 + 0.5).toFixed(2)}s</p>
                    <p className="text-xs text-muted-foreground">平均响应时间</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 客户使用趋势 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                使用趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={customerTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatTokens(value)}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => 
                        name === 'Token 消耗' ? formatTokens(value) : value
                      }
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="activeUsers" 
                      fill="hsl(38, 92%, 50%)"
                      opacity={0.6}
                      name="活跃用户"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="hsl(213, 94%, 50%)" 
                      strokeWidth={2}
                      name="Token 消耗"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 模型使用分布 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                模型使用分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'GPT-4 Turbo', value: 45 },
                        { name: 'Claude 3.5', value: 30 },
                        { name: 'GPT-4o', value: 15 },
                        { name: '其他', value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {[0, 1, 2, 3].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="enterprise-card">
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">请选择一个客户查看详细数据</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // 过滤后的模型性能数据
  const filteredModelPerformanceData = useMemo(() => {
    if (modelTabFilter === 'all') {
      return modelPerformanceData;
    }
    return modelPerformanceData.filter(m => m.model === modelTabFilter);
  }, [modelTabFilter]);

  // 模型性能汇总统计
  const modelPerformanceStats = useMemo(() => {
    const data = filteredModelPerformanceData;
    return {
      totalTokens: data.reduce((sum, m) => sum + m.tokens, 0),
      totalRequests: data.reduce((sum, m) => sum + m.requests, 0),
      avgTTFT: data.length > 0 
        ? (data.reduce((sum, m) => sum + m.ttftAvg, 0) / data.length).toFixed(2)
        : '0',
      avgTPOT: data.length > 0 
        ? (data.reduce((sum, m) => sum + m.tpotAvg, 0) / data.length).toFixed(1)
        : '0',
      peakTPM: Math.max(...data.map(m => m.peakTPM)),
      avgSuccessRate: data.length > 0 
        ? (data.reduce((sum, m) => sum + m.successRate, 0) / data.length).toFixed(1)
        : '0',
    };
  }, [filteredModelPerformanceData]);

  const renderModelTab = () => (
    <div className="space-y-6">
      {/* 时间范围和模型筛选 - 同一行不折行 */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">查询时间：</span>
          <div className="flex items-center gap-2 flex-nowrap">
            <Button
              variant={modelTimeRangePreset === '15min' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModelPresetChange('15min')}
              className="whitespace-nowrap"
            >
              最近15分钟
            </Button>
            <Button
              variant={modelTimeRangePreset === '4hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModelPresetChange('4hours')}
              className="whitespace-nowrap"
            >
              最近4小时
            </Button>
            <Button
              variant={modelTimeRangePreset === '24hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModelPresetChange('24hours')}
              className="whitespace-nowrap"
            >
              最近24小时
            </Button>
            <Button
              variant={modelTimeRangePreset === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModelPresetChange('7days')}
              className="whitespace-nowrap"
            >
              最近7天
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={modelTimeRangePreset === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-[200px] justify-start whitespace-nowrap"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {modelTimeRangePreset === 'custom' ? (
                    <>
                      {format(modelDateRange.from, 'yyyy/MM/dd', { locale: zhCN })} - {format(modelDateRange.to, 'yyyy/MM/dd', { locale: zhCN })}
                    </>
                  ) : (
                    '自定义日期'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: modelDateRange.from, to: modelDateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setModelDateRange({ from: range.from, to: range.to });
                      setModelTimeRangePreset('custom');
                    } else if (range?.from) {
                      setModelDateRange({ from: range.from, to: range.from });
                      setModelTimeRangePreset('custom');
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
          <span className="text-sm text-muted-foreground whitespace-nowrap">模型筛选：</span>
          <Popover open={modelTabPopoverOpen} onOpenChange={setModelTabPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={modelTabPopoverOpen}
                className="w-[200px] justify-between"
              >
                <Cpu className="mr-2 h-4 w-4" />
                {modelTabFilter === 'all' ? '全部模型' : modelTabFilter}
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
                        setModelTabFilter('all');
                        setModelTabPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          modelTabFilter === 'all' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      全部模型
                    </CommandItem>
                    {availableModels.map((model) => (
                      <CommandItem
                        key={model}
                        value={model}
                        onSelect={() => {
                          setModelTabFilter(model);
                          setModelTabPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            modelTabFilter === model ? "opacity-100" : "opacity-0"
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

      {/* 模型性能概览统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatTokens(modelPerformanceStats.peakTPM)}</p>
              <p className="text-xs text-muted-foreground">峰值 TPM</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{modelPerformanceStats.avgTTFT}s</p>
              <p className="text-xs text-muted-foreground">平均 TTFT</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{modelPerformanceStats.avgTPOT}</p>
              <p className="text-xs text-muted-foreground">平均 TPOT (tokens/s)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatTokens(modelPerformanceStats.totalTokens)}</p>
              <p className="text-xs text-muted-foreground">Token 消耗</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{modelPerformanceStats.totalRequests.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">请求总数</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{modelPerformanceStats.avgSuccessRate}%</p>
              <p className="text-xs text-muted-foreground">成功率</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模型性能指标表格 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            模型性能指标 {modelTabFilter !== 'all' && `- ${modelTabFilter}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模型</TableHead>
                  <TableHead className="text-right">峰值 TPM</TableHead>
                  <TableHead className="text-right">平均 TPM (按天)</TableHead>
                  <TableHead className="text-right">平均 TPM (09:30-21:30)</TableHead>
                  <TableHead className="text-right">TTFT 平均时延 (s)</TableHead>
                  <TableHead className="text-right">P98 TTFT (s)</TableHead>
                  <TableHead className="text-right">TPOT (tokens/s)</TableHead>
                  <TableHead className="text-right">Token 消耗</TableHead>
                  <TableHead className="text-right">请求数</TableHead>
                  <TableHead className="text-right">成功率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModelPerformanceData.map((item) => (
                  <TableRow key={item.model}>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    <TableCell className="text-right">{formatTokens(item.peakTPM)}</TableCell>
                    <TableCell className="text-right">{formatTokens(item.avgTPMDaily)}</TableCell>
                    <TableCell className="text-right">{formatTokens(item.avgTPMBusiness)}</TableCell>
                    <TableCell className="text-right">{item.ttftAvg.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.ttftP98.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.tpotAvg.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatTokens(item.tokens)}</TableCell>
                    <TableCell className="text-right">{item.requests.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-success font-medium">{item.successRate}%</TableCell>
                  </TableRow>
                ))}
                {/* 总计行 */}
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell>总计/平均</TableCell>
                  <TableCell className="text-right">{formatTokens(modelPerformanceStats.peakTPM)}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">{modelPerformanceStats.avgTTFT}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">{modelPerformanceStats.avgTPOT}</TableCell>
                  <TableCell className="text-right">{formatTokens(modelPerformanceStats.totalTokens)}</TableCell>
                  <TableCell className="text-right">{modelPerformanceStats.totalRequests.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-success">{modelPerformanceStats.avgSuccessRate}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* TTFT 和 TPOT 趋势图 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              TTFT 首Token时延趋势 (每小时)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={generateHourlyPerformanceData(modelTabFilter === 'all' ? 'GPT-4 Turbo' : modelTabFilter)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="s" />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}s`} />
                  <Bar 
                    dataKey="ttft" 
                    fill="hsl(213, 94%, 50%)"
                    opacity={0.6}
                    name="平均 TTFT"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ttftP98" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    dot={false}
                    name="P98 TTFT"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(213, 94%, 50%)', opacity: 0.6 }} />
                <span>平均 TTFT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
                <span>P98 TTFT</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              TPOT Token生成速度趋势 (每小时)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateHourlyPerformanceData(modelTabFilter === 'all' ? 'GPT-4 Turbo' : modelTabFilter)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" t/s" />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)} tokens/s`} />
                  <Line 
                    type="monotone" 
                    dataKey="tpot" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    name="TPOT"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TPM 趋势图 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            TPM 趋势 (每小时)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateHourlyPerformanceData(modelTabFilter === 'all' ? 'GPT-4 Turbo' : modelTabFilter)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatTokens(value)} />
                <Tooltip formatter={(value: number) => formatTokens(value)} />
                <Bar 
                  dataKey="tpm" 
                  fill="hsl(38, 92%, 50%)"
                  opacity={0.8}
                  name="TPM"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            注：工作时段 (09:30-21:30) TPM 通常显著高于非工作时段
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab 切换 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'global' | 'customer' | 'model')}>
        <TabsList>
          <TabsTrigger value="global">全局数据</TabsTrigger>
          <TabsTrigger value="customer">客户数据</TabsTrigger>
          <TabsTrigger value="model">模型数据</TabsTrigger>
        </TabsList>
        
        <TabsContent value="global" className="mt-6">
          {renderGlobalTab()}
        </TabsContent>
        
        <TabsContent value="customer" className="mt-6">
          {renderCustomerTab()}
        </TabsContent>

        <TabsContent value="model" className="mt-6">
          {renderModelTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
