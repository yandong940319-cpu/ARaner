// proto-editor-modals.jsx — Modals/popovers used by the editor:
// HistoryDrawer, PreviewModal, CoverActionsPopover

// ============================================================================
// Shared modal shell
// ============================================================================
function ModalShell({ width = 600, onClose, children }) {
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(20,16,8,0.4)', animation: 'pr-fade .15s ease-out' }} />
      <div style={{
        position: 'relative', width, maxHeight: 'calc(100vh - 48px)',
        background: C.surface, borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-zoom-in .18s cubic-bezier(.2,.7,.2,1)',
      }}>
        {children}
      </div>
    </div>,
    document.body
  );
}

function ModalHeader({ title, subtitle, onClose, right }) {
  return (
    <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {right}
        <button className="pr-btn ghost icon" onClick={onClose} aria-label="关闭">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// History Drawer — version timeline + diff preview
// ============================================================================
function HistoryDrawer({ currentBody, currentTitle, onClose, onRevert }) {
  // mock versions; newest first
  const versions = React.useMemo(() => ([
    { id: 'v6', label: '当前',     time: '刚刚',         author: 'Mira',  source: 'edit',    body: currentBody, title: currentTitle, active: true },
    { id: 'v5', label: 'AI 改写',   time: '2 分钟前',    author: 'AI',    source: 'ai',      body: '（更口语化版本 · 节选）\n说真的，第一次一个人去露营，我紧张到心跳加速…', title: currentTitle, accent: true },
    { id: 'v4', label: 'AI 生成',   time: '14:23',       author: 'AI',    source: 'ai',      body: '（v4 · AI 第二次生成）\n你猜独自露营要花多少钱？答案可能让你意外…', title: currentTitle, accent: true },
    { id: 'v3', label: '手动编辑',   time: '13:50',       author: 'Mira',  source: 'edit',    body: '（v3 · 手改 · 调整段落顺序）', title: currentTitle },
    { id: 'v2', label: 'AI 生成',   time: '11:20',       author: 'AI',    source: 'ai',      body: '（v2 · AI 首次生成）', title: '¥200 露营装备清单 · 草稿', accent: true },
    { id: 'v1', label: '初稿',      time: '昨日 17:30',  author: 'Mira',  source: 'edit',    body: '（v1 · 大纲 + 钩子段落）',  title: '露营选题 · 大纲' },
  ]), [currentBody, currentTitle]);
  const [pick, setPick] = React.useState(versions[0].id);
  const picked = versions.find(v => v.id === pick);

  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(20,16,8,0.35)', animation: 'pr-fade .15s ease-out' }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 720,
        background: C.surface,
        boxShadow: '-12px 0 40px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-slide-in .22s cubic-bezier(.2,.7,.2,1)',
      }}>
        <ModalHeader title="版本历史" subtitle={`${versions.length} 个版本 · 自动保存每次重大修改`} onClose={onClose} />

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, minHeight: 0 }}>
          {/* timeline */}
          <div className="pr-scroll" style={{ borderRight: `1px solid ${C.border}`, overflow: 'auto' }}>
            {versions.map(v => {
              const on = pick === v.id;
              return (
                <button key={v.id} onClick={() => setPick(v.id)} style={{
                  all: 'unset', cursor: 'pointer', width: '100%',
                  padding: '12px 16px',
                  background: on ? '#efece4' : 'transparent',
                  borderLeft: `3px solid ${on ? C.ink : 'transparent'}`,
                  display: 'block',
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: MONO, color: on ? C.ink : C.text2 }}>{v.id}</span>
                      <span style={{ fontSize: 12, color: C.text2 }}>{v.label}</span>
                      {v.active && <span className="pr-pill good" style={{ height: 16, fontSize: 10 }}>当前</span>}
                    </div>
                  </div>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.text3 }}>
                    <span>{v.source === 'ai' ? '✦ AI' : v.author}</span>
                    <span style={{ fontFamily: MONO }}>{v.time}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* preview */}
          <div className="pr-scroll" style={{ overflow: 'auto', padding: 24, background: C.bg }}>
            <div style={{ maxWidth: 540, margin: '0 auto' }}>
              <div style={{ fontSize: 11, color: C.text3, fontFamily: MONO, marginBottom: 8 }}>{picked.id} · {picked.time} · {picked.source === 'ai' ? '✦ AI 生成' : picked.author + ' 编辑'}</div>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px', lineHeight: 1.3 }}>{picked.title}</h1>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: C.text2, whiteSpace: 'pre-wrap' }}>{picked.body || '（空内容）'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface2, borderRadius: '0 0 0 0' }}>
          <span style={{ fontSize: 11, color: C.text3 }}>
            {picked.active ? '这是当前版本' : `恢复到 ${picked.id} 会覆盖当前内容（仍可再恢复）`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pr-btn" onClick={onClose}>关闭</button>
            <button className="pr-btn primary" disabled={picked.active} onClick={() => onRevert(picked)} style={{ opacity: picked.active ? 0.4 : 1 }}>
              恢复此版本
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================================
// Preview Modal — platform-specific mockup
// ============================================================================
function PreviewModal({ title, body, platform, onClose }) {
  const [device, setDevice] = React.useState(platform);

  return (
    <ModalShell width={760} onClose={onClose}>
      <ModalHeader
        title="发布前预览"
        subtitle="在各平台样式中预览内容呈现效果"
        onClose={onClose}
        right={
          <div style={{ display: 'flex', gap: 4, padding: 3, background: C.surface2, borderRadius: 7, border: `1px solid ${C.border}` }}>
            {Object.entries(PLATFORMS).map(([id, p]) => (
              <button key={id} onClick={() => setDevice(id)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '5px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500,
                background: device === id ? C.surface : 'transparent',
                color: device === id ? C.text : C.text2,
                boxShadow: device === id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="pr-scroll" style={{ flex: 1, overflow: 'auto', padding: 28, background: C.bg }}>
        <DevicePreview device={device} title={title} body={body} />
      </div>

      <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface2, borderRadius: '0 0 12px 12px' }}>
        <span style={{ fontSize: 11, color: C.text3 }}>预览仅供参考，最终样式以平台为准</span>
        <button className="pr-btn" onClick={onClose}>关闭</button>
      </div>
    </ModalShell>
  );
}

function DevicePreview({ device, title, body }) {
  const trimmed = body || '（暂无正文）';
  if (device === 'xhs') {
    return (
      <div style={{ width: 360, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ aspectRatio: '4/5', background: 'linear-gradient(135deg, hsl(28 50% 86%), hsl(8 45% 78%))' }} />
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{title}</h3>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: '#333', whiteSpace: 'pre-wrap' }}>{trimmed.slice(0, 480)}{trimmed.length > 480 ? '…' : ''}</div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#888', paddingTop: 10, borderTop: '1px solid #f0eeea' }}>
            <span>♡  126</span><span>💬 18</span><span>↗ 2.3k</span>
          </div>
        </div>
      </div>
    );
  }
  if (device === 'tt') {
    return (
      <div style={{ width: 280, height: 500, margin: '0 auto', borderRadius: 24, background: '#000', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2a3242, #1a1a1a)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', color: '#fff' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>@your.brand</div>
          <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.4, opacity: 0.95 }}>{trimmed.slice(0, 100)}{trimmed.length > 100 ? '…' : ''}</div>
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>♪ 原声 ·  品牌</div>
        </div>
        <div style={{ position: 'absolute', right: 10, bottom: 100, display: 'flex', flexDirection: 'column', gap: 16, color: '#fff', fontSize: 11, textAlign: 'center' }}>
          <div>♡<br/>12k</div><div>💬<br/>340</div><div>↗<br/>2.8k</div>
        </div>
      </div>
    );
  }
  if (device === 'yt') {
    return (
      <div style={{ width: 520, margin: '0 auto', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #2a3242, #6e5945)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '2px 6px', background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 11, fontFamily: MONO, borderRadius: 2 }}>8:24</div>
        </div>
        <div style={{ padding: 16, display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcd6c8', flex: '0 0 auto' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{title}</h3>
            <div style={{ marginTop: 6, fontSize: 12, color: '#606060' }}>your.brand · 42k views · 2 hours ago</div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{trimmed.slice(0, 180)}{trimmed.length > 180 ? '… 展开 ›' : ''}</div>
          </div>
        </div>
      </div>
    );
  }
  // fb
  return (
    <div style={{ width: 500, margin: '0 auto', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcd6c8' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Your Brand</div>
          <div style={{ fontSize: 12, color: '#606770' }}>2h · 🌍 Public</div>
        </div>
      </div>
      <div style={{ padding: '0 16px 12px', fontSize: 14, lineHeight: 1.5, color: '#1c1e21', whiteSpace: 'pre-wrap' }}>{trimmed.slice(0, 280)}{trimmed.length > 280 ? '… See more' : ''}</div>
      <div style={{ aspectRatio: '5/3', background: 'linear-gradient(135deg, hsl(28 50% 86%), hsl(8 45% 78%))' }} />
      <div style={{ padding: '10px 16px', display: 'flex', gap: 16, color: '#65676b', fontSize: 13, borderTop: '1px solid #ebedf0' }}>
        <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
      </div>
    </div>
  );
}

// ============================================================================
// Cover actions popover (anchored next to the cover thumbnail)
// ============================================================================
function CoverActionsPopover({ anchorRect, onClose, onSelectAsset, onAIGen, onUpload, onRemove }) {
  const [generating, setGenerating] = React.useState(false);
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    const onDoc = e => {
      if (!e.target.closest('.cover-popover')) onClose();
    };
    window.addEventListener('keydown', onKey);
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [onClose]);

  if (!anchorRect) return null;
  const top = anchorRect.bottom + window.scrollY + 8;
  const left = anchorRect.left + window.scrollX;
  const width = Math.min(360, anchorRect.width);

  return ReactDOM.createPortal(
    <div className="cover-popover" style={{
      position: 'absolute', top, left, width,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10, padding: 8,
      boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
      zIndex: 110,
      animation: 'pr-zoom-in .15s ease-out',
    }}>
      {[
        { id: 'asset', label: '从素材库选',   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>, action: onSelectAsset },
        { id: 'ai',    label: 'AI 重新生成封面', icon: Icon.sparkle, action: () => { setGenerating(true); setTimeout(() => { onAIGen(); setGenerating(false); onClose(); }, 1400); } },
        { id: 'up',    label: '上传图片',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, action: onUpload },
        { id: 'rm',    label: '移除封面',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>, action: onRemove, danger: true },
      ].map(opt => (
        <button key={opt.id} onClick={opt.action} disabled={generating && opt.id === 'ai'} style={{
          all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 6, width: 'box-sizing',
          color: opt.danger ? C.bad : C.text,
          fontSize: 13, width: '100%', boxSizing: 'border-box',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = C.surface2; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <span style={{ color: opt.danger ? C.bad : C.text2 }}>
            {(generating && opt.id === 'ai') ? Icon.spinner : opt.icon}
          </span>
          <span>{(generating && opt.id === 'ai') ? 'AI 生成中…' : opt.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

Object.assign(window, { HistoryDrawer, PreviewModal, CoverActionsPopover, ModalShell, ModalHeader });
