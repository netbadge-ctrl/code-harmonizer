import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  XCircle,
  RefreshCw,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  Zap,
  Phone,
  Mail,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EnabledModel {
  id: string;
  name: string;
  type: "text" | "vision";
  status: "normal" | "degraded" | "error";
  latency: number; // 当前响应时间 ms
  failureCount: number; // 60秒内失败次数
  lastChecked: Date;
}

interface ModelSwitch {
  id: string;
  sourceModel: string;
  targetModel: string;
  reason: "latency" | "failure";
  switchedAt: Date;
  autoRecover: boolean;
}

// 模拟已开通的模型及其状态
const mockModels: EnabledModel[] = [
  { 
    id: "kimi-k2-thinking-turbo", 
    name: "kimi-k2-thinking-turbo", 
    type: "text",
    status: "degraded",
    latency: 8500,
    failureCount: 2,
    lastChecked: new Date()
  },
  { 
    id: "qwen3-coder-480b-a35b-instruct", 
    name: "qwen3-coder-480b-a35b-instruct", 
    type: "text",
    status: "normal",
    latency: 1200,
    failureCount: 0,
    lastChecked: new Date()
  },
  { 
    id: "deepseek-v3.2", 
    name: "deepseek-v3.2", 
    type: "text",
    status: "error",
    latency: 0,
    failureCount: 5,
    lastChecked: new Date()
  },
  { 
    id: "yi-vision-v2", 
    name: "yi-vision-v2", 
    type: "vision",
    status: "normal",
    latency: 2100,
    failureCount: 0,
    lastChecked: new Date()
  },
  { 
    id: "glm-4v-plus", 
    name: "glm-4v-plus", 
    type: "vision",
    status: "degraded",
    latency: 6800,
    failureCount: 1,
    lastChecked: new Date()
  },
];

// 模拟当前活跃的切换记录
const mockActiveSwitches: ModelSwitch[] = [
  {
    id: "switch-1",
    sourceModel: "deepseek-v3.2",
    targetModel: "qwen3-coder-480b-a35b-instruct",
    reason: "failure",
    switchedAt: new Date(Date.now() - 1800000), // 30分钟前
    autoRecover: true,
  }
];

