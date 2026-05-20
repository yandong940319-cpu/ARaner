const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber,
  PageBreak
} = require("docx");

// Color constants matching the design system
const C = {
  accent: "CD5A3A",
  ink: "1A1A1A",
  text2: "5E5B54",
  text3: "9A958B",
  border: "E8E6DF",
  surface2: "F7F6F2",
  good: "2F7A4F",
  goodSoft: "E7F1EA",
  bad: "B03A3A",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: C.border };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
const sectionProps = {
  page: {
    size: { width: 11906, height: 16838 },
    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
  },
};

function heading(level, text) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true, font: "Arial" })],
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })],
    spacing: { after: opts.spacingAfter || 80 },
  });
}

function boldPara(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, font: "Arial", size: 22 }),
      new TextRun({ text: value, font: "Arial", size: 22 }),
    ],
    spacing: { after: 60 },
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((c) => {
      const shading = isHeader ? { fill: "EDEBE4", type: ShadingType.CLEAR } : undefined;
      return new TableCell({
        borders,
        width: { size: 9360 / cells.length, type: WidthType.DXA },
        margins: cellMargins,
        shading,
        children: [
          new Paragraph({
            children: [new TextRun({ text: c, font: "Arial", size: isHeader ? 20 : 20, bold: isHeader })],
          }),
        ],
      });
    }),
  });
}

function dataTable(headerRow, dataRows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      tableRow(headerRow, true),
      ...dataRows.map((r) => tableRow(r, false)),
    ],
  });
}

function spacer(h = 120) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

// ============================================================================
// Document sections
// ============================================================================

const children = [];

