import React, { useState, useRef } from 'react';
import { 
  Key, 
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Package,
  Upload,
  Trash2,
  Download,
  FileArchive,
  Calendar
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

const identitySources: { value: IdentitySource; label: string; Icon: React.FC; docUrl: string }[] = [
  { value: 'wps365', label: 'WPS协作', Icon: WPSIcon, docUrl: 'https://open.wps.cn/docs/oauth' },
  { value: 'wecom', label: '企业微信', Icon: WeComIcon, docUrl: 'https://developer.work.weixin.qq.com/document' },
  { value: 'feishu', label: '飞书', Icon: FeishuIcon, docUrl: 'https://open.feishu.cn/document' },
  { value: 'dingtalk', label: '钉钉', Icon: DingTalkIcon, docUrl: 'https://open.dingtalk.com/document' },
];

interface CliPackage {
  id: string;
  name: string;
  size: string;
  version: string;
  uploadedAt: string;
}

export function SettingsView() {
  const [selectedSource, setSelectedSource] = useState<IdentitySource>('wps365');
  const [pendingSource, setPendingSource] = useState<IdentitySource | null>(null);
  const [appId, setAppId] = useState('wk_corp_8a7b6c5d4e3f2a1b');
  const [appKey, setAppKey] = useState('sk-wps-xxxx-yyyy-zzzz-1234567890ab');
  const [redirectUri, setRedirectUri] = useState('https://api.example.com/auth/callback');
  const [showAppKey, setShowAppKey] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // CLI Package Management
  const [cliPackages, setCliPackages] = useState<CliPackage[]>([
    {
      id: '1',
      name: 'devtools-cli-v2.1.0-darwin-arm64.tar.gz',
      size: '45.2 MB',
      version: 'v2.1.0',
      uploadedAt: '2024-01-08',
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentSource = identitySources.find(s => s.value === selectedSource);
  const currentSourceLabel = currentSource?.label || '';

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

  // CLI Package handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUploadPackage(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadPackage(files[0]);
    }
  };

  const handleUploadPackage = (file: File) => {
    const newPackage: CliPackage = {
      id: Date.now().toString(),
      name: file.name,
      size: formatFileSize(file.size),
      version: 'v1.0.0',
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setCliPackages(prev => [...prev, newPackage]);
    toast({ title: '上传成功', description: `${file.name} 已上传` });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownloadPackage = (pkg: CliPackage) => {
    toast({ title: '开始下载', description: pkg.name });
  };

  const handleDeletePackage = (id: string) => {
    setCliPackages(prev => prev.filter(p => p.id !== id));
    toast({ title: '已删除', description: '安装包已移除' });
  };

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
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                当前使用 {currentSourceLabel} 作为企业登录认证源
              </p>
              <a
                href={currentSource?.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                查看配置说明
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
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
          </div>

          {/* App Key */}
          <div className="space-y-2">
            <Label>App Key</Label>
            <div className="relative">
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

          {/* Redirect URI */}
          <div className="space-y-2">
            <Label>Redirect URI (回调地址)</Label>
            <Input 
              value={redirectUri}
              onChange={(e) => { setRedirectUri(e.target.value); handleConfigChange(); }}
              className="font-mono"
              placeholder="请输入回调地址"
            />
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
          <Button onClick={handleSaveConfig} disabled={!hasUnsavedChanges}>
            保存配置
          </Button>
        </div>
      </div>

      {/* CLI Package Management */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">客户端安装包管理</h3>
            <p className="text-sm text-muted-foreground">上传和管理自定义开发CLI工具安装包</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div 
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-muted-foreground/50'
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.tar.gz,.exe,.dmg,.pkg,.msi,.deb,.rpm"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">拖拽文件到此处或点击上传</p>
            <p className="text-xs text-muted-foreground">
              支持 .zip, .tar.gz, .exe, .dmg, .pkg, .msi, .deb, .rpm 格式
            </p>
          </div>

          {/* Uploaded Packages List */}
          {cliPackages.length > 0 && (
            <div className="space-y-3">
              <Label>已上传的安装包</Label>
              <div className="space-y-2">
                {cliPackages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                      <FileArchive className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pkg.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{pkg.size}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {pkg.uploadedAt}
                        </span>
                        <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{pkg.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownloadPackage(pkg)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cliPackages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无上传的安装包，请上传自定义CLI工具
            </p>
          )}
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
