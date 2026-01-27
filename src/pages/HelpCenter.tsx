import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Building2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Lightbulb,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ==================== 帮助文档内容数据 ====================

const helpSections = [
  {
    id: 'overview',
    title: '产品概述',
    icon: Book,
    content: `
## 产品概述

KSGC 是一款企业级 AI Coding 辅助服务云平台，专为企业开发团队打造，提供安全、可控、高效的 AI 编程助手服务。

### 核心能力

::: info 平台特色
KSGC 深度整合金山云星流大模型能力，提供开箱即用的企业级 AI 编程服务。
:::

| 能力 | 描述 |
|------|------|
| **统一模型接入** | 支持 Kimi、Qwen、DeepSeek、星流等多种主流大语言模型 |
| **精细化权限** | 按组织、部门、成员三级进行模型权限和配额控制 |
| **全面监控分析** | 实时监控 Token 消耗、请求量、延迟等关键指标 |
| **企业级安全** | IP 白名单、身份源集成、审计日志、数据隔离 |

### 系统架构

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        KSGC 平台                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Console       │      USS        │       My CLI            │
│   企业管理控制台  │   运营管理后台   │      个人中心           │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • 概览          │ • 客户管理       │ • Token 用量            │
│ • 用量看板      │ • 数据看板       │ • Skills 配置           │
│ • 调用明细      │ • 积分倍率       │ • MCP 管理              │
│ • 模型管理      │ • 系统设置       │                         │
│ • 配额管理      │                  │                         │
│ • 成员管理      │                  │                         │
│ • IP 白名单     │                  │                         │
│ • 系统设置      │                  │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
\`\`\`

### 适用场景

- **软件开发团队**：提升编码效率，智能代码补全和生成
- **技术部门**：统一管理 AI 工具使用，控制成本和安全
- **企业 IT**：集成现有身份认证系统，实现统一管控
    `
  },
  {
    id: 'quickstart',
    title: '快速开始',
    icon: Zap,
    content: `
## 快速开始

本指南将帮助您在 **5 分钟内** 完成企业开通和基础配置。

### 前置条件

::: warning 准备工作
开始前，请确保您已准备好以下信息：
- 企业管理员账号
- 身份源配置信息（App ID、App Key、Redirect URI）
- 预估的用户席位数量
:::

### 第一步：访问平台

1. 打开浏览器，访问 KSGC 官网
2. 点击页面右上角 **「登录控制台」** 按钮
3. 新用户点击 **「开通试用」** 进入引导流程

::: tip 试用说明
试用版自动配置为专业版 + 20 席位，有效期 7 天，包含 100M Token 额度。
:::

### 第二步：企业集成配置

配置企业身份认证源，支持以下平台：

| 认证源 | 说明 |
|--------|------|
| WPS 协作 | 金山办公企业版用户首选 |
| 企业微信 | 腾讯企业微信用户 |
| 飞书 | 字节跳动飞书用户 |
| 钉钉 | 阿里钉钉用户 |

**配置步骤：**

\`\`\`步骤
1. 在身份源平台创建应用，获取 App ID 和 App Key
2. 配置回调地址（Redirect URI）
3. 在 KSGC 控制台填入上述信息
4. 保存并测试连接
\`\`\`

### 第三步：云服务资源开通

配置后端服务资源：

\`\`\`bash
# 数据库账号配置
账号名：admin（默认，可修改）
密码要求：最少 8 位，需包含字母和数字
\`\`\`

::: warning 安全提示
请妥善保管数据库密码，建议使用密码管理器存储。
:::

### 第四步：订阅选择

| 配置项 | 可选值 |
|--------|--------|
| 版本 | 基础版 / 专业版 |
| 计费方式 | 包年包月 / 按量付费 / 试用 |
| 席位数 | 20 ~ 2000 人 |

### 第五步：确认订单

1. 仔细核对订阅信息
2. 确认价格和服务条款
3. 完成支付

::: success 恭喜
完成以上步骤后，您的企业即可开始使用 KSGC 服务！
:::

### 下一步

- 配置 [模型管理](#console-models) 启用所需的 AI 模型
- 设置 [组织成员](#console-members) 添加团队成员
- 了解 [配额管理](#console-quota) 控制使用成本
    `
  }
];

