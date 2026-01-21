import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  Brain, 
  Plus, 
  Trash2, 
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Settings2,
  Check,
  RefreshCw,
  ExternalLink,
  Server,
  Plug,
  AlertCircle,
  Power,
  Globe,
  Coins,
  Star,
  CalendarIcon
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Mock data for current user
const currentUser = {
  id: 'user-001',
  name: '张三',
  email: 'zhangsan@company.com',
  department: '技术中心 / 前端开发组',
  avatar: '',
};

// Model price ratio - different models have different token prices (元/K tokens)
const modelPriceRatio: Record<string, { ratio: number; tier: 'standard' | 'premium' | 'basic' }> = {
  'Claude 3.5 Sonnet': { ratio: 0.12, tier: 'premium' },
  'GPT-4o': { ratio: 0.10, tier: 'premium' },
  'DeepSeek V3': { ratio: 0.02, tier: 'basic' },
  'Claude 3 Haiku': { ratio: 0.04, tier: 'standard' },
  'GPT-4o Mini': { ratio: 0.03, tier: 'standard' },
};

// Mock token usage data
const tokenUsage = {
  todayTokens: 40000,
  monthlyTokens: 328450,
  todayCost: 3.28, // cost consumed today (元)
  monthlyCost: 26.82, // cost consumed this month (元)
  totalQuota: 100.00, // total quota allocated (元)
  todayChange: -5.1, // percentage change from yesterday
  monthlyChange: 12.3, // percentage change from last month
};

// Helper function to calculate cost from tokens (元)
const calculateCost = (tokens: number, model: string): number => {
  const ratio = modelPriceRatio[model]?.ratio || 0.05;
  return Number(((tokens / 1000) * ratio).toFixed(4));
};

// Mock call details with date for filtering
const allCallDetails = [
  { id: '1', date: new Date(), time: '10:32:15', model: 'Claude 3.5 Sonnet', inputTokens: 1250, outputTokens: 3420, totalTokens: 4670, task: '代码审查 - UserService.java' },
  { id: '2', date: new Date(), time: '10:28:03', model: 'GPT-4o', inputTokens: 890, outputTokens: 2150, totalTokens: 3040, task: '单元测试生成 - AuthController' },
  { id: '3', date: new Date(), time: '10:15:42', model: 'Claude 3.5 Sonnet', inputTokens: 2100, outputTokens: 4800, totalTokens: 6900, task: 'API文档生成' },
  { id: '4', date: new Date(), time: '09:58:21', model: 'DeepSeek V3', inputTokens: 650, outputTokens: 1890, totalTokens: 2540, task: '代码补全 - utils.ts' },
  { id: '5', date: new Date(), time: '09:45:33', model: 'Claude 3.5 Sonnet', inputTokens: 1800, outputTokens: 5200, totalTokens: 7000, task: '重构建议 - PaymentModule' },
  { id: '6', date: new Date(), time: '09:32:18', model: 'GPT-4o', inputTokens: 720, outputTokens: 1650, totalTokens: 2370, task: 'Bug分析 - 订单状态异常' },
  { id: '7', date: new Date(), time: '09:18:55', model: 'Claude 3.5 Sonnet', inputTokens: 1450, outputTokens: 3800, totalTokens: 5250, task: '代码解释 - 算法实现' },
  { id: '8', date: new Date(), time: '09:05:12', model: 'DeepSeek V3', inputTokens: 980, outputTokens: 2250, totalTokens: 3230, task: 'SQL优化建议' },
  { id: '9', date: new Date(), time: '08:52:47', model: 'GPT-4o', inputTokens: 560, outputTokens: 1440, totalTokens: 2000, task: '错误日志分析' },
  { id: '10', date: new Date(), time: '08:38:29', model: 'Claude 3.5 Sonnet', inputTokens: 1100, outputTokens: 2900, totalTokens: 4000, task: '接口设计评审' },
  // Yesterday's data
  { id: '11', date: new Date(Date.now() - 86400000), time: '16:42:15', model: 'GPT-4o', inputTokens: 1800, outputTokens: 4200, totalTokens: 6000, task: '代码重构建议' },
  { id: '12', date: new Date(Date.now() - 86400000), time: '14:28:03', model: 'Claude 3.5 Sonnet', inputTokens: 950, outputTokens: 2850, totalTokens: 3800, task: '性能优化分析' },
  { id: '13', date: new Date(Date.now() - 86400000), time: '11:15:42', model: 'DeepSeek V3', inputTokens: 680, outputTokens: 1520, totalTokens: 2200, task: '数据库查询优化' },
  // 2 days ago
  { id: '14', date: new Date(Date.now() - 172800000), time: '15:32:18', model: 'Claude 3.5 Sonnet', inputTokens: 2200, outputTokens: 5800, totalTokens: 8000, task: 'API设计文档' },
  { id: '15', date: new Date(Date.now() - 172800000), time: '10:18:55', model: 'GPT-4o', inputTokens: 1100, outputTokens: 2900, totalTokens: 4000, task: '代码审查报告' },
].map(call => ({
  ...call,
  cost: calculateCost(call.totalTokens, call.model),
}));

