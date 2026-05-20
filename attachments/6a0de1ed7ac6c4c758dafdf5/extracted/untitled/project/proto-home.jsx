// proto-home.jsx — 工作台 (Dashboard)

function Sparkline({ points, w = 80, h = 28, up = true }) {
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((p - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  const color = up ? C.good : C.bad;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: w, height: h }}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PageHome() {
  const { go } = useRoute();
  const [todos, setTodos] = React.useState(DATA.todos);
  const toggle = (id) => setTodos(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <Page active="home"
      title="工作台"
      breadcrumb={'· 早上好, Mira'}
      right={<>
        <button className="pr-btn" onClick={() => go('ideas')}>{Icon.plus}<span>新建选题</span></button>
        <button className="pr-btn accent" onClick={() => go('editor')}>{Icon.sparkle}<span>AI 起稿</span></button>
      </>}>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {DATA.kpis.map(k => (
          <div key={k.label} className="pr-card">
            <div className="pr-card-pad" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="pr-label">{k.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, marginTop: 6, letterSpacing: '-0.01em' }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: k.dir === 'up' ? C.good : C.bad, fontWeight: 500, marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {k.dir === 'up' ? Icon.arrowUp : Icon.arrowDown}{k.delta}
                  </div>
                </div>
                <Sparkline points={k.spark} up={k.dir === 'up'} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* main */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* trend chart */}
          <div className="pr-card">
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>跨平台曝光</div>
                <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>近 7 天 ·  对比上周</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="pr-pill active">7 天</span>
                <span className="pr-pill click">30 天</span>
                <span className="pr-pill click">本季</span>
              </div>
            </div>
            <div style={{ padding: 20 }}><MultiLineChart /></div>
          </div>

          {/* recent content */}
          <div className="pr-card">
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>近期内容</div>
              <button className="pr-btn ghost sm" onClick={() => go('publish')}>查看全部 →</button>
            </div>
            <div>
              {DATA.recentContent.map(r => {
                const st = STATUS_LABELS[r.status];
                return (
                  <div key={r.id} className="pr-row hov" style={{ gridTemplateColumns: '40px 1fr 110px 90px 80px' }} onClick={() => go('publish')}>
                    <div style={{ width: 40, height: 40, background: '#efece4', borderRadius: 6 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                      <div style={{ marginTop: 4 }}><PlatformTag id={r.platform} /></div>
                    </div>
                    <span className={`pr-pill ${st.cls}`}>{st.label}</span>
                    <span style={{ fontSize: 12, color: C.text3, fontFamily: MONO }}>{r.when}</span>
                    <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{r.views}</span>
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </Page>
  );
}

// Multi-line area chart for the home dashboard
function MultiLineChart() {
  const lines = [
    { id: 'xhs', label: '小红书',  color: PLATFORMS.xhs.color, points: [22, 28, 25, 36, 33, 42, 48] },
    { id: 'tt',  label: 'TikTok', color: PLATFORMS.tt.color,  points: [18, 26, 30, 35, 40, 38, 46] },
    { id: 'yt',  label: 'YouTube',color: '#666',              points: [8,  10, 12, 14, 13, 17, 20] },
    { id: 'fb',  label: 'Facebook',color: PLATFORMS.fb.color, points: [5,  7,  6,  8,  9,  8,  10] },
  ];
  const days = ['一','二','三','四','五','六','日'];
  const allMax = 50;
  const W = 100, H = 100;
  return (
    <div>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: 200, display: 'block' }}>
        {/* grid */}
        {[0, 15, 30, 45].map(y => (
          <line key={y} x1="0" y1={60 - (y / allMax) * 60} x2="100" y2={60 - (y / allMax) * 60}
            stroke={C.border} strokeWidth="0.2" strokeDasharray="0.5 0.5" />
        ))}
        {lines.map(l => {
          const coords = l.points.map((p, i) => {
            const x = (i / (l.points.length - 1)) * 100;
            const y = 60 - (p / allMax) * 60;
            return `${x},${y}`;
          }).join(' ');
          return <polyline key={l.id} points={coords} fill="none" stroke={l.color} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 4px' }}>
        {days.map(d => <span key={d} style={{ fontSize: 11, color: C.text3, fontFamily: MONO }}>{d}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        {lines.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 2, background: l.color, display: 'inline-block', borderRadius: 1 }} />
            <span style={{ fontSize: 12, color: C.text2 }}>{l.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{l.points[l.points.length - 1]}k</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PageHome, Sparkline });
