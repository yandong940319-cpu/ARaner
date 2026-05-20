// proto-editor.jsx — AI 编辑器: actually generates content via window.claude.complete

const TONE_OPTIONS = ['治愈', '干货', '幽默', '故事', '专业'];

const MODE_OPTIONS = [
  { id: 'text',  label: '纯文字',     desc: '只发文字' },
  { id: 'mix',   label: '文字 + 图片', desc: '图文并茂' },
  { id: 'video', label: '视频',       desc: '脚本 + 分镜' },
];

const LENGTH_TEXT_OPTIONS = [
  { id: 'short', label: '短', desc: '300-500 字' },
  { id: 'mid',   label: '中', desc: '600-900 字' },
  { id: 'long',  label: '长', desc: '1000-1500 字' },
];

const LENGTH_VIDEO_OPTIONS = [
  { id: 'short',  label: '短', desc: '15s' },
  { id: 'mid',    label: '中', desc: '30s' },
  { id: 'long',   label: '长', desc: '45s' },
  { id: 'custom', label: '自定义', desc: '输入时长' },
];

function PageEditor() {
  const { go, payload, clearPayload } = useRoute();

  // If we arrived from an idea, pre-fill from it
  const fromIdea = payload?.from === 'idea' ? payload.idea : null;
  // If we arrived back from assets with a selected cover, apply it
  const fromAsset = payload?.from === 'asset' ? payload.asset : null;

  // Restore draft on mount; idea payload takes precedence over stored draft
  const restored = React.useMemo(() => {
    if (fromIdea) return null;
    try {
      const raw = localStorage.getItem('proto-editor-draft');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [fromIdea]);

  const [title, setTitle] = React.useState(
    fromIdea?.title || restored?.title || '¥200 露营 5 件套清单 ·  独居女生第一次'
  );
  const [platform, setPlatform] = React.useState(
    fromIdea?.platform || restored?.platform || 'xhs'
  );
  const [mode, setMode] = React.useState(restored?.mode || 'mix');
  const [tone, setTone] = React.useState(restored?.tone || '治愈');
  const [length, setLength] = React.useState(restored?.length || 'mid');
  const [customDuration, setCustomDuration] = React.useState(restored?.customDuration || '60');
  const [prompt, setPrompt] = React.useState(
    fromIdea?.angle
      ? `角度提示：${fromIdea.angle}\n\n写成${fromIdea.platform === 'xhs' ? '小红书 plog' : fromIdea.platform === 'tt' ? 'TikTok 短视频脚本' : 'YouTube 长视频脚本'}，第一人称，多用细节让画面感强。`
      : (restored?.prompt || '写一篇我第一次独自露营的小红书，预算 200，重点讲装备清单 + 避坑。开头要有情绪钩子，第一人称，多用 emoji 但克制。')
  );
  const [body, setBody] = React.useState(restored?.body || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [didStart, setDidStart] = React.useState(!!restored?.body);
  const [linkedIdea, setLinkedIdea] = React.useState(fromIdea || restored?.linkedIdea || null);
  // Image generation status (mix/video modes generate gallery/cover via AI)
  const [imageStage, setImageStage] = React.useState('idle'); // idle | text | cover | images | video | done
  // Read default keys for each role (from Key 管理) — re-resolve on every render
  const keyText  = (typeof getDefaultKey === 'function') ? getDefaultKey('text')  : null;
  const keyImage = (typeof getDefaultKey === 'function') ? getDefaultKey('image') : null;
  const keyVideo = (typeof getDefaultKey === 'function') ? getDefaultKey('video') : null;
  // Generated video (for video mode)
  const [generatedVideo, setGeneratedVideo] = React.useState(null);
  // Log of which keys were called during the last generation
  const [callLog, setCallLog] = React.useState([]);

  // Modal/popover state
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [coverAnchor, setCoverAnchor] = React.useState(null);
  // Cover state — null means removed; otherwise stores the gradient hue
  const [coverHue, setCoverHue] = React.useState(restored?.coverHue ?? 28);
  const [coverRemoved, setCoverRemoved] = React.useState(restored?.coverRemoved || false);
  const [coverRegenKey, setCoverRegenKey] = React.useState(0);
  const [coverAsset, setCoverAsset] = React.useState(restored?.coverAsset || null); // when picked from asset library
  const [galleryAssets, setGalleryAssets] = React.useState(restored?.galleryAssets || []);

  // Restore generated video from previous session
  React.useEffect(() => {
    if (restored?.generatedVideo) setGeneratedVideo(restored.generatedVideo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply asset picked from library
  React.useEffect(() => {
    if (!fromAsset) return;
    if (payload?.target === 'gallery') {
      // multi-add to gallery (deduplicate by id)
      const items = Array.isArray(fromAsset) ? fromAsset : [fromAsset];
      setGalleryAssets(g => {
        const ids = new Set(g.map(x => x.id));
        return [...g, ...items.filter(it => !ids.has(it.id))];
      });
    } else {
      // cover replacement
      setCoverAsset(fromAsset);
      setCoverRemoved(false);
      setCoverRegenKey(k => k + 1);
    }
  }, [fromAsset]);

  // Persist draft to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('proto-editor-draft', JSON.stringify({
        title, platform, mode, tone, length, customDuration, prompt, body,
        coverHue, coverRemoved, coverAsset, galleryAssets, linkedIdea, generatedVideo,
      }));
    } catch {}
  }, [title, platform, mode, tone, length, customDuration, prompt, body, coverHue, coverRemoved, coverAsset, galleryAssets, linkedIdea, generatedVideo]);

  // Clear payload after first read so it doesn't re-apply on re-render
  React.useEffect(() => {
    if (fromIdea || fromAsset) clearPayload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordCount = body.replace(/\s/g, '').length;

  const generate = async () => {
    // Pre-flight: warn if required keys for mode are missing
    if (!keyText) {
      setError('未配置「文字模型」Key ·  请前往 Key 管理新建');
      return;
    }
    if (mode === 'mix' && !keyImage) {
      setError('当前模式需要「图片模型」Key ·  请前往 Key 管理新建');
      return;
    }
    if (mode === 'video' && !keyVideo) {
      setError('当前模式需要「视频模型」Key ·  请前往 Key 管理新建');
      return;
    }

    setLoading(true); setError(null); setDidStart(true);
    setCallLog([]);
    setImageStage('text');

    const logCall = (entry) => setCallLog(prev => [...prev, { ...entry, at: Date.now() }]);
    logCall({ key: keyText, role: 'text', status: 'running', desc: mode === 'video' ? '生成视频脚本' : '生成正文' });
    const platformDesc = ({
      xhs: '小红书 (用 emoji 但克制 ·  第一人称 ·  分段简短 ·  适合手机阅读 ·  结尾带 5-7 个 # 标签)',
      tt:  'TikTok 短视频脚本 (镜头分段 ·  每段 3-8 秒 ·  钩子第一句)',
      yt:  'YouTube long-form (有章节标题 ·  口语化 ·  英文)',
      fb:  'Facebook 长帖 (口语 ·  带 1-2 个段落分隔 ·  适合家庭/亲子受众)',
    })[platform] || '';

    let modeDesc, lenDesc;
    if (mode === 'video') {
      modeDesc = '视频脚本（按镜头分段：镜头号 ·  时长 ·  画面 ·  旁白/字幕）';
      const seconds = length === 'custom'
        ? (parseInt(customDuration, 10) || 60)
        : ({ short: 15, mid: 30, long: 45 })[length] || 30;
      lenDesc = `总时长约 ${seconds} 秒，请合理分配镜头`;
    } else if (mode === 'mix') {
      modeDesc = '图文（在适合的位置用 [图1] [图2] … 标注配图位置，方便后续配图）';
      lenDesc = ({ short: '约 400 字', mid: '约 700 字', long: '约 1200 字' })[length] || '约 700 字';
    } else {
      modeDesc = '纯文字';
      lenDesc = ({ short: '约 400 字', mid: '约 700 字', long: '约 1200 字' })[length] || '约 700 字';
    }

    const full = `你是一位经验丰富的中文内容创作者。请写一篇 ${platformDesc}。

标题: ${title}
内容模式: ${modeDesc}
调性: ${tone}
长度: ${lenDesc}

要求:
${prompt}

直接输出正文内容，不要加引号、标题或额外说明。`;

    let generatedBody = '';
    try {
      const out = await window.claude.complete(full);
      generatedBody = out;
      setBody(out);
      setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'ok' } : e));
    } catch (e) {
      setError(e.message || '生成失败');
      setLoading(false);
      setImageStage('idle');
      setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'fail' } : e));
      return;
    }

    // Branch by mode
    if (mode === 'text') {
      setImageStage('done');
      setLoading(false);
      setGeneratedVideo(null);
      return;
    }

    if (mode === 'mix') {
      // Stage 2: generate cover + body images using image Key
      setImageStage('cover');
      logCall({ key: keyImage, role: 'image', status: 'running', desc: '生成封面图' });
      try {
        await generateCoverFromContext(title, generatedBody, mode);
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'ok' } : e));
      } catch {
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'fail' } : e));
      }

      setImageStage('images');
      logCall({ key: keyImage, role: 'image', status: 'running', desc: '生成 4 张正文配图' });
      try {
        await generateGalleryFromContext(title, generatedBody, prompt);
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'ok' } : e));
      } catch {
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'fail' } : e));
      }
      setGeneratedVideo(null);
    } else if (mode === 'video') {
      // Stage 2: generate video from script using video Key
      setGalleryAssets([]);
      setImageStage('cover');
      logCall({ key: keyImage || keyVideo, role: keyImage ? 'image' : 'video', status: 'running', desc: '生成视频封面' });
      try {
        await generateCoverFromContext(title, generatedBody, mode);
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'ok' } : e));
      } catch {
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'fail' } : e));
      }

      setImageStage('video');
      logCall({ key: keyVideo, role: 'video', status: 'running', desc: '基于脚本生成视频' });
      try {
        await generateVideoFromScript(title, generatedBody, length, customDuration);
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'ok' } : e));
      } catch {
        setCallLog(prev => prev.map((e, i) => i === prev.length - 1 ? { ...e, status: 'fail' } : e));
      }
    }

    setImageStage('done');
    setLoading(false);
  };

  // --- Video generation (video mode) — simulate by computing duration metadata
  const generateVideoFromScript = async (titleStr, scriptStr, lengthId, custom) => {
    const seconds = lengthId === 'custom'
      ? (parseInt(custom, 10) || 60)
      : ({ short: 15, mid: 30, long: 45 })[lengthId] || 30;
    // Simulate latency for the video model
    await new Promise(r => setTimeout(r, 1500));
    const txt = (titleStr + scriptStr).slice(0, 400);
    let h = 0; for (let i = 0; i < txt.length; i++) { h = (h * 31 + txt.charCodeAt(i)) >>> 0; }
    setGeneratedVideo({
      id: 'vid-' + Date.now(),
      title: titleStr,
      duration: seconds,
      shots: Math.max(3, Math.round(seconds / 5)),
      resolution: '1080×1920',
      hue: h % 360,
    });
  };

  // --- Cover generation: re-pick hue based on AI scene suggestion -----------
  const generateCoverFromContext = async (titleStr, bodyStr, modeStr) => {
    // Lightweight: pick a deterministic hue based on hash of body+title for now,
    // simulate AI choosing a coherent palette.
    const txt = (titleStr + bodyStr).slice(0, 400);
    let h = 0; for (let i = 0; i < txt.length; i++) { h = (h * 31 + txt.charCodeAt(i)) >>> 0; }
    setCoverAsset(null); // disable manually-picked asset, use generated
    setCoverHue(h % 360);
    setCoverRemoved(false);
    setCoverRegenKey(k => k + 1);
  };

  // --- Gallery image generation (mix mode) ----------------------------------
  const generateGalleryFromContext = async (titleStr, bodyStr, promptStr) => {
    const ask = `你是一位资深视觉内容总监。基于下面这篇内容，提取 4 个最适合配图的画面（用于自动生成图片素材）。

标题: ${titleStr}
正文（节选）: ${bodyStr.slice(0, 800)}
作者指令: ${promptStr}

要求:
- 每张图给一个 5-12 字的"场景标题"（简洁，例如"帐篷夜空 ·  广角"）
- 给一个色调主题（暖/冷/复古/治愈/高对比 等其中之一）

严格返回 JSON 数组（不要用 markdown 包裹）：
[{"name":"场景标题","tone":"暖"}]`;

    let arr = [];
    try {
      const out = await window.claude.complete(ask);
      const m = out.match(/\[[\s\S]*\]/);
      if (m) arr = JSON.parse(m[0]);
    } catch {}
    if (!arr.length) {
      arr = [
        { name: '场景 1', tone: '暖' },
        { name: '场景 2', tone: '治愈' },
        { name: '场景 3', tone: '复古' },
        { name: '场景 4', tone: '高对比' },
      ];
    }
    // Map tone -> hue
    const toneHue = {
      '暖': 28, '冷': 210, '复古': 38, '治愈': 90, '高对比': 0,
    };
    const items = arr.slice(0, 6).map((it, i) => ({
      id: `gen-${Date.now()}-${i}`,
      name: it.name || `场景 ${i+1}`,
      hue: (toneHue[it.tone] ?? (Math.random() * 360)) + (i * 13) % 30,
      aspect: 1,
      size: '—',
      used: 0,
      _aiGen: true,
    }));
    setGalleryAssets(items);
  };

  return (
    <Page active="editor"
      title="AI 编辑器"
      breadcrumb={linkedIdea ? '· 来自选题灵感' : '· 草稿 v3 · auto-saved'}
      right={<>
        <button className="pr-btn" onClick={() => setHistoryOpen(true)}>历史</button>
        <button className="pr-btn" onClick={() => setPreviewOpen(true)} disabled={!body}>预览</button>
        <button className="pr-btn primary" onClick={() => go('publish', { from: 'editor', title })} disabled={!body}>排期发布 →</button>
      </>}
      padded={false}>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 240px', height: '100%' }}>
        {/* LEFT: settings */}
        <aside className="pr-scroll" style={{ borderRight: `1px solid ${C.border}`, background: C.surface, padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {linkedIdea && (
            <LinkedIdeaBanner idea={linkedIdea} onDetach={() => setLinkedIdea(null)} onBack={() => go('ideas')} />
          )}

          <KeyPipelinePanel
            mode={mode}
            keyText={keyText}
            keyImage={keyImage}
            keyVideo={keyVideo}
            callLog={callLog}
            imageStage={imageStage}
            loading={loading}
            onConfigure={() => go('keys')}
          />

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>标题</div>
            <input className="pr-input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>目标平台</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {Object.entries(PLATFORMS).map(([id, p]) => {
                const on = platform === id;
                return (
                  <button key={id} onClick={() => setPlatform(id)} style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '10px 12px', border: `1px solid ${on ? C.ink : C.border}`,
                    background: on ? '#efece4' : C.surface,
                    borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all .12s',
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>内容模式</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {MODE_OPTIONS.map(m => {
                const on = mode === m.id;
                return (
                  <button key={m.id} onClick={() => {
                    setMode(m.id);
                    // Reset length if switching between video and non-video
                    if (m.id === 'video' && !['short','mid','long','custom'].includes(length)) setLength('mid');
                    if (m.id !== 'video' && length === 'custom') setLength('mid');
                  }} style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '10px 8px', border: `1px solid ${on ? C.ink : C.border}`,
                    background: on ? '#efece4' : C.surface,
                    borderRadius: 7, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: on ? 600 : 500 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: C.text3, marginTop: 3 }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>调性</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TONE_OPTIONS.map(t => (
                <span key={t} className={`pr-pill click ${tone === t ? 'active' : ''}`} onClick={() => setTone(t)}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>长度</div>
            <div style={{ display: 'grid', gridTemplateColumns: mode === 'video' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 6 }}>
              {(mode === 'video' ? LENGTH_VIDEO_OPTIONS : LENGTH_TEXT_OPTIONS).map(l => {
                const on = length === l.id;
                return (
                  <button key={l.id} onClick={() => setLength(l.id)} style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '10px 4px', border: `1px solid ${on ? C.ink : C.border}`,
                    background: on ? '#efece4' : C.surface,
                    borderRadius: 7, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{l.label}</div>
                    <div style={{ fontSize: 10, color: C.text3, marginTop: 2, fontFamily: MONO }}>{l.desc}</div>
                  </button>
                );
              })}
            </div>
            {mode === 'video' && length === 'custom' && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="pr-input"
                  type="number"
                  min="1"
                  value={customDuration}
                  onChange={e => setCustomDuration(e.target.value)}
                  placeholder="时长"
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: C.text2 }}>秒</span>
              </div>
            )}
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>指令 ·  自由发挥</div>
            <textarea className="pr-input" value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} style={{ resize: 'vertical', minHeight: 120 }} />
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button className="pr-btn accent" style={{ width: '100%', height: 40, justifyContent: 'center' }} onClick={generate} disabled={loading}>
              {loading ? Icon.spinner : Icon.sparkle}
              <span>{loading ? '生成中…' : (body ? '↻ 重新生成' : '生成正文')}</span>
            </button>
            {error && <div style={{ marginTop: 8, fontSize: 12, color: C.bad }}>{error}</div>}
          </div>
        </aside>

        {/* CENTER: preview / editor */}
        <main className="pr-scroll" style={{ background: C.bg, overflow: 'auto' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 40px' }}>
            <PreviewSurface
              title={title}
              body={body}
              loading={loading}
              didStart={didStart}
              platform={platform}
              mode={mode}
              imageStage={imageStage}
              generatedVideo={generatedVideo}
              onChange={setBody}
              onGenerate={generate}
              coverHue={coverHue}
              coverAsset={coverAsset}
              coverRemoved={coverRemoved}
              coverRegenKey={coverRegenKey}
              onCoverClick={(rect) => setCoverAnchor(rect)}
              onCoverAdd={() => { setCoverRemoved(false); setCoverHue(28); }}
              galleryAssets={galleryAssets}
              onGalleryAdd={() => go('assets', { from: 'editor-cover', target: 'gallery' })}
              onGalleryRemove={(id) => setGalleryAssets(g => g.filter(x => x.id !== id))}
              onGalleryReorder={(from, to) => {
                setGalleryAssets(g => {
                  const next = g.slice();
                  const [m] = next.splice(from, 1);
                  next.splice(to, 0, m);
                  return next;
                });
              }}
            />
          </div>
        </main>

        {/* RIGHT: assistive panel */}
        <aside className="pr-scroll" style={{ borderLeft: `1px solid ${C.border}`, background: C.surface, padding: 18, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span className="pr-label">状态</span>
              <span style={{ fontSize: 11, color: C.text3 }}>● 自动保存</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
              <span style={{ color: C.text2 }}>字数</span>
              <span style={{ fontFamily: MONO, fontWeight: 500 }}>{wordCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
              <span style={{ color: C.text2 }}>段落</span>
              <span style={{ fontFamily: MONO, fontWeight: 500 }}>{body ? body.split(/\n\n+/).filter(Boolean).length : 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
              <span style={{ color: C.text2 }}>版本</span>
              <span style={{ fontFamily: MONO, fontWeight: 500 }}>v6</span>
            </div>
          </div>

          <QuickRewrite disabled={!body} onApply={(t) => { setPrompt(p => p + '\n\n现在请：' + t); generate(); }} />

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div className="pr-label" style={{ marginBottom: 8 }}>素材</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: `linear-gradient(135deg, hsl(${i*47} 35% 86%), hsl(${i*47+30} 28% 76%))` }} />
              ))}
            </div>
            <button className="pr-btn ghost sm" style={{ width: '100%', marginTop: 8 }} onClick={() => go('assets')}>从素材库选 →</button>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {historyOpen && <HistoryDrawer currentBody={body} currentTitle={title} onClose={() => setHistoryOpen(false)} onRevert={(v) => { if (v.body) setBody(v.body); setHistoryOpen(false); }} />}
      {previewOpen && <PreviewModal title={title} body={body} platform={platform} onClose={() => setPreviewOpen(false)} />}
      {coverAnchor && <CoverActionsPopover
        anchorRect={coverAnchor}
        onClose={() => setCoverAnchor(null)}
        onSelectAsset={() => { setCoverAnchor(null); go('assets', { from: 'editor-cover' }); }}
        onAIGen={() => { setCoverHue(h => (h + 73) % 360); setCoverAsset(null); setCoverRegenKey(k => k + 1); setCoverRemoved(false); }}
        onUpload={() => { setCoverHue(180); setCoverAsset(null); setCoverRemoved(false); setCoverAnchor(null); }}
        onRemove={() => { setCoverRemoved(true); setCoverAnchor(null); }}
      />}
    </Page>
  );
}

function PreviewSurface({ title, body, loading, didStart, platform, mode, imageStage, generatedVideo, onChange, onGenerate, coverHue, coverAsset, coverRemoved, coverRegenKey, onCoverClick, onCoverAdd, galleryAssets, onGalleryAdd, onGalleryRemove, onGalleryReorder }) {
  const coverRef = React.useRef(null);
  const handleCoverClick = () => {
    if (coverRef.current && onCoverClick) {
      onCoverClick(coverRef.current.getBoundingClientRect());
    }
  };

  // empty state
  if (!didStart && !body) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: C.text3 }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: C.accentSoft, color: C.accentText, marginBottom: 20 }}>{Icon.sparkle}</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: '0 0 8px' }}>给 AI 一点指令，开始起稿</h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 22px' }}>
          左侧填写标题、选好平台和调性，点 <strong style={{ color: C.text }}>生成正文</strong>。生成后你可以直接修改这里的文字。
        </p>
        <button className="pr-btn accent" onClick={onGenerate} style={{ height: 36 }}>{Icon.sparkle}<span>生成正文</span></button>
      </div>
    );
  }

  // loading state
  if (loading && !body) {
    const stageLabel = imageStage === 'images' ? '配图生成中…' : 'AI 正在思考…';
    return (
      <div style={{ padding: '40px 0' }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 24px', color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.accentText, fontSize: 13, marginBottom: 20 }}>
          {Icon.spinner}<span>{stageLabel} ·  约 5-10 秒</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[100, 95, 88, 70, 92, 85, 60].map((w, i) => (
            <div key={i} style={{ height: 12, width: w + '%', background: '#ece9e0', borderRadius: 4, animation: `pr-pulse 1.6s ease-in-out ${i * 0.1}s infinite` }} />
          ))}
        </div>
        <style>{`@keyframes pr-pulse { 0%, 100% { opacity: .6 } 50% { opacity: 1 } }`}</style>
      </div>
    );
  }

  // editable preview
  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 24px', color: C.text, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{title}</h1>

      {/* Cover */}
      {coverRemoved ? (
        <button onClick={onCoverAdd} style={{
          all: 'unset', cursor: 'pointer',
          width: '100%', aspectRatio: '4/3', maxHeight: 200,
          borderRadius: 10, marginBottom: 24,
          border: `1.5px dashed ${C.borderStrong}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6, color: C.text3,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>添加封面</span>
        </button>
      ) : (
        <div
          ref={coverRef}
          onClick={handleCoverClick}
          key={coverRegenKey}
          style={{
            aspectRatio: '4/3', maxHeight: 320, borderRadius: 10,
            background: coverAsset
              ? `linear-gradient(135deg, hsl(${coverAsset.hue} 35% 86%), hsl(${(coverAsset.hue + 30) % 360} 30% 75%))`
              : `linear-gradient(135deg, hsl(${coverHue} 50% 86%), hsl(${(coverHue + 20) % 360} 45% 78%))`,
            marginBottom: 24, position: 'relative',
            cursor: 'pointer',
            transition: 'box-shadow .15s, transform .15s',
            animation: coverRegenKey > 0 ? 'pr-fadein .3s ease-out' : undefined,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          {coverAsset && (
            <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontFamily: MONO, borderRadius: 4 }}>
              {coverAsset.name}
            </div>
          )}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '5px 10px', background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 11, fontWeight: 500, borderRadius: 6,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            点击编辑封面
          </div>
        </div>
      )}

      <textarea
        value={body}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', border: 'none', outline: 'none', resize: 'none',
          fontFamily: FONT, fontSize: 15, lineHeight: 1.75, color: C.text,
          background: 'transparent', minHeight: 400,
        }}
        rows={Math.max(20, body.split('\n').length + 4)}
      />

      {/* Image gallery — only in mix mode */}
      {mode === 'mix' && (
        <ImageGallery
          items={galleryAssets || []}
          onAdd={onGalleryAdd}
          onRemove={onGalleryRemove}
          onReorder={onGalleryReorder}
          loading={loading && imageStage === 'images'}
        />
      )}

      {/* Video player — only in video mode */}
      {mode === 'video' && (
        <VideoPlayer video={generatedVideo} loading={loading && imageStage === 'video'} />
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: C.text3 }}>
        <span>● auto-saved</span>
        <span>· {body.length} 字符</span>
        <span>· {(galleryAssets?.length || 0)} 张图</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          按 <span className="pr-kbd">⌘ K</span> 调出 AI 改写
        </span>
      </div>
      <style>{`@keyframes pr-fadein { from { opacity: 0; transform: scale(.98) } to { opacity: 1; transform: none } }`}</style>
    </div>
  );
}

Object.assign(window, { PageEditor });

// ============================================================================
// KeyPipelinePanel — shows which Keys will be called for the current mode
// ============================================================================
function KeyPipelinePanel({ mode, keyText, keyImage, keyVideo, callLog, imageStage, loading, onConfigure }) {
  // Build the chain for the current mode
  const chain = React.useMemo(() => {
    if (mode === 'text')  return [{ role: 'text',  k: keyText  }];
    if (mode === 'mix')   return [{ role: 'text',  k: keyText  }, { role: 'image', k: keyImage }];
    if (mode === 'video') return [{ role: 'text',  k: keyText  }, { role: 'video', k: keyVideo }];
    return [];
  }, [mode, keyText, keyImage, keyVideo]);

  const ROLE_META = (typeof ROLES !== 'undefined') ? ROLES : {
    text:  { icon: '✎', label: '文字模型', color: '#1a1a1a' },
    image: { icon: '🖼', label: '图片模型', color: '#7c3aed' },
    video: { icon: '▶', label: '视频模型', color: '#cd5a3a' },
  };

  // Determine which step is currently running
  const currentStepRole =
    imageStage === 'text' ? 'text' :
    imageStage === 'cover' || imageStage === 'images' ? 'image' :
    imageStage === 'video' ? 'video' : null;

  return (
    <div style={{
      padding: 12, border: `1px solid ${C.border}`, borderRadius: 8,
      background: C.surface2,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="pr-label">调用链路</span>
        <button onClick={onConfigure} className="pr-btn ghost sm" style={{ height: 22, padding: '0 8px', fontSize: 11 }}>
          Key 管理 →
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chain.map((step, i) => {
          const meta = ROLE_META[step.role];
          const missing = !step.k;
          const isRunning = loading && currentStepRole === step.role && (mode !== 'mix' || imageStage !== (i === 0 ? 'text' : 'text'));
          const logEntry = callLog.find(l => l.role === step.role && l.status === 'running');
          const completedLogs = callLog.filter(l => l.role === step.role && l.status === 'ok');
          return (
            <div key={i}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 6,
                background: missing ? C.badSoft : isRunning ? C.accentSoft : C.surface,
                border: `1px solid ${missing ? C.bad : isRunning ? C.accent : C.border}`,
                transition: 'all .15s',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: missing ? C.bad : isRunning ? C.accent : C.ink, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flex: '0 0 auto',
                }}>{i + 1}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: missing ? C.bad : C.text }}>
                  {meta.icon} {meta.label}
                </span>
                {isRunning && (
                  <span style={{ marginLeft: 'auto', color: C.accent, display: 'inline-flex' }}>{Icon.spinner}</span>
                )}
                {completedLogs.length > 0 && !isRunning && (
                  <span style={{ marginLeft: 'auto', color: C.good, fontSize: 12 }}>✓</span>
                )}
              </div>
              {missing ? (
                <div style={{ fontSize: 10, color: C.bad, padding: '4px 8px 0 28px' }}>
                  未配置 ·  <a href="#keys" onClick={(e) => { e.preventDefault(); onConfigure(); }} style={{ color: C.bad, textDecoration: 'underline' }}>新建</a>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: C.text3, padding: '3px 8px 0 28px', fontFamily: MONO, lineHeight: 1.4 }}>
                  {step.k.name}<br/>
                  <span style={{ opacity: 0.7 }}>{step.k.model}</span>
                </div>
              )}
              {i < chain.length - 1 && (
                <div style={{ textAlign: 'center', padding: '2px 0', color: C.text3 }}>↓</div>
              )}
            </div>
          );
        })}
      </div>

      {callLog.length > 0 && !loading && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>本次调用</div>
          {callLog.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text2, padding: '2px 0' }}>
              <span>{l.desc}</span>
              <span style={{ color: l.status === 'ok' ? C.good : l.status === 'fail' ? C.bad : C.text3 }}>
                {l.status === 'ok' ? '✓' : l.status === 'fail' ? '✗' : '…'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VideoPlayer — shows the "generated" video (placeholder)
// ============================================================================
function VideoPlayer({ video, loading }) {
  if (loading) {
    return (
      <div style={{ marginTop: 18, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: C.accentText, fontSize: 12 }}>
          {Icon.spinner}<span style={{ fontWeight: 500 }}>视频模型正在基于脚本渲染… ·  通常需 30–60 秒</span>
        </div>
        <div style={{
          aspectRatio: '9 / 16', maxHeight: 460, margin: '0 auto',
          background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(205,90,58,0.3), transparent 50%)', animation: 'pr-pulse 2s ease-in-out infinite' }} />
          <div style={{ position: 'relative', fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: MONO }}>渲染中…</div>
        </div>
        <style>{`@keyframes pr-pulse { 0%, 100% { opacity: .4 } 50% { opacity: 1 } }`}</style>
      </div>
    );
  }
  if (!video) return null;
  return (
    <div style={{ marginTop: 18, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>生成的视频</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: C.text3, fontFamily: MONO }}>
            {video.duration}s ·  {video.shots} 个镜头 ·  {video.resolution}
          </span>
        </div>
        <button className="pr-btn sm">下载 MP4</button>
      </div>
      <div style={{
        aspectRatio: '9 / 16', maxHeight: 460, margin: '0 auto',
        background: `linear-gradient(135deg, hsl(${video.hue} 50% 30%), hsl(${(video.hue + 60) % 360} 45% 20%))`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
      }}>
        <button style={{
          all: 'unset', cursor: 'pointer',
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div style={{
          position: 'absolute', bottom: 12, left: 12, right: 12,
          color: '#fff', fontSize: 12, fontWeight: 500,
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>{video.title}</div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '3px 8px', background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontSize: 10, fontFamily: MONO, borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>✦ AI</div>
      </div>
    </div>
  );
}

// ============================================================================
// ImageGallery — horizontal strip of additional images attached to the post
// ============================================================================
function ImageGallery({ items, onAdd, onRemove, onReorder, loading }) {
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);

  const onDragStart = (i) => (e) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(i)); } catch {}
  };
  const onDragOver = (i) => (e) => {
    e.preventDefault();
    if (overIdx !== i) setOverIdx(i);
  };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    if (dragIdx != null && dragIdx !== i) onReorder(dragIdx, i);
    setDragIdx(null); setOverIdx(null);
  };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  // Loading state — show 4 placeholder tiles
  if (loading) {
    return (
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: C.accentText, fontSize: 12 }}>
          {Icon.spinner}<span style={{ fontWeight: 500 }}>AI 正在根据正文生成配图…</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              aspectRatio: 1, borderRadius: 8,
              background: '#ece9e0',
              animation: `pr-pulse 1.6s ease-in-out ${i * 0.12}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pr-pulse { 0%, 100% { opacity: .5 } 50% { opacity: 1 } }`}</style>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ marginTop: 18, marginBottom: 8 }}>
        <button onClick={onAdd} style={{
          all: 'unset', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px 18px',
          border: `1.5px dashed ${C.borderStrong}`, borderRadius: 8,
          color: C.text3, fontSize: 13, fontWeight: 500,
          transition: 'border-color .12s, color .12s, background .12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; e.currentTarget.style.background = C.surface2; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.text3; e.currentTarget.style.background = 'transparent'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>添加图片素材（封面之外）</span>
          <span style={{ fontSize: 11, color: C.text3 }}>· 0 / 18</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>图片素材</span>
          <span style={{ fontSize: 11, color: C.text3 }}>{items.length} / 18 · 拖动重排</span>
        </div>
        <button className="pr-btn sm" onClick={onAdd}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>添加</span>
        </button>
      </div>
      <div className="pr-scroll" style={{
        display: 'grid', gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(140px, 140px)',
        gap: 10, overflowX: 'auto',
        padding: '4px 0 12px',
      }}>
        {items.map((it, i) => {
          const isDragging = dragIdx === i;
          const isOver = overIdx === i && dragIdx !== i;
          return (
            <div key={it.id}
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDrop={onDrop(i)}
              onDragEnd={onDragEnd}
              style={{
                position: 'relative',
                aspectRatio: it.aspect || 1,
                borderRadius: 8, overflow: 'hidden',
                cursor: 'grab',
                background: `linear-gradient(135deg, hsl(${it.hue} 35% 86%), hsl(${(it.hue + 30) % 360} 30% 75%))`,
                outline: isOver ? `2px solid ${C.ink}` : 'none',
                outlineOffset: 2,
                opacity: isDragging ? 0.4 : 1,
                transition: 'opacity .15s',
              }}>
              {/* Index badge */}
              <div style={{
                position: 'absolute', top: 6, left: 6,
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, fontFamily: MONO,
              }}>{i + 1}</div>
              {/* AI badge */}
              {it._aiGen && (
                <div style={{
                  position: 'absolute', top: 6, left: 34,
                  padding: '2px 6px', background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: 9, fontWeight: 600, borderRadius: 8,
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>
                  AI
                </div>
              )}
              {/* Filename overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '16px 8px 6px', color: '#fff', fontSize: 10, fontFamily: MONO,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
              }}>{it.name}</div>
              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(it.id); }}
                style={{
                  all: 'unset', cursor: 'pointer',
                  position: 'absolute', top: 6, right: 6,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                title="移除">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <div style={{
                position: 'absolute', inset: 0,
                cursor: 'grab',
              }}
                onMouseEnter={e => {
                  const btn = e.currentTarget.parentElement.querySelector('button');
                  if (btn) btn.style.opacity = 1;
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget.parentElement.querySelector('button');
                  if (btn) btn.style.opacity = 0;
                }}
                />
            </div>
          );
        })}
        {/* Add tile */}
        <button onClick={onAdd} style={{
          all: 'unset', cursor: 'pointer',
          aspectRatio: 1,
          border: `1.5px dashed ${C.borderStrong}`, borderRadius: 8,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
          color: C.text3,
          transition: 'border-color .12s, color .12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.text3; }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span style={{ fontSize: 11, fontWeight: 500 }}>添加</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// QuickRewrite — grouped quick AI rewrite commands
// ============================================================================
const REWRITE_GROUPS = [
  { id: 'style', label: '风格', items: ['更口语化', '更专业', '更短一点', '更长更细', '加 5 个 emoji', '去掉所有 emoji'] },
  { id: 'struct', label: '结构', items: ['加金句开头', '加结尾 CTA', '改成对比结构', '加 3 个互动问题', '加列表小标题', '提取金句卡片'] },
  { id: 'platform', label: '换平台', items: ['换 TikTok 脚本', '换 YouTube 长视频', '换 Facebook 长帖', '一稿四改（全平台）'] },
  { id: 'check', label: '检查', items: ['敏感词检查', '事实核查', '品牌词出现频次', '提 3 个不同标题'] },
];

function QuickRewrite({ disabled, onApply }) {
  const [group, setGroup] = React.useState('style');
  const items = REWRITE_GROUPS.find(g => g.id === group).items;

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="pr-label">快速改写</span>
        {disabled && <span style={{ fontSize: 10, color: C.text3 }}>生成正文后启用</span>}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, padding: 3, background: C.surface2, borderRadius: 6, border: `1px solid ${C.border}` }}>
        {REWRITE_GROUPS.map(g => (
          <button key={g.id} onClick={() => setGroup(g.id)} style={{
            all: 'unset', cursor: 'pointer',
            flex: 1, textAlign: 'center', padding: '5px 0', borderRadius: 4,
            fontSize: 11, fontWeight: 500,
            background: group === g.id ? C.surface : 'transparent',
            color: group === g.id ? C.text : C.text2,
            boxShadow: group === g.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
          }}>{g.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(t => (
          <button key={t} className="pr-btn sm" disabled={disabled} style={{ justifyContent: 'flex-start', height: 28, fontSize: 12 }}
            onClick={() => onApply(t)}>
            {Icon.sparkle}<span>{t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LinkedIdeaBanner — shown in editor settings panel when arrived from an idea
// ============================================================================
function LinkedIdeaBanner({ idea, onDetach, onBack }) {
  const hue = ((idea.thumb || 1) * 53) % 360;
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 8,
      background: C.accentSoft,
      border: `1px solid ${C.accentSoft}`,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: C.accentText, marginBottom: 8 }}>
        {Icon.sparkle}<span>来自选题</span>
        <button onClick={onDetach} className="pr-btn ghost icon" style={{ marginLeft: 'auto', width: 20, height: 20 }} title="解除关联">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 6, flex: '0 0 auto',
          background: `linear-gradient(135deg, hsl(${hue} 40% 88%), hsl(${(hue + 30) % 360} 30% 78%))`,
        }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>{idea.title}</div>
          {idea.angle && <div style={{ fontSize: 11, color: C.text2, marginTop: 4, lineHeight: 1.4 }}>{idea.angle}</div>}
          <button onClick={onBack} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 11, color: C.accentText, marginTop: 6,
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>← 返回选题</button>
        </div>
      </div>
    </div>
  );
}