const consoleSections = [
  {
    id: 'console-dashboard',
    title: '概览',
    icon: LayoutDashboard,
    content: `
## 概览

概览页面是企业 AI 服务的管理仪表盘，提供关键指标一览和快速操作入口。

### 页面布局

概览页面分为以下几个核心区域：

#### 订阅信息卡片

| 信息项 | 说明 |
|--------|------|
| 当前计划 | 显示订阅版本（基础版/专业版） |
| 到期时间 | 服务到期日期，临近到期时高亮提醒 |
| 席位使用 | 已用席位 / 总席位，进度条展示 |

#### 用量统计卡片

| 指标 | 说明 |
|------|------|
| 本月 Token 消耗 | 当月累计消耗的 Token 总量 |
| 活跃用户数 | 统计周期内有调用记录的用户数 |
| 请求总数 | API 调用总次数 |

### 快速操作

#### CLI 安装命令

点击展开查看安装命令，支持两种模式：

\`\`\`bash
# KSGC 官方版
curl -fsSL https://ksgc.kingsoft.com/install.sh | bash

# 自定义终端版本
npm install -g @ksgc/cli
\`\`\`

::: tip 复制提示
点击命令右侧的复制按钮可快速复制安装命令。
:::

#### 订阅管理入口

- **扩容**：增加用户席位
- **升级**：从基础版升级到专业版
- **续费**：延长服务期限
    `
  },
  {
    id: 'console-usage',
    title: '用量看板',
    icon: BarChart3,
    content: `
## 用量看板

用量看板提供多维度的使用数据分析，帮助管理员了解 AI 服务的使用情况。

### 视图切换

用量看板支持两种视图模式：

| 视图 | 用途 |
|------|------|
| **全局视图** | 查看企业整体使用情况 |
| **组织视图** | 按部门/成员下钻分析 |

### 全局视图

#### 时间范围选择

\`\`\`
支持的时间范围：
• 今日
• 近 7 天
• 近 30 天
• 自定义日期范围
\`\`\`

#### 使用趋势图

展示以下三个核心指标的变化趋势：

| 指标 | 图表类型 | 说明 |
|------|----------|------|
| 活跃用户数 | 折线图 | 每日有调用记录的用户数量 |
| Token 消耗 | 柱状图 | 每日 Token 消耗总量 |
| 请求数 | 折线图 | 每日 API 请求次数 |

::: info 交互说明
点击图表图例可切换显示/隐藏对应指标。
:::

#### 模型消耗排行

横向柱状图展示各模型的 Token 消耗量排名，便于了解模型使用分布。

#### 平均耗时统计

按模型展示平均响应延迟，用于监控模型性能。

### 组织视图

#### 部门层级导航

\`\`\`
企业根组织
├── 研发中心
│   ├── 前端组
│   ├── 后端组
│   └── 测试组
├── 产品部
└── 运营部
\`\`\`

支持三级组织结构下钻，面包屑导航显示当前路径。

#### 部门统计表

| 列名 | 说明 |
|------|------|
| 部门名称 | 点击可下钻到子部门 |
| 成员总数 | 部门人员数量 |
| 活跃用户 | 有调用记录的用户数 |
| Token 消耗 | 部门累计消耗 |
| 请求数 | 部门 API 调用次数 |

::: tip 切换视图
点击「成员」标签可切换到成员视图，查看个人使用详情。
:::
    `
  },
  {
    id: 'console-calldetails',
    title: '调用明细',
    icon: FileText,
    content: `
## 调用明细

调用明细记录所有 API 调用的详细日志，支持多维度筛选和详情查看。

### 筛选条件

| 筛选项 | 类型 | 说明 |
|--------|------|------|
| 时间范围 | 日期选择器 | 选择查询的时间区间 |
| 模型类型 | 下拉选择 | 筛选特定模型的调用 |
| 调用状态 | 下拉选择 | 成功 / 失败 / 超时 |
| 成员搜索 | 文本输入 | 按用户名搜索 |

### 列表字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| 时间戳 | 调用发生的精确时间 | 2025-01-26 14:30:25 |
| 用户 | 发起调用的成员名称 | 张三 |
| 模型 | 使用的 AI 模型 | qwen-max |
| 输入 Token | 请求消耗的 Token 数 | 1,234 |
| 输出 Token | 响应生成的 Token 数 | 567 |
| 状态 | 调用结果状态 | ✓ 成功 |
| 耗时 | 响应延迟 | 1,250ms |

### 查看详情

点击「查看详情」按钮可展开完整信息：

#### 模型输入

\`\`\`json
{
  "model": "qwen-max",
  "messages": [
    {"role": "system", "content": "你是一个编程助手"},
    {"role": "user", "content": "帮我写一个排序算法"}
  ],
  "temperature": 0.7
}
\`\`\`

#### 模型响应

展示完整的模型返回内容，支持一键复制。

#### 请求元数据

| 字段 | 值 |
|------|-----|
| Request ID | req_abc123xyz |
| Endpoint | /v1/chat/completions |
| Client IP | 192.168.1.100 |
| User Agent | KSGC-CLI/1.2.0 |

::: tip 导出功能
支持将调用记录导出为 CSV 格式进行离线分析。
:::
    `
  },
  {
    id: 'console-models',
    title: '模型管理',
    icon: Server,
    content: `
## 模型管理

管理企业可用的 AI 模型及其配置，控制团队可使用的模型范围。

### 模型列表

| 列 | 说明 |
|-----|------|
| 模型 | 模型类型图标 + 模型名称 |
| 上下文限制 | 最大上下文窗口大小（如 128K） |
| 每分钟请求数 | RPM 限制 |
| 每分钟 Token 数 | TPM 限制 |
| 模型详情 | 查看详细参数 |
| 操作 | 启用/禁用开关 |

### 模型类型

| 类型 | 图标 | 用途 |
|------|------|------|
| 文本模型 | 📝 | 代码生成、文本理解、对话 |
| 视觉理解 | 👁️ | 图像理解、多模态分析 |

### 启用模型

::: warning 首次启用
首次启用任意模型时，系统会弹出《星流平台 API 服务协议》，需勾选同意后方可启用。
:::

**操作步骤：**

\`\`\`步骤
1. 在模型列表中找到目标模型
2. 点击该行的启用开关
3. 首次启用需阅读并同意服务协议
4. 系统自动开通金山云星流平台 API 服务
\`\`\`

### 批量操作

| 操作 | 说明 |
|------|------|
| **全部开启** | 一键启用所有可用模型 |
| **自动开启新模型** | 开关打开后，平台新增模型时自动启用 |

### 系统要求

::: danger 重要约束
系统要求至少启用 **1 个文本模型** 和 **1 个视觉理解模型**。
如不满足条件，将无法关闭最后一个相应类型的模型。
:::

### 查看模型详情

点击「查看详情」展开模型参数：

| 参数 | 说明 |
|------|------|
| 模型 ID | 模型唯一标识 |
| 提供商 | 模型服务提供商 |
| 支持功能 | 对话、函数调用、流式输出等 |
| 定价信息 | 输入/输出 Token 单价 |
    `
  },
  {
    id: 'console-quota',
    title: '配额管理',
    icon: Coins,
    content: `
## 配额管理

按金额（元）限制用户的 Token 消耗，实现成本可控。

### 配置层级

KSGC 支持三级配额管理体系：

\`\`\`
全局配额（企业级）
├── 部门配额（部门级）
│   └── 成员配额（个人级）
\`\`\`

| 层级 | 说明 | 影响范围 |
|------|------|----------|
| 全局配额 | 企业整体消耗上限 | 所有成员 |
| 部门配额 | 各部门消耗上限 | 部门内成员 |
| 成员配额 | 个人消耗上限 | 单个成员 |

### 配置规则

::: warning 配额约束
配额遵循严格的层级约束：**成员配额 ≤ 部门配额 ≤ 全局配额**
:::

| 规则 | 说明 |
|------|------|
| 开关控制 | 默认关闭，开启后必须设置大于 0 的配额值 |
| 层级约束 | 下级配额不能超过上级配额 |
| 实时生效 | 配额修改后立即生效 |
| 单价计算 | 消耗按实际计费单价计算 |

### 操作步骤

\`\`\`步骤
1. 选择配置层级（全局/部门/成员）
2. 开启配额限制开关
3. 输入配额金额（单位：元）
4. 点击「保存」按钮
\`\`\`

### 配额示例

以下是典型的配额配置方案：

| 场景 | 全局配额 | 部门配额 | 成员配额 |
|------|----------|----------|----------|
| 小型团队 | ¥5,000 | 不设置 | ¥500 |
| 中型企业 | ¥50,000 | ¥10,000 | ¥1,000 |
| 大型企业 | ¥200,000 | ¥30,000 | ¥2,000 |

::: tip 配额提醒
当成员消耗达到配额的 80% 时，系统会自动发送提醒通知。
:::

### 查看消耗情况

在配额管理页面可以实时查看各层级的消耗情况：

- 当前消耗金额 / 配额上限
- 消耗进度条（可视化展示）
- 剩余可用额度
    `
  },
  {
    id: 'console-members',
    title: '组织成员管理',
    icon: Users,
    content: `
## 组织成员管理

管理企业组织结构和成员权限，支持身份源同步和手动添加两种方式。

### 成员管理

#### 成员类型

| 类型 | 来源 | 操作权限 |
|------|------|----------|
| **SSO 成员** | 身份源自动同步 | 只读，不可编辑删除 |
| **外部成员** | 手动添加 | 可编辑、重发密钥、删除 |

#### 成员状态

| 状态 | 图标 | 说明 |
|------|------|------|
| 正常 | ✅ | 已激活，可正常使用服务 |
| 待激活 | ⏳ | 已添加但未激活（仅手动添加成员） |
| 禁用 | ⛔ | 已暂停服务 |

#### 可用操作

| 操作 | 适用对象 | 说明 |
|------|----------|------|
| 启用 | 所有成员 | 恢复服务访问权限 |
| 禁用 | 所有成员 | 暂停服务访问权限 |
| 编辑 | 外部成员 | 修改信息和模型权限 |
| 重发密钥 | 外部成员 | 重新发送激活密钥邮件 |

### 模型权限配置

::: info 权限继承
成员自动继承所属部门的模型权限，这部分权限显示「部门继承」标签且不可移除。
:::

**权限计算公式：**

\`\`\`
最终权限 = 部门模型权限 ∪ 个人模型权限
\`\`\`

**配置步骤：**

\`\`\`步骤
1. 点击成员操作栏的「编辑」按钮
2. 在模型权限面板查看已继承的部门权限
3. 勾选需要额外授予的个人模型权限
4. 拖拽调整模型优先级排序
5. 保存更改
\`\`\`

### 组织管理

#### 同步机制

| 项目 | 说明 |
|------|------|
| 首次同步 | 需确认授权 |
| 自动同步 | 每日 0:00 和 12:00 各执行一次 |
| 手动同步 | 点击「立即同步」按钮触发 |

::: warning 同步说明
同步仅更新组织结构和成员信息，不会影响已配置的权限和配额。
:::

#### 组织树操作

| 功能 | 说明 |
|------|------|
| 搜索 | 按部门名称快速筛选 |
| 展开/折叠 | 支持三级组织结构 |
| 全选 | 一键选中所有部门 |
| 级联选择 | 选中父部门自动选中所有子部门 |

#### 批量操作

| 操作 | 说明 |
|------|------|
| 批量开通服务 | 对选中部门启用 AI 服务 |
| 批量关闭服务 | 对选中部门禁用 AI 服务 |
| 批量配置模型 | 统一设置可用模型列表 |

### 订阅扩容

当席位使用接近上限时：

1. 页面顶部显示席位使用进度条
2. 点击「订阅管理 / 扩容」按钮
3. 选择新的席位数量
4. 确认支付完成扩容
    `
  },
  {
    id: 'console-security',
    title: 'IP 白名单',
    icon: Shield,
    content: `
## IP 白名单

配置允许访问 KSGC 服务的 IP 地址规则，提供网络层面的访问控制。

### 规则类型

| 类型 | 格式示例 | 说明 |
|------|----------|------|
| 单个 IP | \`203.119.24.1\` | 单一 IP 地址 |
| CIDR 网段 | \`203.119.24.0/24\` | IP 地址段（256 个地址） |

### 添加规则

\`\`\`步骤
1. 点击「添加规则」按钮
2. 选择规则类型（单个 IP / CIDR 网段）
3. 输入 IP 地址或网段
4. 添加描述说明（可选，建议填写）
5. 点击「保存」确认
\`\`\`

**输入示例：**

\`\`\`bash
# 单个 IP
203.119.24.1

# CIDR 网段（/24 = 256 个 IP）
203.119.24.0/24

# CIDR 网段（/16 = 65536 个 IP）
203.119.0.0/16
\`\`\`

### 验证规则

::: danger 限制说明
仅支持公网 IP 地址，以下内网地址将被拒绝：
:::

\`\`\`
禁止的内网地址范围：
• 10.0.0.0/8        (10.x.x.x)
• 172.16.0.0/12     (172.16.x.x - 172.31.x.x)
• 192.168.0.0/16    (192.168.x.x)
\`\`\`

#### 冗余检测

系统自动识别被包含在更大网段内的规则：

| 状态 | 说明 |
|------|------|
| ✓ 正常 | 规则有效 |
| ⚠️ 冗余 | 已被其他规则覆盖，建议删除 |

::: tip 示例
如果已添加 \`203.119.24.0/24\`，再添加 \`203.119.24.1\` 会被标记为冗余。
:::

### 删除规则

::: warning 安全确认
删除操作需要两步确认，防止误删导致访问中断。
:::

\`\`\`步骤
1. 点击规则行的「删除」按钮
2. 确认提示框中点击「确认删除」
3. 规则立即失效
\`\`\`
    `
  },
  {
    id: 'console-settings',
    title: '系统设置',
    icon: Settings,
    content: `
## 系统设置

配置企业登录身份源和客户端安装包。

### 身份源配置

#### 支持的认证源

| 认证源 | 官网 | 适用场景 |
|--------|------|----------|
| WPS 协作 | wps.cn | 金山办公企业版用户 |
| 企业微信 | work.weixin.qq.com | 腾讯企业微信用户 |
| 飞书 | feishu.cn | 字节跳动飞书用户 |
| 钉钉 | dingtalk.com | 阿里钉钉用户 |

#### 配置字段

| 字段 | 说明 | 获取方式 |
|------|------|----------|
| App ID | 应用唯一标识 | 在身份源平台创建应用后获得 |
| App Key | 应用密钥 | 创建应用时生成（注意保密） |
| Redirect URI | 回调地址 | KSGC 提供，需在身份源平台配置 |

#### 配置步骤

\`\`\`步骤
1. 登录对应身份源平台的管理后台
2. 创建企业应用，获取 App ID 和 App Key
3. 在应用配置中添加 KSGC 提供的回调地址
4. 返回 KSGC 控制台，选择认证源类型
5. 填入 App ID、App Key、Redirect URI
6. 点击「保存配置」
7. 可选：点击「测试连接」验证配置
\`\`\`

::: warning 重要提醒
修改身份源配置后，需要通知所有用户重新下载 CLI 客户端才能生效！
:::

### 客户端安装包管理

管理不同版本的 CLI 客户端安装包。

#### 上传要求

| 项目 | 要求 |
|------|------|
| 文件格式 | .tar.gz 或 .tgz |
| 版本号 | 系统自动从文件名提取 |
| 唯一性 | 版本号必须唯一，不可重复 |

::: info 文件命名规范
推荐格式：\`ksgc-cli-{version}-{platform}.tar.gz\`

示例：\`ksgc-cli-1.2.0-darwin-arm64.tar.gz\`
:::

#### 安装命令展示

上传成功后，系统自动生成两种安装命令：

\`\`\`bash
# KSGC 官方版
curl -fsSL https://ksgc.kingsoft.com/install.sh | bash

# 自定义终端版本
npm install -g @ksgc/cli@1.2.0
\`\`\`

用户可在概览页面一键复制安装命令。
    `
  }
];

