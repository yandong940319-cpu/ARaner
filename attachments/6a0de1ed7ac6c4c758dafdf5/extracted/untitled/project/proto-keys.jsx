// proto-keys.jsx — Key 管理: 按角色（文字 / 图片 / 视频）组织 + 路由策略

// LocalStorage key for persisting Keys + helpers for the editor to read defaults
const KEYS_STORAGE_KEY = 'proto-keys';

function loadKeys() {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function saveKeys(keys) {
  try { localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys)); } catch {}
}
// Read the default Key for a given role (text / image / video)
function getDefaultKey(role) {
  const all = loadKeys() || DEFAULT_KEYS;
  return all.find(k => k.role === role && k.isDefault && k.active)
      || all.find(k => k.role === role && k.active)
      || null;
}

// ---- Providers (with the roles each can serve) ----------------------------
const PROVIDERS = [
  // text/script generators
  { id: 'anthropic', name: 'Anthropic',   hint: 'sk-ant-...', color: '#cd5a3a', roles: ['text'],            models: ['claude-haiku-4-5', 'claude-sonnet-4-5', 'claude-opus-4'] },
  { id: 'openai',    name: 'OpenAI',      hint: 'sk-...',     color: '#10a37f', roles: ['text', 'image'],   models: ['gpt-4o', 'gpt-4-turbo', 'dall-e-3'] },
  { id: 'gemini',    name: 'Google Gemini', hint: 'AIza...',  color: '#4285f4', roles: ['text'],            models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'qwen',      name: '通义千问',     hint: 'sk-...',    color: '#615ced', roles: ['text'],            models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] },
  { id: 'doubao',    name: '豆包',          hint: 'pat-...',   color: '#1664ff', roles: ['text', 'video'],   models: ['doubao-pro-32k', 'doubao-seedance-1.0'] },
  { id: 'deepseek',  name: 'DeepSeek',     hint: 'sk-...',    color: '#4d6bfe', roles: ['text'],            models: ['deepseek-chat', 'deepseek-coder'] },
  // image generators
  { id: 'midjourney',name: 'Midjourney',   hint: 'mj-...',     color: '#000000', roles: ['image'],           models: ['midjourney-v7', 'midjourney-niji-7'] },
  { id: 'flux',      name: 'FLUX',         hint: 'flx-...',    color: '#7c3aed', roles: ['image'],           models: ['flux-1.1-pro', 'flux-schnell'] },
  { id: 'recraft',   name: 'Recraft',      hint: 'rc-...',     color: '#ff5722', roles: ['image'],           models: ['recraft-v3'] },
  // video generators
  { id: 'sora',      name: 'Sora (OpenAI)', hint: 'sora-...', color: '#10a37f', roles: ['video'],           models: ['sora-1.0-turbo', 'sora-1.0'] },
  { id: 'kling',     name: '可灵 Kling',    hint: 'kl-...',   color: '#ff6b00', roles: ['video'],           models: ['kling-v2-master', 'kling-v1.6-pro'] },
  { id: 'runway',    name: 'Runway',       hint: 'rw-...',    color: '#000000', roles: ['video'],           models: ['gen-4', 'gen-3-alpha'] },
];

// ---- Roles (= what the key is used for in the AI pipeline) ----------------
const ROLES = {
  text:  { id: 'text',  label: '文字模型',     icon: '✎', desc: '生成正文、脚本、选题',  color: '#1a1a1a' },
  image: { id: 'image', label: '图片模型',     icon: '🖼', desc: '生成封面、配图',         color: '#7c3aed' },
  video: { id: 'video', label: '视频模型',     icon: '▶', desc: '生成视频镜头',           color: '#cd5a3a' },
};

