'use client';

import { useEffect, useRef } from 'react';

export default function LakeEffect() {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        // Generate random lake parameters
        const seed = Math.random();
        const waveCount = Math.floor(seed * 5) + 3; // 3-7 waves
        const waveAmplitude = 2 + (seed * 100) % 4; // 2-6px amplitude
        const waveFrequency = 0.5 + (seed * 100) % 0.5; // 0.5-1.0 frequency

        // Create water gradient
        const gradientId = `water-gradient-${seed}`;
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');

        // Water colors - deep blue to lighter blue
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#0a1628');
        stop1.setAttribute('stop-opacity', '0.9');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '50%');
        stop2.setAttribute('stop-color', '#0f285e');
        stop2.setAttribute('stop-opacity', '0.85');

        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '100%');
        stop3.setAttribute('stop-color', '#1e3a5f');
        stop3.setAttribute('stop-opacity', '0.8');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        gradient.appendChild(stop3);

        // Create reflection gradient
        const reflectionGradientId = `reflection-gradient-${seed}`;
        const reflectionGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        reflectionGradient.setAttribute('id', reflectionGradientId);
        reflectionGradient.setAttribute('x1', '0%');
        reflectionGradient.setAttribute('y1', '0%');
        reflectionGradient.setAttribute('x2', '0%');
        reflectionGradient.setAttribute('y2', '100%');

        const reflectionStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        reflectionStop1.setAttribute('offset', '0%');
        reflectionStop1.setAttribute('stop-color', 'rgba(100, 150, 255, 0.3)');
        reflectionStop1.setAttribute('stop-opacity', '0.4');

        const reflectionStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        reflectionStop2.setAttribute('offset', '100%');
        reflectionStop2.setAttribute('stop-color', 'rgba(50, 100, 200, 0.1)');
        reflectionStop2.setAttribute('stop-opacity', '0.2');

        reflectionGradient.appendChild(reflectionStop1);
        reflectionGradient.appendChild(reflectionStop2);

        // Create water surface with waves
        let waterPath = `M 0 0`;
        const width = 100;
        const step = width / 50; // 50 segments for smooth waves

        for (let i = 0; i <= 50; i++) {
            const x = i * step;
            const y = Math.sin(i * waveFrequency * Math.PI / 180 + seed * 10) * waveAmplitude;
            waterPath += ` L ${x} ${y}`;
        }

        waterPath += ` L ${width} 100 L 0 100 Z`;

        // Create reflection path (inverted waves)
        let reflectionPath = `M 0 0`;
        for (let i = 0; i <= 50; i++) {
            const x = i * step;
            const y = Math.sin(i * waveFrequency * Math.PI / 180 + seed * 10 + Math.PI) * waveAmplitude * 0.5;
            reflectionPath += ` L ${x} ${y}`;
        }

        reflectionPath += ` L ${width} 100 L 0 100 Z`;

        // Create water path
        const waterPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        waterPathElement.setAttribute('d', waterPath);
        waterPathElement.setAttribute('fill', `url(#${gradientId})`);
        waterPathElement.setAttribute('stroke', 'rgba(100, 150, 255, 0.2)');
        waterPathElement.setAttribute('stroke-width', '0.5');

        // Create reflection path
        const reflectionPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        reflectionPathElement.setAttribute('d', reflectionPath);
        reflectionPathElement.setAttribute('fill', `url(#${reflectionGradientId})`);
        reflectionPathElement.setAttribute('opacity', '0.6');

        // Add shimmer effect
        const shimmerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shimmerPath.setAttribute('d', waterPath);
        shimmerPath.setAttribute('fill', 'none');
        shimmerPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
        shimmerPath.setAttribute('stroke-width', '1');
        shimmerPath.setAttribute('filter', 'blur(1px)');

        // Clear and append
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(gradient);
        defs.appendChild(reflectionGradient);
        svg.appendChild(defs);
        svg.appendChild(reflectionPathElement);
        svg.appendChild(waterPathElement);
        svg.appendChild(shimmerPath);

        // Animate waves
        let animationFrame: number;
        let time = 0;

        function animate() {
            time += 0.02;

            // Update water path
            let newWaterPath = `M 0 0`;
            for (let i = 0; i <= 50; i++) {
                const x = i * step;
                const y = Math.sin(i * waveFrequency * Math.PI / 180 + time + seed * 10) * waveAmplitude;
                newWaterPath += ` L ${x} ${y}`;
            }
            newWaterPath += ` L ${width} 100 L 0 100 Z`;
            waterPathElement.setAttribute('d', newWaterPath);

            // Update reflection path
            let newReflectionPath = `M 0 0`;
            for (let i = 0; i <= 50; i++) {
                const x = i * step;
                const y = Math.sin(i * waveFrequency * Math.PI / 180 + time + seed * 10 + Math.PI) * waveAmplitude * 0.5;
                newReflectionPath += ` L ${x} ${y}`;
            }
            newReflectionPath += ` L ${width} 100 L 0 100 Z`;
            reflectionPathElement.setAttribute('d', newReflectionPath);

            // Update shimmer
            shimmerPath.setAttribute('d', newWaterPath);

            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        // Animate in
        const fadeInAnimation = svg.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: 1500,
            easing: 'ease-out',
            fill: 'forwards'
        });

        return () => {
            cancelAnimationFrame(animationFrame);
            fadeInAnimation.cancel();
        };
    }, []);

    return (
        <svg
            ref={svgRef}
            className="fixed bottom-0 left-0 w-full h-[120px] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        />
    );
}
