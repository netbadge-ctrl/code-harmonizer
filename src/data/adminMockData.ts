import { Customer, CustomerDetail } from '@/types/admin';

export const mockCustomers: Customer[] = [
  {
    id: 'cust_001',
    companyName: '科技创新有限公司',
    domain: 'techinnov.com',
    contactName: '张三',
    contactEmail: 'zhangsan@techinnov.com',
    contactPhone: '13800138001',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      billingType: 'postpaid',
      startDate: '2024-01-15',
      expiresAt: '2025-01-15',
      seats: 100,
      usedSeats: 87,
    },
    authConfig: {
      enterpriseAuthMethod: 'wps365',
      ipWhitelistEnabled: true,
      ipWhitelist: ['10.0.0.0/24', '192.168.1.0/24', '172.16.0.0/16', '10.10.10.1', '203.0.113.0/24'],
    },
    enabledModels: ['GPT-4 Turbo', 'GPT-4o', 'GPT-4o Mini', 'Claude 3.5 Sonnet', 'Claude 3 Opus', 'Gemini Pro', 'ERNIE-4.0', 'Qwen-Max'],
    usage: {
      totalTokens: 125000000,
      monthlyTokens: 15200000,
      activeUsers: 72,
      totalRequests: 45230,
      monthlyRequests: 5840,
      lastActiveAt: '2024-12-28T10:30:00Z',
    },
    models: {
      enabledCount: 8,
      totalCount: 12,
      primaryModel: 'GPT-4 Turbo',
    },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-12-28T10:30:00Z',
  },
  {
    id: 'cust_002',
    companyName: '金融数据服务公司',
    domain: 'findata.cn',
    contactName: '李四',
    contactEmail: 'lisi@findata.cn',
    contactPhone: '13900139002',
    subscription: {
      plan: 'professional',
      status: 'active',
      billingType: 'prepaid',
      startDate: '2024-03-01',
      expiresAt: '2025-03-01',
      seats: 50,
      usedSeats: 43,
    },
    authConfig: {
      enterpriseAuthMethod: 'wps365',
      ipWhitelistEnabled: true,
      ipWhitelist: ['10.1.0.0/24', '192.168.2.0/24', '10.2.2.1'],
    },
    enabledModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'GPT-4o Mini', 'ERNIE-4.0', 'Qwen-Max'],
    usage: {
      totalTokens: 68000000,
      monthlyTokens: 8500000,
      activeUsers: 38,
      totalRequests: 28100,
      monthlyRequests: 3200,
      lastActiveAt: '2024-12-28T09:45:00Z',
    },
    models: {
      enabledCount: 5,
      totalCount: 12,
      primaryModel: 'Claude 3.5 Sonnet',
    },
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-12-28T09:45:00Z',
  },
  {
    id: 'cust_003',
    companyName: '教育科技集团',
    domain: 'edutech.edu.cn',
    contactName: '王五',
    contactEmail: 'wangwu@edutech.edu.cn',
    subscription: {
      plan: 'starter',
      status: 'active',
      billingType: 'prepaid',
      startDate: '2024-06-15',
      expiresAt: '2025-06-15',
      seats: 20,
      usedSeats: 18,
    },
    authConfig: {
      enterpriseAuthMethod: 'none',
      ipWhitelistEnabled: false,
      ipWhitelist: [],
    },
    enabledModels: ['GPT-4o Mini', 'ERNIE-4.0', 'Qwen-Turbo'],
    usage: {
      totalTokens: 12000000,
      monthlyTokens: 2100000,
      activeUsers: 15,
      totalRequests: 8500,
      monthlyRequests: 1200,
      lastActiveAt: '2024-12-27T16:20:00Z',
    },
    models: {
      enabledCount: 3,
      totalCount: 12,
      primaryModel: 'GPT-4o Mini',
    },
    createdAt: '2024-06-15T14:00:00Z',
    updatedAt: '2024-12-27T16:20:00Z',
  },
  {
    id: 'cust_004',
    companyName: '智能制造有限公司',
    domain: 'smartmfg.com',
    contactName: '赵六',
    contactEmail: 'zhaoliu@smartmfg.com',
    contactPhone: '13700137004',
    subscription: {
      plan: 'trial',
      status: 'active',
      billingType: 'prepaid',
      startDate: '2024-12-20',
      expiresAt: '2025-01-20',
      seats: 10,
      usedSeats: 5,
    },
    authConfig: {
      enterpriseAuthMethod: 'none',
      ipWhitelistEnabled: false,
      ipWhitelist: [],
    },
    enabledModels: ['GPT-4o', 'GPT-4o Mini'],
    usage: {
      totalTokens: 500000,
      monthlyTokens: 500000,
      activeUsers: 5,
      totalRequests: 320,
      monthlyRequests: 320,
      lastActiveAt: '2024-12-28T08:15:00Z',
    },
    models: {
      enabledCount: 2,
      totalCount: 12,
      primaryModel: 'GPT-4o',
    },
    createdAt: '2024-12-20T09:00:00Z',
    updatedAt: '2024-12-28T08:15:00Z',
  },
  {
    id: 'cust_005',
    companyName: '医疗健康科技',
    domain: 'healthtech.com',
    contactName: '孙七',
    contactEmail: 'sunqi@healthtech.com',
    contactPhone: '13600136005',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      billingType: 'postpaid',
      startDate: '2024-02-01',
      expiresAt: '2025-02-01',
      seats: 200,
      usedSeats: 156,
    },
    authConfig: {
      enterpriseAuthMethod: 'dingtalk',
      ipWhitelistEnabled: true,
      ipWhitelist: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '203.0.113.1', '203.0.113.2', '198.51.100.0/24', '198.51.101.0/24', '100.64.0.0/10'],
    },
    enabledModels: ['GPT-4 Turbo', 'GPT-4o', 'GPT-4o Mini', 'Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku', 'Gemini Pro', 'ERNIE-4.0', 'Qwen-Max', 'Qwen-Turbo'],
    usage: {
      totalTokens: 280000000,
      monthlyTokens: 32000000,
      activeUsers: 142,
      totalRequests: 98500,
      monthlyRequests: 12400,
      lastActiveAt: '2024-12-28T11:00:00Z',
    },
    models: {
      enabledCount: 10,
      totalCount: 12,
      primaryModel: 'GPT-4 Turbo',
    },
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-12-28T11:00:00Z',
  },
  {
    id: 'cust_006',
    companyName: '电商平台科技',
    domain: 'ecomtech.cn',
    contactName: '周八',
    contactEmail: 'zhouba@ecomtech.cn',
    subscription: {
      plan: 'professional',
      status: 'expired',
      billingType: 'prepaid',
      startDate: '2024-01-01',
      expiresAt: '2024-12-01',
      seats: 30,
      usedSeats: 0,
    },
    authConfig: {
      enterpriseAuthMethod: 'wecom',
      ipWhitelistEnabled: false,
      ipWhitelist: [],
    },
    enabledModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'ERNIE-4.0', 'Qwen-Max'],
    usage: {
      totalTokens: 45000000,
      monthlyTokens: 0,
      activeUsers: 0,
      totalRequests: 18200,
      monthlyRequests: 0,
      lastActiveAt: '2024-11-28T14:30:00Z',
    },
    models: {
      enabledCount: 4,
      totalCount: 12,
      primaryModel: 'Claude 3.5 Sonnet',
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-11-28T14:30:00Z',
  },
];

