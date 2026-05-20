# 盎然内容 (ARaner)

AI 驱动的内容创作与多平台管理工具。

## 产品定位

面向品牌团队和内容创作者的跨平台创作 SaaS 工具，覆盖从**热点追踪 → 选题灵感 → AI 创作 → 多平台发布 → 数据分析**的全链路。

目标平台：小红书 · YouTube · TikTok · Facebook

## 技术栈

| 层 | 选型 |
|----|------|
| 前端框架 | Next.js 16 + React + TypeScript |
| 样式 | Tailwind CSS v4 |
| 后端 | Next.js API Routes（Wave 1） |
| 数据库 | PostgreSQL + Prisma ORM |
| 对象存储 | MinIO / S3 |
| AI Proxy | Next.js API Routes → Anthropic SDK |

## 核心架构

```
Next.js App → AI Proxy (Key Router) → Provider Adapter (Anthropic/OpenAI/...)
                                                          ↓
                                                PostgreSQL + S3
```

- **多租户 SaaS**：所有数据按 org_id 隔离
- **用户自备 API Key**：Key 经加密传输到后端 AI Proxy，前端不接触明文
- **AI Proxy**：统一管理多 provider 路由 + SSE streaming
- **发布状态机**：Draft → Scheduled → Publishing → PartialFail/Completed

## 模块

| 模块 | 说明 | 状态 |
|------|------|------|
| 工作台 Dashboard | KPI 卡片、跨平台趋势图 | ⏳ Wave 2 |
| 热点分析 Trends | 话题排行、多平台趋势对比 | ⏳ Wave 3 |
| 选题灵感 Ideas | AI 选题生成、灵感看板 | ⏳ Wave 2 |
| 编辑器 Editor | AI 文字/图文/视频生成（核心模块） | 🚧 Wave 1 |
| 发布管理 Publish | 发布队列、排期管理 | 🚧 Wave 1 |
| 数据分析 Analytics | KPI、趋势、内容排行 | ⏳ Wave 3 |
| 素材库 Assets | 图片/视频/文案素材管理 | 🚧 Wave 1 |
| Key 管理 | 多 provider API Key 配置 | 🚧 Wave 1 |

## Wave 交付计划

参见 [docs/IMPLEMENT_PLAN.md](docs/IMPLEMENT_PLAN.md)

| Wave | 内容 | 工期 |
|------|------|------|
| 1 | 骨架 + 编辑器核心 | 4 周 |
| 2 | 创作流完整闭环 | 3 周 |
| 3 | 数据驱动 + 精细化 | 3 周 |
| 4 | 真实发布链路 | 4-6 周 |

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 15+（本地运行需要）
- Anthropic API Key（AI 生成功能需要）

### 安装运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 DATABASE_URL 等配置

# 初始化数据库
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

### 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 是 |
| `NEXTAUTH_SECRET` | NextAuth.js 密钥 | 是 |
| `NEXTAUTH_URL` | 应用部署地址 | 是 |
| `PROXY_PUBLIC_KEY` | AI Proxy 公钥（Key 加密传输） | 是 |
| `PROXY_PRIVATE_KEY` | AI Proxy 私钥 | 是 |

> 用户自备的 Anthropic/OpenAI 等 API Key 通过应用的 Key 管理页面配置，非环境变量。

## 项目结构

```
├── docs/                    # 文档
│   ├── IMPLEMENT_PLAN.md    # 实施计划与架构设计
│   └── 盎然内容-实施计划.docx  # Word 版计划
├── prototype/               # 设计原型（Claude Design 导出）
│   └── untitled/project/    # React 原型源码 + screenshots
├── public/                  # 静态资源
├── scripts/                 # 工具脚本
├── src/                     # 应用源码
│   ├── app/                 # Next.js App Router 页面
│   │   ├── layout.tsx       # 根布局（Sidebar + 内容区）
│   │   ├── page.tsx         # 工作台首页
│   │   ├── globals.css      # 全局样式 + 共享组件类
│   │   ├── editor/          # AI 编辑器
│   │   ├── ideas/           # 选题灵感
│   │   ├── trends/          # 热点分析
│   │   ├── publish/         # 发布管理
│   │   ├── analytics/       # 数据分析
│   │   ├── assets/          # 素材库
│   │   └── keys/            # Key 管理
│   ├── components/          # 共享 UI 组件
│   │   ├── sidebar.tsx      # 侧边导航栏（品牌 + 菜单 + 用户信息）
│   │   └── icons.tsx        # SVG 导航图标集
│   └── lib/
│       ├── design-tokens.ts # 设计令牌（颜色、字体、导航配置）
│       └── ...              # 工具函数 / API 客户端
└── package.json
```

## 设计系统

基于原型设计（`prototype/`），颜色和组件风格统一使用预定义的令牌：

- **颜色色板**：见 `src/lib/design-tokens.ts` 的 `colors` 常量（暖色中性色盘，#cd5a3a 珊瑚色为强调色）
- **共享组件类**（定义在 `src/app/globals.css`）：
  - `.pr-btn` — 按钮（支持 `.primary`、`.accent`、`.sm`、`.ghost` 修饰）
  - `.pr-input` — 输入框
  - `.pr-card` — 卡片容器
  - `.pr-scroll` — 自定义滚动条容器
- **导航图标**：`src/components/icons.tsx` 提供 8 个 SVG 导航图标

## 开发规范

- 页面代码放在 `src/app/` 下，按路由名建文件夹（App Router 约定）
- 共享组件放在 `src/components/`
- 颜色和尺寸统一引用 `src/lib/design-tokens.ts`，不硬编码
- 新增 AI API 调用走后端 Proxy，不从前端直调第三方 provider
- 提交信息使用约定式提交（`feat:` / `fix:` / `chore:` / `docs:`）

## 关键架构决策

参见 [docs/IMPLEMENT_PLAN.md#十架构决策记录-adr](docs/IMPLEMENT_PLAN.md#十架构决策记录-adr) 的完整 ADR：

| ADR | 决策 | 影响 |
|-----|------|------|
| 001 | 多租户 SaaS | 所有数据表带 org_id |
| 002 | 用户自备 API Key | Key 加密传输（RSA→AES-256-GCM），前端不接触明文 |
| 003 | AI Proxy 转发 | 前端不直调第三方 API，统一 SSE streaming |
| 004 | SSE Streaming | AI 生成逐 chunk 渲染，不等全量返回 |
| 005 | Mock adapter 先行 | 发布状态机 Wave 1 用 mock，Wave 4 接真实 API |

## 文档

- [实施计划](docs/IMPLEMENT_PLAN.md) — 完整的产品规划、技术方案与 WAVE 交付计划
- [设计原型](prototype/) — 原型源码和 Wireframes（7 个页面的完整交互设计）

## 团队

| 角色 | 负责 |
|------|------|
| 产品经理 | 产品定位、范围划分、Wave 计划 |
| 架构师 / 代码评审 | 数据模型、AI Proxy 架构、Key 管理方案 |
| 工程师 | 工程实现、代码评审、性能优化 |
| 技术负责人 | 整体架构评审、工程演进策略 |
| 测试 | 验收清单、边界条件矩阵、AI 质量验收 |
