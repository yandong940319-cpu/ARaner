# 编辑器 Mode Selector 设计标注

## 概述

编辑器当前只支持文字生成。增加 mode selector 让用户选择三种创作模式，对齐原型 `proto-editor.jsx`。

## 交互模型

### Mode 选择器

**位置：** 编辑器左面板顶部，在「发布平台」上方新增一行。

**视觉：** 三个 pill 按钮并排，与原型 `MODE_OPTIONS` 一致：

```
┌──────────────────────────────────────────────┐
│  创作模式                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  纯文字   │ │ 图文混排 │ │  视频脚本 │      │
│  └──────────┘ └──────────┘ └──────────┘      │
└──────────────────────────────────────────────┘
```

- 默认选中「纯文字」（向后兼容现有功能）
- 选中态：背景 `#1a1a1a` 白字，同现有 `pr-pill.active` 样式
- 未选中态：白底灰字，同 `pr-pill.click`

### 模式切换效果

| 模式 | 长度选项 | 右面板内容 | 封面/配图区 | 生成后操作 |
|------|---------|-----------|------------|-----------|
| **纯文字** | 300-500 / 600-900 / 1000-1500 字 | 纯文本预览 | 不变（当前实现） | 无变化 |
| **图文混排** | 300-500 / 600-900 / 1000-1500 字 | 文本预览 + 配图占位 | 增加配图网格区域 | 文字生成后自动进入配图生成阶段 |
| **视频脚本** | 15s / 30s / 45s / 自定义 | 分镜面板（每镜描述+画面） | 替换为分镜列表 | 生成分镜脚本，逐镜可单独重生成 |

## 组件层次

```
EditorPage
├── Topbar (title + actions)
├── EditorBody (flex row)
│   ├── LeftPanel (320px)
│   │   ├── ModeSelector       ← NEW
│   │   ├── Platform Selection  (已有)
│   │   ├── Tone (已有)
│   │   ├── Length              (修改：内容随 mode 切换)
│   │   ├── Materials (已有)
│   │   └── Prompt (已有)
│   └── RightPanel (flex 1)
│       ├── ContentArea
│       │   ├── EmptyState / Loading / Error (已有)
│       │   ├── TextContent (已有)
│       │   ├── GalleryGrid              ← NEW (mix mode)
│       │   └── StoryboardPanel          ← NEW (video mode)
│       ├── CoverBar (已有，mix mode 可保留)
│       └── OutlinePanel (已有，纯文字模式)
```

## 状态变更

### 新增 state

```typescript
type Mode = 'text' | 'mix' | 'video';
const [mode, setMode] = useState<Mode>('text');
```

### 影响现有的 state

- **length / length options** — text 和 mix 模式用 `LENGTH_TEXT_OPTIONS`，video 模式用 `LENGTH_VIDEO_OPTIONS`
- **body 渲染** — text 模���用 `pre-wrap` 纯文本，mix 模式文字 + 配图交替，video 模式分镜列表

### 新增状态 (video mode)

```typescript
interface StoryboardItem {
  id: string;
  sceneNumber: number;
  duration: string;       // e.g. "3-5s"
  camera: string;         // e.g. "中景"
  description: string;    // 画面描述
  audio: string;          // 旁白/音效
  generatedImage?: string; // AI 生成的画面
}
const [storyboard, setStoryboard] = useState<StoryboardItem[]>([]);
const [videoLength, setVideoLength] = useState('short');
const [customDuration, setCustomDuration] = useState('60');
```

### 新增生成流程状态 (mix mode)

```typescript
type ImageStage = 'idle' | 'text' | 'cover' | 'images' | 'video' | 'done';
const [imageStage, setImageStage] = useState<ImageStage>('idle');
```

## 行为说明

### Mix 模式生成流程

1. 用户配置参数 + prompt，点击「AI 起稿」
2. 生成文字内容（现有流程），完成后自动进入 imageStage
3. 生成封面图 prompt → 显示封面预览
4. 生成配图（按段落配图）→ 显示在文字间
5. 用户可手动换图（从素材库 picker）

### Video 模式生成流程

1. 用户选择目标平台 + 调性 + 时长（15s/30s/45s/自定义）
2. 生成分镜脚本（段落级别）
3. 每段包含：时长、镜头类型、画面描述、旁白/音效
4. 用户可逐镜编辑或重新生成
5. 后续可生成 AI 配图（Wave 4+ 考虑）

### 长度选项联动

```typescript
const LENGTH_TEXT_OPTIONS = [
  { id: 'short', label: '短', desc: '300-500 字' },
  { id: 'mid',   label: '中', desc: '600-900 字' },
  { id: 'long',  label: '长', desc: '1000-1500 字' },
];

const LENGTH_VIDEO_OPTIONS = [
  { id: 'short',  label: '短', desc: '15s' },
  { id: 'mid',    label: '中', desc: '30s' },
  { id: 'long',   label: '长', desc: '45s' },
  { id: 'custom', label: '自定义', desc: '输入时长' },
];
```

切换 mode 时：
- text ↔ mix：保留当前 length 值（两者选项相同）
- 任意 → video：重置为 'short'
- video → 任意：重置为 'mid'

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/app/(app)/editor/page.tsx` | 新增 ModeSelector 组件 + 模式相关 state + 渲染条件分支 |
| `src/lib/design-tokens.ts` | 无需改动（颜色 token 已覆盖） |
| `src/app/globals.css` | 如需新增分镜样式可加（可选） |
| `src/components/` | 新增 `StoryboardPanel.tsx`（视频分镜，可选提取） |

## 实现建议

1. **Phase 1**：纯 UI，加 mode selector pill + 长度联动切换 + 条件渲染不同内容
2. **Phase 2**：mix 模式配图生成（接入 AI 配图 API）
3. **Phase 3**：video 模式分镜脚本生成和展示

Phase 1 纯 UI 改动约 80-120 行，Phase 2+3 涉及 API 和状态机，需要后端配合。
