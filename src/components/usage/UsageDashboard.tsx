import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Clock,
  Calendar,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  Search,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockUsageStats, mockModels, mockDepartments, mockMembers } from '@/data/mockData';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Department } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)', 'hsl(280, 67%, 50%)'];

// Flatten departments for display names
const flattenDepartmentsHelper = (depts: Department[], prefix = ''): { id: string; name: string; level: number }[] => {
  const result: { id: string; name: string; level: number }[] = [];
  const processLevel = (departments: Department[], currentPrefix: string, level: number) => {
    departments.forEach(dept => {
      const displayName = currentPrefix ? `${currentPrefix} / ${dept.name}` : dept.name;
      result.push({ id: dept.id, name: displayName, level });
      if (dept.children && dept.children.length > 0) {
        processLevel(dept.children, displayName, level + 1);
      }
    });
  };
  processLevel(depts, prefix, 1);
  return result;
};

const allDepartmentsFlat = flattenDepartmentsHelper(mockDepartments);

// Get all descendant IDs of a department
const getDescendantIds = (dept: Department): string[] => {
  const ids: string[] = [];
  if (dept.children) {
    dept.children.forEach(child => {
      ids.push(child.id);
      ids.push(...getDescendantIds(child));
    });
  }
  return ids;
};

// Cascading Department Tree Node
function DepartmentTreeNode({
  dept,
  selected,
  onChange,
  expanded,
  onToggleExpand,
  level = 0,
}: {
  dept: Department;
  selected: string[];
  onChange: (selected: string[]) => void;
  expanded: string[];
  onToggleExpand: (id: string) => void;
  level?: number;
}) {
  const hasChildren = dept.children && dept.children.length > 0;
  const isExpanded = expanded.includes(dept.id);
  const isSelected = selected.includes(dept.id);
  
  // Check if all children are selected
  const allChildrenSelected = hasChildren && dept.children!.every(child => {
    const descendantIds = [child.id, ...getDescendantIds(child)];
    return descendantIds.every(id => selected.includes(id));
  });
  
  // Check if some children are selected
  const someChildrenSelected = hasChildren && dept.children!.some(child => {
    const descendantIds = [child.id, ...getDescendantIds(child)];
    return descendantIds.some(id => selected.includes(id));
  });

  const handleToggle = () => {
    const descendantIds = getDescendantIds(dept);
    const allIds = [dept.id, ...descendantIds];
    
    if (isSelected || allChildrenSelected) {
      // Deselect this and all descendants
      onChange(selected.filter(id => !allIds.includes(id)));
    } else {
      // Select this and all descendants
      onChange([...new Set([...selected, ...allIds])]);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(dept.id);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <div
          className="flex items-center gap-2 flex-1"
          onClick={handleToggle}
        >
          <Checkbox 
            checked={isSelected || allChildrenSelected}
            className={`pointer-events-none ${someChildrenSelected && !allChildrenSelected ? 'data-[state=checked]:bg-primary/50' : ''}`}
          />
          <span className="text-sm">{dept.name}</span>
          <span className="text-xs text-muted-foreground">({dept.memberCount}人)</span>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {dept.children!.map(child => (
            <DepartmentTreeNode
              key={child.id}
              dept={child}
              selected={selected}
              onChange={onChange}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Cascading Department Multi-Select
function CascadingDepartmentSelect({
  selected,
  onChange,
  placeholder,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['dept-1', 'dept-2']);

  const toggleExpand = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    onChange(allDepartmentsFlat.map(d => d.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      return allDepartmentsFlat.find(d => d.id === selected[0])?.name || placeholder;
    }
    return `已选 ${selected.length} 个部门`;
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
      <PopoverContent className="w-72 p-0 bg-popover border border-border shadow-lg z-50" align="start">
        <div className="p-2 border-b border-border flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={selectAll}>
            全选
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={clearAll}>
            清空
          </Button>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="p-1">
            {mockDepartments.map(dept => (
              <DepartmentTreeNode
                key={dept.id}
                dept={dept}
                selected={selected}
                onChange={onChange}
                expanded={expanded}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Multi-select dropdown component (for models and members)
function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder,
}: {
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

const allDepartments = allDepartmentsFlat;

type DateRangeType = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

// Date Range Picker Component
function DateRangePicker({
  dateRangeType,
  setDateRangeType,
  customDateRange,
  setCustomDateRange,
}: {
  dateRangeType: DateRangeType;
  setDateRangeType: (type: DateRangeType) => void;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  setCustomDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  return (
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
  );
}

// Mock department usage data - all departments with 3 levels
const mockDepartmentUsage = [
  { id: 'dept-1', name: '技术中心', tokens: 1200000, requests: 5800, users: 15, percentage: 46, level: 1, parentId: null },
  { id: 'dept-1-1', name: '前端开发组', tokens: 480000, requests: 2200, users: 6, percentage: 18, level: 2, parentId: 'dept-1' },
  { id: 'dept-1-2', name: '后端开发组', tokens: 520000, requests: 2500, users: 5, percentage: 20, level: 2, parentId: 'dept-1' },
  { id: 'dept-1-2-1', name: 'Java 小组', tokens: 280000, requests: 1300, users: 3, percentage: 11, level: 3, parentId: 'dept-1-2' },
  { id: 'dept-1-2-2', name: 'Go 小组', tokens: 240000, requests: 1200, users: 2, percentage: 9, level: 3, parentId: 'dept-1-2' },
  { id: 'dept-1-3', name: 'DevOps 组', tokens: 200000, requests: 1100, users: 4, percentage: 8, level: 2, parentId: 'dept-1' },
  { id: 'dept-2', name: '产品设计部', tokens: 780000, requests: 3200, users: 8, percentage: 30, level: 1, parentId: null },
  { id: 'dept-2-1', name: 'UI/UX 设计组', tokens: 420000, requests: 1800, users: 4, percentage: 16, level: 2, parentId: 'dept-2' },
  { id: 'dept-2-2', name: '产品经理组', tokens: 360000, requests: 1400, users: 4, percentage: 14, level: 2, parentId: 'dept-2' },
  { id: 'dept-3', name: '市场运营部', tokens: 380000, requests: 1800, users: 6, percentage: 15, level: 1, parentId: null },
  { id: 'dept-3-1', name: '内容运营组', tokens: 200000, requests: 900, users: 3, percentage: 8, level: 2, parentId: 'dept-3' },
  { id: 'dept-3-2', name: '推广运营组', tokens: 180000, requests: 900, users: 3, percentage: 7, level: 2, parentId: 'dept-3' },
  { id: 'dept-4', name: '行政人事部', tokens: 120000, requests: 600, users: 4, percentage: 5, level: 1, parentId: null },
  { id: 'dept-5', name: '财务部', tokens: 100000, requests: 500, users: 3, percentage: 4, level: 1, parentId: null },
];

// Get departments by level for the dropdown
const getDepartmentsByLevel = (level: number) => {
  return mockDepartmentUsage.filter(d => d.level === level);
};

// Mock member usage data with detailed info
const mockMemberUsage = [
  { 
    id: 'm1', 
    name: '张伟', 
    email: 'zhangwei@tech.com',
    department: '研发中心/平台部/后端组', 
    tokens: 145208, 
    requests: 1200, 
    avgLatency: 1.8,
    activeDays: 18,
    totalDays: 30,
    mostUsedTerminal: 'VS Code Extension',
    lastActive: '2024-03-23 09:45',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 75 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 20 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 5 },
    ]
  },
  { 
    id: 'm2', 
    name: '李明', 
    email: 'liming@tech.com',
    department: '研发中心/平台部/前端组', 
    tokens: 98500, 
    requests: 850, 
    avgLatency: 1.6,
    activeDays: 22,
    totalDays: 30,
    mostUsedTerminal: 'WebStorm Plugin',
    lastActive: '2024-03-22 16:30',
    modelPreference: [
      { model: 'Qwen3-Coder (重构/注释)', percentage: 60 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 30 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  { 
    id: 'm3', 
    name: '王芳', 
    email: 'wangfang@tech.com',
    department: '产品设计部/UI设计组', 
    tokens: 76000, 
    requests: 620, 
    avgLatency: 2.1,
    activeDays: 15,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-21 14:20',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 45 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 35 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 20 },
    ]
  },
  { 
    id: 'm4', 
    name: '赵强', 
    email: 'zhaoqiang@tech.com',
    department: '研发中心/基础架构组', 
    tokens: 125000, 
    requests: 980, 
    avgLatency: 1.9,
    activeDays: 20,
    totalDays: 30,
    mostUsedTerminal: 'VS Code Extension',
    lastActive: '2024-03-23 11:15',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 55 },
      { model: 'GLM-4 (代码审查)', percentage: 25 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 20 },
    ]
  },
  { 
    id: 'm5', 
    name: '钱丽', 
    email: 'qianli@tech.com',
    department: '市场运营部/内容运营组', 
    tokens: 45000, 
    requests: 380, 
    avgLatency: 1.7,
    activeDays: 12,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-20 09:30',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 70 },
      { model: '文心一言 (营销文案)', percentage: 20 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
  { 
    id: 'm6', 
    name: '孙浩', 
    email: 'sunhao@tech.com',
    department: '产品设计部/产品经理组', 
    tokens: 52000, 
    requests: 420, 
    avgLatency: 2.0,
    activeDays: 14,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-22 10:45',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 50 },
      { model: 'GLM-4 (代码审查)', percentage: 30 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 20 },
    ]
  },
];

// Mock model average latency data
const mockModelLatency = [
  { model: 'Kimi', avgLatency: 1.8, requests: 4200 },
  { model: 'Qwen 2.5', avgLatency: 1.5, requests: 3800 },
  { model: 'DeepSeek V3', avgLatency: 2.1, requests: 2500 },
  { model: 'GLM-4', avgLatency: 1.9, requests: 1200 },
  { model: '文心一言', avgLatency: 2.4, requests: 750 },
];

export function UsageDashboard() {
  const [activeTab, setActiveTab] = useState('global');
  
  // Filter states
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('7days');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Trend chart data selection - default all selected
  const [selectedTrendMetrics, setSelectedTrendMetrics] = useState<string[]>(['users', 'tokens', 'requests']);

  // Organization drill-down state
  const [orgBreadcrumb, setOrgBreadcrumb] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: '全部组织' }
  ]);
  // View mode for organization: 'department' or 'member'
  const [orgViewMode, setOrgViewMode] = useState<'department' | 'member'>('department');
  
  // Member search state for organization member view
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<typeof mockMemberUsage[0] | null>(null);
  
  // Filter members by search query
  const filteredSearchMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return [];
    const query = memberSearchQuery.toLowerCase();
    return mockMemberUsage.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.email.toLowerCase().includes(query)
    );
  }, [memberSearchQuery]);

  // Prepare options for multi-select
  const modelOptions = mockModels.map(m => ({ id: m.id, name: m.name }));
  const memberOptions = mockMembers.map(m => ({ id: m.id, name: m.name }));

  // Trend metrics options
  const trendMetricOptions = [
    { id: 'users', name: '活跃用户数' },
    { id: 'tokens', name: 'Token量' },
    { id: 'requests', name: '调用次数' },
  ];

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

  const showTrendChart = dateRangeType !== 'today' && dateRangeType !== 'yesterday';

  // Generate mock data based on filters
  const filteredStats = useMemo(() => {
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
        date: format(date, 'MM/dd'),
        tokens: Math.round(baseTokens * multiplier),
        requests: Math.round(baseRequests * multiplier),
        users: Math.round(baseUsers * multiplier),
      });
    }

    return data;
  }, [dateRangeType, selectedModels, selectedDepartments, selectedMembers]);

  // Check if any filters are active
  const hasActiveFilters = selectedModels.length > 0 || 
    (selectedDepartments.length > 0 && activeTab === 'member') ||
    (selectedMembers.length > 0 && activeTab === 'member');

  const clearFilters = () => {
    setSelectedModels([]);
    setSelectedDepartments([]);
    setSelectedMembers([]);
  };

  // Get current parent id from breadcrumb for drill-down
  const currentParentId = orgBreadcrumb[orgBreadcrumb.length - 1].id;

  // Get departments for current drill-down level
  const currentDepartments = useMemo(() => {
    if (currentParentId === null) {
      // Show level 1 departments
      return mockDepartmentUsage.filter(dept => dept.level === 1);
    }
    // Show children of current parent
    return mockDepartmentUsage.filter(dept => dept.parentId === currentParentId);
  }, [currentParentId]);

  // Get members for current department (when viewing members)
  const currentDepartmentMembers = useMemo(() => {
    if (!currentParentId) return [];
    const currentDept = mockDepartmentUsage.find(d => d.id === currentParentId);
    if (!currentDept) return [];
    // Filter mock members that belong to this department or its parents
    return mockMemberUsage.filter(m => {
      // Simple matching based on department name
      return m.department.includes(currentDept.name.split(' ')[0]) || 
             currentDept.name.includes(m.department);
    });
  }, [currentParentId]);

  // Handle drill-down into a department
  const handleDrillDown = (deptId: string, deptName: string) => {
    setOrgBreadcrumb(prev => [...prev, { id: deptId, name: deptName }]);
    setOrgViewMode('department');
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    setOrgBreadcrumb(prev => prev.slice(0, index + 1));
    setOrgViewMode('department');
  };

  // Handle view members of a department
  const handleViewMembers = (deptId: string, deptName: string) => {
    setOrgBreadcrumb(prev => [...prev, { id: deptId, name: deptName }]);
    setOrgViewMode('member');
  };

  // Check if department has children
  const hasChildren = (deptId: string) => {
    return mockDepartmentUsage.some(d => d.parentId === deptId);
  };

  const renderFilterBar = () => (
    <div className="enterprise-card p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range - Always show */}
        <DateRangePicker
          dateRangeType={dateRangeType}
          setDateRangeType={setDateRangeType}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />

        {/* Model Filter - Always show */}
        <MultiSelectDropdown
          options={modelOptions}
          selected={selectedModels}
          onChange={setSelectedModels}
          placeholder="全部模型"
        />


        {/* Department Filter - Show for member tab only */}
        {activeTab === 'member' && (
          <CascadingDepartmentSelect
            selected={selectedDepartments}
            onChange={setSelectedDepartments}
            placeholder="全部部门"
          />
        )}

        {/* Member Filter - Show only for member tab */}
        {activeTab === 'member' && (
          <MultiSelectDropdown
            options={memberOptions}
            selected={selectedMembers}
            onChange={setSelectedMembers}
            placeholder="全部成员"
          />
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-4 h-4" />
            清除筛选
          </Button>
        )}

        <div className="flex-1" />
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
          {selectedDepartments.length > 0 && activeTab === 'member' && (
            <Badge variant="secondary" className="gap-1">
              部门: {selectedDepartments.length === 1 
                ? allDepartments.find(d => d.id === selectedDepartments[0])?.name 
                : `${selectedDepartments.length} 个`}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDepartments([])} />
            </Badge>
          )}
          {selectedMembers.length > 0 && activeTab === 'member' && (
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
  );

  // Render Global Tab Content
  const renderGlobalContent = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: '活跃用户', 
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

      {/* Trend Chart */}
      {showTrendChart && (
        <div className="enterprise-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">使用趋势</h3>
            <MultiSelectDropdown
              options={trendMetricOptions}
              selected={selectedTrendMetrics}
              onChange={setSelectedTrendMetrics}
              placeholder="选择数据项"
            />
          </div>
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
                    if (name === 'requests') return [value, '调用次数'];
                    if (name === 'users') return [value, '活跃用户数'];
                    return [value, name];
                  }}
                />
                <Legend 
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      tokens: 'Token量',
                      requests: '调用次数',
                      users: '活跃用户数',
                    };
                    return labels[value] || value;
                  }}
                />
                {selectedTrendMetrics.includes('tokens') && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                  />
                )}
                {selectedTrendMetrics.includes('requests') && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 0, r: 3 }}
                  />
                )}
                {selectedTrendMetrics.includes('users') && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(38, 92%, 50%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(38, 92%, 50%)', strokeWidth: 0, r: 3 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Model Consumption & Model Average Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">模型消耗</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={mockUsageStats.modelDistribution} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  type="category" 
                  dataKey="model" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(0)}K`, 'Token消耗']}
                />
                <Bar 
                  dataKey="tokens" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Average Latency */}
        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">按模型的平均耗时</h3>
          <div className="space-y-4">
            {mockModelLatency.map((item, index) => (
              <div key={item.model} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.model}</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.requests.toLocaleString()} 次请求)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{item.avgLatency}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Organization Tab Content
  const renderOrganizationContent = () => (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="enterprise-card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {orgBreadcrumb.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`text-sm px-2 py-1 rounded hover:bg-muted transition-colors ${
                  index === orgBreadcrumb.length - 1 
                    ? 'font-medium text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </button>
            </div>
          ))}
          {orgViewMode === 'member' && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              <span className="text-sm font-medium text-primary px-2 py-1">成员用量</span>
            </>
          )}
        </div>
      </div>

      {/* Department View */}
      {orgViewMode === 'department' && (
        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">
            {currentParentId ? '下级组织' : '一级组织'}用量
          </h3>
          {currentDepartments.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">排名</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">组织名称</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Token消耗</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">请求数</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">用户数</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">占比</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDepartments.map((dept, index) => (
                    <tr key={dept.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{dept.name}</td>
                      <td className="px-4 py-3 text-right text-foreground">{(dept.tokens / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3 text-right text-foreground">{dept.requests.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-foreground">{dept.users}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${dept.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10 text-right">{dept.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {hasChildren(dept.id) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs gap-1"
                              onClick={() => handleDrillDown(dept.id, dept.name)}
                            >
                              <ChevronRight className="w-3 h-3" />
                              下钻
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs gap-1"
                            onClick={() => handleViewMembers(dept.id, dept.name)}
                          >
                            <Users className="w-3 h-3" />
                            成员
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              该组织暂无下级组织
            </div>
          )}
        </div>
      )}

      {/* Member Search View within Organization */}
      {orgViewMode === 'member' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="enterprise-card p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="输入成员姓名或邮箱查询详细用量..."
                value={memberSearchQuery}
                onChange={(e) => {
                  setMemberSearchQuery(e.target.value);
                  setSelectedMemberDetail(null);
                }}
                className="pl-10 h-11"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {memberSearchQuery && !selectedMemberDetail && filteredSearchMembers.length > 0 && (
              <div className="mt-3 border border-border rounded-lg overflow-hidden">
                {filteredSearchMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border last:border-b-0"
                    onClick={() => setSelectedMemberDetail(member)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary-foreground">{member.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.department}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {memberSearchQuery && !selectedMemberDetail && filteredSearchMembers.length === 0 && (
              <div className="mt-3 text-center py-6 text-muted-foreground">
                未找到匹配的成员
              </div>
            )}
          </div>

          {/* Selected Member Detail View */}
          {selectedMemberDetail && (
            <div className="enterprise-card p-5">
              {/* Back button and Member Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-foreground">{selectedMemberDetail.name[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{selectedMemberDetail.name}</h3>
                      <span className="text-sm text-muted-foreground">{selectedMemberDetail.department}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedMemberDetail.email} · 最近活跃: {selectedMemberDetail.lastActive}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setSelectedMemberDetail(null);
                    setMemberSearchQuery('');
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回列表
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-primary font-medium mb-2">个人累计消耗 (Tokens)</p>
                  <p className="text-3xl font-semibold text-foreground text-right">{selectedMemberDetail.tokens.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-primary font-medium mb-2">本月活跃天数</p>
                  <p className="text-3xl font-semibold text-foreground text-right">
                    {selectedMemberDetail.activeDays} <span className="text-lg text-muted-foreground">/ {selectedMemberDetail.totalDays}</span>
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-primary font-medium mb-2">最常使用终端</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-medium text-foreground">{selectedMemberDetail.mostUsedTerminal}</span>
                  </div>
                </div>
              </div>

              {/* Model Preference Distribution */}
              <div>
                <p className="text-sm text-primary font-medium mb-4">模型偏好分布</p>
                <div className="space-y-4">
                  {selectedMemberDetail.modelPreference.map((pref, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{pref.model}</span>
                        <span className="text-sm text-muted-foreground">{pref.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pref.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render Member Tab Content
  const renderMemberContent = () => (
    <div className="space-y-6">
      {/* Member Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="enterprise-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">成员总数</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">{mockMembers.length}</p>
        </div>
        <div className="enterprise-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">活跃成员</span>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <User className="w-4 h-4 text-success" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">{mockMemberUsage.length}</p>
        </div>
        <div className="enterprise-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">人均Token</span>
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {(mockMemberUsage.reduce((sum, m) => sum + m.tokens, 0) / mockMemberUsage.length / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Member Usage Table */}
      <div className="enterprise-card p-5">
        <h3 className="font-semibold text-foreground mb-4">成员用量排行</h3>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">排名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">成员</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">部门</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Token消耗</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">请求数</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">平均耗时</th>
              </tr>
            </thead>
            <tbody>
              {mockMemberUsage.map((member, index) => (
                <tr key={member.name} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-foreground">{member.name[0]}</span>
                      </div>
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.department}</td>
                  <td className="px-4 py-3 text-right text-foreground">{(member.tokens / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-right text-foreground">{member.requests.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-foreground">{member.avgLatency}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Distribution by Department */}
      <div className="enterprise-card p-5">
        <h3 className="font-semibold text-foreground mb-4">部门成员分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['技术中心', '产品设计部', '市场运营部', '其他'].map((dept, index) => {
            const count = mockMemberUsage.filter(m => m.department === dept || (dept === '其他' && !['技术中心', '产品设计部', '市场运营部'].includes(m.department))).length;
            return (
              <div key={dept} className="p-4 bg-muted/30 rounded-lg text-center">
                <div 
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}
                >
                  <Building2 className="w-5 h-5" style={{ color: COLORS[index % COLORS.length] }} />
                </div>
                <p className="text-sm text-muted-foreground">{dept}</p>
                <p className="text-lg font-semibold text-foreground">{count} 人</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="global">全局</TabsTrigger>
          <TabsTrigger value="organization">组织</TabsTrigger>
          <TabsTrigger value="member">成员</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-0">
          {renderFilterBar()}
          {renderGlobalContent()}
        </TabsContent>

        <TabsContent value="organization" className="mt-0">
          {renderFilterBar()}
          {renderOrganizationContent()}
        </TabsContent>

        <TabsContent value="member" className="mt-0">
          {renderFilterBar()}
          {renderMemberContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
