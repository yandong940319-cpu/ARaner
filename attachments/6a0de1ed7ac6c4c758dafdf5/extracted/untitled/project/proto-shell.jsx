// proto-shell.jsx — Layout: sidebar nav + topbar + page body.
// Also provides the page-routing context so any page can navigate to another.

const RouteContext = React.createContext(null);
function useRoute() { return React.useContext(RouteContext); }

const PAGES = [
  { id: 'home',      label: '工作台',     icon: NavIcons.home },
  { id: 'trends',    label: '热点分析',   icon: NavIcons.trends },
  { id: 'ideas',     label: '选题灵感',   icon: NavIcons.ideas },
  { id: 'editor',    label: '编辑器',     icon: NavIcons.editor, accent: true },
  { id: 'publish',   label: '发布管理',   icon: NavIcons.publish },
  { id: 'analytics', label: '数据分析',   icon: NavIcons.analytics },
  { id: 'assets',    label: '素材库',     icon: NavIcons.assets },
  { id: 'keys',      label: 'Key 管理',    icon: NavIcons.keys || NavIcons.assets },
];

function Sidebar({ active, go }) {
  return (
    <aside style={{
      width: 220, flex: '0 0 auto',
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* brand */}
      <div style={{ height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 26, height: 26, background: C.ink, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontFamily: FONT, fontSize: 13 }}>盎</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>盎然内容</div>
          <div style={{ fontSize: 10, color: C.text3, fontFamily: MONO }}>v2.4 · workspace</div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PAGES.map(p => {
          const on = active === p.id;
          return (
            <button key={p.id} onClick={() => go(p.id)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 7,
                fontSize: 13, fontWeight: on ? 600 : 500,
                color: on ? C.ink : C.text2,
                background: on ? '#efece4' : 'transparent',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = C.surface2; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ display: 'inline-flex', color: on ? C.ink : C.text3 }}>{p.icon}</span>
              <span>{p.label}</span>
              {p.accent && !on && <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: MONO, color: C.accentText, background: C.accentSoft, padding: '2px 5px', borderRadius: 3 }}>AI</span>}
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div style={{ padding: 14, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dcd6c8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>M</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Mira Chen</div>
          <div style={{ fontSize: 10, color: C.text3 }}>品牌组 · 主理</div>
        </div>
        <button className="pr-btn ghost icon" title="通知">{Icon.bell}</button>
      </div>
    </aside>
  );
}

function Topbar({ title, breadcrumb, right }) {
  return (
    <div style={{
      height: 60, flex: '0 0 auto', padding: '0 28px',
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h1>
        {breadcrumb && <span style={{ fontSize: 12, color: C.text3 }}>{breadcrumb}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {right}
      </div>
    </div>
  );
}

function Page({ active, go, title, breadcrumb, right, children, padded = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <Topbar title={title} breadcrumb={breadcrumb} right={right} />
      <div className="pr-scroll" style={{ flex: 1, padding: padded ? '24px 28px' : 0, background: C.bg, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// shared section header (for in-page groupings)
function SectionHeader({ title, hint, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h2>
        {hint && <span style={{ fontSize: 12, color: C.text3 }}>{hint}</span>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { RouteContext, useRoute, PAGES, Sidebar, Topbar, Page, SectionHeader });
