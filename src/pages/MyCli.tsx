import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Zap, 
  Brain, 
  BookOpen, 
  Plus, 
  Trash2, 
  Upload,
  FileText,
  FolderOpen,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Settings2,
  Check,
  X,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// Mock knowledge base data
const knowledgeItems = [
  { id: 'kb-1', name: '前端开发规范.md', type: 'markdown', size: '24 KB', uploadedAt: '2024-12-15', status: 'indexed' },
  { id: 'kb-2', name: 'API接口文档.pdf', type: 'pdf', size: '1.2 MB', uploadedAt: '2024-12-18', status: 'indexed' },
  { id: 'kb-3', name: '项目架构说明', type: 'folder', size: '156 KB', uploadedAt: '2024-12-20', status: 'indexed' },
  { id: 'kb-4', name: '组件库使用指南.docx', type: 'docx', size: '89 KB', uploadedAt: '2024-12-22', status: 'processing' },
];

export default function MyCli() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usage');
  const [skills, setSkills] = useState([...defaultSkills, ...customSkills]);
  const [knowledge, setKnowledge] = useState(knowledgeItems);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', description: '' });

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

  const deleteKnowledge = (id: string) => {
    setKnowledge(prev => prev.filter(k => k.id !== id));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <FolderOpen className="w-4 h-4 text-amber-500" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const usagePercentage = (tokenUsage.used / tokenUsage.total) * 100;
  const maxDailyTokens = Math.max(...tokenUsage.dailyUsage.map(d => d.tokens));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4 px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/console')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回控制台
          </Button>
          <Separator orientation="vertical" className="h-6" />
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
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="w-4 h-4" />
              知识库
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

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">个人知识库</h2>
                <p className="text-sm text-muted-foreground">上传文档让 AI 助手更好地理解您的工作上下文</p>
              </div>
              <Dialog open={isAddKnowledgeOpen} onOpenChange={setIsAddKnowledgeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    上传文档
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>上传知识库文档</DialogTitle>
                    <DialogDescription>
                      支持 Markdown、PDF、Word、文件夹等格式
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-8">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium">点击或拖拽文件到此处</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 .md, .pdf, .docx, .txt 等格式</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddKnowledgeOpen(false)}>取消</Button>
                    <Button onClick={() => setIsAddKnowledgeOpen(false)}>上传</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Knowledge Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>文档总数</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{knowledge.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>已索引</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {knowledge.filter(k => k.status === 'indexed').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>处理中</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    {knowledge.filter(k => k.status === 'processing').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Knowledge List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">文档列表</CardTitle>
              </CardHeader>
              <CardContent>
                {knowledge.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">知识库为空</p>
                    <p className="text-xs mt-1">上传文档来增强 AI 助手的上下文理解能力</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>文件名</TableHead>
                        <TableHead>大小</TableHead>
                        <TableHead>上传时间</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {knowledge.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getFileIcon(item.type)}
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.size}</TableCell>
                          <TableCell className="text-muted-foreground">{item.uploadedAt}</TableCell>
                          <TableCell>
                            {item.status === 'indexed' ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                <Check className="w-3 h-3 mr-1" />
                                已索引
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                处理中
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteKnowledge(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">知识库使用提示</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 上传项目文档、规范文档可以让 AI 更好地理解项目上下文</li>
                      <li>• 支持 Markdown、PDF、Word 等多种格式</li>
                      <li>• 文档索引完成后会自动应用到 AI 对话中</li>
                      <li>• 建议定期更新知识库以保持信息最新</li>
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
