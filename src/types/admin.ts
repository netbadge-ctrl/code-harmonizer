// 管理后台类型定义

export interface Customer {
  id: string;
  companyName: string;
  customerCode: string; // 客户识别码
  clientVersion: string; // 客户端版本
  serverVersion: string; // 服务端版本
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // 订阅信息
  subscription: {
    plan: 'starter' | 'professional'; // 基础版 | 专业版
    status: 'trial' | 'active' | 'expired'; // 试用 | 正常 | 已过期
    billingType: 'prepaid' | 'postpaid';
    startDate: string;
    expiresAt: string;
    seats: number;
    usedSeats: number;
  };
  
  // 认证配置
  authConfig: {
    enterpriseAuthMethod: 'wps365' | 'wecom' | 'dingtalk' | 'feishu' | 'none';
    ipWhitelistEnabled: boolean;
    ipWhitelist: string[];
  };
  
  // 开通的模型列表
  enabledModels: string[];
  
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
    successfulRequests: number; // 成功请求数
    percentage: number; // Token占比
    avgInputLatencyPer1KToken: number;  // 千token输入平均时长(ms)
    avgOutputLatencyPer1KToken: number; // 千token输出平均时长(ms)
  }[];
  
  // 模型时延趋势数据（分钟粒度）
  modelLatencyTrend: {
    timestamp: string; // 分钟级时间戳，如 "2024-12-28 10:05"
    model: string;
    avgInputLatency: number;
    avgOutputLatency: number;
  }[];
  
  // 每日使用趋势
  dailyUsage: {
    date: string;
    tokens: number;
    requests: number;
    activeUsers: number;
  }[];
  
  // 调用失败详情
  callFailures: {
    id: string;
    timestamp: string;
    model: string;
    errorCode: string;
    errorMessage: string;
    requestId: string;
    userId: string;
    userName: string;
  }[];
  
  // 错误码分布
  errorCodeDistribution: {
    errorCode: string;
    errorName: string;
    count: number;
    percentage: number;
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
  
  // 云服务监控数据
  cloudServices: {
    slb: {
      ip: string;
      activeConnections: number;
      maxConnections: number;
      healthyBackendCount: number;
      totalBackendCount: number;
      packetLossRate: number;
      errorCount: number;
      inboundBandwidth: number; // Mbps
      outboundBandwidth: number; // Mbps
      maxBandwidth: number; // Mbps
    };
    servers: {
      id: number;
      ip: string;
      status: 'healthy' | 'unhealthy' | 'warning';
      cpuUser: number; // 百分比
      cpuSystem: number; // 百分比
      memoryAvailable: number; // GB
      memoryTotal: number; // GB
      loadAverage: [number, number, number]; // 1min, 5min, 15min
      diskReadSpeed: number; // MB/s
      diskWriteSpeed: number; // MB/s
      diskIoWait: number; // 百分比
      diskUsageRoot: number; // 百分比
      diskUsageLogs: number; // 百分比
      networkInbound: number; // Mbps
      networkOutbound: number; // Mbps
    }[];
    database: {
      ip: string;
      currentConnections: number;
      maxConnections: number;
      qps: number;
      tps: number;
      slowQueriesPerMinute: number;
      replicationLag: number; // 秒
      iopsRead: number;
      iopsWrite: number;
    };
    elasticsearch: {
      ip: string;
      queryLatency: number; // ms
      writeLatency: number; // ms
      diskUsage: number; // 百分比
      diskTotal: number; // GB
      diskUsed: number; // GB
    };
  };
}

export type AdminView = 'customers' | 'customerDetail' | 'analytics' | 'creditRatio' | 'settings';