const ussSections = [
  {
    id: 'uss-customers',
    title: '客户管理',
    icon: Building2,
    content: `
## 客户管理

管理所有企业客户信息，查看客户详情和使用情况。

### 客户列表

| 字段 | 说明 |
|------|------|
| 客户识别码 | 唯一标识符 |
| 企业名称 | 客户企业名称 |
| 订阅版本 | 基础版 / 专业版 |
| 服务状态 | 试用 / 正常 / 已过期 |
| Client 版本 | 客户端版本号 |
| Server 版本 | 服务端版本号 |
| 用量统计 | Token 消耗等核心指标 |

### 客户详情

点击客户行进入详情页，包含两个标签页：

#### 使用统计（默认）

与数据看板保持一致的统计视图：

| 区域 | 内容 |
|------|------|
| 筛选条件 | 时间范围、模型选择 |
| 核心指标 | Token 消耗（入/出）、请求数、活跃用户 |
| 趋势图表 | Token/请求趋势、千 Token 时延 |
| 性能表格 | 模型性能指标，支持全字段排序 |
| 错误分析 | 错误趋势图、错误日志 |

#### 配置信息

| 配置项 | 说明 |
|--------|------|
| 认证配置 | 查看客户的身份源配置信息 |
| 账户配置 | 管理权限开关，如「模型切换」功能 |

::: tip 权限管理
通过账户配置可控制客户是否允许使用特定功能。
:::
    `
  },
  {
    id: 'uss-analytics',
    title: '数据看板',
    icon: BarChart3,
    content: `
## 数据看板

全平台数据统计分析，提供运营决策支持。

### 筛选栏

| 筛选项 | 说明 |
|--------|------|
| 时间范围 | 今日、近7天、近30天、自定义 |
| 客户 | 选择特定客户进行过滤 |
| 模型 | 选择特定模型进行过滤 |

### 核心指标卡片

| 指标 | 说明 |
|------|------|
| Token 消耗 | 总量及输入/输出明细 |
| 请求数 | 成功数 / 总数 |
| 活跃用户 | 统计周期内的活跃用户数 |

### 图表展示

#### Token/请求趋势图

- 复合图表展示 Token 消耗和请求数变化
- 支持时间维度切换（小时/天/周）
- 点击图例可切换显示指标

#### 千 Token 时延图

| 指标 | 说明 |
|------|------|
| 输入时延 | 每千输入 Token 的处理时间 |
| 输出时延 | 每千输出 Token 的生成时间 |

#### 客户消耗排行

展示 Token 消耗 TOP 10 客户，支持点击跳转到客户详情。

### 模型性能指标

| 字段 | 说明 |
|------|------|
| 模型 | 模型名称 |
| Token 消耗（入/出） | 分别统计输入和输出 Token |
| TPM | 每分钟 Token 吞吐量 |
| TTFT | 首 Token 时延（平均 / P98） |
| TPOT | Token 生成速度（tokens/秒） |
| 请求 | 请求总数 |
| 错误数 | 错误次数 |

::: tip 排序功能
点击任意列标题可进行升序/降序排序。
:::

### 错误分析

#### 错误码说明

| 错误码 | 含义 | 常见原因 |
|--------|------|----------|
| 429 | 请求频率限制 | 超过 RPM/TPM 限制 |
| 500 | 服务器错误 | 模型服务内部异常 |
| 502 | 网关错误 | 网络中间层故障 |
| 503 | 服务不可用 | 模型服务过载或维护 |

#### 错误趋势图

堆叠柱状图展示各错误码分布，点击图例可切换显示特定错误类型。

#### 错误日志

- 分页展示（每页 10 条）
- 显示：发生时间、错误码、错误描述
- 点击「查看详情」查看：Request ID、Endpoint、完整错误消息
    `
  },
  {
    id: 'uss-credit',
    title: '积分倍率',
    icon: Coins,
    content: `
## 积分倍率

配置不同模型的计费倍率，控制实际消费成本。

### 配置说明

| 字段 | 说明 | 单位 |
|------|------|------|
| 模型名称 | AI 模型标识 | - |
| 输入倍率 | 输入 Token 单价 | 元/千 tokens |
| 输出倍率 | 输出 Token 单价 | 元/千 tokens |

### 操作步骤

\`\`\`步骤
1. 在模型列表中选择需要配置的模型
2. 点击该行的「编辑」按钮
3. 设置输入 Token 倍率
4. 设置输出 Token 倍率
5. 点击「保存」确认更改
\`\`\`

### 倍率示例

| 模型 | 输入倍率 | 输出倍率 | 说明 |
|------|----------|----------|------|
| qwen-turbo | ¥0.003 | ¥0.006 | 经济型 |
| qwen-max | ¥0.02 | ¥0.06 | 高性能 |
| kimi-128k | ¥0.012 | ¥0.012 | 长上下文 |

::: info 影响范围
此配置直接影响 My CLI 中显示的消耗金额，请谨慎设置。
:::
    `
  }
];

