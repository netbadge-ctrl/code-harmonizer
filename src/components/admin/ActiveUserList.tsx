import React, { useState, useMemo } from 'react';
import { Search, Users, Zap, Activity, TrendingUp, FileText, BarChart3, Calendar, Monitor, Copy, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TopUser {
  id: string;
  name: string;
  email: string;
  tokens: number;
  requests: number;
  lastActiveAt: string;
}

interface ActiveUserListProps {
  topUsers: TopUser[];
}

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '近 1 小时' },
  { value: '6h', label: '近 6 小时' },
  { value: '24h', label: '近 24 小时' },
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
];

const CLIENT_TYPES = ['VS Code', 'JetBrains', 'Cursor', 'Web IDE', 'CLI'];

function formatTokens(tokens: number): string {
  if (tokens >= 1000000000) return (tokens / 1000000000).toFixed(1) + 'B';
  if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + 'M';
  if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'K';
  return tokens.toString();
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeRangeDays(range: TimeRange): number {
  switch (range) {
    case '1h': return 1 / 24;
    case '6h': return 0.25;
    case '24h': return 1;
    case '7d': return 7;
    case '30d': return 30;
  }
}

interface CallDetail {
  id: string;
  timestamp: string;
  model: string;
  client: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latency: number;
  ttft: number;
  statusCode: number;
  status: string;
  requestId: string;
  prompt: string;
  response: string;
}

// 生成用户调用明细模拟数据
function generateUserCallDetails(userId: string, _timeRange: TimeRange): CallDetail[] {
  const models = ['GPT-4 Turbo', 'GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek V3', 'Kimi K2', 'GLM-4'];
  const statusCodes = [
    { code: 200, status: 'success', weight: 85 },
    { code: 201, status: 'success', weight: 5 },
    { code: 400, status: 'error', weight: 2 },
    { code: 429, status: 'error', weight: 3 },
    { code: 500, status: 'error', weight: 3 },
    { code: 503, status: 'error', weight: 2 },
  ];
  const prompts = [
    '请帮我实现一个排序算法',
    '解释这段代码的功能',
    '优化这个数据库查询',
    '生成单元测试用例',
    '重构这个函数',
    '修复这个 Bug',
    '添加错误处理逻辑',
    '实现一个缓存机制',
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440));
    const model = models[Math.floor(Math.random() * models.length)];
    const client = CLIENT_TYPES[Math.floor(Math.random() * CLIENT_TYPES.length)];
    const inputTokens = Math.floor(Math.random() * 3000) + 200;
    const outputTokens = Math.floor(Math.random() * 2000) + 100;
    
    // weighted random status
    const rand = Math.random() * 100;
    let cumWeight = 0;
    let selectedStatus = statusCodes[0];
    for (const s of statusCodes) {
      cumWeight += s.weight;
      if (rand <= cumWeight) { selectedStatus = s; break; }
    }

    return {
      id: `call-${userId}-${i}`,
      timestamp: date.toISOString(),
      model,
      client,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      latency: +(Math.random() * 3 + 0.5).toFixed(2),
      statusCode: selectedStatus.code,
      status: selectedStatus.status,
      requestId: `req-${Math.random().toString(36).substring(2, 10)}`,
      prompt: prompts[Math.floor(Math.random() * prompts.length)],
      response: '// 生成的代码示例\nfunction example() {\n  return "hello";\n}',
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// 生成用户核心数据统计
function generateUserStats(user: TopUser, timeRange: TimeRange) {
  const days = Math.max(getTimeRangeDays(timeRange), 1);
  const avgDailyTokens = Math.floor(user.tokens / days);
  const avgDailyRequests = Math.floor(user.requests / days);
  const successRate = +(98 + Math.random() * 1.8).toFixed(1);
  const avgLatency = +(Math.random() * 1.5 + 0.8).toFixed(2);

  const trendDays = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 7;
  const trend = Array.from({ length: trendDays }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (trendDays - 1 - i));
    return {
      date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      tokens: Math.floor(avgDailyTokens * (0.6 + Math.random() * 0.8)),
      requests: Math.floor(avgDailyRequests * (0.6 + Math.random() * 0.8)),
    };
  });

  const models = ['GPT-4 Turbo', 'GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek V3', 'Kimi K2'];
  let remaining = user.tokens;
  const modelDistribution = models.map((model, i) => {
    const portion = i < models.length - 1
      ? Math.floor(remaining * (0.15 + Math.random() * 0.25))
      : remaining;
    remaining -= portion;
    return { model, tokens: Math.max(portion, 0), requests: Math.floor(Math.random() * 200) + 50 };
  }).sort((a, b) => b.tokens - a.tokens);

  return { avgDailyTokens, avgDailyRequests, successRate, avgLatency, trend, modelDistribution };
}

