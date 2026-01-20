import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Building2, Users, Zap, Shield, Clock, Activity, Settings, Globe, Eye, CalendarIcon, Cloud, Server, Database, Network, HardDrive, Cpu, MemoryStick, AlertTriangle, CheckCircle2, XCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [timeRangePreset, setTimeRangePreset] = useState<string>('7days');
  const [usageDateRange, setUsageDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 10;

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

  // 获取可选模型列表
  const availableModels = useMemo(() => {
    if (!customer) return [];
    return customer.modelUsage.map(m => m.model);
  }, [customer]);

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

  // 处理模型时延折线图数据（支持模型筛选）
  const latencyChartData = customer.modelLatencyTrend ? (() => {
    const filteredData = selectedModel === 'all' 
      ? customer.modelLatencyTrend 
      : customer.modelLatencyTrend.filter(item => item.model === selectedModel);
    
    const timeMap = new Map<string, Record<string, number>>();
    filteredData.forEach(item => {
      if (!timeMap.has(item.timestamp)) {
        timeMap.set(item.timestamp, {});
      }
      const entry = timeMap.get(item.timestamp)!;
      entry[`${item.model}_input`] = item.avgInputLatency;
      entry[`${item.model}_output`] = item.avgOutputLatency;
    });
    return Array.from(timeMap.entries()).map(([timestamp, data]) => ({
      timestamp,
      ...data,
    }));
  })() : [];

  // 筛选后的模型使用数据
  const filteredModelUsage = selectedModel === 'all' 
    ? customer.modelUsage 
    : customer.modelUsage.filter(m => m.model === selectedModel);

  // 筛选后的模型颜色

  const modelColors: Record<string, string> = {
    'GPT-4 Turbo': 'hsl(213, 94%, 50%)',
    'Claude 3.5 Sonnet': 'hsl(142, 76%, 36%)',
    'GPT-4o': 'hsl(38, 92%, 50%)',
    'GPT-4o Mini': 'hsl(0, 84%, 60%)',
  };

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
          <TabsTrigger value="overview">基本信息</TabsTrigger>
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

            {/* 配置信息 - 合并认证配置和模型配置 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  配置信息
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
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {/* 筛选器 */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">模型筛选：</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="all">全部模型</SelectItem>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">时间范围：</span>
              <div className="flex items-center gap-1">
                {timeRangePresets.filter(p => p.value !== 'custom').map(preset => (
                  <Button
                    key={preset.value}
                    variant={timeRangePreset === preset.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
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
                      className="gap-2 h-8"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {timeRangePreset === 'custom' 
                        ? `${usageDateRange.from ? format(usageDateRange.from, 'MM-dd') : ''} - ${usageDateRange.to ? format(usageDateRange.to, 'MM-dd') : ''}`
                        : '自定义'}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 使用趋势 - 动态时间粒度 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      // 计算时间范围（毫秒）
                      const timeRangeMs = usageDateRange.from && usageDateRange.to 
                        ? usageDateRange.to.getTime() - usageDateRange.from.getTime()
                        : 7 * 24 * 60 * 60 * 1000;
                      
                      const fourHoursMs = 4 * 60 * 60 * 1000;
                      const ninetySixHoursMs = 96 * 60 * 60 * 1000;
                      
                      // 根据时间范围生成模拟数据
                      let trendData: Array<{ time: string; tokens: number; requests: number; activeUsers: number }> = [];
                      let timeFormat: (value: string) => string;
                      let tooltipLabel: string;
                      
                      if (timeRangeMs <= fourHoursMs) {
                        // 分钟粒度
                        const minutes = Math.ceil(timeRangeMs / (60 * 1000));
                        const dataPoints = Math.min(minutes, 60);
                        for (let i = 0; i < dataPoints; i++) {
                          const date = new Date(usageDateRange.from!.getTime() + (i * timeRangeMs / dataPoints));
                          trendData.push({
                            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
                            tokens: Math.floor(Math.random() * 50000) + 10000,
                            requests: Math.floor(Math.random() * 100) + 20,
                            activeUsers: Math.floor(Math.random() * 15) + 5,
                          });
                        }
                        timeFormat = (value) => value;
                        tooltipLabel = '时间';
                      } else if (timeRangeMs <= ninetySixHoursMs) {
                        // 小时粒度
                        const hours = Math.ceil(timeRangeMs / (60 * 60 * 1000));
                        const dataPoints = Math.min(hours, 96);
                        for (let i = 0; i < dataPoints; i++) {
                          const date = new Date(usageDateRange.from!.getTime() + (i * timeRangeMs / dataPoints));
                          trendData.push({
                            time: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`,
                            tokens: Math.floor(Math.random() * 200000) + 50000,
                            requests: Math.floor(Math.random() * 500) + 100,
                            activeUsers: Math.floor(Math.random() * 30) + 10,
                          });
                        }
                        timeFormat = (value) => value.slice(-5);
                        tooltipLabel = '时间';
                      } else {
                        // 天粒度 - 使用现有 dailyUsage 数据并增加 activeUsers
                        trendData = customer.dailyUsage.map(d => ({
                          time: d.date,
                          tokens: d.tokens,
                          requests: d.requests,
                          activeUsers: Math.floor(Math.random() * 50) + 20,
                        }));
                        timeFormat = (value) => value.slice(5);
                        tooltipLabel = '日期';
                      }
                      
                      return (
                        <ComposedChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 11 }}
                            tickFormatter={timeFormat}
                          />
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
                            formatter={(value: number, name: string) => {
                              if (name === 'Token 消耗') return formatTokens(value);
                              return value;
                            }}
                            labelFormatter={(label) => `${tooltipLabel}: ${label}`}
                          />
                          <Bar 
                            yAxisId="right"
                            dataKey="activeUsers" 
                            fill="hsl(142, 76%, 36%)" 
                            name="活跃用户"
                            radius={[4, 4, 0, 0]}
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="tokens" 
                            stroke="hsl(213, 94%, 50%)" 
                            strokeWidth={2}
                            name="Token 消耗"
                            dot={false}
                          />
                        </ComposedChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                    <span>活跃用户</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(213, 94%, 50%)' }} />
                    <span>Token 消耗</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 模型使用分布 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">模型使用分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customer.modelUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="percentage"
                        nameKey="model"
                        label={({ model, percentage }) => `${model}: ${percentage}%`}
                        labelLine={false}
                      >
                        {customer.modelUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 模型详细使用 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">模型详细使用</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>模型</th>
                    <th>Token 消耗</th>
                    <th>Token占比</th>
                    <th>请求数(总/成功)</th>
                    <th>千Token输入平均时长</th>
                    <th>千Token输出平均时长</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModelUsage.map((usage, index) => (
                    <tr key={usage.model}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{usage.model}</span>
                        </div>
                      </td>
                      <td>{formatTokens(usage.tokens)}</td>
                      <td>{usage.percentage}%</td>
                      <td>
                        <span>{usage.requests.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-success">{usage.successfulRequests.toLocaleString()}</span>
                      </td>
                      <td>{usage.avgInputLatencyPer1KToken} ms</td>
                      <td>{usage.avgOutputLatencyPer1KToken} ms</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-medium bg-muted/50">
                    <td>
                      <span className="font-semibold">总计</span>
                    </td>
                    <td>{formatTokens(filteredModelUsage.reduce((sum, u) => sum + u.tokens, 0))}</td>
                    <td>{filteredModelUsage.reduce((sum, u) => sum + u.percentage, 0)}%</td>
                    <td>
                      <span>{filteredModelUsage.reduce((sum, u) => sum + u.requests, 0).toLocaleString()}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-success">{filteredModelUsage.reduce((sum, u) => sum + u.successfulRequests, 0).toLocaleString()}</span>
                    </td>
                    <td>
                      {filteredModelUsage.length > 0 
                        ? Math.round(filteredModelUsage.reduce((sum, u) => sum + u.avgInputLatencyPer1KToken, 0) / filteredModelUsage.length) 
                        : 0} ms
                    </td>
                    <td>
                      {filteredModelUsage.length > 0 
                        ? Math.round(filteredModelUsage.reduce((sum, u) => sum + u.avgOutputLatencyPer1KToken, 0) / filteredModelUsage.length) 
                        : 0} ms
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* 模型时延趋势图（分钟粒度） */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">模型千Token时延趋势（分钟粒度）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'ms', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const parts = name.split('_');
                        const model = parts.slice(0, -1).join('_');
                        const type = parts[parts.length - 1] === 'input' ? '输入' : '输出';
                        return [`${value} ms`, `${model} (${type})`];
                      }}
                      labelFormatter={(label) => `时间: ${label}`}
                    />
                    {(selectedModel === 'all' ? Object.keys(modelColors) : [selectedModel]).filter(m => modelColors[m]).map((model) => (
                      <React.Fragment key={model}>
                        <Line 
                          type="monotone" 
                          dataKey={`${model}_output`}
                          stroke={modelColors[model]}
                          strokeWidth={2}
                          name={`${model}_output`}
                          dot={{ r: 2 }}
                          connectNulls
                        />
                        <Line 
                          type="monotone" 
                          dataKey={`${model}_input`}
                          stroke={modelColors[model]}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name={`${model}_input`}
                          dot={{ r: 2 }}
                          connectNulls
                        />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {(selectedModel === 'all' ? Object.entries(modelColors) : [[selectedModel, modelColors[selectedModel]]]).filter(([_, color]) => color).map(([model, color]) => (
                  <div key={model} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span>{model}</span>
                    <span className="text-muted-foreground">(实线:输出, 虚线:输入)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 错误码分布和调用失败详情 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 错误码分布饼图 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  调用失败错误码分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customer.errorCodeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="errorCode"
                        label={({ errorCode, percentage }) => `${errorCode}: ${percentage}%`}
                        labelLine={false}
                      >
                        {customer.errorCodeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value} 次`,
                          props.payload.errorName
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {customer.errorCodeDistribution.map((item, index) => (
                    <div key={item.errorCode} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-mono">{item.errorCode}</span>
                        <span className="text-muted-foreground">{item.errorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{item.count}次</span>
                        <span className="text-muted-foreground">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 调用失败详情列表 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  调用失败详情
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="data-table">
                    <thead className="sticky top-0 bg-background z-10">
                      <tr>
                        <th>时间</th>
                        <th>模型</th>
                        <th>错误码</th>
                        <th>用户</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.callFailures.slice(0, 20).map((failure) => (
                        <tr key={failure.id}>
                          <td className="text-xs">{formatDateTime(failure.timestamp)}</td>
                          <td>
                            <span className="text-xs">{failure.model}</span>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-mono text-destructive">{failure.errorCode}</span>
                              <span className="text-xs text-muted-foreground">{failure.errorMessage}</span>
                            </div>
                          </td>
                          <td className="text-xs text-muted-foreground">{failure.userName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">当月活跃用户</CardTitle>
              <span className="text-sm text-muted-foreground">
                共 {customer.topUsers.length} 位用户
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>用户</th>
                    <th>Token 消耗</th>
                    <th>请求数</th>
                    <th>最近活跃</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.topUsers
                    .slice((userCurrentPage - 1) * usersPerPage, userCurrentPage * usersPerPage)
                    .map((user, index) => (
                      <tr key={user.id}>
                        <td className="text-center font-medium">
                          {(userCurrentPage - 1) * usersPerPage + index + 1}
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </td>
                        <td>{formatTokens(user.tokens)}</td>
                        <td>{user.requests.toLocaleString()}</td>
                        <td className="text-muted-foreground">{formatDateTime(user.lastActiveAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {/* 分页控件 */}
              {customer.topUsers.length > usersPerPage && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    第 {(userCurrentPage - 1) * usersPerPage + 1} - {Math.min(userCurrentPage * usersPerPage, customer.topUsers.length)} 条，共 {customer.topUsers.length} 条
                  </span>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))}
                          className={userCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(customer.topUsers.length / usersPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const totalPages = Math.ceil(customer.topUsers.length / usersPerPage);
                          if (totalPages <= 5) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - userCurrentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, i, arr) => (
                          <React.Fragment key={page}>
                            {i > 0 && arr[i - 1] !== page - 1 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => setUserCurrentPage(page)}
                                isActive={userCurrentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
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
                    <th>操作</th>
                    <th>操作人</th>
                    <th>详情</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                      <td>{log.action}</td>
                      <td>{log.actor}</td>
                      <td className="text-muted-foreground">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 云服务信息 */}
        <TabsContent value="cloud" className="space-y-4">
          {/* 架构概览 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                云服务架构
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4 space-y-3">
                {/* 统一网关 */}
                <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground text-sm">统一网关</span>
                </div>
                <div className="w-0.5 h-4 bg-border" />
                
                {/* SLB */}
                <div className="flex items-center gap-3 px-6 py-3 bg-info/10 border border-info/20 rounded-lg">
                  <Globe className="w-5 h-5 text-info" />
                  <span className="font-medium text-foreground text-sm">SLB 负载均衡</span>
                </div>
                <div className="w-0.5 h-4 bg-border" />
                
                {/* 云服务器 */}
                <div className="flex items-center gap-4">
                  {customer.cloudServices.servers.map((server) => (
                    <div key={server.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      server.status === 'healthy' ? 'bg-success/10 border-success/20' :
                      server.status === 'warning' ? 'bg-warning/10 border-warning/20' :
                      'bg-destructive/10 border-destructive/20'
                    }`}>
                      <Server className={`w-4 h-4 ${
                        server.status === 'healthy' ? 'text-success' :
                        server.status === 'warning' ? 'text-warning' :
                        'text-destructive'
                      }`} />
                      <span className="text-xs font-medium">服务器 {server.id}</span>
                    </div>
                  ))}
                </div>
                <div className="w-0.5 h-4 bg-border" />
                
                {/* 数据库和ES */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-lg">
                    <Database className="w-4 h-4 text-warning" />
                    <span className="text-xs font-medium">数据库</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <HardDrive className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium">Elasticsearch</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLB 监控 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-info" />
                SLB 负载均衡监控
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">IP 地址</div>
                  <div className="font-mono text-sm font-medium">{customer.cloudServices.slb.ip}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">活跃连接数</div>
                  <div className="font-medium text-lg">{customer.cloudServices.slb.activeConnections.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">/ {customer.cloudServices.slb.maxConnections.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">健康后端节点</div>
                  <div className={`font-medium text-lg flex items-center gap-1 ${
                    customer.cloudServices.slb.healthyBackendCount < customer.cloudServices.slb.totalBackendCount ? 'text-destructive' : 'text-success'
                  }`}>
                    {customer.cloudServices.slb.healthyBackendCount < customer.cloudServices.slb.totalBackendCount ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {customer.cloudServices.slb.healthyBackendCount} / {customer.cloudServices.slb.totalBackendCount}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">丢包率 / 错误数</div>
                  <div className="font-medium">
                    <span className={customer.cloudServices.slb.packetLossRate > 1 ? 'text-destructive' : ''}>{customer.cloudServices.slb.packetLossRate}%</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className={customer.cloudServices.slb.errorCount > 50 ? 'text-destructive' : ''}>{customer.cloudServices.slb.errorCount}</span>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">流入带宽</div>
                  <div className="font-medium">{customer.cloudServices.slb.inboundBandwidth} Mbps</div>
                  <div className="text-xs text-muted-foreground">/ {customer.cloudServices.slb.maxBandwidth} Mbps</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">流出带宽</div>
                  <div className="font-medium">{customer.cloudServices.slb.outboundBandwidth} Mbps</div>
                  <div className="text-xs text-muted-foreground">/ {customer.cloudServices.slb.maxBandwidth} Mbps</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 云服务器监控 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-success" />
                云服务器监控
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.cloudServices.servers.map((server) => (
                  <div key={server.id} className={`p-4 rounded-lg border ${
                    server.status === 'healthy' ? 'bg-success/5 border-success/20' :
                    server.status === 'warning' ? 'bg-warning/5 border-warning/20' :
                    'bg-destructive/5 border-destructive/20'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${
                        server.status === 'healthy' ? 'bg-success/20' :
                        server.status === 'warning' ? 'bg-warning/20' :
                        'bg-destructive/20'
                      }`}>
                        {server.status === 'healthy' ? <CheckCircle2 className="w-4 h-4 text-success" /> :
                         server.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-warning" /> :
                         <XCircle className="w-4 h-4 text-destructive" />}
                      </div>
                      <div>
                        <div className="font-medium">云服务器 {server.id}</div>
                        <div className="text-xs text-muted-foreground font-mono">{server.ip}</div>
                      </div>
                      <Badge variant={server.status === 'healthy' ? 'default' : server.status === 'warning' ? 'secondary' : 'destructive'} className="ml-auto">
                        {server.status === 'healthy' ? '健康' : server.status === 'warning' ? '警告' : '异常'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {/* CPU */}
                      <div className="p-2 bg-background/50 rounded">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Cpu className="w-3 h-3" />
                          CPU 使用率
                        </div>
                        <div className={`text-sm font-medium ${(server.cpuUser + server.cpuSystem) > 80 ? 'text-destructive' : (server.cpuUser + server.cpuSystem) > 70 ? 'text-warning' : ''}`}>
                          {(server.cpuUser + server.cpuSystem).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          User: {server.cpuUser}% | Sys: {server.cpuSystem}%
                        </div>
                      </div>
                      
                      {/* 内存 */}
                      <div className="p-2 bg-background/50 rounded">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MemoryStick className="w-3 h-3" />
                          内存可用
                        </div>
                        <div className={`text-sm font-medium ${(server.memoryAvailable / server.memoryTotal) < 0.2 ? 'text-destructive' : ''}`}>
                          {server.memoryAvailable} GB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          / {server.memoryTotal} GB
                        </div>
                      </div>
                      
                      {/* Load Average */}
                      <div className="p-2 bg-background/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">Load Average</div>
                        <div className={`text-sm font-medium ${server.loadAverage[0] > 4 ? 'text-destructive' : server.loadAverage[0] > 2 ? 'text-warning' : ''}`}>
                          {server.loadAverage[0].toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {server.loadAverage[1].toFixed(2)} / {server.loadAverage[2].toFixed(2)}
                        </div>
                      </div>
                      
                      {/* 磁盘 I/O */}
                      <div className="p-2 bg-background/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">磁盘 I/O</div>
                        <div className="text-sm font-medium">
                          R: {server.diskReadSpeed} MB/s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          W: {server.diskWriteSpeed} MB/s | Wait: {server.diskIoWait}%
                        </div>
                      </div>
                      
                      {/* 磁盘空间 */}
                      <div className="p-2 bg-background/50 rounded">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <HardDrive className="w-3 h-3" />
                          磁盘空间
                        </div>
                        <div className={`text-sm font-medium ${server.diskUsageRoot > 90 ? 'text-destructive' : server.diskUsageRoot > 80 ? 'text-warning' : ''}`}>
                          / : {server.diskUsageRoot}%
                        </div>
                        <div className={`text-xs ${server.diskUsageLogs > 90 ? 'text-destructive' : server.diskUsageLogs > 80 ? 'text-warning' : 'text-muted-foreground'}`}>
                          日志: {server.diskUsageLogs}%
                        </div>
                      </div>
                      
                      {/* 网络流量 */}
                      <div className="p-2 bg-background/50 rounded col-span-2">
                        <div className="text-xs text-muted-foreground mb-1">网络流量</div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <span>↓ {server.networkInbound} Mbps</span>
                          <span>↑ {server.networkOutbound} Mbps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 数据库监控 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-warning" />
                数据库监控
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">IP 地址</div>
                  <div className="font-mono text-sm font-medium">{customer.cloudServices.database.ip}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">连接数</div>
                  <div className={`font-medium text-lg ${(customer.cloudServices.database.currentConnections / customer.cloudServices.database.maxConnections) > 0.8 ? 'text-destructive' : ''}`}>
                    {customer.cloudServices.database.currentConnections}
                  </div>
                  <div className="text-xs text-muted-foreground">/ {customer.cloudServices.database.maxConnections}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">QPS / TPS</div>
                  <div className="font-medium">
                    <span className="text-lg">{customer.cloudServices.database.qps.toLocaleString()}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span>{customer.cloudServices.database.tps}</span>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">慢查询 /分钟</div>
                  <div className={`font-medium text-lg ${customer.cloudServices.database.slowQueriesPerMinute > 5 ? 'text-destructive' : customer.cloudServices.database.slowQueriesPerMinute > 2 ? 'text-warning' : ''}`}>
                    {customer.cloudServices.database.slowQueriesPerMinute}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">主从延迟</div>
                  <div className={`font-medium text-lg ${customer.cloudServices.database.replicationLag > 5 ? 'text-destructive' : customer.cloudServices.database.replicationLag > 2 ? 'text-warning' : ''}`}>
                    {customer.cloudServices.database.replicationLag}s
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">IOPS</div>
                  <div className="font-medium">
                    R: {customer.cloudServices.database.iopsRead.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    W: {customer.cloudServices.database.iopsWrite.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Elasticsearch 监控 */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-destructive" />
                Elasticsearch 监控
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">IP 地址</div>
                  <div className="font-mono text-sm font-medium">{customer.cloudServices.elasticsearch.ip}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">查询延迟</div>
                  <div className={`font-medium text-lg ${customer.cloudServices.elasticsearch.queryLatency > 100 ? 'text-destructive' : customer.cloudServices.elasticsearch.queryLatency > 50 ? 'text-warning' : ''}`}>
                    {customer.cloudServices.elasticsearch.queryLatency} ms
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">写入延迟</div>
                  <div className={`font-medium text-lg ${customer.cloudServices.elasticsearch.writeLatency > 100 ? 'text-destructive' : customer.cloudServices.elasticsearch.writeLatency > 50 ? 'text-warning' : ''}`}>
                    {customer.cloudServices.elasticsearch.writeLatency} ms
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">磁盘使用率</div>
                  <div className={`font-medium text-lg ${customer.cloudServices.elasticsearch.diskUsage > 85 ? 'text-destructive' : customer.cloudServices.elasticsearch.diskUsage > 70 ? 'text-warning' : ''}`}>
                    {customer.cloudServices.elasticsearch.diskUsage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {customer.cloudServices.elasticsearch.diskUsed} / {customer.cloudServices.elasticsearch.diskTotal} GB
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
