'use client';

import { colors } from '@/lib/design-tokens';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      {/* Topbar */}
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>工作台</h1>
          <span style={{ fontSize: 12, color: colors.text3 }}>· 早上好, Mira</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="pr-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <span>新建选题</span>
          </button>
          <button className="pr-btn accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>
            <span>AI 起稿</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        <div style={{ color: colors.text2, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          工作台首页 — 页面开发中
        </div>
      </div>
    </div>
  );
}
