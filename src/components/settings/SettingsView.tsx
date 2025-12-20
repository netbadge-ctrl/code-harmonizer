import React, { useState } from 'react';
import { 
  Key, 
  Bell, 
  Shield,
  Copy,
  RefreshCw,
  Download,
  ChevronDown,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type IdentitySource = 'wps365' | 'wecom' | 'feishu' | 'dingtalk';

const identitySources: { value: IdentitySource; label: string; icon: string }[] = [
  { value: 'wps365', label: 'WPS协作', icon: '📄' },
  { value: 'wecom', label: '企业微信', icon: '💬' },
  { value: 'feishu', label: '飞书', icon: '🐦' },
  { value: 'dingtalk', label: '钉钉', icon: '📌' },
];

export function SettingsView() {
  const [selectedSource, setSelectedSource] = useState<IdentitySource>('wps365');
  const [appId, setAppId] = useState('corp_xxxxxxxxxxxx');
  const [appKey, setAppKey] = useState('sk-xxxx-xxxx-xxxx-xxxx');
  const [redirectUri, setRedirectUri] = useState('https://api.ksgc.ai/auth/callback');
  const [showCliDialog, setShowCliDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalSource, setOriginalSource] = useState<IdentitySource>('wps365');

  const handleCopyAppId = () => {
    navigator.clipboard.writeText(appId);
    toast({ title: 'App ID 已复制' });
  };

  const handleCopyAppKey = () => {
    navigator.clipboard.writeText(appKey);
    toast({ title: 'App Key 已复制' });
  };

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    toast({ title: '回调地址已复制' });
  };

  const handleSourceChange = (value: IdentitySource) => {
    setSelectedSource(value);
    setHasUnsavedChanges(true);
  };

  const handleConfigChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = () => {
    if (hasUnsavedChanges) {
      setShowCliDialog(true);
    }
  };

  const handleConfirmSave = () => {
    setShowCliDialog(false);
    setHasUnsavedChanges(false);
    setOriginalSource(selectedSource);
    toast({ title: '配置已保存', description: '请重新下载CLI以应用新配置' });
  };

  const handleDownloadCli = () => {
    toast({ title: '开始下载 CLI', description: '请稍候...' });
    // 模拟下载
    setTimeout(() => {
      toast({ title: 'CLI 下载完成' });
    }, 1000);
  };

  const currentSourceLabel = identitySources.find(s => s.value === selectedSource)?.label || '';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Identity Source Configuration */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">企业登录身份源配置</h3>
            <p className="text-sm text-muted-foreground">配置企业单点登录认证源</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Identity Source Selector */}
          <div className="space-y-2">
            <Label>认证源类型</Label>
            <Select value={selectedSource} onValueChange={handleSourceChange}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="选择认证源" />
              </SelectTrigger>
              <SelectContent>
                {identitySources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    <span className="flex items-center gap-2">
                      <span>{source.icon}</span>
                      <span>{source.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              当前使用 {currentSourceLabel} 作为企业登录认证源
            </p>
          </div>

          {/* App ID */}
          <div className="space-y-2">
            <Label>App ID</Label>
            <div className="flex gap-2">
              <Input 
                value={appId}
                onChange={(e) => { setAppId(e.target.value); handleConfigChange(); }}
                className="font-mono"
                placeholder="请输入 App ID"
              />
              <Button variant="outline" size="icon" onClick={handleCopyAppId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              从 {currentSourceLabel} 开放平台获取的应用 ID
            </p>
          </div>

          {/* App Key */}
          <div className="space-y-2">
            <Label>App Key</Label>
            <div className="flex gap-2">
              <Input 
                value={appKey}
                onChange={(e) => { setAppKey(e.target.value); handleConfigChange(); }}
                type="password"
                className="font-mono"
                placeholder="请输入 App Key"
              />
              <Button variant="outline" size="icon" onClick={handleCopyAppKey}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              请妥善保管您的 App Key，不要泄露给他人
            </p>
          </div>

          {/* Redirect URI */}
          <div className="space-y-2">
            <Label>Redirect URI (回调地址)</Label>
            <div className="flex gap-2">
              <Input 
                value={redirectUri}
                onChange={(e) => { setRedirectUri(e.target.value); handleConfigChange(); }}
                className="font-mono"
                placeholder="请输入回调地址"
              />
              <Button variant="outline" size="icon" onClick={handleCopyRedirectUri}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              请将此地址配置到 {currentSourceLabel} 开放平台的授权回调地址中
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-border">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 text-xs text-warning">
                <AlertTriangle className="w-3 h-3" />
                有未保存的更改
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadCli}>
              <Download className="w-4 h-4 mr-2" />
              下载 CLI
            </Button>
            <Button onClick={handleSaveConfig} disabled={!hasUnsavedChanges}>
              保存配置
            </Button>
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

      {/* CLI Download Dialog */}
      <Dialog open={showCliDialog} onOpenChange={setShowCliDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置已更改</DialogTitle>
            <DialogDescription>
              您修改了企业登录身份源配置。保存后，需要重新下载 CLI 工具以应用新配置。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <p className="text-sm text-foreground">
                修改认证源配置后，CLI 工具需要重新下载并部署，否则员工将无法正常登录。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCliDialog(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmSave}>
              <Check className="w-4 h-4 mr-2" />
              确认保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
