import React, { useState, useMemo } from 'react';
import { Building2, Users, Zap, TrendingUp, Activity, AlertTriangle, Clock, CalendarIcon, Check, ChevronsUpDown, Cpu, Eye, Copy, X } from 'lucide-react';
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

// 模型性能指标数据（包含错误统计）
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
    successRate: 99.2,
    errorCount: 100,
    errorRate: 0.8
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
    successRate: 99.5,
    errorCount: 76,
    errorRate: 0.5
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
    successRate: 99.8,
    errorCount: 44,
    errorRate: 0.2
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
    successRate: 99.3,
    errorCount: 126,
    errorRate: 0.7
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
    successRate: 98.9,
    errorCount: 50,
    errorRate: 1.1
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
    successRate: 99.6,
    errorCount: 112,
    errorRate: 0.4
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
    successRate: 99.4,
    errorCount: 59,
    errorRate: 0.6
  },
];

// 按模型的错误类型分布数据
const modelErrorByType: Record<string, { code: string; name: string; count: number; percentage: number }[]> = {
  'GPT-4 Turbo': [
    { code: '429', name: '请求频率限制', count: 35, percentage: 35.0 },
    { code: '500', name: '服务器内部错误', count: 23, percentage: 23.0 },
    { code: '503', name: '服务不可用', count: 18, percentage: 18.0 },
    { code: '504', name: '网关超时', count: 12, percentage: 12.0 },
    { code: '400', name: '请求参数错误', count: 8, percentage: 8.0 },
    { code: '401', name: '认证失败', count: 4, percentage: 4.0 },
  ],
  'GPT-4o': [
    { code: '429', name: '请求频率限制', count: 28, percentage: 36.8 },
    { code: '500', name: '服务器内部错误', count: 18, percentage: 23.7 },
    { code: '503', name: '服务不可用', count: 12, percentage: 15.8 },
    { code: '504', name: '网关超时', count: 10, percentage: 13.2 },
    { code: '400', name: '请求参数错误', count: 5, percentage: 6.6 },
    { code: '401', name: '认证失败', count: 3, percentage: 3.9 },
  ],
  'GPT-4o Mini': [
    { code: '429', name: '请求频率限制', count: 15, percentage: 34.1 },
    { code: '500', name: '服务器内部错误', count: 10, percentage: 22.7 },
    { code: '503', name: '服务不可用', count: 8, percentage: 18.2 },
    { code: '504', name: '网关超时', count: 5, percentage: 11.4 },
    { code: '400', name: '请求参数错误', count: 4, percentage: 9.1 },
    { code: '401', name: '认证失败', count: 2, percentage: 4.5 },
  ],
  'Claude 3.5 Sonnet': [
    { code: '429', name: '请求频率限制', count: 42, percentage: 33.3 },
    { code: '500', name: '服务器内部错误', count: 32, percentage: 25.4 },
    { code: '503', name: '服务不可用', count: 25, percentage: 19.8 },
    { code: '504', name: '网关超时', count: 15, percentage: 11.9 },
    { code: '400', name: '请求参数错误', count: 8, percentage: 6.3 },
    { code: '401', name: '认证失败', count: 4, percentage: 3.2 },
  ],
  'Claude 3 Opus': [
    { code: '429', name: '请求频率限制', count: 18, percentage: 36.0 },
    { code: '500', name: '服务器内部错误', count: 12, percentage: 24.0 },
    { code: '503', name: '服务不可用', count: 8, percentage: 16.0 },
    { code: '504', name: '网关超时', count: 6, percentage: 12.0 },
    { code: '400', name: '请求参数错误', count: 4, percentage: 8.0 },
    { code: '401', name: '认证失败', count: 2, percentage: 4.0 },
  ],
  'DeepSeek V3': [
    { code: '429', name: '请求频率限制', count: 45, percentage: 40.2 },
    { code: '500', name: '服务器内部错误', count: 25, percentage: 22.3 },
    { code: '503', name: '服务不可用', count: 20, percentage: 17.9 },
    { code: '504', name: '网关超时', count: 12, percentage: 10.7 },
    { code: '400', name: '请求参数错误', count: 6, percentage: 5.4 },
    { code: '401', name: '认证失败', count: 4, percentage: 3.6 },
  ],
  'Kimi K2': [
    { code: '429', name: '请求频率限制', count: 22, percentage: 37.3 },
    { code: '500', name: '服务器内部错误', count: 14, percentage: 23.7 },
    { code: '503', name: '服务不可用', count: 10, percentage: 16.9 },
    { code: '504', name: '网关超时', count: 7, percentage: 11.9 },
    { code: '400', name: '请求参数错误', count: 4, percentage: 6.8 },
    { code: '401', name: '认证失败', count: 2, percentage: 3.4 },
  ],
};

