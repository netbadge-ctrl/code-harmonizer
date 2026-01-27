import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Book, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  FileText, 
  Coins, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Terminal,
  Zap,
  Server,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 帮助文档数据结构
const helpSections = [
  {
    id: 'overview',
    title: '产品概述',
    icon: Book,
    content: `
KSGC 是一款企业级 AI Coding 辅助服务云平台，为企业提供：

• **统一的 AI 模型接入**：支持 Kimi、Qwen、DeepSeek 等多种大语言模型
• **精细化权限管理**：按组织、部门、成员三级进行模型权限和配额控制
• **全面的使用分析**：实时监控 Token 消耗、请求量、延迟等关键指标
• **企业级安全保障**：IP 白名单、身份源集成、审计日志
    `
  },
  {
    id: 'quickstart',
    title: '快速开始',
    icon: Zap,
    content: `
### 访问平台

• **首页入口**：访问 KSGC 官网
• **登录控制台**：点击"登录控制台"进入企业管理后台
• **开通试用**：新用户点击"开通试用"进入引导流程

### 企业开通流程

1. **企业集成配置**
   - 选择身份认证源（WPS 协作 / 企业微信 / 飞书 / 钉钉）
   - 配置 App ID、App Key 和 Redirect URI

2. **云服务资源开通**
   - 配置数据库账号密码（账号名默认为 admin，可修改）
   - 密码要求最少 8 位，需二次确认

3. **订阅选择**
   - 版本选择：基础版 / 专业版
   - 计费方式：包年包月 / 按量付费 / 试用
   - 席位数：20 ~ 2000 人可选

4. **确认订单**
   - 核对订阅信息
   - 完成支付
    `
  }
];

