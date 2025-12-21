import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SubscriptionUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  currentSeats?: number;
}

const SEAT_OPTIONS = [5, 10, 20, 50, 100, 200, 300, 500, 1000];

const DURATION_OPTIONS = [
  { value: "1", label: "1个月" },
  { value: "2", label: "2个月" },
  { value: "3", label: "3个月" },
  { value: "4", label: "4个月" },
  { value: "5", label: "5个月" },
  { value: "6", label: "6个月" },
  { value: "7", label: "7个月" },
  { value: "8", label: "8个月" },
  { value: "9", label: "9个月" },
  { value: "10", label: "10个月" },
  { value: "11", label: "11个月" },
  { value: "12", label: "12个月" },
  { value: "24", label: "2年" },
  { value: "36", label: "3年" },
];

export function SubscriptionUpgradeDialog({
  open,
  onOpenChange,
  currentPlan = "basic",
  currentSeats = 5,
}: SubscriptionUpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "professional">(
    currentPlan === "professional" ? "professional" : "basic"
  );
  const [selectedSeats, setSelectedSeats] = useState<number>(currentSeats);
  const [billingType, setBillingType] = useState<"prepaid" | "postpaid">("prepaid");
  const [duration, setDuration] = useState<string>("1");

  const isProfessional = currentPlan === "professional";

  const planDetails = useMemo(() => ({
    basic: {
      name: "基础版",
      price: 99,
      features: ["基础AI模型访问", "标准技术支持", "日志保存3个月"],
    },
    professional: {
      name: "专业版",
      price: 199,
      features: ["支持多模态模型使用", "支持调用明细查看", "日志保存时间 > 3个月", "全部AI模型访问"],
    },
  }), []);

  // Filter seat options - cannot reduce seats
  const availableSeatOptions = SEAT_OPTIONS.filter(seats => seats >= currentSeats);

  const calculateTotal = () => {
    const basePrice = planDetails[selectedPlan].price;
    const months = parseInt(duration);
    if (billingType === "prepaid") {
      let discount = 1;
      if (months >= 12) discount = 0.85;
      else if (months >= 6) discount = 0.9;
      else if (months >= 3) discount = 0.95;
      return (basePrice * selectedSeats * months * discount).toFixed(2);
    }
    return (basePrice * selectedSeats).toFixed(2);
  };

  const handleSubmit = () => {
    console.log({
      plan: selectedPlan,
      seats: selectedSeats,
      billingType,
      duration: billingType === "prepaid" ? duration : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">订阅扩容</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Plan Info */}
          <div className="rounded-lg bg-muted/30 p-3 text-sm">
            <span className="text-muted-foreground">当前订阅：</span>
            <span className="font-medium">{isProfessional ? "专业版" : "基础版"}</span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="font-medium">{currentSeats}人席位</span>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">选择版本</Label>
            <div className="grid grid-cols-2 gap-4">
              {(["basic", "professional"] as const).map((plan) => {
                const isDisabled = isProfessional && plan === "basic";
                return (
                  <div
                    key={plan}
                    onClick={() => !isDisabled && setSelectedPlan(plan)}
                    className={cn(
                      "relative rounded-lg border-2 p-4 transition-all",
                      isDisabled
                        ? "cursor-not-allowed opacity-50 border-border bg-muted/20"
                        : "cursor-pointer",
                      !isDisabled && selectedPlan === plan
                        ? "border-primary bg-primary/5"
                        : !isDisabled && "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    {isDisabled && (
                      <div className="absolute top-2 right-2 text-xs text-destructive font-medium">
                        不支持降级
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{planDetails[plan].name}</span>
                      <span className="text-primary font-semibold">
                        ¥{planDetails[plan].price}/人/月
                      </span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {planDetails[plan].features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="text-primary">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    {!isDisabled && selectedPlan === plan && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seats Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">席位数量</Label>
              <span className="text-xs text-muted-foreground">(不支持减少席位)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SEAT_OPTIONS.map((seats) => {
                const isDisabled = seats < currentSeats;
                return (
                  <Button
                    key={seats}
                    type="button"
                    variant={selectedSeats === seats ? "default" : "outline"}
                    size="sm"
                    onClick={() => !isDisabled && setSelectedSeats(seats)}
                    disabled={isDisabled}
                    className={cn(
                      "min-w-[70px]",
                      isDisabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {seats}人
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Billing Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">计费方式</Label>
            <RadioGroup
              value={billingType}
              onValueChange={(v) => setBillingType(v as "prepaid" | "postpaid")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prepaid" id="prepaid" />
                <Label htmlFor="prepaid" className="cursor-pointer font-normal">
                  包年包月
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="postpaid" id="postpaid" />
                <Label htmlFor="postpaid" className="cursor-pointer font-normal">
                  按日月结
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Duration (only for prepaid) */}
          {billingType === "prepaid" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">订阅时长</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择时长" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                3个月及以上享95折，6个月及以上享9折，12个月及以上享85折
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">版本</span>
              <span>{planDetails[selectedPlan].name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">席位</span>
              <span>{selectedSeats}人</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">计费方式</span>
              <span>{billingType === "prepaid" ? "包年包月" : "按日月结"}</span>
            </div>
            {billingType === "prepaid" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">时长</span>
                <span>{DURATION_OPTIONS.find((d) => d.value === duration)?.label}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
              <span className="font-medium">
                {billingType === "prepaid" ? "预估总价" : "预估月费"}
              </span>
              <span className="text-xl font-semibold text-primary">
                ¥{calculateTotal()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>确认订阅</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