function getTimeRangeLabel(range: TimeRange): string {
  return TIME_RANGE_OPTIONS.find(o => o.value === range)?.label ?? '';
}

function getStatusCodeColor(code: number): string {
  if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
}

export function ActiveUserList({ topUsers }: ActiveUserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [listTimeRange, setListTimeRange] = useState<TimeRange>('7d');
  const [selectedUser, setSelectedUser] = useState<TopUser | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'stats' | 'calls'>('stats');
  const [detailTimeRange, setDetailTimeRange] = useState<TimeRange>('7d');
  const [callPage, setCallPage] = useState(1);
  const [callModelFilter, setCallModelFilter] = useState<string>('all');
  const [callStatusFilter, setCallStatusFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null);
  const [callSheetOpen, setCallSheetOpen] = useState(false);
  const pageSize = 10;
  const callPageSize = 10;

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return topUsers;
    const q = searchQuery.toLowerCase();
    return topUsers.filter(
      u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [topUsers, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleViewUser = (user: TopUser) => {
    setSelectedUser(user);
    setDetailTab('stats');
    setCallPage(1);
    setCallModelFilter('all');
    setCallStatusFilter('all');
    setSelectedCall(null);
    setCallSheetOpen(false);
    setDetailTimeRange(listTimeRange);
    setDetailDialogOpen(true);
  };

  const userCallDetails = useMemo(
    () => selectedUser ? generateUserCallDetails(selectedUser.id, detailTimeRange) : [],
    [selectedUser, detailTimeRange]
  );

  // 获取调用明细中的可用模型和状态码列表
  const availableModels = useMemo(() => {
    const models = new Set(userCallDetails.map(c => c.model));
    return Array.from(models).sort();
  }, [userCallDetails]);

  const availableStatusCodes = useMemo(() => {
    const codes = new Set(userCallDetails.map(c => String(c.statusCode)));
    return Array.from(codes).sort();
  }, [userCallDetails]);

  // 筛选后的调用明细
  const filteredCallDetails = useMemo(() => {
    return userCallDetails.filter(call => {
      if (callModelFilter !== 'all' && call.model !== callModelFilter) return false;
      if (callStatusFilter !== 'all' && String(call.statusCode) !== callStatusFilter) return false;
      return true;
    });
  }, [userCallDetails, callModelFilter, callStatusFilter]);

  const userStats = useMemo(
    () => selectedUser ? generateUserStats(selectedUser, detailTimeRange) : null,
    [selectedUser, detailTimeRange]
  );

  React.useEffect(() => { setCurrentPage(1); }, [searchQuery]);
  React.useEffect(() => { setCallPage(1); }, [callModelFilter, callStatusFilter]);

  return (
    <div className="space-y-4">
      {/* 用户列表 */}
      <Card className="enterprise-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">活跃用户</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={listTimeRange} onValueChange={(v) => setListTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>Token 消耗</th>
                <th>请求次数</th>
                <th>最后活跃</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => {
                const rank = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        rank === 1 ? "bg-yellow-500/20 text-yellow-600" :
                        rank === 2 ? "bg-gray-500/20 text-gray-600" :
                        rank === 3 ? "bg-orange-500/20 text-orange-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {rank}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{formatTokens(user.tokens)}</td>
                    <td>{user.requests.toLocaleString()}</td>
                    <td className="text-muted-foreground">{formatDateTime(user.lastActiveAt)}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary"
                        onClick={() => handleViewUser(user)}
                      >
                        查看详情
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-8">
                    未找到匹配的用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              共 {filteredUsers.length} 个用户
            </span>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 用户详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedUser?.name}
                <span className="text-sm font-normal text-muted-foreground">({selectedUser?.email})</span>
              </DialogTitle>
              <Select value={detailTimeRange} onValueChange={(v) => setDetailTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          {selectedUser && userStats && (
            <div className="space-y-4">
              {/* Tab切换 */}
              <div className="flex gap-1 border-b">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                    detailTab === 'stats'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDetailTab('stats')}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1.5" />
                  数据统计
                </button>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                    detailTab === 'calls'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDetailTab('calls')}
                >
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  调用明细
                </button>
              </div>

              {detailTab === 'stats' && (
                <div className="space-y-4">
                  {/* 核心指标 */}
                  <div className="grid grid-cols-4 gap-3">
                    <Card className="enterprise-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">总 Token 消耗</p>
                        <p className="text-lg font-bold mt-1">{formatTokens(selectedUser.tokens)}</p>
                      </CardContent>
                    </Card>
                    <Card className="enterprise-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">日均 Token</p>
                        <p className="text-lg font-bold mt-1">{formatTokens(userStats.avgDailyTokens)}</p>
                      </CardContent>
                    </Card>
                    <Card className="enterprise-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">成功率</p>
                        <p className="text-lg font-bold mt-1">{userStats.successRate}%</p>
                      </CardContent>
                    </Card>
                    <Card className="enterprise-card">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">平均响应时间</p>
                        <p className="text-lg font-bold mt-1">{userStats.avgLatency}s</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Token 消耗趋势 */}
                  <Card className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{getTimeRangeLabel(detailTimeRange)} Token 消耗趋势</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userStats.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatTokens(v)} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                              }}
                              formatter={(value: number) => [formatTokens(value), 'Token']}
                            />
                            <Line type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 模型使用分布 */}
                  <Card className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">模型使用分布</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>模型</th>
                            <th>Token 消耗</th>
                            <th>请求次数</th>
                            <th>占比</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userStats.modelDistribution.map((item) => (
                            <tr key={item.model}>
                              <td className="font-medium">{item.model}</td>
                              <td>{formatTokens(item.tokens)}</td>
                              <td>{item.requests}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${selectedUser.tokens > 0 ? (item.tokens / selectedUser.tokens * 100) : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {selectedUser.tokens > 0 ? (item.tokens / selectedUser.tokens * 100).toFixed(1) : 0}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {detailTab === 'calls' && (
                <div className="space-y-3">
                  {/* 筛选栏 */}
                  <div className="flex items-center gap-3">
                    <Select value={callModelFilter} onValueChange={setCallModelFilter}>
                      <SelectTrigger className="w-44 h-8 text-sm">
                        <SelectValue placeholder="全部模型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部模型</SelectItem>
                        {availableModels.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={callStatusFilter} onValueChange={setCallStatusFilter}>
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue placeholder="全部状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        {availableStatusCodes.map(code => (
                          <SelectItem key={code} value={code}>{code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground ml-auto">
                      共 {filteredCallDetails.length} 条记录
                    </span>
                  </div>

                  <Card className="enterprise-card">
                    <CardContent className="p-0">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>时间</th>
                            <th>模型</th>
                            <th>客户端</th>
                            <th>输入 Token</th>
                            <th>输出 Token</th>
                            <th>总 Token</th>
                            <th>耗时</th>
                            <th>状态码</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCallDetails
                            .slice((callPage - 1) * callPageSize, callPage * callPageSize)
                            .map((call) => (
                            <tr key={call.id}>
                              <td className="text-muted-foreground whitespace-nowrap">
                                {formatDateTime(call.timestamp)}
                              </td>
                              <td className="font-medium">{call.model}</td>
                              <td>
                                <div className="flex items-center gap-1.5">
                                  <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-sm">{call.client}</span>
                                </div>
                              </td>
                              <td>{call.inputTokens.toLocaleString()}</td>
                              <td>{call.outputTokens.toLocaleString()}</td>
                              <td>{call.totalTokens.toLocaleString()}</td>
                              <td>{call.latency}s</td>
                              <td>
                                <Badge variant="outline" className={cn("text-xs", getStatusCodeColor(call.statusCode))}>
                                  {call.statusCode}
                                </Badge>
                              </td>
                              <td>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-primary"
                                  onClick={() => {
                                    setSelectedCall(call);
                                    setCallSheetOpen(true);
                                  }}
                                >
                                  查看详情
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {filteredCallDetails.length > callPageSize && (
                        <div className="p-3 border-t flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            第 {(callPage - 1) * callPageSize + 1}-{Math.min(callPage * callPageSize, filteredCallDetails.length)} 条
                          </span>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCallPage(p => Math.max(1, p - 1))}
                                  className={callPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {Array.from({ length: Math.min(Math.ceil(filteredCallDetails.length / callPageSize), 5) }, (_, i) => (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    onClick={() => setCallPage(i + 1)}
                                    isActive={callPage === i + 1}
                                    className="cursor-pointer"
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setCallPage(p => Math.min(Math.ceil(filteredCallDetails.length / callPageSize), p + 1))}
                                  className={callPage === Math.ceil(filteredCallDetails.length / callPageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* 调用详情侧边面板 */}
      <Sheet open={callSheetOpen} onOpenChange={setCallSheetOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              调用详情
            </SheetTitle>
          </SheetHeader>

          {selectedCall && (
            <div className="space-y-5 mt-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground">调用时间</div>
                  <div className="text-sm font-medium mt-0.5">{new Date(selectedCall.timestamp).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">模型</div>
                  <div className="text-sm font-medium mt-0.5">{selectedCall.model}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">客户端</div>
                  <div className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                    {selectedCall.client}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">状态码</div>
                  <div className="mt-0.5">
                    <Badge variant="outline" className={cn("text-xs", getStatusCodeColor(selectedCall.statusCode))}>
                      {selectedCall.statusCode}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Request ID</div>
                  <div className="text-sm font-mono mt-0.5">{selectedCall.requestId}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">响应耗时</div>
                  <div className="text-sm font-medium mt-0.5">{selectedCall.latency}s</div>
                </div>
              </div>

              {/* Token 统计 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <div className="text-xs text-muted-foreground">输入 Token</div>
                  <div className="text-base font-bold mt-1">{selectedCall.inputTokens.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <div className="text-xs text-muted-foreground">输出 Token</div>
                  <div className="text-base font-bold mt-1">{selectedCall.outputTokens.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border text-center">
                  <div className="text-xs text-muted-foreground">总 Token</div>
                  <div className="text-base font-bold mt-1">{selectedCall.totalTokens.toLocaleString()}</div>
                </div>
              </div>

              {/* 请求内容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">请求内容</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCall.prompt);
                      toast.success('请求内容已复制');
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制
                  </Button>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedCall.prompt}
                </div>
              </div>

              {/* 响应内容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">响应内容</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCall.response);
                      toast.success('响应内容已复制');
                    }}
                    disabled={!selectedCall.response}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制
                  </Button>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedCall.response || <span className="text-slate-500">无响应内容</span>}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
