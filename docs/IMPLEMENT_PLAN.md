# Implement Plan: 盎然内容 (Vibrant Content)

> 多平台内容创作 SaaS 工具 · 全功能版本
> 最后更新: 2026-05-20

---

## 一、产品定位

**盎然内容**是一个 AI 驱动的多平台内容创作与管理平台，覆盖从**热点追踪 → 选题灵感 → AI 创作 → 多平台发布 → 数据分析**的全链路。

**产品名称：** 盎然内容
**目标用户：** 品牌团队 / 内容创作者 / 新媒体运营（多租户 SaaS）
**核心平台：** 小红书 · YouTube · TikTok · Facebook
**交付形态：** Web 端（响应式，桌面优先）
**AI 策略：** 用户自备 API Key，平台做 Proxy 路由层

---

## 二、方向性决策（ADR-001）

| # | 问题 | 决策 | 影响 |
|---|------|------|------|
| 1 | 单用户 vs 多租户 | **多租户 SaaS** | 所有数据模型带 org_id/team_id，第一天按多租户设计 |
| 2 | AI 模型谁出 | **用户自备 API Key** | Key 加密存储，前端安全传输到 AI Proxy；不做用量计费 |
| 3 | 平台形态 | **仅 Web 端** | 前端选型无需考虑跨平台兼容 |
| 4 | 多平台发布方式 | **先一键复制粘贴** | 发布状态机 + mock 先行，API adapter 层留接口后续扩展 |

---

## 三、模块总览

源自原型 `screens.jsx` + `proto-*.jsx`，共 7+1 个模块。

| # | 模块 | 复杂度 | 页面/视图 | 关键交互 |
|---|------|--------|-----------|----------|
| 1 | **工作台 Dashboard** | ⭐⭐ | V1: KPI + 趋势图 + 待办；V2: AI 提示框 + 近期列表 | KPI 卡片、趋势图表（MultiLineChart） |
| 2 | **热点分析 Trends** | ⭐⭐⭐ | V1: 话题排行表格 + 筛选；V2: 单话题深度页（热度走势 + 平台对比 + 关联词 + KOL） | 搜索/筛选、表格、图表、洞察摘要 |
| 3 | **选题灵感 Ideas** | ⭐⭐⭐ | V1: 卡片网格 + 侧栏筛选；V2: Kanban 流水线 | AI 生成模态框（Setup → Generating → Results）、导入模态框（link/text/csv/tool） |
| 4 | **编辑器 Editor** | ⭐⭐⭐⭐⭐ | V1: 分屏（指令 + 预览）；V2: 一稿多平台改写 | **核心模块**：AI 文字生成（streaming）、封面/配图生成、大纲管理、多平台改写 |
| 5 | **发布管理 Publish** | ⭐⭐⭐ | V1: 列表队列；V2: 周日历 | 发布状态机（草稿→排期→渲染→发布→失败）、排期管理 |
| 6 | **数据分析 Analytics** | ⭐⭐⭐ | V1: KPI + 趋势 + 平台占比；V2: 内容排行 + 互动率 | 图表（折线/柱状/饼图）、时间段切换、对比期 |
| 7 | **素材库 Assets** | ⭐⭐⭐ | V1: 网格 + 类型筛选 + 标签；V2: 详情侧栏 + AI 标签 + 相似推荐 | 上传/导入、Picker mode（编辑器调用选素材） |
| — | **Key 管理** | ⭐ | 多 provider API Key 配置页 + 角色路由 | Anthropic / OpenAI / Gemini / 通义 / 豆包 / DeepSeek / MJ / Flux |

---

## 四、技术架构

### 4.1 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| **前端框架** | Next.js 14+ (React) | 原型就是 React 组件，自然对齐；SSR 对数据分析有利 |
| **样式** | Tailwind CSS | 与原型 CSS-in-JS 不同但团队效率更高 |
| **后端** | NestJS | 与 Next.js 同属 TypeScript 生态；天然支持模块化、SSE |
| **数据库** | PostgreSQL | 结构化数据（用户/团队/草稿/选题/排期/素材元数据/分析） |
| **对象存储** | S3 / MinIO / OSS | 素材文件、生成图片/视频 |
| **ORM** | Prisma | TypeScript 原生、Migrations、多租户友好 |
| **Auth** | NextAuth.js | 多租户场景下支持 OAuth/SSO |

### 4.2 核心架构图（概念）

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐  │
│  │ Dashboard│ │  Editor  │ │  Ideas   │ │ ...  │  │
│  └──────────┘ └────┬─────┘ └──────────┘ └──────┘  │
│                    │ AI 调用（POST /api/proxy/chat）  │
│                    │ 请求头携带 org_id               │
└────────────────────┼────────────────────────────────┘
                     │ SSE Streaming
