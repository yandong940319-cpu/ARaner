'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/lib/design-tokens';
import { CardSkeleton, TableSkeleton } from '@/components/skeleton';

const KPI_DATA = [
  { label: '总曝光', value: '1.24M', delta: '+18%', dir: 'up', spark: [40, 55, 42, 68, 72, 98, 86] },
  { label: '总互动', value: '58.4k', delta: '+22%', dir: 'up', spark: [30, 38, 35, 52, 48, 68, 72] },
  { label: '新增粉丝', value: '+820', delta: '+12%', dir: 'up', spark: [60, 72, 68, 80, 85, 92, 88] },
  { label: '转化', value: '320', delta: '-4%', dir: 'down', spark: [80, 75, 72, 65, 58, 52, 46] },
];

const PLATFORM_LINES = [
  { id: 'xhs', label: '小红书', color: '#ff2741', points: [4200, 5800, 5100, 6800, 6300, 7900, 8500] },
  { id: 'tt', label: 'TikTok', color: '#1a1a1a', points: [3100, 4500, 5200, 4800, 6000, 5500, 7200] },
  { id: 'yt', label: 'YouTube', color: '#666', points: [1800, 2100, 2400, 2200, 2800, 2600, 3100] },
  { id: 'fb', label: 'Facebook', color: '#1877f2', points: [900, 1100, 1000, 1300, 1200, 1400, 1600] },
];

const DONUT_DATA = [
  { color: '#ff2741', value: 40, label: '小红书', val: '40%' },
  { color: '#1a1a1a', value: 24, label: 'TikTok', val: '24%' },
  { color: '#666', value: 20, label: 'YouTube', val: '20%' },
  { color: '#1877f2', value: 16, label: 'Facebook', val: '16%' },
];

const TOP_CONTENT = [
  { id: 'c1', platform: 'xhs', title: '¥200 露营 5 件套清单 · 独居女生第一次', views: 12400, ie: 8.2, follows: 320, comments: 186 },
  { id: 'c2', platform: 'xhs', title: '通勤穿搭 7 天不重样 · 胶囊衣柜', views: 9800, ie: 6.5, follows: 210, comments: 94 },
  { id: 'c3', platform: 'tt', title: '早 C 晚 A 新手攻略', views: 15300, ie: 11.0, follows: 580, comments: 312 },
  { id: 'c4', platform: 'xhs', title: 'City Walk 上海路线 · 周末漫游', views: 7200, ie: 5.2, follows: 145, comments: 67 },
  { id: 'c5', platform: 'fb', title: '周末露营活动分享', views: 4300, ie: 3.8, follows: 88, comments: 42 },
  { id: 'c6', platform: 'yt', title: 'Gear Review: Budget Camping', views: 5600, ie: 7.1, follows: 190, comments: 103 },
];

const DAYS = ['一', '二', '三', '四', '五', '六', '日'];
const RANGES = [['week', '本周'], ['month', '本月'], ['quarter', '本季'], ['custom', '自定义']];

function Sparkline({ points, w = 80, h = 28, up = true }: { points: number[]; w?: number; h?: number; up?: boolean }) {
  const max = Math.max(...points), min = Math.min(...points);
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

function DonutChart({ data, size = 140 }: { data: typeof DONUT_DATA; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.border} strokeWidth="14" />
      {data.map((d, i) => {
        const len = (d.value / total) * circumference;
        const seg = (
          <circle key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={d.color} strokeWidth="14"
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset .3s' }}
          />
        );
        offset += len;
        return seg;
      })}
    </svg>
  );
}

function PlatformTag({ id }: { id: string }) {
  const meta: Record<string, { label: string; color: string; short: string }> = {
    xhs: { label: '小红书', color: '#ff2741', short: 'XHS' },
    yt: { label: 'YouTube', color: '#ff0000', short: 'YT' },
    tt: { label: 'TikTok', color: '#1a1a1a', short: 'TT' },
    fb: { label: 'Facebook', color: '#1877f2', short: 'FB' },
  };
  const m = meta[id];
  if (!m) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.text2 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block', flex: '0 0 auto' }} />
      {m.short}
    </span>
  );
}

