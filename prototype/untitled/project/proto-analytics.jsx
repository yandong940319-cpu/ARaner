// proto-analytics.jsx — 数据分析: KPI + 图表

function PageAnalytics() {
  const { go } = useRoute();
  const [range, setRange] = React.useState('week');

  return (
    <Page active="analytics"
      title="数据分析"
      breadcrumb={'· W20 ·  对比 W19'}
      right={<>
        <button className="pr-btn">对比期</button>
        <button className="pr-btn">导出 PDF</button>
      </>}>

      {/* range tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[['week','本周'],['month','本月'],['quarter','本季'],['custom','自定义']].map(([id, label]) => (
          <span key={id} className={`pr-pill click ${range === id ? 'active' : ''}`} onClick={() => setRange(id)}>{label}</span>
        ))}
      </div>

      {/* KPI cards (with sparklines) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: '总曝光',   value: '1.24M', delta: '+18%', dir: 'up',   spark: [40,55,42,68,72,98,86] },
          { label: '总互动',   value: '58.4k', delta: '+22%', dir: 'up',   spark: [30,38,35,52,48,68,72] },
          { label: '新增粉丝', value: '+820',  delta: '+12%', dir: 'up',   spark: [60,72,68,80,85,92,88] },
          { label: '转化',     value: '320',   delta: '-4%',  dir: 'down', spark: [80,75,72,65,58,52,46] },
        ].map(k => (
          <div key={k.label} className="pr-card">
            <div style={{ padding: 16 }}>
              <div className="pr-label">{k.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>{k.value}</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 18 }}>
        {/* exposure trend */}
        <div className="pr-card">
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>互动量趋势</div>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>每日 ·  分平台</div>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: C.text2 }}>
              <Legend color={PLATFORMS.xhs.color} label="小红书" />
              <Legend color={PLATFORMS.tt.color} label="TikTok" />
              <Legend color="#666" label="YouTube" />
              <Legend color={PLATFORMS.fb.color} label="Facebook" />
            </div>
          </div>
          <div style={{ padding: 20 }}><MultiLineChart /></div>
        </div>

        {/* platform donut */}
        <div className="pr-card">
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>平台占比</div>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>总曝光分布</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <Donut data={[
              { color: PLATFORMS.xhs.color, value: 40, label: '小红书' },
              { color: PLATFORMS.tt.color,  value: 24, label: 'TikTok' },
              { color: '#666',              value: 20, label: 'YouTube' },
              { color: PLATFORMS.fb.color,  value: 16, label: 'Facebook' },
            ]} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { color: PLATFORMS.xhs.color, label: '小红书',  val: '40%' },
                { color: PLATFORMS.tt.color,  label: 'TikTok',  val: '24%' },
                { color: '#666',              label: 'YouTube', val: '20%' },
                { color: PLATFORMS.fb.color,  label: 'Facebook',val: '16%' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                    {r.label}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500 }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top content table */}
      <div className="pr-card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>本周 Top 内容</div>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>按曝光排序</div>
          </div>
          <button className="pr-btn ghost sm">查看全部 →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 2fr 1fr 1.2fr 0.8fr 0.8fr 90px', padding: '10px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>#</div>
          <div>平台</div>
          <div>内容</div>
          <div>曝光</div>
          <div>互动率</div>
          <div>涨粉</div>
          <div>评论</div>
          <div></div>
        </div>
        {DATA.topContent.slice(0, 6).map((c, i) => (
          <div key={c.id} className="pr-row hov" style={{ gridTemplateColumns: '40px 60px 2fr 1fr 1.2fr 0.8fr 0.8fr 90px', padding: '12px 18px', borderTop: `1px solid ${C.border}` }} onClick={() => go('editor')}>
            <span style={{ fontSize: 18, fontWeight: i < 3 ? 700 : 500, color: i < 3 ? C.ink : C.text3, fontFamily: MONO }}>{i + 1}</span>
            <PlatformTag id={c.platform} withLabel={false} size={14} />
            <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
            <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtK(c.views)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', width: 36 }}>{c.ie}%</span>
              <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, maxWidth: 80 }}>
                <div style={{ width: `${Math.min(100, c.ie * 11)}%`, height: '100%', background: C.ink, borderRadius: 2 }} />
              </div>
            </div>
            <span style={{ fontSize: 13, color: C.good, fontVariantNumeric: 'tabular-nums' }}>+{c.follows}</span>
            <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: C.text2 }}>{c.comments}</span>
            <button className="pr-btn sm">复用</button>
          </div>
        ))}
      </div>
    </Page>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 2, background: color, borderRadius: 1 }} />{label}
    </span>
  );
}

function Donut({ data, size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 14;
  const C2 = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="14" />
      {data.map((d, i) => {
        const len = (d.value / total) * C2;
        const el = (
          <circle key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={d.color} strokeWidth="14"
            strokeDasharray={`${len} ${C2 - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += len;
        return el;
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, fill: C.text }}>1.24M</text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" style={{ fontSize: 10, fontFamily: MONO, fill: C.text3 }}>total</text>
    </svg>
  );
}

Object.assign(window, { PageAnalytics });
