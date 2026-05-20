// proto-data.jsx — Mock data shared across pages. Realistic-feeling but not deceptive.

const DATA = {
  // KPI snapshot
  kpis: [
    { label: '本周发布',   value: '12',     delta: '+3',   dir: 'up',   spark: [3,5,4,7,6,9,12] },
    { label: '总曝光',     value: '1.24M',  delta: '+18%', dir: 'up',   spark: [40,55,42,68,72,98,86] },
    { label: '平均互动率', value: '4.7%',   delta: '+0.6', dir: 'up',   spark: [3.1,3.5,3.2,4.1,4.0,4.5,4.7] },
    { label: '本周转化',   value: '320',    delta: '-4%',  dir: 'down', spark: [80,75,72,65,58,52,46] },
    { label: '昨日发布',   value: '3',      delta: '+1',   dir: 'up',   spark: [1,2,1,3,2,2,3] },
    { label: '昨日曝光',   value: '186k',   delta: '+12%', dir: 'up',   spark: [120,135,110,160,150,170,186] },
    { label: '昨日互动率', value: '5.1%',   delta: '+0.4', dir: 'up',   spark: [3.8,4.0,4.2,4.5,4.7,4.9,5.1] },
    { label: '昨日转化',   value: '46',     delta: '-8%',  dir: 'down', spark: [62,58,55,52,50,48,46] },
  ],

  todos: [
    { id: 1, t: '检查 3 篇待发小红书草稿', meta: '今日 18:00 前', done: false },
    { id: 2, t: '回复 KOL 合作邀约',  meta: '@小落 ·  优先', done: false },
    { id: 3, t: '导出 W19 周报',      meta: '团队同步前',     done: true  },
    { id: 4, t: '上传新拍摄素材 24 张', meta: '夏日露营组',    done: false },
    { id: 5, t: '检查 YT 视频转码',    meta: '已完成 ·  排期中', done: false },
  ],

  recentContent: [
    { id: 'r1', title: '¥200 搞定第一次露营 ·  5 件套清单', platform: 'xhs', status: 'published', when: '2 小时前', views: '32.4k' },
    { id: 'r2', title: '30 秒 vlog ·  通勤穿搭 do & don\'t',    platform: 'tt',  status: 'scheduled', when: '今日 22:00', views: '—' },
    { id: 'r3', title: 'Weekend Camping with $30',           platform: 'yt',  status: 'scheduled', when: '明日 19:30', views: '—' },
    { id: 'r4', title: '家庭周末露营方案 ·  亲子向',           platform: 'fb',  status: 'draft',     when: '昨日 17:30', views: '—' },
    { id: 'r5', title: '"轻露营" 必备 7 件 ·  避坑指南',        platform: 'xhs', status: 'published', when: '昨日',       views: '18.6k' },
  ],

  // Trending topics
  trends: [
    { id: 't1', topic: '#city walk',          tags: ['生活','旅行'],     growth: 312, fav: true,  per: { xhs: 320, tt: 150, yt: 210, fb: -12 } },
    { id: 't2', topic: '#轻露营',              tags: ['户外','装备'],     growth: 248, fav: true,  per: { xhs: 180, tt: 240, yt: 80,  fb: 34  } },
    { id: 't3', topic: '#夏日通勤穿搭',         tags: ['穿搭'],          growth: 195, fav: false, per: { xhs: 220, tt: 95,  yt: 45,  fb: 12  } },
    { id: 't4', topic: '#早c晚a',              tags: ['美妆','护肤'],     growth: 86,  fav: false, per: { xhs: 95,  tt: 18,  yt: 4,   fb: null } },
    { id: 't5', topic: '#办公桌面好物',         tags: ['好物','办公'],    growth: 64,  fav: false, per: { xhs: 45,  tt: -4,  yt: 22,  fb: 8   } },
    { id: 't6', topic: '#玻璃唇',              tags: ['美妆'],          growth: 52,  fav: false, per: { xhs: 62,  tt: 8,   yt: null,fb: null } },
    { id: 't7', topic: '#夜骑路线',            tags: ['户外'],          growth: 44,  fav: false, per: { xhs: 38,  tt: 56,  yt: 12,  fb: null } },
    { id: 't8', topic: '#极简房间',            tags: ['家居'],          growth: 28,  fav: false, per: { xhs: 35,  tt: 12,  yt: 18,  fb: 4   } },
  ],

  // Ideas (mix of human + AI)
  ideas: [
    { id: 'i1', title: '¥200 露营第一次 ·  极简清单',         platform: 'xhs', source: 'ai',     status: '草稿',   thumb: 1 },
    { id: 'i2', title: '独居女生 ·  安全感露营 do/dont',       platform: 'xhs', source: 'ai',     status: '已收藏', thumb: 2 },
    { id: 'i3', title: '城市夜骑 ·  3 条治愈路线',             platform: 'tt',  source: 'human',  status: '大纲',   thumb: 3 },
    { id: 'i4', title: 'Camping under $30',                  platform: 'yt',  source: 'ai',     status: '草稿',   thumb: 4 },
    { id: 'i5', title: '通勤穿搭 5 套 ·  上班不撞衫',          platform: 'xhs', source: 'human',  status: '已收藏', thumb: 5 },
    { id: 'i6', title: '家庭周末 ·  亲子露营方案',             platform: 'fb',  source: 'ai',     status: '草稿',   thumb: 6 },
    { id: 'i7', title: '一周早 c 晚 a ·  皮肤变化记录',         platform: 'xhs', source: 'human',  status: '已收藏', thumb: 7 },
    { id: 'i8', title: '"轻露营" 装备 ·  避坑 vs 推荐',         platform: 'tt',  source: 'ai',     status: '大纲',   thumb: 8 },
    { id: 'i9', title: 'Desk Setup Tour 2026',               platform: 'yt',  source: 'human',  status: '草稿',   thumb: 9 },
  ],

  // Publishing queue
  publish: [
    { id: 'p1', when: '今日 21:00', platform: 'xhs', title: '¥200 露营 5 件套清单',         status: 'scheduled', auto: true,  forecast: '50–80k', owner: 'M' },
    { id: 'p2', when: '今日 22:00', platform: 'tt',  title: '30s 通勤穿搭 do/dont',         status: 'scheduled', auto: true,  forecast: '180k+',  owner: 'L' },
    { id: 'p3', when: '明日 08:00', platform: 'fb',  title: '家庭周末露营方案 ·  亲子向',    status: 'draft',     auto: false, forecast: '20–35k', owner: 'M' },
    { id: 'p4', when: '明日 12:00', platform: 'xhs', title: '夏日防晒 5 条铁律',           status: 'scheduled', auto: true,  forecast: '60–90k', owner: 'L' },
    { id: 'p5', when: '明日 19:30', platform: 'yt',  title: 'Camping Gear Unboxing',      status: 'rendering', auto: false, forecast: '40k+',   owner: 'J' },
    { id: 'p6', when: '周六 19:00', platform: 'tt',  title: '快剪 ·  city walk 上海篇',     status: 'draft',     auto: false, forecast: '—',      owner: 'L' },
    { id: 'p7', when: '周六 21:00', platform: 'xhs', title: '闺蜜露营 plog ·  长篇',        status: 'draft',     auto: false, forecast: '—',      owner: 'M' },
    { id: 'p8', when: '周日 12:00', platform: 'yt',  title: '5 分钟露营美食',              status: 'draft',     auto: false, forecast: '—',      owner: 'J' },
    { id: 'p9', when: '已发 ·  14:00', platform: 'tt', title: '夏日通勤穿搭 ·  5 套快剪',     status: 'published', auto: true,  forecast: '已发 220k', owner: 'L' },
  ],

  // Analytics top content
  topContent: [
    { id: 'a1', title: '夏日通勤穿搭 ·  5 套快剪',         platform: 'tt',  views: 540000, ie: 4.1, follows: 340,  comments: 1180 },
    { id: 'a2', title: '¥200 露营 5 件套清单',           platform: 'xhs', views: 320000, ie: 7.2, follows: 180,  comments: 920  },
    { id: 'a3', title: 'Camping Gear Tour',             platform: 'yt',  views: 45000,  ie: 8.8, follows: 120,  comments: 340  },
    { id: 'a4', title: '家庭周末露营方案',                platform: 'fb',  views: 62000,  ie: 2.1, follows: 45,   comments: 86   },
    { id: 'a5', title: '"轻露营" 必备 7 件 ·  避坑',       platform: 'xhs', views: 38000,  ie: 5.6, follows: 30,   comments: 145  },
    { id: 'a6', title: '城市夜骑 ·  3 条路线',            platform: 'xhs', views: 24000,  ie: 4.2, follows: 12,   comments: 88   },
    { id: 'a7', title: '闺蜜露营 plog',                  platform: 'xhs', views: 18000,  ie: 3.8, follows: 8,    comments: 62   },
    { id: 'a8', title: '快剪 path ·  treadmill',          platform: 'tt',  views: 12000,  ie: 1.9, follows: 5,    comments: 24   },
  ],
};

// helpers
function fmtK(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

const STATUS_LABELS = {
  draft:     { label: '草稿',     cls: '' },
  scheduled: { label: '已排期',   cls: '' },
  rendering: { label: '渲染中',   cls: 'accent' },
  published: { label: '已发布',   cls: 'good' },
  failed:    { label: '失败',     cls: 'bad' },
};

Object.assign(window, { DATA, fmtK, STATUS_LABELS });