const cliSections = [
  {
    id: 'cli-token',
    title: 'Token 用量',
    icon: BarChart3,
    content: `
## Token 用量

查看个人 Token 消耗情况，了解使用配额。

### 消耗概览

页面顶部展示两个核心卡片：

| 卡片 | 内容 | 示例 |
|------|------|------|
| **月累计消耗** | 当月消耗 / 配额上限 | ¥120 / ¥500 |
| **当日消耗** | 今日消耗金额和 Token 数 | ¥12.5 / 25,000 tokens |

::: info 配额说明
如果管理员未设置个人配额，月累计消耗卡片不显示上限。
:::

### 调用明细

| 功能 | 说明 |
|------|------|
| 日期筛选 | 选择当月内任意日期查看 |
| 刷新 | 获取最新调用记录 |

#### 明细列表字段

| 字段 | 说明 |
|------|------|
| 时间 | 调用发生时间（精确到秒） |
| 任务 | 调用任务描述 |
| 模型 | 使用的 AI 模型 |
| 消耗 | 本次调用消耗金额 |

::: tip 数据更新
调用明细数据可能存在 1-2 分钟的延迟。
:::
    `
  },
  {
    id: 'cli-skills',
    title: 'Skills 配置',
    icon: Zap,
    content: `
## Skills 配置

管理 CLI 技能插件，扩展 AI 助手的能力。

### 内置技能

系统预置的技能插件，开箱即用：

| 技能 | 说明 | 默认状态 |
|------|------|----------|
| 代码补全 | 智能代码自动补全 | ✓ 启用 |
| 代码解释 | 解释代码功能和逻辑 | ✓ 启用 |
| 代码重构 | 优化代码结构和性能 | ✓ 启用 |
| 单元测试 | 生成单元测试用例 | ✓ 启用 |
| 文档生成 | 自动生成代码文档 | ✗ 禁用 |

点击技能右侧的开关可切换启用/禁用状态。

### 自定义技能

除内置技能外，支持添加自定义技能：

| 操作 | 说明 |
|------|------|
| **添加** | 创建新的自定义技能 |
| **编辑** | 修改技能配置和提示词 |
| **删除** | 移除技能（不可恢复） |

#### 创建自定义技能

\`\`\`步骤
1. 点击「添加技能」按钮
2. 填写技能名称和描述
3. 编写技能提示词（Prompt）
4. 配置触发条件（可选）
5. 保存并启用
\`\`\`

::: tip 提示词编写
好的提示词应该清晰、具体，包含：任务目标、输出格式、约束条件。
:::
    `
  },
  {
    id: 'cli-mcp',
    title: 'MCP 管理',
    icon: Terminal,
    content: `
## MCP 管理

管理 Model Context Protocol (MCP) 服务连接，扩展 AI 的上下文能力。

### 概览统计

页面顶部显示 MCP 服务状态汇总：

| 指标 | 说明 |
|------|------|
| **MCP 总数** | 已配置的 MCP 服务数量 |
| **已连接** | 正常连接的服务数 |
| **需关注** | 连接异常或需要处理的服务数 |

### MCP 列表

| 字段 | 说明 |
|------|------|
| 名称 | MCP 服务名称 |
| 端点 | 服务连接地址 |
| 状态 | 连接状态标识 |
| 同步状态 | 最后同步时间和结果 |

#### 状态说明

| 状态 | 图标 | 说明 |
|------|------|------|
| 已连接 | 🟢 | 服务正常运行 |
| 断开 | 🟡 | 连接已断开，等待重连 |
| 错误 | 🔴 | 连接失败，需要排查 |

### 操作

| 操作 | 说明 |
|------|------|
| **添加 MCP** | 配置新的 MCP 服务 |
| **编辑** | 修改 MCP 配置 |
| **删除** | 移除 MCP 服务 |
| **同步** | 手动触发数据同步 |

### 添加 MCP 服务

\`\`\`步骤
1. 点击「添加 MCP」按钮
2. 输入服务名称（便于识别）
3. 填写服务端点地址
4. 配置认证信息（如需要）
5. 测试连接
6. 保存配置
\`\`\`

::: warning 网络要求
MCP 服务端点必须在网络上可达，请确保防火墙规则允许连接。
:::

### 同步机制

| 项目 | 说明 |
|------|------|
| 自动同步 | 每 5 分钟自动同步一次 |
| 手动同步 | 点击「同步」按钮立即触发 |
| 同步内容 | 模型上下文、工具定义、资源列表 |

::: tip 排查建议
如果 MCP 显示错误状态，请检查：
1. 端点地址是否正确
2. 网络连接是否正常
3. 认证信息是否有效
4. 服务端是否正常运行
:::
    `
  }
];