┌────────────────────┼────────────────────────────────┐
│         AI Proxy (Next.js API Routes → Wave 2+ NestJS)   │
│  ┌─────────────┐                                       │
│  │ Key Router  │ ← 按 org_id + 角色路由到对应 provider │
│  │ · 从数据库  │    从 ApiKey 表读取对应角色 Key       │
│  │   读 Key     │    解密 → 调用 → 销毁              │
│  └──────┬──────┘                                       │
│  ┌──────▼──────────────────────┐                      │
│  │ Provider Adapter Layer      │                      │
│  │ ┌──────────┐ ┌──────────┐   │                      │
│  │ │Anthropic │ │  OpenAI  │...│                      │
│  │ └──────────┘ └──────────┘   │                      │
│  └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           PostgreSQL + S3/MinIO/OSS                  │
│  Users │ Orgs │ Drafts │ Ideas │ Assets │ Schedules  │
│  ApiKey（加密存储）                                    │
└─────────────────────────────────────────────────────┘
```

### 4.3 关键架构要素

1. **AI Proxy Service**：统一管理多 provider API Key 路由 + SSE streaming 封装。编辑器所有 AI 调用不直接出公网，通过 Proxy 转发。Proxy 负责 streaming 转 SSE，编辑器按 chunk 渲染。

2. **Key 管理模块**：每个用户/租户可配置多组 API Key，绑定角色（text / image / video）。Key 在前端加密后传输至 Proxy，Proxy 读取 Key 后调用对应 provider。**不做 Key 校验和用量计费**——用户自负 Key 的成本和可用性。

3. **发布状态机**：`Draft → Scheduled → Publishing → (PartialFail | Completed) → Archived`。第一期 mock adapter，状态机和 UI 全量实现。后续接真实 API 只需替换 adapter 层。

4. **多租户数据模型**：所有核心表(User / Team / Draft / Idea / Asset / Schedule) 带 `org_id` + `team_id`，第一天按 SaaS 设计。

### 4.4 数据模型设计（核心表 Prisma Schema）

> 由 @user-6a0de156 补充

```prisma
model Org {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt()
  teams     Team[]
  members   OrgMember[]
  drafts    Draft[]
  ideas     Idea[]
  assets    Asset[]
  apiKeys   ApiKey[]
}

model OrgMember {
  id     String @id @default(cuid())
  role   Role   @default(MEMBER)
  userId String
  orgId  String
  user   User   @relation(fields: [userId], references: [id])
  org    Org    @relation(fields: [orgId], references: [id])
  @@unique([userId, orgId])
}

model Team {
  id      String      @id @default(cuid())
  name    String
  orgId   String
  org     Org         @relation(fields: [orgId], references: [id])
  members TeamMember[]
}

enum Role { OWNER ADMIN MEMBER }

model User {
  id              String       @id @default(cuid())
  email           String       @unique
  name            String?
  avatarUrl       String?
  orgMemberships  OrgMember[]
  teamMemberships TeamMember[]
}

model ApiKey {
  id           String   @id @default(cuid())
  orgId        String
  provider     String   // anthropic | openai | gemini | ...
  role         String   // text | image | video
  label        String   @default("")
  encryptedKey String   // AES-256-GCM
  keyHash      String   // SHA-256(prefix) 用于前端显示末4位
  isDefault    Boolean  @default(false)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt()
  org          Org      @relation(fields: [orgId], references: [id])
  @@unique([orgId, provider, role])
}

model Draft {
  id               String   @id @default(cuid())
  orgId            String
  title            String   @default("")
  platform         String   @default("xhs")
  mode             String   @default("mix")
  tone             String   @default("治愈")
  prompt           String   @default("")
  body             String   @default("")
  coverHue         Int?
  coverAssetId     String?
  status           String   @default("draft")
  generationResult Json?    // { text_body, cover_url, gallery_urls[], video_url }
  linkedIdeaId     String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt()
  org              Org      @relation(fields: [orgId], references: [id])
  author           User     @relation(fields: [authorId], references: [id])
  authorId         String
  linkedIdea       Idea?    @relation(fields: [linkedIdeaId], references: [id])
  galleryAssets    AssetDraft[]
  schedules        Schedule[]
}

