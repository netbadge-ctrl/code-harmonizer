import React, { useState } from 'react';
import { Users, ArrowRight, CheckCircle2, AlertCircle, TrendingUp, Building2, Copy, Check, Shield, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockMembers, mockModels } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { SubscriptionUpgradeDialog } from '@/components/subscription/SubscriptionUpgradeDialog';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';

// 生成当日5分钟间隔的趋势数据
const generateTrendData = () => {
  const data = [];
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  
  for (let i = 0; i <= 288; i++) { // 24小时 * 12个5分钟 = 288个点
    const time = new Date(startOfDay.getTime() + i * 5 * 60 * 1000);
    if (time > now) break;
    
    const hour = time.getHours();
    // 模拟真实的调用模式：凌晨低，工作时间高
    const baseValue = hour >= 9 && hour <= 18 ? 50 : hour >= 6 && hour <= 22 ? 20 : 5;
    const randomFactor = Math.random() * 30;
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
      requests: Math.floor(baseValue + randomFactor),
      tokens: Math.floor((baseValue + randomFactor) * 150 + Math.random() * 500),
      activeUsers: Math.floor((baseValue + randomFactor) / 10 + Math.random() * 3),
    });
  }
  return data;
};

const trendData = generateTrendData();
export function DashboardView() {
  const [copied, setCopied] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // 模拟实时调用数据
  const realtimeCalls = [
    { user: '张明', model: 'Kimi', tokens: 1250, time: '刚刚', status: 'success' },
    { user: '李华', model: 'Qwen 2.5', tokens: 3420, time: '2分钟前', status: 'success' },
    { user: '王芳', model: 'DeepSeek', tokens: 890, time: '5分钟前', status: 'success' },
    { user: '陈强', model: 'Kimi', tokens: 0, time: '8分钟前', status: 'error' },
    { user: '刘洋', model: 'Qwen 2.5', tokens: 2150, time: '12分钟前', status: 'success' },
  ];

  // 模拟组织数据
  const organization = {
    name: 'TechFlow Inc.',
    subscription: {
      plan: 'professional' as const,
      seats: 50,
      usedSeats: 5,
      expiresAt: '2024-12-31',
      isTrial: true, // 是否为试用状态
    },
    identitySource: 'wecom' as const,
    orgSlug: 'techflow',
  };

  const cliCommand = `curl -fsSL https://get.ksgc.io/install.sh | bash -s -- --org=${organization.orgSlug} --auth=${organization.identitySource}`;

  const handleCopyCliCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    toast({ title: 'CLI 安装命令已复制' });
    setTimeout(() => setCopied(false), 2000);
  };

  const planLabels: Record<string, string> = {
    trial: '试用版',
    starter: '基础版',
    professional: '专业版',
    enterprise: '企业版',
  };

  const seatUsagePercent = (organization.subscription.usedSeats / organization.subscription.seats) * 100;

  return (
    <>
    <div className="space-y-6 animate-fade-in">
      {/* Organization Header */}
      <div className="enterprise-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Organization Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">{organization.name}</h2>
                <span className="status-badge status-badge-success">
                  {planLabels[organization.subscription.plan]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                有效期至: {organization.subscription.expiresAt}
                {organization.subscription.isTrial && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    试用中
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Seat Usage */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">订阅席位使用情况</p>
              <div className="flex items-center gap-3">
                <Progress value={seatUsagePercent} className="w-32 h-2" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {organization.subscription.usedSeats} / {organization.subscription.seats} 人
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowUpgradeDialog(true)}>
              订阅管理 / 扩容
            </Button>
          </div>
        </div>

        {/* CLI Installation Command */}
        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            员工终端安装命令 (Mac/Linux)
          </p>
          <div className="flex items-center justify-between gap-4">
            <code className="text-sm text-amber-400 font-mono flex-1 overflow-x-auto whitespace-nowrap">
              {cliCommand}
            </code>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyCliCommand}
              className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 数据概览 - 当日数据 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 本日活跃用户 */}
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">本日活跃用户</p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">2</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive">-96%</span>
              <span className="text-xs text-muted-foreground ml-1">相较昨日</span>
            </div>
          </div>
        </Card>

        {/* 本日Token量 */}
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">本日Token量</p>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">2.06M</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success">+3064%</span>
              <span className="text-xs text-muted-foreground ml-1">相较昨日</span>
            </div>
          </div>
        </Card>

        {/* 本日请求次数 */}
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">本日请求次数</p>
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-warning" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">121</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive">-78.59%</span>
              <span className="text-xs text-muted-foreground ml-1">相较昨日</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 当日数据趋势图 */}
        <div className="lg:col-span-2 enterprise-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              当日数据趋势
              <span className="text-xs text-muted-foreground font-normal">(每5分钟)</span>
            </h3>
          </div>
          <div className="p-4">
            {/* 图例 */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs text-muted-foreground">活跃用户</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-xs text-muted-foreground">Token量 (K)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-xs text-muted-foreground">调用次数</span>
              </div>
            </div>
            <ChartContainer 
              config={{
                activeUsers: { label: "活跃用户", color: "hsl(var(--primary))" },
                tokens: { label: "Token量 (K)", color: "hsl(var(--success))" },
                requests: { label: "调用次数", color: "hsl(var(--warning))" },
              }}
              className="h-[280px] w-full"
            >
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval={23} // 每2小时显示一个标签
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  width={40}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  width={50}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number, name: string) => {
                    if (name === 'tokens') return [`${(value / 1000).toFixed(1)}K`, 'Token量'];
                    if (name === 'activeUsers') return [value, '活跃用户'];
                    if (name === 'requests') return [value, '调用次数'];
                    return [value, name];
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="requests" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        {/* 实时调用监控 */}
        <div className="enterprise-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
              实时调用监控
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {realtimeCalls.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{item.user[0]}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.user}</span>
                      <p className="text-xs text-muted-foreground">{item.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-mono ${item.tokens > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.tokens > 0 ? item.tokens.toLocaleString() : '-'}
                    </span>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                      {item.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 text-success" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '添加成员', desc: '邀请新成员加入团队', icon: Users, color: 'bg-primary' },
          { title: '查看用量', desc: '分析 Token 消耗趋势', icon: TrendingUp, color: 'bg-success' },
          { title: '安全配置', desc: '管理 IP 白名单规则', icon: Shield, color: 'bg-warning' },
        ].map((action, index) => (
          <button 
            key={index}
            className="enterprise-card p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">{action.title}</p>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>

      <SubscriptionUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentPlan="professional"
        currentSeats={organization.subscription.seats}
      />
    </>
  );
}
