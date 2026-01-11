module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/LightningEffect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LightningEffect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function LightningEffect() {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const container = containerRef.current;
        if (!container) return;
        let timeoutId;
        function random(min, max) {
            return Math.random() * (max - min) + min;
        }
        function createFlash() {
            if (!container) return;
            const flash = document.createElement('div');
            flash.classList.add('lightning-flash');
            // Random position
            const x = random(0, 100);
            const y = random(10, 90);
            // Random size
            const size = random(600, 1500);
            flash.style.left = `${x}%`;
            flash.style.top = `${y}%`;
            flash.style.width = `${size}px`;
            flash.style.height = `${size}px`;
            container.appendChild(flash);
            // Animate
            const duration = random(300, 800);
            const animation = flash.animate([
                {
                    opacity: 0
                },
                {
                    opacity: random(0.6, 1.0),
                    offset: 0.2
                },
                {
                    opacity: random(0.2, 0.4),
                    offset: 0.4
                },
                {
                    opacity: random(0.5, 0.9),
                    offset: 0.6
                },
                {
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            });
            animation.onfinish = ()=>{
                flash.remove();
            };
            // Sometimes create a bolt
            if (Math.random() > 0.5) {
                createBolt(x, y);
            }
        }
        function createBolt(xPercent, yPercent) {
            if (!container) return;
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.classList.add("lightning-bolt");
            svg.setAttribute("viewBox", "0 0 100 100");
            svg.setAttribute("preserveAspectRatio", "none");
            let curX = xPercent;
            let curY = yPercent < 20 ? yPercent : random(0, 30);
            let pathData = `M ${curX} ${curY}`;
            const targetY = random(80, 100);
            const segments = Math.floor(random(6, 12));
            const yStep = (targetY - curY) / segments;
            for(let i = 0; i < segments; i++){
                curX += random(-5, 5);
                curY += yStep;
                pathData += ` L ${curX} ${curY}`;
            }
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("stroke", "rgba(255, 255, 255, 0.9)");
            path.setAttribute("stroke-width", "0.4");
            path.setAttribute("fill", "none");
            svg.appendChild(path);
            container.appendChild(svg);
            const animation = svg.animate([
                {
                    opacity: 0
                },
                {
                    opacity: 1,
                    offset: 0.1
                },
                {
                    opacity: 0
                }
            ], {
                duration: random(300, 600),
                easing: 'linear'
            });
            animation.onfinish = ()=>svg.remove();
        }
        function scheduleNext() {
            const delay = random(1000, 5000);
            timeoutId = setTimeout(()=>{
                createFlash();
                scheduleNext();
            }, delay);
        }
        scheduleNext();
        return ()=>{
            clearTimeout(timeoutId);
            if (container) {
                container.innerHTML = ''; // Cleanup all flashes
            }
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        id: "lightning-container",
        "aria-hidden": "true"
    }, void 0, false, {
        fileName: "[project]/src/components/LightningEffect.tsx",
        lineNumber: 122,
        columnNumber: 12
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c3d78ef8._.js.map