model Idea {
  id        String   @id @default(cuid())
  orgId     String
  title     String
  platform  String   @default("xhs")
  category  String   @default("")
  angle     String   @default("")
  status    String   @default("draft")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt()
  org       Org      @relation(fields: [orgId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  drafts    Draft[]
}

model Asset {
  id         String   @id @default(cuid())
  orgId      String
  name       String
  type       String   // image | video | copy | logo
  mimeType   String
  size       Int
  width      Int?
  height     Int?
  storageKey String   // S3/MinIO 对象 key
  tags       String[] @default([])
  createdAt  DateTime @default(now())
  org        Org      @relation(fields: [orgId], references: [id])
  uploader   User     @relation(fields: [uploaderId], references: [id])
  uploaderId String
  drafts     AssetDraft[]
}

model AssetDraft {
  assetId String
  draftId String
  sort    Int    @default(0)
  asset   Asset  @relation(fields: [assetId], references: [id])
  draft   Draft  @relation(fields: [draftId], references: [id])
  @@id([assetId, draftId])
}

model Schedule {
  id        String    @id @default(cuid())
  orgId     String
  draftId   String?
  title     String
  platform  String
  status    String    @default("draft") // draft | scheduled | publishing | partial_fail | completed | archived
  publishAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt()
  org       Org       @relation(fields: [orgId], references: [id])
  draft     Draft?    @relation(fields: [draftId], references: [id])
}
```

### 4.5 AI Proxy 详细设计

#### 4.5.1 Provider Adapter 接口

```typescript
interface AIProviderAdapter {
  providerId: string;
  generateText(params: TextGenParams): AsyncIterable<TextChunk>;
  generateImage(params: ImageGenParams): Promise<ImageResult>;
  generateVideo(params: VideoGenParams): Promise<VideoResult>;
}

interface TextChunk {
  type: 'delta' | 'done' | 'error';
  content?: string;
  error?: { code: string; message: string; provider?: string };
  usage?: { inputTokens: number; outputTokens: number };
}
```

#### 4.5.2 多租户 Key 路由流程

```
1. 用户在 Key 管理页配置 API Key
2. 前端用 Proxy 公钥加密 raw key → POST /api/keys
3. Proxy 用 AES-256-GCM 加密后写入 DB (encryptedKey)
4. 编辑器发起 AI 生成 → 前端携带 X-Org-Id
5. Proxy 查询 orgId + role(text/image/video) 匹配的活跃 Key
6. 解密 Key → 调用对应 provider adapter → 流式转 SSE 回前端
```

#### 4.5.3 错误处理矩阵

| 错误码 | 含义 | 用户提示 | 自动重试 |
|--------|------|----------|----------|
| key_not_found | 未配置该角色 Key | "请先在 Key 管理配置 {role} 模型" | 否 |
| key_inactive | Key 已停用 | "该 Key 已停用，请更换" | 否 |
| key_quota_exhausted | 配额耗尽 | "{provider} 配额已用尽" | 否 |
| rate_limited | 触发限频 | "生成过快，请稍后重试" | 指数退避×3 |
| model_unavailable | 模型暂不可用 | "{model} 暂不可用" | 指数退避×3 |
| generation_failed | 生成内部错误 | "生成失败，请重试" | 是（×2） |

### 4.6 Key 管理加密方案

- **传输加密**：前端用 Proxy 公钥（RSA-4096）加密 raw key → POST 传输，前端不接触明文
- **存储加密**：Proxy 解密后用 AES-256-GCM 重新加密 → 存入 DB encryptedKey
- **运行时**：Proxy 查询 → 解密到内存 → 调用 provider → 用完即弃
- **前端展示**：仅显示 keyHash（末 4 位），隐藏完整 Key
- **角色路由**：按 orgId + role 查询 → 优先 isDefault → 降级到第一个活跃 Key → 全无则返回 null

### 4.7 编辑器 AI 调用时序

**Wave 1 文字生成路径：**

```
用户点击「生成」
  ├─ 前置检查：keyText 存在？prompt 非空？
  ├─ POST /api/proxy/generate { role:"text", prompt, platform, tone, length }
  ├─ Proxy: resolveKey(orgId,'text') → 解密 → Anthropic API
  ├─ Proxy: streaming → SSE (event:token / event:error / event:done)
  ├─ 前端: 逐 chunk 渲染 Markdown + loading 状态
  └─ 完成: 正文可编辑 → 自动保存 Draft 到 DB
```

**Wave 2 多阶段生成（图文/视频模式）：**

```
Stage 1: 文字生成（同上）
  → Stage 2: 封面图生成（依赖 keyImage）
      → Stage 3a: 多张配图生成（图文模式，调用 image provider）
      → Stage 3b: 视频生成（视频模式，调用 video provider）
```

**状态机：** `idle → generating(text) → generating(cover) → generating(images|video) → done | error`

每阶段独立可重试——Stage 2 失败不丢失 Stage 1 的正文结果。各阶段结果持久化到 Draft.generationResult（JSON 字段）。与工程师的 9.2 节状态机保持一致。

---

## 五、Wave 交付计划

> 全功能版本 ≠ 一次交付。按**依赖关系分 wave**，每个 wave 产出可测试的完整功能。

### Wave 1（4 周）—— 骨架 + 编辑器核心

**目标：** 可运行的 SaaS 壳 + AI 写作能力

- [ ] Next.js 项目初始化 + Tailwind + 路由框架
- [ ] Shell 布局（侧栏导航 + Topbar + Page 容器）
- [ ] 多租户认证体系（注册/登录/workspace）
- [ ] 编辑器基础：文字模式编辑 + AI 生成（单 provider，SSE streaming）
- [ ] Key 管理页面配置 + Key Router 前端状态
- [ ] AI Proxy Service（NestJS）：单 provider + streaming
- [ ] PostgreSQL schema：User / Org / Team / Draft / ApiKey
- [ ] 发布状态机（纯状态流转，mock adapter）
- [ ] 基础素材库：网格 + 上传入口

**交付检查：** 用户可以注册 → 配置 Key → 输入指令 → AI 生成内容 → 保存草稿 → 看到发布状态

### Wave 2（3 周）—— 创作流完整闭环

**目标：** 从选题到发布的完整前端体验

- [ ] 选题灵感页面（卡片网格 + AI 生成模态框 + 导入模态框）
- [ ] 编辑器升级：大纲结构 + 多平台改写视图
- [ ] 编辑器升级：封面/配图生成联调（text→image 路由）
- [ ] 发布管理：列表队列 + 排期管理
- [ ] 工作台 Dashboard：KPI 卡片 + 趋势图 + 近期内容
- [ ] 素材库：详情侧栏 + Picker mode（编辑器调用）
- [ ] 发布状态机 UI 完整化（进度提示、部分失败重试）

**交付检查：** 用户可以从选题 → AI 生成 → 编辑 → 排期 → 看到"已发布"状态

### Wave 3（3 周）—— 数据驱动 + 精细化

**目标：** 热点分析 + 数据分析 + 全模块打磨

- [ ] 热点分析：话题排行 + 搜索/筛选 + 话题深度页（热度走势/平台对比/关联词/KOL）
- [ ] 数据分析：KPI + 趋势 + 平台占比 + 内容排行
- [ ] 编辑器：历史版本管理
- [ ] 素材库：AI 自动标签 + 相似推荐
- [ ] 全模块空态 / 加载态 / 错误态 / 边界恢复
- [ ] 权限模型细化（Team role / member invite）

**交付检查：** 原型全部 7 个模块可用，数据 mock 层替换为真实数据流

### Wave 4（预估 4-6 周）—— 真实发布链路

**目标：** 接入各平台发布 API

- [ ] 小红书开放平台 adapter
- [ ] YouTube Data API adapter
- [ ] TikTok API adapter
- [ ] Facebook Graph API adapter
- [ ] 发布状态机 adapter 层替换（mock → real）
- [ ] 各平台 OAuth + 沙盒测试环境

---

## 六、团队分工

| 角色 | 成员 | 负责章节 |
|------|------|----------|
| **产品经理** | @user-6a0dde64 | 产品定位、范围划分、Wave 计划、决策清单 |
| **架构师 / 代码评审** | @user-6a0de156 | 数据模型、AI Proxy 架构、Key 管理方案、编辑器 AI 时序、技术栈清单、ADR |
| **工程师** | @user-6a0de01c | 工程实现、代码评审、性能优化 |
| **技术负责人** | @user-6a0ddfbf | 整体架构评审、工程演进策略 |
| **测试** | @user-6a0de100 | 验收清单、边界条件矩阵、AI 质量验收、发布状态机验收、性能基准 |

---

## 七、测试策略（验收清单 & 边界条件）

> 负责: @user-6a0de100（测试）
> 原则：每个 Wave 产出可测试的完整功能，测试与开发并行推进。

### 7.1 验收原则

- **功能完整度**：每个模块对标原型交互，无缺失功能
- **像素级确认**：设计 tokens 对齐（颜色/字体/间距/圆角/阴影），无视觉降级
- **所有状态全覆盖**：空态 / 加载态 / 错误态 / 断网 / 刷新丢失状态 / Key 耗尽 / 权限不足
- **每个 Wave 结束前**：全部验收项通过，否则 Wave 不算完成

### 7.2 按 Wave 验收清单

#### Wave 1 验收点（骨架 + 编辑器核心）

| # | 验收项 | 类型 | 通过标准 |
|---|--------|------|----------|
| 1.1 | 用户注册 → 登录 → 创建 workspace | 功能 | 完整流程走通，多租户隔离生效（A 看不到 B 的数据） |
| 1.2 | 侧栏导航：8 个菜单项渲染 + 高亮当前页 + 图标 | 视觉 | 与原型完全一致 |
| 1.3 | 编辑器：文字模式编辑（标题/平台/语调/长度/正文） | 功能 | 全部控件可用，双向绑定正常 |
| 1.4 | 编辑器：AI 生成文字（单 provider） | 功能 | 点击"生成" → SSE streaming 逐 chunk 渲染 → 完整正文 |
| 1.5 | 编辑器：生成过程中取消 | 功能 | 取消后已有内容保留，可继续编辑 |
| 1.6 | 编辑器：清空重新生成 | 功能 | 旧内容清除，重新发起 AI 调用 |
| 1.7 | Key 管理：新增/编辑/删除 API Key | 功能 | Key 加密存储，刷新后不丢失 |
| 1.8 | Key 管理：角色绑定（text/image/video） | 功能 | 不同角色绑定不同 Key，编辑器按角色取 Key |
| 1.9 | AI Proxy：SSE streaming 回显 | 性能 | 首 chunk < 2s，后续 chunk 间隔 < 500ms |
| 1.10 | AI Proxy：无效 Key 错误回传 | 错误态 | 显示具体 provider + 错误原因，不暴露 raw key |
| 1.11 | 发布状态机：Draft → Scheduled → Publishing → Completed | 功能 | 完整状态流走通，UI 同步 |
| 1.12 | 发布状态机：Publishing → Failed → 重试 | 错误态 | 失败后可重试，状态正确回退 |
| 1.13 | 素材库：网格渲染（24 格）+ 上传按钮 | 功能 | 正常渲染可交互 |
| 1.14 | 页面刷新：编辑器草稿持久化 | 边界 | localStorage 恢复，内容不丢失 |
| 1.15 | 多租户隔离：用户 A 无法访问 B 的 Key 与草稿 | 安全 | API 层面验证 org_id 隔离 |

#### Wave 2 验收点（创作流闭环）

| # | 验收项 | 类型 | 通过标准 |
|---|--------|------|----------|
| 2.1 | 选题灵感：卡片网格（9 张）+ 标签/来源/状态 | 功能 | 与原型数据一致，全部渲染 |
| 2.2 | 选题灵感：AI 生成模态框（Setup → Generating → Results） | 功能 | 3 步流程完整，进度可感知 |
| 2.3 | 选题灵感：导入模态框（link/text/csv/tool） | 功能 | 4 种导入可用，内容正确解析 |
| 2.4 | 选题 → 编辑器 payload 回传 | 集成 | 点击灵感卡片 → 预填标题/角度/平台 |
| 2.5 | 编辑器：多平台改写视图 | 功能 | 切换平台，改写内容不同 |
| 2.6 | 编辑器：封面图 AI 生成 + 更换/移除/恢复 | 功能 | 封面封面变更可逆，UI 同步 |
| 2.7 | 编辑器：配图多选生成 + 排序/删除 | 功能 | 多图模式完整 |
| 2.8 | 发布管理：列表队列 + 筛选（all/today/week/published） | 功能 | 筛选正确，9 条数据正常显示 |
| 2.9 | 发布管理：新建排期模态框 | 功能 | 选择平台/时间/内容 → 队列更新 |
| 2.10 | Dashboard：4 张 KPI 卡片 + sparkline | 功能 | 数值/趋势/图标正确 |
| 2.11 | Dashboard：跨平台曝光折线图（4 条曲线 + 图例） | 功能 | 图表正确渲染 |
| 2.12 | Dashboard：近期内容列表 + 待办清单 | 功能 | 5 条近期内容 + 5 项待办，勾选生效 |
| 2.13 | 素材库 Picker mode：封面选择 | 集成 | 编辑器 → 选封面 → 回传 |
| 2.14 | 素材库 Picker mode：Gallery 多选按序回传 | 集成 | 多选 → 回传顺序与点击顺序一致 |
| 2.15 | 发布状态机 UI：进度条 + 部分失败标黄 + 重试 | 功能 | 发布中显示进度，部分失败可逐项重试 |

#### Wave 3 验收点（数据 + 精细化）

| # | 验收项 | 类型 | 通过标准 |
|---|--------|------|----------|
| 3.1 | 热点分析：话题排行表格（8 条）+ 增长率/平台表现 | 功能 | 数据正确，排序可用 |
| 3.2 | 热点分析：话题深度页（热度走势 + 平台对比 + 关联词 + KOL） | 功能 | 4 区块完整，数据一致 |
| 3.3 | 热点分析：搜索 + 标签筛选 + 收藏 | 功能 | 搜索关键词、按标签筛选、收藏切换 |
| 3.4 | 数据分析：KPI + 趋势 + 平台占比图表 | 功能 | 折线/柱状/饼图，时间段切换 |
| 3.5 | 数据分析：内容排行（8 条）+ 互动率 | 功能 | views/IE/follows/comments 正确 |
| 3.6 | 全模块空态展示 | 边界 | 无数据 → 空态占位 + 引导文案 |
| 3.7 | 全模块加载态 | 边界 | Skeleton/spinner，无闪白 |
| 3.8 | 全模块错误态 | 边界 | 网络错误 → 友好提示 + 重试按钮 |
| 3.9 | 素材库：AI 自动标签 | 功能 | 标签生成准确 |
| 3.10 | 素材库：相似推荐 | 功能 | 点击素材 → 推荐列表 |
| 3.11 | 权限模型：team role 隔离 | 安全 | member 看不到其他 team 内容 |

### 7.3 AI 生成质量验收

| # | 验收项 | 方法 | 通过标准 | 关联 error code |
|---|--------|------|----------|-----------------|
| QA-1 | 首 chunk 延迟 | 抓包工具 | 从点击生成到首 chunk < 3s | — |
| QA-2 | Streaming 流畅度 | 肉眼 + 录像 | 逐 chunk 渲染不卡顿/不闪烁/不重复 | — |
| QA-3 | 生成取消响应 | 操作 | 取消后 1s 内 AI 调用中断 | — |
| QA-4 | 多 provider 切换 | A/B 对比 | Anthropic ↔ OpenAI 输出格式一致 | — |
| QA-5 | 生成失败重试 | 错误注入 | Proxy 返回 `generation_failed` → 编辑器显示重试 → 重试成功 | `generation_failed` |
| QA-6 | Key 未配置/过期/限流提示 | 模拟各场景 | `key_not_found` → "请先配置"{role}"模型"；`key_inactive` → "该 Key 已停用"；`key_quota_exhausted` → "{provider} 配额已用尽"；`rate_limited` → "生成过快，请稍后重试" → 自动退避重试 | `key_not_found`, `key_inactive`, `key_quota_exhausted`, `rate_limited` |
| QA-7 | 模型不可用降级 | 模拟 | `model_unavailable` → 显示"{model} 暂不可用" → 自动退避重试 | `model_unavailable` |
| QA-8 | 多步生成容错 | 断点测试 | 正文成功 + 封面失败 → 保留正文，封面单独重试 | `generation_failed` |
| QA-9 | 连接中断重连 | 断开网络 | Proxy 支持 Last-Event-ID 断点续传 | — |

### 7.4 发布状态机验收

| # | 路径 | 预期 |
|---|------|------|
| SM-1 | Draft → Scheduled | 设置排期 → 状态变更为"已排期" |
| SM-2 | Scheduled → Publishing | 到达排期 / 手动触发 → 进入发布流程 |
| SM-3 | Publishing → Completed | 成功 → 状态变更为"已发布" |
| SM-4 | Publishing → Failed | 失败 → "失败" + 保留原因 |
| SM-5 | Scheduled → Draft（取消排期） | 取消 → 回退到草稿 |
| SM-6 | Failed → Draft（重试） | 从失败重新编辑 → 草稿 |
| SM-7 | Publishing → PartialFail | 部分成功 → 标黄"部分失败"，可逐项重试 |
| SM-8 | 排期时间修改 | 已排期 → 修改时间 → 新时间生效 |

### 7.5 集成测试策略

| 集成点 | 涉模块 | 测试方式 |
|--------|--------|----------|
| 选题 → 编辑器 (payload) | Ideas → Editor | 点击卡片 → 预填标题/角度/平台 |
| 编辑器 → 素材库 (封面) | Editor → Assets | Pick mode 选图回传 |
| 编辑器 → 素材库 (多图) | Editor → Assets | Gallery 多选按序回传 |
| 编辑器 → AI Proxy (文字) | Editor → Proxy | SSE streaming 端到端 |
| 编辑器 → AI Proxy (封面) | Editor → Proxy | Text→Image 路由 |
| 发布 → 状态机 | Publish → SM | 全部状态转换 |
| Dashboard → 数据层 | Home → Data | KPI/图表一致性 |

**Mock Server 策略：** Wave 1 开始前定义模块间接口契约（OpenAPI），前端用 MSW / JSON Server mock，后端完成后逐步替换。接口变更需通知测试同步更新 mock。

### 7.6 兼容性 & 性能基准

| 维度 | 最低要求 |
|------|----------|
| **浏览器** | Chrome 110+、Firefox 115+、Safari 16+、Edge 110+ |
| **网络** | 3G+（4G 优先），弱网下 AI 生成超时 10s 提示 |
| **分辨率** | 1280×720 以上桌面优先 |
| **编辑器延迟** | AI 首 chunk < 3s，UI 操作 < 100ms |
| **页面加载** | 首屏 < 3s（Next.js SSR），素材网格 < 2s |
| **并发** | 100 用户同时使用，API 响应不降级 |

---

## 八、开放工程决策（待定）

以下决策可在 Wave 1 开发过程中确认，不阻塞启动：

| # | 决策 | 建议 | 拍板人 |
|---|------|------|--------|
| 1 | AI Proxy 初始支持几个 provider？ | 1-2 个（Anthropic + OpenAI），其他在 Wave 2 加 | 技术负责人 |
| 2 | 素材存储方案（本地 vs OSS） | 开发期用本地/MinIO，生产用 OSS | 技术负责人 |
| 3 | 设计师出图 vs AI 生成封面 | AI 生成为主，Wave 2 决定是否支持上传 | 东 |
| 4 | 后端语言（NestJS vs Go） | NestJS（与前端同语言，效率高） | 技术负责人 |
| 5 | ORM（Prisma vs TypeORM） | Prisma（Migrations + 类型安全） | 技术人员 |

---

## 九、工程实施风险与设计要点

> 由 @user-6a0de01c 补充。覆盖 streaming 通信协议、多阶段 AI 状态管理、跨页面 payload 持久化、Wave 1 容量评估。

### 9.1 SSE Streaming 通信协议

编辑器 AI 生成必须流式回显（同步等待不可接受），前端与 AI Proxy 之间的 SSE 协议需要在 Wave 1 就定下来，否则后端与前端并行开发时互相阻塞。

**建议协议格式（每行一个事件）：**

```
event: token
data: {"type":"text","content":"露营装备清单..."}

event: token
data: {"type":"image","content":"https://..."}

event: status
data: {"stage":"text","status":"done"}

event: status
data: {"stage":"cover","status":"running"}

event: error
data: {"code":"key_exhausted","provider":"anthropic","message":"API 配额已耗尽"}
```

**设计要点：**
- 编辑器按 `stage` 字段区分当前生成阶段（text / cover / images / video / done），UI 展示对应的进度指示
- `type: "image"` 的 chunk 在图文模式下由 Proxy 调用 image provider 后回传 URL，编辑器直接渲染
- 错误事件按 provider 区分，便于 Key 管理页定位问题
- 前端需要处理连接中断重连（Last-Event-ID），Proxy 侧需要支持断点续传或重启生成

### 9.2 多阶段 AI 生成状态管理

编辑器目前是三步串行：正文 → 封面 → 配图/视频。每一步依赖上一步结果，失败率叠加。

**状态机（编辑器独有，非发布状态机）：**

```
Idle → Generating(text) → [error: retry|abort] → Generating(cover) → [error: retry|abort]
→ Generating(images|video) → [error: retry|abort] → Done
```

**关键设计：**
- 每步结果落地到数据库 draft 表的 jsonb 字段（`generation_result: { text_body, cover_url, gallery_urls[], video_url }`），而不是只存 localStorage。这样即使页面刷新或用户切换页面，生成状态可恢复
- 如果用户在当前步失败后修改 prompt 重新生成，之前步的结果保留（只重新跑后面的）
- 编辑器关闭时如果生成未完成，需要在导航守卫弹确认（原型里没有，生产环境必须有）

### 9.3 跨页面 Payload 持久化

原型用 URL hash + React state 做页面间传参（选题 → 编辑器、素材库 → 编辑器），刷新即丢失。

**生产方案：**
- 简单场景（选题 → 编辑器）：URL 参数带 idea_id，编辑器 onMount 从数据库读
- 复杂场景（素材库 picker mode 选图回传）：走 sessionStorage + 降级方案。编辑器打开素材库时存 `{ pickerSession, returnTo }`，素材库选完后写结果到 sessionStorage，返回编辑器时读取
- 所有临时状态必须有兜底：sessionStorage 读取失败时友好提示"请重新选择"，而不是静默丢失

### 9.4 Wave 1 容量评估

Wave 1 排了 8 项工作，4 周。以下是我按依赖关系重新组织的顺序：

| 周次 | 内容 | 前置依赖 |
|------|------|----------|
| 第 1 周 | Next.js 项目初始化 + Shell 布局 + 路由框架 + Antd/Tailwind 基础组件库 | 无 |
| 第 1-2 周 | PostgreSQL schema（User/Org/Team/Draft/ApiKey）+ 多租户认证 | 第 1 周完成 |
| 第 2-3 周 | AI Proxy Service（NestJS）+ 单 provider streaming + 前端 Key 管理页面 | Schema + 认证完成 |
| 第 3-4 周 | 编辑器文字模式（含 AI 生成接入 + SSE 回显）+ 发布状态机 mock | AI Proxy 可用 |
| 第 4 周 | 素材库基础网格 + 验收 | 编辑器可用 |

**风险点：** 认证体系和 AI Proxy 是 Wave 1 最关键的两个前置依赖。如果第 1 周认证没跑通（NextAuth.js 多租户配置需要额外调研），后续全部延期。建议：
1. 认证先用简单方案（邮箱密码 + org_id 硬编码），不做 OAuth/SSO
2. AI Proxy 第一个 sprint 只支持 Anthropic，SSE 协议定下来后再加 OpenAI

---

## 十、架构决策记录 (ADR)

> 由 @user-6a0de156 补充。每个 ADR 记录关键架构决策的上下文、方案对比、选型理由与后果。

### ADR-001：多租户 vs 单用户

| 字段 | 内容 |
|------|------|
| **决策** | 多租户 SaaS（第一天带 org_id） |
| **上下文** | 原型含团队元素（5人协作），东确认多组织隔离使用 |
| **方案对比** | 单用户 schema 简单但后期加 org_id 需全表迁移；多租户首日成本可控 |
| **选型理由** | 单用户 → SaaS 的迁移成本远高于第一天设计 org_id 的额外开销 |
| **后果** | 认证系统需支持 org/workspace 层级；后续团队协作功能天然支持 |

### ADR-002：用户自备 API Key vs 平台统一提供

| 字段 | 内容 |
|------|------|
| **决策** | 用户自备 Key，平台做 Proxy 路由 |
| **上下文** | 编辑器 AI 调用依赖 LLM provider，东确认不承担推理费用 |
| **方案对比** | 平台提供体验一致但成本风险高；用户自备零推理成本但 Key 安全要求高 |
| **选型理由** | 东明确的成本策略：平台不承担推理费用 |
| **后果** | 需实现前端 RSA → Proxy AES-256-GCM 加密链路；不做用量计费 |

### ADR-003：AI Proxy 架构 vs 前端直调

| 字段 | 内容 |
|------|------|
| **决策** | 后端 Proxy 转发（不前端直调第三方 API） |
| **上下文** | 原型 generate() 直接调 window.claude.complete()，生产环境不可行 |
| **方案对比** | 前端直调 Key 暴露且无法统一 SSE；Proxy 转发 Key 安全且多 provider 对前端透明 |
| **选型理由** | 用户自备 Key 场景下 Key 不能暴露前端；Proxy 使多 provider 路由对 UI 层透明 |
| **后果** | Wave 1 需实现 NestJS Proxy Service；前端 AI 调用统一走 /api/proxy/generate |

### ADR-004：SSE Streaming vs 全量返回

| 字段 | 内容 |
|------|------|
| **决策** | SSE Streaming |
| **上下文** | AI 文字生成需数秒到数十秒，全量返回 UX 不可接受 |
| **方案对比** | 全量返回简单但等待时间无反馈；Streaming 实现成本高但感知延迟低 |
| **选型理由** | 大模型生成场景下用户期望即时反馈，全量等待不符合行业标准 |
| **后果** | Proxy 需支持 SSE 协议；前端编辑器按 chunk 增量渲染 Markdown |

### ADR-005：发布状态机 + Mock Adapter

| 字段 | 内容 |
|------|------|
| **决策** | Wave 1 实现完整状态机 + mock adapter；Wave 4 替换为真实 API adapter |
| **上下文** | 多平台 API 对接（小红书/YouTube/TikTok/Facebook）工作量极大，东确认先走一键复制粘贴 |
| **方案对比** | 直接接 API 阻塞其他模块；Mock adapter 可快速验证 UX 且适配器接口留好 |
| **选型理由** | mock 状态机使发布模块 UX 可测试且不阻塞 Wave 1 其他模块 |
| **后果** | Schedule.status 含 partial_fail；真实 adapter 延迟到 Wave 4 |

## 十一、下一步

1. ✅ 此 doc 骨架发出，团队 review 补正
2. ✅ @user-6a0de156 补充技术方案章节 + ADR（已完成）
3. ✅ @user-6a0de100 补充验收/测试章节（已完成）
4. ✅ @user-6a0de01c 补充工程实施风险章节（已完成）
5. ⏳ @user-6a0ddfbf 技术评审
6. ⏳ 东确认后拆 Wave 1 task，进入开发
