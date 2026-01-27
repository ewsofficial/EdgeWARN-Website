'use client';

import { useEffect, useRef } from 'react';

export default function LightningEffect() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let timeoutId: NodeJS.Timeout;

        function random(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        function createFlash() {
            if (!container) return;

            const flash = document.createElement('div');
            flash.classList.add('lightning-flash');

            // Random position with better distribution
            const x = random(10, 90);
            const y = random(5, 85);

            // Random size with more variety
            const size = random(400, 1200);

            flash.style.left = `${x}%`;
            flash.style.top = `${y}%`;
            flash.style.width = `${size}px`;
            flash.style.height = `${size}px`;

            container.appendChild(flash);

            // Enhanced animation with more dramatic effect
            const duration = random(200, 500);
            const maxOpacity = random(0.7, 1.0);
            const animation = flash.animate([
                { opacity: 0, transform: 'scale(0.8)' },
                { opacity: maxOpacity, transform: 'scale(1.2)', offset: 0.15 },
                { opacity: maxOpacity * 0.6, transform: 'scale(1.1)', offset: 0.3 },
                { opacity: maxOpacity * 0.8, transform: 'scale(1.15)', offset: 0.45 },
                { opacity: maxOpacity * 0.4, transform: 'scale(1.05)', offset: 0.6 },
                { opacity: 0, transform: 'scale(0.9)' }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });

            animation.onfinish = () => {
                flash.remove();
            };

            // Create bolt with higher probability
            if (Math.random() > 0.3) {
                createBolt(x, y);
            }

            // Sometimes create secondary flash
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    createSecondaryFlash(x, y);
                }, random(50, 150));
            }
        }

        function createSecondaryFlash(xPercent: number, yPercent: number) {
            if (!container) return;

            const flash = document.createElement('div');
            flash.classList.add('lightning-flash');

            const offsetX = random(-15, 15);
            const offsetY = random(-10, 10);
            const size = random(200, 600);

            flash.style.left = `${xPercent + offsetX}%`;
            flash.style.top = `${yPercent + offsetY}%`;
            flash.style.width = `${size}px`;
            flash.style.height = `${size}px`;

            container.appendChild(flash);

            const duration = random(150, 300);
            const animation = flash.animate([
                { opacity: 0 },
                { opacity: random(0.4, 0.7), offset: 0.2 },
                { opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-out'
            });

            animation.onfinish = () => flash.remove();
        }

        function createBolt(xPercent: number, yPercent: number) {
            if (!container) return;
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.classList.add("lightning-bolt");
            svg.setAttribute("viewBox", "0 0 100 100");
            svg.setAttribute("preserveAspectRatio", "none");

            let curX = xPercent;
            let curY = yPercent < 20 ? yPercent : random(0, 25);

            let pathData = `M ${curX} ${curY}`;
            const targetY = random(75, 100);
            const segments = Math.floor(random(8, 16));
            const yStep = (targetY - curY) / segments;

            for (let i = 0; i < segments; i++) {
                curX += random(-8, 8);
                curY += yStep;
                pathData += ` L ${curX} ${curY}`;

                // Add branches occasionally
                if (Math.random() > 0.85 && i > 2 && i < segments - 2) {
                    const branchLength = random(3, 8);
                    const branchAngle = random(-30, 30);
                    const branchX = curX + Math.sin(branchAngle * Math.PI / 180) * branchLength;
                    const branchY = curY + Math.cos(branchAngle * Math.PI / 180) * branchLength;
                    pathData += ` L ${branchX} ${branchY} L ${curX} ${curY}`;
                }
            }

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("stroke", "rgba(200, 230, 255, 0.95)");
            path.setAttribute("stroke-width", "0.6");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");

            // Add glow effect
            const glowPath = document.createElementNS(svgNS, "path");
            glowPath.setAttribute("d", pathData);
            glowPath.setAttribute("stroke", "rgba(100, 180, 255, 0.4)");
            glowPath.setAttribute("stroke-width", "2.5");
            glowPath.setAttribute("fill", "none");
            glowPath.setAttribute("stroke-linecap", "round");
            glowPath.setAttribute("stroke-linejoin", "round");

            svg.appendChild(glowPath);
            svg.appendChild(path);
            container.appendChild(svg);

            const duration = random(250, 450);
            const animation = svg.animate([
                { opacity: 0, filter: 'blur(0px)' },
                { opacity: 1, filter: 'blur(0px)', offset: 0.1 },
                { opacity: 0.8, filter: 'blur(1px)', offset: 0.5 },
                { opacity: 0, filter: 'blur(2px)' }
            ], {
                duration: duration,
                easing: 'ease-out'
            });

            animation.onfinish = () => svg.remove();
        }

        function scheduleNext() {
            const delay = random(800, 4000);
            timeoutId = setTimeout(() => {
                createFlash();
                scheduleNext();
            }, delay);
        }

        scheduleNext();

        return () => {
            clearTimeout(timeoutId);
            if (container) {
                container.innerHTML = ''; // Cleanup all flashes
            }
        };
    }, []);

    return <div ref={containerRef} id="lightning-container" aria-hidden="true" />;
}
