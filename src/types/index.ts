export interface Organization {
  id: string;
  name: string;
  domain: string;
  identitySource: 'wps365' | 'wecom' | null;
  subscription: {
    plan: 'trial' | 'starter' | 'professional' | 'enterprise';
    seats: number;
    usedSeats: number;
    trialDays: number;
    expiresAt: string;
  };
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role: 'admin' | 'member';
  source: 'sso' | 'manual';
  status: 'active' | 'inactive' | 'pending';
  lastActiveAt?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  memberCount: number;
  aiEnabled: boolean;
  allowedModels: string[];
  children?: Department[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon: string;
  description: string;
  enabled: boolean;
  rpmLimit: number;
  tpmLimit: number;
  currentRpm: number;
  currentTpm: number;
}

export interface IpRule {
  id: string;
  value: string;
  type: 'single' | 'cidr';
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  userName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  status: 'success' | 'error' | 'timeout';
  timestamp: string;
  prompt?: string;
  response?: string;
}

export interface UsageStats {
  totalTokens: number;
  totalRequests: number;
  activeUsers: number;
  avgLatency: number;
  successRate: number;
  dailyTrend: {
    date: string;
    tokens: number;
    requests: number;
  }[];
  modelDistribution: {
    model: string;
    tokens: number;
    percentage: number;
  }[];
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
}

export interface DiagnosticCheck {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}
