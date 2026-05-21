module.exports = [
"[project]/src/lib/design-tokens.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Design tokens for 盎然内容
// Warm, neutral, professional. Black primary, single coral accent used sparingly.
__turbopack_context__.s([
    "NAV_ITEMS",
    ()=>NAV_ITEMS,
    "colors",
    ()=>colors
]);
const colors = {
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
    badSoft: '#f6e3e0'
};
const NAV_ITEMS = [
    {
        id: 'home',
        label: '工作台',
        icon: 'home'
    },
    {
        id: 'trends',
        label: '热点分析',
        icon: 'trends'
    },
    {
        id: 'ideas',
        label: '选题灵感',
        icon: 'ideas'
    },
    {
        id: 'editor',
        label: '编辑器',
        icon: 'editor',
        accent: true
    },
    {
        id: 'publish',
        label: '发布管理',
        icon: 'publish'
    },
    {
        id: 'analytics',
        label: '数据分析',
        icon: 'analytics'
    },
    {
        id: 'assets',
        label: '素材库',
        icon: 'assets'
    },
    {
        id: 'keys',
        label: 'Key 管理',
        icon: 'keys'
    }
];
}),
"[project]/src/app/(auth)/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$design$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/design-tokens.ts [app-rsc] (ecmascript)");
;
;
function AuthLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$design$2d$tokens$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["colors"].bg
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/(auth)/layout.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(auth)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(auth)/layout.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=src_0f0mcm9._.js.map