// 按模型的错误明细数据
const modelErrorDetails = [
  { model: 'GPT-4 Turbo', customer: '科技创新有限公司', errorCode: '429', errorCount: 12, timestamp: '2025-01-22 10:32:15' },
  { model: 'GPT-4 Turbo', customer: '科技创新有限公司', errorCode: '500', errorCount: 8, timestamp: '2025-01-22 09:45:22' },
  { model: 'GPT-4 Turbo', customer: '医疗健康科技', errorCode: '429', errorCount: 18, timestamp: '2025-01-22 11:15:08' },
  { model: 'GPT-4 Turbo', customer: '医疗健康科技', errorCode: '500', errorCount: 15, timestamp: '2025-01-22 14:22:33' },
  { model: 'GPT-4 Turbo', customer: '金融数据服务公司', errorCode: '429', errorCount: 5, timestamp: '2025-01-22 08:55:41' },
  { model: 'GPT-4o', customer: '金融数据服务公司', errorCode: '500', errorCount: 10, timestamp: '2025-01-22 13:12:55' },
  { model: 'GPT-4o', customer: '金融数据服务公司', errorCode: '503', errorCount: 5, timestamp: '2025-01-22 15:33:18' },
  { model: 'GPT-4o', customer: '智能制造有限公司', errorCode: '504', errorCount: 1, timestamp: '2025-01-22 16:45:02' },
  { model: 'GPT-4o Mini', customer: '医疗健康科技', errorCode: '401', errorCount: 4, timestamp: '2025-01-22 09:22:11' },
  { model: 'GPT-4o Mini', customer: '医疗健康科技', errorCode: '429', errorCount: 3, timestamp: '2025-01-22 10:15:44' },
  { model: 'GPT-4o Mini', customer: '教育科技集团', errorCode: '400', errorCount: 2, timestamp: '2025-01-22 11:55:33' },
  { model: 'GPT-4o Mini', customer: '教育科技集团', errorCode: '500', errorCount: 1, timestamp: '2025-01-22 14:08:27' },
  { model: 'Claude 3.5 Sonnet', customer: '科技创新有限公司', errorCode: '429', errorCount: 5, timestamp: '2025-01-22 08:32:18' },
  { model: 'Claude 3.5 Sonnet', customer: '科技创新有限公司', errorCode: '504', errorCount: 3, timestamp: '2025-01-22 12:45:55' },
  { model: 'Claude 3.5 Sonnet', customer: '医疗健康科技', errorCode: '503', errorCount: 12, timestamp: '2025-01-22 15:22:08' },
  { model: 'Claude 3.5 Sonnet', customer: '医疗健康科技', errorCode: '400', errorCount: 6, timestamp: '2025-01-22 16:33:41' },
  { model: 'DeepSeek V3', customer: '科技创新有限公司', errorCode: '429', errorCount: 25, timestamp: '2025-01-22 09:15:22' },
  { model: 'DeepSeek V3', customer: '金融数据服务公司', errorCode: '503', errorCount: 15, timestamp: '2025-01-22 11:45:33' },
  { model: 'Kimi K2', customer: '教育科技集团', errorCode: '429', errorCount: 12, timestamp: '2025-01-22 10:22:55' },
  { model: 'Kimi K2', customer: '智能制造有限公司', errorCode: '500', errorCount: 8, timestamp: '2025-01-22 13:55:18' },
];

