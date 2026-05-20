// screens.jsx — all 7 screens in a unified left-nav SaaS shell.
// 2 variations per screen, exploring content layout within the same chrome.

const NAV = [
  { id: 'home',      label: '工作台' },
  { id: 'trends',    label: '热点分析' },
  { id: 'ideas',     label: '选题灵感' },
  { id: 'editor',    label: '编辑器' },
  { id: 'publish',   label: '发布管理' },
  { id: 'analytics', label: '数据分析' },
  { id: 'assets',    label: '素材库' },
];

// ---- Shell ----------------------------------------------------------------
function Shell({ active, title, actions, children }) {
  return (
    <Win>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* left nav */}
        <div style={{ width: 200, borderRight: `1px solid ${WK_LINE}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 16px', borderBottom: `1px solid ${WK_LINE}` }}>
            <T size={16} weight={600}>{'{ Logo }'}</T>
          </div>
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            {NAV.map(n => <NavItem key={n.id} active={n.id === active}>{n.label}</NavItem>)}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${WK_LINE}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Av /><Label>团队 ·  5 人</Label>
          </div>
        </div>
        {/* main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ height: 56, padding: '0 24px', borderBottom: `1px solid ${WK_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <T size={18} weight={600}>{title}</T>
            <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
          </div>
          <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      </div>
    </Win>
  );
}

// ============================================================================
// 工作台 ·  V1 — KPI + 待办 + 趋势
// ============================================================================
function HomeV1() {
  return (
    <Shell active="home" title="工作台" actions={<><Btn size="s">新建</Btn><Btn size="s" primary>AI 生成</Btn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {['本周发布','总曝光','互动率','转化'].map(t => (
          <Box key={t}>
            <Label>{t}</Label>
            <div style={{ marginTop: 6 }}><T size={22} weight={600}>{'{ 数值 }'}</T></div>
            <Label>{'+/- %'}</Label>
          </Box>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <T weight={600}>趋势图</T><Label>近 7 天</Label>
          </div>
          <LineChart h={180} />
          <div style={{ display: 'flex', gap: 16 }}>
            {['小红书','YouTube','TikTok','Facebook'].map(p => <Label key={p}>· {p}</Label>)}
          </div>
        </Box>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <T weight={600}>今日待办</T>
          {['事项一', '事项二', '事项三', '事项四', '事项五'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 14, height: 14, border: `1px solid ${WK_LINE}` }} />
              <T size={13}>{t}</T>
            </div>
          ))}
        </Box>
      </div>
    </Shell>
  );
}

// 工作台 ·  V2 — AI 提示框居中 + 近期列表
function HomeV2() {
  return (
    <Shell active="home" title="工作台" actions={<Btn size="s" primary>AI Copilot</Btn>}>
      <Box style={{ padding: 24, marginBottom: 20 }}>
        <Label>开始一项任务</Label>
        <div style={{ marginTop: 10, padding: '14px 0', borderTop: `1px solid ${WK_FAINT}`, borderBottom: `1px solid ${WK_FAINT}` }}>
          <T size={15} color={WK_SOFT}>{'/ 输入指令，或粘贴链接、附件...'}</T>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {['分析竞品','生成选题','改写多平台','复盘本周','优化封面'].map(p => <Pill key={p}>{p}</Pill>)}
        </div>
      </Box>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <T weight={600}>最近草稿</T>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', gap: 10, padding: '8px 0', borderBottom: `1px dashed ${WK_FAINT}`, alignItems: 'center' }}>
              <Img w={40} h={40} />
              <div>
                <T size={13}>{'{ 标题占位 }'}</T>
                <div><Label>平台 ·  状态</Label></div>
              </div>
              <Label>更新时间</Label>
            </div>
          ))}
        </Box>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <T weight={600}>今日动态</T>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ padding: '8px 0', borderBottom: `1px dashed ${WK_FAINT}` }}>
              <Label>类型 ·  时间</Label>
              <T size={13} style={{ display: 'block', marginTop: 2 }}>{'{ 一行动态描述 }'}</T>
            </div>
          ))}
        </Box>
      </div>
    </Shell>
  );
}