// ---- Default mock keys (each tied to a role) ------------------------------
const DEFAULT_KEYS = [
  { id: 'k1', name: '主力 ·  Claude 文字',  role: 'text',  provider: 'anthropic',  model: 'claude-haiku-4-5', secret: 'sk-ant-api03-XJ8d...4Hg7', active: true,  isDefault: true,  createdAt: '2026-03-12', lastUsed: '5 分钟前', monthCost: 12.40 },
  { id: 'k2', name: '备用 ·  GPT-4o',        role: 'text',  provider: 'openai',     model: 'gpt-4o',           secret: 'sk-proj-yhM...92zL',     active: true,  isDefault: false, createdAt: '2026-04-02', lastUsed: '2 小时前', monthCost: 4.80 },
  { id: 'k3', name: '主力 ·  Midjourney',    role: 'image', provider: 'midjourney', model: 'midjourney-v7',    secret: 'mj-fae0...c1b8',          active: true,  isDefault: true,  createdAt: '2026-04-10', lastUsed: '1 小时前', monthCost: 8.20 },
  { id: 'k4', name: '备用 ·  FLUX',          role: 'image', provider: 'flux',       model: 'flux-1.1-pro',     secret: 'flx-92ad...77ee',         active: true,  isDefault: false, createdAt: '2026-04-22', lastUsed: '昨日',     monthCost: 2.10 },
  { id: 'k5', name: '主力 ·  Sora',          role: 'video', provider: 'sora',       model: 'sora-1.0-turbo',   secret: 'sora-c8d3...44b1',        active: true,  isDefault: true,  createdAt: '2026-05-08', lastUsed: '昨日',     monthCost: 18.60 },
  { id: 'k6', name: '国内 ·  可灵',          role: 'video', provider: 'kling',      model: 'kling-v2-master',  secret: 'kl-71fd...09a4',          active: true,  isDefault: false, createdAt: '2026-05-12', lastUsed: '未使用',    monthCost: 0 },
];

function maskKey(s) {
  if (!s) return '';
  if (s.length <= 12) return s;
  return s.slice(0, 8) + '…' + s.slice(-6);
}

