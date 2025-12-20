import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar, Filter } from 'lucide-react';

interface CallRecord {
  id: string;
  timestamp: string;
  user: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  status: 'success' | 'error' | 'timeout';
}

const mockCallRecords: CallRecord[] = [
  { id: '1', timestamp: '2024-01-15 14:32:18', user: '张明', model: 'GPT-4o', inputTokens: 1250, outputTokens: 890, duration: 2.3, status: 'success' },
  { id: '2', timestamp: '2024-01-15 14:30:45', user: '李华', model: 'Claude-3.5-Sonnet', inputTokens: 2100, outputTokens: 1560, duration: 3.8, status: 'success' },
  { id: '3', timestamp: '2024-01-15 14:28:12', user: '王芳', model: 'GPT-4o', inputTokens: 890, outputTokens: 0, duration: 30.0, status: 'timeout' },
  { id: '4', timestamp: '2024-01-15 14:25:33', user: '张明', model: 'DeepSeek-V3', inputTokens: 3200, outputTokens: 2100, duration: 4.2, status: 'success' },
  { id: '5', timestamp: '2024-01-15 14:22:08', user: '陈刚', model: 'GPT-4o', inputTokens: 1500, outputTokens: 0, duration: 1.2, status: 'error' },
  { id: '6', timestamp: '2024-01-15 14:18:55', user: '李华', model: 'Claude-3.5-Sonnet', inputTokens: 980, outputTokens: 720, duration: 1.9, status: 'success' },
  { id: '7', timestamp: '2024-01-15 14:15:22', user: '王芳', model: 'DeepSeek-V3', inputTokens: 4500, outputTokens: 3200, duration: 5.6, status: 'success' },
  { id: '8', timestamp: '2024-01-15 14:12:10', user: '张明', model: 'GPT-4o', inputTokens: 780, outputTokens: 540, duration: 1.5, status: 'success' },
];

export function CallDetails() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: CallRecord['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">成功</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">错误</Badge>;
      case 'timeout':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">超时</Badge>;
    }
  };

  const filteredRecords = mockCallRecords.filter(record =>
    record.user.includes(searchTerm) ||
    record.model.includes(searchTerm) ||
    record.timestamp.includes(searchTerm)
  );

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>共 {filteredRecords.length} 条记录</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>上一页</Button>
              <span className="px-2">1 / 1</span>
              <Button variant="outline" size="sm" disabled>下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
