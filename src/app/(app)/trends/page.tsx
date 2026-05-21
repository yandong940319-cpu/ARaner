'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/design-tokens';
import { CardSkeleton, RowSkeleton } from '@/components/skeleton';

interface TrendRow {
  id: string;
  topic: string;
  tags: string[];
  growth: number;
  fav: boolean;
  per: Record<string, number | null>;
}

const MOCK_TRENDS: TrendRow[] = [
  { id: 't1', topic: '#轻露营', tags: ['露营装备', '户外生活'], growth: 86, fav: true, per: { xhs: 92, yt: 45, tt: 78, fb: 32 } },
  { id: 't2', topic: '#City Walk', tags: ['城市漫游', '周末'], growth: 72, fav: true, per: { xhs: 88, yt: 52, tt: 65, fb: 28 } },
  { id: 't3', topic: '#早C晚A', tags: ['护肤', '成分'], growth: 68, fav: false, per: { xhs: 95, yt: 38, tt: 42, fb: 15 } },
  { id: 't4', topic: '#通勤穿搭', tags: ['穿搭', '职场'], growth: 55, fav: false, per: { xhs: 76, yt: 42, tt: 55, fb: 38 } },
  { id: 't5', topic: '#办公好物', tags: ['桌面', '效率'], growth: 48, fav: false, per: { xhs: 62, yt: 35, tt: 40, fb: 22 } },
  { id: 't6', topic: '#周末探店', tags: ['美食', '打卡'], growth: 42, fav: true, per: { xhs: 85, yt: 30, tt: 60, fb: 20 } },
  { id: 't7', topic: '#露营装备清单', tags: ['露营', '新手'], growth: 38, fav: false, per: { xhs: 72, yt: 28, tt: 45, fb: 18 } },
  { id: 't8', topic: '#极简桌面', tags: ['桌面布置', '收纳'], growth: 28, fav: false, per: { xhs: 55, yt: 22, tt: 35, fb: 12 } },
];

const PLATFORMS = [
  { id: 'xhs', label: '小红书', color: '#ff2741' },
  { id: 'yt', label: 'YouTube', color: '#ff0000' },
  { id: 'tt', label: 'TikTok', color: '#1a1a1a' },
  { id: 'fb', label: 'Facebook', color: '#1877f2' },
];

function GrowthBar({ value }: { value: number }) {
  const w = Math.min(value, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: colors.surface2, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', background: value >= 0 ? colors.good : colors.bad, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: value >= 0 ? colors.good : colors.bad, fontWeight: 500, minWidth: 32, textAlign: 'right' }}>
        {value >= 0 ? '+' : ''}{value}%
      </span>
    </div>
  );
}

function PlatformCell({ value }: { value: number | null }) {
  if (value === null) return <span style={{ fontSize: 12, color: colors.text3 }}>—</span>;
  const color = value >= 50 ? colors.good : value >= 20 ? colors.warn : colors.text3;
  return <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color }}>{value >= 0 ? '+' : ''}{value}%</span>;
}

