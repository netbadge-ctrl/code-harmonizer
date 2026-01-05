import React, { useState, useRef } from "react";
import { 
  ArrowDown, 
  ArrowUp, 
  GripVertical, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Clock, 
  XCircle,
  Settings2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EnabledModel {
  id: string;
  name: string;
  type: "text" | "vision";
}

interface FallbackRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerCondition: {
    type: "latency" | "failure" | "both";
    latencyThreshold: number; // 毫秒
    failureCount: number; // 失败次数
    timeWindow: number; // 时间窗口（秒）
  };
  modelSequence: string[]; // 模型ID列表，按切换顺序
}

// 模拟已开通的模型
const enabledModels: EnabledModel[] = [
  { id: "kimi-k2-thinking-turbo", name: "kimi-k2-thinking-turbo", type: "text" },
  { id: "qwen3-coder-480b-a35b-instruct", name: "qwen3-coder-480b-a35b-instruct", type: "text" },
  { id: "deepseek-v3.2", name: "deepseek-v3.2", type: "text" },
  { id: "yi-vision-v2", name: "yi-vision-v2", type: "vision" },
  { id: "glm-4v-plus", name: "glm-4v-plus", type: "vision" },
];

// 模拟切换规则
const mockRules: FallbackRule[] = [
  {
    id: "rule-1",
    name: "文本模型切换规则",
    enabled: true,
    triggerCondition: {
      type: "both",
      latencyThreshold: 5000,
      failureCount: 3,
      timeWindow: 60,
    },
    modelSequence: ["kimi-k2-thinking-turbo", "qwen3-coder-480b-a35b-instruct", "deepseek-v3.2"],
  },
  {
    id: "rule-2",
    name: "视觉模型切换规则",
    enabled: false,
    triggerCondition: {
      type: "latency",
      latencyThreshold: 8000,
      failureCount: 5,
      timeWindow: 120,
    },
    modelSequence: ["yi-vision-v2", "glm-4v-plus"],
  },
];

