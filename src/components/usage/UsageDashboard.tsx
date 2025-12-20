import React, { useState } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Clock,
  Download,
  Calendar,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsageStats, mockUsageRecords } from '@/data/mockData';
import { UsageRecord } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from 'recharts';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'];

export function UsageDashboard() {
  const [selectedRecord, setSelectedRecord] = useState<UsageRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleViewDetail = (record: UsageRecord) => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label}已复制` });
  };

  const getStatusIcon = (status: UsageRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'timeout':
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusText = (status: UsageRecord['status']) => {
    switch (status) {
      case 'success': return '成功';
      case 'error': return '错误';
      case 'timeout': return '超时';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">用量统计</h2>
          <p className="text-sm text-muted-foreground">分析 AI 服务使用情况和趋势</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            最近 7 天
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: '总 Token 消耗', 
            value: `${(mockUsageStats.totalTokens / 1000000).toFixed(2)}M`,
            icon: Zap,
            change: '+12.5%'
          },
          { 
            label: '总请求数', 
            value: mockUsageStats.totalRequests.toLocaleString(),
            icon: TrendingUp,
            change: '+8.2%'
          },
          { 
            label: '活跃用户', 
            value: mockUsageStats.activeUsers,
            icon: Users,
            change: '+3'
          },
          { 
            label: '平均响应时间', 
            value: `${mockUsageStats.avgLatency}s`,
            icon: Clock,
            change: '-0.2s'
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
            <p className="text-xs text-success mt-1">{stat.change} vs 上周</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 enterprise-card p-5">
          <h3 className="font-semibold text-foreground mb-4">使用趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockUsageStats.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
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
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, 'Tokens']}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

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
      </div>

      {/* Usage Records */}
      <div className="enterprise-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">调用明细</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>用户</th>
              <th>模型</th>
              <th>输入 Token</th>
              <th>输出 Token</th>
              <th>耗时</th>
              <th>状态</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {mockUsageRecords.map((record) => (
              <tr key={record.id} className="group">
                <td>
                  <span className="text-sm text-foreground">
                    {new Date(record.timestamp).toLocaleTimeString('zh-CN')}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-foreground">{record.userName}</span>
                </td>
                <td>
                  <span className="text-sm text-foreground">{record.model}</span>
                </td>
                <td>
                  <span className="text-sm font-mono text-foreground">{record.inputTokens.toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-sm font-mono text-foreground">{record.outputTokens.toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-sm text-foreground">{record.latency}s</span>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(record.status)}
                    <span className={cn(
                      "text-sm",
                      record.status === 'success' ? "text-success" :
                      record.status === 'error' ? "text-destructive" : "text-warning"
                    )}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                      onClick={() => handleViewDetail(record)}
                    >
                      <Eye className="w-4 h-4" />
                      查看
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>调用详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">调用时间</span>
                  <p className="text-foreground mt-1">
                    {new Date(selectedRecord.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">用户</span>
                  <p className="text-foreground mt-1">{selectedRecord.userName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">模型</span>
                  <p className="text-foreground mt-1">{selectedRecord.model}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Token 消耗</span>
                  <p className="text-foreground mt-1">
                    {selectedRecord.inputTokens} + {selectedRecord.outputTokens} = {selectedRecord.inputTokens + selectedRecord.outputTokens}
                  </p>
                </div>
              </div>

              {selectedRecord.prompt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Prompt</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1 h-7"
                      onClick={() => handleCopy(selectedRecord.prompt!, 'Prompt')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </Button>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-sm font-mono text-foreground max-h-32 overflow-y-auto">
                    {selectedRecord.prompt}
                  </div>
                </div>
              )}

              {selectedRecord.response && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Response</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1 h-7"
                      onClick={() => handleCopy(selectedRecord.response!, 'Response')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </Button>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-sm font-mono text-foreground max-h-32 overflow-y-auto">
                    {selectedRecord.response}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