const consoleSections = [
  {
    id: 'console-dashboard',
    title: '概览',
    icon: LayoutDashboard,
    content: `
概览页面展示企业 AI 服务的整体状态。

**主要信息**：
• 当前订阅计划及到期时间
• 席位使用情况（已用 / 总数）
• 本月 Token 消耗总量
• 活跃用户数统计

**快速操作**：
• CLI 安装命令（支持 KSGC 官方版 / 自定义终端）
• 订阅管理 / 扩容入口
    `
  },
  {
    id: 'console-usage',
    title: '用量看板',
    icon: BarChart3,
    content: `
用量看板提供多维度的使用数据分析。

#### 全局视图

| 功能 | 说明 |
|------|------|
| 时间范围选择 | 支持今日、近7天、近30天、自定义日期范围 |
| 使用趋势图 | 展示活跃用户数、Token 消耗、请求数三个指标 |
| 模型消耗排行 | 横向柱状图展示各模型 Token 消耗量 |
| 平均耗时统计 | 按模型展示平均响应延迟 |

#### 组织视图

| 功能 | 说明 |
|------|------|
| 部门层级导航 | 支持三级组织结构下钻，面包屑显示当前路径 |
| 部门统计表 | 显示成员总数、活跃用户数、Token 消耗、请求数 |
| 成员切换 | 可在部门/成员视图间切换，查看个人使用详情 |
    `
  },
  {
    id: 'console-calldetails',
    title: '调用明细',
    icon: FileText,
    content: `
调用明细记录所有 API 调用的详细日志。

**筛选条件**：
• 时间范围
• 模型类型
• 调用状态（成功 / 失败）
• 成员搜索

**列表字段**：
| 字段 | 说明 |
|------|------|
| 时间戳 | 调用发生的精确时间 |
| 用户 | 发起调用的成员名称 |
| 模型 | 使用的 AI 模型 |
| 输入 Token | 请求消耗的 Token 数 |
| 输出 Token | 响应生成的 Token 数 |
| 状态 | 成功 / 错误 / 超时 |
| 耗时 | 响应延迟（毫秒） |

**查看详情**：
点击"查看详情"可查看完整的模型输入内容、模型响应内容、完整的请求元数据。
    `
  },
  {
    id: 'console-models',
    title: '模型管理',
    icon: Server,
    content: `
管理企业可用的 AI 模型及其配置。

#### 模型列表

| 列 | 说明 |
|-----|------|
| 模型 | 模型类型（文本/视觉理解）+ 模型名称 |
| 上下文限制 | 最大上下文窗口大小 |
| 每分钟请求数 | RPM 限制 |
| 每分钟 Token 数 | TPM 限制 |
| 模型详情 | 查看详细参数 |
| 操作 | 启用/禁用开关 |

#### 操作说明

1. **启用模型**
   - 首次启用任意模型时，系统会弹出《星流平台 API 服务协议》
   - 需勾选同意后方可启用
   - 系统将自动开通金山云星流平台 API 服务

2. **批量操作**
   - **全部开启**：一键启用所有模型
   - **自动开启新模型**：开关打开后，平台新增模型时自动启用

3. **系统要求**
   - 至少需要启用 1 个文本模型和 1 个视觉理解模型
    `
  },
  {
    id: 'console-quota',
    title: '配额管理',
    icon: Coins,
    content: `
按金额（元）限制用户的 Token 消耗。

#### 配置层级

| 层级 | 说明 |
|------|------|
| 全局配额 | 企业整体消耗上限 |
| 部门配额 | 各部门消耗上限，支持多级部门树 |
| 成员配额 | 个人消耗上限 |

#### 配置规则

1. **开关控制**：默认关闭，开启后必须设置大于 0 的配额值
2. **层级约束**：严格遵循 全局 > 部门 > 成员 的限制关系
3. **实时生效**：配额修改后立即生效
4. **单价说明**：消耗按实际计费单价计算

#### 操作步骤

1. 选择配置层级（全局/部门/成员）
2. 开启配额限制开关
3. 输入配额金额（元）
4. 保存配置
    `
  },
  {
    id: 'console-members',
    title: '组织成员管理',
    icon: Users,
    content: `
管理企业组织结构和成员权限。

#### 成员类型

| 类型 | 来源 | 操作权限 |
|------|------|----------|
| SSO 成员 | 身份源自动同步 | 只读，不可编辑 |
| 外部成员 | 手动添加 | 可编辑、重发密钥 |

#### 成员状态

• **正常**：已激活，可正常使用
• **待激活**：已添加未激活（仅手动添加成员）
• **禁用**：已暂停服务

#### 可用操作

| 操作 | 适用对象 | 说明 |
|------|----------|------|
| 启用 | 所有成员 | 恢复服务 |
| 禁用 | 所有成员 | 暂停服务 |
| 编辑 | 外部成员 | 修改信息和模型权限 |
| 重发密钥 | 外部成员 | 重新发送激活密钥 |

#### 模型权限配置

• 成员继承所属部门的模型权限（锁定不可移除，显示"部门继承"标签）
• 可额外授予个人模型权限
• 最终权限 = 部门模型 ∪ 个人模型
• 支持拖拽调整模型排序
    `
  },
  {
    id: 'console-security',
    title: 'IP 白名单',
    icon: Shield,
    content: `
配置允许访问的 IP 地址规则。

#### 规则类型

| 类型 | 格式示例 | 说明 |
|------|----------|------|
| 单个 IP | 203.119.24.1 | 单一 IP 地址 |
| CIDR 网段 | 203.119.24.0/24 | IP 地址段 |

#### 添加规则

1. 点击"添加规则"
2. 选择规则类型（单个 IP / CIDR 网段）
3. 输入 IP 地址或网段
4. 添加描述说明（可选）
5. 保存

#### 验证规则

• **仅支持公网 IP**：内网地址将被拒绝
• **冗余检测**：系统自动识别被包含在更大网段内的规则

#### 删除规则

删除操作需要两步确认，防止误删。
    `
  },
  {
    id: 'console-settings',
    title: '系统设置',
    icon: Settings,
    content: `
配置企业登录身份源和客户端安装包。

#### 身份源配置

**支持的认证源**：
• WPS 协作
• 企业微信
• 飞书
• 钉钉

**配置字段**：
| 字段 | 说明 |
|------|------|
| App ID | 应用标识 |
| App Key | 应用密钥（支持显示/隐藏切换） |
| Redirect URI | 回调地址 |

**操作说明**：
1. 选择认证源类型（单选）
2. 填写 App ID、App Key、Redirect URI
3. 点击"查看配置说明"获取详细指引
4. 保存配置

> ⚠️ 修改认证源配置后，需要通知用户重新下载 CLI 客户端才能生效

#### 客户端安装包管理

**上传要求**：
• 格式：.tar.gz 或 .tgz
• 系统自动从文件名提取版本号
• 版本号必须唯一
    `
  }
];

