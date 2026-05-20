// wireframe-kit.jsx — minimal monochrome wireframe primitives.
// No handwritten fonts, no colored highlights, no emoji. Just lines + labels.

const WK_INK   = '#1a1a1a';
const WK_SOFT  = '#7a7a7a';
const WK_FAINT = '#bdbdbd';
const WK_BG    = '#fafaf8';
const WK_LINE  = '#1a1a1a';

const WK_FONT  = '"Inter", -apple-system, system-ui, "Helvetica Neue", sans-serif';
const WK_MONO  = '"JetBrains Mono", ui-monospace, monospace';

// ---- Box -------------------------------------------------------------------
function Box({ children, dashed = false, style = {}, ...rest }) {
  return (
    <div style={{
      border: `1px ${dashed ? 'dashed' : 'solid'} ${WK_LINE}`,
      padding: 12,
      color: WK_INK,
      background: 'transparent',
      ...style,
    }} {...rest}>{children}</div>
  );
}

// ---- Label (small mono caption) -------------------------------------------
function Label({ children, color = WK_SOFT, size = 10, style = {} }) {
  return (
    <span style={{
      fontFamily: WK_MONO,
      fontSize: size,
      color,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      ...style,
    }}>{children}</span>
  );
}

// ---- Title / text ---------------------------------------------------------
function T({ children, size = 14, weight = 500, color = WK_INK, style = {} }) {
  return (
    <span style={{
      fontFamily: WK_FONT,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.3,
      ...style,
    }}>{children}</span>
  );
}

// ---- Filler text lines (greeked) ------------------------------------------
function Lines({ n = 2, w = '100%', gap = 6, last = 0.6 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          height: 6,
          background: WK_FAINT,
          width: i === n - 1 && n > 1 ? `${last * 100}%` : w,
        }} />
      ))}
    </div>
  );
}

// ---- Button (outline) -----------------------------------------------------
function Btn({ children, primary, size = 'm', style = {} }) {
  const h = size === 's' ? 24 : size === 'l' ? 36 : 30;
  const pad = size === 's' ? '0 10px' : size === 'l' ? '0 18px' : '0 14px';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: h, padding: pad,
      border: `1px solid ${WK_LINE}`,
      background: primary ? WK_INK : 'transparent',
      color: primary ? WK_BG : WK_INK,
      fontFamily: WK_FONT, fontSize: size === 's' ? 11 : 13, fontWeight: 500,
      ...style,
    }}>{children}</div>
  );
}

// ---- Input ----------------------------------------------------------------
function Input({ placeholder, w = '100%', style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      width: w, height: 32, padding: '0 12px',
      border: `1px solid ${WK_LINE}`,
      fontFamily: WK_FONT, fontSize: 13, color: WK_SOFT,
      ...style,
    }}>{placeholder}</div>
  );
}

// ---- Image placeholder (single thin diagonal) -----------------------------
function Img({ w = '100%', h = 120, label, style = {} }) {
  return (
    <div style={{
      width: w, height: h,
      border: `1px solid ${WK_LINE}`,
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke={WK_FAINT} strokeWidth="1" />
      </svg>
      {label && <span style={{ position: 'relative', fontFamily: WK_MONO, fontSize: 10, color: WK_SOFT, background: WK_BG, padding: '2px 6px' }}>{label}</span>}
    </div>
  );
}

// ---- Tag/pill (outline only) ----------------------------------------------
function Pill({ children, filled, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px',
      border: `1px solid ${WK_LINE}`,
      background: filled ? WK_INK : 'transparent',
      color: filled ? WK_BG : WK_INK,
      fontFamily: WK_FONT, fontSize: 11, fontWeight: 500,
      ...style,
    }}>{children}</span>
  );
}

// ---- Divider --------------------------------------------------------------
function Hr({ dashed = true, style = {} }) {
  return <div style={{
    height: 0,
    borderTop: `1px ${dashed ? 'dashed' : 'solid'} ${WK_FAINT}`,
    ...style,
  }} />;
}

// ---- Avatar (circle) ------------------------------------------------------
function Av({ size = 24 }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', border: `1px solid ${WK_LINE}`, display: 'inline-block', flex: '0 0 auto' }} />;
}

// ---- Bar chart -----------------------------------------------------------
function BarChart({ bars = [40, 60, 35, 80, 55, 70, 45], w = '100%', h = 80 }) {
  const max = Math.max(...bars);
  return (
    <div style={{ width: w, height: h, display: 'flex', alignItems: 'flex-end', gap: 4, borderBottom: `1px solid ${WK_LINE}` }}>
      {bars.map((b, i) => (
        <div key={i} style={{ flex: 1, height: `${(b / max) * 100}%`, background: WK_INK }} />
      ))}
    </div>
  );
}

// ---- Line chart ----------------------------------------------------------
function LineChart({ w = '100%', h = 80, points }) {
  const pts = points || [10, 25, 18, 40, 30, 55, 45, 70, 60, 80];
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;
  const coords = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * 100;
    const y = 100 - ((p - min) / range) * 90 - 5;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: w, height: h, borderBottom: `1px solid ${WK_LINE}` }}>
      <polyline points={coords} fill="none" stroke={WK_INK} strokeWidth="1.2" />
    </svg>
  );
}

// ---- Window chrome -------------------------------------------------------
function Win({ children, style = {} }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: WK_BG,
      display: 'flex', flexDirection: 'column',
      fontFamily: WK_FONT,
      color: WK_INK,
      ...style,
    }}>{children}</div>
  );
}

// ---- Nav item ------------------------------------------------------------
function NavItem({ children, active }) {
  return (
    <div style={{
      padding: '6px 10px',
      background: active ? WK_INK : 'transparent',
      color: active ? WK_BG : WK_INK,
      fontFamily: WK_FONT, fontSize: 13,
    }}>{children}</div>
  );
}

Object.assign(window, {
  WK_INK, WK_SOFT, WK_FAINT, WK_BG, WK_LINE, WK_FONT, WK_MONO,
  Box, Label, T, Lines, Btn, Input, Img, Pill, Hr, Av, BarChart, LineChart, Win, NavItem,
});
