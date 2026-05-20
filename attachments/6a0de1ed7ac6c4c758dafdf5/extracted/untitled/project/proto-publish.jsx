// proto-publish.jsx — 发布管理: 队列列表 + 日历视图 + 新建排期 (定时发布)

function PagePublish() {
  const { go } = useRoute();
  const [tab, setTab] = React.useState('all');
  const [selection, setSelection] = React.useState(new Set());
  const [view, setView] = React.useState('list'); // list | calendar
  const [createOpen, setCreateOpen] = React.useState(false);

  // Newly scheduled items via the modal — merged with mock data
  const [extra, setExtra] = React.useState([]);
  const allItems = React.useMemo(() => [...extra, ...DATA.publish], [extra]);

  const filtered = allItems.filter(p => {
    if (tab === 'today') return p.when.startsWith('今日') || p.when.startsWith('已发');
    if (tab === 'week')  return true;
    if (tab === 'pub')   return p.status === 'published';
    return true;
  });

  const toggleSel = (id) => setSelection(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const counts = {
    all:   allItems.length,
    today: allItems.filter(p => p.when.startsWith('今日') || p.when.startsWith('已发')).length,
    week:  allItems.length,
    pub:   allItems.filter(p => p.status === 'published').length,
  };

  const handleCreate = (item) => {
    setExtra(es => [{
      id: 'sch-' + Date.now(),
      when: item.when,
      platform: item.platform,
      title: item.title,
      status: 'scheduled',
      auto: item.auto,
      forecast: '—',
      owner: 'M',
      _new: true,
      _repeat: item.repeat,
    }, ...es]);
    setCreateOpen(false);
  };

  return (
    <Page active="publish"
      title="发布管理"
      breadcrumb={`· 本周 ·  ${allItems.filter(p => p.status !== 'published').length} 项待发`}
      right={<>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: C.surface2, borderRadius: 7, border: `1px solid ${C.border}` }}>
          <button onClick={() => setView('list')} style={{
            all: 'unset', cursor: 'pointer',
            padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500,
            background: view === 'list' ? C.surface : 'transparent',
            color: view === 'list' ? C.text : C.text2,
            boxShadow: view === 'list' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            列表
          </button>
          <button onClick={() => setView('calendar')} style={{
            all: 'unset', cursor: 'pointer',
            padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500,
            background: view === 'calendar' ? C.surface : 'transparent',
            color: view === 'calendar' ? C.text : C.text2,
            boxShadow: view === 'calendar' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            日历
          </button>
        </div>
        <button className="pr-btn primary" onClick={() => setCreateOpen(true)}>{Icon.plus}<span>新建排期</span></button>
      </>}>

      {view === 'list' ? (
        <ListView
          tab={tab} setTab={setTab} counts={counts}
          filtered={filtered} selection={selection} toggleSel={toggleSel}
          setSelection={setSelection} go={go}
        />
      ) : (
        <CalendarView items={allItems} go={go} onNew={() => setCreateOpen(true)} />
      )}

      {createOpen && <NewScheduleModal onClose={() => setCreateOpen(false)} onCreate={handleCreate} />}
    </Page>
  );
}

// ============================================================================
// List view
// ============================================================================
function ListView({ tab, setTab, counts, filtered, selection, toggleSel, setSelection, go }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
        {[
          ['all',    '全部',     counts.all],
          ['today',  '今日',     counts.today],
          ['week',   '本周',     counts.week],
          ['pub',    '已发布',   counts.pub],
        ].map(([id, label, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            all: 'unset', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 6,
            fontSize: 13, fontWeight: tab === id ? 600 : 500,
            color: tab === id ? C.ink : C.text2,
            background: tab === id ? '#efece4' : 'transparent',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span>{label}</span>
            <span style={{ fontSize: 11, color: tab === id ? C.text2 : C.text3, fontFamily: MONO }}>{n}</span>
          </button>
        ))}
      </div>

      {selection.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 12, background: C.ink, color: '#fff', borderRadius: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>已选 {selection.size} 项</span>
          <div style={{ flex: 1 }} />
          <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>修改时间</button>
          <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'rgba(255,255,255,.2)' }}>暂停定时</button>
          <button className="pr-btn ghost sm" style={{ color: '#fff' }} onClick={() => setSelection(new Set())}>取消</button>
        </div>
      )}

      <div className="pr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 130px 110px 1fr 110px 100px 90px 110px', padding: '12px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div></div><div>时间</div><div>平台</div><div>内容</div><div>状态</div><div>定时</div><div>预测</div><div>操作</div>
        </div>
        {filtered.map((p, i) => {
          const st = STATUS_LABELS[p.status];
          const isSel = selection.has(p.id);
          return (
            <div key={p.id} className="pr-row hov" style={{ gridTemplateColumns: '40px 130px 110px 1fr 110px 100px 90px 110px', padding: '12px 18px', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, background: isSel ? C.surface2 : (p._new ? C.accentSoft + '66' : undefined) }} onClick={() => toggleSel(p.id)}>
              <span className={`pr-chk ${isSel ? 'on' : ''}`}>{Icon.check}</span>
              <span style={{ fontSize: 13, fontFamily: MONO, color: C.text, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {p.when}
                {p._repeat && p._repeat !== 'none' && (
                  <span title="重复" style={{ color: C.accent }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  </span>
                )}
              </span>
              <PlatformTag id={p.platform} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 5, background: `linear-gradient(135deg, hsl(${i*40} 35% 88%), hsl(${i*40+30} 30% 78%))`, flex: '0 0 auto' }} />
                <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
              </div>
              <span className={`pr-pill ${st.cls}`}>{st.label}</span>
              <Toggle on={p.auto} />
              <span style={{ fontSize: 12, color: C.text2, fontFamily: MONO }}>{p.forecast}</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcd6c8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{p.owner}</div>
                <button className="pr-btn ghost icon sm" onClick={e => { e.stopPropagation(); go('editor'); }}>✎</button>
                <button className="pr-btn ghost icon sm">{Icon.more}</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: C.text3, display: 'flex', justifyContent: 'space-between' }}>
        <span>共 {filtered.length} 条 ·  定时发布 {filtered.filter(p => p.auto).length} 条</span>
        <span>下次同步: 14:32 · ↻</span>
      </div>
    </>
  );
}

// ============================================================================
// Calendar (week) view
// ============================================================================
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// Map a publish item.when into { day: 0..6, hour: 0..23 } for placement
function parseWhen(when) {
  // Patterns: "今日 21:00", "明日 12:00", "周六 19:00", "已发 ·  14:00"
  const m = when.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  // Day mapping (mock: today=Mon, 明日=Tue)
  let day = 0;
  if (when.startsWith('今日') || when.startsWith('已发')) day = 0;
  else if (when.startsWith('明日')) day = 1;
  else if (when.includes('周二')) day = 1;
  else if (when.includes('周三')) day = 2;
  else if (when.includes('周四')) day = 3;
  else if (when.includes('周五')) day = 4;
  else if (when.includes('周六')) day = 5;
  else if (when.includes('周日') || when.includes('周天')) day = 6;
  return { day, hour, minute: parseInt(m[2], 10) };
}

function CalendarView({ items, go, onNew }) {
  const hours = [9, 12, 15, 18, 21];
  // Group items by day+hour bucket
  const grid = {};
  items.forEach(it => {
    const p = parseWhen(it.when);
    if (!p) return;
    // bucket to nearest displayed hour
    const bucket = hours.reduce((best, h) => Math.abs(h - p.hour) < Math.abs(best - p.hour) ? h : best, hours[0]);
    const key = `${p.day}-${bucket}`;
    (grid[key] = grid[key] || []).push(it);
  });

  return (
    <div className="pr-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* week nav */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="pr-btn ghost icon sm">‹</button>
          <span style={{ fontSize: 13, fontWeight: 600 }}>2026 ·  W20 ·  5月 18 – 24</span>
          <button className="pr-btn ghost icon sm">›</button>
          <button className="pr-btn ghost sm" style={{ marginLeft: 6 }}>今天</button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 11, color: C.text3, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: PLATFORMS.xhs.color }} />小红书
          </span>
          <span style={{ fontSize: 11, color: C.text3, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: PLATFORMS.tt.color }} />TikTok
          </span>
          <span style={{ fontSize: 11, color: C.text3, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#666' }} />YouTube
          </span>
          <span style={{ fontSize: 11, color: C.text3, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: PLATFORMS.fb.color }} />Facebook
          </span>
        </div>
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: `1px solid ${C.border}` }}>
        <div />
        {WEEKDAYS.map((d, i) => (
          <div key={d} style={{
            padding: '10px 8px', borderLeft: `1px solid ${C.border}`,
            textAlign: 'center',
            background: i === 0 ? C.accentSoft : 'transparent',
          }}>
            <div style={{ fontSize: 11, color: C.text3 }}>{d}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, color: i === 0 ? C.accentText : C.text }}>{18 + i}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div style={{ padding: '8px 8px 0 0', textAlign: 'right', borderTop: hi === 0 ? 'none' : `1px solid ${C.border}`, color: C.text3, fontFamily: MONO, fontSize: 10 }}>
              {String(h).padStart(2, '0')}:00
            </div>
            {WEEKDAYS.map((_, di) => {
              const list = grid[`${di}-${h}`] || [];
              return (
                <div key={di} style={{
                  borderLeft: `1px solid ${C.border}`,
                  borderTop: hi === 0 ? 'none' : `1px dashed ${C.border}`,
                  minHeight: 86, padding: 6,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  position: 'relative',
                  cursor: list.length === 0 ? 'pointer' : 'default',
                  background: list.length === 0 ? 'transparent' : C.surface,
                  transition: 'background .12s',
                }}
                  onMouseEnter={e => { if (list.length === 0) e.currentTarget.style.background = C.surface2; }}
                  onMouseLeave={e => { if (list.length === 0) e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => list.length === 0 && onNew()}>
                  {list.map(it => {
                    const color = ({ xhs: PLATFORMS.xhs.color, tt: PLATFORMS.tt.color, yt: '#666', fb: PLATFORMS.fb.color })[it.platform];
                    return (
                      <div key={it.id} onClick={(e) => { e.stopPropagation(); go('editor'); }}
                        style={{
                          padding: '5px 7px', borderRadius: 4,
                          background: '#fff', borderLeft: `3px solid ${color}`,
                          fontSize: 11, lineHeight: 1.3,
                          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.text3 }}>{(parseWhen(it.when) || {}).hour || ''}:{String((parseWhen(it.when) || {}).minute || 0).padStart(2, '0')}</div>
                        <div style={{ fontWeight: 500, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</div>
                      </div>
                    );
                  })}
                  {list.length === 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text3, fontSize: 16, opacity: 0, transition: 'opacity .12s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 0.5}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>+</div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.text3, display: 'flex', justifyContent: 'space-between' }}>
        <span>共 {items.length} 个排期 ·  点击空格可新建</span>
        <span>每个色块 = 1 个平台</span>
      </div>
    </div>
  );
}

function Toggle({ on }) {
  return (
    <span style={{ width: 30, height: 16, borderRadius: 10, background: on ? C.ink : '#e0ddd5', position: 'relative', display: 'inline-block', transition: 'background .15s' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
    </span>
  );
}

// ============================================================================
// New Schedule Modal — pick content + timed publish
// ============================================================================

// Mock drafts available to schedule (would be fetched from drafts page in real)
const DRAFTS = [
  { id: 'd1', title: '¥200 露营 5 件套清单 ·  独居女生第一次', platform: 'xhs', mode: 'mix',   updated: '14:33' },
  { id: 'd2', title: '夏日防晒 5 条铁律',                     platform: 'xhs', mode: 'text',  updated: '13:50' },
  { id: 'd3', title: 'Camping Gear Unboxing',               platform: 'yt',  mode: 'video', updated: '昨日 17:30' },
  { id: 'd4', title: '通勤穿搭 ·  一周不撞衫',                platform: 'tt',  mode: 'video', updated: '昨日 14:20' },
  { id: 'd5', title: '家庭周末露营方案 ·  亲子向',            platform: 'fb',  mode: 'mix',   updated: '前日' },
];

const QUICK_TIMES = [
  { id: 'now',   label: '立即发布' },
  { id: 't1900', label: '今晚 19:00 ·  黄金时段' },
  { id: 't2100', label: '今晚 21:00 ·  晚高峰' },
  { id: 'tom08', label: '明早 08:00 ·  通勤' },
  { id: 'best',  label: 'AI 推荐时段', accent: true },
  { id: 'custom',label: '自定义…' },
];

const REPEAT_OPTIONS = [
  { id: 'none',    label: '不重复' },
  { id: 'daily',   label: '每天' },
  { id: 'weekly',  label: '每周同一天' },
  { id: 'workday', label: '工作日' },
];

function NewScheduleModal({ onClose, onCreate }) {
  const [step, setStep] = React.useState(1); // 1: pick content  2: pick time
  const [draftId, setDraftId] = React.useState(DRAFTS[0].id);
  const [platforms, setPlatforms] = React.useState(new Set([DRAFTS[0].platform]));
  const [quick, setQuick] = React.useState('t2100');
  const [customDate, setCustomDate] = React.useState('2026-05-20');
  const [customTime, setCustomTime] = React.useState('21:00');
  const [repeat, setRepeat] = React.useState('none');
  const [auto, setAuto] = React.useState(true);
  const [notify, setNotify] = React.useState(true);

  // When draft changes, sync default platform
  React.useEffect(() => {
    const d = DRAFTS.find(x => x.id === draftId);
    if (d) setPlatforms(new Set([d.platform]));
  }, [draftId]);

  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const draft = DRAFTS.find(d => d.id === draftId);
  const togglePlatform = (id) => setPlatforms(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const whenLabel = () => {
    if (quick === 'now')   return '立即发布';
    if (quick === 't1900') return '今日 19:00';
    if (quick === 't2100') return '今日 21:00';
    if (quick === 'tom08') return '明日 08:00';
    if (quick === 'best')  return '今晚 22:30 ·  AI';
    return `${customDate} ${customTime}`;
  };

  const submit = () => {
    const platformList = [...platforms];
    platformList.forEach(p => {
      onCreate({
        when: whenLabel(),
        platform: p,
        title: draft.title,
        auto,
        repeat,
      });
    });
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(20,16,8,0.4)', animation: 'pr-fade .15s ease-out' }} />
      <div style={{
        position: 'relative', width: 640, maxHeight: 'calc(100vh - 48px)',
        background: C.surface, borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-zoom-in .18s cubic-bezier(.2,.7,.2,1)',
      }}>
        {/* header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>新建发布排期</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              {step === 1 ? '选择要发布的内容和目标平台' : '设置发布时间，可选定时与重复'}
            </p>
          </div>
          <button className="pr-btn ghost icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
          <StepDot n={1} on={step === 1} done={step > 1} label="选内容" onClick={() => setStep(1)} />
          <span style={{ flex: 1, height: 1, background: C.border }} />
          <StepDot n={2} on={step === 2} done={false} label="定时间" onClick={() => draft && setStep(2)} />
        </div>

        {/* body */}
        <div className="pr-scroll" style={{ padding: '18px 22px', overflow: 'auto', flex: '1 1 auto', minHeight: 280 }}>
          {step === 1 && (
            <Step1 draftId={draftId} setDraftId={setDraftId} draft={draft} platforms={platforms} togglePlatform={togglePlatform} />
          )}
          {step === 2 && (
            <Step2
              draft={draft}
              platforms={platforms}
              quick={quick} setQuick={setQuick}
              customDate={customDate} setCustomDate={setCustomDate}
              customTime={customTime} setCustomTime={setCustomTime}
              repeat={repeat} setRepeat={setRepeat}
              auto={auto} setAuto={setAuto}
              notify={notify} setNotify={setNotify}
            />
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface2, borderRadius: '0 0 12px 12px' }}>
          <span style={{ fontSize: 11, color: C.text3 }}>
            {step === 1
              ? (platforms.size > 0 ? `1 篇 ×  ${platforms.size} 平台` : '请选择平台')
              : `${whenLabel()} ·  ${platforms.size} 平台 ·  ${REPEAT_OPTIONS.find(r => r.id === repeat).label}`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pr-btn" onClick={onClose}>取消</button>
            {step === 1 ? (
              <button className="pr-btn primary" disabled={!draft || platforms.size === 0} onClick={() => setStep(2)} style={{ opacity: (!draft || platforms.size === 0) ? 0.4 : 1, cursor: (!draft || platforms.size === 0) ? 'not-allowed' : 'pointer' }}>
                下一步 →
              </button>
            ) : (
              <>
                <button className="pr-btn" onClick={() => setStep(1)}>← 上一步</button>
                <button className="pr-btn primary" onClick={submit}>
                  {quick === 'now' ? '立即发布' : '加入排期'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StepDot({ n, on, done, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        background: on || done ? C.ink : C.surface,
        border: `1.5px solid ${on || done ? C.ink : C.borderStrong}`,
        color: on || done ? '#fff' : C.text3,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, fontFamily: MONO,
      }}>{done ? Icon.check : n}</span>
      <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, color: on ? C.ink : C.text2 }}>{label}</span>
    </button>
  );
}

function Step1({ draftId, setDraftId, draft, platforms, togglePlatform }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="pr-label" style={{ marginBottom: 8 }}>选择草稿</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 8 }}>
          {DRAFTS.map(d => {
            const on = draftId === d.id;
            const modeLabel = ({ text: '纯文字', mix: '图文', video: '视频' })[d.mode];
            return (
              <button key={d.id} onClick={() => setDraftId(d.id)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 14px',
                display: 'flex', gap: 12, alignItems: 'center',
                background: on ? C.surface2 : 'transparent',
                borderLeft: `3px solid ${on ? C.ink : 'transparent'}`,
              }}>
                <span className={`pr-chk ${on ? 'on' : ''}`} style={{ borderRadius: '50%' }}>{Icon.check}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                    <PlatformTag id={d.platform} />
                    <span style={{ fontSize: 11, color: C.text3 }}>·  {modeLabel}</span>
                    <span style={{ fontSize: 11, color: C.text3 }}>·  {d.updated}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="pr-label" style={{ marginBottom: 8 }}>发布到哪些平台</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {Object.entries(PLATFORMS).map(([id, p]) => {
            const on = platforms.has(id);
            const primary = draft?.platform === id;
            return (
              <button key={id} onClick={() => togglePlatform(id)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 12px', border: `1px solid ${on ? C.ink : C.border}`,
                background: on ? '#efece4' : C.surface,
                borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8,
                position: 'relative',
              }}>
                <span className={`pr-chk ${on ? 'on' : ''}`}>{Icon.check}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{p.label}</span>
                {primary && <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 9, color: C.accentText }}>原平台</span>}
              </button>
            );
          })}
        </div>
        {platforms.size > 1 && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: C.accentSoft, color: C.accentText, fontSize: 12, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icon.sparkle}<span>选择多个平台时，AI 会自动按每个平台风格改写</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Step2({ draft, platforms, quick, setQuick, customDate, setCustomDate, customTime, setCustomTime, repeat, setRepeat, auto, setAuto, notify, setNotify }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Selected content preview */}
      <div style={{ padding: 10, background: C.surface2, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 5, background: 'linear-gradient(135deg, hsl(28 50% 86%), hsl(8 45% 78%))' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{draft.title}</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{[...platforms].map(p => PLATFORMS[p].label).join(' ·  ')}</div>
        </div>
      </div>

      <div>
        <div className="pr-label" style={{ marginBottom: 8 }}>发布时间</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {QUICK_TIMES.map(t => {
            const on = quick === t.id;
            return (
              <button key={t.id} onClick={() => setQuick(t.id)} style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 14px', borderRadius: 7,
                border: `1px solid ${on ? C.ink : C.border}`,
                background: on ? '#efece4' : (t.accent ? C.accentSoft : C.surface),
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `1.5px solid ${on ? C.ink : C.borderStrong}`,
                  background: on ? C.ink : C.surface,
                  position: 'relative',
                }}>
                  {on && <span style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: '#fff' }} />}
                </span>
                <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, color: t.accent && !on ? C.accentText : C.text }}>
                  {t.accent && '✦ '}{t.label}
                </span>
              </button>
            );
          })}
        </div>

        {quick === 'custom' && (
          <div style={{ marginTop: 10, padding: 14, border: `1px solid ${C.border}`, borderRadius: 7, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div className="pr-label" style={{ marginBottom: 6 }}>日期</div>
              <input className="pr-input" type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="pr-label" style={{ marginBottom: 6 }}>时间</div>
              <input className="pr-input" type="time" value={customTime} onChange={e => setCustomTime(e.target.value)} />
            </div>
          </div>
        )}

        {quick === 'best' && (
          <div style={{ marginTop: 10, padding: 12, background: C.accentSoft, color: C.accentText, fontSize: 12, borderRadius: 6, lineHeight: 1.5 }}>
            <strong>✦ AI 推荐：</strong>基于你过往 30 天数据 + 平台流量曲线，
            建议 <strong style={{ color: C.text }}>今晚 22:30</strong> 发布
            （小红书晚高峰 ·  互动率比 21:00 高 14%）
          </div>
        )}
      </div>

      {/* Repeat */}
      <div>
        <div className="pr-label" style={{ marginBottom: 8 }}>重复</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {REPEAT_OPTIONS.map(r => (
            <span key={r.id} className={`pr-pill click ${repeat === r.id ? 'active' : ''}`} onClick={() => setRepeat(r.id)}>{r.label}</span>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ToggleRow
          title="到点自动发布"
          desc="到达预定时间后系统自动推送到平台 ·  无需手动确认"
          on={auto && quick !== 'now'} disabled={quick === 'now'} onChange={setAuto}
        />
        <ToggleRow
          title="发布前 10 分钟通知"
          desc="桌面 + 邮件提醒，便于最后检查"
          on={notify && quick !== 'now'} disabled={quick === 'now'} onChange={setNotify}
        />
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, on, disabled, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, opacity: disabled ? 0.4 : 1 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{desc}</div>
      </div>
      <button onClick={() => !disabled && onChange(!on)} style={{ all: 'unset', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <span style={{ width: 32, height: 18, borderRadius: 9, background: on ? C.ink : '#dcd6c8', position: 'relative', display: 'inline-block', transition: 'background .15s' }}>
          <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
        </span>
      </button>
    </div>
  );
}

Object.assign(window, { PagePublish });
