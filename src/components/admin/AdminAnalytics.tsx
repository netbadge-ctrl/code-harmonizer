import React, { useState, useMemo } from 'react';
import { Building2, Users, Zap, TrendingUp, Activity, AlertTriangle, Clock, CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
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

// 模拟按客户+模型的错误数据
const errorByCustomerModel = [
  { customer: '科技创新有限公司', model: 'GPT-4 Turbo', errorCount: 23 },
  { customer: '科技创新有限公司', model: 'Claude 3.5 Sonnet', errorCount: 8 },
  { customer: '金融数据服务公司', model: 'GPT-4o', errorCount: 15 },
  { customer: '金融数据服务公司', model: 'GPT-4 Turbo', errorCount: 5 },
  { customer: '医疗健康科技', model: 'GPT-4 Turbo', errorCount: 42 },
  { customer: '医疗健康科技', model: 'Claude 3.5 Sonnet', errorCount: 18 },
  { customer: '医疗健康科技', model: 'GPT-4o Mini', errorCount: 7 },
  { customer: '教育科技集团', model: 'GPT-4o Mini', errorCount: 3 },
  { customer: '智能制造有限公司', model: 'GPT-4o', errorCount: 1 },
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

type TimeRangePreset = '15min' | '4hours' | '24hours' | '7days' | 'custom';

export function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<'global' | 'customer'>('global');
  
  // Global tab state
  const [globalTimeRangePreset, setGlobalTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [globalDateRange, setGlobalDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  // Customer data tab state
  const [customerTimeRangePreset, setCustomerTimeRangePreset] = useState<TimeRangePreset>('7days');
  const [customerDateRange, setCustomerDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);

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
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">查询时间：</span>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={preset === '15min' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('15min')}
        >
          最近15分钟
        </Button>
        <Button
          variant={preset === '4hours' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('4hours')}
        >
          最近4小时
        </Button>
        <Button
          variant={preset === '24hours' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('24hours')}
        >
          最近24小时
        </Button>
        <Button
          variant={preset === '7days' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPresetChange('7days')}
        >
          最近7天
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="min-w-[200px] justify-start"
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
      {/* 时间范围选择 */}
      {renderTimeRangePicker(
        globalTimeRangePreset,
        globalDateRange,
        handleGlobalPresetChange,
        setGlobalDateRange,
        setGlobalTimeRangePreset
      )}
      
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

      {/* 按客户+模型的输出错误数表格 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            按客户+模型的输出错误数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客户</TableHead>
                <TableHead>模型</TableHead>
                <TableHead className="text-right">错误数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorByCustomerModel.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.customer}</TableCell>
                  <TableCell>{item.model}</TableCell>
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
      {/* 客户筛选和时间范围选择 */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">选择客户：</span>
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
      </div>
      
      {/* 时间范围选择 */}
      {renderTimeRangePicker(
        customerTimeRangePreset,
        customerDateRange,
        handleCustomerPresetChange,
        setCustomerDateRange,
        setCustomerTimeRangePreset
      )}

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

  return (
    <div className="space-y-6">
      {/* Tab 切换 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'global' | 'customer')}>
        <TabsList>
          <TabsTrigger value="global">全局数据</TabsTrigger>
          <TabsTrigger value="customer">客户数据</TabsTrigger>
        </TabsList>
        
        <TabsContent value="global" className="mt-6">
          {renderGlobalTab()}
        </TabsContent>
        
        <TabsContent value="customer" className="mt-6">
          {renderCustomerTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
