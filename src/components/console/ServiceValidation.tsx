import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Cloud, Building2, RefreshCw, FileText, Database, Globe, Shield, Key, UserCheck, FileKey, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SubCheck {
  id: string;
  name: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  icon: React.ReactNode;
}

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
  configurable?: boolean;
  subChecks?: SubCheck[];
}

interface ServiceValidationProps {
  onValidationComplete: () => void;
}

export function ServiceValidation({ onValidationComplete }: ServiceValidationProps) {
  const [checks, setChecks] = useState<ValidationCheck[]>([
    {
      id: 'cloud',
      name: '云基础服务',
      description: '检测云服务连接状态和基础设施可用性',
      icon: <Cloud className="h-5 w-5" />,
      status: 'pending',
      subChecks: [
        { id: 'provision', name: '服务开通状态', status: 'pending', icon: <Power className="h-3.5 w-3.5" /> },
        { id: 'api', name: 'API 网关连接', status: 'pending', icon: <Globe className="h-3.5 w-3.5" /> },
        { id: 'db', name: '数据库服务', status: 'pending', icon: <Database className="h-3.5 w-3.5" /> },
        { id: 'security', name: '安全服务', status: 'pending', icon: <Shield className="h-3.5 w-3.5" /> },
      ],
    },
    {
      id: 'org',
      name: '组织认证',
      description: '验证组织身份和访问权限',
      icon: <Building2 className="h-5 w-5" />,
      status: 'pending',
      configurable: true,
      subChecks: [
        { id: 'license', name: '授权许可验证', status: 'pending', icon: <Key className="h-3.5 w-3.5" /> },
        { id: 'identity', name: '组织身份校验', status: 'pending', icon: <UserCheck className="h-3.5 w-3.5" /> },
        { id: 'cert', name: '证书有效性', status: 'pending', icon: <FileKey className="h-3.5 w-3.5" /> },
      ],
    },
  ]);

  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [configData, setConfigData] = useState({
    orgId: '',
    authKey: '',
  });

  const updateSubCheck = (checkId: string, subCheckId: string, status: SubCheck['status']) => {
    setChecks(prev => prev.map(check => {
      if (check.id === checkId && check.subChecks) {
        return {
          ...check,
          subChecks: check.subChecks.map(sub => 
            sub.id === subCheckId ? { ...sub, status } : sub
          ),
        };
      }
      return check;
    }));
  };

  const runValidation = async () => {
    setIsValidating(true);
    setValidationComplete(false);

    // 重置状态
    setChecks(prev => prev.map(check => ({ 
      ...check, 
      status: 'pending', 
      message: undefined,
      subChecks: check.subChecks?.map(sub => ({ ...sub, status: 'pending' as const })),
    })));

    // 模拟云基础服务检测
    setChecks(prev => prev.map(check => 
      check.id === 'cloud' ? { ...check, status: 'checking' } : check
    ));

    // 云服务子检测项
    await new Promise(resolve => setTimeout(resolve, 300));
    updateSubCheck('cloud', 'provision', 'checking');
    await new Promise(resolve => setTimeout(resolve, 400));
    updateSubCheck('cloud', 'provision', 'success');

    updateSubCheck('cloud', 'api', 'checking');
    await new Promise(resolve => setTimeout(resolve, 300));
    updateSubCheck('cloud', 'api', 'success');

    updateSubCheck('cloud', 'db', 'checking');
    await new Promise(resolve => setTimeout(resolve, 400));
    updateSubCheck('cloud', 'db', 'success');

    updateSubCheck('cloud', 'security', 'checking');
    await new Promise(resolve => setTimeout(resolve, 300));
    updateSubCheck('cloud', 'security', 'success');
    
    setChecks(prev => prev.map(check => 
      check.id === 'cloud' 
        ? { ...check, status: 'success', message: '云服务连接正常，延迟 32ms' } 
        : check
    ));

    // 模拟组织认证检测 - 失败场景
    setChecks(prev => prev.map(check => 
      check.id === 'org' ? { ...check, status: 'checking' } : check
    ));

    // 组织认证子检测项
    await new Promise(resolve => setTimeout(resolve, 300));
    updateSubCheck('org', 'license', 'checking');
    await new Promise(resolve => setTimeout(resolve, 400));
    updateSubCheck('org', 'license', 'error'); // 授权失败

    updateSubCheck('org', 'identity', 'checking');
    await new Promise(resolve => setTimeout(resolve, 300));
    updateSubCheck('org', 'identity', 'success');

    updateSubCheck('org', 'cert', 'checking');
    await new Promise(resolve => setTimeout(resolve, 300));
    updateSubCheck('org', 'cert', 'success');
    
    setChecks(prev => prev.map(check => 
      check.id === 'org' 
        ? { ...check, status: 'error', message: '授权许可验证失败，许可证已过期' } 
        : check
    ));

    setIsValidating(false);
    setValidationComplete(true);
  };

  useEffect(() => {
    runValidation();
  }, []);

  useEffect(() => {
    if (validationComplete) {
      const allSuccess = checks.every(check => check.status === 'success');
      if (allSuccess) {
        const timer = setTimeout(() => {
          onValidationComplete();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [validationComplete, checks, onValidationComplete]);

  const allSuccess = checks.every(check => check.status === 'success');
  const hasError = checks.some(check => check.status === 'error');

  const getStatusIcon = (status: ValidationCheck['status'], size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
    switch (status) {
      case 'pending':
        return <div className={cn(sizeClass, "rounded-full border-2 border-muted")} />;
      case 'checking':
        return <Loader2 className={cn(sizeClass, "text-primary animate-spin")} />;
      case 'success':
        return <CheckCircle2 className={cn(sizeClass, "text-green-500")} />;
      case 'error':
        return <XCircle className={cn(sizeClass, "text-destructive")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">服务状态检测</CardTitle>
          <CardDescription>
            正在验证服务开通状态，请稍候...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="space-y-2">
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                    check.status === 'success' && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
                    check.status === 'error' && "bg-destructive/10 border-destructive/30",
                    check.status === 'checking' && "bg-primary/5 border-primary/20",
                    check.status === 'pending' && "bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    check.status === 'success' && "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                    check.status === 'error' && "bg-destructive/20 text-destructive",
                    check.status === 'checking' && "bg-primary/10 text-primary",
                    check.status === 'pending' && "bg-muted text-muted-foreground"
                  )}>
                    {check.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{check.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {check.description}
                    </p>
                    
                    {/* 子检测项列表 */}
                    {check.subChecks && check.subChecks.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {check.subChecks.map((subCheck) => (
                          <div 
                            key={subCheck.id} 
                            className={cn(
                              "flex items-center gap-2 text-xs py-1 px-2 rounded",
                              subCheck.status === 'success' && "bg-green-50 dark:bg-green-950/30",
                              subCheck.status === 'error' && "bg-destructive/10",
                              subCheck.status === 'checking' && "bg-primary/5",
                              subCheck.status === 'pending' && "bg-muted/30"
                            )}
                          >
                            <span className={cn(
                              "flex-shrink-0",
                              subCheck.status === 'success' && "text-green-600 dark:text-green-400",
                              subCheck.status === 'error' && "text-destructive",
                              subCheck.status === 'checking' && "text-primary",
                              subCheck.status === 'pending' && "text-muted-foreground"
                            )}>
                              {subCheck.icon}
                            </span>
                            <span className={cn(
                              "flex-1",
                              subCheck.status === 'success' && "text-green-700 dark:text-green-300",
                              subCheck.status === 'error' && "text-destructive",
                              subCheck.status === 'pending' && "text-muted-foreground"
                            )}>
                              {subCheck.name}
                            </span>
                            {getStatusIcon(subCheck.status, 'sm')}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {check.message && (
                      <p className={cn(
                        "text-xs mt-2",
                        check.status === 'success' && "text-green-600 dark:text-green-400",
                        check.status === 'error' && "text-destructive"
                      )}>
                        {check.message}
                      </p>
                    )}
                    {check.status === 'error' && (
                      <a 
                        href="https://help.example.com/org-auth" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        <FileText className="h-3 w-3" />
                        查看帮助文档
                      </a>
                    )}
                  </div>
                </div>
                
                {/* 配置修改区域 - 错误时直接显示 */}
                {check.status === 'error' && check.configurable && (
                  <div className="p-3 rounded-lg bg-muted/50 border space-y-3 mt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="orgId" className="text-xs">组织 ID</Label>
                      <Input
                        id="orgId"
                        placeholder="请输入组织 ID"
                        value={configData.orgId}
                        onChange={(e) => setConfigData(prev => ({ ...prev, orgId: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="authKey" className="text-xs">授权密钥</Label>
                      <Input
                        id="authKey"
                        type="password"
                        placeholder="请输入授权密钥"
                        value={configData.authKey}
                        onChange={(e) => setConfigData(prev => ({ ...prev, authKey: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full h-8 text-xs"
                      disabled={isValidating}
                      onClick={runValidation}
                    >
                      <RefreshCw className={cn("h-3 w-3 mr-1", isValidating && "animate-spin")} />
                      保存并重新验证
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {validationComplete && allSuccess && (
            <div className="text-center pt-2">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                验证通过，正在进入控制台...
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