const ussSections = [
  {
    id: 'uss-customers',
    title: '客户管理',
    icon: Building2,
    content: `
管理所有企业客户信息。

#### 客户列表

| 字段 | 说明 |
|------|------|
| 客户识别码 | 唯一标识 |
| 企业名称 | 客户企业名称 |
| 订阅版本 | 基础版 / 专业版 |
| 服务状态 | 试用 / 正常 / 已过期 |
| Client 版本 | 客户端版本号 |
| Server 版本 | 服务端版本号 |
| 用量统计 | 核心消耗指标 |

#### 客户详情

点击客户进入详情页，包含两个标签页：

**使用统计**（默认显示）：
• 与数据看板保持一致的统计视图
• 筛选条件：时间范围、模型选择
• 核心指标：Token 消耗（入/出）、请求数、活跃用户
• 趋势图表：Token/请求趋势、千 Token 时延
• 模型性能表：支持全字段排序
• 错误分析：错误趋势图、错误日志

**配置信息**：
• 认证配置：查看客户的身份源配置
• 账户配置：管理权限开关，如"模型切换"功能
    `
  },
  {
    id: 'uss-analytics',
    title: '数据看板',
    icon: BarChart3,
    content: `
全平台数据统计分析。

#### 筛选栏

| 筛选项 | 说明 |
|--------|------|
| 时间范围 | 今日、近7天、近30天、自定义 |
| 客户 | 选择特定客户 |
| 模型 | 选择特定模型 |

#### 核心指标卡片

| 指标 | 说明 |
|------|------|
| Token 消耗 | 总量及输入/输出明细 |
| 请求数 | 成功数 / 总数 |
| 活跃用户 | 统计周期内的活跃用户数 |

#### 图表展示

1. **Token/请求趋势图**
   - 复合图表展示 Token 消耗和请求数变化
   - 支持时间维度切换

2. **千 Token 时延图**
   - 分输入/输出展示每千 Token 的处理延迟
   - 监控模型性能

3. **客户消耗排行**（全局视图）
   - 展示 Token 消耗 TOP 客户
    `
  },
  {
    id: 'uss-credit',
    title: '积分倍率',
    icon: Coins,
    content: `
配置不同模型的计费倍率。

#### 配置说明

| 字段 | 说明 |
|------|------|
| 模型名称 | AI 模型标识 |
| 输入倍率 | 输入 Token 单价（元/K tokens） |
| 输出倍率 | 输出 Token 单价（元/K tokens） |

#### 操作步骤

1. 选择需要配置的模型
2. 设置输入 Token 倍率
3. 设置输出 Token 倍率
4. 保存配置

> 此配置直接影响 My CLI 中显示的消耗金额
    `
  }
];

