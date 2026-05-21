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
              {galleryMode && selected.size > 0 && (
                <button className="pr-btn primary" onClick={handleConfirm}>
                  添加到正文 · {selected.size}
                </button>
              )}
              <button className="pr-btn" onClick={() => router.push('/editor')}>取消</button>
            </>
          ) : (
            <>
              <button className="pr-btn" onClick={() => alert('AI 打标功能开发中')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
                </svg>
                <span>AI 打标</span>
              </button>
              <button className="pr-btn primary" onClick={() => alert('上传功能在 Wave 4 实现，当前使用 mock 数据')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                <span>上传</span>
              </button>
            </>
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
            <input className="pr-input" placeholder="搜索素材，或拖拽上传…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ flex: 1 }} />
          {!picker && (
            <div style={{ display: 'flex', gap: 4 }}>
              <span className="pr-pill click active" onClick={() => alert('排序功能开发中')}>最新</span>
              <span className="pr-pill click" onClick={() => alert('排序功能开发中')}>最常用</span>
            </div>
          )}
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

        {/* Source filter (non-picker mode) */}
        {!picker && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: colors.text3, letterSpacing: '0.04em' }}>来源</span>
            {[
              ['mine', '我的上传', '1,124'],
              ['ai', 'AI 生成', '86'],
              ['kol', 'KOL 投稿', '38'],
            ].map(([id, label, count]) => (
              <span key={id} className="pr-pill click" style={{ height: 20, fontSize: 10 }}>
                {label}
                <span style={{ opacity: 0.6, marginLeft: 2 }}>{count}</span>
              </span>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: colors.text3 }}>{filtered.length} 项</span>
          </div>
        )}

        {/* Picker mode info banner */}
        {picker && (
          <div style={{
            padding: '10px 14px', marginBottom: 12, background: colors.accentSoft, color: colors.accentText,
            borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
            </svg>
            <span>{galleryMode ? '可多选 · 点击勾选 · 完成后点右上确认' : '选一张图作为编辑器封面 · 点击即可应用'}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.text3 }}>已编辑内容会保留</span>
          </div>
        )}

        {/* Multi-select action bar for non-picker mode */}
        {selected.size > 0 && !picker && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', marginBottom: 14,
            background: colors.ink, color: '#fff', borderRadius: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>已选 {selected.size} 项</span>
            <div style={{ flex: 1 }} />
            <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              添加标签
            </button>
            <button className="pr-btn sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              下载
            </button>
            <button className="pr-btn ghost sm" style={{ color: '#fff' }} onClick={() => setSelected(new Set())}>
              取消选择
            </button>
          </div>
        )}

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
            {filtered.map((a, _idx) => {
              const isSelected = selected.has(a.id);
              const orderIdx = galleryMode ? [...selected].indexOf(a.id) : -1;
              return (
                <div
                  key={a.id}
                  className="pr-card hov"
                  style={{
                    overflow: 'hidden', cursor: 'pointer',
                    outline: isSelected ? `2px solid ${colors.ink}` : 'none',
                    outlineOffset: -2,
                    transition: 'border-color .12s, box-shadow .12s, transform .12s',
                  }}
                  onClick={() => picker && toggleSel(a.id)}
                  onMouseEnter={e => { if (picker && !galleryMode) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (picker && !galleryMode) e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{
                    width: '100%', aspectRatio: String(a.aspect),
                    background: `linear-gradient(135deg, hsl(${a.hue}, 35%, 86%), hsl(${(a.hue + 30) % 360}, 30%, 75%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, color: `hsl(${a.hue}, 40%, 50%)`,
                    position: 'relative',
                  }}>
                    {assetIcon(a)}

                    {/* Selection indicator */}
                    {galleryMode && isSelected ? (
                      <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22,
                        borderRadius: '50%', background: colors.ink, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600,
                      }}>{orderIdx + 1}</div>
                    ) : (picker && !galleryMode) ? null : (
                      <div style={{ position: 'absolute', top: 6, left: 6 }}>
                        <span className={`pr-chk ${isSelected ? 'on' : ''}`} style={{
                          width: 16, height: 16, border: '1.5px solid #d6d3ca', borderRadius: 4,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: isSelected ? colors.ink : 'rgba(255,255,255,0.85)',
                          color: '#fff', transition: 'all .12s',
                        }}>
                          {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                        </span>
                      </div>
                    )}

                    {/* "使用" tooltip for cover pick mode */}
                    {picker && !galleryMode && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6, padding: '3px 8px',
                        background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 600,
                        borderRadius: 12, opacity: 0, transition: 'opacity .15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                        使用
                      </div>
                    )}

                    {/* Used count badge */}
                    {a.used > 0 && !picker && (
                      <div style={{
                        position: 'absolute', bottom: 6, right: 6,
                        padding: '2px 6px', background: 'rgba(0,0,0,0.65)', color: '#fff',
                        fontSize: 10, borderRadius: 3,
                      }}>
                        ✓ {a.used}
                      </div>
                    )}

                    {/* Bottom overlay with name + size */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '20px 8px 6px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 10, color: '#fff',
                    }}>
                      <span>{a.name}</span>
                      <span>{a.size}</span>
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
