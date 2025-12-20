import React from 'react';
import { 
  Building2, 
  Key, 
  Bell, 
  Shield,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export function SettingsView() {
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk-xxxx-xxxx-xxxx-xxxx');
    toast({ title: 'API Key 已复制' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-foreground">系统设置</h2>
        <p className="text-sm text-muted-foreground">管理组织信息和系统配置</p>
      </div>

      {/* Organization Info */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">组织信息</h3>
            <p className="text-sm text-muted-foreground">基本信息设置</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>组织名称</Label>
            <Input defaultValue="示例科技有限公司" />
          </div>
          <div className="space-y-2">
            <Label>组织域名</Label>
            <Input defaultValue="example.com" />
          </div>
          <div className="space-y-2">
            <Label>管理员邮箱</Label>
            <Input defaultValue="admin@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label>联系电话</Label>
            <Input defaultValue="+86 10 8888 8888" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button>保存更改</Button>
        </div>
      </div>

      {/* API Configuration */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">API 配置</h3>
            <p className="text-sm text-muted-foreground">管理 API 密钥和访问凭证</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input 
                value="sk-xxxx-xxxx-xxxx-xxxx" 
                type="password"
                readOnly
                className="font-mono"
              />
              <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              请妥善保管您的 API Key，不要泄露给他人
            </p>
          </div>

          <div className="space-y-2">
            <Label>API 端点</Label>
            <div className="flex gap-2">
              <Input 
                value="https://api.ksgc.ai/v1" 
                readOnly
                className="font-mono"
              />
              <Button variant="outline" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">通知设置</h3>
            <p className="text-sm text-muted-foreground">配置系统通知偏好</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: '用量告警', desc: '当 Token 使用量达到阈值时发送通知' },
            { label: '安全告警', desc: '异常登录或访问尝试时发送通知' },
            { label: '成员变动', desc: '成员加入或离开时发送通知' },
            { label: '系统更新', desc: '平台更新和维护公告' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={index < 2} />
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">安全设置</h3>
            <p className="text-sm text-muted-foreground">增强账户安全性</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: '强制双因素认证', desc: '所有成员必须启用 2FA' },
            { label: '会话超时', desc: '30 分钟无操作自动登出' },
            { label: '审计日志保留', desc: '保留 90 天的操作日志' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={index === 2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