export const getCustomerDetail = (customerId: string): CustomerDetail | null => {
  const customer = mockCustomers.find(c => c.id === customerId);
  if (!customer) return null;

  return {
    ...customer,
    modelUsage: [
      { model: 'GPT-4 Turbo', tokens: 45000000, requests: 15200, percentage: 36, avgInputLatencyPer1KToken: 45, avgOutputLatencyPer1KToken: 128 },
      { model: 'Claude 3.5 Sonnet', tokens: 35000000, requests: 12800, percentage: 28, avgInputLatencyPer1KToken: 38, avgOutputLatencyPer1KToken: 115 },
      { model: 'GPT-4o', tokens: 25000000, requests: 9500, percentage: 20, avgInputLatencyPer1KToken: 32, avgOutputLatencyPer1KToken: 95 },
      { model: 'GPT-4o Mini', tokens: 15000000, requests: 5800, percentage: 12, avgInputLatencyPer1KToken: 18, avgOutputLatencyPer1KToken: 52 },
      { model: '其他', tokens: 5000000, requests: 1930, percentage: 4, avgInputLatencyPer1KToken: 25, avgOutputLatencyPer1KToken: 78 },
    ],
    modelLatencyTrend: (() => {
      const models = ['GPT-4 Turbo', 'Claude 3.5 Sonnet', 'GPT-4o', 'GPT-4o Mini'];
      const trend: { date: string; model: string; avgInputLatency: number; avgOutputLatency: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        models.forEach(model => {
          trend.push({
            date: dateStr,
            model,
            avgInputLatency: Math.floor(Math.random() * 30) + 20,
            avgOutputLatency: Math.floor(Math.random() * 80) + 60,
          });
        });
      }
      return trend;
    })(),
    dailyUsage: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 3000000) + 1500000,
        requests: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 30) + 20,
      };
    }),
    topUsers: [
      { id: 'u1', name: '开发者A', email: 'dev-a@company.com', tokens: 2500000, requests: 850, lastActiveAt: '2024-12-28T10:30:00Z' },
      { id: 'u2', name: '开发者B', email: 'dev-b@company.com', tokens: 2100000, requests: 720, lastActiveAt: '2024-12-28T09:45:00Z' },
      { id: 'u3', name: '开发者C', email: 'dev-c@company.com', tokens: 1800000, requests: 650, lastActiveAt: '2024-12-28T08:20:00Z' },
      { id: 'u4', name: '开发者D', email: 'dev-d@company.com', tokens: 1500000, requests: 520, lastActiveAt: '2024-12-27T17:30:00Z' },
      { id: 'u5', name: '开发者E', email: 'dev-e@company.com', tokens: 1200000, requests: 480, lastActiveAt: '2024-12-27T16:15:00Z' },
    ],
    recentLogs: [
      { id: 'log1', action: '模型配置变更', actor: '管理员', timestamp: '2024-12-28T10:00:00Z', details: '启用了 GPT-4 Turbo 模型' },
      { id: 'log2', action: '成员添加', actor: '管理员', timestamp: '2024-12-27T15:30:00Z', details: '添加了新成员 dev-f@company.com' },
      { id: 'log3', action: 'IP白名单更新', actor: '管理员', timestamp: '2024-12-26T11:20:00Z', details: '添加了 IP 段 10.0.0.0/24' },
      { id: 'log4', action: 'SSO配置更新', actor: '系统管理员', timestamp: '2024-12-25T09:00:00Z', details: '更新了 Azure SSO 配置' },
    ],
  };
};
