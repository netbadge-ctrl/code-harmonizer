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
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockUsageStats, mockModels, mockDepartments, mockMembers } from '@/data/mockData';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
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

// Multi-select dropdown component
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onChange(options.map(o => o.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      return options.find(o => o.id === selected[0])?.name || placeholder;
    }
    return `已选 ${selected.length} 项`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 gap-2 min-w-[140px] justify-between"
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-popover border border-border shadow-lg z-50" align="start">
        <div className="p-2 border-b border-border flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={selectAll}>
            全选
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={clearAll}>
            清空
          </Button>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-2 space-y-1">
            {options.map(option => (
              <div
                key={option.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => toggleOption(option.id)}
              >
                <Checkbox 
                  checked={selected.includes(option.id)}
                  onCheckedChange={() => toggleOption(option.id)}
                  className="pointer-events-none"
                />
                <span className="text-sm truncate">{option.name}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

type DateRangeType = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export function UsageDashboard() {
  // Filter states
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('7days');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Prepare options for multi-select
  const modelOptions = mockModels.map(m => ({ id: m.id, name: m.name }));
  const memberOptions = mockMembers.map(m => ({ id: m.id, name: m.name }));

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
    
    if (selectedModels.length > 0) multiplier *= (selectedModels.length / mockModels.length) * 0.8;
    if (selectedDepartments.length > 0) multiplier *= (selectedDepartments.length / allDepartments.length) * 0.8;
    if (selectedMembers.length > 0) multiplier *= (selectedMembers.length / mockMembers.length) * 0.5;

    const dayCount = dateRangeType === 'today' || dateRangeType === 'yesterday' ? 1 : 
                     dateRangeType === '7days' ? 7 : 
                     dateRangeType === '30days' ? 30 : 7;

    return {
      userCount: Math.round(mockUsageStats.activeUsers * multiplier * (selectedMembers.length > 0 ? 0.3 : 1)),
      totalTokens: Math.round(mockUsageStats.totalTokens * multiplier * (dayCount / 7)),
      totalRequests: Math.round(mockUsageStats.totalRequests * multiplier * (dayCount / 7)),
      avgLatency: mockUsageStats.avgLatency,
    };
  }, [dateRangeType, selectedModels, selectedDepartments, selectedMembers]);

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
      if (selectedModels.length > 0) multiplier *= (selectedModels.length / mockModels.length) * 0.8;
      if (selectedDepartments.length > 0) multiplier *= (selectedDepartments.length / allDepartments.length) * 0.8;
      if (selectedMembers.length > 0) multiplier *= (selectedMembers.length / mockMembers.length) * 0.5;

      data.push({
        date: format(date, 'MM-dd'),
        tokens: Math.round(baseTokens * multiplier),
        requests: Math.round(baseRequests * multiplier),
        users: Math.round(baseUsers * multiplier),
        latency: +(1.5 + Math.random() * 0.8).toFixed(2),
      });
    }
    return data;
  }, [dateRangeType, selectedModels, selectedDepartments, selectedMembers]);

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
  const hasActiveFilters = selectedModels.length > 0 || selectedDepartments.length > 0 || selectedMembers.length > 0;

  const clearFilters = () => {
    setSelectedModels([]);
    setSelectedDepartments([]);
    setSelectedMembers([]);
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
          <MultiSelectDropdown
            label="模型"
            options={modelOptions}
            selected={selectedModels}
            onChange={setSelectedModels}
            placeholder="全部模型"
          />

          {/* Department Filter */}
          <MultiSelectDropdown
            label="部门"
            options={allDepartments}
            selected={selectedDepartments}
            onChange={setSelectedDepartments}
            placeholder="全部部门"
          />

          {/* Member Filter */}
          <MultiSelectDropdown
            label="成员"
            options={memberOptions}
            selected={selectedMembers}
            onChange={setSelectedMembers}
            placeholder="全部成员"
          />

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
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">当前筛选：</span>
            {selectedModels.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                模型: {selectedModels.length === 1 
                  ? mockModels.find(m => m.id === selectedModels[0])?.name 
                  : `${selectedModels.length} 个`}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedModels([])} />
              </Badge>
            )}
            {selectedDepartments.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                部门: {selectedDepartments.length === 1 
                  ? allDepartments.find(d => d.id === selectedDepartments[0])?.name 
                  : `${selectedDepartments.length} 个`}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDepartments([])} />
              </Badge>
            )}
            {selectedMembers.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                成员: {selectedMembers.length === 1 
                  ? mockMembers.find(m => m.id === selectedMembers[0])?.name 
                  : `${selectedMembers.length} 人`}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedMembers([])} />
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
