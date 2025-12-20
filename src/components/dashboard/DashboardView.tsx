import React from 'react';
import { Users, Zap, Activity, Clock, ArrowRight, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Button } from '@/components/ui/button';
import { mockUsageStats, mockMembers, mockModels } from '@/data/mockData';

export function DashboardView() {
  const activeMembers = mockMembers.filter(m => m.status === 'active').length;
  const enabledModels = mockModels.filter(m => m.enabled).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="enterprise-card p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">欢迎回来，张明 👋</h2>
            <p className="text-muted-foreground mt-1">您的团队今日表现出色，AI 助手已帮助完成 128 次代码协助</p>
          </div>
          <Button className="hidden md:flex gap-2">
            查看详情 <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="活跃成员"
          value={activeMembers}
          change={12}
          changeLabel="较昨日"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="今日 Token 消耗"
          value={`${(mockUsageStats.totalTokens / 1000000).toFixed(1)}M`}
          change={8}
          changeLabel="较昨日"
          icon={Zap}
          trend="up"
        />
        <StatsCard
          title="平均响应时间"
          value={`${mockUsageStats.avgLatency}s`}
          change={-5}
          changeLabel="较昨日"
          icon={Clock}
          trend="up"
        />
        <StatsCard
          title="成功率"
          value={`${mockUsageStats.successRate}%`}
          change={0.5}
          changeLabel="较昨日"
          icon={Activity}
          trend="up"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 enterprise-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">实时调用监控</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { user: '张明', model: 'Kimi', action: '代码优化', time: '刚刚', status: 'success' },
              { user: '李华', model: 'Qwen 2.5', action: '文档生成', time: '2分钟前', status: 'success' },
              { user: '王芳', model: 'DeepSeek', action: '代码补全', time: '5分钟前', status: 'success' },
              { user: '陈强', model: 'Kimi', action: '问题解答', time: '8分钟前', status: 'error' },
              { user: '刘洋', model: 'Qwen 2.5', action: '代码审查', time: '12分钟前', status: 'success' },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{item.user[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.user}</p>
                    <p className="text-xs text-muted-foreground">{item.action} · {item.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Status */}
        <div className="enterprise-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">模型状态</h3>
          </div>
          <div className="p-4 space-y-4">
            {mockModels.slice(0, 4).map((model) => (
              <div key={model.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{model.icon}</span>
                    <span className="text-sm font-medium text-foreground">{model.name}</span>
                  </div>
                  <span className={`status-badge ${model.enabled ? 'status-badge-success' : 'status-badge-neutral'}`}>
                    {model.enabled ? '运行中' : '已停用'}
                  </span>
                </div>
                {model.enabled && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>RPM: {model.currentRpm}/{model.rpmLimit}</span>
                      <span>{Math.round(model.currentRpm / model.rpmLimit * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(model.currentRpm / model.rpmLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '添加成员', desc: '邀请新成员加入团队', icon: Users, color: 'bg-primary' },
          { title: '查看用量', desc: '分析 Token 消耗趋势', icon: TrendingUp, color: 'bg-success' },
          { title: '安全配置', desc: '管理 IP 白名单规则', icon: Activity, color: 'bg-warning' },
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
  );
}
