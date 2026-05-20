// design-tokens.jsx — shared visual language for the prototype.
// Warm, neutral, professional. Black primary, single coral accent used sparingly.

const C = {
  bg:        '#f7f6f2',
  surface:   '#ffffff',
  surface2:  '#fbfaf7',
  border:    '#e8e6df',
  borderStrong: '#d6d3ca',
  text:      '#1a1a1a',
  text2:     '#5e5b54',
  text3:     '#9a958b',

  ink:       '#1a1a1a',
  accent:    '#cd5a3a',
  accentSoft:'#fbeee7',
  accentText:'#a44726',

  good:      '#2f7a4f',
  goodSoft:  '#e7f1ea',
  warn:      '#a87822',
  warnSoft:  '#f6efdc',
  bad:       '#b03a3a',
  badSoft:   '#f6e3e0',

  chartA:    '#1a1a1a',
  chartB:    '#cd5a3a',
  chartC:    '#86807a',
  chartD:    '#cbc5b9',
};

const FONT = '"Inter", -apple-system, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Inject base styles once
if (!document.getElementById('proto-base-styles')) {
  const s = document.createElement('style');
  s.id = 'proto-base-styles';
  s.textContent = `
    .pr-btn { display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 14px;
      border:1px solid ${C.border}; background:${C.surface}; color:${C.text}; font:500 13px/1 ${FONT};
      border-radius:6px; cursor:pointer; transition: background .12s, border-color .12s, box-shadow .12s;
      white-space:nowrap; flex:0 0 auto; }
    .pr-btn:hover { background:${C.surface2}; border-color:${C.borderStrong}; }
    .pr-btn.primary { background:${C.ink}; color:#fff; border-color:${C.ink}; }
    .pr-btn.primary:hover { background:#000; }
    .pr-btn.accent { background:${C.accent}; color:#fff; border-color:${C.accent}; }
    .pr-btn.accent:hover { background:#b94d2f; }
    .pr-btn.sm { height:26px; padding:0 10px; font-size:12px; }
    .pr-btn.icon { padding:0; width:32px; justify-content:center; }
    .pr-btn.ghost { border-color:transparent; background:transparent; }
    .pr-btn.ghost:hover { background:${C.surface2}; border-color:${C.border}; }

    .pr-pill { display:inline-flex; align-items:center; gap:4px; height:22px; padding:0 8px;
      border:1px solid ${C.border}; border-radius:11px; font:500 11px/1 ${FONT};
      color:${C.text2}; background:${C.surface}; cursor:default;
      width:max-content; justify-self:start; white-space:nowrap; }
    .pr-pill.active { background:${C.ink}; color:#fff; border-color:${C.ink}; }
    .pr-pill.accent { background:${C.accentSoft}; color:${C.accentText}; border-color:${C.accentSoft}; }
    .pr-pill.good { background:${C.goodSoft}; color:${C.good}; border-color:${C.goodSoft}; }
    .pr-pill.warn { background:${C.warnSoft}; color:${C.warn}; border-color:${C.warnSoft}; }
    .pr-pill.bad  { background:${C.badSoft}; color:${C.bad}; border-color:${C.badSoft}; }
    .pr-pill.click { cursor:pointer; }
    .pr-pill.click:hover { background:${C.surface2}; }
    .pr-pill.click.active:hover { background:${C.ink}; }

    .pr-input { width:100%; height:34px; padding:0 12px; border:1px solid ${C.border}; border-radius:6px;
      font:400 13px/1 ${FONT}; color:${C.text}; background:${C.surface}; outline:none; transition:border-color .12s; }
    .pr-input:focus { border-color:${C.ink}; }
    .pr-input::placeholder { color:${C.text3}; }
    textarea.pr-input { height:auto; padding:10px 12px; line-height:1.55; resize:vertical; font-family:${FONT}; }

    .pr-card { background:${C.surface}; border:1px solid ${C.border}; border-radius:10px; }
    .pr-card.hov { transition: border-color .12s, box-shadow .12s; cursor:pointer; }
    .pr-card.hov:hover { border-color:${C.borderStrong}; box-shadow: 0 1px 0 ${C.border}, 0 4px 16px -8px rgba(0,0,0,.08); }
    .pr-card .pr-card-pad { padding:18px; }

    .pr-row { display:grid; align-items:center; gap:16px; padding:12px 18px; border-top:1px solid ${C.border}; font-size:13px; }
    .pr-row:first-of-type { border-top:none; }
    .pr-row.hov { cursor:pointer; transition: background .12s; }
    .pr-row.hov:hover { background:${C.surface2}; }

    .pr-label { font: 500 11px/1.4 ${FONT}; color:${C.text3}; letter-spacing:.04em; text-transform:uppercase; }

    .pr-kbd { display:inline-flex; align-items:center; height:20px; padding:0 6px; border:1px solid ${C.border};
      border-bottom-width:2px; border-radius:4px; font:500 11px/1 ${MONO}; color:${C.text2}; background:${C.surface}; }

    /* checkbox */
    .pr-chk { width:16px; height:16px; border:1.5px solid ${C.borderStrong}; border-radius:4px; display:inline-flex;
      align-items:center; justify-content:center; cursor:pointer; flex:0 0 auto; background:${C.surface}; transition: all .12s; }
    .pr-chk.on { background:${C.ink}; border-color:${C.ink}; color:#fff; }
    .pr-chk.on svg { display:block; }
    .pr-chk svg { display:none; }

    .pr-platform { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:${C.text2}; }
    .pr-platform .dot { width:8px; height:8px; border-radius:50%; flex:0 0 auto; }

    /* spin */
    @keyframes pr-spin { to { transform: rotate(360deg); } }
    .pr-spin { animation: pr-spin .8s linear infinite; }

    /* scrollbar */
    .pr-scroll { overflow:auto; }
    .pr-scroll::-webkit-scrollbar { width:8px; height:8px; }
    .pr-scroll::-webkit-scrollbar-thumb { background:#e0ddd5; border-radius:4px; }
    .pr-scroll::-webkit-scrollbar-track { background:transparent; }

    /* status dot */
    .pr-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
  `;
  document.head.appendChild(s);
}

