import React, { useState } from 'react';
import { Power, PowerOff, Settings2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockModels } from '@/data/mockData';
import { AIModel } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ModelManagement() {
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [tempLimits, setTempLimits] = useState({ rpm: 0, tpm: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleModel = (model: AIModel) => {
    setModels(prev => prev.map(m => 
      m.id === model.id ? { ...m, enabled: !m.enabled } : m
    ));
    toast({
      title: model.enabled ? '模型已停用' : '模型已启用',
      description: `${model.name} 状态已更新`,
    });
  };

  const handleOpenConfig = (model: AIModel) => {
    setSelectedModel(model);
    setTempLimits({ rpm: model.rpmLimit, tpm: model.tpmLimit });
    setShowConfigDialog(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedModel) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setModels(prev => prev.map(m => 
      m.id === selectedModel.id 
        ? { ...m, rpmLimit: tempLimits.rpm, tpmLimit: tempLimits.tpm }
        : m
    ));
    
    setIsSaving(false);
    setShowConfigDialog(false);
    toast({
      title: '配置已保存',
      description: `${selectedModel.name} 限流配置已更新`,
    });
  };

  const getUsageLevel = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'high';
    if (percentage >= 70) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">模型管理</h2>
          <p className="text-sm text-muted-foreground">配置可用的 AI 模型及限流策略</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>实时监控更新中</span>
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => {
          const rpmLevel = getUsageLevel(model.currentRpm, model.rpmLimit);
          const tpmLevel = getUsageLevel(model.currentTpm, model.tpmLimit);
          
          return (
            <div 
              key={model.id}
              className={cn(
                "enterprise-card p-5 transition-all duration-200",
                !model.enabled && "opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{model.icon}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{model.name}</h3>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </div>
                </div>
                <Switch 
                  checked={model.enabled}
                  onCheckedChange={() => handleToggleModel(model)}
                />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">{model.description}</p>

              {/* Usage Meters */}
              {model.enabled && (
                <div className="space-y-3 mb-4">
                  {/* RPM */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">RPM (请求/分钟)</span>
                      <span className={cn(
                        "font-medium",
                        rpmLevel === 'high' ? "text-destructive" :
                        rpmLevel === 'medium' ? "text-warning" : "text-foreground"
                      )}>
                        {model.currentRpm} / {model.rpmLimit}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          rpmLevel === 'high' ? "bg-destructive" :
                          rpmLevel === 'medium' ? "bg-warning" : "bg-primary"
                        )}
                        style={{ width: `${(model.currentRpm / model.rpmLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* TPM */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">TPM (Token/分钟)</span>
                      <span className={cn(
                        "font-medium",
                        tpmLevel === 'high' ? "text-destructive" :
                        tpmLevel === 'medium' ? "text-warning" : "text-foreground"
                      )}>
                        {(model.currentTpm / 1000).toFixed(1)}K / {(model.tpmLimit / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          tpmLevel === 'high' ? "bg-destructive" :
                          tpmLevel === 'medium' ? "bg-warning" : "bg-success"
                        )}
                        style={{ width: `${(model.currentTpm / model.tpmLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning */}
                  {(rpmLevel === 'high' || tpmLevel === 'high') && (
                    <div className="flex items-center gap-2 text-xs text-warning p-2 bg-warning/10 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>使用率较高，建议调整限流配置</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => handleOpenConfig(model)}
                >
                  <Settings2 className="w-4 h-4" />
                  配置限流
                </Button>
                <Button 
                  variant={model.enabled ? "destructive" : "default"}
                  size="sm"
                  className="gap-2"
                  onClick={() => handleToggleModel(model)}
                >
                  {model.enabled ? (
                    <>
                      <PowerOff className="w-4 h-4" />
                      停用
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      启用
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModel && (
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{selectedModel.icon}</span>
                  {selectedModel.name} 限流配置
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              设置该模型的请求频率限制，以控制资源使用
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rpm">RPM 限制 (请求/分钟)</Label>
              <Input 
                id="rpm"
                type="number"
                value={tempLimits.rpm}
                onChange={(e) => setTempLimits(prev => ({ ...prev, rpm: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">建议值: 40-100</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpm">TPM 限制 (Token/分钟)</Label>
              <Input 
                id="tpm"
                type="number"
                value={tempLimits.tpm}
                onChange={(e) => setTempLimits(prev => ({ ...prev, tpm: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">建议值: 50,000-200,000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存配置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
