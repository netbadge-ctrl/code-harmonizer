import React, { useState } from 'react';
import { 
  Key, 
  Download,
  Check,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type IdentitySource = 'wps365' | 'wecom' | 'feishu' | 'dingtalk';

// SVG Icons for each identity source
const WPSIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 3h2v8H7V8zm4 0h2v8h-2V8zm4 0h2v8h-2V8z"/>
  </svg>
);

const WeComIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

const FeishuIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const DingTalkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);

const identitySources: { value: IdentitySource; label: string; Icon: React.FC }[] = [
  { value: 'wps365', label: 'WPS协作', Icon: WPSIcon },
  { value: 'wecom', label: '企业微信', Icon: WeComIcon },
  { value: 'feishu', label: '飞书', Icon: FeishuIcon },
  { value: 'dingtalk', label: '钉钉', Icon: DingTalkIcon },
];

export function SettingsView() {
  const [selectedSource, setSelectedSource] = useState<IdentitySource>('wps365');
  const [pendingSource, setPendingSource] = useState<IdentitySource | null>(null);
  const [appId, setAppId] = useState('');
  const [appKey, setAppKey] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [showAppKey, setShowAppKey] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSourceChange = (value: IdentitySource) => {
    if (value !== selectedSource) {
      setPendingSource(value);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSourceChange = () => {
    if (pendingSource) {
      setSelectedSource(pendingSource);
      setPendingSource(null);
      setHasUnsavedChanges(true);
    }
    setShowConfirmDialog(false);
    toast({ 
      title: '认证源已变更', 
      description: '请重新下载CLI并通知成员更换秘钥' 
    });
  };

  const handleCancelSourceChange = () => {
    setPendingSource(null);
    setShowConfirmDialog(false);
  };

  const handleConfigChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = () => {
    setHasUnsavedChanges(false);
    toast({ title: '配置已保存' });
  };

  const handleDownloadCli = () => {
    toast({ title: '开始下载 CLI', description: '请稍候...' });
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
          {/* Identity Source Selector - Flat Radio Style */}
          <div className="space-y-2">
            <Label>认证源类型</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {identitySources.map((source) => {
                const IconComponent = source.Icon;
                return (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => handleSourceChange(source.value)}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${selectedSource === source.value 
                        ? 'border-primary bg-primary/5 text-foreground' 
                        : 'border-border bg-background hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <IconComponent />
                    <span className="text-sm font-medium">{source.label}</span>
                    {selectedSource === source.value && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              当前使用 {currentSourceLabel} 作为企业登录认证源
            </p>
          </div>

          {/* App ID */}
          <div className="space-y-2">
            <Label>App ID</Label>
            <Input 
              value={appId}
              onChange={(e) => { setAppId(e.target.value); handleConfigChange(); }}
              className="font-mono"
              placeholder="请输入 App ID"
            />
            <p className="text-xs text-muted-foreground">
              从 {currentSourceLabel} 开放平台获取的应用 ID
            </p>
          </div>

          {/* App Key */}
          <div className="space-y-2">
            <Label>App Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  value={appKey}
                  onChange={(e) => { setAppKey(e.target.value); handleConfigChange(); }}
                  type={showAppKey ? 'text' : 'password'}
                  className="font-mono pr-10"
                  placeholder="请输入 App Key"
                />
                <button
                  type="button"
                  onClick={() => setShowAppKey(!showAppKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAppKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              请妥善保管您的 App Key，不要泄露给他人
            </p>
          </div>

          {/* Redirect URI */}
          <div className="space-y-2">
            <Label>Redirect URI (回调地址)</Label>
            <Input 
              value={redirectUri}
              onChange={(e) => { setRedirectUri(e.target.value); handleConfigChange(); }}
              className="font-mono"
              placeholder="请输入回调地址"
            />
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

      {/* Source Change Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认变更认证源</DialogTitle>
            <DialogDescription>
              您正在将认证源从 "{identitySources.find(s => s.value === selectedSource)?.label}" 变更为 "{identitySources.find(s => s.value === pendingSource)?.label}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                认证源配置变更后，需要按新的下载地址重新下载CLI，成员的秘钥也需要重新更换。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSourceChange}>
              取消
            </Button>
            <Button onClick={handleConfirmSourceChange}>
              <Check className="w-4 h-4 mr-2" />
              确认变更
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
