import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Clock,
  Download,
  Calendar,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { mockUsageStats, mockModels, mockDepartments, mockMembers } from '@/data/mockData';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'];

// Flatten departments for select
const flattenDepartments = (depts: typeof mockDepartments, prefix = ''): { id: string; name: string }[] => {
  const result: { id: string; name: string }[] = [];
  depts.forEach(dept => {
    const displayName = prefix ? `${prefix} / ${dept.name}` : dept.name;
    result.push({ id: dept.id, name: displayName });
    if (dept.children && dept.children.length > 0) {
      result.push(...flattenDepartments(dept.children, displayName));
    }
  });
  return result;
};

const allDepartments = flattenDepartments(mockDepartments);

type DateRangeType = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export function UsageDashboard() {
  // Filter states
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('7days');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    switch (dateRangeType) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case '7days':
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
      case '30days':
        return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
      case 'custom':
        return { from: customDateRange.from, to: customDateRange.to };
      default:
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    }
  };

  const dateRange = getDateRange();
  const showTrendChart = dateRangeType !== 'today' && dateRangeType !== 'yesterday';

  // Generate mock data based on filters (in real app, this would be API call)
  const filteredStats = useMemo(() => {
    // Mock filtering logic - in real app this would filter actual data
    let multiplier = 1;
    
    if (selectedModel !== 'all') multiplier *= 0.25;
    if (selectedDepartment !== 'all') multiplier *= 0.3;
    if (selectedMember !== 'all') multiplier *= 0.05;

    const dayCount = dateRangeType === 'today' || dateRangeType === 'yesterday' ? 1 : 
                     dateRangeType === '7days' ? 7 : 
                     dateRangeType === '30days' ? 30 : 7;

    return {
      userCount: Math.round(mockUsageStats.activeUsers * multiplier * (selectedMember !== 'all' ? 0.1 : 1)),
      totalTokens: Math.round(mockUsageStats.totalTokens * multiplier * (dayCount / 7)),
      totalRequests: Math.round(mockUsageStats.totalRequests * multiplier * (dayCount / 7)),
      avgLatency: mockUsageStats.avgLatency,
    };
  }, [dateRangeType, selectedModel, selectedDepartment, selectedMember]);

  // Generate trend data based on date range
  const trendData = useMemo(() => {
    const dayCount = dateRangeType === '7days' ? 7 : dateRangeType === '30days' ? 30 : 7;
    const data = [];
    const now = new Date();

    for (let i = dayCount - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const baseTokens = 300000 + Math.random() * 200000;
      const baseRequests = 1500 + Math.random() * 800;
      const baseUsers = 25 + Math.random() * 20;

      let multiplier = 1;
      if (selectedModel !== 'all') multiplier *= 0.25;
      if (selectedDepartment !== 'all') multiplier *= 0.3;
      if (selectedMember !== 'all') multiplier *= 0.05;

      data.push({
        date: format(date, 'MM-dd'),
        tokens: Math.round(baseTokens * multiplier),
        requests: Math.round(baseRequests * multiplier),
        users: Math.round(baseUsers * multiplier),
        latency: +(1.5 + Math.random() * 0.8).toFixed(2),
      });
    }
    return data;
  }, [dateRangeType, selectedModel, selectedDepartment, selectedMember]);

  // Get label for date range
  const getDateRangeLabel = () => {
    switch (dateRangeType) {
      case 'today': return '今日';
      case 'yesterday': return '昨日';
      case '7days': return '最近 7 天';
      case '30days': return '最近 30 天';
      case 'custom': 
        if (customDateRange.from && customDateRange.to) {
          return `${format(customDateRange.from, 'MM/dd')} - ${format(customDateRange.to, 'MM/dd')}`;
        }
        return '自定义日期';
      default: return '最近 7 天';
    }
  };

  // Check if any filter is active
  const hasActiveFilters = selectedModel !== 'all' || selectedDepartment !== 'all' || selectedMember !== 'all';

  const clearFilters = () => {
    setSelectedModel('all');
    setSelectedDepartment('all');
    setSelectedMember('all');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Bar */}
      <div className="enterprise-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                {getDateRangeLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b border-border">
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'today', label: '今日' },
                    { value: 'yesterday', label: '昨日' },
                    { value: '7days', label: '最近7天' },
                    { value: '30days', label: '最近30天' },
                  ].map(item => (
                    <Button
                      key={item.value}
                      variant={dateRangeType === item.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setDateRangeType(item.value as DateRangeType);
                        setCalendarOpen(false);
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-muted-foreground mb-2">自定义日期范围</p>
                <CalendarComponent
                  mode="range"
                  selected={{ from: customDateRange.from, to: customDateRange.to }}
                  onSelect={(range) => {
                    setCustomDateRange({ from: range?.from, to: range?.to });
                    if (range?.from && range?.to) {
                      setDateRangeType('custom');
                      setCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                  locale={zhCN}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Model Filter */}
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部模型</SelectItem>
              {mockModels.map(model => (
                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Department Filter */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="选择部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              {allDepartments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Member Filter */}
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="选择成员" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部成员</SelectItem>
              {mockMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="w-4 h-4" />
              清除筛选
            </Button>
          )}

          <div className="flex-1" />

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">当前筛选：</span>
            {selectedModel !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                模型: {mockModels.find(m => m.id === selectedModel)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedModel('all')} />
              </Badge>
            )}
            {selectedDepartment !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                部门: {allDepartments.find(d => d.id === selectedDepartment)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDepartment('all')} />
              </Badge>
            )}
            {selectedMember !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                成员: {mockMembers.find(m => m.id === selectedMember)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedMember('all')} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: '用户数', 
            value: filteredStats.userCount.toLocaleString(),
            icon: Users,
            change: '+3',
            unit: '人'
          },
          { 
            label: 'Token 消耗', 
            value: filteredStats.totalTokens >= 1000000 
              ? `${(filteredStats.totalTokens / 1000000).toFixed(2)}M`
              : `${(filteredStats.totalTokens / 1000).toFixed(1)}K`,
            icon: Zap,
            change: '+12.5%',
            unit: ''
          },
          { 
            label: '请求数', 
            value: filteredStats.totalRequests.toLocaleString(),
            icon: TrendingUp,
            change: '+8.2%',
            unit: '次'
          },
          { 
            label: '平均耗时', 
            value: `${filteredStats.avgLatency}`,
            icon: Clock,
            change: '-0.2s',
            unit: '秒'
          },
        ].map((stat, index) => (
          <div key={index} className="enterprise-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {stat.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
            </p>
            <p className="text-xs text-success mt-1">{stat.change} vs 上周</p>
          </div>
        ))}
      </div>

      {/* Trend Chart - Only show when date range > 1 day */}
      {showTrendChart && (
        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">使用趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'tokens') return [`${(value / 1000).toFixed(1)}K`, 'Token量'];
                    if (name === 'requests') return [value, '请求数'];
                    if (name === 'users') return [value, '用户数'];
                    if (name === 'latency') return [`${value}s`, '平均耗时'];
                    return [value, name];
                  }}
                />
                <Legend 
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      tokens: 'Token量',
                      requests: '请求数',
                      users: '用户数',
                      latency: '平均耗时',
                    };
                    return labels[value] || value;
                  }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="requests" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 0, r: 3 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(38, 92%, 50%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(38, 92%, 50%)', strokeWidth: 0, r: 3 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="latency" 
                  stroke="hsl(280, 67%, 50%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(280, 67%, 50%)', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Distribution */}
        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">模型分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockUsageStats.modelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="tokens"
                >
                  {mockUsageStats.modelDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(0)}K`, 'Tokens']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {mockUsageStats.modelDistribution.map((item, index) => (
              <div key={item.model} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-foreground">{item.model}</span>
                </div>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">部门用量分布</h3>
          <div className="space-y-3">
            {[
              { name: '技术中心', tokens: 1200000, percentage: 46 },
              { name: '产品设计部', tokens: 780000, percentage: 30 },
              { name: '市场运营部', tokens: 380000, percentage: 15 },
              { name: '其他', tokens: 220000, percentage: 9 },
            ].map((dept, index) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{dept.name}</span>
                  <span className="text-muted-foreground">{(dept.tokens / 1000).toFixed(0)}K ({dept.percentage}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${dept.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
