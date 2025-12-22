import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Clock,
  Calendar,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Multi-select dropdown component (for trend metrics)
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

// Mock department usage data - all departments with 3 levels
const mockDepartmentUsage = [
  { id: 'dept-1', name: '技术中心', tokens: 1200000, requests: 5800, totalMembers: 20, activeUsers: 15, percentage: 46, level: 1, parentId: null },
  { id: 'dept-1-1', name: '前端开发组', tokens: 480000, requests: 2200, totalMembers: 8, activeUsers: 6, percentage: 18, level: 2, parentId: 'dept-1' },
  { id: 'dept-1-2', name: '后端开发组', tokens: 520000, requests: 2500, totalMembers: 7, activeUsers: 5, percentage: 20, level: 2, parentId: 'dept-1' },
  { id: 'dept-1-2-1', name: 'Java 小组', tokens: 280000, requests: 1300, totalMembers: 4, activeUsers: 3, percentage: 11, level: 3, parentId: 'dept-1-2' },
  { id: 'dept-1-2-2', name: 'Go 小组', tokens: 240000, requests: 1200, totalMembers: 3, activeUsers: 2, percentage: 9, level: 3, parentId: 'dept-1-2' },
  { id: 'dept-1-3', name: 'DevOps 组', tokens: 200000, requests: 1100, totalMembers: 5, activeUsers: 4, percentage: 8, level: 2, parentId: 'dept-1' },
  { id: 'dept-2', name: '产品设计部', tokens: 780000, requests: 3200, totalMembers: 10, activeUsers: 8, percentage: 30, level: 1, parentId: null },
  { id: 'dept-2-1', name: 'UI/UX 设计组', tokens: 420000, requests: 1800, totalMembers: 5, activeUsers: 4, percentage: 16, level: 2, parentId: 'dept-2' },
  { id: 'dept-2-2', name: '产品经理组', tokens: 360000, requests: 1400, totalMembers: 5, activeUsers: 4, percentage: 14, level: 2, parentId: 'dept-2' },
  { id: 'dept-3', name: '市场运营部', tokens: 380000, requests: 1800, totalMembers: 8, activeUsers: 6, percentage: 15, level: 1, parentId: null },
  { id: 'dept-3-1', name: '内容运营组', tokens: 200000, requests: 900, totalMembers: 4, activeUsers: 3, percentage: 8, level: 2, parentId: 'dept-3' },
  { id: 'dept-3-2', name: '推广运营组', tokens: 180000, requests: 900, totalMembers: 4, activeUsers: 3, percentage: 7, level: 2, parentId: 'dept-3' },
  { id: 'dept-4', name: '行政人事部', tokens: 120000, requests: 600, totalMembers: 6, activeUsers: 4, percentage: 5, level: 1, parentId: null },
  { id: 'dept-5', name: '财务部', tokens: 100000, requests: 500, totalMembers: 4, activeUsers: 3, percentage: 4, level: 1, parentId: null },
];

