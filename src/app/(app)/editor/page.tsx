'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { colors } from '@/lib/design-tokens';
import { useAuth } from '@/lib/auth-context';

const TONE_OPTIONS = ['治愈', '干货', '幽默', '故事', '专业'];
const LENGTH_OPTIONS = [
  { id: 'short', label: '短', desc: '300-500 字' },
  { id: 'mid', label: '中', desc: '600-900 字' },
  { id: 'long', label: '长', desc: '1000-1500 字' },
];
const PLATFORMS = [
  { id: 'xhs', label: '小红书', color: '#ff2741' },
  { id: 'yt', label: 'YouTube', color: '#ff0000' },
  { id: 'tt', label: 'TikTok', color: '#1a1a1a' },
  { id: 'fb', label: 'Facebook', color: '#1877f2' },
];

function getPlatformPrompt(platform: string): string {
  const prompts: Record<string, string> = {
    xhs: '小红书 (用 emoji 但克制 · 第一人称 · 分段简短 · 适合手机阅读 · 结尾带 5-7 个 # 标签)',
    tt: 'TikTok 短视频脚本 (镜头分段 · 每段 3-8 秒 · 钩子第一句)',
    yt: 'YouTube long-form (有章节标题 · 口语化)',
    fb: 'Facebook 长帖 (口语 · 带 1-2 个段落分隔 · 适合家庭/亲子受众)',
  };
  return prompts[platform] || '';
}