const faqItems = [
  {
    question: '如何开通试用？',
    answer: '访问 KSGC 官网，点击"开通试用"按钮。试用版将自动设置为专业版 + 20 席位，有效期 7 天，包含 100M Token 额度。',
    category: '入门'
  },
  {
    question: '模型无法关闭怎么办？',
    answer: '系统要求至少保持 1 个文本模型和 1 个视觉理解模型处于启用状态。请确保关闭后仍满足此条件。',
    category: '模型管理'
  },
  {
    question: '成员配额设置后没生效？',
    answer: '请检查：1. 配额开关是否已开启；2. 配额值是否大于 0；3. 是否满足层级约束（成员配额 < 部门配额 < 全局配额）',
    category: '配额管理'
  },
  {
    question: '身份源配置修改后不生效？',
    answer: '修改身份源配置后，需要通知用户重新下载安装 CLI 客户端，新配置才能生效。',
    category: '系统设置'
  },
  {
    question: 'IP 白名单显示"冗余"是什么意思？',
    answer: '表示该 IP 规则已被另一个更大的 CIDR 网段包含，可以考虑删除冗余规则以简化配置。',
    category: '安全'
  },
  {
    question: '如何查看详细的调用日志？',
    answer: '进入 Console > 调用明细，使用筛选条件定位具体记录，点击"查看详情"查看完整的输入输出内容。',
    category: '日志'
  },
  {
    question: '如何为部门批量配置模型权限？',
    answer: '进入 Console > 组织成员管理 > 组织管理，勾选需要配置的部门（支持级联选择），点击"批量配置模型"按钮。',
    category: '组织管理'
  },
  {
    question: 'My CLI 页面无法返回控制台？',
    answer: 'My CLI 是独立页面，在新标签页打开。如需返回控制台，请切换浏览器标签页或重新访问控制台地址。',
    category: 'CLI'
  },
  {
    question: 'Token 消耗如何计算？',
    answer: 'Token 消耗 = 输入 Token × 输入倍率 + 输出 Token × 输出倍率。倍率由管理员在 USS > 积分倍率中配置。',
    category: '计费'
  },
  {
    question: '如何扩展用户席位？',
    answer: '进入 Console > 概览页面，点击「订阅管理 / 扩容」按钮，选择新的席位数量并完成支付即可。',
    category: '订阅'
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

// ==================== 代码复制组件 ====================

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 hover:bg-background"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {language && (
        <div className="absolute left-3 top-2 text-xs text-muted-foreground font-mono">
          {language}
        </div>
      )}
      <pre className={cn(
        "bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm font-mono",
        language && "pt-8"
      )}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ==================== Callout 组件 ====================

