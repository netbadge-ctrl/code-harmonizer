import React from 'react';
import { Building2, Users, Zap, TrendingUp, Activity, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCustomers } from '@/data/adminMockData';
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
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

export function AdminAnalytics() {
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
    { name: '企业版', value: mockCustomers.filter(c => c.subscription.plan === 'enterprise').length },
    { name: '专业版', value: mockCustomers.filter(c => c.subscription.plan === 'professional').length },
    { name: '基础版', value: mockCustomers.filter(c => c.subscription.plan === 'starter').length },
    { name: '试用版', value: mockCustomers.filter(c => c.subscription.plan === 'trial').length },
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

  return (
    <div className="space-y-6">
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
                  本月 Token ({formatTokens(stats.totalTokens)} 累计)
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
                  本月请求 ({stats.totalRequests.toLocaleString()} 累计)
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
}
