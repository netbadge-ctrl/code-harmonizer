import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Globe
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

// Mock token usage data
const tokenUsage = {
  total: 500000,
  used: 328450,
  remaining: 171550,
  dailyUsage: [
    { date: '12-17', tokens: 45200 },
    { date: '12-18', tokens: 52300 },
    { date: '12-19', tokens: 38900 },
    { date: '12-20', tokens: 61200 },
    { date: '12-21', tokens: 48700 },
    { date: '12-22', tokens: 42150 },
    { date: '12-23', tokens: 40000 },
  ],
  modelBreakdown: [
    { model: 'Claude 3.5 Sonnet', tokens: 156000, percentage: 47.5 },
    { model: 'GPT-4o', tokens: 98200, percentage: 29.9 },
    { model: 'DeepSeek V3', tokens: 74250, percentage: 22.6 },
  ],
};

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

  const usagePercentage = (tokenUsage.used / tokenUsage.total) * 100;
  const maxDailyTokens = Math.max(...tokenUsage.dailyUsage.map(d => d.tokens));

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
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-2">
              <Plug className="w-4 h-4" />
              MCP 管理
            </TabsTrigger>
          </TabsList>

          {/* Token Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            {/* Usage Overview Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    本月总配额
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(tokenUsage.total / 1000).toFixed(0)}K</div>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    已使用
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{(tokenUsage.used / 1000).toFixed(1)}K</div>
                  <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% 已用</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    剩余配额
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{(tokenUsage.remaining / 1000).toFixed(1)}K</div>
                  <p className="text-xs text-muted-foreground">预计可用至月底</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    今日消耗
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(tokenUsage.dailyUsage[tokenUsage.dailyUsage.length - 1].tokens / 1000).toFixed(1)}K</div>
                  <p className="text-xs text-muted-foreground">较昨日 -5.1%</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">配额使用进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={usagePercentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>已用 {(tokenUsage.used / 1000).toFixed(1)}K tokens</span>
                  <span>总配额 {(tokenUsage.total / 1000).toFixed(0)}K tokens</span>
                </div>
              </CardContent>
            </Card>

            {/* Daily Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">近7天使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {tokenUsage.dailyUsage.map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary/20 rounded-t relative group cursor-pointer hover:bg-primary/30 transition-colors"
                        style={{ height: `${(day.tokens / maxDailyTokens) * 100}%`, minHeight: '20px' }}
                      >
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-t transition-all"
                          style={{ height: `${(day.tokens / maxDailyTokens) * 100}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {(day.tokens / 1000).toFixed(1)}K
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Model Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">模型使用分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenUsage.modelBreakdown.map((model) => (
                    <div key={model.model} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{model.model}</span>
                        <span className="text-muted-foreground">{(model.tokens / 1000).toFixed(1)}K ({model.percentage}%)</span>
                      </div>
                      <Progress value={model.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Configuration Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Skills 配置</h2>
                <p className="text-sm text-muted-foreground">启用或禁用 AI 助手的各项能力</p>
              </div>
              <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    添加自定义 Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加自定义 Skill</DialogTitle>
                    <DialogDescription>
                      创建一个新的自定义 Skill 来扩展 AI 助手的能力
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="skill-name">Skill 名称</Label>
                      <Input 
                        id="skill-name" 
                        placeholder="例如：Code Style Checker"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skill-desc">描述</Label>
                      <Textarea 
                        id="skill-desc" 
                        placeholder="描述这个 Skill 的功能..."
                        value={newSkill.description}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>取消</Button>
                    <Button onClick={addSkill}>添加</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Built-in Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  内置 Skills
                </CardTitle>
                <CardDescription>系统预置的标准能力</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.filter(s => s.builtIn).map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${skill.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Brain className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{skill.name}</div>
                          <div className="text-xs text-muted-foreground">{skill.description}</div>
                        </div>
                      </div>
                      <Switch 
                        checked={skill.enabled} 
                        onCheckedChange={() => toggleSkill(skill.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  自定义 Skills
                </CardTitle>
                <CardDescription>您创建的个性化能力</CardDescription>
              </CardHeader>
              <CardContent>
                {skills.filter(s => !s.builtIn).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">还没有自定义 Skill</p>
                    <p className="text-xs mt-1">点击上方按钮添加您的第一个自定义 Skill</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skills.filter(s => !s.builtIn).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${skill.enabled ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {skill.name}
                              <Badge variant="outline" className="text-xs">自定义</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{skill.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={skill.enabled} 
                            onCheckedChange={() => toggleSkill(skill.id)}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteSkill(skill.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCP Management Tab */}
          <TabsContent value="mcp" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">MCP 服务管理</h2>
                <p className="text-sm text-muted-foreground">配置 Model Context Protocol 服务连接</p>
              </div>
              <Dialog open={isAddMcpOpen} onOpenChange={setIsAddMcpOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    添加 MCP 服务
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加 MCP 服务</DialogTitle>
                    <DialogDescription>
                      连接新的 MCP 服务以扩展 AI 助手的能力
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="mcp-name">服务名称</Label>
                      <Input 
                        id="mcp-name" 
                        placeholder="例如：Notion MCP"
                        value={newMcp.name}
                        onChange={(e) => setNewMcp(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mcp-endpoint">服务端点</Label>
                      <Input 
                        id="mcp-endpoint" 
                        placeholder="https://mcp.example.com/v1"
                        value={newMcp.endpoint}
                        onChange={(e) => setNewMcp(prev => ({ ...prev, endpoint: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mcp-desc">描述（可选）</Label>
                      <Textarea 
                        id="mcp-desc" 
                        placeholder="描述这个 MCP 服务的功能..."
                        value={newMcp.description}
                        onChange={(e) => setNewMcp(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMcpOpen(false)}>取消</Button>
                    <Button onClick={addMcp}>添加</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* MCP Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    服务总数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mcpList.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    已连接
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mcpList.filter(m => m.status === 'connected').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    需要关注
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    {mcpList.filter(m => m.status === 'error').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MCP List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">MCP 服务列表</CardTitle>
              </CardHeader>
              <CardContent>
                {mcpList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Plug className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">还没有配置 MCP 服务</p>
                    <p className="text-xs mt-1">添加 MCP 服务来扩展 AI 助手的能力</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mcpList.map((mcp) => (
                      <div key={mcp.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              mcp.status === 'connected' ? 'bg-green-500/10 text-green-600' : 
                              mcp.status === 'error' ? 'bg-destructive/10 text-destructive' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              <Server className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{mcp.name}</span>
                                {getStatusBadge(mcp.status, mcp.error)}
                              </div>
                              <p className="text-sm text-muted-foreground">{mcp.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Globe className="w-3 h-3" />
                                <span>{mcp.endpoint}</span>
                              </div>
                              {mcp.lastSync && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <RefreshCw className="w-3 h-3" />
                                  <span>上次同步: {mcp.lastSync}</span>
                                </div>
                              )}
                              {mcp.error && (
                                <div className="flex items-center gap-2 text-xs text-destructive">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{mcp.error}</span>
                                </div>
                              )}
                              {mcp.tools.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {mcp.tools.map((tool) => (
                                    <Badge key={tool} variant="secondary" className="text-xs">
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant={mcp.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => toggleMcpConnection(mcp.id)}
                            >
                              {mcp.status === 'connected' ? '断开连接' : '连接'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteMcp(mcp.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Plug className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">MCP 使用提示</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• MCP (Model Context Protocol) 是一种标准协议，用于连接外部服务和工具</li>
                      <li>• 连接 MCP 服务后，AI 助手可以访问对应的工具和数据</li>
                      <li>• 支持 GitHub、Jira、Confluence 等常见开发工具的 MCP 服务</li>
                      <li>• 如遇连接问题，请检查服务端点和认证信息是否正确</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
