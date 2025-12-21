import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight, Copy, Check, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const features = [
  {
    icon: Terminal,
    title: '命令行优先',
    description: '以 CLI 形态深度集成企业开发流程，无需依赖特定 IDE'
  },
  {
    icon: Shield,
    title: '企业级安全',
    description: 'SSO 身份集成、IP 白名单、完整审计日志'
  },
  {
    icon: Users,
    title: '组织管理',
    description: '自动同步企业架构，精细化权限控制'
  },
  {
    icon: BarChart3,
    title: '用量可观测',
    description: '全面的 Token 消耗统计与成本分析'
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const cliCommand = 'curl -sL ksgc.io | bash';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    toast({ title: '已复制到剪贴板' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">KSGC</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              产品特性
            </a>
            <a href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              CLI 文档
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              定价
            </a>
            <a href="#cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              企业案例
            </a>
          </nav>

          <Button 
            variant="ghost" 
            onClick={() => navigate('/console')}
            className="text-sm font-medium"
          >
            登录控制台
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 text-center">
          {/* Version Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">KSGC CLI v2.5.0 正式发布</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            企业级 AI 智能
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-8">
            CLI 编程助手
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            以命令行工具 (CLI) 形态深度集成企业开发流程。无需依赖特定 IDE，在终端即可完成代码补全、重构与漏洞扫描。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* CLI Command Button */}
            <button
              onClick={handleCopy}
              className="group flex items-center gap-3 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-100 font-mono text-sm transition-colors"
            >
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>{cliCommand}</span>
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
              )}
            </button>

            {/* Trial Button */}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="gap-2 px-8"
            >
              开通试用
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              为企业研发团队打造
            </h2>
            <p className="text-muted-foreground">
              专业、安全、可控的 AI 编程助手解决方案
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              立即开始企业级 AI 编程之旅
            </h2>
            <p className="text-muted-foreground mb-8">
              免费试用 7 天，体验 AI 驱动的高效研发流程
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/onboarding')}
                className="gap-2 px-8"
              >
                开通试用
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/console')}
              >
                已有账号？登录控制台
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">KSGC</span>
              <span className="text-sm text-muted-foreground">企业级 AI CLI 编程助手</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 北京智码云科技有限公司 · 京ICP备XXXXXXXX号
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
