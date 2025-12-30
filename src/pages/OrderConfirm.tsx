import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Terminal, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  type: string;
  name: string;
  details: string[];
  billingMethod: string;
  duration: string;
  quantity: number;
  price: string;
}

export function OrderConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  // Get order data from navigation state or use defaults
  const orderData = location.state?.orderData || {
    region: '华北1（北京）',
    ecs: { quantity: 3, specs: '8核16GB', machineType: '标准型S6.8B' },
    mysql: { memory: '1GB', disk: '15GB' },
  };

  const orderItems: OrderItem[] = [
    {
      type: '购买',
      name: '弹性IP',
      details: [
        `数据中心:${orderData.region}`,
        '链路类型:BGP',
        'IP类型:ipv4',
        '产品属性:弹性IP',
        '带宽:5Mbps',
      ],
      billingMethod: '按量付费（按日月结）',
      duration: '--',
      quantity: 1,
      price: '¥ 4.03226/天',
    },
    {
      type: '购买',
      name: '极速系统盘(PL1)',
      details: [
        `数据中心:${orderData.region}`,
        '类型:ESSD_SYSTEM_PL1',
        '可用区:可用区A',
        '容量:50G',
      ],
      billingMethod: '按量付费（按日月结）',
      duration: '--',
      quantity: 1,
      price: '¥ 1.6129/天',
    },
    {
      type: '购买',
      name: '高效型SE9',
      details: [
        '云服务器名称:KSC-IN-S41FF67989',
        `数据中心:${orderData.region}`,
        '可用区:可用区A',
        '类型:高效型SE9',
        `CPU:${orderData.ecs.specs.split('核')[0]}核`,
        `内存:${orderData.ecs.specs.split('核')[1]}`,
      ],
      billingMethod: '按量付费（按日月结）',
      duration: '--',
      quantity: orderData.ecs.quantity,
      price: '¥ 8.96129/天',
    },
    {
      type: '购买',
      name: 'KMR服务',
      details: [
        `数据中心:${orderData.region}`,
        '可用区:可用区A',
        '主机规格:SE9.4B',
        '集群类型:KMR',
        '集群ID:3a02f192-314a-4a1b-beeb-bf9b85ec03bc',
        '集群版本:Dify',
        '集群操作:create',
      ],
      billingMethod: '按量付费（按日月结）',
      duration: '--',
      quantity: 1,
      price: '¥ 1.49419/天',
    },
  ];

  const totalPrice = 0.00; // Trial mode

  const handleSubmit = () => {
    if (!agreed) {
      toast({ title: '请先阅读并同意服务协议', variant: 'destructive' });
      return;
    }
    toast({ title: '订单提交成功', description: '正在为您开通服务...' });
    navigate('/console');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">KSGC</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Back Button & Title */}
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-1 text-foreground hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-lg font-medium">确认订单</span>
          </button>

          {/* Order Table */}
          <div className="bg-white rounded-lg border border-border overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-sm text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">订单类型</th>
                  <th className="text-left px-4 py-3 font-medium">产品名称</th>
                  <th className="text-left px-4 py-3 font-medium">配置详情</th>
                  <th className="text-left px-4 py-3 font-medium">计费方式</th>
                  <th className="text-left px-4 py-3 font-medium">购买时长</th>
                  <th className="text-center px-4 py-3 font-medium">数量</th>
                  <th className="text-right px-4 py-3 font-medium">商品金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orderItems.map((item, index) => (
                  <tr key={index} className="text-sm">
                    <td className="px-4 py-4 text-muted-foreground">{item.type}</td>
                    <td className="px-4 py-4 text-foreground font-medium">{item.name}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5 text-muted-foreground text-xs">
                        {item.details.map((detail, idx) => (
                          <p key={idx}>{detail}</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{item.billingMethod}</td>
                    <td className="px-4 py-4 text-muted-foreground">{item.duration}</td>
                    <td className="px-4 py-4 text-center text-foreground">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-orange-500 font-medium">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-2 mb-6">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="agreement" className="text-sm text-muted-foreground">
              我已阅读并同意{' '}
              <a href="#" className="text-primary hover:underline">《金山云产品服务协议(通用服务协议)》</a>{' '}
              <a href="#" className="text-primary hover:underline">《服务器KEC服务使用协议》</a>{' '}
              <a href="#" className="text-primary hover:underline">《弹性IP服务使用协议》</a>{' '}
              <a href="#" className="text-primary hover:underline">《基础防护服务使用协议》</a>{' '}
              <a href="#" className="text-primary hover:underline">《托管Hadoop服务使用协议》</a>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-6">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">商品合计：<span className="text-foreground font-medium">¥ {totalPrice.toFixed(2)}</span></span>
            <span className="text-muted-foreground">优惠金额：<span className="text-foreground font-medium">¥ {totalPrice.toFixed(2)}</span></span>
            <span className="text-muted-foreground">应付款：<span className="text-foreground">以实际账单金额为准</span></span>
          </div>
          <Button
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            提交订单
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default OrderConfirm;