const cliSections = [
  {
    id: 'cli-token',
    title: 'Token 用量',
    icon: BarChart3,
    content: `
查看个人 Token 消耗情况。

#### 消耗概览

| 卡片 | 内容 |
|------|------|
| 月累计消耗 | 当月消耗金额 / 配额上限（如 ¥120 / ¥500），总 Token 数 |
| 当日消耗 | 今日消耗金额和 Token 数 |

#### 调用明细

| 功能 | 说明 |
|------|------|
| 日期筛选 | 选择当月内任意日期 |
| 明细列表 | 显示时间、任务、模型、消耗金额 |
    `
  },
  {
    id: 'cli-skills',
    title: 'Skills 配置',
    icon: Zap,
    content: `
管理 CLI 技能插件。

#### 内置技能

系统预置的技能插件，支持启用/禁用切换。

#### 自定义技能

| 操作 | 说明 |
|------|------|
| 添加 | 创建新的自定义技能 |
| 编辑 | 修改技能配置 |
| 删除 | 移除技能 |
    `
  },
  {
    id: 'cli-mcp',
    title: 'MCP 管理',
    icon: Terminal,
    content: `
管理 Model Context Protocol 服务连接。

#### 概览统计

| 指标 | 说明 |
|------|------|
| MCP 总数 | 已配置的 MCP 服务数量 |
| 已连接 | 正常连接的服务数 |
| 需关注 | 连接异常或需要处理的服务数 |

#### MCP 列表

| 字段 | 说明 |
|------|------|
| 名称 | MCP 服务名称 |
| 端点 | 服务连接地址 |
| 状态 | 已连接 / 断开 / 错误 |
| 同步状态 | 最后同步时间和状态 |

#### 操作

| 操作 | 说明 |
|------|------|
| 添加 MCP | 配置新的 MCP 服务 |
| 编辑 | 修改 MCP 配置 |
| 删除 | 移除 MCP 服务 |
| 同步 | 手动触发同步 |
    `
  }
];

const faqItems = [
  {
    question: '如何开通试用？',
    answer: '访问 KSGC 官网，点击"开通试用"按钮。试用版将自动设置为专业版 + 20 席位，有效期 7 天，包含 100M Token 额度。'
  },
  {
    question: '模型无法关闭怎么办？',
    answer: '系统要求至少保持 1 个文本模型和 1 个视觉理解模型处于启用状态。请确保关闭后仍满足此条件。'
  },
  {
    question: '成员配额设置后没生效？',
    answer: '请检查：1. 配额开关是否已开启；2. 配额值是否大于 0；3. 是否满足层级约束（成员配额 < 部门配额 < 全局配额）'
  },
  {
    question: '身份源配置修改后不生效？',
    answer: '修改身份源配置后，需要通知用户重新下载安装 CLI 客户端，新配置才能生效。'
  },
  {
    question: 'IP 白名单显示"冗余"是什么意思？',
    answer: '表示该 IP 规则已被另一个更大的 CIDR 网段包含，可以考虑删除冗余规则以简化配置。'
  },
  {
    question: '如何查看详细的调用日志？',
    answer: '进入 Console > 调用明细，使用筛选条件定位具体记录，点击"查看详情"查看完整的输入输出内容。'
  },
  {
    question: '如何为部门批量配置模型权限？',
    answer: '进入 Console > 组织成员管理 > 组织管理，勾选需要配置的部门（支持级联选择），点击"批量配置模型"按钮。'
  },
  {
    question: 'My CLI 页面无法返回控制台？',
    answer: 'My CLI 是独立页面，在新标签页打开。如需返回控制台，请切换浏览器标签页或重新访问控制台地址。'
  }
];

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: Array<{ id: string; title: string; icon: React.ElementType; content: string }>;
}

const sidebarStructure: SidebarSection[] = [
  { id: 'intro', title: '入门指南', icon: Book, items: helpSections },
  { id: 'console', title: 'Console 管理控制台', icon: LayoutDashboard, items: consoleSections },
  { id: 'uss', title: 'USS 运营管理后台', icon: Building2, items: ussSections },
  { id: 'cli', title: 'My CLI 个人中心', icon: Terminal, items: cliSections },
];

