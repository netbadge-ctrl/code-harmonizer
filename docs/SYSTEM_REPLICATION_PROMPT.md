# KSGC 企业级 AI Coding 辅助服务云平台 - 系统复刻提示词

> **版本**：v1.0  
> **更新日期**：2025-01-29  
> **用途**：在其他 AI 工具中快速复刻 KSGC 系统的完整提示词

---

## 📋 目录

1. [产品定位与概述](#1-产品定位与概述)
2. [技术栈与架构](#2-技术栈与架构)
3. [设计系统规范](#3-设计系统规范)
4. [页面功能详细说明](#4-页面功能详细说明)
5. [数据类型定义](#5-数据类型定义)
6. [交互规范与约束](#6-交互规范与约束)
7. [复刻开发指南](#7-复刻开发指南)

---

## 1. 产品定位与概述

### 1.1 产品名称
**KSGC（智码云）** - 企业级 AI Coding 辅助服务云平台

### 1.2 产品定位
- **类型**：B2B 企业级 SaaS 产品
- **目标用户**：企业开发团队、技术部门、IT 管理者
- **核心价值**：为企业提供安全、可控、高效的 AI 编程辅助服务

### 1.3 系统模块划分

```
KSGC 平台
├── Landing（落地页）
│   └── 企业入口、开通试用
├── Onboarding（入驻流程）
│   └── 服务配置、订阅选择、订单确认
├── Console（企业管理控制台）
│   ├── 概览
│   ├── 用量看板
│   ├── 调用明细
│   ├── 模型管理
│   ├── 组织成员管理
│   ├── 配额管理
│   ├── IP 白名单
│   └── 系统设置
├── USS（运营管理后台）
│   ├── 客户管理
│   ├── 客户详情
│   ├── 数据看板
│   ├── 积分倍率
│   └── 系统设置
├── My CLI（个人中心）
│   ├── Token 用量
│   ├── Skills 配置
│   └── MCP 管理
└── Help Center（帮助中心）
    └── 三栏式专业文档站
```

### 1.4 核心功能概述

| 模块 | 核心功能 |
|------|----------|
| Console | 企业 AI 服务管理、成员权限控制、用量监控 |
| USS | 多客户运营管理、跨客户数据分析、积分配置 |
| My CLI | 个人用量查看、Skills 和 MCP 配置 |
| Help Center | 产品文档、操作指南、FAQ |

---

## 2. 技术栈与架构

### 2.1 前端技术栈

```json
{
  "framework": "React 18+",
  "language": "TypeScript (Strict Mode)",
  "styling": "Tailwind CSS",
  "ui_components": "shadcn/ui (Radix UI 基础)",
  "icons": "lucide-react",
  "charts": "Recharts",
  "routing": "react-router-dom v6",
  "state": "React Hooks + Context",
  "http": "@tanstack/react-query",
  "forms": "react-hook-form + zod",
  "notifications": "sonner + @radix-ui/react-toast"
}
```

### 2.2 项目结构

```
src/
├── components/
│   ├── admin/           # USS 管理后台组件
│   ├── console/         # Console 相关组件
│   ├── dashboard/       # 仪表盘组件
│   ├── departments/     # 部门管理组件
│   ├── layout/          # 布局组件 (Header, Sidebar)
│   ├── members/         # 成员管理组件
│   ├── models/          # 模型管理组件
│   ├── onboarding/      # 入驻流程组件
│   ├── organization/    # 组织管理组件
│   ├── quota/           # 配额管理组件
│   ├── security/        # 安全相关组件
│   ├── settings/        # 设置组件
│   ├── subscription/    # 订阅管理组件
│   ├── ui/              # 基础 UI 组件
│   └── usage/           # 用量相关组件
├── data/
│   ├── mockData.ts      # Console 模拟数据
│   └── adminMockData.ts # USS 模拟数据
├── hooks/               # 自定义 Hooks
├── lib/                 # 工具函数
├── pages/               # 页面组件
└── types/               # TypeScript 类型定义
```

### 2.3 路由配置

```typescript
const routes = [
  { path: "/", element: <Landing /> },              // 落地页
  { path: "/onboarding", element: <Onboarding /> }, // 入驻流程
  { path: "/order-confirm", element: <OrderConfirm /> }, // 订单确认
  { path: "/console", element: <Console /> },       // 企业控制台
  { path: "/my-cli", element: <MyCli /> },         // 个人中心
  { path: "/uss", element: <USS /> },              // 运营后台
  { path: "/help", element: <HelpCenter /> },      // 帮助中心
  { path: "*", element: <NotFound /> }             // 404
];
```

---

## 3. 设计系统规范

### 3.1 设计原则

**核心约束：**
- ❌ **禁止使用纯黑色 (#000000)**，所有文本使用 slate 色系
- ❌ **禁止 C2B 风格**（活泼图标、彩色渐变等）
- ✅ **B2B 企业风格**：稳重、专业、保守
- ✅ **语义化颜色 Token**：所有颜色必须通过 CSS 变量使用

### 3.2 颜色系统 (HSL)

```css
:root {
  /* 基础色 */
  --background: 0 0% 98%;
  --foreground: 220 13% 18%;
  
  /* 卡片 */
  --card: 0 0% 100%;
  --card-foreground: 220 13% 18%;
  
  /* 主色调 - 企业蓝 */
  --primary: 213 94% 50%;
  --primary-hover: 213 94% 45%;
  --primary-foreground: 0 0% 100%;
  
  /* 次要色 */
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 13% 18%;
  
  /* 静音色 */
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  
  /* 强调色 */
  --accent: 213 94% 96%;
  --accent-foreground: 213 94% 50%;
  
  /* 语义色 */
  --destructive: 0 84% 60%;
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --info: 213 94% 50%;
  
  /* 边框和输入 */
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 213 94% 50%;
  
  /* 圆角 */
  --radius: 0.5rem;
  
  /* 侧边栏 */
  --sidebar-background: 0 0% 100%;
  --sidebar-foreground: 220 13% 18%;
  --sidebar-primary: 213 94% 50%;
  --sidebar-accent: 213 94% 96%;
  --sidebar-border: 220 13% 91%;
  --sidebar-muted: 220 9% 46%;
}
```

### 3.3 字体系统

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

| 用途 | 字重 | 大小 |
|------|------|------|
| 页面标题 | 700 | 1.5rem |
| 卡片标题 | 600 | 1rem |
| 正文 | 400 | 0.875rem |
| 辅助文字 | 400 | 0.75rem |

### 3.4 组件样式约定

**企业卡片 (.enterprise-card):**
```css
.enterprise-card {
  @apply bg-card rounded-xl border border-border/50 shadow-sm;
}
```

**状态徽章:**
```css
.status-badge-success { @apply bg-success/10 text-success; }
.status-badge-warning { @apply bg-warning/10 text-warning; }
.status-badge-error { @apply bg-destructive/10 text-destructive; }
```

**数据表格:**
```css
.data-table th { @apply px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase; }
.data-table td { @apply px-4 py-3 text-sm border-b border-border/50; }
```

### 3.5 动画规范

```css
/* 淡入 */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 右侧滑入 */
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## 4. 页面功能详细说明

### 4.1 Landing（落地页）

**路径**：`/`

**功能描述**：
- 产品介绍和价值主张展示
- 两个核心入口：
  - 「登录控制台」→ 跳转 `/console`
  - 「开通试用」→ 跳转 `/onboarding`

**关键元素**：
- Hero 区域（标题、副标题、CTA 按钮）
- 功能特性介绍卡片
- 客户案例/信任背书
- 页脚导航

---

### 4.2 Onboarding（入驻流程）

**路径**：`/onboarding`

**功能描述**：
引导企业完成服务开通，采用统一配置页面设计。

**页面布局**：
```
┌─────────────────────────────────────────────────┐
│ 左侧内容区（主体表单）    │ 右侧导航（章节锚点）    │
│ - 企业集成配置            │ ○ 企业集成配置         │
│ - 云服务资源开通          │ ○ 云服务资源开通       │
└─────────────────────────────────────────────────┘
```

**企业集成配置字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| 认证源类型 | 单选按钮（平铺） | WPS协作 / 企业微信 / 飞书 / 钉钉 |
| App ID | 文本输入 | 身份源应用 ID |
| App Key | 密码输入 + 可见性切换 | 身份源应用密钥 |
| Redirect URI | 文本输入 + 复制按钮 | 回调地址 |

**云服务资源开通字段**：

| 字段 | 类型 | 约束 |
|------|------|------|
| 数据库账号 | 文本输入 | 默认 "admin"，禁止 root/rdsrepladmin/rdsadmin/dtsroot |
| 数据库密码 | 密码输入 | 最少 8 位 |
| 确认密码 | 密码输入 | 必须与密码一致 |

**订阅选择**：

| 配置项 | 选项 |
|--------|------|
| 版本 | 基础版 / 专业版 |
| 计费方式 | 包年包月 / 按量付费 / 试用 |
| 时长（包年包月） | 1-12月 / 2年 / 3年（带折扣） |
| 席位 | 20 / 50 / 100 / 200 / 300 / 500 / 1000 / 2000 |

**试用模式约束**：
- 自动锁定为专业版 + 20 席位
- 显示 "7天 / 100M Token" 限制说明

**交互规则**：
- 点击「立即购买」→ 跳转 `/order-confirm`
- 实时计算预估费用

---

### 4.3 Console（企业管理控制台）

**路径**：`/console`

**布局结构**：
```
┌────────────────────────────────────────────────┐
│ Sidebar (w-48/w-14) │ Main Content Area        │
│                     │ ┌──────────────────────┐ │
│ [Logo] 智码云 控制台 │ │ Header (标题+描述)   │ │
│                     │ ├──────────────────────┤ │
│ 概览                │ │                      │ │
│                     │ │    Content Area      │ │
│ 数据统计 ▼          │ │                      │ │
│   用量看板          │ │                      │ │
│   调用明细          │ │                      │ │
│                     │ │                      │ │
│ 服务管理 ▼          │ │                      │ │
│   模型管理          │ │                      │ │
│   组织成员管理      │ └──────────────────────┘ │
│   配额管理          │                          │
│   IP白名单          │                          │
│   系统设置          │                          │
│                     │                          │
│ [我的 CLI]          │                          │
│ [◀ 收起]            │                          │
└────────────────────────────────────────────────┘
```

#### 4.3.1 概览 (dashboard)

**功能**：
- 订阅信息卡片（计划、到期时间、席位使用情况）
- 用量统计卡片（Token、活跃用户、请求数）
- CLI 安装命令（可复制）
- 订阅管理入口（扩容/升级/续费）

**交互**：
- 点击订阅管理按钮打开 SubscriptionUpgradeDialog

#### 4.3.2 用量看板 (usage)

**Tab 结构**：
- 全局视图：整体用量趋势、模型消耗排行、平均耗时
- 组织视图：部门层级下钻、成员使用详情

**全局视图内容**：
| 组件 | 描述 |
|------|------|
| 日期范围选择器 | 控制所有图表的时间范围 |
| 使用趋势图 | 活跃用户/Token/请求数（可选显示） |
| 模型消耗排行 | 横向柱状图 |
| 平均耗时统计 | 按模型展示延迟 |

**组织视图交互**：
- 面包屑导航显示层级路径
- 点击「下钻」进入子部门
- 切换「部门/成员」视图模式
- 成员列表包含所有后代成员

#### 4.3.3 调用明细 (callDetails)

**列表字段**：
| 字段 | 说明 |
|------|------|
| 时间戳 | timestamp |
| 用户 | userName |
| 模型 | model |
| 客户端 | client |
| 输入 Token | inputTokens |
| 输出 Token | outputTokens |
| 状态 | status（success/error/timeout） |
| 操作 | 查看详情 |

**详情弹窗**：
- 模型输入（支持复制）
- 响应内容（支持复制）
- 请求元数据

#### 4.3.4 模型管理 (models)

**功能**：
- 模型列表（名称、上下文、RPM、TPM、开关）
- 全部开启按钮
- 自动开启新模型开关

**约束规则**：
- 系统至少保持 1 个文本模型 + 1 个视觉模型启用
- 首次启用任意模型需同意《星流平台 API 服务协议》

**列表排序**：
- 按模型类型（文本优先）
- 再按名称字母顺序

#### 4.3.5 组织成员管理 (members)

**Tab 结构**：
- 成员管理：成员列表、添加/编辑/禁用
- 组织管理：部门树、批量配置

**成员类型**：
| 类型 | 来源 | 可编辑 |
|------|------|--------|
| SSO 成员 | 身份源同步 | ❌ |
| 手动成员 | 手动添加 | ✅ |

**成员状态**：
- 正常 (active) - 绿色徽章
- 待激活 (pending) - 黄色徽章（仅手动成员）
- 禁用 (inactive) - 灰色徽章

**操作按钮**：
- 禁用/启用
- 编辑（仅手动成员）
- 重新发送密钥（仅手动成员）

**模型权限逻辑（并集策略）**：
- 成员继承部门模型权限（锁定，不可移除）
- 可额外授予个人模型权限
- 最终权限 = 部门模型 ∪ 个人模型

**组织管理功能**：
- 左右分栏布局
- 左侧：组织树 + 搜索 + 全选按钮
- 右侧：模型配置面板（AI 服务开关 + 模型复选列表）
- 同步状态："上次同步: xxx · 每日0:00、12:00自动同步"
- 支持三级组织层级

#### 4.3.6 配额管理 (quota)

**配额层级**：
```
全局配额 → 部门配额 → 成员配额
```

**约束规则**：
- 开关默认关闭，开启后必须设置 > 0 的金额
- 层级校验：成员 ≤ 部门 ≤ 全局
- 不符合约束时显示错误提示
- 修改立即生效

**显示说明**：
- 部门/成员表格仅显示有自定义配置的条目
- 单价说明：按实际计费单价计算

#### 4.3.7 IP 白名单 (security)

**支持类型**：
- 单个 IP：如 `203.0.113.50`
- CIDR 网段：如 `10.0.0.0/24`

**字段说明**：
| 字段 | 说明 |
|------|------|
| IP/网段 | 白名单值 |
| 类型 | single / cidr |
| 状态 | 显示冗余信息 |
| 描述 | 备注说明 |
| 创建时间 | timestamp |
| 创建人 | 操作者 |

**冗余检测**：
- 自动检测被更大网段包含的 IP/网段
- 在状态列标记"已被 xxx 包含（冗余）"

**验证规则**：
- 禁止内网 IP（10.x.x.x, 192.168.x.x, 172.16-31.x.x）
- 删除需二次确认

#### 4.3.8 系统设置 (settings)

**身份源配置**：
- 认证源类型（平铺单选）
- App ID / App Key / Redirect URI
- App Key 可见性切换（密文/明文）
- 保存时提醒重新下载 CLI

---

### 4.4 USS（运营管理后台）

**路径**：`/uss`

**目标用户**：平台运营管理员

**侧边栏结构**：
```
[Logo] 智码云 USS
├── 客户管理
├── 数据看板
├── 积分倍率
├── 系统设置
└── [返回控制台]
```

#### 4.4.1 客户管理 (customers)

**列表字段**：
| 字段 | 说明 |
|------|------|
| 公司名称 | companyName |
| 客户识别码 | customerCode |
| 客户端版本 | clientVersion |
| 服务端版本 | serverVersion |
| 订阅版本 | 基础版/专业版 |
| 服务状态 | 试用/正常/已过期 |
| 席位使用 | usedSeats / seats |
| 本月用量 | monthlyTokens |
| 活跃用户 | activeUsers |

**操作**：
- 点击行跳转到客户详情

#### 4.4.2 客户详情 (customerDetail)

**Tab 顺序**（使用统计优先）：
1. 使用统计
2. 配置信息

**使用统计内容**：
- 筛选栏（时间、模型）
- 指标卡片：Token 消耗（入/出）、请求数、活跃用户
- 趋势图（Token/请求量、1K Token 耗时）
- 模型性能表（约 20 行，客户端排序）
- 错误系统（堆叠柱状图 + 错误日志）

**模型性能表列**：
| 列名 | 说明 |
|------|------|
| 模型 | 模型名称 |
| Token 消耗（入/出） | 输入/输出分开显示 |
| TPM | 每分钟 Token 数 |
| TTFT (Avg/P98) | 首 Token 时延 |
| TPOT | Token 生成速度 |
| 请求（成功/总） | 成功数/总请求数 |
| 错误数 | 错误次数 |

**错误日志**：
- 10 条分页
- 发生时间、模型、错误码、查看详情
- 详情弹窗：Request ID、Endpoint、Error Message

**配置信息**：
- 认证配置
- 账户配置（权限开关，如"模型切换"）

#### 4.4.3 数据看板 (analytics)

**与客户详情共享的统一设计**：
- 筛选栏：时间 + 客户 + 模型
- 指标卡片
- 趋势图
- 客户消耗排行（全局视图特有）
- 模型性能表
- 错误系统

#### 4.4.4 积分倍率 (creditRatio)

**功能**：
- 配置不同模型的积分消耗倍率
- 模型列表 + 倍率输入

---

### 4.5 My CLI（个人中心）

**路径**：`/my-cli`

**访问方式**：
- 点击 Console Header 用户名，新标签页打开
- 完全独立页面，无返回控制台按钮

**模块结构**：

#### 4.5.1 Token 用量

**卡片设计**：
1. 月累计消耗：¥120 / ¥500（月用量/配额）
2. 当日消耗：¥8.50 + 12,450 tokens

**调用明细**：
- 日期选择器（仅当月）
- 列表：时间、任务、模型、费用

#### 4.5.2 Skills 配置

**功能**：
- 内置 Skills 开关（不可删除）
- 自定义 Skills（添加/编辑/删除）

#### 4.5.3 MCP 管理

**功能**：
- MCP 服务统计（总数、已连接、待处理）
- 服务列表（名称、端点、状态、同步时间）
- 添加/编辑/删除 MCP

---

### 4.6 Help Center（帮助中心）

**路径**：`/help`

**访问入口**：全局 Header 帮助图标

**三栏布局**：
```
┌──────────────┬─────────────────────────┬─────────────┐
│ 左侧导航      │ 中间内容区               │ 右侧目录     │
│ (w-56)       │ (flex-1)                │ (w-56)      │
│              │                         │             │
│ 搜索框       │ 面包屑                   │ 本页目录     │
│ 产品概述 ▼   │ 文章标题                 │ ○ 章节1     │
│  - 概述      │ 正文内容                 │ ○ 章节2     │
│  - 快速开始  │ (Markdown渲染)           │ ○ 章节3     │
│ Console ▼   │                         │             │
│ USS ▼       │ 上一篇 / 下一篇          │             │
│ My CLI ▼    │                         │             │
│ FAQ ▼       │                         │             │
└──────────────┴─────────────────────────┴─────────────┘
```

**Markdown 渲染特性**：
- 代码块：深色主题 + 语言标签 + 复制按钮
- Callout 组件：info/warning/danger/tip/success
- 表格：圆角 + 交替行色
- 目录锚点：IntersectionObserver 滚动高亮

**URL 同步**：
- 使用 `?section=xxx` 查询参数
- 支持直接链接到特定章节

---

## 5. 数据类型定义

### 5.1 组织类型 (Organization)

```typescript
interface Organization {
  id: string;
  name: string;
  domain: string;
  identitySource: 'wps365' | 'wecom' | null;
  subscription: {
    plan: 'trial' | 'starter' | 'professional' | 'enterprise';
    seats: number;
    usedSeats: number;
    trialDays: number;
    expiresAt: string;
  };
  createdAt: string;
}
```

### 5.2 成员类型 (Member)

```typescript
interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role: 'admin' | 'member';
  source: 'sso' | 'manual';
  status: 'active' | 'inactive' | 'pending';
  lastActiveAt?: string;
  createdAt: string;
}
```

### 5.3 部门类型 (Department)

```typescript
interface Department {
  id: string;
  name: string;
  parentId: string | null;
  memberCount: number;
  aiEnabled: boolean;
  allowedModels: string[];
  children?: Department[];
}
```

### 5.4 AI 模型类型 (AIModel)

```typescript
interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
  rpmLimit: number;
  tpmLimit: number;
  currentRpm: number;
  currentTpm: number;
}
```

### 5.5 IP 规则类型 (IpRule)

```typescript
interface IpRule {
  id: string;
  value: string;
  type: 'single' | 'cidr';
  description: string;
  createdAt: string;
  createdBy: string;
}
```

### 5.6 使用记录类型 (UsageRecord)

```typescript
interface UsageRecord {
  id: string;
  userId: string;
  userName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  status: 'success' | 'error' | 'timeout';
  timestamp: string;
  prompt?: string;
  response?: string;
}
```

### 5.7 客户类型 (Customer) - USS

```typescript
interface Customer {
  id: string;
  companyName: string;
  customerCode: string;
  clientVersion: string;
  serverVersion: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  subscription: {
    plan: 'starter' | 'professional';
    status: 'trial' | 'active' | 'expired';
    billingType: 'prepaid' | 'postpaid';
    startDate: string;
    expiresAt: string;
    seats: number;
    usedSeats: number;
  };
  authConfig: {
    enterpriseAuthMethod: 'wps365' | 'wecom' | 'dingtalk' | 'feishu' | 'none';
    ipWhitelistEnabled: boolean;
    ipWhitelist: string[];
  };
  enabledModels: string[];
  usage: {
    totalTokens: number;
    monthlyTokens: number;
    activeUsers: number;
    totalRequests: number;
    monthlyRequests: number;
    lastActiveAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. 交互规范与约束

### 6.1 全局交互规则

| 规则 | 说明 |
|------|------|
| 加载状态 | 所有异步操作显示 loading 状态 |
| 操作反馈 | 使用 Toast 提示成功/失败 |
| 确认弹窗 | 危险操作需二次确认 |
| 表单验证 | 实时校验 + 提交时校验 |

### 6.2 侧边栏行为

| 状态 | 宽度 | 显示内容 |
|------|------|----------|
| 展开 | w-48 (192px) | 图标 + 文字 |
| 收起 | w-14 (56px) | 仅图标 |

### 6.3 表格规范

- 表头：大写字母、加粗、背景色区分
- 行悬停：轻微背景色变化
- 操作列：右对齐
- 分页：默认每页 10 条

### 6.4 模态框规范

- 标题 + 关闭按钮
- 内容区可滚动
- 底部操作按钮（取消 / 确认）
- 点击遮罩层不关闭

### 6.5 错误处理

| 类型 | 处理方式 |
|------|----------|
| 网络错误 | Toast 错误提示 + 重试按钮 |
| 表单错误 | 字段下方红色文字提示 |
| 权限错误 | 禁用操作 + 提示文字 |

---

## 7. 复刻开发指南

### 7.1 推荐开发顺序

```
Phase 1: 基础框架
├── 1.1 项目初始化（Vite + React + TypeScript）
├── 1.2 设计系统配置（Tailwind + CSS 变量）
├── 1.3 路由配置
└── 1.4 布局组件（Header + Sidebar）

Phase 2: Landing + Onboarding
├── 2.1 Landing 页面
├── 2.2 Onboarding 流程
└── 2.3 OrderConfirm 页面

Phase 3: Console 核心功能
├── 3.1 概览页面
├── 3.2 用量看板
├── 3.3 调用明细
├── 3.4 模型管理
├── 3.5 成员管理
├── 3.6 组织管理
├── 3.7 配额管理
├── 3.8 IP 白名单
└── 3.9 系统设置

Phase 4: USS 管理后台
├── 4.1 客户列表
├── 4.2 客户详情
├── 4.3 数据看板
└── 4.4 积分倍率

Phase 5: My CLI
├── 5.1 Token 用量
├── 5.2 Skills 配置
└── 5.3 MCP 管理

Phase 6: Help Center
└── 6.1 三栏式文档站
```

### 7.2 关键实现要点

**1. 侧边栏状态管理**
```typescript
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [currentView, setCurrentView] = useState('dashboard');
```

**2. 树形组件递归渲染**
```typescript
function DepartmentTree({ departments, level = 0 }) {
  return departments.map(dept => (
    <div key={dept.id} style={{ paddingLeft: level * 16 }}>
      <DepartmentNode department={dept} />
      {dept.children && <DepartmentTree departments={dept.children} level={level + 1} />}
    </div>
  ));
}
```

**3. 配额层级校验**
```typescript
function validateQuota(memberQuota, deptQuota, globalQuota) {
  if (memberQuota > deptQuota) return '成员配额不能超过部门配额';
  if (deptQuota > globalQuota) return '部门配额不能超过全局配额';
  return null;
}
```

**4. IP 冗余检测**
```typescript
function checkRedundancy(ipRules) {
  return ipRules.map(rule => {
    const containedBy = ipRules.find(other => 
      other.id !== rule.id && isContainedByCIDR(rule.value, other.value)
    );
    return { ...rule, redundant: containedBy ? other.value : null };
  });
}
```

### 7.3 常用提示词片段

**创建 Console 页面基础结构：**
```
创建一个企业管理控制台页面，包含：
1. 可收缩侧边栏（展开 w-48，收起 w-14）
2. 顶部 Header（标题 + 描述 + 用户信息）
3. 主内容区域
4. 侧边栏导航分组：概览、数据统计（用量看板、调用明细）、服务管理（模型管理、成员管理等）
5. 使用 React Router 的单页面视图切换
```

**实现组织树形结构：**
```
创建一个三级组织树组件：
1. 支持无限层级递归渲染
2. 每个节点显示：展开/收起图标、复选框、名称、人数、AI 状态
3. 父节点选中时自动选中所有子节点
4. 子节点全选时父节点自动选中
5. 支持搜索过滤
```

**实现数据看板：**
```
创建数据分析看板：
1. 日期范围选择器（今日/7天/30天/自定义）
2. 使用 Recharts 绘制趋势图（折线+柱状图）
3. 指标卡片（Token、请求数、活跃用户）
4. 模型消耗排行（横向柱状图）
5. 支持 Tab 切换不同视图
```

---

## 附录 A：图标对照表

| 功能 | Lucide 图标 |
|------|-------------|
| 概览 | LayoutDashboard |
| 用量看板 | BarChart3 |
| 调用明细 | FileText |
| 模型管理 | Boxes |
| 成员管理 | Users |
| 配额管理 | Wallet |
| IP 白名单 | Shield |
| 系统设置 | Settings |
| 客户管理 | Building2 |
| 积分倍率 | Coins |
| 帮助中心 | BookOpen |
| 返回 | ArrowLeft |
| 收起菜单 | ChevronLeft |
| 展开分组 | ChevronDown |

---

## 附录 B：状态码对照

| 状态 | 颜色 | Badge 样式 |
|------|------|------------|
| 成功/正常/active | 绿色 | bg-success/10 text-success |
| 警告/待激活/pending | 黄色 | bg-warning/10 text-warning |
| 错误/已过期/expired | 红色 | bg-destructive/10 text-destructive |
| 禁用/inactive | 灰色 | bg-muted text-muted-foreground |
| 试用/trial | 蓝色 | bg-primary/10 text-primary |

---

**文档结束**

> 使用此提示词时，可根据实际需求选择相关章节发送给 AI 工具，逐步构建系统。
