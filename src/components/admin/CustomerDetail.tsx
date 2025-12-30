import React, { useState } from 'react';
import { ArrowLeft, Building2, Users, Zap, Shield, Clock, Activity, Settings, Globe, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomerDetail as CustomerDetailType } from '@/types/admin';
import { getCustomerDetail } from '@/data/adminMockData';
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
} from 'recharts';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

const planLabels: Record<string, string> = {
  trial: '试用版',
  starter: '基础版',
  professional: '专业版',
  enterprise: '企业版',
};

const statusLabels: Record<string, string> = {
  active: '正常',
  expired: '已过期',
  suspended: '已暂停',
};

const authMethodLabels: Record<string, string> = {
  wps365: 'WPS 365',
  wecom: '企业微信',
  azure: 'Azure AD',
  okta: 'Okta',
  feishu: '飞书',
  dingtalk: '钉钉',
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
            <p className="text-sm text-muted-foreground">{customer.domain}</p>
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

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{planLabels[customer.subscription.plan]}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.subscription.billingType === 'prepaid' ? '预付费' : '后付费'}
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
                <p className="text-2xl font-bold text-foreground">{customer.usage.activeUsers}</p>
                <p className="text-xs text-muted-foreground">
                  活跃用户 / {customer.subscription.usedSeats} 已分配
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
                <p className="text-2xl font-bold text-foreground">{formatTokens(customer.usage.monthlyTokens)}</p>
                <p className="text-xs text-muted-foreground">本月 Token 消耗</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{customer.usage.monthlyRequests}</p>
                <p className="text-xs text-muted-foreground">本月请求数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息 Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">基本信息</TabsTrigger>
          <TabsTrigger value="usage">使用统计</TabsTrigger>
          <TabsTrigger value="users">活跃用户</TabsTrigger>
          <TabsTrigger value="logs">操作日志</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 企业信息 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  企业信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">企业名称</span>
                  <span className="text-sm font-medium">{customer.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">企业域名</span>
                  <span className="text-sm">{customer.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">创建时间</span>
                  <span className="text-sm">{formatDate(customer.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

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
                    customer.subscription.plan === 'enterprise' ? 'status-badge-success' :
                    customer.subscription.plan === 'professional' ? 'status-badge-warning' :
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

            {/* 认证配置 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  认证配置
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
              </CardContent>
            </Card>

            {/* 模型配置 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  模型配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">主要使用模型</span>
                  <span className="text-sm">{customer.models.primaryModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">累计 Token</span>
                  <span className="text-sm">{formatTokens(customer.usage.totalTokens)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">累计请求</span>
                  <span className="text-sm">{customer.usage.totalRequests.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 每日使用趋势 */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">每日使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customer.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.slice(5)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatTokens(value)}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatTokens(value)}
                        labelFormatter={(label) => `日期: ${label}`}
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
                    <th>请求数</th>
                    <th>占比</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.modelUsage.map((usage, index) => (
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
                      <td>{usage.requests.toLocaleString()}</td>
                      <td>{usage.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle className="text-base">活跃用户 Top 5</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>Token 消耗</th>
                    <th>请求数</th>
                    <th>最近活跃</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.topUsers.map((user) => (
                    <tr key={user.id}>
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
      </Tabs>
    </div>
  );
}
