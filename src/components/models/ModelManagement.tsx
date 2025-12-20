import React, { useState } from 'react';
import { Power, PowerOff, Settings2, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockModels } from '@/data/mockData';
import { AIModel } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function ModelManagement() {
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [tempLimits, setTempLimits] = useState({ rpm: 0, tpm: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-info/5 border border-info/20 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-info">
          <AlertTriangle className="w-4 h-4" />
          <span>模型配置变更将实时生效，请谨慎操作。调整限流参数可能影响服务可用性。</span>
        </div>
      </div>

      {/* Header with Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索模型名称或提供商..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          共 {filteredModels.length} 个模型
        </div>
      </div>

      {/* Model Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">模型名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">提供商</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">RPM 使用</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">TPM 使用</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">状态</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredModels.map((model) => {
              const rpmLevel = getUsageLevel(model.currentRpm, model.rpmLimit);
              const tpmLevel = getUsageLevel(model.currentTpm, model.tpmLimit);
              
              return (
                <tr 
                  key={model.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    !model.enabled && "opacity-50"
                  )}
                >
                  {/* Model Name */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{model.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{model.provider}</span>
                  </td>

                  {/* RPM Usage */}
                  <td className="px-4 py-3">
                    {model.enabled ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                rpmLevel === 'high' ? "bg-destructive" :
                                rpmLevel === 'medium' ? "bg-warning" : "bg-primary"
                              )}
                              style={{ width: `${(model.currentRpm / model.rpmLimit) * 100}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-xs font-medium",
                            rpmLevel === 'high' ? "text-destructive" :
                            rpmLevel === 'medium' ? "text-warning" : "text-muted-foreground"
                          )}>
                            {model.currentRpm}/{model.rpmLimit}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* TPM Usage */}
                  <td className="px-4 py-3">
                    {model.enabled ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                tpmLevel === 'high' ? "bg-destructive" :
                                tpmLevel === 'medium' ? "bg-warning" : "bg-success"
                              )}
                              style={{ width: `${(model.currentTpm / model.tpmLimit) * 100}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-xs font-medium",
                            tpmLevel === 'high' ? "text-destructive" :
                            tpmLevel === 'medium' ? "text-warning" : "text-muted-foreground"
                          )}>
                            {(model.currentTpm / 1000).toFixed(0)}K/{(model.tpmLimit / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Switch 
                      checked={model.enabled}
                      onCheckedChange={() => handleToggleModel(model)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary h-auto p-0"
                      onClick={() => handleOpenConfig(model)}
                    >
                      配置
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredModels.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            未找到匹配的模型
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>共 {filteredModels.length} 条</span>
        <div className="flex items-center gap-2">
          <span>10 条/页</span>
        </div>
      </div>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedModel && `${selectedModel.name} 限流配置`}
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