// ---- Platform meta --------------------------------------------------------
const PLATFORMS = {
  xhs: { id: 'xhs', label: '小红书',  short: 'XHS', color: '#ff2741' },
  yt:  { id: 'yt',  label: 'YouTube', short: 'YT',  color: '#ff0000' },
  tt:  { id: 'tt',  label: 'TikTok',  short: 'TT',  color: '#1a1a1a' },
  fb:  { id: 'fb',  label: 'Facebook',short: 'FB',  color: '#1877f2' },
};

function PlatformTag({ id, size = 12, withLabel = true }) {
  const p = PLATFORMS[id]; if (!p) return null;
  return (
    <span className="pr-platform" style={{ fontSize: size }}>
      <span className="dot" style={{ background: p.color }} />
      {withLabel && p.label}
    </span>
  );
}

// ---- Common icons (sparingly used; line style 1.5px) ----------------------
const Icon = {
  search:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  sparkle:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>,
  arrow:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  arrowUp:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  arrowDown:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
  check:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  filter:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></svg>,
  more:     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  bell:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  spinner:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="pr-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
};

// ---- Nav icons (1.5px stroke) --------------------------------------------
const NavIcons = {
  home:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>,
  trends:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  ideas:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.8.7 1 1.3 1 2.3h6c0-1 .2-1.6 1-2.3A7 7 0 0 0 12 2z"/></svg>,
  editor:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
  publish:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  analytics: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>,
  assets:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>,
  keys:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="3.5"/><path d="m10 13 9-9 3 3-3 3 2 2-2 2-2-2-2 2"/></svg>,
};

Object.assign(window, { C, FONT, MONO, PLATFORMS, PlatformTag, Icon, NavIcons });
