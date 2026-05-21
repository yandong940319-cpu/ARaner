'use client';

import { usePathname, useRouter } from 'next/navigation';
import { colors, NAV_ITEMS } from '@/lib/design-tokens';
import { NavIcons } from './icons';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname?.split('/')[1] || 'home';

  const go = (id: string) => {
    router.push(`/${id === 'home' ? '' : id}`);
  };

  return (
    <aside style={{
      width: 220, flex: '0 0 auto',
      background: colors.surface,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* brand */}
      <div style={{
        height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{
          width: 26, height: 26, background: colors.ink, borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13,
        }}>
          盎
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>盎然内容</div>
          <div style={{ fontSize: 10, color: colors.text3 }}>v2.4 · workspace</div>
        </div>
      </div>

      {/* nav */}
      <nav style={{
        flex: 1, padding: '14px 10px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {NAV_ITEMS.map((p: { id: string; label: string; icon: string; accent?: boolean }) => {
          const on = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => go(p.id)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 7,
                fontSize: 13, fontWeight: on ? 600 : 500,
                color: on ? colors.ink : colors.text2,
                background: on ? '#efece4' : 'transparent',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = colors.surface2; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'inline-flex', color: on ? colors.ink : colors.text3 }}>
                {NavIcons[p.icon] ?? NavIcons.assets}
              </span>
              <span>{p.label}</span>
              {p.accent && !on && (
                <span style={{
                  marginLeft: 'auto', fontSize: 9,
                  color: colors.accentText, background: colors.accentSoft,
                  padding: '2px 5px', borderRadius: 3,
                }}>
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div style={{
        padding: 14, borderTop: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: '#dcd6c8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 12,
        }}>
          M
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Mira Chen</div>
          <div style={{ fontSize: 10, color: colors.text3 }}>品牌组 · 主理</div>
        </div>
        <button className="pr-btn ghost icon" title="通知">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
