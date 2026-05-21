'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { colors } from '@/lib/design-tokens';

const TYPES = [
  { id: 'all', label: '全部', n: 1248 },
  { id: 'img', label: '图片', n: 824 },
  { id: 'vid', label: '视频', n: 165 },
  { id: 'copy', label: '文案', n: 198 },
  { id: 'logo', label: 'Logo / 字体', n: 61 },
];

const TAGS = ['camping', '穿搭', '美食', '宠物', '旅行', '美妆', '人物', '产品', '黄昏', '室内', 'vlog', '空镜'];

interface Asset {
  id: string;
  name: string;
  hue: number;
  size: string;
  used: number;
  aspect: number;
  type: string;
}

function generateMockAssets(): Asset[] {
  return Array.from({ length: 24 }).map((_, i) => ({
    id: `a${i}`,
    name: `IMG_${String(1024 + i).padStart(4, '0')}`,
    hue: (i * 47) % 360,
    size: (1.2 + (i % 5) * 0.4).toFixed(1) + ' MB',
    used: (i % 6) === 0 ? 0 : (i % 6),
    aspect: [1, 1.3, 0.75, 1.5, 1][i % 5],
    type: (['img', 'img', 'vid', 'copy', 'logo'] as const)[i % 5],
  }));
}

export default function AssetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const picker = searchParams.get('picker'); // 'cover' | 'gallery' | null
  const pickerTarget = searchParams.get('target'); // additional routing info
  const galleryMode = picker === 'gallery';

  const [type, setType] = useState('all');
  const [activeTags, setActiveTags] = useState(new Set(['camping']));
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(new Set<string>());

  const assets = useMemo(() => generateMockAssets(), []);

  const filtered = assets.filter(a => {
    if (type !== 'all' && a.type !== type) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const toggleTag = (t: string) => {
    setActiveTags(s => {
      const n = new Set(s);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  };

  const toggleSel = (id: string) => {
    if (picker === 'cover') {
      // Single select for cover mode
      setSelected(new Set([id]));
      return;
    }
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleConfirm = () => {
    // Return selected assets to editor via query params
    const ids = [...selected].join(',');
    router.push(`/editor?assets=${ids}&target=${galleryMode ? 'gallery' : 'cover'}`);
  };

  // Icon for asset type
  const assetIcon = (a: Asset) => {
    if (a.type === 'vid') return '🎬';
    if (a.type === 'copy') return '📝';
    if (a.type === 'logo') return '🎨';
    return '🖼';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      {/* Topbar */}
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {picker ? (galleryMode ? '选择图片素材' : '选择封面') : '素材库'}
          </h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>
            {picker ? (galleryMode ? '· 可多选 · 按选择顺序排列' : '· 选一张作为封面') : '· 1,248 项'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {picker ? (
            <>
              <button className="pr-btn" onClick={() => router.push('/editor')}>取消</button>
              <button
                className="pr-btn primary"
                disabled={selected.size === 0}
                onClick={handleConfirm}
              >
                确认{selected.size > 0 ? ` (${selected.size})` : ''}
              </button>
            </>
          ) : (
            <button className="pr-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              <span>上传</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '0 0 280px' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.text3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </span>
            <input className="pr-input" placeholder="搜索素材..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {TYPES.map(t => (
              <span
                key={t.id}
                className={`pr-pill click ${type === t.id ? 'active' : ''}`}
                onClick={() => setType(t.id)}
                style={type === t.id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
              >
                {t.label}
                <span style={{ marginLeft: 4, opacity: 0.7 }}>{t.n}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {TAGS.map(t => (
            <span
              key={t}
              className={`pr-pill click ${activeTags.has(t) ? 'active' : ''}`}
              onClick={() => toggleTag(t)}
              style={activeTags.has(t) ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.text3, padding: 40, fontSize: 13 }}>暂无匹配素材</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {filtered.map(a => {
              const isSelected = selected.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`pr-card ${picker ? 'hov' : 'hov'}`}
                  style={{
                    overflow: 'hidden',
                    cursor: picker ? 'pointer' : 'pointer',
                    outline: isSelected ? `2px solid ${colors.accent}` : 'none',
                    outlineOffset: -2,
                  }}
                  onClick={() => picker && toggleSel(a.id)}
                >
                  <div style={{
                    width: '100%', aspectRatio: String(a.aspect), background: `hsl(${a.hue}, 30%, 92%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, color: `hsl(${a.hue}, 40%, 50%)`,
                    position: 'relative',
                  }}>
                    {assetIcon(a)}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6, width: 22, height: 22,
                        borderRadius: '50%', background: colors.accent, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: colors.text3 }}>{a.size}</span>
                      <span style={{ fontSize: 11, color: colors.text3 }}>{a.used} 次使用</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
