// proto-ideas.jsx — 选题灵感: 卡片网格 + 导入弹窗

function PageIdeas() {
  const { go } = useRoute();
  const [filter, setFilter] = React.useState('all');
  const [topic, setTopic] = React.useState('all');
  const [importOpen, setImportOpen] = React.useState(false);
  const [genOpen, setGenOpen] = React.useState(false);
  const [extraIdeas, setExtraIdeas] = React.useState([]);

  const allIdeas = [...extraIdeas, ...DATA.ideas];
  const filtered = allIdeas.filter(i => {
    if (filter === 'fav' && i.status !== '已收藏') return false;
    if (filter === 'ai'  && i.source !== 'ai') return false;
    if (filter === 'draft' && i.status !== '草稿') return false;
    return true;
  });

  const handleImport = (ideas) => {
    const ts = Date.now();
    setExtraIdeas(es => [
      ...ideas.map((it, i) => ({
        id: 'imp-' + ts + '-' + i,
        title: it.title,
        platform: it.platform || 'xhs',
        source: 'imported',
        status: '草稿',
        thumb: 100 + i,
        _imported: true,
      })),
      ...es,
    ]);
    setImportOpen(false);
  };

  const handleGenerate = (ideas) => {
    const ts = Date.now();
    setExtraIdeas(es => [
      ...ideas.map((it, i) => ({
        id: 'gen-' + ts + '-' + i,
        title: it.title,
        platform: it.platform || 'xhs',
        source: 'ai',
        status: '已收藏',
        thumb: 200 + i,
        _generated: true,
      })),
      ...es,
    ]);
    setGenOpen(false);
  };

  return (
    <Page active="ideas"
      title="选题灵感"
      breadcrumb={'· AI + 团队产出'}
      right={<>
        <button className="pr-btn" onClick={() => setImportOpen(true)}>导入</button>
        <button className="pr-btn accent" onClick={() => setGenOpen(true)}>{Icon.sparkle}<span>AI 生成</span></button>
      </>}>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
        {/* side filters */}
        <aside>
          <div className="pr-label" style={{ marginBottom: 8 }}>分类</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
            {[
              ['all',   '全部',     allIdeas.length],
              ['fav',   '已收藏',   allIdeas.filter(i => i.status === '已收藏').length],
              ['ai',    'AI 推荐',  allIdeas.filter(i => i.source === 'ai').length],
              ['draft', '草稿',     allIdeas.filter(i => i.status === '草稿').length],
              ['arch',  '已归档',   0],
            ].map(([id, label, n]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 6,
                fontSize: 13,
                color: filter === id ? C.ink : C.text2,
                fontWeight: filter === id ? 600 : 400,
                background: filter === id ? '#efece4' : 'transparent',
              }}>
                <span>{label}</span>
                <span style={{ color: C.text3, fontSize: 11, fontFamily: MONO }}>{n}</span>
              </button>
            ))}
          </div>

          <div className="pr-label" style={{ marginBottom: 8 }}>话题</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['city walk','轻露营','通勤穿搭','早c晚a','办公好物','桌面','美食'].map(t => (
              <span key={t} className={`pr-pill click ${topic === t ? 'active' : ''}`} onClick={() => setTopic(topic === t ? 'all' : t)}>#{t}</span>
            ))}
          </div>
        </aside>

        {/* grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.text3 }}>{filtered.length} 条选题</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="pr-pill click active">最新</span>
              <span className="pr-pill click">热度</span>
              <span className="pr-pill click">未使用</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map(i => <IdeaCard key={i.id} idea={i} onPick={(idea) => go('editor', { from: 'idea', idea })} />)}
            <NewIdeaCard onClick={() => go('editor')} />
          </div>
        </div>
      </div>

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={handleImport} />}
      {genOpen && <GenerateModal onClose={() => setGenOpen(false)} onAccept={handleGenerate} />}
    </Page>
  );
}

function IdeaCard({ idea, onPick }) {
  const hue = (idea.thumb * 53) % 360;
  return (
    <div className="pr-card hov" onClick={() => onPick(idea)}>
      <div style={{
        height: 130, borderRadius: '10px 10px 0 0',
        background: `linear-gradient(135deg, hsl(${hue} 40% 88%), hsl(${(hue + 30) % 360} 30% 78%))`,
        position: 'relative',
      }}>
        {idea.source === 'ai' && (
          <span style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 12 }}>
            {Icon.sparkle}AI
          </span>
        )}
        {idea.source === 'imported' && (
          <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 12 }}>
            导入
          </span>
        )}
        <span style={{ position: 'absolute', top: 10, right: 10 }}><PlatformTag id={idea.platform} /></span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, textWrap: 'pretty' }}>{idea.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="pr-pill">{idea.status}</span>
          <span style={{ fontSize: 11, color: C.text3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            进入编辑器 {Icon.arrow}
          </span>
        </div>
      </div>
    </div>
  );
}

function NewIdeaCard({ onClick }) {
  return (
    <div onClick={onClick} style={{
      border: `1.5px dashed ${C.borderStrong}`,
      borderRadius: 10, minHeight: 240,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 8, cursor: 'pointer',
      color: C.text3,
      transition: 'background .12s, border-color .12s, color .12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.text3; }}>
      {Icon.sparkle}
      <div style={{ fontSize: 13, fontWeight: 500 }}>AI 生成新选题</div>
      <div style={{ fontSize: 11 }}>基于最近热点</div>
    </div>
  );
}

// ============================================================================
// Import Modal
// ============================================================================
const IMPORT_SOURCES = [
  { id: 'link',  label: '链接',  desc: '粘贴竞品/KOL 帖子链接，AI 自动提取角度' },
  { id: 'text',  label: '文本',  desc: '大段头脑风暴文字，AI 拆分成多个选题' },
  { id: 'csv',   label: '表格',  desc: '上传 Excel / CSV ·  字段映射' },
  { id: 'tool',  label: '工具',  desc: '从 Notion / 飞书 / 飞书多维表 同步' },
];

function ImportModal({ onClose, onImport }) {
  const [source, setSource] = React.useState('link');
  const [linkText, setLinkText] = React.useState('');
  const [textBlob, setTextBlob] = React.useState('');
  const [csvLoaded, setCsvLoaded] = React.useState(false);
  const [connectedTool, setConnectedTool] = React.useState(null);
  const [parsing, setParsing] = React.useState(false);
  const [parsed, setParsed] = React.useState([]);  // { title, platform, selected }

  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reset parsed when source changes
  React.useEffect(() => { setParsed([]); }, [source]);

  const detectPlatform = (url) => {
    if (/xiaohongshu|xhslink|小红/.test(url)) return 'xhs';
    if (/youtube|youtu\.be/.test(url)) return 'yt';
    if (/tiktok|douyin/.test(url)) return 'tt';
    if (/facebook|fb\.com/.test(url)) return 'fb';
    return 'xhs';
  };

  const doParse = () => {
    setParsing(true);
    // Mock parse — in real app would be backend/AI
    setTimeout(() => {
      let items = [];
      if (source === 'link') {
        const lines = linkText.split('\n').map(l => l.trim()).filter(Boolean);
        items = lines.slice(0, 12).map((url, i) => ({
          title: extractTitleFromUrl(url, i),
          platform: detectPlatform(url),
          meta: url.slice(0, 40) + (url.length > 40 ? '…' : ''),
        }));
      } else if (source === 'text') {
        items = splitTextIntoIdeas(textBlob);
      } else if (source === 'csv') {
        items = [
          { title: '夏日防晒 5 条铁律',          platform: 'xhs', meta: 'row 1' },
          { title: 'OOTD ·  通勤干练风',          platform: 'xhs', meta: 'row 2' },
          { title: '30s ·  早起 morning routine', platform: 'tt',  meta: 'row 3' },
          { title: '办公桌升级 ·  3 个 100 元好物', platform: 'xhs', meta: 'row 4' },
          { title: 'Desk Setup Tour 2026',      platform: 'yt',  meta: 'row 5' },
          { title: '家庭周末 ·  亲子骑行路线',     platform: 'fb',  meta: 'row 6' },
        ];
      } else if (source === 'tool') {
        // Mock pulled from Notion database
        items = [
          { title: '七月内容主题 ·  防晒',        platform: 'xhs', meta: 'Notion ·  内容池' },
          { title: '七月内容主题 ·  露营续集',     platform: 'xhs', meta: 'Notion ·  内容池' },
          { title: '产品上新预热脚本',           platform: 'tt',  meta: 'Notion ·  内容池' },
          { title: '老客户回访短文',             platform: 'fb',  meta: 'Notion ·  内容池' },
          { title: 'YT 长视频 ·  品牌纪录片',     platform: 'yt',  meta: 'Notion ·  内容池' },
        ];
      }
      setParsed(items.map(it => ({ ...it, selected: true })));
      setParsing(false);
    }, 700);
  };

  const toggleSel = (i) => setParsed(p => p.map((x, idx) => idx === i ? { ...x, selected: !x.selected } : x));
  const allOn = parsed.length > 0 && parsed.every(p => p.selected);
  const setAll = (v) => setParsed(p => p.map(x => ({ ...x, selected: v })));

  const selectedCount = parsed.filter(p => p.selected).length;

  // Can we parse?
  const canParse =
    (source === 'link' && linkText.trim().length > 0) ||
    (source === 'text' && textBlob.trim().length > 30) ||
    (source === 'csv'  && csvLoaded) ||
    (source === 'tool' && connectedTool);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(20,16,8,0.4)', animation: 'pr-fade .15s ease-out',
      }} />
      <div style={{
        position: 'relative', width: 680, maxHeight: 'calc(100vh - 48px)',
        background: C.surface, borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-zoom-in .18s cubic-bezier(.2,.7,.2,1)',
      }}>
        {/* header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>导入选题</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>把外部已有的想法拉进选题库 ·  会进入「草稿」状态</p>
          </div>
          <button className="pr-btn ghost icon" onClick={onClose} aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* source selector */}
        <div style={{ padding: '14px 22px 0', display: 'flex', gap: 6 }}>
          {IMPORT_SOURCES.map(s => (
            <button key={s.id} onClick={() => setSource(s.id)} style={{
              all: 'unset', cursor: 'pointer',
              flex: 1, padding: '10px 12px', borderRadius: 7,
              border: `1px solid ${source === s.id ? C.ink : C.border}`,
              background: source === s.id ? '#efece4' : C.surface,
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 13, fontWeight: source === s.id ? 600 : 500, color: C.text }}>{s.label}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 3, lineHeight: 1.3 }}>{s.desc}</div>
            </button>
          ))}
        </div>

        {/* body */}
        <div className="pr-scroll" style={{ padding: '18px 22px', overflow: 'auto', flex: '1 1 auto', minHeight: 200 }}>
          {source === 'link' && (
            <LinkInput value={linkText} onChange={setLinkText} />
          )}
          {source === 'text' && (
            <TextInput value={textBlob} onChange={setTextBlob} />
          )}
          {source === 'csv' && (
            <CsvInput loaded={csvLoaded} onLoad={() => setCsvLoaded(true)} onReset={() => { setCsvLoaded(false); setParsed([]); }} />
          )}
          {source === 'tool' && (
            <ToolInput connected={connectedTool} onConnect={setConnectedTool} />
          )}

          {/* parsed list */}
          {parsing && (
            <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 8, background: C.accentSoft, color: C.accentText, display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icon.spinner}<span style={{ fontSize: 13 }}>AI 解析中…</span>
            </div>
          )}
          {parsed.length > 0 && !parsing && (
            <div style={{ marginTop: 16, border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`pr-chk ${allOn ? 'on' : ''}`} onClick={() => setAll(!allOn)}>{Icon.check}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>解析出 {parsed.length} 个选题</span>
                </div>
                <span style={{ fontSize: 12, color: C.text3 }}>已选 {selectedCount}</span>
              </div>
              <div style={{ maxHeight: 240, overflow: 'auto' }}>
                {parsed.map((p, i) => (
                  <div key={i} onClick={() => toggleSel(i)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, cursor: 'pointer' }}>
                    <span className={`pr-chk ${p.selected ? 'on' : ''}`}>{Icon.check}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      {p.meta && <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{p.meta}</div>}
                    </div>
                    <PlatformTag id={p.platform} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface2, borderRadius: '0 0 12px 12px' }}>
          <span style={{ fontSize: 11, color: C.text3 }}>
            {parsed.length === 0 ? '填入内容后点解析' : `将导入 ${selectedCount} 条到选题库`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pr-btn" onClick={onClose}>取消</button>
            {parsed.length === 0 ? (
              <button className="pr-btn primary" onClick={doParse} disabled={!canParse || parsing} style={{ opacity: (!canParse || parsing) ? 0.4 : 1, cursor: (!canParse || parsing) ? 'not-allowed' : 'pointer' }}>
                {Icon.sparkle}<span>{parsing ? '解析中…' : 'AI 解析'}</span>
              </button>
            ) : (
              <button className="pr-btn primary" disabled={selectedCount === 0} onClick={() => onImport(parsed.filter(p => p.selected))} style={{ opacity: selectedCount === 0 ? 0.4 : 1 }}>
                导入 {selectedCount} 条
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pr-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pr-zoom-in { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
      `}</style>
    </div>,
    document.body
  );
}

// ---- Helpers --------------------------------------------------------------
function extractTitleFromUrl(url, i) {
  const samples = [
    '"5 个出片机位 ·  city walk 上海篇"',
    '"独居女生穿搭 do/dont"',
    '"3 分钟看懂早 c 晚 a"',
    '"周末露营 ·  ¥200 5 件套"',
    '"通勤穿搭 ·  一周不撞衫"',
    '"宝藏咖啡店 ·  治愈下午"',
    '"夏日防晒 ·  避坑 3 条"',
  ];
  return samples[i % samples.length] + ' ·  对标';
}

function splitTextIntoIdeas(blob) {
  // Try splitting on common patterns: numbered, bullets, double-newline
  const sep = /\n+|(\d+[\.、])|[•·★▪]/;
  const parts = blob.split(/\n\n+|\n[•·★▪\-]\s*|\n\d+[\.、]\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 6 && s.length < 80);
  if (parts.length >= 2) {
    return parts.slice(0, 12).map(s => ({
      title: s.replace(/^[•·★▪\-\d\.、\s]+/, '').slice(0, 60),
      platform: 'xhs',
      meta: '从笔记拆分',
    }));
  }
  // fallback: 5 generic ideas inferred
  return [
    { title: '从笔记 ·  角度 1', platform: 'xhs', meta: 'AI 提取' },
    { title: '从笔记 ·  角度 2', platform: 'xhs', meta: 'AI 提取' },
    { title: '从笔记 ·  角度 3', platform: 'tt',  meta: 'AI 提取' },
  ];
}

// ---- Input sub-components -------------------------------------------------
function LinkInput({ value, onChange }) {
  const count = value.split('\n').filter(l => l.trim()).length;
  return (
    <div>
      <div className="pr-label" style={{ marginBottom: 8 }}>粘贴链接 ·  一行一个</div>
      <textarea className="pr-input" value={value} onChange={e => onChange(e.target.value)} rows={6} placeholder={'https://www.xiaohongshu.com/...\nhttps://www.tiktok.com/...\nhttps://www.youtube.com/...'} style={{ minHeight: 130, fontFamily: MONO, fontSize: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: C.text3 }}>
        <span>支持 小红书 / TikTok / YouTube / Facebook 链接</span>
        <span>{count} / 20 条</span>
      </div>
    </div>
  );
}

function TextInput({ value, onChange }) {
  return (
    <div>
      <div className="pr-label" style={{ marginBottom: 8 }}>粘贴文本 ·  AI 会自动拆分</div>
      <textarea className="pr-input" value={value} onChange={e => onChange(e.target.value)} rows={8} placeholder={'例如：\n\n下周想做几个露营选题。\n1. 200 元搞定第一次\n2. 安全感独居女生\n3. 拍照机位攻略\n…'} style={{ minHeight: 160, fontFamily: FONT, fontSize: 13 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: C.text3 }}>
        <span>支持编号列表 / 项目符号 / 段落</span>
        <span>{value.length} 字</span>
      </div>
    </div>
  );
}

function CsvInput({ loaded, onLoad, onReset }) {
  return (
    <div>
      <div className="pr-label" style={{ marginBottom: 8 }}>上传表格</div>
      {!loaded ? (
        <div onClick={onLoad} style={{
          border: `1.5px dashed ${C.borderStrong}`, borderRadius: 8,
          padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
          background: C.surface2,
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.ink}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.borderStrong}>
          <div style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: 8, background: C.surface, alignItems: 'center', justifyContent: 'center', color: C.text2, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>点击上传 ·  或拖入 .csv / .xlsx</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>必须包含 <code style={{ background: C.surface, padding: '1px 5px', borderRadius: 3, fontFamily: MONO, fontSize: 10 }}>title</code> 列 · 可选 <code style={{ background: C.surface, padding: '1px 5px', borderRadius: 3, fontFamily: MONO, fontSize: 10 }}>platform</code></div>
          <button className="pr-btn ghost sm" style={{ marginTop: 12 }} onClick={e => e.stopPropagation()}>下载模板</button>
        </div>
      ) : (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, background: C.surface2, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 10, fontWeight: 600 }}>CSV</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>七月内容池.xlsx</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>6 行 · 2 列已映射 (title, platform)</div>
          </div>
          <button className="pr-btn ghost sm" onClick={onReset}>更换</button>
        </div>
      )}
    </div>
  );
}

function ToolInput({ connected, onConnect }) {
  const tools = [
    { id: 'notion',  name: 'Notion',         status: 'connected' },
    { id: 'feishu',  name: '飞书多维表',     status: 'connected' },
    { id: 'trello',  name: 'Trello',         status: 'connect' },
    { id: 'gsheet',  name: 'Google Sheets',  status: 'connect' },
  ];
  return (
    <div>
      <div className="pr-label" style={{ marginBottom: 8 }}>选择工具</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tools.map(t => {
          const isOn = connected === t.id;
          return (
            <div key={t.id} onClick={() => t.status === 'connected' && onConnect(t.id)} style={{
              border: `1px solid ${isOn ? C.ink : C.border}`,
              background: isOn ? '#efece4' : C.surface,
              borderRadius: 7, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: t.status === 'connected' ? 'pointer' : 'default',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: C.surface2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.text2 }}>
                {t.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: t.status === 'connected' ? C.good : C.text3, marginTop: 2 }}>
                  {t.status === 'connected' ? (isOn ? '已选 · 内容池数据库' : '已连接') : '未连接'}
                </div>
              </div>
              {t.status === 'connected' && isOn && (
                <span className="pr-pill good">已选</span>
              )}
              {t.status === 'connect' && (
                <button className="pr-btn sm" onClick={e => e.stopPropagation()}>连接</button>
              )}
            </div>
          );
        })}
      </div>
      {connected && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: C.surface2, borderRadius: 7, fontSize: 12, color: C.text2 }}>
          将从 <strong>{tools.find(t => t.id === connected).name}</strong> ·  内容池 拉取最近 30 天的条目
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PageIdeas });

// ============================================================================
// AI Generate Modal
// ============================================================================

const ANGLE_OPTIONS = [
  { id: 'list',     label: '清单 / 干货' },
  { id: 'story',    label: '故事 / 第一人称' },
  { id: 'compare',  label: '对比 / 测评' },
  { id: 'avoid',    label: '避坑 / do & dont' },
  { id: 'howto',    label: '教程 / how-to' },
  { id: 'mood',     label: '治愈 / 情绪' },
];

const AUDIENCE_OPTIONS = [
  '22-28 女生',
  '一线城市白领',
  '学生党',
  '新手妈妈',
  '健身爱好者',
  '通勤族',
  '宠物主',
];

function GenerateModal({ onClose, onAccept }) {
  const [stage, setStage] = React.useState('setup'); // setup | generating | results
  const [topic, setTopic] = React.useState('轻露营');
  const [platforms, setPlatforms] = React.useState(new Set(['xhs','tt']));
  const [audience, setAudience] = React.useState(new Set(['22-28 女生']));
  const [angles, setAngles] = React.useState(new Set(['list','story']));
  const [count, setCount] = React.useState(8);
  const [results, setResults] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleSet = (setter, val) => setter(s => {
    const n = new Set(s); n.has(val) ? n.delete(val) : n.add(val); return n;
  });

  const generate = async () => {
    setStage('generating'); setError(null); setResults([]);
    const platformList = [...platforms].map(p => PLATFORMS[p].label).join(' / ');
    const angleList = [...angles].map(a => ANGLE_OPTIONS.find(o => o.id === a).label).join('、');
    const audienceList = [...audience].join('、');

    const prompt = `你是一位资深品牌内容策划。请围绕话题「${topic}」，为目标平台 ${platformList} 产出 ${count} 个具体的内容选题。

目标受众: ${audienceList || '不限'}
角度类型: ${angleList || '不限'}

要求:
- 每个选题给一个抓人的中文标题 (12-22 字)
- 推荐一个最适合的平台 (xhs / tt / yt / fb)
- 角度尽量差异化，避免重复

严格按 JSON 数组返回，不要 markdown 代码块包裹，格式:
[{"title":"标题文字","platform":"xhs","angle":"一句话角度说明"}]`;

    try {
      const out = await window.claude.complete(prompt);
      // Extract JSON
      const m = out.match(/\[[\s\S]*\]/);
      if (!m) throw new Error('AI 响应格式不符');
      const arr = JSON.parse(m[0]);
      setResults(arr.map((it, i) => ({
        id: i,
        title: it.title || '未命名',
        platform: (it.platform && PLATFORMS[it.platform]) ? it.platform : 'xhs',
        angle: it.angle || '',
        selected: true,
      })));
      setStage('results');
    } catch (e) {
      setError(e.message || '生成失败，请重试');
      setStage('setup');
    }
  };

  const toggleSel = (id) => setResults(rs => rs.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  const allOn = results.length > 0 && results.every(r => r.selected);
  const selectedCount = results.filter(r => r.selected).length;

  const canGenerate = topic.trim() && platforms.size > 0;

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(20,16,8,0.4)', animation: 'pr-fade .15s ease-out',
      }} />
      <div style={{
        position: 'relative', width: 720, maxHeight: 'calc(100vh - 48px)',
        background: C.surface, borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-zoom-in .18s cubic-bezier(.2,.7,.2,1)',
      }}>
        {/* header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.accentText }}>{Icon.sparkle}</span>
              AI 生成选题
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              {stage === 'results' ? '挑出喜欢的，加入选题库' : '锚定话题、目标平台和角度，AI 一次给你 N 个'}
            </p>
          </div>
          <button className="pr-btn ghost icon" onClick={onClose} aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* body */}
        <div className="pr-scroll" style={{ padding: '20px 22px', overflow: 'auto', flex: '1 1 auto', minHeight: 240 }}>
          {stage === 'setup' && (
            <SetupForm
              topic={topic} setTopic={setTopic}
              platforms={platforms} togglePlatform={(id) => toggleSet(setPlatforms, id)}
              audience={audience} toggleAudience={(a) => toggleSet(setAudience, a)}
              angles={angles} toggleAngle={(a) => toggleSet(setAngles, a)}
              count={count} setCount={setCount}
              error={error}
            />
          )}

          {stage === 'generating' && (
            <GeneratingState topic={topic} count={count} />
          )}

          {stage === 'results' && (
            <ResultsList
              results={results}
              toggleSel={toggleSel}
              allOn={allOn}
              setAll={(v) => setResults(rs => rs.map(r => ({ ...r, selected: v })))}
              topic={topic}
            />
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface2, borderRadius: '0 0 12px 12px' }}>
          <span style={{ fontSize: 11, color: C.text3 }}>
            {stage === 'setup'    && `将生成约 ${count} 个选题，${platforms.size} 个平台 ·  AI 用时 ~10 秒`}
            {stage === 'generating' && '正在生成…'}
            {stage === 'results'  && `选 ${selectedCount} / ${results.length} 个加入选题库（已收藏）`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {stage === 'results' && (
              <button className="pr-btn" onClick={() => setStage('setup')}>↻ 改设定</button>
            )}
            <button className="pr-btn" onClick={onClose}>取消</button>
            {stage === 'setup' && (
              <button className="pr-btn accent" disabled={!canGenerate} onClick={generate} style={{ opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? 'pointer' : 'not-allowed' }}>
                {Icon.sparkle}<span>开始生成</span>
              </button>
            )}
            {stage === 'generating' && (
              <button className="pr-btn" disabled>{Icon.spinner}<span>生成中…</span></button>
            )}
            {stage === 'results' && (
              <button className="pr-btn primary" disabled={selectedCount === 0} onClick={() => onAccept(results.filter(r => r.selected))} style={{ opacity: selectedCount === 0 ? 0.4 : 1 }}>
                加入选题库 ·  {selectedCount}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SetupForm({ topic, setTopic, platforms, togglePlatform, audience, toggleAudience, angles, toggleAngle, count, setCount, error }) {
  const HOT_TOPICS = ['city walk', '轻露营', '通勤穿搭', '早c晚a', '夜骑路线', '办公好物'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Topic */}
      <div>
        <div className="pr-label" style={{ marginBottom: 8 }}>锚定话题 <span style={{ color: C.accent, marginLeft: 4 }}>*</span></div>
        <input className="pr-input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="例如：city walk、夏日防晒" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.text3, marginRight: 4, alignSelf: 'center' }}>近期热点</span>
          {HOT_TOPICS.map(t => (
            <span key={t} className={`pr-pill click ${topic === t ? 'active' : ''}`} onClick={() => setTopic(t)}>#{t}</span>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div>
        <div className="pr-label" style={{ marginBottom: 8 }}>目标平台 <span style={{ color: C.accent, marginLeft: 4 }}>*</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {Object.entries(PLATFORMS).map(([id, p]) => {
            const on = platforms.has(id);
            return (
              <button key={id} onClick={() => togglePlatform(id)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 12px', border: `1px solid ${on ? C.ink : C.border}`,
                background: on ? '#efece4' : C.surface,
                borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two cols: audience + angles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div className="pr-label" style={{ marginBottom: 8 }}>目标受众</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {AUDIENCE_OPTIONS.map(a => (
              <span key={a} className={`pr-pill click ${audience.has(a) ? 'active' : ''}`} onClick={() => toggleAudience(a)}>{a}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="pr-label" style={{ marginBottom: 8 }}>角度类型</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ANGLE_OPTIONS.map(a => (
              <span key={a.id} className={`pr-pill click ${angles.has(a.id) ? 'active' : ''}`} onClick={() => toggleAngle(a.id)}>{a.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div className="pr-label">生成数量</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: MONO }}>{count} 个</span>
        </div>
        <input type="range" min="3" max="15" step="1" value={count} onChange={e => setCount(+e.target.value)} style={{ width: '100%', accentColor: C.ink }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, fontFamily: MONO, marginTop: 2 }}>
          <span>3</span><span>15</span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: C.badSoft, color: C.bad, fontSize: 13, borderRadius: 6 }}>
          {error}
        </div>
      )}
    </div>
  );
}

function GeneratingState({ topic, count }) {
  return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.accentText, fontSize: 14, fontWeight: 500 }}>
        {Icon.spinner}
        <span>围绕 <strong style={{ color: C.text }}>「{topic}」</strong> 生成 {count} 个选题…</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div key={i} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface }}>
            <div style={{ height: 14, width: `${60 + (i * 7) % 30}%`, background: '#ece9e0', borderRadius: 3, animation: `pr-pulse 1.6s ease-in-out ${i * 0.1}s infinite` }} />
            <div style={{ height: 10, width: `${40 + (i * 11) % 30}%`, background: '#ece9e0', borderRadius: 3, marginTop: 10, animation: `pr-pulse 1.6s ease-in-out ${i * 0.15}s infinite` }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes pr-pulse { 0%, 100% { opacity: .5 } 50% { opacity: 1 } }`}</style>
    </div>
  );
}

function ResultsList({ results, toggleSel, allOn, setAll, topic }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`pr-chk ${allOn ? 'on' : ''}`} onClick={() => setAll(!allOn)}>{Icon.check}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>围绕「{topic}」生成了 {results.length} 个选题</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map(r => (
          <div key={r.id} onClick={() => toggleSel(r.id)} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '12px 14px',
            border: `1px solid ${r.selected ? C.ink : C.border}`,
            background: r.selected ? '#efece4' : C.surface,
            borderRadius: 8, cursor: 'pointer',
            transition: 'border-color .12s, background .12s',
          }}>
            <span className={`pr-chk ${r.selected ? 'on' : ''}`} style={{ marginTop: 1 }}>{Icon.check}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{r.title}</div>
              {r.angle && <div style={{ fontSize: 12, color: C.text3, marginTop: 4, lineHeight: 1.5 }}>{r.angle}</div>}
            </div>
            <PlatformTag id={r.platform} />
          </div>
        ))}
      </div>
    </div>
  );
}