export default function EditorPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState('¥200 露营 5 件套清单 · 独居女生第一次');
  const [platform, setPlatform] = useState('xhs');
  const [tone, setTone] = useState('治愈');
  const [length, setLength] = useState('mid');
  const [prompt, setPrompt] = useState('写一篇我第一次独自露营的小红书，预算 200，重点讲装备清单 + 避坑。开头要有情绪钩子，第一人称，多用 emoji 但克制。');
  const [body, setBody] = useState('');
  const [coverAsset, setCoverAsset] = useState<string | null>(null);
  const [galleryAssets, setGalleryAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [multiRewrite, setMultiRewrite] = useState<{ platform: string; content: string } | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Handle assets returned from picker
  useEffect(() => {
    const assets = searchParams.get('assets');
    const target = searchParams.get('target');
    if (assets && target) {
      const ids = assets.split(',');
      if (target === 'cover' && ids.length > 0) {
        setCoverAsset(ids[0]);
      } else if (target === 'gallery') {
        setGalleryAssets(prev => [...new Set([...prev, ...ids])]);
      }
      // Clean up URL params
      router.replace('/editor');
    }
  }, [searchParams, router]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('araner-editor-draft');
      if (saved) {
        const d = JSON.parse(saved);
        setTitle(d.title || title);
        setPlatform(d.platform || platform);
        setTone(d.tone || tone);
        setLength(d.length || length);
        setPrompt(d.prompt || prompt);
        setBody(d.body || '');
        if (d.body) setHasGenerated(true);
      }
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem('araner-editor-draft', JSON.stringify({
        title, platform, tone, length, prompt, body,
      }));
    } catch {}
  }, [title, platform, tone, length, prompt, body]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setBody('');
    setHasGenerated(true);

    const platformDesc = getPlatformPrompt(platform);
    const lenDesc = ({ short: '约 400 字', mid: '约 700 字', long: '约 1200 字' })[length] || '约 700 字';

    const fullPrompt = `你是一位经验丰富的中文内容创作者。请写一篇 ${platformDesc}。

标题: ${title}
调性: ${tone}
长度: ${lenDesc}

要求:
${prompt}

直接输出正文内容，不要加引号、标题或额外说明。`;

    try {
      const proxyRes = await fetch('/api/proxy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider: 'deepseek',
          prompt: fullPrompt,
          system: '你是一位专业的中文内容创作者，擅长新媒体写作。',
          maxTokens: 4096,
        }),
      });

      if (!proxyRes.ok) {
        const err = await proxyRes.json().catch(() => ({ error: '请求失败' }));
        throw new Error(err.error || `HTTP ${proxyRes.status}`);
      }

      const reader = proxyRes.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'token') {
              currentText += parsed.content;
              setBody(currentText);
            } else if (parsed.type === 'error') {
              setError(parsed.message);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setError(err.message || '生成失败');
    } finally {
      setLoading(false);
    }
  }, [title, platform, tone, length, prompt, token]);

  // Multi-platform rewrite: rewrite existing content for a different platform
  const handleRewrite = useCallback(async (targetPlatform: string) => {
    if (!body) return;
    setRewriteLoading(true);
    setMultiRewrite(null);

    const platformDesc = getPlatformPrompt(targetPlatform);
    const rewritePrompt = `请将下面这篇内容改写为适合 ${platformDesc} 的版本。保持核心信息和调性不变，但调整表达方式以适配平台。

原文:
${body.slice(0, 3000)}

直接输出改写后的正文，不要加额外说明。`;

    try {
      const res = await fetch('/api/proxy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          provider: 'deepseek',
          prompt: rewritePrompt,
          system: '你是一位专业的内容改写专家。',
          maxTokens: 4096,
        }),
      });

      if (!res.ok) throw new Error('改写请求失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentText = '';

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
            if (parsed.type === 'token') {
              currentText += parsed.content;
              setMultiRewrite({ platform: targetPlatform, content: currentText });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setError(err.message || '改写失败');
    } finally {
      setRewriteLoading(false);
    }
  }, [body, token]);

  // Extract outline from body text
  const outlineItems = body.split('\n')
    .filter(line => line.trim().startsWith('#') || line.trim().startsWith('**') || line.trim().startsWith('- '))
    .slice(0, 10);

  const showRewriteButton = hasGenerated && outlineOpen;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      {/* Topbar */}
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flex: 1, minWidth: 0 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入标题..."
            style={{
              border: 'none', outline: 'none', fontSize: 16, fontWeight: 600,
              background: 'transparent', width: '100%', minWidth: 0,
              fontFamily: 'inherit', color: colors.text,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {hasGenerated && (
            <>
              <button className="pr-btn" onClick={() => setOutlineOpen(!outlineOpen)} style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                <span>{outlineOpen ? '关闭大纲' : '大纲'}</span>
                {outlineItems.length > 0 && !outlineOpen && (
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: colors.accent, color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {outlineItems.length}
                  </span>
                )}
              </button>
              <button className="pr-btn" onClick={() => { setBody(''); setHasGenerated(false); }}>
                重新生成
              </button>
            </>
          )}
          <button className={`pr-btn ${loading ? 'ghost' : 'accent'}`} onClick={handleGenerate} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
            </svg>
            <span>{loading ? '生成中...' : 'AI 起稿'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Panel - Config + Prompt */}
        <div style={{
          width: 320, flex: '0 0 auto', background: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          padding: '20px', overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {/* Platform Selection */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              发布平台
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <span
                  key={p.id}
                  className={`pr-pill click ${platform === p.id ? 'active' : ''}`}
                  onClick={() => setPlatform(p.id)}
                  style={platform === p.id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              调性
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TONE_OPTIONS.map(t => (
                <span
                  key={t}
                  className={`pr-pill click ${tone === t ? 'active' : ''}`}
                  onClick={() => setTone(t)}
                  style={tone === t ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              长度
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {LENGTH_OPTIONS.map(l => (
                <span
                  key={l.id}
                  className={`pr-pill click ${length === l.id ? 'active' : ''}`}
                  onClick={() => setLength(l.id)}
                  style={length === l.id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
                  title={l.desc}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Cover / Gallery */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              素材
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pr-btn sm" onClick={() => router.push('/assets?picker=cover')} style={{ flex: 1, justifyContent: 'center' }}>
                {coverAsset ? '✓ 已选封面' : '选择封面'}
              </button>
              <button className="pr-btn sm" onClick={() => router.push('/assets?picker=gallery')} style={{ flex: 1, justifyContent: 'center' }}>
                {galleryAssets.length > 0 ? `✓ 已选 ${galleryAssets.length} 张` : '配图'}
              </button>
            </div>
            {coverAsset && (
              <div style={{ marginTop: 6, fontSize: 11, color: colors.accentText, background: colors.accentSoft, padding: '4px 8px', borderRadius: 4 }}>
                封面已设置
              </div>
            )}
            {galleryAssets.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: colors.text2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {galleryAssets.map(id => (
                  <span key={id} style={{ background: colors.surface2, padding: '2px 6px', borderRadius: 3, border: `1px solid ${colors.border}` }}>
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Prompt */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              创作指令
            </div>
            <textarea
              className="pr-input"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="输入写作要求、角度提示..."
              style={{ flex: 1, minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Key shortcut hint */}
          <div style={{ fontSize: 11, color: colors.text3, textAlign: 'center' }}>
            <span className="pr-kbd" style={{ marginRight: 4 }}>Ctrl</span>
            <span className="pr-kbd" style={{ marginRight: 4 }}>Enter</span>
            生成
          </div>
        </div>

        {/* Right Panel - Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div className="pr-scroll" style={{ flex: 1, background: colors.bg, overflow: 'auto' }}>
            {error && (
              <div style={{
                margin: 16, padding: '10px 14px', background: colors.badSoft, color: colors.bad,
                borderRadius: 6, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {!body && !loading && !error && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: colors.text3, gap: 12,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
                </svg>
                <div style={{ fontSize: 14 }}>在左侧配置好创作参数，点击 AI 起稿</div>
              </div>
            )}

            {loading && !body && (
              <div style={{ padding: 24, color: colors.text3, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="pr-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                正在生成...
              </div>
            )}

            {body && (
              <div ref={bodyRef} style={{ padding: 28, fontSize: 14, lineHeight: 1.8, color: colors.text, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {body}
                {loading && <span style={{ animation: 'pulse 1s infinite', opacity: 0.5 }}>▍</span>}
              </div>
            )}

            {/* Multi-rewrite result */}
            {multiRewrite && !rewriteLoading && (
              <div style={{ margin: '0 16px 16px', borderTop: `2px solid ${colors.accent}`, paddingTop: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: colors.accentText, marginBottom: 8 }}>
                  改写为「{PLATFORMS.find(p => p.id === multiRewrite.platform)?.label || multiRewrite.platform}」版本
                </div>
                <div style={{ padding: 16, background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {multiRewrite.content}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="pr-btn sm primary" onClick={() => { setBody(multiRewrite.content); setMultiRewrite(null); setOutlineOpen(false); }}>
                    使用此版本
                  </button>
                  <button className="pr-btn sm" onClick={() => setMultiRewrite(null)}>
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Cover Generation Bar */}
          {hasGenerated && body && (
            <div style={{
              flex: '0 0 auto', padding: '10px 16px', background: colors.surface,
              borderTop: `1px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 12, color: colors.text2 }}>AI 封面：</span>
              {PLATFORMS.map(p => (
                <button key={p.id} className="pr-btn sm ghost" onClick={async () => {
                  // Generate cover prompt from content
                  const coverPrompt = `基于以下内容，生成一个封面图的画面描述，适合${p.label}的封面风格。

内容: ${body.slice(0, 500)}

输出格式：一句画面描述 + 色调关键词。不要多余解释。`;
                  try {
                    const res = await fetch('/api/proxy/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
                      body: JSON.stringify({ provider: 'deepseek', prompt: coverPrompt, system: '你是一位视觉创意总监。', maxTokens: 200 }),
                    });
                    if (res.ok) {
                      const reader = res.body?.getReader();
                      if (reader) {
                        const decoder = new TextDecoder();
                        let text = '';
                        while (true) {
                          const { done, value } = await reader.read();
                          if (done) break;
                          text += decoder.decode(value, { stream: true });
                        }
                        // Parse SSE and show result
                        const match = text.match(/"content":"([^"]+)"/);
                        if (match) {
                          setCoverPrompt(match[1]);
                        }
                      }
                    }
                  } catch {}
                }} style={{ fontSize: 11 }}>
                  {p.label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button className="pr-btn sm" onClick={() => router.push('/assets?picker=cover')}>
                上传封面
              </button>
            </div>
          )}
        </div>

        {/* Outline Panel (right sidebar) */}
        {outlineOpen && hasGenerated && outlineItems.length > 0 && (
          <div style={{
            width: 200, flex: '0 0 auto', background: colors.surface,
            borderLeft: `1px solid ${colors.border}`, padding: 16, overflow: 'auto',
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              大纲
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {outlineItems.map((item, i) => (
                <div key={i} style={{
                  fontSize: 12, padding: '4px 8px', borderRadius: 4,
                  color: colors.text2, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  background: colors.surface2,
                  borderLeft: `2px solid ${colors.accent}`,
                }}>
                  {item.replace(/^[#*]+\s*/, '')}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                多平台改写
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {PLATFORMS.filter(p => p.id !== platform).map(p => (
                  <button
                    key={p.id}
                    className="pr-btn sm"
                    onClick={() => handleRewrite(p.id)}
                    disabled={rewriteLoading}
                    style={{ justifyContent: 'flex-start', fontSize: 11, width: '100%' }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    {rewriteLoading ? '改写中...' : `改写为 ${p.label}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
