'use client';

import { useState, useEffect, FormEvent } from 'react';
import { colors } from '@/lib/design-tokens';
import { useAuth } from '@/lib/auth-context';

interface Schedule {
  id: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  draft?: { id: string; title: string; platform: string } | null;
}

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  xhs: { label: '小红书', color: '#ff2741' },
  yt: { label: 'YouTube', color: '#ff0000' },
  tt: { label: 'TikTok', color: '#1a1a1a' },
  fb: { label: 'Facebook', color: '#1877f2' },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: '草稿', cls: '' },
  SCHEDULED: { label: '已排期', cls: 'warn' },
  PUBLISHING: { label: '发布中', cls: 'accent' },
  COMPLETED: { label: '已发布', cls: 'good' },
  PARTIAL_FAIL: { label: '部分失败', cls: 'bad' },
  ARCHIVED: { label: '已归档', cls: '' },
};

const TABS = [
  { id: 'all', label: '全部' },
  { id: 'today', label: '今日' },
  { id: 'week', label: '本周' },
  { id: 'pub', label: '已发布' },
];

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

export default function PublishPage() {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchSchedules = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/schedules', {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, [token]);

  const filtered = schedules.filter(s => {
    if (tab === 'today') return s.status === 'COMPLETED' || s.status === 'PUBLISHING';
    if (tab === 'week') return true;
    if (tab === 'pub') return s.status === 'COMPLETED' || s.status === 'PARTIAL_FAIL';
    return true;
  });

  const statusClass = (status: string) => STATUS_META[status]?.cls || '';

  const counts: Record<string, number> = {
    all: schedules.length,
    today: schedules.filter(s => s.status === 'COMPLETED' || s.status === 'PUBLISHING').length,
    week: schedules.length,
    pub: schedules.filter(s => s.status === 'COMPLETED' || s.status === 'PARTIAL_FAIL').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>发布管理</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>
            · {schedules.filter(s => s.status !== 'COMPLETED' && s.status !== 'ARCHIVED').length} 项待发
          </span>
        </div>
        <button className="pr-btn primary" onClick={() => setCreateOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>新建排期</span>
        </button>
      </div>

      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {TABS.map(t => (
            <span
              key={t.id}
              className={`pr-pill click ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              style={tab === t.id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
            >
              {t.label}
              <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 10 }}>{counts[t.id]}</span>
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: colors.text3, padding: 40, fontSize: 13 }}>加载中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.text3, padding: 40, fontSize: 13 }}>
            暂无排期，点击"新建排期"创建
          </div>
        ) : (
          <div className="pr-card">
            {filtered.map(s => (
              <div key={s.id} className="pr-row" style={{ gridTemplateColumns: '40px 1fr 100px 110px 80px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: s.draft ? '#efece4' : colors.surface2,
                  border: `1px solid ${colors.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: colors.text3,
                }}>
                  {s.draft ? s.draft.title.charAt(0).toUpperCase() : '📄'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.draft?.title || '无标题'}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <PlatformTag id={s.platform} />
                  </div>
                </div>
                <span className={`pr-pill ${statusClass(s.status)}`}>
                  {STATUS_META[s.status]?.label || s.status}
                </span>
                <span style={{ fontSize: 12, color: colors.text3, fontFamily: '"JetBrains Mono", monospace' }}>
                  {s.scheduledAt
                    ? new Date(s.scheduledAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
                    : '-'}
                </span>
                <span style={{ fontSize: 12, color: colors.text3 }}>
                  {s.status === 'DRAFT' && (
                    <button className="pr-btn ghost sm" onClick={async () => {
                      await fetch('/api/schedules', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
                        body: JSON.stringify({ id: s.id, status: 'SCHEDULED' }),
                      });
                      fetchSchedules();
                    }} style={{ fontSize: 11 }}>
                      排期
                    </button>
                  )}
                  {s.status === 'SCHEDULED' && (
                    <button className="pr-btn ghost sm" onClick={async () => {
                      await fetch('/api/schedules', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
                        body: JSON.stringify({ id: s.id, status: 'COMPLETED' }),
                      });
                      fetchSchedules();
                    }} style={{ fontSize: 11 }}>
                      发布
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateScheduleModal
          token={token}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); fetchSchedules(); }}
        />
      )}
    </div>
  );
}

function CreateScheduleModal({ token, onClose, onCreated }: { token: string | null; onClose: () => void; onCreated: () => void }) {
  const [platform, setPlatform] = useState('xhs');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          platform,
          ...(date ? { scheduledAt: new Date(date).toISOString() } : {}),
        }),
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div className="pr-card" style={{ width: 420, padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>新建排期</div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>发布平台</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {Object.entries(PLATFORM_META).map(([id, meta]) => (
                  <span
                    key={id}
                    className={`pr-pill click ${platform === id ? 'active' : ''}`}
                    onClick={() => setPlatform(id)}
                    style={platform === id ? { background: colors.ink, color: '#fff', borderColor: colors.ink } : {}}
                  >
                    {meta.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>定时发布</label>
              <input className="pr-input" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="pr-btn" onClick={onClose}>取消</button>
            <button type="submit" className="pr-btn primary" disabled={saving}>
              {saving ? '创建中...' : '创建排期'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
