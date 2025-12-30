import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  Terminal,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Shield,
  ExternalLink,
  Building2,
  Cloud,
  Server,
  Database,
  HardDrive,
  CreditCard,
  Clock,
  Globe
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  { id: 'cloud-integration', title: '创建云服务与集成配置', subtitle: '第 1 步' },
  { id: 'confirm', title: '权益确认', subtitle: '第 2 步' },
];

const regionTabs = [
  { id: 'domestic', label: '国内' },
  { id: 'asia-pacific', label: '亚太' },
  { id: 'europe', label: '欧洲' },
];

const regionsByTab: Record<string, { id: string; name: string }[]> = {
  domestic: [
    { id: 'cn-beijing', name: '华北1（北京）' },
    { id: 'cn-shanghai', name: '华东1（上海）' },
    { id: 'cn-guangzhou', name: '华南1（广州）' },
    { id: 'cn-xibei', name: '西北1区（庆阳）' },
    { id: 'cn-huadong-finance', name: '华东金融1（北京）' },
    { id: 'cn-huadong-finance-sh', name: '华东金融1（上海）' },
    { id: 'cn-taipei', name: '台北' },
    { id: 'cn-ningbo', name: '华东2（宁波）' },
    { id: 'cn-xibei3', name: '西北3区（宁夏）' },
    { id: 'cn-xibei4', name: '西北4（海东）' },
  ],
  'asia-pacific': [
    { id: 'ap-singapore', name: '新加坡' },
    { id: 'ap-hongkong', name: '中国香港' },
    { id: 'ap-tokyo', name: '日本（东京）' },
    { id: 'ap-seoul', name: '韩国（首尔）' },
  ],
  europe: [
    { id: 'eu-frankfurt', name: '德国（法兰克福）' },
    { id: 'eu-london', name: '英国（伦敦）' },
  ],
};

interface DiagnosticItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
}

interface CloudConfig {
  billingMethod: 'pay-as-you-go' | 'subscription';
  region: string;
  slb: {
    enabled: boolean;
  };
  ecs: {
    enabled: boolean;
    machineType: string;
    specs: string;
    quantity: number;
    systemDisk: string;
    dataDisk: string;
  };
  mysql: {
    enabled: boolean;
    storageType: string;
    memory: string;
    disk: string;
    quantity: number;
    adminUser: string;
    adminPassword: string;
    confirmPassword: string;
  };
}

type ProvisioningPhase = 'idle' | 'cloud' | 'integration' | 'complete';

