import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Calendar, Filter, Database, Copy, Zap } from "lucide-react";
import { toast } from "sonner";

interface CallRecord {
  id: string;
  timestamp: string;
  user: string;
  model: string;
  client: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  status: "success" | "error" | "timeout";
  prompt: string;
  response: string;
}

const mockCallRecords: CallRecord[] = [
  {
    id: "1",
    timestamp: "2024-03-23 10:45:12",
    user: "zhangwei@tech.com",
    model: "deepseek-v3.2",
    client: "VS Code",
    inputTokens: 450,
    outputTokens: 1200,
    duration: 2.3,
    status: "success",
    prompt: `为以下 React 组件编写一个防抖 (debounce) 自定义 Hook:

\`\`\`tsx
function SearchInput() {
  const [query, setQuery] = useState('');
  // ...
}
\`\`\``,
    response: `好的, 这是一个标准的 \`useDebounce\` Hook 实现:

\`\`\`tsx
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
\`\`\``,
  },
  {
    id: "2",
    timestamp: "2024-03-23 10:30:45",
    user: "lihua@tech.com",
    model: "Claude-3.5-Sonnet",
    client: "Web",
    inputTokens: 2100,
    outputTokens: 1560,
    duration: 3.8,
    status: "success",
    prompt: "请解释 React 中 useCallback 和 useMemo 的区别",
    response: "useCallback 用于缓存函数引用，useMemo 用于缓存计算结果...",
  },
  {
    id: "3",
    timestamp: "2024-03-23 10:28:12",
    user: "wangfang@tech.com",
    model: "GPT-4o",
    client: "API",
    inputTokens: 890,
    outputTokens: 0,
    duration: 30.0,
    status: "timeout",
    prompt: "生成一篇关于人工智能发展历史的长文...",
    response: "",
  },
  {
    id: "4",
    timestamp: "2024-03-23 10:25:33",
    user: "zhangwei@tech.com",
    model: "DeepSeek-V3",
    client: "VS Code",
    inputTokens: 3200,
    outputTokens: 2100,
    duration: 4.2,
    status: "success",
    prompt: "优化以下 SQL 查询语句...",
    response: "这是优化后的 SQL 查询...",
  },
  {
    id: "5",
    timestamp: "2024-03-23 10:22:08",
    user: "chengang@tech.com",
    model: "GPT-4o",
    client: "Web",
    inputTokens: 1500,
    outputTokens: 0,
    duration: 1.2,
    status: "error",
    prompt: "请分析这段代码的问题...",
    response: "",
  },
  {
    id: "6",
    timestamp: "2024-03-23 10:18:55",
    user: "lihua@tech.com",
    model: "Claude-3.5-Sonnet",
    client: "API",
    inputTokens: 980,
    outputTokens: 720,
    duration: 1.9,
    status: "success",
    prompt: "如何实现 JWT 认证？",
    response: "JWT 认证的实现步骤如下...",
  },
  {
    id: "7",
    timestamp: "2024-03-23 10:15:22",
    user: "wangfang@tech.com",
    model: "DeepSeek-V3",
    client: "VS Code",
    inputTokens: 4500,
    outputTokens: 3200,
    duration: 5.6,
    status: "success",
    prompt: "帮我重构这个 React 组件...",
    response: "这是重构后的组件代码...",
  },
  {
    id: "8",
    timestamp: "2024-03-23 10:12:10",
    user: "zhangwei@tech.com",
    model: "GPT-4o",
    client: "Web",
    inputTokens: 780,
    outputTokens: 540,
    duration: 1.5,
    status: "success",
    prompt: "解释 TypeScript 中的泛型",
    response: "TypeScript 泛型是一种...",
  },
];

export function CallDetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusBadge = (status: CallRecord["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            成功
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            错误
          </Badge>
        );
      case "timeout":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            超时
          </Badge>
        );
    }
  };

  const filteredRecords = mockCallRecords.filter(
    (record) =>
      record.user.includes(searchTerm) || record.model.includes(searchTerm) || record.timestamp.includes(searchTerm),
  );

  const handleViewDetails = (record: CallRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}已复制到剪贴板`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">调用明细</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                选择日期
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户、模型或时间..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>模型</TableHead>
                  <TableHead className="text-right">输入 Tokens</TableHead>
                  <TableHead className="text-right">输出 Tokens</TableHead>
                  <TableHead className="text-right">耗时 (秒)</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.timestamp}</TableCell>
                    <TableCell>{record.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{record.model}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{record.inputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{record.outputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{record.duration.toFixed(1)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-primary h-auto p-0"
                        onClick={() => handleViewDetails(record)}
                      >
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>共 {filteredRecords.length} 条记录</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
              <span className="px-2">1 / 1</span>
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-semibold">调用详情</div>
                <div className="text-sm text-muted-foreground font-normal">ID: {selectedRecord?.id}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 mt-4">
              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">调用时间</div>
                  <div className="text-sm font-medium">{selectedRecord.timestamp}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">执行用户</div>
                  <div className="text-sm font-medium">{selectedRecord.user}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">模型 / 客户端</div>
                  <div className="text-sm font-medium">
                    {selectedRecord.model} | {selectedRecord.client}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">TOKEN 统计</div>
                  <div className="text-sm font-medium">
                    Input: {selectedRecord.inputTokens} / Output: {selectedRecord.outputTokens}
                  </div>
                </div>
              </div>

              {/* Prompt Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="font-medium">模型输入</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(selectedRecord.prompt, "提示词")}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制内容
                  </Button>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {selectedRecord.prompt}
                </div>
              </div>

              {/* Response Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">模型输出</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(selectedRecord.response, "模型输出")}
                    disabled={!selectedRecord.response}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制内容
                  </Button>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto min-h-[100px]">
                  {selectedRecord.response || <span className="text-slate-500">无响应内容</span>}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
