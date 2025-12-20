import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  Terminal,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Loader2,
  Shield,
  ExternalLink,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Step {
  id: string;
  title: string;
  subtitle: string;
}

const steps: Step[] = [
  { id: 'integration', title: '企业集成配置', subtitle: '第 1 步' },
  { id: 'confirm', title: '权益确认', subtitle: '第 2 步' },
];

interface DiagnosticItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
}

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [identitySource, setIdentitySource] = useState<'wps365' | 'wecom' | null>(null);
  const [config, setConfig] = useState({ appId: '', appKey: '' });
  const [showAppKey, setShowAppKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    { id: 'gateway', name: '身份源网关连通性', status: 'pending' },
    { id: 'credentials', name: 'App ID & Key凭证有效性', status: 'pending' },
    { id: 'redirect', name: 'Redirect URI 回调校验', status: 'pending' },
  ]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisComplete, setDiagnosisComplete] = useState(false);

  const redirectUri = 'https://api.ksgc.io/auth/callback';

  const handleCopyUri = async () => {
    await navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    toast({ title: '已复制回调地址' });
    setTimeout(() => setCopied(false), 2000);
  };

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosisComplete(false);
    
    for (let i = 0; i < diagnostics.length; i++) {
      setDiagnostics(prev => prev.map((d, idx) => 
        idx === i ? { ...d, status: 'running' } : d
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      setDiagnostics(prev => prev.map((d, idx) => 
        idx === i ? { ...d, status: 'success' } : d
      ));
    }
    
    setIsDiagnosing(false);
    setDiagnosisComplete(true);
  };

  const allChecksPassed = diagnostics.every(d => d.status === 'success');

  const canProceed = () => {
    if (currentStep === 0) {
      return identitySource && config.appId && config.appKey && diagnosisComplete && allChecksPassed;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !diagnosisComplete) {
      runDiagnostics();
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    toast({ 
      title: '开通成功！', 
      description: '欢迎使用 KSGC 企业级 AI 编程助手' 
    });
    navigate('/console');
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-slate-800 p-6 hidden md:flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Terminal className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-white">KSGC</span>
        </div>

        {/* Steps */}
        <div className="flex-1 space-y-2">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="flex items-start gap-4 py-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                  status === 'completed' && "bg-primary text-primary-foreground",
                  status === 'current' && "bg-primary text-primary-foreground",
                  status === 'pending' && "bg-slate-600 text-slate-400"
                )}>
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div>
                  <p className={cn(
                    "text-xs",
                    status === 'pending' ? "text-slate-500" : "text-slate-400"
                  )}>
                    {step.subtitle}
                  </p>
                  <p className={cn(
                    "font-medium",
                    status === 'pending' ? "text-slate-500" : "text-white"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="bg-slate-700/50 rounded-xl p-4 mt-auto">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">安全集成标准</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            通过连接身份源实现 SSO 接入，系统将自动同步企业架构信息。我们严格遵守 GDPR 数据脱敏标准，仅拉取授权范围内的成员数据。
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8 md:p-12 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Integration Config */}
            {currentStep === 0 && (
              <div className="animate-fade-in">
                {/* Title */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h1 className="text-xl font-semibold text-foreground">配置集成信息</h1>
                </div>

                {/* Verified Company */}
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">已验证企业</p>
                      <p className="font-medium text-foreground">北京智码云科技有限公司</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">官方实名</span>
                  </div>
                </div>

                {/* Identity Source Selection */}
                <div className="mb-6">
                  <Label className="text-sm text-foreground mb-3 block">选择连接身份源</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIdentitySource('wps365')}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        identitySource === 'wps365'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">W</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">WPS 365</p>
                          <p className="text-xs text-muted-foreground">金山办公集成</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setIdentitySource('wecom')}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        identitySource === 'wecom'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-600 font-bold text-sm">We</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">企业微信</p>
                          <p className="text-xs text-muted-foreground">通讯录集成</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Notice */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                  <p className="text-sm text-primary">
                    配置后，系统将以此进行成员信息认证和企业架构同步。请确保在开放平台已授予相应权限。
                    <a href="#" className="inline-flex items-center gap-1 ml-2 font-medium hover:underline">
                      查看操作文档 <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                {/* Config Inputs */}
                {identitySource && (
                  <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                      <Label htmlFor="appId">App ID</Label>
                      <Input
                        id="appId"
                        placeholder="请输入应用 ID"
                        value={config.appId}
                        onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appKey">App Key</Label>
                      <div className="relative">
                        <Input
                          id="appKey"
                          type={showAppKey ? 'text' : 'password'}
                          placeholder="请输入应用密钥"
                          value={config.appKey}
                          onChange={(e) => setConfig(prev => ({ ...prev, appKey: e.target.value }))}
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAppKey(!showAppKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showAppKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="redirectUri">Redirect URI (回调地址)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="redirectUri"
                          value={redirectUri}
                          readOnly
                          className="flex-1 bg-muted"
                        />
                        <Button
                          variant="outline"
                          onClick={handleCopyUri}
                          className="shrink-0 gap-2"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          复制
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostics */}
                {identitySource && config.appId && config.appKey && (
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">集成连接诊断</span>
                      {diagnosisComplete && allChecksPassed && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          测试全部通过
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {diagnostics.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.status === 'pending' && (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                          {item.status === 'running' && (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          )}
                          {item.status === 'success' && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          {item.status === 'error' && (
                            <div className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">!</div>
                          )}
                          <span className={cn(
                            "text-sm",
                            item.status === 'success' ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Confirm */}
            {currentStep === 1 && (
              <div className="animate-fade-in text-center py-8">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-primary" />
                </div>

                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  账户已成功关联身份源。点击下方"开始试用"按钮即可进入控制台，即刻开启 AI 赋能的研发体验。
                </p>

                {/* Subscription Details */}
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="text-muted-foreground">订阅版本</span>
                    <span className="font-semibold text-primary">高级版 (Enterprise)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="text-muted-foreground">团队席位</span>
                    <span className="font-semibold text-foreground">50 个授权席位</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="text-muted-foreground">试用有效期</span>
                    <div className="text-right">
                      <span className="font-semibold text-foreground">7 天试用期</span>
                      <p className="text-xs text-primary">有效期至 2025-12-27</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6 bg-card">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentStep === 0) {
                  navigate('/');
                } else {
                  setCurrentStep(prev => prev - 1);
                }
              }}
            >
              {currentStep === 0 ? '返回' : '取消'}
            </Button>
            
            {currentStep === 0 && (
              <Button 
                onClick={handleNext}
                disabled={!identitySource || !config.appId || !config.appKey || isDiagnosing}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isDiagnosing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    诊断中...
                  </>
                ) : diagnosisComplete && allChecksPassed ? (
                  <>
                    进入下一步
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    进入下一步
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}

            {currentStep === 1 && (
              <Button 
                onClick={handleComplete}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                开始试用
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
