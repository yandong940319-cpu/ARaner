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

```bash
# 安装依赖
npm install

# 环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

## 文档

- [实施计划](docs/IMPLEMENT_PLAN.md) — 完整的产品规划与技术方案
- [设计原型](prototype/) — Claude Design 导出的原始原型

## 团队

- 产品经理 / PM
- 测试 / QA
- 工程师 / Dev
- 代码评审 / Code Review
- 技术负责人 / Tech Lead
