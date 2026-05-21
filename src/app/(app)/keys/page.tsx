'use client';

import { useState, useEffect, FormEvent } from 'react';
import { colors } from '@/lib/design-tokens';
import { useAuth } from '@/lib/auth-context';
import { CardSkeleton } from '@/components/skeleton';

interface ApiKeyData {
  id: string;
  provider: string;
  role: string;
  label: string;
  keyHash: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

const PROVIDERS: { id: string; label: string; color: string; roles: string[] }[] = [
  { id: 'anthropic', label: 'Anthropic (Claude)', color: '#cd5a3a', roles: ['text'] },
  { id: 'openai', label: 'OpenAI (GPT)', color: '#10a37f', roles: ['text', 'image'] },
  { id: 'gemini', label: 'Google Gemini', color: '#4285f4', roles: ['text'] },
  { id: 'deepseek', label: 'DeepSeek', color: '#4d6bfe', roles: ['text'] },
  { id: 'qwen', label: '通义千问', color: '#615ced', roles: ['text'] },
  { id: 'doubao', label: '豆包', color: '#1664ff', roles: ['text', 'video'] },
  { id: 'midjourney', label: 'Midjourney', color: '#000000', roles: ['image'] },
  { id: 'flux', label: 'FLUX', color: '#7c3aed', roles: ['image'] },
  { id: 'kling', label: '可灵 Kling', color: '#ff6b00', roles: ['video'] },
  { id: 'sora', label: 'Sora (OpenAI)', color: '#10a37f', roles: ['video'] },
] as const;
const ROLES = [
  { id: 'text', label: '文字模型', desc: '生成正文、选题、分析文本' },
  { id: 'image', label: '图片模型', desc: '生成封面、配图' },
  { id: 'video', label: '视频模型', desc: '生成视频' },
] as const;

const PROVIDER_LABELS: Record<string, string> = Object.fromEntries(
  PROVIDERS.map(p => [p.id, p.label])
);

export default function KeysPage() {
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState({ provider: 'anthropic', role: 'text', key: '', label: '' });
  const [saving, setSaving] = useState(false);

  const fetchKeys = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/keys', {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, [token]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(newKey),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '保存失败');
      }
      setAddOpen(false);
      setNewKey({ provider: 'anthropic', role: 'text', key: '', label: '' });
      await fetchKeys();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个 Key？')) return;
    try {
      await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      await fetchKeys();
    } catch {}
  };

  const getKeyForProvider = (provider: string) => keys.filter(k => k.provider === provider);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      {/* Topbar */}
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Key 管理</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>· 配置 AI 服务提供商 API Key</span>
        </div>
        <button className="pr-btn primary" onClick={() => setAddOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>新建 Key</span>
        </button>
      </div>

      {/* Content */}
      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        {error && (
          <div style={{
            padding: '10px 14px', background: colors.badSoft, color: colors.bad,
            borderRadius: 6, fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PROVIDERS.map(p => {
              const providerKeys = getKeyForProvider(p.id);
              const relevantRoles = ROLES.filter(r => (p.roles as readonly string[]).includes(r.id));
              return (
                <div key={p.id} className="pr-card">
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flex: '0 0 auto' }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</div>
                  </div>
                  {relevantRoles.length > 0 ? relevantRoles.map(role => {
                    const k = providerKeys.find(k => k.role === role.id);
                    return (
                      <div key={role.id} className="pr-row" style={{
                        gridTemplateColumns: '130px 1fr 80px',
                        padding: '12px 20px',
                      }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{role.label}</div>
                          <div style={{ fontSize: 11, color: colors.text3 }}>{role.desc}</div>
                        </div>
                        <div>
                          {k ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 20, height: 10, borderRadius: 5,
                                background: k.isActive ? colors.good : colors.text3,
                                display: 'inline-block', position: 'relative', cursor: 'pointer',
                                transition: 'background .15s',
                              }} onClick={async () => {
                                // Toggle active state
                                await fetch('/api/keys', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ id: k.id, isActive: !k.isActive }),
                                });
                                fetchKeys();
                              }}>
                                <span style={{
                                  position: 'absolute', top: 1, left: k.isActive ? 10 : 1,
                                  width: 8, height: 8, borderRadius: '50%', background: '#fff',
                                  transition: 'left .15s',
                                }} />
                              </span>
                              <span className="pr-pill good">已配置 · · · ·{k.keyHash}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: colors.text3 }}>未配置</span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {k ? (
                            <button className="pr-btn ghost sm" onClick={() => handleDelete(k.id)} style={{ color: colors.bad }}>
                              删除
                            </button>
                          ) : (
                            <button className="pr-btn sm" onClick={() => {
                              setNewKey({ provider: p.id, role: role.id, key: '', label: '' });
                              setAddOpen(true);
                            }}>
                              添加
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="pr-row" style={{ padding: '12px 20px', color: colors.text3, fontSize: 12 }}>
                      该 Provider 不支持当前角色分配
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Key Modal */}
      {addOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setAddOpen(false)}>
          <div className="pr-card" style={{ width: 480, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>新建 API Key</div>
            </div>
            <form onSubmit={handleAdd} style={{ padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>Provider</label>
                  <select className="pr-input" value={newKey.provider}
                    onChange={e => setNewKey(p => ({ ...p, provider: e.target.value }))}>
                    {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>角色</label>
                  <select className="pr-input" value={newKey.role}
                    onChange={e => setNewKey(p => ({ ...p, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>API Key</label>
                  <input className="pr-input" type="password" placeholder="sk-..." required
                    value={newKey.key} onChange={e => setNewKey(p => ({ ...p, key: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>标签（可选）</label>
                  <input className="pr-input" placeholder="例如：Claude 主 Key"
                    value={newKey.label} onChange={e => setNewKey(p => ({ ...p, label: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="pr-btn" onClick={() => setAddOpen(false)}>取消</button>
                <button type="submit" className="pr-btn primary" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
