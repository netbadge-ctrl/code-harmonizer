import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Link2,
  TestTube,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { OnboardingStep, DiagnosticCheck } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const steps: OnboardingStep[] = [
  { id: 'identity', title: '身份源配置', description: '选择并集成企业身份源', status: 'current' },
  { id: 'diagnostic', title: '连接诊断', description: '验证配置和连接状态', status: 'pending' },
  { id: 'confirm', title: '权益确认', description: '确认订阅方案和席位', status: 'pending' },
];

const diagnosticChecks: DiagnosticCheck[] = [
  { id: 'gateway', name: '网关连通性', status: 'pending' },
  { id: 'credentials', name: '凭证有效性', status: 'pending' },
  { id: 'permissions', name: 'API 权限', status: 'pending' },
  { id: 'sync', name: '数据同步测试', status: 'pending' },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [identitySource, setIdentitySource] = useState<'wps365' | 'wecom' | null>(null);
  const [config, setConfig] = useState({ appId: '', appKey: '', redirectUri: '' });
  const [checks, setChecks] = useState<DiagnosticCheck[]>(diagnosticChecks);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisComplete, setDiagnosisComplete] = useState(false);

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosisComplete(false);
    
    for (let i = 0; i < checks.length; i++) {
      setChecks(prev => prev.map((c, idx) => 
        idx === i ? { ...c, status: 'running' } : c
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      const success = Math.random() > 0.1; // 90% success rate
      setChecks(prev => prev.map((c, idx) => 
        idx === i ? { 
          ...c, 
          status: success ? 'success' : 'error',
          message: success ? '检测通过' : '检测失败，请检查配置'
        } : c
      ));
    }
    
    setIsDiagnosing(false);
    setDiagnosisComplete(true);
  };

  const allChecksPassed = checks.every(c => c.status === 'success');

  const handleNext = () => {
    if (currentStep === 0 && (!identitySource || !config.appId || !config.appKey)) {
      toast({ title: '请完成配置', variant: 'destructive' });
      return;
    }
    
    if (currentStep === 1 && !diagnosisComplete) {
      runDiagnostics();
      return;
    }
    
    if (currentStep === 1 && !allChecksPassed) {
      toast({ title: '请先通过所有诊断检查', variant: 'destructive' });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
      toast({ title: '配置完成！', description: '欢迎使用智码云 AI Coding 服务' });
    }
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Steps */}
      <div className="w-80 bg-card border-r border-border p-6 hidden md:flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">智码云</h1>
              <p className="text-xs text-muted-foreground">企业级 AI Coding 平台</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "stepper-circle",
                    status === 'completed' && "stepper-circle-completed",
                    status === 'current' && "stepper-circle-active",
                    status === 'pending' && "stepper-circle-pending"
                  )}>
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-0.5 flex-1 my-2 transition-colors duration-300",
                      status === 'completed' ? "bg-success" : "bg-border"
                    )} />
                  )}
                </div>
                <div className="pb-8">
                  <p className={cn(
                    "font-medium transition-colors",
                    status === 'current' ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            需要帮助？联系我们 support@ksgc.ai
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8 max-w-2xl mx-auto w-full">
          {/* Step 1: Identity Source */}
          {currentStep === 0 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">选择身份源</h2>
                <p className="text-muted-foreground mt-2">
                  集成您的企业身份系统，实现成员自动同步
                </p>
              </div>

              <RadioGroup
                value={identitySource || ''}
                onValueChange={(value: 'wps365' | 'wecom') => setIdentitySource(value)}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { 
                    value: 'wps365', 
                    label: 'WPS 365', 
                    desc: '金山办公企业版',
                    icon: '📄'
                  },
                  { 
                    value: 'wecom', 
                    label: '企业微信', 
                    desc: '腾讯企业微信',
                    icon: '💬'
                  },
                ].map((source) => (
                  <label
                    key={source.value}
                    className={cn(
                      "enterprise-card p-5 cursor-pointer transition-all duration-200",
                      identitySource === source.value 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={source.value} className="sr-only" />
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{source.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{source.label}</p>
                        <p className="text-sm text-muted-foreground">{source.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {identitySource && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="appId">App ID</Label>
                    <Input 
                      id="appId"
                      placeholder="请输入应用 ID"
                      value={config.appId}
                      onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appKey">App Key</Label>
                    <Input 
                      id="appKey"
                      type="password"
                      placeholder="请输入应用密钥"
                      value={config.appKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, appKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redirectUri">Redirect URI</Label>
                    <Input 
                      id="redirectUri"
                      placeholder="https://your-domain.com/callback"
                      value={config.redirectUri}
                      onChange={(e) => setConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      请将此 URI 配置到您的 {identitySource === 'wps365' ? 'WPS 365' : '企业微信'} 应用中
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Diagnostic */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">连接诊断</h2>
                <p className="text-muted-foreground mt-2">
                  自动检测配置并验证连接状态
                </p>
              </div>

              <div className="enterprise-card p-6 space-y-4">
                {checks.map((check) => (
                  <div 
                    key={check.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {check.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {check.status === 'running' && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      {check.status === 'success' && (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                      {check.status === 'error' && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        check.status === 'pending' ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {check.name}
                      </span>
                    </div>
                    {check.message && (
                      <span className={cn(
                        "text-xs",
                        check.status === 'success' ? "text-success" : "text-destructive"
                      )}>
                        {check.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {!diagnosisComplete && (
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isDiagnosing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isDiagnosing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      诊断中...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      开始诊断
                    </>
                  )}
                </Button>
              )}

              {diagnosisComplete && !allChecksPassed && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    部分检查未通过，请检查您的配置后重试
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => {
                      setChecks(diagnosticChecks);
                      setDiagnosisComplete(false);
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新诊断
                  </Button>
                </div>
              )}

              {diagnosisComplete && allChecksPassed && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-success">
                    ✓ 所有检查已通过，配置验证成功！
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">确认订阅权益</h2>
                <p className="text-muted-foreground mt-2">
                  查看并确认您的订阅方案
                </p>
              </div>

              <div className="enterprise-card p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">当前方案</p>
                    <p className="text-xl font-semibold text-foreground">企业专业版</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '试用期限', value: '14 天', desc: '免费体验' },
                    { label: '席位数量', value: '50 席', desc: '可添加成员' },
                    { label: 'Token 额度', value: '100 万/月', desc: '调用配额' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 rounded-lg bg-card">
                      <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="enterprise-card p-4">
                <h4 className="font-medium text-foreground mb-3">包含权益</h4>
                <ul className="space-y-2">
                  {[
                    '支持 Kimi、Qwen、DeepSeek 等多款主流模型',
                    'SSO 单点登录与组织架构同步',
                    '详细的用量统计与审计日志',
                    'IP 白名单与安全配置',
                    '7x24 技术支持',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6 bg-card">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </Button>
            <Button 
              onClick={handleNext}
              disabled={currentStep === 1 && isDiagnosing}
              className="gap-2"
            >
              {currentStep === steps.length - 1 ? '完成配置' : (
                currentStep === 1 && !diagnosisComplete ? '开始诊断' : '下一步'
              )}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