export default function TrendsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [activePlatform, setActivePlatform] = useState('all');
  const [favs, setFavs] = useState(new Set(MOCK_TRENDS.filter(t => t.fav).map(t => t.id)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [extraRows, setExtraRows] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
        <div style={{ height: 60, flex: '0 0 auto', padding: '0 28px', background: colors.surface, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 120, height: 18, borderRadius: 4, background: colors.border }} />
        </div>
        <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="pr-pill" style={{ width: i === 1 ? 260 : 60 }} />)}
          </div>
          <div className="pr-card">
            <RowSkeleton cols={8} />
            {[1, 2, 3, 4, 5].map(i => <RowSkeleton key={i} cols={8} />)}
          </div>
        </div>
      </div>
    );
  }

  const rows = useMemo(() => {
    let r = [...extraRows, ...MOCK_TRENDS];
    if (q) r = r.filter(t => t.topic.includes(q) || t.tags.some(tag => tag.includes(q)));
    if (favOnly) r = r.filter(t => favs.has(t.id));
    if (activePlatform !== 'all') r = r.filter(t => t.per[activePlatform] !== null && (t.per[activePlatform] || 0) > 0);
    r.sort((a, b) => b.growth - a.growth);
    return r;
  }, [q, favOnly, favs, activePlatform, extraRows]);

  const toggleFav = (id: string) => {
    setFavs(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>热点分析</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>· 跨平台话题趋势</span>
        </div>
        <button className="pr-btn primary" onClick={() => setDrawerOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>新建追踪</span>
        </button>
      </div>

      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '0 0 320px' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.text3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </span>
            <input className="pr-input" placeholder="搜索话题、关键词、标签..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all', '全部'], ['xhs', '小红书'], ['yt', 'YouTube'], ['tt', 'TikTok'], ['fb', 'Facebook']].map(([id, label]) => (
              <span key={id} className={`pr-pill click ${activePlatform === id ? 'active' : ''}`}
                onClick={() => setActivePlatform(id)}
                style={activePlatform === id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}>
                {label}
              </span>
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: colors.border }} />
          <span className={`pr-pill click ${favOnly ? 'active' : ''}`} onClick={() => setFavOnly(f => !f)}
            style={favOnly ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}>
            ★ 仅收藏
          </span>
        </div>

        {/* Table */}
        <div className="pr-card" style={{ padding: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 2fr 1fr repeat(4, 1fr) 120px',
            padding: '12px 18px', borderBottom: `1px solid ${colors.border}`,
            fontSize: 11, color: colors.text3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            <div></div>
            <div>话题</div>
            <div>综合涨幅</div>
            {PLATFORMS.map(p => <div key={p.id}>{p.label}</div>)}
            <div>操作</div>
          </div>

          {rows.map((t, i) => (
            <div key={t.id} className="pr-row" style={{
              gridTemplateColumns: '40px 2fr 1fr repeat(4, 1fr) 120px', padding: '14px 18px',
              borderTop: i === 0 ? 'none' : `1px solid ${colors.border}`,
            }}>
              <div onClick={() => toggleFav(t.id)} style={{ cursor: 'pointer', color: favs.has(t.id) ? colors.accent : colors.text3, fontSize: 16 }}>
                {favs.has(t.id) ? '★' : '☆'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.topic}
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                  {t.tags.map(tag => <span key={tag} className="pr-pill" style={{ height: 18, fontSize: 10 }}>{tag}</span>)}
                </div>
              </div>
              <GrowthBar value={t.growth} />
              {PLATFORMS.map(p => (
                <div key={p.id}><PlatformCell value={t.per[p.id] ?? null} /></div>
              ))}
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="pr-btn ghost sm" onClick={() => router.push(`/ideas?topic=${encodeURIComponent(t.topic)}`)} style={{ fontSize: 11 }}>
                  选题
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: colors.text3 }}>
          <span>数据更新时间：{new Date().toLocaleString('zh-CN')} · 数据来源：各平台公开趋势 API</span>
          <span>共 {rows.length} 条话题</span>
        </div>
      </div>

      {/* New Tracking Drawer */}
      {drawerOpen && (
        <NewTrackDrawer
          onClose={() => setDrawerOpen(false)}
          onCreate={(data) => {
            const id = 'new-' + Date.now();
            setExtraRows(rs => [{
              id,
              topic: data.topic.startsWith('#') ? data.topic : '#' + data.topic,
              tags: data.category ? [data.category] : ['新建'],
              growth: 0,
              fav: true,
              per: { xhs: null, yt: null, tt: null, fb: null },
            }, ...rs]);
            setFavs(s => { const n = new Set(s); n.add(id); return n; });
            setDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function NewTrackDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [platforms, setPlatforms] = useState(new Set(['xhs', 'tt']));
  const [category, setCategory] = useState('');

  const togglePlatform = (id: string) => {
    setPlatforms(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKwInput('');
    }
  };

  const AI_KEYWORDS: Record<string, string[]> = {
    '#轻露营': ['帐篷推荐', '露营装备', '户外新手', '露营穿搭', '野餐'],
    '#City Walk': ['周末去哪', '城市漫步', '街拍', '咖啡探店'],
  };

  const suggested = AI_KEYWORDS[topic] || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: 420, height: '100%', background: colors.surface,
        borderLeft: `1px solid ${colors.border}`, overflow: 'auto',
        animation: 'pr-slide-in 0.2s ease-out',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>新建话题追踪</div>
          <button className="pr-btn ghost icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Topic */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>话题名称</label>
            <input className="pr-input" placeholder="例如：#轻露营" value={topic} onChange={e => setTopic(e.target.value)} />
          </div>

          {/* Keywords */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>关键词标签</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              {keywords.map(kw => (
                <span key={kw} className="pr-pill click" style={{ paddingRight: 4 }}>
                  {kw}
                  <span style={{ marginLeft: 4, cursor: 'pointer' }} onClick={() => setKeywords(keywords.filter(k => k !== kw))}>×</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="pr-input" placeholder="输入关键词，回车添加" value={kwInput}
                onChange={e => setKwInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                style={{ flex: 1 }} />
              <button className="pr-btn sm" onClick={addKeyword}>添加</button>
            </div>
          </div>

          {/* AI Recommended Keywords */}
          {suggested.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: colors.accentText, marginBottom: 4 }}>
                AI 推荐关键词
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {suggested.map(kw => (
                  <span key={kw} className="pr-pill click accent" style={{ cursor: 'pointer', height: 20, fontSize: 10 }}
                    onClick={() => { if (!keywords.includes(kw)) setKeywords([...keywords, kw]); }}>
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 6, display: 'block' }}>追踪平台</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {PLATFORMS.map(p => (
                <span key={p.id} className={`pr-pill click ${platforms.has(p.id) ? 'active' : ''}`}
                  onClick={() => togglePlatform(p.id)}
                  style={platforms.has(p.id) ? { background: colors.ink, color: '#fff', borderColor: colors.ink, justifyContent: 'center' } : { justifyContent: 'center' }}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>赛道分类</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['生活', '时尚', '美食', '旅行', '科技', '健身'].map(c => (
                <span key={c} className={`pr-pill click ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(category === c ? '' : c)}
                  style={category === c ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Notification */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>通知设置</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['涨幅触发', '热度变化时通知'],
                ['入榜提醒', '进入热门榜时通知'],
                ['KOL 入场', '头部创作者发相关话题时通知'],
              ].map(([label, desc]) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <div className="pr-chk on" style={{ width: 16, height: 16 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: colors.text3 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action */}
          <button className="pr-btn primary" onClick={() => onCreate({ topic, category })} disabled={!topic.trim()}
            style={{ height: 36, justifyContent: 'center', fontSize: 14, marginTop: 8 }}>
            开始追踪
          </button>
        </div>
      </div>
    </div>
  );
}


