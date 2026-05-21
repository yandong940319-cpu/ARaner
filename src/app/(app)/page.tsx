'use client';

import { useRouter } from 'next/navigation';
import { colors } from '@/lib/design-tokens';

const KPI_DATA = [
  { label: '总曝光', value: '1.24M', delta: '+18%', dir: 'up', spark: [40, 55, 42, 68, 72, 98, 86] },
  { label: '总互动', value: '58.4k', delta: '+22%', dir: 'up', spark: [30, 38, 35, 52, 48, 68, 72] },
  { label: '新增粉丝', value: '+820', delta: '+12%', dir: 'up', spark: [60, 72, 68, 80, 85, 92, 88] },
  { label: '转化', value: '320', delta: '-4%', dir: 'down', spark: [80, 75, 72, 65, 58, 52, 46] },
];

const RECENT_CONTENT = [
  { id: 'r1', title: '¥200 露营 5 件套清单 · 独居女生第一次', platform: 'xhs', status: 'published', when: '今日 14:30', views: '12.4k' },
  { id: 'r2', title: '通勤穿搭 7 天不重样 · 胶囊衣柜', platform: 'xhs', status: 'scheduled', when: '明日 10:00', views: '—' },
  { id: 'r3', title: '早 C 晚 A 新手攻略', platform: 'xhs', status: 'draft', when: '3 小时前编辑', views: '—' },
  { id: 'r4', title: 'City Walk 上海路线', platform: 'tt', status: 'published', when: '昨日 18:20', views: '8.2k' },
];

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  xhs: { label: '小红书', color: '#ff2741' },
  yt: { label: 'YouTube', color: '#ff0000' },
  tt: { label: 'TikTok', color: '#1a1a1a' },
  fb: { label: 'Facebook', color: '#1877f2' },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: '' },
  scheduled: { label: '已排期', cls: 'warn' },
  published: { label: '已发布', cls: 'good' },
};

const PLATFORM_LINES = [
  { id: 'xhs', label: '小红书', color: '#ff2741', points: [22, 28, 25, 36, 33, 42, 48] },
  { id: 'tt', label: 'TikTok', color: '#1a1a1a', points: [18, 26, 30, 35, 40, 38, 46] },
  { id: 'yt', label: 'YouTube', color: '#666', points: [8, 10, 12, 14, 13, 17, 20] },
  { id: 'fb', label: 'Facebook', color: '#1877f2', points: [5, 7, 6, 8, 9, 8, 10] },
];

const DAYS = ['一', '二', '三', '四', '五', '六', '日'];

function Sparkline({ points, w = 80, h = 28, up = true }: { points: number[]; w?: number; h?: number; up?: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((p - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: w, height: h }}>
      <polyline points={coords} fill="none" stroke={up ? '#2f7a4f' : '#b03a3a'} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>工作台</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>· 早上好, Mira</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pr-btn" onClick={() => router.push('/ideas')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <span>新建选题</span>
          </button>
          <button className="pr-btn accent" onClick={() => router.push('/editor')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>
            <span>AI 起稿</span>
          </button>
        </div>
      </div>

      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {KPI_DATA.map(k => (
            <div key={k.label} className="pr-card">
              <div style={{ padding: 16 }}>
                <div className="pr-label">{k.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 600, marginTop: 6, letterSpacing: '-0.01em' }}>{k.value}</div>
                    <div style={{
                      fontSize: 12, color: k.dir === 'up' ? colors.good : colors.bad, fontWeight: 500, marginTop: 2,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d={k.dir === 'up' ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M19 12l-7 7-7-7'} />
                      </svg>
                      {k.delta}
                    </div>
                  </div>
                  <Sparkline points={k.spark} up={k.dir === 'up'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pr-card">
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>跨平台曝光</div>
                <div style={{ fontSize: 12, color: colors.text3, marginTop: 2 }}>近 7 天 · 对比上周</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="pr-pill active">7 天</span>
                <span className="pr-pill click">30 天</span>
                <span className="pr-pill click">本季</span>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: 200, display: 'block' }}>
                {[0, 15, 30, 45].map(y => (
                  <line key={y} x1="0" y1={60 - (y / 50) * 60} x2="100" y2={60 - (y / 50) * 60}
                    stroke="#e8e6df" strokeWidth="0.2" strokeDasharray="0.5 0.5" />
                ))}
                {PLATFORM_LINES.map(l => {
                  const coords = l.points.map((p, i) => {
                    const x = (i / (l.points.length - 1)) * 100;
                    const y = 60 - (p / 50) * 60;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline key={l.id} points={coords} fill="none" stroke={l.color} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />;
                })}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 4px' }}>
                {DAYS.map(d => <span key={d} style={{ fontSize: 11, color: colors.text3, fontFamily: '"JetBrains Mono", monospace' }}>{d}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
                {PLATFORM_LINES.map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 2, background: l.color, display: 'inline-block', borderRadius: 1 }} />
                    <span style={{ fontSize: 12, color: colors.text2 }}>{l.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{l.points[l.points.length - 1]}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Content */}
          <div className="pr-card">
            <div style={{
              padding: '14px 20px', borderBottom: `1px solid ${colors.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>近期内容</div>
              <button className="pr-btn ghost sm" onClick={() => router.push('/publish')}>查看全部 →</button>
            </div>
            <div>
              {RECENT_CONTENT.map(r => (
                <div key={r.id} className="pr-row" style={{
                  gridTemplateColumns: '40px 1fr 90px 90px 80px', cursor: 'pointer',
                }} onClick={() => router.push('/publish')}>
                  <div style={{
                    width: 40, height: 40, background: '#efece4', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {r.platform === 'xhs' ? '📕' : r.platform === 'tt' ? '🎵' : '📺'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {r.title}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <PlatformTag id={r.platform} />
                    </div>
                  </div>
                  <span className={`pr-pill ${STATUS_META[r.status]?.cls || ''}`}>
                    {STATUS_META[r.status]?.label || r.status}
                  </span>
                  <span style={{ fontSize: 12, color: colors.text3, fontFamily: '"JetBrains Mono", monospace' }}>{r.when}</span>
                  <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{r.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformTag({ id }: { id: string }) {
  const meta = PLATFORM_META[id];
  if (!meta) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.text2 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block', flex: '0 0 auto' }} />
      {meta.label}
    </span>
  );
}
