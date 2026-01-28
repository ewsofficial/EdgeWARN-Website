'use client';

import { useEffect, useRef } from 'react';

interface WaveLayer {
    pathElement: SVGPathElement;
    amplitude: number;
    frequency: number;
    speed: number;
    phase: number;
    yOffset: number;
}

export default function LakeEffect() {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const seed = Math.random();
        const width = 100;
        const segments = 40; // Further reduced from 50 to 40
        const step = width / segments;

        // Create simple gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'water-gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#0f285e');
        stop1.setAttribute('stop-opacity', '0.9');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#1e4a8f');
        stop2.setAttribute('stop-opacity', '0.8');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);

        // Create simplified wave layers (reduced from 3 to 2)
        const waveLayers: WaveLayer[] = [
            {
                pathElement: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                amplitude: 3,
                frequency: 0.8,
                speed: 0.015,
                phase: seed * 2,
                yOffset: 0
            },
            {
                pathElement: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                amplitude: 2,
                frequency: 1.2,
                speed: 0.02,
                phase: seed * 3 + 1,
                yOffset: 3
            }
        ];

        // Apply gradient to wave layers
        waveLayers[0].pathElement.setAttribute('fill', 'url(#water-gradient)');
        waveLayers[0].pathElement.setAttribute('opacity', '0.7');

        waveLayers[1].pathElement.setAttribute('fill', 'url(#water-gradient)');
        waveLayers[1].pathElement.setAttribute('opacity', '0.85');

        // Create simplified particles (reduced from 8 to 4)
        const particles: Array<{
            element: SVGCircleElement;
            x: number;
            y: number;
            speed: number;
            amplitude: number;
            phase: number;
            size: number;
        }> = [];

        for (let i = 0; i < 4; i++) {
            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = Math.random() * width;
            const y = Math.random() * 15 + 5;
            const size = Math.random() * 1.2 + 0.5;

            particle.setAttribute('cx', x.toString());
            particle.setAttribute('cy', y.toString());
            particle.setAttribute('r', size.toString());
            particle.setAttribute('fill', 'rgba(200, 230, 255, 0.4)');
            particle.setAttribute('opacity', (Math.random() * 0.2 + 0.2).toString());

            particles.push({
                element: particle,
                x,
                y,
                speed: Math.random() * 0.008 + 0.004,
                amplitude: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI * 2,
                size
            });
        }

        // Generate simple wave path
        const generateWavePath = (layer: WaveLayer, time: number) => {
            let path = `M 0 ${layer.yOffset}`;

            for (let i = 0; i <= segments; i++) {
                const x = i * step;
                const y = layer.yOffset +
                    Math.sin(i * layer.frequency * Math.PI / 180 + time + layer.phase) * layer.amplitude;
                path += ` L ${x} ${y}`;
            }

            path += ` L ${width} 100 L 0 100 Z`;
            return path;
        };

        // Clear and setup SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Add wave layers
        waveLayers.forEach(layer => svg.appendChild(layer.pathElement));

        // Add particles
        particles.forEach(p => svg.appendChild(p.element));

        // Animation loop with reduced frame rate (20fps for background)
        let animationFrame: number;
        let time = 0;
        let lastTime = performance.now();
        const targetFPS = 20;
        const frameInterval = 1000 / targetFPS;

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= frameInterval) {
                lastTime = currentTime - (deltaTime % frameInterval);
                time += 0.05; // ~20fps increment

                // Update wave layers
                waveLayers.forEach(layer => {
                    const path = generateWavePath(layer, time * layer.speed * 20);
                    layer.pathElement.setAttribute('d', path);
                });

                // Update particles
                particles.forEach(particle => {
                    const newY = particle.y +
                        Math.sin(time * particle.speed * 100 + particle.phase) * particle.amplitude;
                    particle.element.setAttribute('cy', newY.toString());

                    const newX = particle.x + Math.sin(time * 0.5 + particle.phase) * 0.5;
                    particle.element.setAttribute('cx', newX.toString());

                    const opacity = 0.2 + Math.sin(time * 2 + particle.phase) * 0.15;
                    particle.element.setAttribute('opacity', opacity.toString());
                });
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <svg
            ref={svgRef}
            className="fixed bottom-0 left-0 w-full h-[150px] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ filter: 'blur(0.5px)' }}
        />
    );
}
