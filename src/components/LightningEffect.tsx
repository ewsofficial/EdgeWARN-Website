'use client';

import { useEffect, useRef } from 'react';

export default function LightningEffect() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Pools for DOM recycling
        const flashPool: HTMLDivElement[] = [];
        const boltPool: SVGSVGElement[] = [];

        let animationFrameId: number;
        let lastLightningTime = 0;
        const LIGHTNING_INTERVAL_MIN = 3000;
        const LIGHTNING_INTERVAL_MAX = 8000;
        let nextLightningDelay = random(LIGHTNING_INTERVAL_MIN, LIGHTNING_INTERVAL_MAX);

        function random(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        function getFlash(): HTMLDivElement {
            if (flashPool.length > 0) {
                const flash = flashPool.pop()!;
                flash.style.display = 'block';
                return flash;
            }
            const flash = document.createElement('div');
            flash.classList.add('lightning-flash');
            return flash;
        }

        function recycleFlash(flash: HTMLDivElement) {
            flash.style.display = 'none';
            flashPool.push(flash);
        }

        function getBolt(): SVGSVGElement {
            if (boltPool.length > 0) {
                const bolt = boltPool.pop()!;
                bolt.style.display = 'block';
                return bolt;
            }
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.classList.add("lightning-bolt");
            svg.setAttribute("viewBox", "0 0 100 100");
            svg.setAttribute("preserveAspectRatio", "none");
            
            const glowPath = document.createElementNS(svgNS, "path");
            glowPath.classList.add('glow-path');
            glowPath.setAttribute("stroke", "rgba(100, 180, 255, 0.4)");
            glowPath.setAttribute("stroke-width", "2.5");
            glowPath.setAttribute("fill", "none");
            glowPath.setAttribute("stroke-linecap", "round");
            glowPath.setAttribute("stroke-linejoin", "round");

            const mainPath = document.createElementNS(svgNS, "path");
            mainPath.classList.add('main-path');
            mainPath.setAttribute("stroke", "rgba(200, 230, 255, 0.95)");
            mainPath.setAttribute("stroke-width", "0.6");
            mainPath.setAttribute("fill", "none");
            mainPath.setAttribute("stroke-linecap", "round");
            mainPath.setAttribute("stroke-linejoin", "round");

            svg.appendChild(glowPath);
            svg.appendChild(mainPath);
            return svg;
        }

        function recycleBolt(bolt: SVGSVGElement) {
            bolt.style.display = 'none';
            boltPool.push(bolt);
        }

        function triggerLightning() {
            if (!container) return;

            const flash = getFlash();
            const x = random(10, 90);
            const y = random(5, 85);
            const size = random(400, 1000);

            flash.style.left = `${x}%`;
            flash.style.top = `${y}%`;
            flash.style.width = `${size}px`;
            flash.style.height = `${size}px`;

            if (!flash.parentElement) {
                container.appendChild(flash);
            }

            const duration = random(200, 400);
            const maxOpacity = random(0.5, 0.8);
            const animation = flash.animate([
                { opacity: 0, transform: 'scale(0.8)' },
                { opacity: maxOpacity, transform: 'scale(1.1)', offset: 0.2 },
                { opacity: 0, transform: 'scale(0.9)' }
            ], { duration, easing: 'ease-out' });

            animation.onfinish = () => recycleFlash(flash);

            if (Math.random() > 0.6) {
                createBolt(x, y);
            }
        }

        function createBolt(xPercent: number, yPercent: number) {
            const svg = getBolt();
            const glowPath = svg.querySelector('.glow-path') as SVGPathElement;
            const mainPath = svg.querySelector('.main-path') as SVGPathElement;

            let curX = xPercent;
            let curY = yPercent < 20 ? yPercent : random(0, 20);
            let pathData = `M ${curX} ${curY}`;

            const targetY = random(80, 100);
            const segments = Math.floor(random(4, 8));
            const yStep = (targetY - curY) / segments;

            for (let i = 0; i < segments; i++) {
                curX += random(-6, 6);
                curY += yStep;
                pathData += ` L ${curX} ${curY}`;
            }

            glowPath.setAttribute("d", pathData);
            mainPath.setAttribute("d", pathData);

            if (container && !svg.parentElement) {
                container.appendChild(svg);
            }

            const duration = random(150, 300);
            const animation = svg.animate([
                { opacity: 0 },
                { opacity: 1, offset: 0.1 },
                { opacity: 0 }
            ], { duration, easing: 'ease-out' });

            animation.onfinish = () => recycleBolt(svg);
        }

        function animate(currentTime: number) {
            if (!lastLightningTime) lastLightningTime = currentTime;
            
            const elapsed = currentTime - lastLightningTime;
            if (elapsed > nextLightningDelay) {
                triggerLightning();
                lastLightningTime = currentTime;
                nextLightningDelay = random(LIGHTNING_INTERVAL_MIN, LIGHTNING_INTERVAL_MAX);
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (container) {
                container.innerHTML = '';
            }
            flashPool.length = 0;
            boltPool.length = 0;
        };
    }, []);

    return (
        <div ref={containerRef} id="lightning-container" className="fixed inset-0 pointer-events-none" aria-hidden="true" />
    );
}
