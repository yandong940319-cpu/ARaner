// Design tokens for 盎然内容
// Warm, neutral, professional. Black primary, single coral accent used sparingly.

export const colors = {
  bg: '#f7f6f2',
  surface: '#ffffff',
  surface2: '#fbfaf7',
  border: '#e8e6df',
  borderStrong: '#d6d3ca',
  text: '#1a1a1a',
  text2: '#5e5b54',
  text3: '#9a958b',
  ink: '#1a1a1a',
  accent: '#cd5a3a',
  accentSoft: '#fbeee7',
  accentText: '#a44726',
  good: '#2f7a4f',
  goodSoft: '#e7f1ea',
  warn: '#a87822',
  warnSoft: '#f6efdc',
  bad: '#b03a3a',
  badSoft: '#f6e3e0',
} as const;

export const NAV_ITEMS = [
  { id: 'home', label: '工作台', icon: 'home' },
  { id: 'trends', label: '热点分析', icon: 'trends' },
  { id: 'ideas', label: '选题灵感', icon: 'ideas' },
  { id: 'editor', label: '编辑器', icon: 'editor', accent: true },
  { id: 'publish', label: '发布管理', icon: 'publish' },
  { id: 'analytics', label: '数据分析', icon: 'analytics' },
  { id: 'assets', label: '素材库', icon: 'assets' },
  { id: 'keys', label: 'Key 管理', icon: 'keys' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
export type PageId = NavItem['id'];