function fmtK(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const allMax = Math.max(...PLATFORM_LINES.flatMap(l => l.points));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
        <div style={{
          height: 60, flex: '0 0 auto', padding: '0 28px',
          background: colors.surface, borderBottom: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center',
        }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>数据分析</h1>
        </div>
        <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="pr-pill" style={{ width: 50 }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 18 }}>
            <div className="pr-card" style={{ padding: 20 }}><div className="pr-label" style={{ marginBottom: 12 }}>互动量趋势</div><div style={{ height: 220, background: `linear-gradient(180deg, ${colors.border} 0%, ${colors.bg} 100%)`, borderRadius: 6 }} /></div>
            <div className="pr-card" style={{ padding: 20 }}><div className="pr-label" style={{ marginBottom: 12 }}>平台占比</div><div style={{ height: 220, background: `linear-gradient(180deg, ${colors.border} 0%, ${colors.bg} 100%)`, borderRadius: 6 }} /></div>
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      {/* Topbar */}
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>数据分析</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>· W20 · 对比 W19</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pr-btn">对比期</button>
          <button className="pr-btn">导出 PDF</button>
        </div>
      </div>

      {/* Content */}
      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        {/* Range tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {RANGES.map(([id, label]) => (
            <span key={id} className={`pr-pill click ${range === id ? 'active' : ''}`}
              onClick={() => setRange(id)}
              style={range === id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}>
              {label}
            </span>
          ))}
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {KPI_DATA.map(k => (
            <div key={k.label} className="pr-card">
              <div style={{ padding: 16 }}>
                <div className="pr-label">{k.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>{k.value}</div>
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

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 18 }}>
          {/* Trend chart */}
          <div className="pr-card">
            <div style={{
              padding: '14px 20px', borderBottom: `1px solid ${colors.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>互动量趋势</div>
                <div style={{ fontSize: 12, color: colors.text3, marginTop: 2 }}>每日 · 分平台</div>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: colors.text2 }}>
                {PLATFORM_LINES.map(l => (
                  <span key={l.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 2, background: l.color, borderRadius: 1 }} />{l.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height: 180, display: 'block' }}>
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={60 - (y / 100) * 60} x2="100" y2={60 - (y / 100) * 60}
                    stroke={colors.border} strokeWidth="0.2" strokeDasharray="0.5 0.5" />
                ))}
                {PLATFORM_LINES.map(l => {
                  const coords = l.points.map((p, i) => {
                    const x = (i / (l.points.length - 1)) * 100;
                    const y = 60 - (p / allMax) * 60;
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline key={l.id} points={coords} fill="none" stroke={l.color} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />;
                })}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
                {DAYS.map(d => <span key={d} style={{ fontSize: 11, color: colors.text3, fontFamily: '"JetBrains Mono", monospace' }}>{d}</span>)}
              </div>
            </div>
          </div>

          {/* Donut chart */}
          <div className="pr-card">
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>平台占比</div>
              <div style={{ fontSize: 12, color: colors.text3, marginTop: 2 }}>总曝光分布</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <DonutChart data={DONUT_DATA} />
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DONUT_DATA.map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                      {r.label}
                    </span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 500 }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Content Table */}
        <div className="pr-card" style={{ padding: 0 }}>
          <div style={{
            padding: '14px 20px', borderBottom: `1px solid ${colors.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>本周 Top 内容</div>
              <div style={{ fontSize: 12, color: colors.text3, marginTop: 2 }}>按曝光排序</div>
            </div>
            <button className="pr-btn ghost sm">查看全部 →</button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '28px 50px minmax(0,2fr) 70px 80px 55px 50px 70px',
            padding: '8px 16px', borderBottom: `1px solid ${colors.border}`,
            fontSize: 10, color: colors.text3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase',
            gap: 8,
          }}>
            <div>#</div>
            <div>平台</div>
            <div>内容</div>
            <div style={{ textAlign: 'right' }}>曝光</div>
            <div>互动率</div>
            <div style={{ textAlign: 'right' }}>涨粉</div>
            <div style={{ textAlign: 'right' }}>评论</div>
            <div></div>
          </div>
          {TOP_CONTENT.map((c, i) => (
            <div key={c.id} className="pr-row hov" style={{
              gridTemplateColumns: '28px 50px minmax(0,2fr) 70px 80px 55px 50px 70px',
              padding: '10px 16px', gap: 8,
              borderTop: `1px solid ${colors.border}`,
            }}>
              <span style={{
                fontSize: 18, fontWeight: i < 3 ? 700 : 500,
                color: i < 3 ? colors.ink : colors.text3,
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                {i + 1}
              </span>
              <PlatformTag id={c.platform} />
              <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.title}
              </span>
              <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtK(c.views)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', width: 36 }}>{c.ie}%</span>
                <div style={{ flex: 1, height: 4, background: colors.border, borderRadius: 2, maxWidth: 80 }}>
                  <div style={{
                    width: `${Math.min(100, c.ie * 11)}%`, height: '100%',
                    background: colors.ink, borderRadius: 2,
                  }} />
                </div>
              </div>
              <span style={{ fontSize: 13, color: colors.good, fontVariantNumeric: 'tabular-nums' }}>+{c.follows}</span>
              <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: colors.text2 }}>{c.comments}</span>
              <button className="pr-btn sm">复用</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
