import React, { useState } from "react";
import { Search, Info, Copy, Check, AlertTriangle, Users, Building2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ModelSwitching } from "./ModelSwitching";

interface Model {
  id: string;
  name: string;
  type: "text" | "vision";
  contextLimit: string;
  rpmCurrent: number;
  rpmLimit: number;
  tpmCurrent: number;
  tpmLimit: number;
  description: string;
  enabled: boolean;
  allowedMembers: string[];
  allowedDepartments: string[];
}

// Mock data for members and departments
const mockMembersList = [
  { id: "m1", name: "张明", department: "技术部" },
  { id: "m2", name: "李华", department: "产品部" },
  { id: "m3", name: "王芳", department: "设计部" },
  { id: "m4", name: "陈强", department: "研发部" },
  { id: "m5", name: "刘洋", department: "运营部" },
];

const mockDepartmentsList = [
  { id: "d1", name: "技术中心" },
  { id: "d2", name: "前端开发组" },
  { id: "d3", name: "后端开发组" },
  { id: "d4", name: "产品设计部" },
  { id: "d5", name: "市场运营部" },
];

const mockModels: Model[] = [
  {
    id: "kimi-k2-thinking-turbo",
    name: "kimi-k2-thinking-turbo",
    type: "text",
    contextLimit: "256k",
    rpmCurrent: 45,
    rpmLimit: 1000,
    tpmCurrent: 25800,
    tpmLimit: 150000,
    description: "是 kimi-k2-thinking 模型的高速版，适用于需要深度推理能力和快速响应的场景。",
    enabled: false,
    allowedMembers: [],
    allowedDepartments: [],
  },
  {
    id: "qwen3-coder-480b-a35b-instruct",
    name: "qwen3-coder-480b-a35b-instruct",
    type: "text",
    contextLimit: "256k",
    rpmCurrent: 120,
    rpmLimit: 800,
    tpmCurrent: 98000,
    tpmLimit: 120000,
    description: "Qwen3-Coder-480B-A35B-Instruct 是 Qwen 团队近期超大规模代码模型。",
    enabled: false,
    allowedMembers: ["m1", "m2"],
    allowedDepartments: ["d1"],
  },
  {
    id: "kimi-k2-turbo-preview",
    name: "kimi-k2-turbo-preview",
    type: "text",
    contextLimit: "256k",
    rpmCurrent: 0,
    rpmLimit: 1200,
    tpmCurrent: 0,
    tpmLimit: 200000,
    description: "Kimi-K2-Turbo-Preview 是基于 Kimi K2 的高速版本，主要面向长文本处理。",
    enabled: false,
    allowedMembers: [],
    allowedDepartments: [],
  },
  {
    id: "yi-vision-v2",
    name: "yi-vision-v2",
    type: "vision",
    contextLimit: "128k",
    rpmCurrent: 15,
    rpmLimit: 500,
    tpmCurrent: 5800,
    tpmLimit: 80000,
    description: "Yi Vision V2 具有卓越的图像理解能力，支持复杂场景识别。",
    enabled: false,
    allowedMembers: [],
    allowedDepartments: ["d2", "d3"],
  },
  {
    id: "kimi-k2-ksyun",
    name: "kimi-k2-ksyun",
    type: "text",
    contextLimit: "256k",
    rpmCurrent: 0,
    rpmLimit: 1000,
    tpmCurrent: 0,
    tpmLimit: 150000,
    description: "由 Moonshot AI 发布的国内首个开源万亿参数模型。",
    enabled: false,
    allowedMembers: [],
    allowedDepartments: [],
  },
  {
    id: "minimax_m2",
    name: "minimax_m2",
    type: "vision",
    contextLimit: "128k",
    rpmCurrent: 0,
    rpmLimit: 600,
    tpmCurrent: 0,
    tpmLimit: 100000,
    description: "MiniMax M2 拥有强大的多模态处理能力，适合复杂任务场景。",
    enabled: false,
    allowedMembers: [],
    allowedDepartments: [],
  },
  {
    id: "deepseek-v3.2",
    name: "deepseek-v3.2",
    type: "text",
    contextLimit: "128k",
    rpmCurrent: 850,
    rpmLimit: 1500,
    tpmCurrent: 188000,
    tpmLimit: 250000,
    description: "DeepSeek-V3.2 的核心是平衡推理能力与输出长度，适合日常对话。",
    enabled: false,
    allowedMembers: ["m3"],
    allowedDepartments: [],
  },
  {
    id: "glm-4v-plus",
    name: "glm-4v-plus",
    type: "vision",
    contextLimit: "128k",
    rpmCurrent: 0,
    rpmLimit: 500,
    tpmCurrent: 0,
    tpmLimit: 80000,
    description: "GLM-4V Plus 智谱新一代多模态大模型，视觉能力大幅提升。",
    enabled: false,
    allowedMembers: [],
    allowedDepartments: [],
  },
];

