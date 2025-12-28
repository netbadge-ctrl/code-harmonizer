// 管理后台类型定义

export interface Customer {
  id: string;
  companyName: string;
  domain: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // 订阅信息
  subscription: {
    plan: 'trial' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'expired' | 'suspended';
    billingType: 'prepaid' | 'postpaid';
    startDate: string;
    expiresAt: string;
    seats: number;
    usedSeats: number;
  };
  
  // 认证配置
  authConfig: {
    ssoEnabled: boolean;
    ssoProvider?: 'wps365' | 'wecom' | 'azure' | 'okta';
    mfaEnabled: boolean;
    ipWhitelistEnabled: boolean;
    ipWhitelistCount: number;
  };
  
  // 使用统计
  usage: {
    totalTokens: number;
    monthlyTokens: number;
    activeUsers: number;
    totalRequests: number;
    monthlyRequests: number;
    lastActiveAt: string;
  };
  
  // 模型配置
  models: {
    enabledCount: number;
    totalCount: number;
    primaryModel: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends Customer {
  // 详细的模型使用分布
  modelUsage: {
    model: string;
    tokens: number;
    requests: number;
    percentage: number;
  }[];
  
  // 每日使用趋势
  dailyUsage: {
    date: string;
    tokens: number;
    requests: number;
    activeUsers: number;
  }[];
  
  // 活跃用户列表
  topUsers: {
    id: string;
    name: string;
    email: string;
    tokens: number;
    requests: number;
    lastActiveAt: string;
  }[];
  
  // 审计日志
  recentLogs: {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    details: string;
  }[];
}

export type AdminView = 'customers' | 'customerDetail' | 'analytics' | 'settings';
