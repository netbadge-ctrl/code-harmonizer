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
  todayTokens: 40000,
  monthlyTokens: 328450,
  todayChange: -5.1, // percentage change from yesterday
  monthlyChange: 12.3, // percentage change from last month
};

// Mock today's call details
const todayCallDetails = [
  { id: '1', time: '10:32:15', model: 'Claude 3.5 Sonnet', inputTokens: 1250, outputTokens: 3420, totalTokens: 4670, task: '代码审查 - UserService.java' },
  { id: '2', time: '10:28:03', model: 'GPT-4o', inputTokens: 890, outputTokens: 2150, totalTokens: 3040, task: '单元测试生成 - AuthController' },
  { id: '3', time: '10:15:42', model: 'Claude 3.5 Sonnet', inputTokens: 2100, outputTokens: 4800, totalTokens: 6900, task: 'API文档生成' },
  { id: '4', time: '09:58:21', model: 'DeepSeek V3', inputTokens: 650, outputTokens: 1890, totalTokens: 2540, task: '代码补全 - utils.ts' },
  { id: '5', time: '09:45:33', model: 'Claude 3.5 Sonnet', inputTokens: 1800, outputTokens: 5200, totalTokens: 7000, task: '重构建议 - PaymentModule' },
  { id: '6', time: '09:32:18', model: 'GPT-4o', inputTokens: 720, outputTokens: 1650, totalTokens: 2370, task: 'Bug分析 - 订单状态异常' },
  { id: '7', time: '09:18:55', model: 'Claude 3.5 Sonnet', inputTokens: 1450, outputTokens: 3800, totalTokens: 5250, task: '代码解释 - 算法实现' },
  { id: '8', time: '09:05:12', model: 'DeepSeek V3', inputTokens: 980, outputTokens: 2250, totalTokens: 3230, task: 'SQL优化建议' },
  { id: '9', time: '08:52:47', model: 'GPT-4o', inputTokens: 560, outputTokens: 1440, totalTokens: 2000, task: '错误日志分析' },
  { id: '10', time: '08:38:29', model: 'Claude 3.5 Sonnet', inputTokens: 1100, outputTokens: 2900, totalTokens: 4000, task: '接口设计评审' },
];

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

  // Calculate total tokens from today's calls
  const todayTotalFromCalls = todayCallDetails.reduce((sum, call) => sum + call.totalTokens, 0);

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
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    今日 Token 消耗
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(tokenUsage.todayTokens / 1000).toFixed(1)}K</div>
                  <p className={`text-xs ${tokenUsage.todayChange < 0 ? 'text-green-600' : 'text-destructive'}`}>
                    较昨日 {tokenUsage.todayChange > 0 ? '+' : ''}{tokenUsage.todayChange}%
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    月累计消耗
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{(tokenUsage.monthlyTokens / 1000).toFixed(1)}K</div>
                  <p className={`text-xs ${tokenUsage.monthlyChange < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    较上月 {tokenUsage.monthlyChange > 0 ? '+' : ''}{tokenUsage.monthlyChange}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Call Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  今日调用明细
                </CardTitle>
                <CardDescription>
                  共 {todayCallDetails.length} 次调用，消耗 {(todayTotalFromCalls / 1000).toFixed(1)}K tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">时间</TableHead>
                      <TableHead>模型</TableHead>
                      <TableHead className="text-right">输入</TableHead>
                      <TableHead className="text-right">输出</TableHead>
                      <TableHead className="text-right">合计</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayCallDetails.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{call.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {call.model}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{call.inputTokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{call.outputTokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">{call.totalTokens.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
