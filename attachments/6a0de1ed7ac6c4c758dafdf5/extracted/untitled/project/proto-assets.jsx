// proto-assets.jsx — 素材库: 网格 + 标签

function PageAssets() {
  const { go, payload, clearPayload } = useRoute();
  // pick-mode: when assets is opened from editor as a picker
  const pickMode = payload?.from === 'editor-cover';
  const galleryMode = pickMode && payload?.target === 'gallery';

  const [type, setType] = React.useState('all');
  const [activeTags, setActiveTags] = React.useState(new Set(['camping']));
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState(new Set());

  // Build mock asset grid
  const assets = React.useMemo(() => Array.from({ length: 24 }).map((_, i) => ({
    id: `a${i}`,
    name: `IMG_${String(1024 + i).padStart(4,'0')}`,
    hue: (i * 47) % 360,
    size: (1.2 + (i % 5) * 0.4).toFixed(1) + ' MB',
    used: (i % 6) === 0 ? 0 : (i % 6),
    aspect: [1, 1.3, 0.75, 1.5, 1][i % 5],
  })), []);

  const types = [
    { id: 'all',   label: '全部',  n: 1248 },
    { id: 'img',   label: '图片',  n: 824 },
    { id: 'vid',   label: '视频',  n: 165 },
    { id: 'copy',  label: '文案',  n: 198 },
    { id: 'logo',  label: 'Logo / 字体',  n: 61 },
  ];

  const tags = ['camping','穿搭','美食','宠物','旅行','美妆','人物','产品','黄昏','室内','vlog','空镜'];

  const toggleTag = (t) => {
    setActiveTags(s => {
      const n = new Set(s);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  };

  const toggleSel = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <Page active="assets"
      title={galleryMode ? "选择图片素材" : pickMode ? "选择封面" : "素材库"}
      breadcrumb={galleryMode ? '· 可多选 ·  按选择顺序排列' : pickMode ? '· 选一张作为封面' : '· 1,248 项'}
      right={pickMode ? (
        <>
          {galleryMode && selected.size > 0 && (
            <button className="pr-btn primary" onClick={() => {
              // hand back ordered selection
              const ordered = [...selected].map(id => assets.find(a => a.id === id)).filter(Boolean);
              go('editor', { from: 'asset', asset: ordered, target: 'gallery' });
            }}>
              添加到正文 ·  {selected.size}
            </button>
          )}
          <button className="pr-btn" onClick={() => { clearPayload(); go('editor'); }}>取消</button>
        </>
      ) : (
        <>
          <button className="pr-btn">{Icon.sparkle}<span>AI 打标</span></button>
          <button className="pr-btn primary">{Icon.plus}<span>上传</span></button>
        </>
      )}>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* side */}
        <aside>
          <div className="pr-label" style={{ marginBottom: 8 }}>类型</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 22 }}>
            {types.map(t => (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 6,
                fontSize: 13,
                color: type === t.id ? C.ink : C.text2,
                fontWeight: type === t.id ? 600 : 400,
                background: type === t.id ? '#efece4' : 'transparent',
              }}>
                <span>{t.label}</span>
                <span style={{ color: C.text3, fontSize: 11, fontFamily: MONO }}>{t.n}</span>
              </button>
            ))}
          </div>

          <div className="pr-label" style={{ marginBottom: 8 }}>标签</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
            {tags.map(t => (
              <span key={t} className={`pr-pill click ${activeTags.has(t) ? 'active' : ''}`} onClick={() => toggleTag(t)}>#{t}</span>
            ))}
          </div>

          <div className="pr-label" style={{ marginBottom: 8 }}>来源</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['我的上传',  '1,124'],
              ['AI 生成',   '86'],
              ['KOL 投稿',  '38'],
            ].map(([l, n]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.text2, padding: '4px 0' }}>
                <span>{l}</span><span style={{ fontFamily: MONO, color: C.text3, fontSize: 11 }}>{n}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* main grid */}
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: '0 0 320px' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.text3 }}>{Icon.search}</span>
              <input className="pr-input" placeholder="搜索素材，或拖拽上传…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: C.text3 }}>{assets.length} 项</span>
            <span className="pr-pill click active">最新</span>
            <span className="pr-pill click">最常用</span>
          </div>

          {pickMode && (
            <div style={{ padding: '10px 14px', marginBottom: 12, background: C.accentSoft, color: C.accentText, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              {Icon.sparkle}
              <span>{galleryMode ? '可多选 ·  点击勾选 ·  完成后点右上确认' : '选一张图作为编辑器封面 · 点击即可应用'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: C.text3 }}>已编辑内容会保留</span>
            </div>
          )}

          {selected.size > 0 && !pickMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 14, background: C.ink, color: '#fff', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>已选 {selected.size} 项</span>
              <div style={{ flex: 1 }} />
              <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }} onClick={() => go('editor')}>用于编辑器</button>
              <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>添加标签</button>
              <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>下载</button>
              <button className="pr-btn ghost sm" style={{ color: '#fff' }} onClick={() => setSelected(new Set())}>取消</button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {assets.map(a => {
              const on = selected.has(a.id);
              // selection order for gallery mode
              const orderIdx = galleryMode ? [...selected].indexOf(a.id) : -1;
              const handleClick = () => {
                if (galleryMode) {
                  toggleSel(a.id);
                } else if (pickMode) {
                  go('editor', { from: 'asset', asset: a });
                } else {
                  toggleSel(a.id);
                }
              };
              return (
                <div key={a.id} onClick={handleClick} style={{
                  position: 'relative', cursor: 'pointer',
                  borderRadius: 8, overflow: 'hidden',
                  border: `2px solid ${on ? C.ink : 'transparent'}`,
                  transition: 'border-color .12s, transform .12s',
                }}
                  onMouseEnter={e => { if (pickMode && !galleryMode) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (pickMode && !galleryMode) e.currentTarget.style.transform = 'none'; }}>
                  <div style={{
                    width: '100%',
                    aspectRatio: a.aspect,
                    background: `linear-gradient(135deg, hsl(${a.hue} 35% 86%), hsl(${(a.hue + 30) % 360} 30% 75%))`,
                  }} />
                  {/* selection indicator */}
                  {(galleryMode || !pickMode) && (
                    <div style={{ position: 'absolute', top: 6, left: 6 }}>
                      {galleryMode && on ? (
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: C.ink, color: '#fff',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, fontFamily: MONO,
                        }}>{orderIdx + 1}</span>
                      ) : (
                        <span className={`pr-chk ${on ? 'on' : ''}`} style={{ background: on ? C.ink : 'rgba(255,255,255,.85)' }}>{Icon.check}</span>
                      )}
                    </div>
                  )}
                  {pickMode && !galleryMode && (
                    <div style={{ position: 'absolute', top: 6, right: 6, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 12, opacity: 0, transition: 'opacity .15s' }}
                         onMouseEnter={e => e.currentTarget.style.opacity = 1}
                         onMouseLeave={e => e.currentTarget.style.opacity = 0}>使用</div>
                  )}
                  {a.used > 0 && !pickMode && (
                    <div style={{ position: 'absolute', bottom: 6, right: 6, padding: '2px 6px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 10, fontFamily: MONO, borderRadius: 3 }}>
                      ✓ {a.used}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '20px 8px 6px', color: '#fff', fontSize: 10, fontFamily: MONO,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{a.name}</span><span>{a.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { PageAssets });
