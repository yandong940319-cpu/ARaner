'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/design-tokens';
import { useAuth } from '@/lib/auth-context';

interface Idea {
  id: string;
  title: string;
  platform: string;
  source: string;
  status: string;
  category?: string;
  angle?: string;
}

const MOCK_IDEAS: Idea[] = [
  { id: 'i1', title: '¥200 露营 5 件套清单 · 独居女生第一次', platform: 'xhs', source: 'ai', status: '已收藏', category: '轻露营' },
  { id: 'i2', title: '通勤穿搭 7 天不重样 · 胶囊衣柜', platform: 'xhs', source: 'manual', status: '草稿', category: '通勤穿搭' },
  { id: 'i3', title: '早 C 晚 A 新手攻略 · 成分搭配', platform: 'xhs', source: 'ai', status: '已收藏', category: '早c晚a' },
  { id: 'i4', title: '办公桌好物分享 · 提升幸福感', platform: 'xhs', source: 'manual', status: '草稿', category: '办公好物' },
  { id: 'i5', title: 'City Walk 上海路线 · 周末漫游', platform: 'xhs', source: 'ai', status: '已收藏', category: 'city walk' },
  { id: 'i6', title: '露营装备避坑 · 新手必看', platform: 'tt', source: 'ai', status: '草稿', category: '轻露营' },
  { id: 'i7', title: '10 分钟快手早餐合集', platform: 'xhs', source: 'manual', status: '已收藏', category: '美食' },
  { id: 'i8', title: '我的桌面布置 · 极简风', platform: 'xhs', source: 'ai', status: '草稿', category: '桌面' },
  { id: 'i9', title: '周末 brunch 探店记', platform: 'xhs', source: 'manual', status: '已收藏', category: '美食' },
  { id: 'i10', title: '618 购物开箱 · 值得买清单', platform: 'xhs', source: 'ai', status: '草稿', category: '办公好物' },
];

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  xhs: { label: '小红书', color: '#ff2741' },
  yt: { label: 'YouTube', color: '#ff0000' },
  tt: { label: 'TikTok', color: '#1a1a1a' },
  fb: { label: 'Facebook', color: '#1877f2' },
};

const TOPIC_TAGS = ['city walk', '轻露营', '通勤穿搭', '早c晚a', '办公好物', '桌面', '美食'];

const FILTERS = [
  ['all', '全部'],
  ['fav', '已收藏'],
  ['ai', 'AI 推荐'],
  ['draft', '草稿'],
  ['arch', '已归档'],
] as const;

