'use client';

import { colors } from '@/lib/design-tokens';

export default function IdeasPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{
        height: 60, flex: '0 0 auto', padding: '0 28px',
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>ideas</h1>
      </div>
      <div className="pr-scroll" style={{ flex: 1, padding: '24px 28px', background: colors.bg, overflow: 'auto' }}>
        <div style={{ color: colors.text2, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          $page — 页面开发中
        </div>
      </div>
    </div>
  );
}