// Mock skills data
const defaultSkills = [
  { id: 'skill-1', name: 'Code Review', description: '代码审查与优化建议', enabled: true, builtIn: true },
  { id: 'skill-2', name: 'Unit Test Generation', description: '自动生成单元测试', enabled: true, builtIn: true },
  { id: 'skill-3', name: 'Documentation', description: '代码文档生成', enabled: false, builtIn: true },
  { id: 'skill-4', name: 'Refactoring', description: '代码重构建议', enabled: true, builtIn: true },
  { id: 'skill-5', name: 'Security Scan', description: '安全漏洞检测', enabled: false, builtIn: true },
];

const customSkills = [
  { id: 'custom-1', name: 'React Best Practices', description: '基于公司React规范的代码优化', enabled: true, builtIn: false },
  { id: 'custom-2', name: 'API Design Helper', description: '符合RESTful规范的API设计助手', enabled: true, builtIn: false },
];

// Mock MCP servers data
const mcpServers = [
  { 
    id: 'mcp-1', 
    name: 'GitHub MCP', 
    description: '连接 GitHub 仓库，支持代码搜索、PR管理等功能',
    endpoint: 'https://mcp.github.com/v1',
    status: 'connected',
    lastSync: '2024-12-23 10:30',
    tools: ['search_code', 'create_pr', 'review_pr', 'list_issues'],
  },
  { 
    id: 'mcp-2', 
    name: 'Jira MCP', 
    description: '连接 Jira 项目管理，支持任务查询和创建',
    endpoint: 'https://mcp.atlassian.com/jira',
    status: 'connected',
    lastSync: '2024-12-23 09:15',
    tools: ['search_issues', 'create_issue', 'update_issue'],
  },
  { 
    id: 'mcp-3', 
    name: 'Confluence MCP', 
    description: '连接 Confluence 知识库，支持文档搜索和引用',
    endpoint: 'https://mcp.atlassian.com/confluence',
    status: 'disconnected',
    lastSync: null,
    tools: ['search_pages', 'get_page', 'create_page'],
  },
  { 
    id: 'mcp-4', 
    name: 'Database MCP', 
    description: '连接内部数据库，支持数据查询和分析',
    endpoint: 'https://internal.company.com/mcp/db',
    status: 'error',
    lastSync: '2024-12-22 14:00',
    tools: ['query', 'schema_info'],
    error: '认证已过期，请重新配置'
  },
];

