import React, { useState, useMemo } from 'react';
import { Search, Users, Zap, Activity, TrendingUp, FileText, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

// 生成用户调用明细模拟数据
function generateUserCallDetails(userId: string, _timeRange: TimeRange) {
  const models = ['GPT-4 Turbo', 'GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek V3', 'Kimi K2', 'GLM-4'];
  return Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440));
    const model = models[Math.floor(Math.random() * models.length)];
    const inputTokens = Math.floor(Math.random() * 3000) + 200;
    const outputTokens = Math.floor(Math.random() * 2000) + 100;
    const status = Math.random() > 0.05 ? 'success' : 'error';
    return {
      id: `call-${userId}-${i}`,
      timestamp: date.toISOString(),
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      latency: +(Math.random() * 3 + 0.5).toFixed(2),
      status,
      errorCode: status === 'error' ? ['429', '500', '503'][Math.floor(Math.random() * 3)] : null,
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

  const trendDays = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : timeRange === '24h' ? 7 : 7;
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

export function ActiveUserList({ topUsers }: ActiveUserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [listTimeRange, setListTimeRange] = useState<TimeRange>('7d');
  const [selectedUser, setSelectedUser] = useState<TopUser | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'stats' | 'calls'>('stats');
  const [detailTimeRange, setDetailTimeRange] = useState<TimeRange>('7d');
  const [callPage, setCallPage] = useState(1);
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

  const summary = useMemo(() => ({
    totalUsers: topUsers.length,
    totalTokens: topUsers.reduce((s, u) => s + u.tokens, 0),
    totalRequests: topUsers.reduce((s, u) => s + u.requests, 0),
    avgTokensPerUser: topUsers.length > 0 ? Math.floor(topUsers.reduce((s, u) => s + u.tokens, 0) / topUsers.length) : 0,
  }), [topUsers]);

  const handleViewUser = (user: TopUser) => {
    setSelectedUser(user);
    setDetailTab('stats');
    setCallPage(1);
    setDetailTimeRange(listTimeRange); // 默认继承列表的时间筛选
    setDetailDialogOpen(true);
  };

  const userCallDetails = useMemo(
    () => selectedUser ? generateUserCallDetails(selectedUser.id, detailTimeRange) : [],
    [selectedUser, detailTimeRange]
  );

  const userStats = useMemo(
    () => selectedUser ? generateUserStats(selectedUser, detailTimeRange) : null,
    [selectedUser, detailTimeRange]
  );

  React.useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* 汇总统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">活跃用户数</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">总 Token 消耗</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatTokens(summary.totalTokens)}</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">总请求次数</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.totalRequests.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">人均 Token 消耗</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatTokens(summary.avgTokensPerUser)}</p>
          </CardContent>
        </Card>
      </div>

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

          {totalPages > 1 && (
            <div className="p-4 border-t">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
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
                  <Card className="enterprise-card">
                    <CardContent className="p-0">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>时间</th>
                            <th>模型</th>
                            <th>输入 Token</th>
                            <th>输出 Token</th>
                            <th>总 Token</th>
                            <th>耗时</th>
                            <th>状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userCallDetails
                            .slice((callPage - 1) * callPageSize, callPage * callPageSize)
                            .map((call) => (
                            <tr key={call.id}>
                              <td className="text-muted-foreground whitespace-nowrap">
                                {formatDateTime(call.timestamp)}
                              </td>
                              <td className="font-medium">{call.model}</td>
                              <td>{call.inputTokens.toLocaleString()}</td>
                              <td>{call.outputTokens.toLocaleString()}</td>
                              <td>{call.totalTokens.toLocaleString()}</td>
                              <td>{call.latency}s</td>
                              <td>
                                {call.status === 'success' ? (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                                    成功
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                                    {call.errorCode}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {userCallDetails.length > callPageSize && (
                        <div className="p-3 border-t">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCallPage(p => Math.max(1, p - 1))}
                                  className={callPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {Array.from({ length: Math.ceil(userCallDetails.length / callPageSize) }, (_, i) => (
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
                                  onClick={() => setCallPage(p => Math.min(Math.ceil(userCallDetails.length / callPageSize), p + 1))}
                                  className={callPage === Math.ceil(userCallDetails.length / callPageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
    </div>
  );
}