// 按模型的错误趋势数据（每小时）
const generateModelErrorTrendData = (model: string) => {
  return Array.from({ length: 24 }, (_, i) => {
    const baseErrors = model === 'all' ? 15 : 5;
    const isBusinessHour = i >= 9 && i <= 21;
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      '429': Math.floor(Math.random() * (isBusinessHour ? 8 : 3)) + (isBusinessHour ? 3 : 1),
      '500': Math.floor(Math.random() * (isBusinessHour ? 5 : 2)) + (isBusinessHour ? 2 : 0),
      '503': Math.floor(Math.random() * (isBusinessHour ? 4 : 1)) + (isBusinessHour ? 1 : 0),
      '504': Math.floor(Math.random() * 3),
      '400': Math.floor(Math.random() * 2),
      '401': Math.floor(Math.random() * 1),
      total: Math.floor(Math.random() * baseErrors) + (isBusinessHour ? baseErrors : baseErrors / 2),
    };
  });
};

// 扩展的错误明细数据（包含更多详情）
const modelErrorDetailsExtended = [
  { 
    id: 'err-001',
    model: 'GPT-4 Turbo', 
    customer: '科技创新有限公司', 
    errorCode: '429', 
    errorCount: 12, 
    timestamp: '2025-01-22 10:32:15',
    requestId: 'req-abc123456',
    endpoint: '/v1/chat/completions',
    inputTokens: 2500,
    errorMessage: 'Rate limit exceeded: Too many requests per minute',
    retryAfter: '60s',
    userAgent: 'KSGC-CLI/2.3.1'
  },
  { 
    id: 'err-002',
    model: 'GPT-4 Turbo', 
    customer: '科技创新有限公司', 
    errorCode: '500', 
    errorCount: 8, 
    timestamp: '2025-01-22 09:45:22',
    requestId: 'req-def789012',
    endpoint: '/v1/chat/completions',
    inputTokens: 1800,
    errorMessage: 'Internal server error: Model inference failed',
    retryAfter: '-',
    userAgent: 'KSGC-CLI/2.3.1'
  },
  { 
    id: 'err-003',
    model: 'GPT-4 Turbo', 
    customer: '医疗健康科技', 
    errorCode: '429', 
    errorCount: 18, 
    timestamp: '2025-01-22 11:15:08',
    requestId: 'req-ghi345678',
    endpoint: '/v1/chat/completions',
    inputTokens: 3200,
    errorMessage: 'Rate limit exceeded: Token quota exhausted',
    retryAfter: '120s',
    userAgent: 'KSGC-CLI/2.3.0'
  },
  { 
    id: 'err-004',
    model: 'GPT-4o', 
    customer: '金融数据服务公司', 
    errorCode: '500', 
    errorCount: 10, 
    timestamp: '2025-01-22 13:12:55',
    requestId: 'req-jkl901234',
    endpoint: '/v1/chat/completions',
    inputTokens: 4500,
    errorMessage: 'Internal server error: Context length exceeded',
    retryAfter: '-',
    userAgent: 'KSGC-CLI/2.2.8'
  },
  { 
    id: 'err-005',
    model: 'GPT-4o', 
    customer: '金融数据服务公司', 
    errorCode: '503', 
    errorCount: 5, 
    timestamp: '2025-01-22 15:33:18',
    requestId: 'req-mno567890',
    endpoint: '/v1/chat/completions',
    inputTokens: 2100,
    errorMessage: 'Service temporarily unavailable: High load',
    retryAfter: '30s',
    userAgent: 'KSGC-CLI/2.2.8'
  },
  { 
    id: 'err-006',
    model: 'GPT-4o Mini', 
    customer: '医疗健康科技', 
    errorCode: '401', 
    errorCount: 4, 
    timestamp: '2025-01-22 09:22:11',
    requestId: 'req-pqr123456',
    endpoint: '/v1/chat/completions',
    inputTokens: 0,
    errorMessage: 'Authentication failed: Invalid API key',
    retryAfter: '-',
    userAgent: 'KSGC-CLI/2.1.0'
  },
  { 
    id: 'err-007',
    model: 'Claude 3.5 Sonnet', 
    customer: '医疗健康科技', 
    errorCode: '503', 
    errorCount: 12, 
    timestamp: '2025-01-22 15:22:08',
    requestId: 'req-stu789012',
    endpoint: '/v1/messages',
    inputTokens: 5600,
    errorMessage: 'Service temporarily unavailable: Model overloaded',
    retryAfter: '45s',
    userAgent: 'KSGC-CLI/2.3.1'
  },
  { 
    id: 'err-008',
    model: 'DeepSeek V3', 
    customer: '科技创新有限公司', 
    errorCode: '429', 
    errorCount: 25, 
    timestamp: '2025-01-22 09:15:22',
    requestId: 'req-vwx345678',
    endpoint: '/v1/chat/completions',
    inputTokens: 8900,
    errorMessage: 'Rate limit exceeded: Concurrent request limit reached',
    retryAfter: '90s',
    userAgent: 'KSGC-CLI/2.3.1'
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
  const { toast } = useToast();
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
  
  // Error detail dialog state
  const [selectedError, setSelectedError] = useState<typeof modelErrorDetailsExtended[0] | null>(null);
  const [errorDetailDialogOpen, setErrorDetailDialogOpen] = useState(false);

  const handleViewErrorDetail = (error: typeof modelErrorDetailsExtended[0]) => {
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

  // 模型性能汇总统计（包含错误数据）
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
      totalErrors: data.reduce((sum, m) => sum + m.errorCount, 0),
      avgErrorRate: data.length > 0 
        ? (data.reduce((sum, m) => sum + m.errorRate, 0) / data.length).toFixed(2)
        : '0',
    };
  }, [filteredModelPerformanceData]);

  // 过滤后的模型错误类型统计
  const filteredModelErrorByType = useMemo(() => {
    if (modelTabFilter === 'all') {
      // 合并所有模型的错误统计
      const allErrors: Record<string, { code: string; name: string; count: number }> = {};
      Object.values(modelErrorByType).forEach(errors => {
        errors.forEach(err => {
          if (allErrors[err.code]) {
            allErrors[err.code].count += err.count;
          } else {
            allErrors[err.code] = { code: err.code, name: err.name, count: err.count };
          }
        });
      });
      const totalCount = Object.values(allErrors).reduce((sum, e) => sum + e.count, 0);
      return Object.values(allErrors).map(e => ({
        ...e,
        percentage: totalCount > 0 ? parseFloat(((e.count / totalCount) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.count - a.count);
    }
    return modelErrorByType[modelTabFilter] || [];
  }, [modelTabFilter]);

  // 过滤后的模型错误明细（使用扩展数据）
  const filteredModelErrorDetailsExtended = useMemo(() => {
    if (modelTabFilter === 'all') {
      return modelErrorDetailsExtended;
    }
    return modelErrorDetailsExtended.filter(e => e.model === modelTabFilter);
  }, [modelTabFilter]);

  // 错误趋势数据
  const modelErrorTrendData = useMemo(() => {
    return generateModelErrorTrendData(modelTabFilter);
  }, [modelTabFilter]);

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatTokens(modelPerformanceStats.peakTPM)} <span className="text-sm font-normal text-muted-foreground">tokens/分钟</span></p>
              <p className="text-xs text-muted-foreground">峰值每分钟Token数</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{modelPerformanceStats.avgTTFT} <span className="text-sm font-normal text-muted-foreground">秒</span></p>
              <p className="text-xs text-muted-foreground">平均首Token时延</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{modelPerformanceStats.avgTPOT} <span className="text-sm font-normal text-muted-foreground">tokens/秒</span></p>
              <p className="text-xs text-muted-foreground">平均Token生成速度</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatTokens(modelPerformanceStats.totalTokens)} <span className="text-sm font-normal text-muted-foreground">tokens</span></p>
              <p className="text-xs text-muted-foreground">Token 消耗</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{modelPerformanceStats.totalRequests.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">次</span></p>
              <p className="text-xs text-muted-foreground">请求总数</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{modelPerformanceStats.avgSuccessRate}<span className="text-sm font-normal">%</span></p>
              <p className="text-xs text-muted-foreground">成功率</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{modelPerformanceStats.totalErrors} <span className="text-sm font-normal text-muted-foreground">次</span></p>
              <p className="text-xs text-muted-foreground">错误总数</p>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{modelPerformanceStats.avgErrorRate}<span className="text-sm font-normal">%</span></p>
              <p className="text-xs text-muted-foreground">平均错误率</p>
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
                  <TableHead className="text-right">峰值每分钟Token数</TableHead>
                  <TableHead className="text-right">日均每分钟Token数</TableHead>
                  <TableHead className="text-right">工作时段每分钟Token数</TableHead>
                  <TableHead className="text-right">首Token平均时延 (秒)</TableHead>
                  <TableHead className="text-right">首Token P98时延 (秒)</TableHead>
                  <TableHead className="text-right">Token生成速度 (tokens/秒)</TableHead>
                  <TableHead className="text-right">Token消耗</TableHead>
                  <TableHead className="text-right">请求数 (次)</TableHead>
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
                    <TableCell className="text-right">{item.ttftAvg.toFixed(2)} 秒</TableCell>
                    <TableCell className="text-right">{item.ttftP98.toFixed(2)} 秒</TableCell>
                    <TableCell className="text-right">{item.tpotAvg.toFixed(1)} t/s</TableCell>
                    <TableCell className="text-right">{formatTokens(item.tokens)}</TableCell>
                    <TableCell className="text-right">{item.requests.toLocaleString()} 次</TableCell>
                    <TableCell className="text-right text-success font-medium">{item.successRate}%</TableCell>
                  </TableRow>
                ))}
                {/* 总计行 */}
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell>总计/平均</TableCell>
                  <TableCell className="text-right">{formatTokens(modelPerformanceStats.peakTPM)}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">{modelPerformanceStats.avgTTFT} 秒</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">{modelPerformanceStats.avgTPOT} t/s</TableCell>
                  <TableCell className="text-right">{formatTokens(modelPerformanceStats.totalTokens)}</TableCell>
                  <TableCell className="text-right">{modelPerformanceStats.totalRequests.toLocaleString()} 次</TableCell>
                  <TableCell className="text-right text-success">{modelPerformanceStats.avgSuccessRate}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 首Token时延和Token生成速度趋势图 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              首Token时延趋势 (每小时)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={generateHourlyPerformanceData(modelTabFilter === 'all' ? 'GPT-4 Turbo' : modelTabFilter)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="秒" />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} 秒`} />
                  <Bar 
                    dataKey="ttft" 
                    fill="hsl(213, 94%, 50%)"
                    opacity={0.6}
                    name="平均首Token时延"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ttftP98" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    dot={false}
                    name="P98首Token时延"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(213, 94%, 50%)', opacity: 0.6 }} />
                <span>平均首Token时延</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
                <span>P98首Token时延</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Token生成速度趋势 (每小时)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateHourlyPerformanceData(modelTabFilter === 'all' ? 'GPT-4 Turbo' : modelTabFilter)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} unit=" tokens/秒" />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)} tokens/秒`} />
                  <Line 
                    type="monotone" 
                    dataKey="tpot" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    name="Token生成速度"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 每分钟Token数趋势图 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            每分钟Token数趋势 (每小时)
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
                  name="每分钟Token数"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            注：工作时段 (09:30-21:30) 每分钟Token数通常显著高于非工作时段
          </p>
        </CardContent>
      </Card>

      {/* 模型错误统计区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 按错误代码统计 */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              按错误代码统计 {modelTabFilter !== 'all' && `- ${modelTabFilter}`}
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
                {filteredModelErrorByType.map((item) => (
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
                {/* 总计行 */}
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell colSpan={2}>总计</TableCell>
                  <TableCell className="text-right">{filteredModelErrorByType.reduce((sum, e) => sum + e.count, 0)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 按模型错误分布（仅全部模型时显示） */}
        {modelTabFilter === 'all' && (
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                按模型错误分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模型</TableHead>
                    <TableHead className="text-right">错误数</TableHead>
                    <TableHead className="text-right">错误率</TableHead>
                    <TableHead className="text-right">主要错误类型</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelPerformanceData.map((item) => {
                    const topError = modelErrorByType[item.model]?.[0];
                    return (
                      <TableRow key={item.model}>
                        <TableCell className="font-medium">{item.model}</TableCell>
                        <TableCell className="text-right text-destructive font-medium">{item.errorCount}</TableCell>
                        <TableCell className="text-right">{item.errorRate}%</TableCell>
                        <TableCell className="text-right">
                          {topError && (
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-mono font-medium",
                              topError.code === '429' && "bg-yellow-500/10 text-yellow-600",
                              topError.code === '500' && "bg-destructive/10 text-destructive",
                            )}>
                              {topError.code}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 错误趋势图 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            错误趋势 (每小时) {modelTabFilter !== 'all' && `- ${modelTabFilter}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={modelErrorTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="429" stackId="errors" fill={ERROR_COLORS['429']} name="429 请求频率限制" />
                <Bar dataKey="500" stackId="errors" fill={ERROR_COLORS['500']} name="500 服务器错误" />
                <Bar dataKey="503" stackId="errors" fill={ERROR_COLORS['503']} name="503 服务不可用" />
                <Bar dataKey="504" stackId="errors" fill={ERROR_COLORS['504']} name="504 网关超时" />
                <Bar dataKey="400" stackId="errors" fill={ERROR_COLORS['400']} name="400 请求参数错误" />
                <Bar dataKey="401" stackId="errors" fill={ERROR_COLORS['401']} name="401 认证失败" />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--foreground))" 
                  strokeWidth={2}
                  dot={false}
                  name="总错误数"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS['429'] }} />
              <span>429</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS['500'] }} />
              <span>500</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS['503'] }} />
              <span>503</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS['504'] }} />
              <span>504</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS['400'] }} />
              <span>400</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ERROR_COLORS['401'] }} />
              <span>401</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模型错误明细表格 */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            错误明细 {modelTabFilter !== 'all' && `- ${modelTabFilter}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {modelTabFilter === 'all' && <TableHead>模型</TableHead>}
                <TableHead>客户</TableHead>
                <TableHead>错误代码</TableHead>
                <TableHead className="text-right">错误数 (次)</TableHead>
                <TableHead className="text-right">最近发生时间</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModelErrorDetailsExtended.map((item) => (
                <TableRow key={item.id}>
                  {modelTabFilter === 'all' && <TableCell className="font-medium">{item.model}</TableCell>}
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
                  <TableCell className="text-right text-destructive font-medium">{item.errorCount} 次</TableCell>
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
              {/* 总计行 */}
              <TableRow className="bg-muted/30 font-medium">
                {modelTabFilter === 'all' && <TableCell>-</TableCell>}
                <TableCell>总计</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right text-destructive">{filteredModelErrorDetailsExtended.reduce((sum, e) => sum + e.errorCount, 0)} 次</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 错误详情弹窗 */}
      <Dialog open={errorDetailDialogOpen} onOpenChange={setErrorDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              错误详情
            </DialogTitle>
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