function PageKeys() {
  const [keys, setKeys] = React.useState(() => loadKeys() || DEFAULT_KEYS);
  const [q, setQ] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [revealed, setRevealed] = React.useState(new Set());
  const [editor, setEditor] = React.useState(null);
  const [toDelete, setToDelete] = React.useState(null);

  // Persist whenever keys change
  React.useEffect(() => { saveKeys(keys); }, [keys]);

  const filtered = keys.filter(k => {
    if (roleFilter !== 'all' && k.role !== roleFilter) return false;
    if (q && !(k.name.includes(q) || k.secret.includes(q))) return false;
    return true;
  });

  const toggleReveal = (id) => setRevealed(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleActive = (id) => setKeys(ks => ks.map(k => k.id === id ? { ...k, active: !k.active } : k));

  // Setting default only sets default within the same role
  const setDefault = (id) => {
    const target = keys.find(k => k.id === id);
    if (!target) return;
    setKeys(ks => ks.map(k => k.role === target.role ? { ...k, isDefault: k.id === id } : k));
  };

  const saveKey = (data) => {
    if (editor.mode === 'edit') {
      setKeys(ks => ks.map(k => k.id === editor.key.id ? { ...k, ...data } : k));
    } else {
      const id = 'k' + Date.now();
      // If first key in this role, default it automatically
      const sameRoleExists = keys.some(k => k.role === data.role);
      setKeys(ks => [{
        id, ...data,
        active: true, isDefault: !sameRoleExists,
        createdAt: new Date().toISOString().slice(0, 10),
        lastUsed: '未使用', monthCost: 0,
      }, ...ks]);
    }
    setEditor(null);
  };

  const deleteKey = () => {
    setKeys(ks => ks.filter(k => k.id !== toDelete.id));
    setToDelete(null);
  };

  // Helper: get default key per role
  const defaultOf = (role) => keys.find(k => k.role === role && k.isDefault && k.active);

  return (
    <Page active="keys"
      title="Key 管理"
      breadcrumb={'· 按角色调度大模型'}
      right={<>
        <button className="pr-btn primary" onClick={() => setEditor({ mode: 'create' })}>
          {Icon.plus}<span>新建 Key</span>
        </button>
      </>}>

      {/* Routing strategy card */}
      <div className="pr-card" style={{ marginBottom: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>路由策略</div>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>按内容模式自动选择 Key ·  可在每个角色内切换默认</div>
          </div>
          <span style={{ fontSize: 11, color: C.text3, fontFamily: MONO }}>编辑器 ·  生成流程</span>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <RouteCard
            mode="纯文字"
            chain={[{ role: 'text', label: defaultOf('text')?.name || '未配置 ·  请新建' }]}
            defaultKey={defaultOf('text')}
            onClick={() => setRoleFilter('text')}
          />
          <RouteCard
            mode="文字 + 图片"
            chain={[
              { role: 'text',  label: defaultOf('text')?.name  || '未配置' },
              { role: 'image', label: defaultOf('image')?.name || '未配置' },
            ]}
            onClick={() => setRoleFilter('all')}
          />
          <RouteCard
            mode="视频"
            chain={[
              { role: 'text',  label: defaultOf('text')?.name  || '未配置' },
              { role: 'video', label: defaultOf('video')?.name || '未配置' },
            ]}
            onClick={() => setRoleFilter('all')}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <SummaryCard label="文字 Key"
          value={keys.filter(k => k.role === 'text' && k.active).length}
          hint={`默认: ${defaultOf('text')?.name?.replace(/.*· ?/, '') || '—'}`}
          color={ROLES.text.color} />
        <SummaryCard label="图片 Key"
          value={keys.filter(k => k.role === 'image' && k.active).length}
          hint={`默认: ${defaultOf('image')?.name?.replace(/.*· ?/, '') || '—'}`}
          color={ROLES.image.color} />
        <SummaryCard label="视频 Key"
          value={keys.filter(k => k.role === 'video' && k.active).length}
          hint={`默认: ${defaultOf('video')?.name?.replace(/.*· ?/, '') || '—'}`}
          color={ROLES.video.color} />
        <SummaryCard label="本月总消耗"
          value={'$' + keys.reduce((s, k) => s + k.monthCost, 0).toFixed(2)}
          hint={`预算 $50 ·  ${keys.reduce((s, k) => s + k.monthCost, 0) < 40 ? '健康' : '接近预算'}`}
          color={C.text} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.text3 }}>{Icon.search}</span>
          <input className="pr-input" placeholder="搜索名称或 key..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className={`pr-pill click ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>全部 {keys.length}</span>
          {Object.values(ROLES).map(r => (
            <span key={r.id} className={`pr-pill click ${roleFilter === r.id ? 'active' : ''}`} onClick={() => setRoleFilter(r.id)}>
              {r.icon} {r.label} {keys.filter(k => k.role === r.id).length}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="pr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1.3fr 2fr 1fr 1fr 110px', padding: '12px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.text3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>角色</div>
          <div>名称</div>
          <div>提供方 / 模型</div>
          <div>Key</div>
          <div>本月消耗</div>
          <div>状态</div>
          <div>操作</div>
        </div>
        {filtered.map((k, i) => {
          const provider = PROVIDERS.find(p => p.id === k.provider);
          const isRev = revealed.has(k.id);
          const role = ROLES[k.role];
          return (
            <div key={k.id} className="pr-row" style={{ gridTemplateColumns: '80px 1.5fr 1.3fr 2fr 1fr 1fr 110px', padding: '14px 18px', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`, opacity: k.active ? 1 : 0.55 }}>
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 11,
                  background: role.color === '#1a1a1a' ? '#efece4' : (role.id === 'image' ? '#f0e7ff' : '#fbeee7'),
                  color: role.color, fontSize: 11, fontWeight: 600,
                }}>
                  <span>{role.icon}</span>{role.label.replace('模型', '')}
                </span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{k.name}</span>
                  {k.isDefault && (
                    <span title={`${role.label}默认`} style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '1px 6px', borderRadius: 8,
                      background: C.accent, color: '#fff',
                      fontSize: 9, fontWeight: 700,
                    }}>默认</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 3, fontFamily: MONO }}>{k.createdAt} ·  {k.lastUsed}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: provider?.color }} />
                  <span style={{ fontSize: 13 }}>{provider?.name}</span>
                </div>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 2, fontFamily: MONO }}>{k.model}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ fontFamily: MONO, fontSize: 12, color: C.text2, background: C.surface2, padding: '4px 8px', borderRadius: 4 }}>
                  {isRev ? k.secret : maskKey(k.secret)}
                </code>
                <button className="pr-btn ghost icon sm" onClick={() => toggleReveal(k.id)} title={isRev ? '隐藏' : '显示'}>
                  {isRev ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
                <button className="pr-btn ghost icon sm" onClick={() => navigator.clipboard && navigator.clipboard.writeText(k.secret)} title="复制">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
              <div style={{ fontSize: 13, fontFamily: MONO }}>${k.monthCost.toFixed(2)}</div>
              <div>
                <Toggle on={k.active} onClick={() => toggleActive(k.id)} />
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="pr-btn ghost icon sm" onClick={() => setDefault(k.id)} disabled={k.isDefault || !k.active} title={`设为${role.label}默认`} style={{ opacity: (k.isDefault || !k.active) ? 0.3 : 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={k.isDefault ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
                </button>
                <button className="pr-btn ghost icon sm" onClick={() => setEditor({ mode: 'edit', key: k })} title="编辑">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                </button>
                <button className="pr-btn ghost icon sm" onClick={() => setToDelete(k)} title="删除">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: C.text3 }}>
            <div style={{ fontSize: 13, marginBottom: 12 }}>这里还没有 Key</div>
            <button className="pr-btn" onClick={() => setEditor({ mode: 'create' })}>{Icon.plus}<span>新建一个</span></button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: C.text3, display: 'flex', justifyContent: 'space-between' }}>
        <span>共 {filtered.length} 个 Key ·  ★ = 该角色的默认 Key</span>
        <span>密钥仅在浏览器加密存储 ·  不会上传到服务器</span>
      </div>

      {editor && <KeyEditorModal mode={editor.mode} initial={editor.key} onClose={() => setEditor(null)} onSave={saveKey} />}
      {toDelete && <DeleteConfirmModal name={toDelete.name} role={ROLES[toDelete.role]} onClose={() => setToDelete(null)} onConfirm={deleteKey} />}
    </Page>
  );
}

function SummaryCard({ label, value, hint, color }) {
  return (
    <div className="pr-card">
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span className="pr-label">{label}</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, marginTop: 6, fontFamily: typeof value === 'string' && value.startsWith('$') ? MONO : 'inherit' }}>{value}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{hint}</div>
      </div>
    </div>
  );
}

function RouteCard({ mode, chain, onClick }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, cursor: 'pointer', transition: 'border-color .12s, background .12s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.background = C.surface2; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent'; }}
      onClick={onClick}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 10 }}>
        当内容模式 = <strong style={{ color: C.text }}>{mode}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {chain.map((step, i) => {
          const role = ROLES[step.role];
          const missing = step.label.startsWith('未配置');
          return (
            <React.Fragment key={i}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 6,
                background: missing ? C.badSoft : (role.id === 'image' ? '#f0e7ff' : role.id === 'video' ? '#fbeee7' : '#efece4'),
                color: missing ? C.bad : role.color,
                fontSize: 11, fontWeight: 600,
                minWidth: 0, maxWidth: 160,
              }}>
                <span>{role.icon}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.label}</span>
              </div>
              {i < chain.length - 1 && (
                <span style={{ color: C.text3, fontSize: 14 }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer' }}>
      <span style={{ width: 32, height: 18, borderRadius: 9, background: on ? C.ink : '#dcd6c8', position: 'relative', display: 'inline-block', transition: 'background .15s' }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
      </span>
    </button>
  );
}

// ============================================================================
// Key editor modal — role-first
// ============================================================================
function KeyEditorModal({ mode, initial, onClose, onSave }) {
  const [role, setRole] = React.useState(initial?.role || 'text');
  const eligibleProviders = PROVIDERS.filter(p => p.roles.includes(role));

  const [name, setName] = React.useState(initial?.name || '');
  const [provider, setProvider] = React.useState(initial?.provider || eligibleProviders[0]?.id);
  const [model, setModel] = React.useState(initial?.model || eligibleProviders[0]?.models[0]);
  const [secret, setSecret] = React.useState(initial?.secret || '');
  const [showSecret, setShowSecret] = React.useState(false);
  const [testState, setTestState] = React.useState('idle');

  // Reset provider when role changes
  React.useEffect(() => {
    const list = PROVIDERS.filter(p => p.roles.includes(role));
    if (!list.find(p => p.id === provider)) {
      const p = list[0];
      if (p) { setProvider(p.id); setModel(p.models[0]); }
    }
  }, [role]);

  const providerObj = PROVIDERS.find(p => p.id === provider) || eligibleProviders[0];

  // Reset model when provider changes
  React.useEffect(() => {
    if (providerObj && !providerObj.models.includes(model)) setModel(providerObj.models[0]);
  }, [provider]);

  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = name.trim() && secret.trim().length > 8 && providerObj;

  const testConnection = () => {
    setTestState('testing');
    setTimeout(() => setTestState(secret.length > 12 ? 'ok' : 'fail'), 1200);
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(20,16,8,0.4)', animation: 'pr-fade .15s ease-out' }} />
      <div style={{
        position: 'relative', width: 580, maxHeight: 'calc(100vh - 48px)',
        background: C.surface, borderRadius: 12,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        animation: 'pr-zoom-in .18s cubic-bezier(.2,.7,.2,1)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{mode === 'edit' ? '编辑 Key' : '新建 Key'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>选择这个 Key 在 AI 流程中扮演的角色</p>
          </div>
          <button className="pr-btn ghost icon" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="pr-scroll" style={{ padding: '20px 22px', overflow: 'auto', flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Role picker — most important field */}
          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>角色 <span style={{ color: C.accent }}>*</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {Object.values(ROLES).map(r => {
                const on = role === r.id;
                return (
                  <button key={r.id} onClick={() => setRole(r.id)} disabled={mode === 'edit'} style={{
                    all: 'unset', cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                    padding: '12px 12px',
                    border: `1px solid ${on ? C.ink : C.border}`,
                    background: on ? '#efece4' : C.surface,
                    borderRadius: 7,
                    opacity: mode === 'edit' && !on ? 0.4 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{r.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.text3 }}>{r.desc}</div>
                  </button>
                );
              })}
            </div>
            {mode === 'edit' && (
              <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>角色创建后不可更改 ·  请新建</div>
            )}
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 6 }}>名称 <span style={{ color: C.accent }}>*</span></div>
            <input className="pr-input" value={name} onChange={e => setName(e.target.value)} placeholder={`例如：主力 ·  ${ROLES[role].label}`} autoFocus />
          </div>

          <div>
            <div className="pr-label" style={{ marginBottom: 8 }}>
              提供方
              <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: C.text3, fontSize: 10 }}>
                只显示支持 {ROLES[role].label} 的提供方
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {eligibleProviders.map(p => {
                const on = provider === p.id;
                return (
                  <button key={p.id} onClick={() => setProvider(p.id)} style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '10px 12px', border: `1px solid ${on ? C.ink : C.border}`,
                    background: on ? '#efece4' : C.surface,
                    borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {providerObj && (
            <div>
              <div className="pr-label" style={{ marginBottom: 6 }}>模型</div>
              <select className="pr-input" value={model} onChange={e => setModel(e.target.value)} style={{ fontFamily: MONO }}>
                {providerObj.models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          <div>
            <div className="pr-label" style={{ marginBottom: 6 }}>API Key <span style={{ color: C.accent }}>*</span></div>
            <div style={{ position: 'relative' }}>
              <input
                className="pr-input"
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={e => { setSecret(e.target.value); setTestState('idle'); }}
                placeholder={providerObj?.hint || 'sk-...'}
                style={{ paddingRight: 64, fontFamily: MONO }}
              />
              <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
                <button className="pr-btn ghost icon sm" onClick={() => setShowSecret(s => !s)}>
                  {showSecret ? '隐' : '显'}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>
              在 {providerObj?.name} 控制台 → API Keys 处生成
            </div>
          </div>

          {/* Test connection */}
          <div style={{ padding: 12, background: C.surface2, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>测试连接</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
                {testState === 'idle' && '保存前先验证 Key 是否可用'}
                {testState === 'testing' && `正在向 ${providerObj?.name} 发送测试请求…`}
                {testState === 'ok'      && (<span style={{ color: C.good }}>✓ 连接成功 ·  延迟 280ms</span>)}
                {testState === 'fail'    && (<span style={{ color: C.bad }}>✗ Key 无效或已过期</span>)}
              </div>
            </div>
            <button className="pr-btn sm" disabled={!secret || testState === 'testing'} onClick={testConnection} style={{ opacity: (!secret || testState === 'testing') ? 0.5 : 1 }}>
              {testState === 'testing' ? Icon.spinner : null}
              <span>{testState === 'testing' ? '测试中…' : '测试'}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8, background: C.surface2, borderRadius: '0 0 12px 12px' }}>
          <button className="pr-btn" onClick={onClose}>取消</button>
          <button className="pr-btn primary" disabled={!canSave} onClick={() => onSave({ name, role, provider, model, secret })} style={{ opacity: canSave ? 1 : 0.4 }}>
            {mode === 'edit' ? '保存修改' : '创建 Key'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DeleteConfirmModal({ name, role, onClose, onConfirm }) {
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(20,16,8,0.4)' }} />
      <div style={{ position: 'relative', width: 420, background: C.surface, borderRadius: 12, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: '50%', background: C.badSoft, color: C.bad, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>删除 Key "{name}"</h2>
        <p style={{ margin: '8px 0 18px', fontSize: 13, color: C.text2, lineHeight: 1.5 }}>
          删除后，依赖 <strong>{role?.label}</strong> 的场景将切换到该角色的其他默认 Key。<br/>此操作不可撤销。
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="pr-btn" onClick={onClose}>取消</button>
          <button className="pr-btn" style={{ background: C.bad, color: '#fff', borderColor: C.bad }} onClick={onConfirm}>确认删除</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

Object.assign(window, { PageKeys, ROLES, PROVIDERS, getDefaultKey, loadKeys, DEFAULT_KEYS });