export default function MyCli() {
  const [activeTab, setActiveTab] = useState('usage');
  const [skills, setSkills] = useState([...defaultSkills, ...customSkills]);
  const [mcpList, setMcpList] = useState(mcpServers);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddMcpOpen, setIsAddMcpOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', description: '' });
  const [newMcp, setNewMcp] = useState({ name: '', endpoint: '', description: '' });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter call details by selected date
  const filteredCallDetails = useMemo(() => {
    return allCallDetails.filter(call => 
      format(call.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  }, [selectedDate]);

  // Calculate today's data for cards
  const todayCallDetails = useMemo(() => {
    return allCallDetails.filter(call => isToday(call.date));
  }, []);

  const toggleSkill = (skillId: string) => {
    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const deleteSkill = (skillId: string) => {
    setSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const addSkill = () => {
    if (newSkill.name && newSkill.description) {
      setSkills(prev => [...prev, {
        id: `custom-${Date.now()}`,
        name: newSkill.name,
        description: newSkill.description,
        enabled: true,
        builtIn: false,
      }]);
      setNewSkill({ name: '', description: '' });
      setIsAddSkillOpen(false);
    }
  };

  const toggleMcpConnection = (mcpId: string) => {
    setMcpList(prev => prev.map(m => {
      if (m.id === mcpId) {
        if (m.status === 'connected') {
          return { ...m, status: 'disconnected', lastSync: null };
        } else {
          return { ...m, status: 'connected', lastSync: new Date().toLocaleString('zh-CN'), error: undefined };
        }
      }
      return m;
    }));
  };

  const deleteMcp = (mcpId: string) => {
    setMcpList(prev => prev.filter(m => m.id !== mcpId));
  };

  const addMcp = () => {
    if (newMcp.name && newMcp.endpoint) {
      setMcpList(prev => [...prev, {
        id: `mcp-${Date.now()}`,
        name: newMcp.name,
        endpoint: newMcp.endpoint,
        description: newMcp.description || '自定义 MCP 服务',
        status: 'disconnected',
        lastSync: null,
        tools: [],
      }]);
      setNewMcp({ name: '', endpoint: '', description: '' });
      setIsAddMcpOpen(false);
    }
  };

  const getStatusBadge = (status: string, error?: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            已连接
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
            <Power className="w-3 h-3 mr-1" />
            未连接
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            连接错误
          </Badge>
        );
      default:
        return null;
    }
  };

  // Calculate totals
  const todayTotalTokens = todayCallDetails.reduce((sum, call) => sum + call.totalTokens, 0);
  const todayTotalCost = todayCallDetails.reduce((sum, call) => sum + call.cost, 0);
  const filteredTotalTokens = filteredCallDetails.reduce((sum, call) => sum + call.totalTokens, 0);
  const filteredTotalCost = filteredCallDetails.reduce((sum, call) => sum + call.cost, 0);
  const costUsagePercent = tokenUsage.totalQuota > 0 ? (tokenUsage.monthlyCost / tokenUsage.totalQuota) * 100 : 0;
  const hasQuota = tokenUsage.totalQuota > 0;


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-sm font-semibold">{currentUser.name} 的 CLI</h1>
              <p className="text-xs text-muted-foreground">{currentUser.department}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="usage" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Token 用量
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Brain className="w-4 h-4" />
              Skills 配置
              <span className="status-badge status-badge-warning text-[10px] px-1 py-0">即将推出</span>
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-2">
              <Plug className="w-4 h-4" />
              MCP 管理
              <span className="status-badge status-badge-warning text-[10px] px-1 py-0">即将推出</span>
            </TabsTrigger>
          </TabsList>

          {/* Token Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            {/* Usage Overview - 2 Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Consumption Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    月累计消耗
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">¥{tokenUsage.monthlyCost.toFixed(2)}</span>
                        {hasQuota && (
                          <span className="text-sm text-muted-foreground">/ ¥{tokenUsage.totalQuota.toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">消费金额</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{(tokenUsage.monthlyTokens / 1000).toFixed(1)}K</div>
                      <p className="text-sm text-muted-foreground">Token 消耗</p>
                    </div>
                  </div>
                  <p className={`text-xs ${tokenUsage.monthlyChange < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    较上月 {tokenUsage.monthlyChange > 0 ? '+' : ''}{tokenUsage.monthlyChange}%
                  </p>
                </CardContent>
              </Card>

              {/* Today Consumption Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    当日消耗
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">¥{tokenUsage.todayCost.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">消费金额</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{(tokenUsage.todayTokens / 1000).toFixed(1)}K</div>
                      <p className="text-sm text-muted-foreground">Token 消耗</p>
                    </div>
                  </div>
                  <p className={`text-xs ${tokenUsage.todayChange < 0 ? 'text-green-600' : 'text-destructive'}`}>
                    较昨日 {tokenUsage.todayChange > 0 ? '+' : ''}{tokenUsage.todayChange}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Call Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      调用明细
                    </CardTitle>
                    <CardDescription>
                      {isToday(selectedDate) ? '今日' : format(selectedDate, 'M月d日', { locale: zhCN })}共 {filteredCallDetails.length} 次调用，消耗 {(filteredTotalTokens / 1000).toFixed(1)}K tokens / ¥{filteredTotalCost.toFixed(2)}
                    </CardDescription>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {isToday(selectedDate) ? '今日' : format(selectedDate, 'M月d日', { locale: zhCN })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => 
                          date > new Date() || 
                          date < startOfMonth(new Date())
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCallDetails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{format(selectedDate, 'M月d日', { locale: zhCN })}暂无调用记录</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">时间</TableHead>
                        <TableHead>模型</TableHead>
                        <TableHead className="text-right">输入</TableHead>
                        <TableHead className="text-right">输出</TableHead>
                        <TableHead className="text-right">Token</TableHead>
                        <TableHead className="text-right">费用（元）</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCallDetails.map((call) => (
                        <TableRow key={call.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{call.time}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {call.model}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{call.inputTokens.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{call.outputTokens.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{call.totalTokens.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium text-amber-600">¥{call.cost.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Configuration Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Skills 配置</h2>
                <span className="status-badge status-badge-warning mb-4">即将推出</span>
                <p className="text-muted-foreground text-center max-w-md">
                  Skills 配置功能正在开发中，即将上线。届时您可以启用或禁用 AI 助手的各项能力，以及添加自定义 Skills。
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCP Management Tab */}
          <TabsContent value="mcp" className="space-y-6">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <Plug className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">MCP 服务管理</h2>
                <span className="status-badge status-badge-warning mb-4">即将推出</span>
                <p className="text-muted-foreground text-center max-w-md">
                  MCP (Model Context Protocol) 服务管理功能正在开发中，即将上线。届时您可以连接和配置各种 MCP 服务，扩展 AI 助手的能力。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