// ============================================================================
// 热点分析 ·  V1 — 表格 + 筛选
// ============================================================================
function TrendsV1() {
  return (
    <Shell active="trends" title="热点分析" actions={<><Btn size="s">导出</Btn><Btn size="s" primary>+ 关注话题</Btn></>}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input placeholder="搜索话题、关键词、KOL" w={280} />
        <Pill>近 7 天</Pill><Pill>全平台</Pill><Pill>美妆赛道</Pill>
      </div>
      <Box style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr) 100px', padding: 12, borderBottom: `1px solid ${WK_LINE}` }}>
          {['话题','小红书','YouTube','TikTok','Facebook','操作'].map(h => <Label key={h}>{h}</Label>)}
        </div>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr) 100px', padding: 14, borderBottom: `1px dashed ${WK_FAINT}`, alignItems: 'center' }}>
            <T size={13}>{`#话题 ${i.toString().padStart(2,'0')}`}</T>
            {[0,1,2,3].map(j => <T key={j} size={13} color={WK_SOFT}>{'+ %'}</T>)}
            <Pill>选题</Pill>
          </div>
        ))}
      </Box>
    </Shell>
  );
}

// 热点分析 ·  V2 — 详情页 (单话题深入)
function TrendsV2() {
  return (
    <Shell active="trends" title="热点分析 / { 话题名 }" actions={<><Btn size="s">收藏</Btn><Btn size="s" primary>→ 生成选题</Btn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <T weight={600}>热度走势</T>
              <Label>近 30 天</Label>
            </div>
            <LineChart h={160} />
          </Box>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
            <Box>
              <T weight={600}>各平台对比</T>
              <BarChart h={120} bars={[80, 60, 95, 35]} />
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 6 }}>
                {['小红','YT','TT','FB'].map(p => <Label key={p}>{p}</Label>)}
              </div>
            </Box>
            <Box>
              <T weight={600}>关联词</T>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {Array.from({length: 10}).map((_, i) => <Pill key={i}>{`#关键词${i+1}`}</Pill>)}
              </div>
            </Box>
          </div>
        </div>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <T weight={600}>洞察摘要</T>
          <Lines n={4} />
          <Hr />
          <Label>相关 KOL</Label>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Av />
              <div style={{ flex: 1 }}><T size={13}>{`@账号 ${i}`}</T></div>
              <Label>{ '粉丝数' }</Label>
            </div>
          ))}
        </Box>
      </div>
    </Shell>
  );
}