export function ModelFallbackRules() {
  const { toast } = useToast();
  const [rules, setRules] = useState<FallbackRule[]>(mockRules);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<FallbackRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<FallbackRule>>({
    name: "",
    enabled: true,
    triggerCondition: {
      type: "both",
      latencyThreshold: 5000,
      failureCount: 3,
      timeWindow: 60,
    },
    modelSequence: [],
  });

  const getModelName = (modelId: string) => {
    return enabledModels.find(m => m.id === modelId)?.name || modelId;
  };

  const getModelType = (modelId: string) => {
    return enabledModels.find(m => m.id === modelId)?.type || "text";
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
    const rule = rules.find(r => r.id === ruleId);
    toast({
      title: rule?.enabled ? "规则已禁用" : "规则已启用",
      description: `${rule?.name} 状态已更新`,
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast({
      title: "规则已删除",
      description: `${rule?.name} 已被删除`,
    });
  };

  const handleMoveModel = (ruleId: string, modelIndex: number, direction: "up" | "down") => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule;
      const newSequence = [...rule.modelSequence];
      const targetIndex = direction === "up" ? modelIndex - 1 : modelIndex + 1;
      if (targetIndex < 0 || targetIndex >= newSequence.length) return rule;
      [newSequence[modelIndex], newSequence[targetIndex]] = [newSequence[targetIndex], newSequence[modelIndex]];
      return { ...rule, modelSequence: newSequence };
    }));
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.modelSequence?.length) {
      toast({
        title: "请填写完整信息",
        description: "规则名称和模型序列不能为空",
        variant: "destructive",
      });
      return;
    }

    const rule: FallbackRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      enabled: newRule.enabled ?? true,
      triggerCondition: newRule.triggerCondition as FallbackRule["triggerCondition"],
      modelSequence: newRule.modelSequence,
    };

    setRules(prev => [...prev, rule]);
    setShowAddDialog(false);
    setNewRule({
      name: "",
      enabled: true,
      triggerCondition: {
        type: "both",
        latencyThreshold: 5000,
        failureCount: 3,
        timeWindow: 60,
      },
      modelSequence: [],
    });
    toast({
      title: "规则已添加",
      description: `${rule.name} 已创建成功`,
    });
  };

  const handleEditRule = () => {
    if (!selectedRule) return;
    
    setRules(prev => prev.map(r => 
      r.id === selectedRule.id ? selectedRule : r
    ));
    setShowEditDialog(false);
    setSelectedRule(null);
    toast({
      title: "规则已更新",
      description: "切换规则配置已保存",
    });
  };

  const openEditDialog = (rule: FallbackRule) => {
    setSelectedRule({ ...rule });
    setShowEditDialog(true);
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case "latency": return "响应超时";
      case "failure": return "连续失败";
      case "both": return "响应超时或连续失败";
      default: return type;
    }
  };

  const addModelToSequence = (modelId: string) => {
    if (!newRule.modelSequence?.includes(modelId)) {
      setNewRule(prev => ({
        ...prev,
        modelSequence: [...(prev.modelSequence || []), modelId],
      }));
    }
  };

  const removeModelFromSequence = (modelId: string) => {
    setNewRule(prev => ({
      ...prev,
      modelSequence: prev.modelSequence?.filter(id => id !== modelId) || [],
    }));
  };

  const addModelToEditSequence = (modelId: string) => {
    if (selectedRule && !selectedRule.modelSequence.includes(modelId)) {
      setSelectedRule({
        ...selectedRule,
        modelSequence: [...selectedRule.modelSequence, modelId],
      });
    }
  };

  const removeModelFromEditSequence = (modelId: string) => {
    if (selectedRule) {
      setSelectedRule({
        ...selectedRule,
        modelSequence: selectedRule.modelSequence.filter(id => id !== modelId),
      });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Info Bar */}
      <div className="flex items-center gap-2 bg-accent border border-primary/20 rounded px-4 py-2.5">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm text-foreground">
          模型自动切换规则用于在主模型响应变慢或失败时，自动按预设顺序切换到备用模型，确保服务稳定性
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          已配置 {rules.length} 条切换规则，{rules.filter(r => r.enabled).length} 条已启用
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className={cn("border", !rule.enabled && "opacity-60")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <Badge variant={rule.enabled ? "default" : "secondary"}>
                    {rule.enabled ? "已启用" : "已禁用"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={rule.enabled} 
                    onCheckedChange={() => handleToggleRule(rule.id)} 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEditDialog(rule)}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  触发条件: {getTriggerTypeLabel(rule.triggerCondition.type)}
                </span>
                {(rule.triggerCondition.type === "latency" || rule.triggerCondition.type === "both") && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    延迟阈值: {rule.triggerCondition.latencyThreshold}ms
                  </span>
                )}
                {(rule.triggerCondition.type === "failure" || rule.triggerCondition.type === "both") && (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {rule.triggerCondition.timeWindow}秒内失败{rule.triggerCondition.failureCount}次
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">模型切换顺序</Label>
                <div className="flex flex-wrap gap-2">
                  {rule.modelSequence.map((modelId, index) => (
                    <div 
                      key={modelId} 
                      className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border"
                    >
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="text-sm">{getModelName(modelId)}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs ml-1",
                          getModelType(modelId) === "text" 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        )}
                      >
                        {getModelType(modelId) === "text" ? "文本" : "视觉"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无切换规则，点击"添加规则"创建第一条规则
          </div>
        )}
      </div>

      {/* Add Rule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加模型切换规则</DialogTitle>
            <DialogDescription>
              设置当主模型出现问题时，系统自动切换到备用模型的规则
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>规则名称</Label>
              <Input
                placeholder="例如：文本模型切换规则"
                value={newRule.name || ""}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>触发条件</Label>
              <Select 
                value={newRule.triggerCondition?.type || "both"}
                onValueChange={(v) => setNewRule(prev => ({
                  ...prev,
                  triggerCondition: { ...prev.triggerCondition!, type: v as "latency" | "failure" | "both" }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latency">响应超时</SelectItem>
                  <SelectItem value="failure">连续失败</SelectItem>
                  <SelectItem value="both">响应超时或连续失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newRule.triggerCondition?.type === "latency" || newRule.triggerCondition?.type === "both") && (
              <div className="space-y-2">
                <Label>延迟阈值 (毫秒)</Label>
                <Input
                  type="number"
                  value={newRule.triggerCondition?.latencyThreshold || 5000}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    triggerCondition: { ...prev.triggerCondition!, latencyThreshold: parseInt(e.target.value) || 5000 }
                  }))}
                />
              </div>
            )}

            {(newRule.triggerCondition?.type === "failure" || newRule.triggerCondition?.type === "both") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>时间窗口 (秒)</Label>
                  <Input
                    type="number"
                    value={newRule.triggerCondition?.timeWindow || 60}
                    onChange={(e) => setNewRule(prev => ({
                      ...prev,
                      triggerCondition: { ...prev.triggerCondition!, timeWindow: parseInt(e.target.value) || 60 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>失败次数</Label>
                  <Input
                    type="number"
                    value={newRule.triggerCondition?.failureCount || 3}
                    onChange={(e) => setNewRule(prev => ({
                      ...prev,
                      triggerCondition: { ...prev.triggerCondition!, failureCount: parseInt(e.target.value) || 3 }
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>选择模型（按切换顺序）</Label>
              <div className="border rounded-lg p-3 space-y-2">
                <div className="text-xs text-muted-foreground mb-2">可选模型</div>
                <div className="flex flex-wrap gap-2">
                  {enabledModels
                    .filter(m => !newRule.modelSequence?.includes(m.id))
                    .map(model => (
                      <Button
                        key={model.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addModelToSequence(model.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {model.name}
                      </Button>
                    ))}
                </div>
                {newRule.modelSequence && newRule.modelSequence.length > 0 && (
                  <>
                    <div className="text-xs text-muted-foreground mt-3 mb-2">已选模型（按顺序）</div>
                    <div className="space-y-2">
                      {newRule.modelSequence.map((modelId, index) => (
                        <div 
                          key={modelId}
                          className="flex items-center justify-between bg-muted/50 rounded px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <span className="text-sm">{getModelName(modelId)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeModelFromSequence(modelId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddRule}>
              添加规则
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑切换规则</DialogTitle>
            <DialogDescription>
              修改模型切换规则的触发条件和切换顺序
            </DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>规则名称</Label>
                <Input
                  value={selectedRule.name}
                  onChange={(e) => setSelectedRule({ ...selectedRule, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>触发条件</Label>
                <Select 
                  value={selectedRule.triggerCondition.type}
                  onValueChange={(v) => setSelectedRule({
                    ...selectedRule,
                    triggerCondition: { ...selectedRule.triggerCondition, type: v as "latency" | "failure" | "both" }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latency">响应超时</SelectItem>
                    <SelectItem value="failure">连续失败</SelectItem>
                    <SelectItem value="both">响应超时或连续失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedRule.triggerCondition.type === "latency" || selectedRule.triggerCondition.type === "both") && (
                <div className="space-y-2">
                  <Label>延迟阈值 (毫秒)</Label>
                  <Input
                    type="number"
                    value={selectedRule.triggerCondition.latencyThreshold}
                    onChange={(e) => setSelectedRule({
                      ...selectedRule,
                      triggerCondition: { ...selectedRule.triggerCondition, latencyThreshold: parseInt(e.target.value) || 5000 }
                    })}
                  />
                </div>
              )}

              {(selectedRule.triggerCondition.type === "failure" || selectedRule.triggerCondition.type === "both") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>时间窗口 (秒)</Label>
                    <Input
                      type="number"
                      value={selectedRule.triggerCondition.timeWindow}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        triggerCondition: { ...selectedRule.triggerCondition, timeWindow: parseInt(e.target.value) || 60 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>失败次数</Label>
                    <Input
                      type="number"
                      value={selectedRule.triggerCondition.failureCount}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        triggerCondition: { ...selectedRule.triggerCondition, failureCount: parseInt(e.target.value) || 3 }
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>模型切换顺序</Label>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">可选模型</div>
                  <div className="flex flex-wrap gap-2">
                    {enabledModels
                      .filter(m => !selectedRule.modelSequence.includes(m.id))
                      .map(model => (
                        <Button
                          key={model.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addModelToEditSequence(model.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {model.name}
                        </Button>
                      ))}
                  </div>
                  {selectedRule.modelSequence.length > 0 && (
                    <>
                      <div className="text-xs text-muted-foreground mt-3 mb-2">已选模型（拖拽调整顺序）</div>
                      <div className="space-y-2">
                        {selectedRule.modelSequence.map((modelId, index) => (
                          <div 
                            key={modelId}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", index.toString());
                              e.currentTarget.classList.add("opacity-50");
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.classList.remove("opacity-50");
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add("border-primary", "border-2");
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove("border-primary", "border-2");
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove("border-primary", "border-2");
                              const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                              const toIndex = index;
                              if (fromIndex !== toIndex) {
                                const newSequence = [...selectedRule.modelSequence];
                                const [movedItem] = newSequence.splice(fromIndex, 1);
                                newSequence.splice(toIndex, 0, movedItem);
                                setSelectedRule({
                                  ...selectedRule,
                                  modelSequence: newSequence,
                                });
                              }
                            }}
                            className="flex items-center justify-between bg-muted/50 rounded px-3 py-2 cursor-grab active:cursor-grabbing transition-all border border-transparent"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{index + 1}.</span>
                              <span className="text-sm">{getModelName(modelId)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => removeModelFromEditSequence(modelId)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditRule}>
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
