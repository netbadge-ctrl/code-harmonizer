import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Cloud, Building2, RefreshCw, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
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
    },
    {
      id: 'org',
      name: '组织认证',
      description: '验证组织身份和访问权限',
      icon: <Building2 className="h-5 w-5" />,
      status: 'pending',
    },
  ]);

  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    setValidationComplete(false);

    // 重置状态
    setChecks(prev => prev.map(check => ({ ...check, status: 'pending', message: undefined })));

    // 模拟云基础服务检测
    setChecks(prev => prev.map(check => 
      check.id === 'cloud' ? { ...check, status: 'checking' } : check
    ));
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setChecks(prev => prev.map(check => 
      check.id === 'cloud' 
        ? { ...check, status: 'success', message: '云服务连接正常，延迟 32ms' } 
        : check
    ));

    // 模拟组织认证检测 - 失败场景
    setChecks(prev => prev.map(check => 
      check.id === 'org' ? { ...check, status: 'checking' } : check
    ));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setChecks(prev => prev.map(check => 
      check.id === 'org' 
        ? { ...check, status: 'error', message: '组织认证失败，授权已过期或无效' } 
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

  const getStatusIcon = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
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
              <div
                key={check.id}
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
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm">{check.name}</h4>
                    {getStatusIcon(check.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {check.description}
                  </p>
                  {check.message && (
                    <p className={cn(
                      "text-xs mt-1",
                      check.status === 'success' && "text-green-600 dark:text-green-400",
                      check.status === 'error' && "text-destructive"
                    )}>
                      {check.message}
                    </p>
                  )}
                </div>
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

          {hasError && (
            <div className="space-y-3 pt-2">
              <Button 
                onClick={runValidation} 
                className="w-full"
                disabled={isValidating}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isValidating && "animate-spin")} />
                重新检测
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open('https://help.example.com', '_blank')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  帮助文档
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open('mailto:support@example.com', '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  联系客服
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                如需帮助，请联系技术支持或查阅帮助文档
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