interface CalloutProps {
  type: 'info' | 'warning' | 'danger' | 'tip' | 'success';
  title?: string;
  children: React.ReactNode;
}

function Callout({ type, title, children }: CalloutProps) {
  const config = {
    info: { 
      icon: Info, 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      border: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-800 dark:text-blue-300'
    },
    warning: { 
      icon: AlertTriangle, 
      bg: 'bg-amber-50 dark:bg-amber-950/30', 
      border: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-800 dark:text-amber-300'
    },
    danger: { 
      icon: AlertTriangle, 
      bg: 'bg-red-50 dark:bg-red-950/30', 
      border: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-300'
    },
    tip: { 
      icon: Lightbulb, 
      bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
      border: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-800 dark:text-emerald-300'
    },
    success: { 
      icon: Check, 
      bg: 'bg-green-50 dark:bg-green-950/30', 
      border: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-300'
    }
  };

  const { icon: Icon, bg, border, iconColor, titleColor } = config[type];
  const defaultTitles = {
    info: '提示',
    warning: '注意',
    danger: '警告',
    tip: '技巧',
    success: '成功'
  };

  return (
    <div className={cn('rounded-lg border p-4 my-4', bg, border)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1">
          <p className={cn('font-medium text-sm mb-1', titleColor)}>
            {title || defaultTitles[type]}
          </p>
          <div className="text-sm text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Markdown 渲染组件 ====================

function MarkdownContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inTable = false;
  let codeBlock: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let calloutType: 'info' | 'warning' | 'danger' | 'tip' | 'success' | null = null;
  let calloutTitle = '';
  let calloutContent: string[] = [];

  const processInlineStyles = (text: string) => {
    // Process bold, code, and links
    let result = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">$1</code>');
    return result;
  };

  const renderTable = (headers: string[], rows: string[][]) => {
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {headers.map((cell, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium text-foreground">
                  <span dangerouslySetInnerHTML={{ __html: processInlineStyles(cell.trim()) }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/50 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                    <span dangerouslySetInnerHTML={{ __html: processInlineStyles(cell.trim()) }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // Handle callout start
    if (line.trim().startsWith('::: ')) {
      const match = line.trim().match(/^::: (\w+)\s*(.*)?$/);
      if (match) {
        calloutType = match[1] as any;
        calloutTitle = match[2] || '';
        calloutContent = [];
        i++;
        continue;
      }
    }

    // Handle callout end
    if (line.trim() === ':::' && calloutType) {
      elements.push(
        <Callout key={`callout-${i}`} type={calloutType} title={calloutTitle || undefined}>
          {calloutContent.join(' ')}
        </Callout>
      );
      calloutType = null;
      calloutTitle = '';
      calloutContent = [];
      i++;
      continue;
    }

    // Collect callout content
    if (calloutType) {
      calloutContent.push(line.trim());
      i++;
      continue;
    }

    // Handle code block start
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '').trim();
        codeBlock = [];
      } else {
        // End code block
        elements.push(
          <CodeBlock 
            key={`code-${i}`} 
            code={codeBlock.join('\n')} 
            language={codeLanguage || undefined} 
          />
        );
        inCodeBlock = false;
        codeLanguage = '';
        codeBlock = [];
      }
      i++;
      continue;
    }

    // Collect code block content
    if (inCodeBlock) {
      codeBlock.push(line);
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      if (inTable && tableHeaders.length > 0) {
        elements.push(
          <React.Fragment key={`table-${i}`}>
            {renderTable(tableHeaders, tableRows)}
          </React.Fragment>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      elements.push(
        <h2 key={i} id={line.replace('## ', '').trim().toLowerCase().replace(/\s+/g, '-')} 
            className="text-2xl font-bold mt-8 mb-4 text-foreground scroll-mt-20">
          {line.replace('## ', '').trim()}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} id={line.replace('### ', '').trim().toLowerCase().replace(/\s+/g, '-')}
            className="text-xl font-semibold mt-6 mb-3 text-foreground scroll-mt-20">
          {line.replace('### ', '').trim()}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} id={line.replace('#### ', '').trim().toLowerCase().replace(/\s+/g, '-')}
            className="text-lg font-medium mt-5 mb-2 text-foreground scroll-mt-20">
          {line.replace('#### ', '').trim()}
        </h4>
      );
      i++;
      continue;
    }

    // Table header detection
    if (line.startsWith('|') && lines[i + 1]?.includes('---')) {
      const cells = line.split('|').filter(c => c.trim());
      tableHeaders = cells;
      inTable = true;
      tableRows = [];
      i += 2; // Skip header and separator
      continue;
    }

    // Table data row
    if (line.startsWith('|') && inTable) {
      const cells = line.split('|').filter(c => c.trim());
      tableRows.push(cells);
      i++;
      continue;
    }

    // Finish table if we encounter non-table content
    if (inTable && !line.startsWith('|')) {
      elements.push(
        <React.Fragment key={`table-${i}`}>
          {renderTable(tableHeaders, tableRows)}
        </React.Fragment>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
      // Don't increment i, process current line
    }

    // Bullet list
    if (line.trim().match(/^[•\-\*]\s/)) {
      const text = line.replace(/^[\s]*[•\-\*]\s/, '').trim();
      elements.push(
        <div key={i} className="flex gap-2 py-1 pl-2">
          <span className="text-primary mt-1.5">•</span>
          <span className="text-sm text-muted-foreground" 
                dangerouslySetInnerHTML={{ __html: processInlineStyles(text) }} />
        </div>
      );
      i++;
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.match(/^(\d+)\.\s*(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-3 py-1 pl-2">
            <span className="text-primary font-medium w-5 flex-shrink-0">{match[1]}.</span>
            <span className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: processInlineStyles(match[2]) }} />
          </div>
        );
      }
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed my-2 text-muted-foreground"
         dangerouslySetInnerHTML={{ __html: processInlineStyles(line) }} />
    );
    i++;
  }

  // Handle any remaining table
  if (inTable && tableHeaders.length > 0) {
    elements.push(
      <React.Fragment key="final-table">
        {renderTable(tableHeaders, tableRows)}
      </React.Fragment>
    );
  }

  return (
    <div ref={contentRef} className="prose prose-sm max-w-none">
      {elements}
    </div>
  );
}

// ==================== 页内目录组件 ====================

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('');
  
  // Extract headings from content
  const headings: TocItem[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('### ')) {
      const title = line.replace('### ', '').trim();
      headings.push({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        level: 3
      });
    } else if (line.startsWith('#### ')) {
      const title = line.replace('#### ', '').trim();
      headings.push({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        level: 4
      });
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        本页目录
      </p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
            "block text-sm py-1 transition-colors hover:text-primary",
            heading.level === 4 && "pl-3",
            activeId === heading.id 
              ? "text-primary font-medium" 
              : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById(heading.id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
}

// ==================== 上下页导航组件 ====================

interface NavigationProps {
  currentId: string;
  onNavigate: (id: string) => void;
}

function PageNavigation({ currentId, onNavigate }: NavigationProps) {
  const allItems = sidebarStructure.flatMap(s => s.items);
  const currentIndex = allItems.findIndex(item => item.id === currentId);
  
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  return (
    <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
      {prevItem ? (
        <button
          onClick={() => onNavigate(prevItem.id)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground">上一篇</p>
            <p className="font-medium text-foreground">{prevItem.title}</p>
          </div>
        </button>
      ) : <div />}
      
      {nextItem ? (
        <button
          onClick={() => onNavigate(nextItem.id)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <div className="text-right">
            <p className="text-xs text-muted-foreground">下一篇</p>
            <p className="font-medium text-foreground">{nextItem.title}</p>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      ) : <div />}
    </div>
  );
}

// ==================== 主组件 ====================

export function HelpCenter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'overview');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['intro', 'console']);
  const [showFaq, setShowFaq] = useState(false);

  // Update URL when section changes
  useEffect(() => {
    if (activeSection) {
      setSearchParams({ section: activeSection });
    }
  }, [activeSection, setSearchParams]);

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

  const getBreadcrumb = () => {
    if (showFaq) return ['帮助中心', '常见问题'];
    
    for (const section of sidebarStructure) {
      const found = section.items.find(item => item.id === activeSection);
      if (found) {
        return ['帮助中心', section.title, found.title];
      }
    }
    return ['帮助中心'];
  };

  const currentContent = getCurrentContent();
  const breadcrumb = getBreadcrumb();

  // 搜索过滤
  const filterBySearch = (items: Array<{ id: string; title: string; icon: React.ElementType; content: string }>) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content.toLowerCase().includes(query)
    );
  };

  const handleNavigate = (id: string) => {
    setActiveSection(id);
    setShowFaq(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧边栏 */}
      <aside className="w-72 border-r border-border bg-card flex flex-col flex-shrink-0">
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
              placeholder="搜索文档..."
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
                      hasActiveItem ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted"
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
                          onClick={() => handleNavigate(item.id)}
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

      {/* 中间内容区 */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-screen">
          <div className="max-w-4xl mx-auto px-8 py-6">
            {/* 面包屑 */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-3 h-3" />}
                  <span className={index === breadcrumb.length - 1 ? "text-foreground" : ""}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {showFaq ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">常见问题</h1>
                  <p className="text-muted-foreground">快速解答您在使用过程中遇到的问题</p>
                </div>

                {/* FAQ 分类标签 */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array.from(new Set(faqItems.map(item => item.category))).map(category => (
                    <span 
                      key={category}
                      className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div 
                      key={index}
                      className="border border-border rounded-lg p-5 bg-card hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          Q
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-2">{item.question}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                          <span className="inline-block mt-3 px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : currentContent ? (
              <>
                <MarkdownContent content={currentContent.content} />
                <PageNavigation currentId={activeSection} onNavigate={handleNavigate} />
              </>
            ) : null}

            {/* 底部版本信息 */}
            <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              <p>文档版本 v1.0 · 更新日期 2025-01-27</p>
              <p className="mt-1">如有疑问请联系技术支持</p>
            </div>
          </div>
        </ScrollArea>
      </main>

      {/* 右侧页内目录 */}
      {currentContent && !showFaq && (
        <aside className="w-56 border-l border-border bg-card flex-shrink-0 hidden xl:block">
          <div className="sticky top-0 p-4">
            <TableOfContents content={currentContent.content} />
          </div>
        </aside>
      )}
    </div>
  );
}

export default HelpCenter;