// 简单的 Markdown 渲染组件
function MarkdownContent({ content }: { content: string }) {
  const lines = content.trim().split('\n');
  
  return (
    <div className="prose prose-sm max-w-none text-foreground">
      {lines.map((line, index) => {
        // 空行
        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }
        
        // 标题
        if (line.startsWith('####')) {
          return <h4 key={index} className="text-base font-semibold mt-6 mb-3 text-foreground">{line.replace('####', '').trim()}</h4>;
        }
        if (line.startsWith('###')) {
          return <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">{line.replace('###', '').trim()}</h3>;
        }
        
        // 引用块
        if (line.startsWith('>')) {
          return (
            <div key={index} className="border-l-4 border-warning bg-warning/10 pl-4 py-2 my-3 text-sm">
              {line.replace('>', '').trim()}
            </div>
          );
        }
        
        // 表格头
        if (line.startsWith('|') && lines[index + 1]?.includes('---')) {
          const cells = line.split('|').filter(c => c.trim());
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {cells.map((cell, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">{cell.trim()}</th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          );
        }
        
        // 表格分隔行
        if (line.includes('---') && line.includes('|')) {
          return null;
        }
        
        // 表格数据行
        if (line.startsWith('|') && !line.includes('---')) {
          const cells = line.split('|').filter(c => c.trim());
          return (
            <tr key={index} className="border-b border-border/50">
              {cells.map((cell, i) => (
                <td key={i} className="px-3 py-2 text-sm">{cell.trim()}</td>
              ))}
            </tr>
          );
        }
        
        // 列表项
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
          const text = line.replace(/^[\s]*[•\-\*]/, '').trim();
          // 处理粗体
          const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return (
            <div key={index} className="flex gap-2 py-0.5 pl-2">
              <span className="text-muted-foreground">•</span>
              <span className="text-sm" dangerouslySetInnerHTML={{ __html: formattedText }} />
            </div>
          );
        }
        
        // 数字列表
        if (/^\d+\./.test(line.trim())) {
          const match = line.match(/^(\d+)\.\s*(.*)/);
          if (match) {
            const text = match[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return (
              <div key={index} className="flex gap-2 py-0.5 pl-2">
                <span className="text-muted-foreground w-4">{match[1]}.</span>
                <span className="text-sm" dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            );
          }
        }
        
        // 普通段落 - 处理粗体
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={index} className="text-sm leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      })}
    </div>
  );
}

export function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['intro', 'console']);
  const [showFaq, setShowFaq] = useState(false);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getCurrentContent = () => {
    if (showFaq) return null;
    
    for (const section of sidebarStructure) {
      const found = section.items.find(item => item.id === activeSection);
      if (found) return found;
    }
    return helpSections[0];
  };

  const currentContent = getCurrentContent();

  // 搜索过滤
  const filterBySearch = (items: Array<{ id: string; title: string; icon: React.ElementType; content: string }>) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content.toLowerCase().includes(query)
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧边栏 */}
      <aside className="w-72 border-r border-border bg-card flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">帮助中心</h1>
          </div>
          
          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索帮助文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* 导航菜单 */}
        <ScrollArea className="flex-1">
          <nav className="p-3">
            {sidebarStructure.map((section) => {
              const filteredItems = filterBySearch(section.items);
              if (searchQuery && filteredItems.length === 0) return null;
              
              const isExpanded = expandedGroups.includes(section.id);
              const hasActiveItem = section.items.some(item => item.id === activeSection);
              
              return (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleGroup(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      hasActiveItem ? "text-primary" : "text-foreground hover:bg-muted"
                    )}
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{section.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {(searchQuery ? filteredItems : section.items).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setShowFaq(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                            activeSection === item.id && !showFaq
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* FAQ 入口 */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setShowFaq(true)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  showFaq ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                )}
              >
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span>常见问题</span>
              </button>
            </div>
          </nav>
        </ScrollArea>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-screen">
          <div className="max-w-3xl mx-auto p-8">
            {showFaq ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">常见问题</h1>
                  <p className="text-muted-foreground">快速解答您在使用过程中遇到的常见问题</p>
                </div>

                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div 
                      key={index}
                      className="border border-border rounded-lg p-4 bg-card"
                    >
                      <h3 className="font-medium text-foreground mb-2 flex items-start gap-2">
                        <span className="text-primary font-semibold">Q{index + 1}:</span>
                        {item.question}
                      </h3>
                      <p className="text-sm text-muted-foreground pl-7">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : currentContent ? (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <currentContent.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">{currentContent.title}</h1>
                  </div>
                </div>

                <MarkdownContent content={currentContent.content} />
              </>
            ) : null}

            {/* 底部版本信息 */}
            <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              <p>文档版本 v1.0 · 更新日期 2025-01-26</p>
              <p className="mt-1">如有疑问请联系技术支持</p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

export default HelpCenter;