// ============================================================================
// 选题灵感 ·  V1 — 卡片网格
// ============================================================================
function IdeasV1() {
  return (
    <Shell active="ideas" title="选题灵感" actions={<><Btn size="s">导入</Btn><Btn size="s" primary>+ AI 生成</Btn></>}>
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label>分类</Label>
          {['全部','已收藏','AI 推荐','草稿','已用'].map((c, i) => (
            <NavItem key={c} active={i === 0}>{c}</NavItem>
          ))}
          <Hr style={{ margin: '8px 0' }} />
          <Label>话题</Label>
          {['# 话题 A','# 话题 B','# 话题 C','# 话题 D'].map(t => (
            <NavItem key={t}>{t}</NavItem>
          ))}
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, alignContent: 'start' }}>
          {Array.from({length: 9}).map((_, i) => (
            <Box key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Img h={120} />
              <T size={14} weight={500}>{`{ 选题标题 ${i+1} }`}</T>
              <Lines n={2} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Pill>平台</Pill><Pill>标签</Pill>
              </div>
            </Box>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// 选题灵感 ·  V2 — Kanban
function IdeasV2() {
  const cols = [
    { t: '想法池', n: 5 },
    { t: '大纲中', n: 3 },
    { t: '草稿',   n: 4 },
    { t: '待发布', n: 2 },
  ];
  return (
    <Shell active="ideas" title="选题灵感 ·  流水线" actions={<Btn size="s" primary>+ 新建</Btn>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, flex: 1, minHeight: 0 }}>
        {cols.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${WK_LINE}` }}>
              <T weight={600}>{c.t}</T>
              <Label>{c.n}</Label>
            </div>
            {Array.from({length: c.n}).map((_, j) => (
              <Box key={j} style={{ padding: 10 }}>
                <Label>平台</Label>
                <T size={13} style={{ display: 'block', marginTop: 4 }}>{'{ 选题标题 }'}</T>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                  <Av size={18} /><Label>负责人</Label>
                </div>
              </Box>
            ))}
            <Box dashed style={{ textAlign: 'center', padding: 8 }}>
              <Label>+ 添加</Label>
            </Box>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ============================================================================
// 编辑器 ·  V1 — 经典分屏 (指令 + 预览)
// ============================================================================
function EditorV1() {
  return (
    <Shell active="editor" title="编辑器 / { 内容标题 }" actions={<><Btn size="s">历史</Btn><Btn size="s" primary>送审</Btn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Label>设定</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['平台','调性','字数','配图数','受众'].map(p => <Pill key={p}>{p}</Pill>)}
          </div>
          <Hr />
          <Label>大纲</Label>
          {['1. 开头钩子','2. 核心论点','3. 例证 / 故事','4. 收束 CTA','5. 标签'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, border: `1px solid ${WK_LINE}` }} />
              <T size={13}>{t}</T>
            </div>
          ))}
          <Hr />
          <Label>指令</Label>
          <Lines n={3} />
          <div style={{ marginTop: 'auto' }}><Btn primary size="s">↻ 重新生成</Btn></div>
        </Box>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Label>预览</Label>
          <T size={20} weight={600}>{'{ 标题占位 }'}</T>
          <Img h={140} label="封面" />
          <Lines n={5} />
          <Hr />
          <Lines n={3} />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {['#标签一','#标签二','#标签三','#标签四'].map(t => <Pill key={t}>{t}</Pill>)}
          </div>
        </Box>
      </div>
    </Shell>
  );
}

// 编辑器 ·  V2 — 一稿多平台改写
function EditorV2() {
  return (
    <Shell active="editor" title="编辑器 ·  多平台" actions={<Btn size="s" primary>一键发布</Btn>}>
      <Box style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '80px 1fr 160px', gap: 12, alignItems: 'center' }}>
        <Label>主稿</Label>
        <div>
          <T weight={500}>{'{ 主稿标题 }'}</T>
          <div style={{ marginTop: 4 }}><Lines n={2} /></div>
        </div>
        <Btn size="s">✎ 编辑主稿</Btn>
      </Box>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, minHeight: 0 }}>
        {['小红书','YouTube','TikTok','Facebook'].map(plat => (
          <Box key={plat} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <T weight={500}>{plat}</T>
              <Pill>同步</Pill>
            </div>
            <Img h={90} label={plat + ' 预览'} />
            <Lines n={4} />
            <Hr />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Label>预测曝光</Label>
              <Label>{'{ 数值 }'}</Label>
            </div>
            <Btn size="s">单独调整</Btn>
          </Box>
        ))}
      </div>
    </Shell>
  );
}

// ============================================================================
// 发布管理 ·  V1 — 列表 / 队列
// ============================================================================
function PublishV1() {
  return (
    <Shell active="publish" title="发布管理" actions={<><Btn size="s">日历</Btn><Btn size="s" primary>+ 排期</Btn></>}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Pill filled>全部 ·  18</Pill><Pill>今日</Pill><Pill>本周</Pill><Pill>已发</Pill><Pill>失败</Pill>
      </div>
      <Box style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr 100px 100px 120px', padding: 12, borderBottom: `1px solid ${WK_LINE}` }}>
          {['时间','平台','内容','状态','预测','操作'].map(h => <Label key={h}>{h}</Label>)}
        </div>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr 100px 100px 120px', padding: 12, borderBottom: `1px dashed ${WK_FAINT}`, alignItems: 'center' }}>
            <T size={13}>{'{ 时间 }'}</T>
            <Pill>{'{ 平台 }'}</Pill>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Img w={36} h={36} />
              <T size={13}>{`{ 内容标题 ${i} }`}</T>
            </div>
            <Pill>状态</Pill>
            <Label>数值</Label>
            <div style={{ display: 'flex', gap: 6 }}>
              <Pill>✎</Pill><Pill>···</Pill>
            </div>
          </div>
        ))}
      </Box>
    </Shell>
  );
}

// 发布管理 ·  V2 — 周日历
function PublishV2() {
  return (
    <Shell active="publish" title="发布管理 ·  周日历" actions={<><Btn size="s">列表</Btn><Btn size="s" primary>+ 排期</Btn></>}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <Btn size="s">‹</Btn><T weight={500}>2026 W20</T><Btn size="s">›</Btn>
      </div>
      <Box style={{ flex: 1, padding: 0, display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gridTemplateRows: '32px repeat(4, 1fr)' }}>
        <div />
        {['一','二','三','四','五','六','日'].map(d => (
          <div key={d} style={{ padding: 8, borderBottom: `1px solid ${WK_LINE}` }}><Label>周{d}</Label></div>
        ))}
        {['上午','下午','晚上','深夜'].map((row, r) => (
          <React.Fragment key={row}>
            <div style={{ padding: 8, borderRight: `1px solid ${WK_FAINT}`, textAlign: 'right' }}><Label>{row}</Label></div>
            {Array.from({length: 7}).map((_, c) => {
              // sprinkle a few placeholder cards
              const has = (r + c) % 3 === 0;
              return (
                <div key={c} style={{ border: `1px dashed ${WK_FAINT}`, padding: 6 }}>
                  {has && (
                    <div style={{ background: WK_INK, color: WK_BG, padding: '4px 6px', fontSize: 11, fontFamily: WK_FONT }}>
                      {'{ 内容 }'}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Shell>
  );
}

// ============================================================================
// 数据分析 ·  V1 — KPI + 图表
// ============================================================================
function AnalyticsV1() {
  return (
    <Shell active="analytics" title="数据分析" actions={<><Btn size="s">导出</Btn><Btn size="s">对比期</Btn></>}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Pill filled>本周</Pill><Pill>本月</Pill><Pill>本季</Pill><Pill>自定义</Pill>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        {['总曝光','总互动','新粉','转化'].map(t => (
          <Box key={t}>
            <Label>{t}</Label>
            <div style={{ marginTop: 6 }}><T size={22} weight={600}>{'{ 数值 }'}</T></div>
            <BarChart h={40} bars={[20,30,28,40,55,50,65]} />
          </Box>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
        <Box>
          <T weight={600}>趋势</T>
          <LineChart h={180} />
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 6 }}>
            {['一','二','三','四','五','六','日'].map(d => <Label key={d}>{d}</Label>)}
          </div>
        </Box>
        <Box>
          <T weight={600}>平台占比</T>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
            <svg viewBox="0 0 100 100" width={120} height={120}>
              <circle cx="50" cy="50" r="40" fill="none" stroke={WK_LINE} strokeWidth="14" strokeDasharray="120 251" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={WK_SOFT} strokeWidth="14" strokeDasharray="70 251" strokeDashoffset="-120" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={WK_FAINT} strokeWidth="14" strokeDasharray="61 251" strokeDashoffset="-190" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['小红书','YouTube','TikTok','Facebook'].map(p => (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <T size={13}>{p}</T><Label>{'%'}</Label>
              </div>
            ))}
          </div>
        </Box>
      </div>
    </Shell>
  );
}

// 数据分析 ·  V2 — 内容排行 + 复盘
function AnalyticsV2() {
  return (
    <Shell active="analytics" title="数据分析 ·  内容排行" actions={<Btn size="s">导出</Btn>}>
      <Box style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 2fr repeat(4, 1fr) 80px', padding: 12, borderBottom: `1px solid ${WK_LINE}` }}>
          {['#','平台','内容','曝光','互动率','涨粉','评论','操作'].map(h => <Label key={h}>{h}</Label>)}
        </div>
        {Array.from({length: 8}).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 60px 2fr repeat(4, 1fr) 80px', padding: 12, borderBottom: `1px dashed ${WK_FAINT}`, alignItems: 'center' }}>
            <T size={13}>{i + 1}</T>
            <Pill>{'P'}</Pill>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Img w={36} h={36} />
              <T size={13}>{`{ 内容标题 ${i+1} }`}</T>
            </div>
            <T size={13} color={WK_SOFT}>{'{ 值 }'}</T>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <T size={13} color={WK_SOFT}>%</T>
              <div style={{ flex: 1, height: 4, background: WK_FAINT }}><div style={{ width: `${80 - i * 8}%`, height: '100%', background: WK_INK }} /></div>
            </div>
            <T size={13} color={WK_SOFT}>{'+'}</T>
            <T size={13} color={WK_SOFT}>{'+'}</T>
            <Pill>复用</Pill>
          </div>
        ))}
      </Box>
    </Shell>
  );
}

// ============================================================================
// 素材库 ·  V1 — 网格
// ============================================================================
function AssetsV1() {
  return (
    <Shell active="assets" title="素材库" actions={<><Btn size="s">导入</Btn><Btn size="s" primary>+ 上传</Btn></>}>
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label>类型</Label>
          {['全部 1248','图片 824','视频 165','文案 198','LOGO 23'].map((c, i) => (
            <NavItem key={c} active={i === 0}>{c}</NavItem>
          ))}
          <Hr style={{ margin: '8px 0' }} />
          <Label>标签</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Array.from({length: 8}).map((_, i) => <Pill key={i}>{`#标签${i+1}`}</Pill>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input placeholder="搜索素材 / 拖拽上传" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignContent: 'start' }}>
            {Array.from({length: 15}).map((_, i) => (
              <div key={i}>
                <Img h={110} />
                <Label style={{ marginTop: 4, display: 'block' }}>{`IMG_${1024 + i}`}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

// 素材库 ·  V2 — 详情侧栏
function AssetsV2() {
  return (
    <Shell active="assets" title="素材库 / { 素材名 }" actions={<><Btn size="s">下载</Btn><Btn size="s" primary>→ 用于编辑</Btn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, flex: 1, minHeight: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Img w={420} h={520} label="素材主视图" />
        </Box>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Box>
            <Label>基本信息</Label>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['文件名','{ 名 }'],['类型','{ JPG }'],['尺寸','{ W×H }'],['上传','{ 时间 }'],['使用','{ N 次 }']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Label>{k}</Label><T size={12} color={WK_SOFT}>{v}</T>
                </div>
              ))}
            </div>
          </Box>
          <Box>
            <Label>AI 标签</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {Array.from({length: 6}).map((_, i) => <Pill key={i}>{`#自动${i+1}`}</Pill>)}
            </div>
          </Box>
          <Box>
            <Label>相似素材</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
              {Array.from({length: 6}).map((_, i) => <Img key={i} h={60} />)}
            </div>
          </Box>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, {
  Shell,
  HomeV1, HomeV2,
  TrendsV1, TrendsV2,
  IdeasV1, IdeasV2,
  EditorV1, EditorV2,
  PublishV1, PublishV2,
  AnalyticsV1, AnalyticsV2,
  AssetsV1, AssetsV2,
});
