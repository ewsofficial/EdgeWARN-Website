'use client';

import { useEffect, useRef } from 'react';

export default function GroundEffect() {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        // Generate random terrain parameters
        const seed = Math.random();
        const terrainType = Math.floor(seed * 3); // 0, 1, or 2
        const complexity = Math.floor(seed * 100) % 5 + 3; // 3-7 peaks
        const amplitude = 30 + (seed * 100) % 40; // 30-70px height
        const baseHeight = 100 - amplitude; // Base height from bottom

        // Generate terrain path
        let pathData = `M 0 ${baseHeight}`;
        const width = 100;
        const step = width / complexity;

        for (let i = 1; i <= complexity; i++) {
            const x = i * step;
            const variation = (Math.sin(i * seed * 10) * amplitude * 0.5) +
                (Math.cos(i * seed * 7) * amplitude * 0.3);
            const y = baseHeight + variation;
            pathData += ` L ${x} ${y}`;
        }

        pathData += ` L ${width} 100 L 0 100 Z`;

        // Create gradient based on terrain type
        const gradientId = `terrain-gradient-${terrainType}`;
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');

        const colors = [
            ['#1a1f2e', '#0d1016'], // Dark blue
            ['#1e293b', '#0f172a'], // Slate
            ['#1e1b4b', '#0f0a2e'], // Purple
        ];

        const color1 = colors[terrainType][0];
        const color2 = colors[terrainType][1];

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', color1);
        stop1.setAttribute('stop-opacity', '0.8');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', color2);
        stop2.setAttribute('stop-opacity', '0.95');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);

        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', `url(#${gradientId})`);
        path.setAttribute('stroke', 'rgba(255, 255, 255, 0.05)');
        path.setAttribute('stroke-width', '1');

        // Add subtle glow
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', pathData);
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('stroke', 'rgba(100, 150, 255, 0.1)');
        glowPath.setAttribute('stroke-width', '3');
        glowPath.setAttribute('filter', 'blur(2px)');

        // Clear and append
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(gradient);
        svg.appendChild(defs);
        svg.appendChild(glowPath);
        svg.appendChild(path);

        // Animate in
        const animation = svg.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0px)' }
        ], {
            duration: 1000,
            easing: 'ease-out',
            fill: 'forwards'
        });

        return () => {
            animation.cancel();
        };
    }, []);

    return (
        <svg
            ref={svgRef}
            className="fixed bottom-[120px] left-0 w-full h-[100px] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        />
    );
}