// Mock member usage data with detailed info - linked to department IDs
const mockMemberUsage = [
  // 技术中心 - 前端开发组 (6人)
  { 
    id: 'm1', 
    name: '李明', 
    email: 'liming@tech.com',
    department: '技术中心/前端开发组',
    departmentId: 'dept-1-1',
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
    id: 'm2', 
    name: '陈晨', 
    email: 'chenchen@tech.com',
    department: '技术中心/前端开发组',
    departmentId: 'dept-1-1',
    tokens: 76000, 
    requests: 680, 
    avgLatency: 1.5,
    activeDays: 20,
    totalDays: 30,
    mostUsedTerminal: 'VS Code Extension',
    lastActive: '2024-03-23 10:20',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 65 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 25 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  { 
    id: 'm3', 
    name: '林小雨', 
    email: 'linxiaoyu@tech.com',
    department: '技术中心/前端开发组',
    departmentId: 'dept-1-1',
    tokens: 65000, 
    requests: 520, 
    avgLatency: 1.7,
    activeDays: 18,
    totalDays: 30,
    mostUsedTerminal: 'VS Code Extension',
    lastActive: '2024-03-22 14:15',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 70 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 20 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 10 },
    ]
  },
  { 
    id: 'm4', 
    name: '黄磊', 
    email: 'huanglei@tech.com',
    department: '技术中心/前端开发组',
    departmentId: 'dept-1-1',
    tokens: 82000, 
    requests: 710, 
    avgLatency: 1.6,
    activeDays: 21,
    totalDays: 30,
    mostUsedTerminal: 'WebStorm Plugin',
    lastActive: '2024-03-23 09:00',
    modelPreference: [
      { model: 'Qwen3-Coder (重构/注释)', percentage: 55 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 35 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  { 
    id: 'm5', 
    name: '刘洋', 
    email: 'liuyang@tech.com',
    department: '技术中心/前端开发组',
    departmentId: 'dept-1-1',
    tokens: 71000, 
    requests: 590, 
    avgLatency: 1.8,
    activeDays: 19,
    totalDays: 30,
    mostUsedTerminal: 'VS Code Extension',
    lastActive: '2024-03-21 17:30',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 60 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 30 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 10 },
    ]
  },
  { 
    id: 'm6', 
    name: '郑欣', 
    email: 'zhengxin@tech.com',
    department: '技术中心/前端开发组',
    departmentId: 'dept-1-1',
    tokens: 58000, 
    requests: 480, 
    avgLatency: 1.5,
    activeDays: 16,
    totalDays: 30,
    mostUsedTerminal: 'VS Code Extension',
    lastActive: '2024-03-20 15:45',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 75 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 20 },
      { model: 'GLM-4 (代码审查)', percentage: 5 },
    ]
  },
  // 技术中心 - 后端开发组/Java 小组 (3人)
  { 
    id: 'm7', 
    name: '张伟', 
    email: 'zhangwei@tech.com',
    department: '技术中心/后端开发组/Java 小组',
    departmentId: 'dept-1-2-1',
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
    id: 'm8', 
    name: '王建国', 
    email: 'wangjianguo@tech.com',
    department: '技术中心/后端开发组/Java 小组',
    departmentId: 'dept-1-2-1',
    tokens: 112000, 
    requests: 920, 
    avgLatency: 1.7,
    activeDays: 20,
    totalDays: 30,
    mostUsedTerminal: 'IntelliJ IDEA',
    lastActive: '2024-03-23 11:00',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 70 },
      { model: 'GLM-4 (代码审查)', percentage: 20 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
  { 
    id: 'm9', 
    name: '杨帆', 
    email: 'yangfan@tech.com',
    department: '技术中心/后端开发组/Java 小组',
    departmentId: 'dept-1-2-1',
    tokens: 95000, 
    requests: 780, 
    avgLatency: 1.9,
    activeDays: 17,
    totalDays: 30,
    mostUsedTerminal: 'IntelliJ IDEA',
    lastActive: '2024-03-22 16:20',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 65 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 25 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  // 技术中心 - 后端开发组/Go 小组 (2人)
  { 
    id: 'm10', 
    name: '赵强', 
    email: 'zhaoqiang@tech.com',
    department: '技术中心/后端开发组/Go 小组',
    departmentId: 'dept-1-2-2',
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
    id: 'm11', 
    name: '吴涛', 
    email: 'wutao@tech.com',
    department: '技术中心/后端开发组/Go 小组',
    departmentId: 'dept-1-2-2',
    tokens: 108000, 
    requests: 860, 
    avgLatency: 1.6,
    activeDays: 19,
    totalDays: 30,
    mostUsedTerminal: 'GoLand',
    lastActive: '2024-03-23 10:30',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 60 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 30 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  // 技术中心 - DevOps 组 (4人)
  { 
    id: 'm12', 
    name: '周杰', 
    email: 'zhoujie@tech.com',
    department: '技术中心/DevOps 组',
    departmentId: 'dept-1-3',
    tokens: 88000, 
    requests: 720, 
    avgLatency: 1.5,
    activeDays: 19,
    totalDays: 30,
    mostUsedTerminal: 'Terminal',
    lastActive: '2024-03-23 08:30',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 60 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 30 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  { 
    id: 'm13', 
    name: '孙鹏', 
    email: 'sunpeng@tech.com',
    department: '技术中心/DevOps 组',
    departmentId: 'dept-1-3',
    tokens: 72000, 
    requests: 580, 
    avgLatency: 1.4,
    activeDays: 18,
    totalDays: 30,
    mostUsedTerminal: 'Terminal',
    lastActive: '2024-03-22 17:00',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 55 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 35 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  { 
    id: 'm14', 
    name: '马超', 
    email: 'machao@tech.com',
    department: '技术中心/DevOps 组',
    departmentId: 'dept-1-3',
    tokens: 65000, 
    requests: 520, 
    avgLatency: 1.6,
    activeDays: 16,
    totalDays: 30,
    mostUsedTerminal: 'Terminal',
    lastActive: '2024-03-21 14:30',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 50 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 40 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  { 
    id: 'm15', 
    name: '胡文', 
    email: 'huwen@tech.com',
    department: '技术中心/DevOps 组',
    departmentId: 'dept-1-3',
    tokens: 58000, 
    requests: 460, 
    avgLatency: 1.5,
    activeDays: 15,
    totalDays: 30,
    mostUsedTerminal: 'Terminal',
    lastActive: '2024-03-20 16:15',
    modelPreference: [
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 65 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 25 },
      { model: 'GLM-4 (代码审查)', percentage: 10 },
    ]
  },
  // 产品设计部 - UI/UX 设计组 (4人)
  { 
    id: 'm16', 
    name: '王芳', 
    email: 'wangfang@tech.com',
    department: '产品设计部/UI/UX 设计组',
    departmentId: 'dept-2-1',
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
    id: 'm17', 
    name: '李婷', 
    email: 'liting@tech.com',
    department: '产品设计部/UI/UX 设计组',
    departmentId: 'dept-2-1',
    tokens: 68000, 
    requests: 540, 
    avgLatency: 2.0,
    activeDays: 14,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-22 11:30',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 50 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 30 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 20 },
    ]
  },
  { 
    id: 'm18', 
    name: '张雪', 
    email: 'zhangxue@tech.com',
    department: '产品设计部/UI/UX 设计组',
    departmentId: 'dept-2-1',
    tokens: 62000, 
    requests: 490, 
    avgLatency: 1.9,
    activeDays: 13,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-20 16:00',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 55 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 25 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 20 },
    ]
  },
  { 
    id: 'm19', 
    name: '陈艺', 
    email: 'chenyi@tech.com',
    department: '产品设计部/UI/UX 设计组',
    departmentId: 'dept-2-1',
    tokens: 55000, 
    requests: 420, 
    avgLatency: 2.2,
    activeDays: 12,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-19 15:30',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 60 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 25 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 15 },
    ]
  },
  // 产品设计部 - 产品经理组 (4人)
  { 
    id: 'm20', 
    name: '孙浩', 
    email: 'sunhao@tech.com',
    department: '产品设计部/产品经理组',
    departmentId: 'dept-2-2',
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
  { 
    id: 'm21', 
    name: '刘璐', 
    email: 'liulu@tech.com',
    department: '产品设计部/产品经理组',
    departmentId: 'dept-2-2',
    tokens: 48000, 
    requests: 380, 
    avgLatency: 1.9,
    activeDays: 13,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-21 14:00',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 55 },
      { model: 'GLM-4 (代码审查)', percentage: 25 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 20 },
    ]
  },
  { 
    id: 'm22', 
    name: '王磊', 
    email: 'wanglei@tech.com',
    department: '产品设计部/产品经理组',
    departmentId: 'dept-2-2',
    tokens: 45000, 
    requests: 350, 
    avgLatency: 2.1,
    activeDays: 12,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-20 11:30',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 60 },
      { model: 'GLM-4 (代码审查)', percentage: 25 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 15 },
    ]
  },
  { 
    id: 'm23', 
    name: '赵敏', 
    email: 'zhaomin@tech.com',
    department: '产品设计部/产品经理组',
    departmentId: 'dept-2-2',
    tokens: 42000, 
    requests: 320, 
    avgLatency: 2.0,
    activeDays: 11,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-19 16:45',
    modelPreference: [
      { model: 'Kimi-K2 (长文档解析)', percentage: 65 },
      { model: 'GLM-4 (代码审查)', percentage: 20 },
      { model: 'DeepSeek-V3.2 (代码补全)', percentage: 15 },
    ]
  },
  // 市场运营部 - 内容运营组 (3人)
  { 
    id: 'm24', 
    name: '钱丽', 
    email: 'qianli@tech.com',
    department: '市场运营部/内容运营组',
    departmentId: 'dept-3-1',
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
    id: 'm25', 
    name: '周媛', 
    email: 'zhouyuan@tech.com',
    department: '市场运营部/内容运营组',
    departmentId: 'dept-3-1',
    tokens: 38000, 
    requests: 320, 
    avgLatency: 1.8,
    activeDays: 11,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-19 14:20',
    modelPreference: [
      { model: '文心一言 (营销文案)', percentage: 60 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 30 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
  { 
    id: 'm26', 
    name: '陈思', 
    email: 'chensi@tech.com',
    department: '市场运营部/内容运营组',
    departmentId: 'dept-3-1',
    tokens: 35000, 
    requests: 290, 
    avgLatency: 1.6,
    activeDays: 10,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-18 16:00',
    modelPreference: [
      { model: '文心一言 (营销文案)', percentage: 55 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 35 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
  // 市场运营部 - 推广运营组 (3人)
  { 
    id: 'm27', 
    name: '吴敏', 
    email: 'wumin@tech.com',
    department: '市场运营部/推广运营组',
    departmentId: 'dept-3-2',
    tokens: 38000, 
    requests: 310, 
    avgLatency: 1.9,
    activeDays: 10,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-21 15:20',
    modelPreference: [
      { model: '文心一言 (营销文案)', percentage: 55 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 35 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
  { 
    id: 'm28', 
    name: '李强', 
    email: 'liqiang@tech.com',
    department: '市场运营部/推广运营组',
    departmentId: 'dept-3-2',
    tokens: 32000, 
    requests: 260, 
    avgLatency: 1.8,
    activeDays: 9,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-20 11:00',
    modelPreference: [
      { model: '文心一言 (营销文案)', percentage: 60 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 30 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
  { 
    id: 'm29', 
    name: '张琳', 
    email: 'zhanglin@tech.com',
    department: '市场运营部/推广运营组',
    departmentId: 'dept-3-2',
    tokens: 28000, 
    requests: 220, 
    avgLatency: 1.7,
    activeDays: 8,
    totalDays: 30,
    mostUsedTerminal: 'Web 控制台',
    lastActive: '2024-03-19 10:30',
    modelPreference: [
      { model: '文心一言 (营销文案)', percentage: 65 },
      { model: 'Kimi-K2 (长文档解析)', percentage: 25 },
      { model: 'Qwen3-Coder (重构/注释)', percentage: 10 },
    ]
  },
];

// Helper function to get all descendant department IDs
const getAllDescendantDeptIds = (deptId: string): string[] => {
  const descendants: string[] = [];
  const children = mockDepartmentUsage.filter(d => d.parentId === deptId);
  children.forEach(child => {
    descendants.push(child.id);
    descendants.push(...getAllDescendantDeptIds(child.id));
  });
  return descendants;
};

// Helper function to check if a member belongs to a department (including all child departments)
const memberBelongsToDepartment = (member: typeof mockMemberUsage[0], deptId: string): boolean => {
  if (member.departmentId === deptId) return true;
  const descendantIds = getAllDescendantDeptIds(deptId);
  return descendantIds.includes(member.departmentId);
};

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
  
  // Global date range state (shared between tabs)
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('7days');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Trend chart data selection - default all selected
  const [selectedTrendMetrics, setSelectedTrendMetrics] = useState<string[]>(['users', 'tokens', 'requests']);

  // Organization view state
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<typeof mockMemberUsage[0] | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Trend metrics options
  const trendMetricOptions = [
    { id: 'users', name: '活跃用户数' },
    { id: 'tokens', name: 'Token量' },
    { id: 'requests', name: '调用次数' },
  ];

  const showTrendChart = dateRangeType !== 'today' && dateRangeType !== 'yesterday';

  // Generate mock data based on date range
  const filteredStats = useMemo(() => {
    const dayCount = dateRangeType === 'today' || dateRangeType === 'yesterday' ? 1 : 
                     dateRangeType === '7days' ? 7 : 
                     dateRangeType === '30days' ? 30 : 7;

    return {
      userCount: Math.round(mockUsageStats.activeUsers * (dayCount / 7)),
      totalTokens: Math.round(mockUsageStats.totalTokens * (dayCount / 7)),
      totalRequests: Math.round(mockUsageStats.totalRequests * (dayCount / 7)),
      avgLatency: mockUsageStats.avgLatency,
    };
  }, [dateRangeType]);

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

      data.push({
        date: format(date, 'MM/dd'),
        tokens: Math.round(baseTokens),
        requests: Math.round(baseRequests),
        users: Math.round(baseUsers),
      });
    }

    return data;
  }, [dateRangeType]);

  // Get selected department data
  const selectedDept = useMemo(() => {
    if (!selectedDeptId) return null;
    return mockDepartmentUsage.find(d => d.id === selectedDeptId);
  }, [selectedDeptId]);

  // Get members for selected department
  const departmentMembers = useMemo(() => {
    if (!selectedDeptId) return [];
    return mockMemberUsage.filter(m => memberBelongsToDepartment(m, selectedDeptId));
  }, [selectedDeptId]);

  // Check if department has children
  const hasChildren = (deptId: string) => {
    return mockDepartmentUsage.some(d => d.parentId === deptId);
  };

  // Get child departments
  const getChildDepartments = (deptId: string | null) => {
    if (deptId === null) {
      return mockDepartmentUsage.filter(d => d.level === 1);
    }
    return mockDepartmentUsage.filter(d => d.parentId === deptId);
  };

  // Render Global Date Range Picker Bar
  const renderGlobalDatePicker = () => (
    <div className="enterprise-card p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker
          dateRangeType={dateRangeType}
          setDateRangeType={setDateRangeType}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>
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
                  width={75}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K tokens`, 'Token消耗']}
                />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">模型平均耗时</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={mockModelLatency} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}s`}
                  domain={[0, 3]}
                />
                <YAxis 
                  type="category" 
                  dataKey="model" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={75}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}s (${props.payload.requests.toLocaleString()} 次调用)`,
                    '平均耗时'
                  ]}
                />
                <Bar dataKey="avgLatency" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Organization Department Detail View
  const renderDepartmentDetail = () => {
    if (!selectedDept) return null;

    const childDepts = getChildDepartments(selectedDeptId);
    const filteredMembers = memberSearchQuery.trim()
      ? departmentMembers.filter(m => 
          m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
          m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
        )
      : departmentMembers;

    return (
      <div className="space-y-6">
        {/* Back Button and Header */}
        <div className="enterprise-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => {
                  setSelectedDeptId(null);
                  setSelectedMemberDetail(null);
                  setMemberSearchQuery('');
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{selectedDept.name}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Department Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Token 消耗', 
              value: selectedDept.tokens >= 1000000 
                ? `${(selectedDept.tokens / 1000000).toFixed(2)}M`
                : `${(selectedDept.tokens / 1000).toFixed(0)}K`,
              icon: Zap,
            },
            { 
              label: '请求数', 
              value: selectedDept.requests.toLocaleString(),
              icon: TrendingUp,
            },
            { 
              label: '成员总数', 
              value: selectedDept.totalMembers.toString(),
              icon: Users,
            },
            { 
              label: '活跃用户', 
              value: selectedDept.activeUsers.toString(),
              icon: User,
            },
          ].map((stat, index) => (
            <div key={index} className="enterprise-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Child Departments (if any) */}
        {childDepts.length > 0 && (
          <div className="enterprise-card p-5">
            <h3 className="font-semibold text-foreground mb-4">下级组织</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">组织名称</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Token消耗</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">请求数</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">成员总数</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">活跃用户数</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {childDepts.map((dept) => (
                    <tr key={dept.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{dept.name}</td>
                      <td className="px-4 py-3 text-right text-foreground">{(dept.tokens / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3 text-right text-foreground">{dept.requests.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-foreground">{dept.totalMembers}</td>
                      <td className="px-4 py-3 text-right text-foreground">{dept.activeUsers}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs gap-1"
                            onClick={() => setSelectedDeptId(dept.id)}
                          >
                            <ChevronRight className="w-3 h-3" />
                            查看详情
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Member Detail View */}
        {selectedMemberDetail ? (
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
                onClick={() => setSelectedMemberDetail(null)}
              >
                <ArrowLeft className="w-4 h-4" />
                返回成员列表
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
        ) : (
          /* Member List */
          <div className="enterprise-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">成员用量</h3>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索成员..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            {filteredMembers.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">排名</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">姓名</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">部门</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Token消耗</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">请求数</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">平均耗时</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">活跃天数</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers
                      .sort((a, b) => b.tokens - a.tokens)
                      .map((member, index) => (
                      <tr key={member.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{member.name[0]}</span>
                            </div>
                            <span className="font-medium text-foreground">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{member.department}</td>
                        <td className="px-4 py-3 text-right text-foreground">{(member.tokens / 1000).toFixed(1)}K</td>
                        <td className="px-4 py-3 text-right text-foreground">{member.requests.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-foreground">{member.avgLatency}s</td>
                        <td className="px-4 py-3 text-right text-foreground">{member.activeDays}/{member.totalDays}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs gap-1"
                              onClick={() => setSelectedMemberDetail(member)}
                            >
                              <User className="w-3 h-3" />
                              详情
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
                {memberSearchQuery.trim() ? '未找到匹配的成员' : '该部门暂无成员数据'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Organization List View
  const renderOrganizationList = () => {
    const departments = getChildDepartments(null);

    return (
      <div className="enterprise-card p-5">
        <h3 className="font-semibold text-foreground mb-4">组织用量概览</h3>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">排名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">组织名称</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Token消耗</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">请求数</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">成员总数</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">活跃用户数</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">占比</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
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
                  <td className="px-4 py-3 text-right text-foreground">{dept.totalMembers}</td>
                  <td className="px-4 py-3 text-right text-foreground">{dept.activeUsers}</td>
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
                    <div className="flex items-center justify-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs gap-1"
                        onClick={() => setSelectedDeptId(dept.id)}
                      >
                        <ChevronRight className="w-3 h-3" />
                        查看详情
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Organization Tab Content
  const renderOrganizationContent = () => {
    if (selectedDeptId) {
      return renderDepartmentDetail();
    }
    return renderOrganizationList();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Global Date Range Picker */}
      {renderGlobalDatePicker()}

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Reset organization view state when switching tabs
        if (value !== 'organization') {
          setSelectedDeptId(null);
          setSelectedMemberDetail(null);
          setMemberSearchQuery('');
        }
      }} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="global">全局</TabsTrigger>
          <TabsTrigger value="organization">组织</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-0">
          {renderGlobalContent()}
        </TabsContent>

        <TabsContent value="organization" className="mt-0">
          {renderOrganizationContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