export function ModelSwitching() {
  const { toast } = useToast();
  const [models, setModels] = useState<EnabledModel[]>(mockModels);
  const [activeSwitches, setActiveSwitches] = useState<ModelSwitch[]>(mockActiveSwitches);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [selectedSourceModel, setSelectedSourceModel] = useState<EnabledModel | null>(null);
  const [selectedTargetModelId, setSelectedTargetModelId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 告警联系方式
  const [alertPhone, setAlertPhone] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertContactSaved, setAlertContactSaved] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const getModelName = (modelId: string) => {
    return models.find(m => m.id === modelId)?.name || modelId;
  };

  const getModelStatus = (modelId: string) => {
    return models.find(m => m.id === modelId)?.status || "normal";
  };

  const getStatusBadge = (status: EnabledModel["status"]) => {
    switch (status) {
      case "normal":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            正常
          </Badge>
        );
      case "degraded":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            延迟
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            异常
          </Badge>
        );
    }
  };

  const getAvailableTargets = (sourceModel: EnabledModel) => {
    return models.filter(m => 
      m.id !== sourceModel.id && 
      m.type === sourceModel.type && 
      m.status === "normal"
    );
  };

  const handleOpenSwitchDialog = (model: EnabledModel) => {
    setSelectedSourceModel(model);
    const availableTargets = getAvailableTargets(model);
    if (availableTargets.length > 0) {
      setSelectedTargetModelId(availableTargets[0].id);
    } else {
      setSelectedTargetModelId("");
    }
    setShowSwitchDialog(true);
  };

  const handleSwitch = () => {
    if (!selectedSourceModel || !selectedTargetModelId) return;

    const newSwitch: ModelSwitch = {
      id: `switch-${Date.now()}`,
      sourceModel: selectedSourceModel.id,
      targetModel: selectedTargetModelId,
      reason: selectedSourceModel.status === "error" ? "failure" : "latency",
      switchedAt: new Date(),
      autoRecover: true,
    };

    setActiveSwitches(prev => [...prev, newSwitch]);
    setShowSwitchDialog(false);
    
    toast({
      title: "模型切换成功",
      description: (
        <div className="space-y-1">
          <p>已将 <strong>{selectedSourceModel.name}</strong> 的调用切换到 <strong>{getModelName(selectedTargetModelId)}</strong></p>
          <p className="text-xs text-muted-foreground">当原模型恢复正常后，系统将自动切换回来</p>
        </div>
      ),
    });
  };

  const handleCancelSwitch = (switchId: string) => {
    const switchRecord = activeSwitches.find(s => s.id === switchId);
    setActiveSwitches(prev => prev.filter(s => s.id !== switchId));
    
    toast({
      title: "已恢复原模型",
      description: `${getModelName(switchRecord?.sourceModel || "")} 的调用已恢复`,
    });
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    
    // 模拟刷新状态
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟状态变化 - 随机让一个模型恢复正常
    setModels(prev => prev.map(m => {
      if (m.id === "deepseek-v3.2" && Math.random() > 0.5) {
        return { ...m, status: "normal" as const, failureCount: 0, latency: 1500, lastChecked: new Date() };
      }
      return { ...m, lastChecked: new Date() };
    }));

    setIsRefreshing(false);
    toast({
      title: "状态已刷新",
      description: "已获取最新的模型服务状态",
    });
  };

  // 模拟自动恢复检测
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSwitches(prev => {
        const toRecover: ModelSwitch[] = [];
        const remaining = prev.filter(s => {
          const sourceModel = models.find(m => m.id === s.sourceModel);
          if (sourceModel?.status === "normal" && s.autoRecover) {
            toRecover.push(s);
            return false;
          }
          return true;
        });

        if (toRecover.length > 0) {
          toRecover.forEach(s => {
            toast({
              title: "模型已自动恢复",
              description: `${getModelName(s.sourceModel)} 服务已恢复正常，调用已自动切换回来`,
            });
          });
        }

        return remaining;
      });
    }, 10000); // 每10秒检查一次

    return () => clearInterval(interval);
  }, [models, toast]);

  const problematicModels = models.filter(m => m.status !== "normal");
  const normalModels = models.filter(m => m.status === "normal");

  const formatTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    return `${hours}小时前`;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveAlertContact = () => {
    let hasError = false;
    
    if (!alertPhone.trim()) {
      setPhoneError("请输入手机号");
      hasError = true;
    } else if (!validatePhone(alertPhone)) {
      setPhoneError("请输入有效的手机号");
      hasError = true;
    } else {
      setPhoneError("");
    }
    
    if (!alertEmail.trim()) {
      setEmailError("请输入邮箱");
      hasError = true;
    } else if (!validateEmail(alertEmail)) {
      setEmailError("请输入有效的邮箱地址");
      hasError = true;
    } else {
      setEmailError("");
    }
    
    if (hasError) return;
    
    setAlertContactSaved(true);
    toast({
      title: "告警联系方式已保存",
      description: "模型异常告警将发送至您配置的手机号和邮箱",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Alert Contact Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">告警通知配置</CardTitle>
            {alertContactSaved && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 ml-2">
                <Check className="w-3 h-3 mr-1" />
                已配置
              </Badge>
            )}
          </div>
          <CardDescription>
            配置接收模型告警通知的联系方式，确保及时收到模型异常提醒
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alertPhone" className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                手机号 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="alertPhone"
                placeholder="请输入接收告警的手机号"
                value={alertPhone}
                onChange={(e) => {
                  setAlertPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                className={cn(phoneError && "border-destructive")}
              />
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertEmail" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="alertEmail"
                type="email"
                placeholder="请输入接收告警的邮箱"
                value={alertEmail}
                onChange={(e) => {
                  setAlertEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={cn(emailError && "border-destructive")}
              />
              {emailError && <p className="text-xs text-destructive">{emailError}</p>}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveAlertContact}>
              保存告警联系方式
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Bar */}
      <div className="flex items-center gap-2 bg-accent border border-primary/20 rounded px-4 py-2.5">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm text-foreground">
          当模型响应时间过长或60秒内多次失败时，可手动选择替代模型进行切换。原模型恢复正常后，系统将自动切换回来
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={handleRefreshStatus}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
          刷新状态
        </Button>
      </div>

      {/* Active Switches Alert */}
      {activeSwitches.length > 0 && (
        <Alert className="border-primary/30 bg-primary/5">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">当前存在模型切换</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {activeSwitches.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{getModelName(s.sourceModel)}</span>
                      {getStatusBadge(getModelStatus(s.sourceModel))}
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{getModelName(s.targetModel)}</span>
                      {getStatusBadge("normal")}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      · 切换于 {formatTimeSince(s.switchedAt)}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancelSwitch(s.id)}
                  >
                    恢复原模型
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Problematic Models */}
      {problematicModels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-base">需要关注的模型</CardTitle>
            </div>
            <CardDescription>
              以下模型存在延迟或异常，建议切换到替代模型
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problematicModels.map(model => {
                const availableTargets = getAvailableTargets(model);
                const isAlreadySwitched = activeSwitches.some(s => s.sourceModel === model.id);
                
                return (
                  <div 
                    key={model.id}
                    className={cn(
                      "flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3 border",
                      model.status === "error" && "border-destructive/30 bg-destructive/5",
                      model.status === "degraded" && "border-yellow-500/30 bg-yellow-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {getStatusBadge(model.status)}
                          <Badge variant="outline" className="text-xs">
                            {model.type === "text" ? "文本" : "视觉"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {model.latency > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              响应时间: {model.latency}ms
                            </span>
                          )}
                          {model.failureCount > 0 && (
                            <span className="flex items-center gap-1 text-destructive">
                              <XCircle className="w-3 h-3" />
                              60秒内失败: {model.failureCount}次
                            </span>
                          )}
                          <span>上次检测: {formatTimeSince(model.lastChecked)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAlreadySwitched ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          已切换
                        </Badge>
                      ) : availableTargets.length > 0 ? (
                        <Button 
                          size="sm"
                          onClick={() => handleOpenSwitchDialog(model)}
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          切换模型
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">无可用替代模型</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Normal Models */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <CardTitle className="text-base">正常运行的模型</CardTitle>
          </div>
          <CardDescription>
            以下模型服务状态正常
          </CardDescription>
        </CardHeader>
        <CardContent>
          {normalModels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无正常运行的模型
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {normalModels.map(model => (
                <div 
                  key={model.id}
                  className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3 border"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      {getStatusBadge(model.status)}
                      <Badge variant="outline" className="text-xs">
                        {model.type === "text" ? "文本" : "视觉"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-600" />
                        响应时间: {model.latency}ms
                      </span>
                      <span>上次检测: {formatTimeSince(model.lastChecked)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Normal Message */}
      {problematicModels.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <p className="font-medium text-foreground">所有模型服务正常运行</p>
          <p className="text-sm mt-1">无需进行模型切换</p>
        </div>
      )}

      {/* Switch Dialog */}
      <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>切换替代模型</DialogTitle>
            <DialogDescription>
              选择一个正常运行的模型来替代当前异常的模型
            </DialogDescription>
          </DialogHeader>
          
          {selectedSourceModel && (
            <div className="space-y-4 py-4">
              {/* Source Model */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">当前异常模型</Label>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border">
                  <span className="font-medium">{selectedSourceModel.name}</span>
                  {getStatusBadge(selectedSourceModel.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedSourceModel.status === "error" 
                    ? `60秒内失败 ${selectedSourceModel.failureCount} 次`
                    : `当前响应时间 ${selectedSourceModel.latency}ms`
                  }
                </div>
              </div>

              {/* Target Model */}
              <div className="space-y-2">
                <Label>选择替代模型</Label>
                <Select 
                  value={selectedTargetModelId} 
                  onValueChange={setSelectedTargetModelId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择替代模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTargets(selectedSourceModel).map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({model.latency}ms)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notice */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>切换说明</AlertTitle>
                <AlertDescription className="text-xs">
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>切换后，所有对 <strong>{selectedSourceModel.name}</strong> 的调用将自动转发到替代模型 <strong>{getModelName(selectedTargetModelId)}</strong>，并按替代模型计费</li>
                    <li>当原模型恢复正常后，系统将自动切换回来</li>
                    <li>您也可以随时手动恢复原模型</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSwitchDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSwitch}
              disabled={!selectedTargetModelId}
            >
              <ArrowRightLeft className="w-4 h-4 mr-1" />
              确认切换
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