interface CloudProvisioningItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
}

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [identitySource, setIdentitySource] = useState<'wps365' | 'wecom' | null>(null);
  const [config, setConfig] = useState({ appId: '', appKey: '', redirectUri: '' });
  const [showAppKey, setShowAppKey] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    { id: 'gateway', name: '身份源网关连通性', status: 'pending' },
    { id: 'credentials', name: 'App ID & Key凭证有效性', status: 'pending' },
    { id: 'redirect', name: 'Redirect URI 回调校验', status: 'pending' },
  ]);

  // Cloud services config
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>({
    billingMethod: 'pay-as-you-go',
    region: 'cn-beijing',
    slb: { enabled: true },
    ecs: {
      enabled: true,
      machineType: '标准型S6.8B',
      specs: '8核16GB',
      quantity: 3,
      systemDisk: '云硬盘3.0 50G',
      dataDisk: '云硬盘3.0 500G',
    },
    mysql: {
      enabled: true,
      storageType: '本地盘',
      memory: '1GB',
      disk: '15GB',
      quantity: 1,
      adminUser: 'admin',
      adminPassword: '',
      confirmPassword: '',
    },
  });
  const [regionTab, setRegionTab] = useState('domestic');
  const [showMysqlPassword, setShowMysqlPassword] = useState(false);
  const [showMysqlConfirmPassword, setShowMysqlConfirmPassword] = useState(false);

  // Provisioning state
  const [provisioningPhase, setProvisioningPhase] = useState<ProvisioningPhase>('idle');
  const [cloudProvisioning, setCloudProvisioning] = useState<CloudProvisioningItem[]>([
    { id: 'slb', name: 'SLB 负载均衡', status: 'pending' },
    { id: 'ecs', name: '云服务器 ECS', status: 'pending' },
    { id: 'mysql', name: 'MySQL 数据库', status: 'pending' },
  ]);

  const runProvisioning = async () => {
    // Phase 1: Cloud Services
    setProvisioningPhase('cloud');
    
    for (let i = 0; i < cloudProvisioning.length; i++) {
      setCloudProvisioning(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'running' } : item
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
      
      setCloudProvisioning(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'success' } : item
      ));
    }

    toast({ title: '云服务创建成功', description: '已完成 SLB、云服务器、MySQL 的部署配置' });

    // Phase 2: Integration Validation
    setProvisioningPhase('integration');
    
    for (let i = 0; i < diagnostics.length; i++) {
      setDiagnostics(prev => prev.map((d, idx) => 
        idx === i ? { ...d, status: 'running' } : d
      ));
      
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      setDiagnostics(prev => prev.map((d, idx) => 
        idx === i ? { ...d, status: 'success' } : d
      ));
    }

    toast({ title: '企业集成验证通过', description: '身份源配置已验证成功' });
    setProvisioningPhase('complete');
  };

  const allCloudSuccess = cloudProvisioning.every(item => item.status === 'success');
  const allDiagnosticsSuccess = diagnostics.every(d => d.status === 'success');

  const canStartProvisioning = () => {
    const { mysql } = cloudConfig;
    const passwordValid = mysql.adminPassword.length >= 8 && mysql.adminPassword === mysql.confirmPassword;
    const integrationValid = identitySource && config.appId && config.appKey;
    return passwordValid && integrationValid;
  };

  const handleNext = () => {
    if (currentStep === 0 && provisioningPhase === 'idle') {
      runProvisioning();
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

  const passwordsMatch = cloudConfig.mysql.adminPassword === cloudConfig.mysql.confirmPassword;
  const passwordValid = cloudConfig.mysql.adminPassword.length >= 8;

  const isProvisioning = provisioningPhase === 'cloud' || provisioningPhase === 'integration';

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
            {/* Step 1: Cloud Services & Integration */}
            {currentStep === 0 && (
              <div className="animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Cloud className="w-4 h-4" />
                    <span>服务配置</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">创建云服务与集成配置</h1>
                  <p className="text-muted-foreground">配置云资源和企业身份源，完成后系统将自动完成部署和验证</p>
                </div>

                {/* Billing & Region Section */}
                <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
                  <div className="bg-muted/30 px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      基础配置
                    </h2>
                  </div>
                  <div className="p-5 space-y-5">
                    {/* Billing Method */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        计费方式
                      </Label>
                      <RadioGroup
                        value={cloudConfig.billingMethod}
                        onValueChange={(value: 'pay-as-you-go' | 'subscription') => 
                          setCloudConfig(prev => ({ ...prev, billingMethod: value }))
                        }
                        className="flex gap-4"
                        disabled={isProvisioning}
                      >
                        <div className={cn(
                          "flex-1 relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          cloudConfig.billingMethod === 'pay-as-you-go' 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-muted-foreground/50",
                          isProvisioning && "opacity-60 cursor-not-allowed"
                        )}>
                          <RadioGroupItem value="pay-as-you-go" id="pay-as-you-go" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="pay-as-you-go" className="font-medium cursor-pointer">
                              按量付费
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              按实际使用量计费，适合业务波动大的场景
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "flex-1 relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          cloudConfig.billingMethod === 'subscription' 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-muted-foreground/50",
                          isProvisioning && "opacity-60 cursor-not-allowed"
                        )}>
                          <RadioGroupItem value="subscription" id="subscription" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="subscription" className="font-medium cursor-pointer">
                              包年包月
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              预付费模式，享受更优惠的价格
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Region */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        地域
                      </Label>
                      {/* Region Tabs */}
                      <div className="flex gap-4 border-b border-border">
                        {regionTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => !isProvisioning && setRegionTab(tab.id)}
                            disabled={isProvisioning}
                            className={cn(
                              "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                              regionTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                              isProvisioning && "opacity-60 cursor-not-allowed"
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      {/* Region Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {regionsByTab[regionTab]?.map((region) => (
                          <button
                            key={region.id}
                            onClick={() => !isProvisioning && setCloudConfig(prev => ({ ...prev, region: region.id }))}
                            disabled={isProvisioning}
                            className={cn(
                              "px-4 py-2 text-sm rounded border transition-all",
                              cloudConfig.region === region.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:border-primary/50",
                              isProvisioning && "opacity-60 cursor-not-allowed"
                            )}
                          >
                            {region.name}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-orange-600">
                        创建成功后<span className="text-destructive font-medium">不支持更改地域</span>，不同地域之间内网不互通。建议选择靠近业务的地域，增加访问速度
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cloud Resources Section */}
                <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
                  <div className="bg-muted/30 px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <Server className="w-4 h-4 text-primary" />
                      云资源配置
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {/* SLB */}
                    <div className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Server className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">SLB 负载均衡</h3>
                          <p className="text-xs text-muted-foreground">Server Load Balancer</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          × 1
                        </div>
                      </div>
                    </div>

                    {/* ECS */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <HardDrive className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">云服务器 ECS</h3>
                          <p className="text-xs text-muted-foreground">Elastic Compute Service</p>
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          × {cloudConfig.ecs.quantity} 台
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">机型</p>
                          <p className="font-medium text-foreground">{cloudConfig.ecs.machineType}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">规格</p>
                          <p className="font-medium text-foreground">{cloudConfig.ecs.specs}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">系统盘</p>
                          <p className="font-medium text-foreground">{cloudConfig.ecs.systemDisk}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">数据盘</p>
                          <p className="font-medium text-foreground">{cloudConfig.ecs.dataDisk}</p>
                        </div>
                      </div>
                    </div>

                    {/* MySQL */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Database className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">MySQL 数据库</h3>
                          <p className="text-xs text-muted-foreground">关系型数据库服务</p>
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          × {cloudConfig.mysql.quantity} 个
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">存储类型</p>
                          <p className="font-medium text-foreground">{cloudConfig.mysql.storageType}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">内存</p>
                          <p className="font-medium text-foreground">{cloudConfig.mysql.memory}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground text-xs mb-1">磁盘</p>
                          <p className="font-medium text-foreground">{cloudConfig.mysql.disk}</p>
                        </div>
                      </div>

                      {/* Admin Account Config */}
                      <div className="border-t border-border pt-4 mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-3">管理员账户配置</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="mysqlUser" className="text-sm">管理员用户名</Label>
                            <Input
                              id="mysqlUser"
                              value={cloudConfig.mysql.adminUser}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mysqlPassword" className="text-sm">管理员密码</Label>
                            <div className="relative">
                              <Input
                                id="mysqlPassword"
                                type={showMysqlPassword ? 'text' : 'password'}
                                placeholder="请输入密码（至少8位）"
                                value={cloudConfig.mysql.adminPassword}
                                onChange={(e) => setCloudConfig(prev => ({
                                  ...prev,
                                  mysql: { ...prev.mysql, adminPassword: e.target.value }
                                }))}
                                disabled={isProvisioning}
                                className="bg-background pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowMysqlPassword(!showMysqlPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showMysqlPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {cloudConfig.mysql.adminPassword && !passwordValid && (
                              <p className="text-xs text-destructive">密码长度至少8位</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mysqlConfirmPassword" className="text-sm">确认密码</Label>
                            <div className="relative">
                              <Input
                                id="mysqlConfirmPassword"
                                type={showMysqlConfirmPassword ? 'text' : 'password'}
                                placeholder="请再次输入密码"
                                value={cloudConfig.mysql.confirmPassword}
                                onChange={(e) => setCloudConfig(prev => ({
                                  ...prev,
                                  mysql: { ...prev.mysql, confirmPassword: e.target.value }
                                }))}
                                disabled={isProvisioning}
                                className="bg-background pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowMysqlConfirmPassword(!showMysqlConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showMysqlConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {cloudConfig.mysql.confirmPassword && !passwordsMatch && (
                              <p className="text-xs text-destructive">两次输入的密码不一致</p>
                            )}
                            {cloudConfig.mysql.confirmPassword && passwordsMatch && passwordValid && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                密码设置正确
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integration Config Section */}
                <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
                  <div className="bg-muted/30 px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      企业集成配置
                    </h2>
                  </div>
                  <div className="p-5 space-y-6">
                    {/* Verified Company */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">已验证企业</p>
                          <p className="font-medium text-foreground">北京智码云科技有限公司</p>
                        </div>
                      </div>
                    </div>

                    {/* Identity Source Selection */}
                    <div>
                      <Label className="text-sm text-foreground mb-3 block">选择连接身份源</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => !isProvisioning && setIdentitySource('wps365')}
                          disabled={isProvisioning}
                          className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            identitySource === 'wps365'
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30",
                            isProvisioning && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">W</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">WPS 365</p>
                              <p className="text-xs text-muted-foreground">金山办公集成</p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => !isProvisioning && setIdentitySource('wecom')}
                          disabled={isProvisioning}
                          className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            identitySource === 'wecom'
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30",
                            isProvisioning && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
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
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-primary">
                        配置后，系统将以此进行成员信息认证和企业架构同步。请确保在开放平台已授予相应权限。
                        <a href="#" className="inline-flex items-center gap-1 ml-2 font-medium hover:underline">
                          查看操作文档 <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>

                    {/* Config Inputs */}
                    {identitySource && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="appId">App ID</Label>
                          <Input
                            id="appId"
                            placeholder="请输入应用 ID"
                            value={config.appId}
                            onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                            disabled={isProvisioning}
                            className="bg-background"
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
                              disabled={isProvisioning}
                              className="bg-background pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowAppKey(!showAppKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showAppKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="redirectUri">Redirect URI (回调地址)</Label>
                          <Input
                            id="redirectUri"
                            placeholder="请输入回调地址"
                            value={config.redirectUri || ''}
                            onChange={(e) => setConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
                            disabled={isProvisioning}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Provisioning Progress */}
                {provisioningPhase !== 'idle' && (
                  <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border">
                      <h2 className="font-semibold text-foreground">部署进度</h2>
                    </div>
                    <div className="p-5 space-y-6">
                      {/* Cloud Services Progress */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Cloud className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">云服务开通</span>
                          {allCloudSuccess && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              已完成
                            </span>
                          )}
                          {provisioningPhase === 'cloud' && !allCloudSuccess && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-primary">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              进行中
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 pl-6">
                          {cloudProvisioning.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.status === 'pending' && (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                              )}
                              {item.status === 'running' && (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              )}
                              {item.status === 'success' && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
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

                      {/* Integration Validation Progress */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">企业集成验证</span>
                          {allDiagnosticsSuccess && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              已完成
                            </span>
                          )}
                          {provisioningPhase === 'integration' && !allDiagnosticsSuccess && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-primary">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              进行中
                            </span>
                          )}
                          {provisioningPhase === 'cloud' && (
                            <span className="ml-auto text-xs text-muted-foreground">等待中</span>
                          )}
                        </div>
                        <div className="space-y-2 pl-6">
                          {diagnostics.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.status === 'pending' && (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                              )}
                              {item.status === 'running' && (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              )}
                              {item.status === 'success' && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              )}
                              {item.status === 'error' && (
                                <div className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">!</div>
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
              disabled={isProvisioning}
            >
              {currentStep === 0 ? '返回' : '上一步'}
            </Button>
            
            {currentStep === 0 && (
              <Button 
                onClick={handleNext}
                disabled={!canStartProvisioning() || isProvisioning}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {provisioningPhase === 'cloud' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    创建云服务中...
                  </>
                ) : provisioningPhase === 'integration' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    验证集成中...
                  </>
                ) : provisioningPhase === 'complete' ? (
                  <>
                    进入下一步
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    开始部署
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