export default function IdeasPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [filter, setFilter] = useState('all');
  const [topic, setTopic] = useState('all');
  const [genOpen, setGenOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [extraIdeas, setExtraIdeas] = useState<Idea[]>([]);
  const [genPrompt, setGenPrompt] = useState('');
  const [genPlatform, setGenPlatform] = useState('xhs');
  const [genLoading, setGenLoading] = useState(false);
  const [importText, setImportText] = useState('');

  const allIdeas = [...extraIdeas, ...MOCK_IDEAS];
  const filtered = allIdeas.filter(i => {
    if (filter === 'fav' && i.status !== '已收藏') return false;
    if (filter === 'ai' && i.source !== 'ai') return false;
    if (filter === 'draft' && i.status !== '草稿') return false;
    if (filter === 'arch') return false;
    if (topic !== 'all' && i.category !== topic) return false;
    return true;
  });

  const filterCounts: Record<string, number> = {
    all: allIdeas.length,
    fav: allIdeas.filter(i => i.status === '已收藏').length,
    ai: allIdeas.filter(i => i.source === 'ai').length,
    draft: allIdeas.filter(i => i.status === '草稿').length,
    arch: 0,
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setGenLoading(true);

    const ideaPrompt = `你是一位资深新媒体编辑。请为${genPlatform === 'xhs' ? '小红书' : genPlatform === 'tt' ? 'TikTok' : genPlatform === 'yt' ? 'YouTube' : 'Facebook'}生成 3-5 个选题方向。

要求：每个选题包含标题和一句话角度说明。

输出格式（每行一个选题，用 | 分隔标题和角度）：
标题1 | 角度说明1
标题2 | 角度说明2

直接输出，不要额外说明。`;

    try {
      const res = await fetch('/api/proxy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider: 'deepseek',
          prompt: `${ideaPrompt}\n\n方向参考：${genPrompt}`,
          system: '你是一位资深新媒体编辑，擅长策划爆款选题。',
          maxTokens: 1024,
        }),
      });

      if (!res.ok) throw new Error('生成选题失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';
      let resultText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === 'token') resultText += parsed.content;
          } catch {}
        }
      }

      // Parse the generated text into ideas
      const generatedLines = resultText.split('\n').filter(l => l.includes('|'));
      const newIdeas: Idea[] = generatedLines.map((line, i) => {
        const [title, ...angleParts] = line.split('|').map(s => s.trim());
        return {
          id: 'gen-' + Date.now() + '-' + i,
          title: title || line.replace(/^[\d.\s-]+/, '').trim(),
          platform: genPlatform,
          source: 'ai',
          status: '已收藏',
          angle: angleParts.join('|').trim(),
        };
      });

      if (newIdeas.length === 0) {
        // Fallback: use raw lines
        const rawLines = resultText.split('\n').filter(Boolean);
        rawLines.forEach((line, i) => {
          newIdeas.push({
            id: 'gen-' + Date.now() + '-' + i,
            title: line.replace(/^[\d#.\s-]+/, '').trim().slice(0, 60),
            platform: genPlatform,
            source: 'ai',
            status: '已收藏',
          });
        });
      }

      setExtraIdeas(prev => [...newIdeas, ...prev]);
    } catch (err: any) {
      // Fallback on error: generate from prompt locally
      const fallbackIdeas: Idea[] = genPrompt.split('\n').filter(Boolean).map((line, i) => ({
        id: 'gen-' + Date.now() + '-' + i,
        title: line.replace(/^[#\s\d.、-]+/, '').trim(),
        platform: genPlatform,
        source: 'ai',
        status: '已收藏',
      }));
      if (fallbackIdeas.length > 0) {
        setExtraIdeas(prev => [...fallbackIdeas, ...prev]);
      }
    }

    setGenLoading(false);
    setGenOpen(false);
    setGenPrompt('');
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n').filter(Boolean);
    const newIdeas: Idea[] = lines.map((line, i) => ({
      id: 'imp-' + Date.now() + '-' + i,
      title: line.replace(/^[#\s\d.、-]+/, '').trim(),
      platform: 'xhs',
      source: 'imported',
      status: '草稿',
    }));
    setExtraIdeas(prev => [...newIdeas, ...prev]);
    setImportOpen(false);
    setImportText('');
  };

  const goToEditor = (idea: Idea) => {
    router.push(`/editor?title=${encodeURIComponent(idea.title)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>选题灵感</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>· AI + 团队产出</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pr-btn" onClick={() => setImportOpen(true)}>导入</button>
          <button className="pr-btn accent" onClick={() => setGenOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
            </svg>
            <span>AI 生成</span>
          </button>
        </div>
      </div>

      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
          {/* Side filters */}
          <aside>
            <div className="pr-label" style={{ marginBottom: 8 }}>分类</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
              {FILTERS.map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 10px', borderRadius: 6, fontSize: 13,
                  color: filter === id ? colors.ink : colors.text2,
                  fontWeight: filter === id ? 600 : 400,
                  background: filter === id ? '#efece4' : 'transparent',
                }}>
                  <span>{label}</span>
                  <span style={{ color: colors.text3, fontSize: 11, fontFamily: '"JetBrains Mono", monospace' }}>
                    {filterCounts[id] || 0}
                  </span>
                </button>
              ))}
            </div>
            <div className="pr-label" style={{ marginBottom: 8 }}>话题</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TOPIC_TAGS.map(t => (
                <span
                  key={t}
                  className={`pr-pill click ${topic === t ? 'active' : ''}`}
                  onClick={() => setTopic(topic === t ? 'all' : t)}
                  style={topic === t ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
                >
                  #{t}
                </span>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: colors.text3 }}>{filtered.length} 条选题</span>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: colors.text3, padding: 60, fontSize: 14 }}>
                暂无选题，点击「AI 生成」或「导入」创建
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {filtered.map(idea => (
                  <div key={idea.id} className="pr-card hov" onClick={() => goToEditor(idea)}>
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span className={`pr-pill ${idea.source === 'ai' ? 'accent' : ''}`}>
                          {idea.source === 'ai' ? 'AI 生成' : idea.source === 'imported' ? '已导入' : '手动'}
                        </span>
                        <span className={`pr-pill ${idea.status === '已收藏' ? 'good' : ''}`}>{idea.status}</span>
                      </div>
                      <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.5, marginBottom: 8, minHeight: 42 }}>
                        {idea.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <PlatformTag id={idea.platform} />
                        {idea.category && (
                          <span style={{ fontSize: 11, color: colors.text3 }}>#{idea.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Generate Modal */}
      {genOpen && (
        <Modal title="AI 生成选题" onClose={() => setGenOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>目标平台</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {Object.entries(PLATFORM_META).map(([id, meta]) => (
                  <span key={id} className={`pr-pill click ${genPlatform === id ? 'active' : ''}`}
                    onClick={() => setGenPlatform(id)}
                    style={genPlatform === id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}>
                    {meta.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>
                写作方向（每行一个选题）
              </label>
              <textarea
                className="pr-input"
                placeholder={`露营装备推荐\n通勤穿搭技巧\n周末探店指南`}
                value={genPrompt}
                onChange={e => setGenPrompt(e.target.value)}
                style={{ minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <button className="pr-btn primary" onClick={handleGenerate} disabled={genLoading || !genPrompt.trim()}
              style={{ height: 36, justifyContent: 'center', fontSize: 14 }}>
              {genLoading ? '生成中...' : '生成选题'}
            </button>
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      {importOpen && (
        <Modal title="导入选题" onClose={() => setImportOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>
                粘贴内容（每行一个选题）
              </label>
              <textarea
                className="pr-input"
                placeholder={`露营 5 件套指南\n秋季穿搭公式\n周末 brunch 探店`}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                style={{ minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <button className="pr-btn primary" onClick={handleImport} disabled={!importText.trim()}
              style={{ height: 36, justifyContent: 'center', fontSize: 14 }}>
              导入
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PlatformTag({ id }: { id: string }) {
  const meta = PLATFORM_META[id];
  if (!meta) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.text2 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
      {meta.label}
    </span>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div className="pr-card" style={{ width: 460, padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