// Cover page
children.push(spacer(600));
children.push(new Paragraph({
  children: [new TextRun({ text: "盎然内容", font: "Arial", size: 52, bold: true, color: C.ink })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Implement Plan · 实施计划", font: "Arial", size: 32, color: C.accent })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 60 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "多平台内容创作 SaaS 工具 · 全功能版本", font: "Arial", size: 22, color: C.text2 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "最后更新: 2026-05-20", font: "Arial", size: 20, color: C.text3 })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 600 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "目 录", font: "Arial", size: 28, bold: true })],
  spacing: { before: 200, after: 200 },
}));
const tocItems = [
  "一、产品定位", "二、方向性决策", "三、模块总览", "四、技术架构",
  "五、Wave 交付计划", "六、团队分工", "七、测试策略", "八、开放工程决策",
  "九、工程实施风险与设计要点", "十、架构决策记录 (ADR)",
];
tocItems.forEach((item) => {
  children.push(new Paragraph({
    children: [new TextRun({ text: item, font: "Arial", size: 22 })],
    spacing: { after: 40 },
  }));
});

// Page break before content
children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 一、产品定位 =====
children.push(heading(HeadingLevel.HEADING_1, "一、产品定位"));
children.push(para("盎然内容是一个 AI 驱动的多平台内容创作与管理平台，覆盖从热点追踪 → 选题灵感 → AI 创作 → 多平台发布 → 数据分析的全链路。"));
children.push(boldPara("产品名称：", "盎然内容"));
children.push(boldPara("目标用户：", "品牌团队 / 内容创作者 / 新媒体运营（多租户 SaaS）"));
children.push(boldPara("核心平台：", "小红书 · YouTube · TikTok · Facebook"));
children.push(boldPara("交付形态：", "Web 端（响应式，桌面优先）"));
children.push(boldPara("AI 策略：", "用户自备 API Key，平台做 Proxy 路由层"));

// ===== 二、方向性决策 =====
children.push(heading(HeadingLevel.HEADING_1, "二、方向性决策"));
children.push(dataTable(
  ["#", "问题", "决策", "影响"],
  [
    ["1", "单用户 vs 多租户", "多租户 SaaS", "所有数据模型带 org_id，第一天按多租户设计"],
    ["2", "AI 模型谁出", "用户自备 API Key", "Key 加密存储，前端安全传输到 AI Proxy；不做用量计费"],
    ["3", "平台形态", "仅 Web 端", "前端选型无需考虑跨平台兼容"],
    ["4", "多平台发布方式", "先一键复制粘贴", "发布状态机 + mock 先行，API adapter 层留接口后续扩展"],
  ],
  [500, 2000, 2500, 4360]
));

// ===== 三、模块总览 =====
children.push(heading(HeadingLevel.HEADING_1, "三、模块总览"));
children.push(para("源自原型 screens.jsx + proto-*.jsx，共 7+1 个模块。"));
children.push(dataTable(
  ["#", "模块", "复杂度", "关键交互"],
  [
    ["1", "工作台 Dashboard", "★★", "KPI 卡片、趋势图表（MultiLineChart）"],
    ["2", "热点分析 Trends", "★★★", "搜索/筛选、表格、图表、洞察摘要"],
    ["3", "选题灵感 Ideas", "★★★", "AI 生成模态框、导入模态框（link/text/csv/tool）"],
    ["4", "编辑器 Editor", "★★★★★", "核心模块：AI 文字生成（streaming）、封面/配图生成"],
    ["5", "发布管理 Publish", "★★★", "发布状态机、排期管理"],
    ["6", "数据分析 Analytics", "★★★", "图表（折线/柱状/饼图）、时间段切换"],
    ["7", "素材库 Assets", "★★★", "上传/导入、Picker mode"],
    ["—", "Key 管理", "★", "多 provider API Key 配置页 + 角色路由"],
  ],
  [500, 2200, 1000, 5660]
));

// ===== 四、技术架构 =====
children.push(heading(HeadingLevel.HEADING_1, "四、技术架构"));

children.push(heading(HeadingLevel.HEADING_2, "4.1 技术栈"));
children.push(dataTable(
  ["层", "选型", "说明"],
  [
    ["前端框架", "Next.js 14+ (React)", "原型就是 React 组件，自然对齐"],
    ["样式", "Tailwind CSS", "团队效率高"],
    ["后端", "Next.js API Routes (Wave 1)", "少一套部署，SSE 原生支持"],
    ["数据库", "PostgreSQL", "结构化数据存储"],
    ["对象存储", "MinIO / S3", "素材文件、生成图片/视频"],
    ["ORM", "Prisma", "TypeScript 原生，Migrations，多租户友好"],
    ["Auth", "邮箱密码 + org_id", "Wave 1 简化方案，不做 OAuth/SSO"],
  ],
  [2200, 2800, 4360]
));

children.push(heading(HeadingLevel.HEADING_2, "4.2 关键架构要素"));
children.push(para("1. AI Proxy Service：统一管理多 provider API Key 路由 + SSE streaming 封装。编辑器所有 AI 调用不直接出公网，通过 Proxy 转发。"));
children.push(para("2. Key 管理模块：每个用户/租户可配置多组 API Key，绑定角色（text / image / video）。Key 在前端加密后传输至 Proxy。"));
children.push(para("3. 发布状态机：Draft → Scheduled → Publishing → (PartialFail | Completed) → Archived。第一期 mock adapter。"));
children.push(para("4. 多租户数据模型：所有核心表带 org_id + team_id，第一天按 SaaS 设计。"));

children.push(heading(HeadingLevel.HEADING_2, "4.3 数据模型（核心表）"));
children.push(para("包含以下 Prisma 模型：Org, OrgMember, Team, User, ApiKey, Draft, Idea, Asset, AssetDraft, Schedule。"));
children.push(para("所有表带 org_id 实现多租户隔离。ApiKey 使用 AES-256-GCM 加密存储，前端仅显示末 4 位。"));

children.push(heading(HeadingLevel.HEADING_2, "4.4 AI Proxy 详细设计"));
children.push(para("Provider Adapter 接口：generateText 返回 AsyncIterable, generateImage/Video 返回 Promise。多租户 Key 路由流程：前端用 Proxy 公钥加密 raw key → POST 传输 → Proxy 用 AES-256-GCM 重新加密存储 → 运行时读取解密 → 调用 provider → 用完即弃。"));
children.push(para("错误处理：key_not_found, key_inactive, key_quota_exhausted（不重试），rate_limited, model_unavailable（指数退避×3），generation_failed（重试×2）。"));

children.push(heading(HeadingLevel.HEADING_2, "4.5 编辑器 AI 调用时序"));
children.push(para("Wave 1：文字生成路径。用户点击生成 → 前置检查 → POST /api/proxy/generate → Proxy resolveKey → Anthropic API → SSE streaming → 前端逐 chunk 渲染 Markdown → 自动保存 Draft。"));
children.push(para("Wave 2：多阶段生成。Stage 1 文字 → Stage 2 封面图 → Stage 3a 配图 / Stage 3b 视频。每阶段独立可重试，结果持久化到 Draft.generationResult。"));

// ===== 五、Wave 交付计划 =====
children.push(heading(HeadingLevel.HEADING_1, "五、Wave 交付计划"));
children.push(para("全功能版本 ≠ 一次交付。按依赖关系分 wave，每个 wave 产出可测试的完整功能。"));

children.push(heading(HeadingLevel.HEADING_2, "Wave 1（4 周）— 骨架 + 编辑器核心"));
children.push(para("目标：可运行的 SaaS 壳 + AI 写作能力"));
const w1Items = [
  "Next.js 项目初始化 + Tailwind + 路由框架",
  "Shell 布局（侧栏导航 + Topbar + Page 容器）",
  "多租户认证体系（注册/登录/workspace）",
  "编辑器基础：文字模式编辑 + AI 生成（SSE streaming）",
  "Key 管理页面配置 + Key Router 前端状态",
  "AI Proxy Service：单 provider（Anthropic）+ streaming",
  "PostgreSQL schema：User / Org / Team / Draft / ApiKey",
  "发布状态机（纯状态流转，mock adapter）",
  "基础素材库：网格 + 上传入口",
];
w1Items.forEach((item) => children.push(para("• " + item, { spacingAfter: 40 })));
children.push(para("交付检查：用户可以注册 → 配置 Key → 输入指令 → AI 生成内容 → 保存草稿 → 看到发布状态", { bold: true }));

children.push(heading(HeadingLevel.HEADING_2, "Wave 2（3 周）— 创作流完整闭环"));
children.push(para("目标：从选题到发布的完整前端体验"));
const w2Items = [
  "选题灵感页面（卡片网格 + AI 生成模态框 + 导入模态框）",
  "编辑器升级：大纲结构 + 多平台改写视图",
  "编辑器升级：封面/配图生成联调（text→image 路由）",
  "发布管理：列表队列 + 排期管理",
  "工作台 Dashboard：KPI 卡片 + 趋势图 + 近期内容",
  "素材库：详情侧栏 + Picker mode（编辑器调用）",
  "发布状态机 UI 完整化（进度提示、部分失败重试）",
];
w2Items.forEach((item) => children.push(para("• " + item, { spacingAfter: 40 })));
children.push(para("交付检查：用户可以从选题 → AI 生成 → 编辑 → 排期 → 看到已发布状态", { bold: true }));

children.push(heading(HeadingLevel.HEADING_2, "Wave 3（3 周）— 数据驱动 + 精细化"));
children.push(para("目标：热点分析 + 数据分析 + 全模块打磨"));
const w3Items = [
  "热点分析：话题排行 + 搜索/筛选 + 话题深度页",
  "数据分析：KPI + 趋势 + 平台占比 + 内容排行",
  "编辑器：历史版本管理",
  "素材库：AI 自动标签 + 相似推荐",
  "全模块空态 / 加载态 / 错误态 / 边界恢复",
  "权限模型细化（Team role / member invite）",
];
w3Items.forEach((item) => children.push(para("• " + item, { spacingAfter: 40 })));
children.push(para("交付检查：原型全部 7 个模块可用，数据 mock 层替换为真实数据流", { bold: true }));

children.push(heading(HeadingLevel.HEADING_2, "Wave 4（预估 4-6 周）— 真实发布链路"));
children.push(para("目标：接入各平台发布 API"));
const w4Items = [
  "小红书开放平台 adapter",
  "YouTube Data API adapter",
  "TikTok API adapter",
  "Facebook Graph API adapter",
  "发布状态机 adapter 层替换（mock → real）",
  "各平台 OAuth + 沙盒测试环境",
];
w4Items.forEach((item) => children.push(para("• " + item, { spacingAfter: 40 })));

// ===== 六、团队分工 =====
children.push(heading(HeadingLevel.HEADING_1, "六、团队分工"));
children.push(dataTable(
  ["角色", "成员", "负责内容"],
  [
    ["产品经理", "PM", "产品定位、范围划分、Wave 计划、决策清单"],
    ["架构师 / 代码评审", "Code Review", "数据模型、AI Proxy 架构、Key 管理方案、ADR"],
    ["工程师", "Dev", "工程实现、代码评审、性能优化"],
    ["技术负责人", "TL", "整体架构评审、工程演进策略"],
    ["测试", "QA", "验收清单、边界条件矩阵、AI 质量验收、性能基准"],
  ],
  [2200, 1800, 5360]
));

// ===== 七、测试策略 =====
children.push(heading(HeadingLevel.HEADING_1, "七、测试策略"));
children.push(para("原则：每个 Wave 产出可测试的完整功能，测试与开发并行推进。"));
children.push(para("验收原则：功能完整度对标原型交互、像素级确认（设计 tokens 对齐）、所有状态全覆盖（空态/加载态/错误态/断网/刷新丢失/Key耗尽/权限不足）。"));

children.push(heading(HeadingLevel.HEADING_2, "Wave 1 验收点（15 项）"));
const w1Accept = [
  "1.1 用户注册 → 登录 → 创建 workspace（多租户隔离）",
  "1.2 侧栏导航：8 个菜单项渲染 + 高亮当前页",
  "1.3 编辑器：文字模式编辑（标题/平台/语调/长度/正文）",
  "1.4 编辑器：AI 生成文字 SSE streaming 逐 chunk 渲染",
  "1.5 编辑器：生成过程中取消，已有内容保留",
  "1.6 编辑器：清空重新生成",
  "1.7 Key 管理：新增/编辑/删除 API Key（加密存储）",
  "1.8 Key 管理：角色绑定（text/image/video）",
  "1.9 AI Proxy：SSE streaming 首 chunk < 2s",
  "1.10 AI Proxy：无效 Key 错误回传",
  "1.11 发布状态机：Draft → Scheduled → Publishing → Completed",
  "1.12 发布状态机：Publishing → Failed → 重试",
  "1.13 素材库：网格渲染（24 格）+ 上传按钮",
  "1.14 页面刷新：编辑器草稿持久化",
  "1.15 多租户隔离：用户 A 无法访问 B 的 Key 与草稿",
];
w1Accept.forEach((item) => children.push(para("• " + item, { spacingAfter: 30 })));

children.push(heading(HeadingLevel.HEADING_2, "AI 生成质量验收（9 项）"));
children.push(dataTable(
  ["#", "验收项", "通过标准"],
  [
    ["QA-1", "首 chunk 延迟", "< 3s"],
    ["QA-2", "Streaming 流畅度", "不卡顿/不闪烁/不重复"],
    ["QA-3", "生成取消响应", "取消后 1s 内中断"],
    ["QA-4", "多 provider 切换", "输出格式一致"],
    ["QA-5", "生成失败重试", "generation_failed → 重试 → 成功"],
    ["QA-6", "Key 未配置/过期/限流", "各 error code 对应提示"],
    ["QA-7", "模型不可用降级", "自动退避重试"],
    ["QA-8", "多步生成容错", "正文成功+封面失败→保留正文"],
    ["QA-9", "连接中断重连", "Last-Event-ID 断点续传"],
  ],
  [600, 3500, 5260]
));

children.push(heading(HeadingLevel.HEADING_2, "发布状态机验收（8 条路径）"));
const smItems = [
  "SM-1 Draft → Scheduled", "SM-2 Scheduled → Publishing",
  "SM-3 Publishing → Completed", "SM-4 Publishing → Failed",
  "SM-5 Scheduled → Draft（取消排期）", "SM-6 Failed → Draft（重试）",
  "SM-7 Publishing → PartialFail", "SM-8 排期时间修改",
];
smItems.forEach((item) => children.push(para("• " + item, { spacingAfter: 30 })));

// ===== 八、开放工程决策 =====
children.push(heading(HeadingLevel.HEADING_1, "八、开放工程决策"));
children.push(para("以下决策已在 Wave 1 启动前确认："));
children.push(dataTable(
  ["#", "决策", "结论", "拍板人"],
  [
    ["1", "AI Proxy 初始 provider", "Anthropic（Wave 1），OpenAI 排 Wave 2", "技术负责人"],
    ["2", "素材存储方案", "开发期本地 / 生产 OSS", "技术负责人"],
    ["3", "封面方案", "AI 生成 + 支持上传图片", "东"],
    ["4", "Proxy 实现方式", "Wave 1 用 Next.js API Routes", "技术负责人"],
    ["5", "ORM", "Prisma", "技术负责人"],
  ],
  [500, 3000, 3500, 2360]
));

// ===== 九、工程实施风险 =====
children.push(heading(HeadingLevel.HEADING_1, "九、工程实施风险与设计要点"));

children.push(heading(HeadingLevel.HEADING_2, "9.1 SSE Streaming 通信协议"));
children.push(para("编辑器 AI 生成必须流式回显。前端与 AI Proxy 之间的 SSE 协议需要在 Wave 1 就定下来。"));
children.push(para("事件类型：token（text/image chunk）、status（stage进度）、error（按 provider 区分错误）。"));
children.push(para("设计要点：编辑器按 stage 字段区分生成阶段（text / cover / images / video / done）；错误事件按 provider 区分；前端需处理连接中断重连。"));

children.push(heading(HeadingLevel.HEADING_2, "9.2 多阶段 AI 生成状态管理"));
children.push(para("编辑器三步串行：正文 → 封面 → 配图/视频。状态机：Idle → Generating(text) → Generating(cover) → Generating(images|video) → Done。"));
children.push(para("关键设计：每步结果落地到数据库 Draft 表 generationResult 字段；用户修改 prompt 重新生成时保留已完成的步骤；编辑器关闭时导航守卫弹确认。"));

children.push(heading(HeadingLevel.HEADING_2, "9.3 跨页面 Payload 持久化"));
children.push(para("简单场景（选题→编辑器）：URL 参数带 idea_id，从数据库读取。复杂场景（素材库 picker mode 选图回传）：sessionStorage + 降级方案。所有临时状态必须有兜底提示。"));

children.push(heading(HeadingLevel.HEADING_2, "9.4 Wave 1 容量评估"));
children.push(dataTable(
  ["周次", "内容", "前置依赖"],
  [
    ["第 1 周", "Next.js 初始化 + Shell + 路由 + 基础组件", "无"],
    ["第 1-2 周", "PostgreSQL schema + 多租户认证", "第 1 周完成"],
    ["第 2-3 周", "AI Proxy + 单 provider streaming + Key 管理", "Schema + 认证"],
    ["第 3-4 周", "编辑器文字模式 + SSE + 发布状态机", "AI Proxy 可用"],
    ["第 4 周", "素材库基础网格 + 验收", "编辑器可用"],
  ],
  [1200, 3800, 4360]
));
children.push(para("风险提示：认证体系和 AI Proxy 是 Wave 1 关键路径。建议认证先用简单方案（邮箱密码 + org_id 硬编码），AI Proxy 第一个 sprint 只支持 Anthropic。"));

// ===== 十、ADR =====
children.push(heading(HeadingLevel.HEADING_1, "十、架构决策记录 (ADR)"));

const adrs = [
  {
    title: "ADR-001：多租户 vs 单用户",
    decision: "多租户 SaaS（第一天带 org_id）",
    context: "原型含团队元素（5人协作），东确认多组织隔离使用",
    rationale: "单用户→SaaS 的迁移成本远高于第一天设计 org_id 的额外开销",
    consequence: "认证系统需支持 org/workspace 层级；后续团队协作功能天然支持",
  },
  {
    title: "ADR-002：用户自备 API Key vs 平台统一提供",
    decision: "用户自备 Key，平台做 Proxy 路由",
    context: "编辑器 AI 调用依赖 LLM provider，东确认不承担推理费用",
    rationale: "东明确的成本策略：平台不承担推理费用",
    consequence: "需实现前端 RSA → Proxy AES-256-GCM 加密链路；不做用量计费",
  },
  {
    title: "ADR-003：AI Proxy 架构 vs 前端直调",
    decision: "后端 Proxy 转发（不前端直调第三方 API）",
    context: "原型 generate() 直接调 window.claude.complete()，生产环境不可行",
    rationale: "用户自备 Key 场景下 Key 不能暴露前端",
    consequence: "Wave 1 实现 Next.js API Routes Proxy；前端统一走 /api/proxy/generate",
  },
  {
    title: "ADR-004：SSE Streaming vs 全量返回",
    decision: "SSE Streaming",
    context: "AI 文字生成需数秒，全量返回 UX 不可接受",
    rationale: "大模型场景下用户期望即时反馈",
    consequence: "Proxy 支持 SSE 协议；前端编辑器按 chunk 增量渲染",
  },
  {
    title: "ADR-005：发布状态机 + Mock Adapter",
    decision: "Wave 1 实现完整状态机 + mock adapter；Wave 4 替换为真实 API",
    context: "多平台 API 对接工作量极大，东确认先走一键复制粘贴",
    rationale: "mock 状态机使发布模块 UX 可测试且不阻塞 Wave 1",
    consequence: "Schedule.status 含 partial_fail；真实 adapter 延迟到 Wave 4",
  },
];

adrs.forEach((adr) => {
  children.push(heading(HeadingLevel.HEADING_2, adr.title));
  children.push(boldPara("决策：", adr.decision));
  children.push(boldPara("上下文：", adr.context));
  children.push(boldPara("选型理由：", adr.rationale));
  children.push(boldPara("后果：", adr.consequence));
});

// ===== Wave 1 Task 拆分 =====
children.push(heading(HeadingLevel.HEADING_1, "附录：Wave 1 Task 拆分"));

children.push(heading(HeadingLevel.HEADING_2, "Wave 1a（第 1-2 周）"));
const w1aTasks = [
  "Task 1: 项目脚手架 + Shell 布局 + 路由框架（🚧 进行中）",
  "Task 2: PostgreSQL schema + 多租户认证体系（⏳ 待开始）",
  "Task 3: AI Proxy — Next.js API Routes + Anthropic streaming（⏳ 待开始）",
  "Task 4: Key 管理页面 + Key Router 前端状态（⏳ 待开始）",
];
w1aTasks.forEach((item) => children.push(para("• " + item, { spacingAfter: 40 })));

children.push(heading(HeadingLevel.HEADING_2, "Wave 1b（第 3-4 周）"));
const w1bTasks = [
  "Task 5: 编辑器文字模式 — AI 生成 + SSE 回显（⏳ 待开始）",
  "Task 6: 发布状态机 + Mock Adapter（⏳ 待开始）",
  "Task 7: 基础素材库 — 网格 + 上传入口（⏳ 待开始）",
];
w1bTasks.forEach((item) => children.push(para("• " + item, { spacingAfter: 40 })));

children.push(para("关键路径：Task 1 → 2 → 3 → 4 → 5（共 4 周）", { bold: true }));
children.push(para("独立 workstream：Task 6（发布状态机）和 Task 7（素材库）在各自前置完成后可并行开发。"));

// Build document
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: C.ink },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: C.accent },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: sectionProps,
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "盎然内容 · Implement Plan", font: "Arial", size: 18, color: C.text3 })],
          alignment: AlignmentType.RIGHT,
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 18, color: C.text3 }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: C.text3 }),
          ],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "/workspaces/6a0ddbdf93713365d0f026f2/docs/盎然内容-实施计划.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("DOCX written to:", outPath);
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
