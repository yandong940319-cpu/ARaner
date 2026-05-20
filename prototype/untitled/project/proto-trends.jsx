// proto-trends.jsx — 热点分析: 跨平台对比表 + 新建追踪侧边抽屉

function PageTrends() {
  const { go } = useRoute();
  const [q, setQ] = React.useState('');
  const [favOnly, setFavOnly] = React.useState(false);
  const [favs, setFavs] = React.useState(new Set(DATA.trends.filter(t => t.fav).map(t => t.id)));
  const [activePlatform, setActivePlatform] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('growth');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [extraRows, setExtraRows] = React.useState([]); // newly tracked topics

  const rows = React.useMemo(() => {
    let r = [...extraRows, ...DATA.trends];
    if (q) r = r.filter(t => t.topic.includes(q) || t.tags.some(tag => tag.includes(q)));
    if (favOnly) r = r.filter(t => favs.has(t.id));
    if (sortBy === 'growth') r.sort((a, b) => b.growth - a.growth);
    return r;
  }, [q, favOnly, favs, sortBy, extraRows]);

  const toggleFav = (id) => {
    setFavs(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleCreate = (data) => {
    const id = 'new-' + Date.now();
    setExtraRows(rs => [{
      id,
      topic: data.topic.startsWith('#') ? data.topic : '#' + data.topic,
      tags: data.category ? [data.category] : ['新建'],
      growth: 0,
      fav: true,
      per: { xhs: null, yt: null, tt: null, fb: null },
      _new: true,
    }, ...rs]);
    setFavs(s => { const n = new Set(s); n.add(id); return n; });
    setDrawerOpen(false);
  };

  return (
    <Page active="trends"
      title="热点分析"
      breadcrumb={'· 跨平台话题趋势'}
      right={<>
        <button className="pr-btn primary" onClick={() => setDrawerOpen(true)}>{Icon.plus}<span>新建追踪</span></button>
      </>}>

      {/* filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 320px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.text3 }}>{Icon.search}</span>
          <input className="pr-input" placeholder="搜索话题、关键词、标签..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['all',  '全部'],
            ['xhs',  '小红书'],
            ['yt',   'YouTube'],
            ['tt',   'TikTok'],
            ['fb',   'Facebook'],
          ].map(([id, label]) => (
            <span key={id} className={`pr-pill click ${activePlatform === id ? 'active' : ''}`} onClick={() => setActivePlatform(id)}>{label}</span>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: C.border }} />
        <span className={`pr-pill click ${favOnly ? 'active' : ''}`} onClick={() => setFavOnly(f => !f)}>★ 仅收藏</span>
      </div>

      {/* table */}
      <div className="pr-card" style={{ padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr repeat(4, 1fr) 120px', padding: '12px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div></div>
          <div>话题</div>
          <div>综合涨幅</div>
          <div>小红书</div>
          <div>YouTube</div>
          <div>TikTok</div>
          <div>Facebook</div>
          <div>操作</div>
        </div>
        {rows.map((t, i) => (
          <div key={t.id} className="pr-row" style={{ gridTemplateColumns: '40px 2fr 1fr repeat(4, 1fr) 120px', padding: '14px 18px', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, background: t._new ? C.accentSoft + '66' : undefined }}>
            <div onClick={() => toggleFav(t.id)} style={{ cursor: 'pointer', color: favs.has(t.id) ? C.accent : C.text3, fontSize: 16, lineHeight: 1 }}>
              {favs.has(t.id) ? '★' : '☆'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t.topic}
                {t._new && <span className="pr-pill accent" style={{ height: 18, fontSize: 10 }}>新追踪</span>}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                {t.tags.map(tag => <span key={tag} className="pr-pill" style={{ height: 18, fontSize: 10 }}>{tag}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {t._new ? (
                <span style={{ fontSize: 12, color: C.text3, fontFamily: MONO }}>采集中…</span>
              ) : (
                <>
                  <span style={{ fontWeight: 600, color: C.good, fontVariantNumeric: 'tabular-nums', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    {Icon.arrowUp}+{t.growth}%
                  </span>
                  <div style={{ flex: 1, maxWidth: 60, height: 4, background: C.border, borderRadius: 2 }}>
                    <div style={{ width: `${Math.min(100, t.growth / 3)}%`, height: '100%', background: C.ink, borderRadius: 2 }} />
                  </div>
                </>
              )}
            </div>
            {['xhs','yt','tt','fb'].map(p => <PerCell key={p} v={t.per[p]} />)}
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pr-btn sm" onClick={() => go('ideas')}>选题</button>
              <button className="pr-btn ghost sm icon">{Icon.more}</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: C.text3, fontSize: 13 }}>没有匹配的话题</div>
        )}
      </div>

      {/* legend */}
      <div style={{ marginTop: 14, fontSize: 11, color: C.text3, display: 'flex', gap: 16 }}>
        <span>共 {rows.length} 个热点 · 数据更新于 14:32</span>
        <span>· 灰色 — 该平台无显著数据</span>
        <span>· 红色 — 下滑</span>
      </div>

      {drawerOpen && <NewTrackDrawer onClose={() => setDrawerOpen(false)} onCreate={handleCreate} />}
    </Page>
  );
}

function PerCell({ v }) {
  if (v == null) return <span style={{ color: C.text3, fontFamily: MONO, fontSize: 13 }}>·</span>;
  const neg = v < 0;
  return (
    <span style={{
      fontSize: 13, fontVariantNumeric: 'tabular-nums',
      color: neg ? C.bad : C.text,
      fontWeight: neg ? 500 : 400,
    }}>{neg ? '' : '+'}{v}%</span>
  );
}

// ============================================================================
// New Track drawer
// ============================================================================
function NewTrackDrawer({ onClose, onCreate }) {
  const [topic, setTopic] = React.useState('');
  const [keywordInput, setKeywordInput] = React.useState('');
  const [keywords, setKeywords] = React.useState([]);
  const [excludes, setExcludes] = React.useState([]);
  const [excludeInput, setExcludeInput] = React.useState('');
  const [platforms, setPlatforms] = React.useState(new Set(['xhs','tt','yt','fb']));
  const [category, setCategory] = React.useState('');
  const [notifyGrowth, setNotifyGrowth] = React.useState(true);
  const [growthThreshold, setGrowthThreshold] = React.useState(50);
  const [notifyTop, setNotifyTop] = React.useState(false);
  const [notifyKol, setNotifyKol] = React.useState(true);

  // AI suggestions for related keywords (deterministic based on topic)
  const aiSuggestions = React.useMemo(() => {
    if (!topic) return [];
    const map = {
      '露营': ['轻露营','野餐','户外','装备','帐篷','营地','治愈'],
      '穿搭': ['通勤','OOTD','复古','韩系','BM 风','基础款'],
      '美妆': ['早c晚a','底妆','口红','护肤','妆容','男士护肤'],
      'walk': ['city walk','citywalk','散步','街拍','上海','北京'],
      '美食': ['探店','家常菜','一人食','减脂餐','meal prep'],
    };
    for (const [k, v] of Object.entries(map)) {
      if (topic.includes(k)) return v;
    }
    return ['周末','治愈','vlog','女生','平价','干货','测评'];
  }, [topic]);

  const addKeyword = (k) => {
    k = k.trim().replace(/^#/, '');
    if (!k) return;
    if (keywords.includes(k)) return;
    setKeywords(ks => [...ks, k]);
  };
  const addExclude = (k) => {
    k = k.trim();
    if (!k || excludes.includes(k)) return;
    setExcludes(xs => [...xs, k]);
  };

  const togglePlatform = (id) => {
    setPlatforms(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const canCreate = topic.trim().length > 0 && platforms.size > 0;

  // ESC closes
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100 }}>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(20,16,8,0.35)',
        animation: 'pr-fade .15s ease-out',
      }} />
      {/* drawer */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 480, background: C.surface,
        boxShadow: '-12px 0 40px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-slide-in .22s cubic-bezier(.2,.7,.2,1)',
      }}>
        {/* header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>新建话题追踪</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>定义你想监控的话题，系统将每 30 分钟更新一次跨平台数据</p>
          </div>
          <button className="pr-btn ghost icon" onClick={onClose} aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* body */}
        <div className="pr-scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          <Field label="话题名称" required hint="将在表格中作为这一行的标题显示">
            <input className="pr-input" placeholder="例如：city walk" value={topic} onChange={e => setTopic(e.target.value)} autoFocus />
          </Field>

          <Field label="关键词" hint="任一关键词命中即计入。回车添加。">
            <TagInput
              value={keywordInput}
              onChange={setKeywordInput}
              tags={keywords}
              onAdd={addKeyword}
              onRemove={k => setKeywords(ks => ks.filter(x => x !== k))}
              placeholder="输入关键词后回车"
            />
            {aiSuggestions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.accentText, marginBottom: 6 }}>
                  {Icon.sparkle}<span style={{ fontWeight: 500 }}>AI 推荐</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {aiSuggestions.filter(s => !keywords.includes(s)).map(s => (
                    <button key={s} className="pr-pill click" onClick={() => addKeyword(s)} style={{ border: `1px dashed ${C.borderStrong}`, cursor: 'pointer' }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Field>

          <Field label="排除词" hint="包含这些词的内容将被过滤掉，避免噪音">
            <TagInput
              value={excludeInput}
              onChange={setExcludeInput}
              tags={excludes}
              onAdd={addExclude}
              onRemove={k => setExcludes(xs => xs.filter(x => x !== k))}
              placeholder="例如：广告、招聘"
            />
          </Field>

          <Field label="监控平台" required>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
              {Object.entries(PLATFORMS).map(([id, p]) => {
                const on = platforms.has(id);
                return (
                  <button key={id} onClick={() => togglePlatform(id)} style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '10px 12px', border: `1px solid ${on ? C.ink : C.border}`,
                    background: on ? '#efece4' : C.surface,
                    borderRadius: 7, display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span className={`pr-chk ${on ? 'on' : ''}`}>{Icon.check}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="赛道分类" hint="便于在表格里按赛道筛选">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['美妆','穿搭','美食','旅行','户外','家居','数码','生活','母婴','宠物'].map(c => (
                <span key={c} className={`pr-pill click ${category === c ? 'active' : ''}`} onClick={() => setCategory(category === c ? '' : c)}>{c}</span>
              ))}
            </div>
          </Field>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <div className="pr-label" style={{ marginBottom: 12 }}>通知设置</div>

            <NotifyRow
              title="涨幅触发"
              desc={`当 24h 涨幅超过 ${growthThreshold}% 时通知`}
              on={notifyGrowth}
              onChange={setNotifyGrowth}>
              <input type="range" min="20" max="200" step="10" value={growthThreshold}
                onChange={e => setGrowthThreshold(+e.target.value)}
                disabled={!notifyGrowth}
                style={{ width: '100%', marginTop: 8, accentColor: C.ink }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, fontFamily: MONO }}>
                <span>20%</span><span style={{ fontWeight: 600, color: notifyGrowth ? C.ink : C.text3 }}>{growthThreshold}%</span><span>200%</span>
              </div>
            </NotifyRow>

            <NotifyRow
              title="进入榜单"
              desc="当话题首次冲进某平台 Top 10 时通知"
              on={notifyTop}
              onChange={setNotifyTop} />

            <NotifyRow
              title="头部 KOL 入场"
              desc="当 100w+ 粉丝创作者首次使用相关关键词时通知"
              on={notifyKol}
              onChange={setNotifyKol} />
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center', background: C.surface2 }}>
          <span style={{ fontSize: 11, color: C.text3, marginRight: 'auto' }}>
            {keywords.length} 关键词 · {platforms.size} 平台 · {(notifyGrowth ? 1 : 0) + (notifyTop ? 1 : 0) + (notifyKol ? 1 : 0)} 通知规则
          </span>
          <button className="pr-btn" onClick={onClose}>取消</button>
          <button className="pr-btn primary" disabled={!canCreate} onClick={() => onCreate({ topic, keywords, excludes, platforms, category, notifyGrowth, growthThreshold, notifyTop, notifyKol })} style={{ opacity: canCreate ? 1 : 0.4, cursor: canCreate ? 'pointer' : 'not-allowed' }}>
            创建追踪
          </button>
        </div>
      </div>
      <style>{`
        @keyframes pr-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pr-slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>,
    document.body
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span className="pr-label">{label}{required && <span style={{ color: C.accent, marginLeft: 4 }}>*</span>}</span>
        {hint && <span style={{ fontSize: 11, color: C.text3, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TagInput({ value, onChange, tags, onAdd, onRemove, placeholder }) {
  const submit = () => { onAdd(value); onChange(''); };
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 6, padding: 6,
      display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 38,
      background: C.surface, alignItems: 'center',
    }}>
      {tags.map(t => (
        <span key={t} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 6px 4px 10px', background: '#efece4',
          borderRadius: 4, fontSize: 12, fontWeight: 500,
        }}>
          {t}
          <button onClick={() => onRemove(t)} style={{
            all: 'unset', cursor: 'pointer', width: 16, height: 16, borderRadius: 3,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: C.text2,
          }} aria-label="移除">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </span>
      ))}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
          if (e.key === 'Backspace' && !value && tags.length) { onRemove(tags[tags.length - 1]); }
        }}
        placeholder={tags.length ? '' : placeholder}
        style={{
          flex: 1, minWidth: 100, border: 'none', outline: 'none',
          fontSize: 13, fontFamily: FONT, background: 'transparent',
          padding: '4px 6px',
        }}
      />
    </div>
  );
}

function NotifyRow({ title, desc, on, onChange, children }) {
  return (
    <div style={{ padding: '12px 0', borderTop: `1px dashed ${C.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{desc}</div>
        </div>
        <button onClick={() => onChange(!on)} style={{ all: 'unset', cursor: 'pointer' }}>
          <span style={{ width: 32, height: 18, borderRadius: 9, background: on ? C.ink : '#dcd6c8', position: 'relative', display: 'inline-block', transition: 'background .15s' }}>
            <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </span>
        </button>
      </div>
      {on && children && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}

Object.assign(window, { PageTrends });