type FilterType = "all" | "text" | "vision" | "enabled" | "disabled";

export function ModelManagement() {
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>(mockModels);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [tempLimits, setTempLimits] = useState({ rpm: 0, tpm: 0 });
  const [tempAllowedMembers, setTempAllowedMembers] = useState<string[]>([]);
  const [tempAllowedDepartments, setTempAllowedDepartments] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(["all"]);
  const [copied, setCopied] = useState(false);

  // 服务开通相关状态
  const [isServiceActivated, setIsServiceActivated] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [pendingModel, setPendingModel] = useState<Model | null>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [autoEnableNewModels, setAutoEnableNewModels] = useState(true);
  const [pendingEnableAll, setPendingEnableAll] = useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("--model <model_name>");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "已复制到剪贴板" });
  };

  const toggleFilter = (filter: FilterType) => {
    if (filter === "all") {
      setActiveFilters(["all"]);
    } else {
      const newFilters = activeFilters.filter((f) => f !== "all");
      if (newFilters.includes(filter)) {
        const result = newFilters.filter((f) => f !== filter);
        setActiveFilters(result.length ? result : ["all"]);
      } else {
        setActiveFilters([...newFilters, filter]);
      }
    }
  };

  // 筛选状态
  const [typeFilter, setTypeFilter] = useState<"all" | "text" | "vision">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all");

  const filteredModels = models
    .filter((model) => {
      // 名称筛选
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 模型类型筛选
      const matchesType = typeFilter === "all" || model.type === typeFilter;

      // 开通状态筛选
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && model.enabled) ||
        (statusFilter === "disabled" && !model.enabled);

      return matchesSearch && matchesType && matchesStatus;
    })
    // 按模型类型和模型名称排序
    .sort((a, b) => {
      // 先按类型排序 (text 在前, vision 在后)
      if (a.type !== b.type) {
        return a.type === "text" ? -1 : 1;
      }
      // 再按名称排序
      return a.name.localeCompare(b.name);
    });

  const textModelsEnabled = models.filter((m) => m.type === "text" && m.enabled).length;
  const textModelsTotal = models.filter((m) => m.type === "text").length;
  const visionModelsEnabled = models.filter((m) => m.type === "vision" && m.enabled).length;
  const visionModelsTotal = models.filter((m) => m.type === "vision").length;

  // 是否满足最低开启要求
  const meetsMinimumRequirement = textModelsEnabled >= 1 && visionModelsEnabled >= 1;

  const handleToggleModel = (model: Model) => {
    // 如果是关闭模型，需要校验
    if (model.enabled) {
      // 计算关闭后的启用数量
      const textEnabledAfter = model.type === "text" ? textModelsEnabled - 1 : textModelsEnabled;
      const visionEnabledAfter = model.type === "vision" ? visionModelsEnabled - 1 : visionModelsEnabled;

      // 校验是否满足最低要求
      if (textEnabledAfter < 1 || visionEnabledAfter < 1) {
        toast({
          title: "无法关闭模型",
          description: "系统要求文本模型和视觉理解模型各至少开启一个",
          variant: "destructive",
        });
        return;
      }

      // 可以关闭
      setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, enabled: false } : m)));
      toast({
        title: "模型已禁用",
        description: `${model.name} 状态已更新`,
      });
    } else {
      // 开启模型 - 检查是否首次开启服务
      if (!isServiceActivated) {
        setPendingModel(model);
        setShowActivationDialog(true);
        return;
      }

      // 已开通服务，直接启用
      setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, enabled: true } : m)));
      toast({
        title: "模型已启用",
        description: `${model.name} 状态已更新`,
      });
    }
  };

  const handleActivateService = async () => {
    if (!agreementChecked) {
      toast({
        title: "请先同意服务协议",
        description: "需要勾选同意《星流平台 API 服务协议》后才能开通",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    // 模拟开通服务
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsServiceActivated(true);
    setIsActivating(false);
    setShowActivationDialog(false);
    setAgreementChecked(false);

    // 开通成功后启用待开启的模型
    // 开通成功后处理待开启的操作
    if (pendingEnableAll) {
      // 全部开启
      setModels((prev) => prev.map((m) => ({ ...m, enabled: true })));
      toast({
        title: "服务开通成功",
        description: "星流平台 API 服务已开通，所有模型已启用",
      });
      setPendingEnableAll(false);
    } else if (pendingModel) {
      setModels((prev) => prev.map((m) => (m.id === pendingModel.id ? { ...m, enabled: true } : m)));
      toast({
        title: "服务开通成功",
        description: `星流平台 API 服务已开通，${pendingModel.name} 已启用`,
      });
      setPendingModel(null);
    }
  };

  const handleEnableAll = () => {
    // 如果服务未开通，先弹出开通对话框
    if (!isServiceActivated) {
      setPendingEnableAll(true);
      setShowActivationDialog(true);
      return;
    }

    // 已开通服务，直接启用全部
    setModels((prev) => prev.map((m) => ({ ...m, enabled: true })));
    toast({
      title: "全部模型已启用",
      description: "所有模型状态已更新",
    });
  };

  const handleOpenConfig = (model: Model) => {
    setSelectedModel(model);
    setTempLimits({ rpm: model.rpmLimit, tpm: model.tpmLimit });
    setTempAllowedMembers(model.allowedMembers || []);
    setTempAllowedDepartments(model.allowedDepartments || []);
    setShowConfigDialog(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedModel) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setModels((prev) =>
      prev.map((m) => (m.id === selectedModel.id ? { 
        ...m, 
        rpmLimit: tempLimits.rpm, 
        tpmLimit: tempLimits.tpm,
        allowedMembers: tempAllowedMembers,
        allowedDepartments: tempAllowedDepartments,
      } : m)),
    );

    setIsSaving(false);
    setShowConfigDialog(false);
    toast({
      title: "配置已保存",
      description: `${selectedModel.name} 配置已更新`,
    });
  };

  const toggleMember = (memberId: string) => {
    setTempAllowedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleDepartment = (deptId: string) => {
    setTempAllowedDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const getMemberName = (id: string) => mockMembersList.find(m => m.id === id)?.name || id;
  const getDepartmentName = (id: string) => mockDepartmentsList.find(d => d.id === id)?.name || id;

  return (
    <Tabs defaultValue="models" className="space-y-4 animate-fade-in">
      <TabsList>
        <TabsTrigger value="models">模型开通管理</TabsTrigger>
        <TabsTrigger value="switching">模型切换</TabsTrigger>
      </TabsList>

      <TabsContent value="models" className="space-y-4">
      <div className="flex items-center gap-2 bg-accent border border-primary/20 rounded px-4 py-2.5">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm text-foreground">启用的模型可以在 CLI 工具中通过</span>
        <code className="text-sm text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">\model</code>
        <span className="text-sm text-foreground">命令切换</span>
        <button onClick={handleCopyCommand} className="ml-1 text-primary hover:text-primary/80 transition-colors">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Warning Bar - 只在不满足最低要求时显示 */}
      {!meetsMinimumRequirement && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded px-4 py-2.5">
          <span className="text-sm text-foreground">
            为了保障 KSGC 产品正常运行，系统要求
            <span className="text-primary mx-1 font-medium">文本模型</span>和
            <span className="text-primary mx-1 font-medium">视觉理解模型</span>
            各至少开启一个。
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm">文本大模型</span>
            <Badge variant={textModelsEnabled > 0 ? "default" : "destructive"} className="text-xs">
              {textModelsEnabled > 0 ? "已启用" : "未启用"}
            </Badge>
            <span className="text-sm">视觉理解模型</span>
            <Badge variant={visionModelsEnabled > 0 ? "default" : "destructive"} className="text-xs">
              {visionModelsEnabled > 0 ? "已启用" : "未启用"}
            </Badge>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索模型名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-card border-border w-48"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "text" | "vision")}>
            <SelectTrigger className="w-32 h-9 bg-card border-border">
              <SelectValue placeholder="模型类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="text">文本模型</SelectItem>
              <SelectItem value="vision">视觉理解模型</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "enabled" | "disabled")}>
            <SelectTrigger className="w-28 h-9 bg-card border-border">
              <SelectValue placeholder="开通状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="enabled">已开通</SelectItem>
              <SelectItem value="disabled">未开通</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch id="auto-enable" checked={autoEnableNewModels} onCheckedChange={setAutoEnableNewModels} />
            <Label htmlFor="auto-enable" className="text-sm text-muted-foreground cursor-pointer">
              自动开启新模型
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleEnableAll}>
            全部开启
          </Button>
          <div className="text-sm text-muted-foreground">
            文本模型启用 {textModelsEnabled}/{textModelsTotal}, 视觉理解模型启用 {visionModelsEnabled}/
            {visionModelsTotal}
          </div>
        </div>
      </div>

      {/* Model Table */}
      <div className="bg-card rounded border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">模型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">上下文限制</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">每分钟请求数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">每分钟token数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">模型详情</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredModels.map((model) => (
              <tr key={model.id} className="hover:bg-muted/20 transition-colors">
                {/* Model Name & Type */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{model.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-normal w-fit",
                        model.type === "text"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-orange-500/10 text-orange-600 border-orange-500/20",
                      )}
                    >
                      {model.type === "text" ? "文本模型" : "视觉理解模型"}
                    </Badge>
                  </div>
                </td>

                {/* Context Limit */}
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{model.contextLimit}</span>
                </td>

                {/* RPM - 每分钟请求数 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/30 rounded-full"
                        style={{ width: `${Math.min((model.rpmCurrent / model.rpmLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {model.rpmCurrent} / {model.rpmLimit}
                    </span>
                  </div>
                </td>

                {/* TPM - 每分钟令牌数 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/30 rounded-full"
                        style={{ width: `${Math.min((model.tpmCurrent / model.tpmLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {(model.tpmCurrent / 1000).toFixed(1)}K / {(model.tpmLimit / 1000).toFixed(0)}K
                    </span>
                  </div>
                </td>

                {/* Description */}
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <Switch checked={model.enabled} onCheckedChange={() => handleToggleModel(model)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredModels.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">未找到匹配的模型</div>
        )}
      </div>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedModel && `${selectedModel.name} 配置`}</DialogTitle>
            <DialogDescription>设置该模型的请求频率限制和可使用范围</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 限流配置 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">限流配置</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rpm">每分钟请求数限制</Label>
                  <Input
                    id="rpm"
                    type="number"
                    value={tempLimits.rpm}
                    onChange={(e) => setTempLimits((prev) => ({ ...prev, rpm: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tpm">每分钟令牌数限制</Label>
                  <Input
                    id="tpm"
                    type="number"
                    value={tempLimits.tpm}
                    onChange={(e) => setTempLimits((prev) => ({ ...prev, tpm: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* 可使用成员配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">可使用成员</Label>
                <span className="text-xs text-muted-foreground">(留空表示所有成员可用)</span>
              </div>
              {tempAllowedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tempAllowedMembers.map(id => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {getMemberName(id)}
                      <button onClick={() => toggleMember(id)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-1">
                  {mockMembersList.map(member => (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                        tempAllowedMembers.includes(member.id) && "bg-primary/10"
                      )}
                      onClick={() => toggleMember(member.id)}
                    >
                      <Checkbox checked={tempAllowedMembers.includes(member.id)} />
                      <span className="text-sm">{member.name}</span>
                      <span className="text-xs text-muted-foreground">({member.department})</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* 可使用组织配置 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">可使用组织</Label>
                <span className="text-xs text-muted-foreground">(留空表示所有组织可用)</span>
              </div>
              {tempAllowedDepartments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tempAllowedDepartments.map(id => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {getDepartmentName(id)}
                      <button onClick={() => toggleDepartment(id)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-1">
                  {mockDepartmentsList.map(dept => (
                    <div
                      key={dept.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                        tempAllowedDepartments.includes(dept.id) && "bg-primary/10"
                      )}
                      onClick={() => toggleDepartment(dept.id)}
                    >
                      <Checkbox checked={tempAllowedDepartments.includes(dept.id)} />
                      <span className="text-sm">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存配置"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Activation Dialog */}
      <Dialog
        open={showActivationDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowActivationDialog(false);
            setPendingModel(null);
            setPendingEnableAll(false);
            setAgreementChecked(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              开通星流平台 API 服务
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              KSGC CLI 工具会调用金山云星流平台 API 服务，检测到账号暂未开通该服务，系统将自动开通星流平台 API 服务。
            </p>
            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="agreement"
                checked={agreementChecked}
                onCheckedChange={(checked) => setAgreementChecked(checked === true)}
              />
              <label htmlFor="agreement" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                我已阅读并同意
                <a href="#" className="text-primary hover:underline mx-1" onClick={(e) => e.stopPropagation()}>
                  《星流平台 API 服务协议》
                </a>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowActivationDialog(false);
                setPendingModel(null);
                setPendingEnableAll(false);
                setAgreementChecked(false);
              }}
            >
              取消
            </Button>
            <Button onClick={handleActivateService} disabled={!agreementChecked || isActivating}>
              {isActivating ? "开通中..." : "确认开通"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </TabsContent>

      <TabsContent value="switching">
        <ModelSwitching />
      </TabsContent>
    </Tabs>
  );
}
