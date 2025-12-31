import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Building2, Users, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer } from '@/types/admin';
import { mockCustomers } from '@/data/adminMockData';
import { cn } from '@/lib/utils';

interface CustomerListProps {
  onSelectCustomer: (customerId: string) => void;
}

const planLabels: Record<string, string> = {
  starter: '基础版',
  professional: '专业版',
};

const statusLabels: Record<string, string> = {
  trial: '试用',
  active: '正常',
  expired: '已过期',
};

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

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateString);
}

export function CustomerList({ onSelectCustomer }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = 
      customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || customer.subscription.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || customer.subscription.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: mockCustomers.length,
    active: mockCustomers.filter(c => c.subscription.status === 'active').length,
    totalUsers: mockCustomers.reduce((sum, c) => sum + c.usage.activeUsers, 0),
    totalTokens: mockCustomers.reduce((sum, c) => sum + c.usage.monthlyTokens, 0),
  };

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <Card className="enterprise-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索公司名称、域名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="订阅版本" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部版本</SelectItem>
                  <SelectItem value="starter">基础版</SelectItem>
                  <SelectItem value="professional">专业版</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="trial">试用</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 客户列表 */}
      <Card className="enterprise-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">
            客户列表 ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>公司信息</th>
                  <th>版本信息</th>
                  <th>订阅状态</th>
                  <th>认证配置</th>
                  <th>使用情况</th>
                  <th>最近活跃</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => onSelectCustomer(customer.id)}
                  >
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{customer.companyName}</span>
                        <span className="text-xs text-muted-foreground">{customer.customerCode}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">客户端: {customer.clientVersion}</span>
                        <span className="text-sm text-muted-foreground">服务端: {customer.serverVersion}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "status-badge",
                            customer.subscription.plan === 'professional' ? 'status-badge-success' :
                            'status-badge-neutral'
                          )}>
                            {planLabels[customer.subscription.plan]}
                          </span>
                          <span className={cn(
                            "status-badge",
                            customer.subscription.status === 'active' ? 'status-badge-success' :
                            customer.subscription.status === 'expired' ? 'status-badge-error' :
                            'status-badge-warning'
                          )}>
                            {statusLabels[customer.subscription.status]}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {customer.subscription.usedSeats}/{customer.subscription.seats} 席位 · 
                          {customer.subscription.billingType === 'prepaid' ? '预付费' : '后付费'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          到期: {formatDate(customer.subscription.expiresAt)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          {customer.authConfig.enterpriseAuthMethod !== 'none' ? (
                            <span className="status-badge status-badge-success">
                              {customer.authConfig.enterpriseAuthMethod === 'wps365' ? '金山协作' :
                               customer.authConfig.enterpriseAuthMethod === 'wecom' ? '企业微信' :
                               customer.authConfig.enterpriseAuthMethod === 'dingtalk' ? '钉钉' :
                               customer.authConfig.enterpriseAuthMethod === 'feishu' ? '飞书' : '未知'}
                            </span>
                          ) : (
                            <span className="status-badge status-badge-neutral">未配置</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {customer.authConfig.ipWhitelistEnabled && (
                            <span>IP白名单({customer.authConfig.ipWhitelist.length})</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{customer.usage.activeUsers} 活跃用户</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{formatTokens(customer.usage.monthlyTokens)} Token/月</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{getRelativeTime(customer.usage.lastActiveAt)}</span>
                      </div>
                    </td>
                    <td>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
