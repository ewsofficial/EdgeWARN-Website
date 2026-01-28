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
        const segments = 50; // Reduced from 80 for better performance
        const step = width / segments;

        // Create gradients for different wave layers
        const createGradient = (id: string, colors: Array<{ offset: string; color: string; opacity: number }>) => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', id);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '0%');
            gradient.setAttribute('y2', '100%');

            colors.forEach(({ offset, color, opacity }) => {
                const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop.setAttribute('offset', offset);
                stop.setAttribute('stop-color', color);
                stop.setAttribute('stop-opacity', opacity.toString());
                gradient.appendChild(stop);
            });

            return gradient;
        };

        // Deep water gradient (back layer)
        const deepWaterGradient = createGradient(`deep-water-${seed}`, [
            { offset: '0%', color: '#0a1628', opacity: 0.95 },
            { offset: '40%', color: '#0f285e', opacity: 0.9 },
            { offset: '100%', color: '#1e3a5f', opacity: 0.85 }
        ]);

        // Mid water gradient
        const midWaterGradient = createGradient(`mid-water-${seed}`, [
            { offset: '0%', color: '#0d1f3c', opacity: 0.9 },
            { offset: '50%', color: '#1a3a6e', opacity: 0.85 },
            { offset: '100%', color: '#2d4a7f', opacity: 0.8 }
        ]);

        // Surface water gradient (front layer)
        const surfaceWaterGradient = createGradient(`surface-water-${seed}`, [
            { offset: '0%', color: '#0f285e', opacity: 0.85 },
            { offset: '30%', color: '#1e4a8f', opacity: 0.8 },
            { offset: '100%', color: '#2d5a9f', opacity: 0.75 }
        ]);

        // Create wave layers with different properties (reduced from 4 to 3)
        const waveLayers: WaveLayer[] = [
            {
                pathElement: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                amplitude: 3.5,
                frequency: 0.8,
                speed: 0.015,
                phase: seed * 2,
                yOffset: 0
            },
            {
                pathElement: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                amplitude: 2.8,
                frequency: 1.2,
                speed: 0.02,
                phase: seed * 3 + 1,
                yOffset: 2
            },
            {
                pathElement: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                amplitude: 2.2,
                frequency: 1.5,
                speed: 0.025,
                phase: seed * 4 + 2,
                yOffset: 4
            }
        ];

        // Apply gradients and styles to wave layers
        waveLayers[0].pathElement.setAttribute('fill', `url(#deep-water-${seed})`);
        waveLayers[0].pathElement.setAttribute('opacity', '0.7');

        waveLayers[1].pathElement.setAttribute('fill', `url(#mid-water-${seed})`);
        waveLayers[1].pathElement.setAttribute('opacity', '0.8');

        waveLayers[2].pathElement.setAttribute('fill', `url(#surface-water-${seed})`);
        waveLayers[2].pathElement.setAttribute('opacity', '0.85');

        // Create foam/bubble particles (reduced from 15 to 8)
        const particles: Array<{
            element: SVGCircleElement;
            x: number;
            y: number;
            speed: number;
            amplitude: number;
            phase: number;
            size: number;
        }> = [];

        for (let i = 0; i < 8; i++) {
            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = Math.random() * width;
            const y = Math.random() * 20 + 5;
            const size = Math.random() * 1.5 + 0.5;

            particle.setAttribute('cx', x.toString());
            particle.setAttribute('cy', y.toString());
            particle.setAttribute('r', size.toString());
            particle.setAttribute('fill', 'rgba(200, 230, 255, 0.4)');
            particle.setAttribute('opacity', (Math.random() * 0.3 + 0.2).toString());

            particles.push({
                element: particle,
                x,
                y,
                speed: Math.random() * 0.01 + 0.005,
                amplitude: Math.random() * 2 + 1,
                phase: Math.random() * Math.PI * 2,
                size
            });
        }

        // Generate wave path with simplified sine waves for better performance
        const generateWavePath = (layer: WaveLayer, time: number) => {
            let path = `M 0 ${layer.yOffset}`;

            for (let i = 0; i <= segments; i++) {
                const x = i * step;

                // Simplified to single sine wave for better performance
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
        defs.appendChild(deepWaterGradient);
        defs.appendChild(midWaterGradient);
        defs.appendChild(surfaceWaterGradient);
        svg.appendChild(defs);

        // Add wave layers (back to front)
        waveLayers.forEach(layer => svg.appendChild(layer.pathElement));

        // Add particles
        particles.forEach(p => svg.appendChild(p.element));

        // Animation loop with reduced frame rate (30fps instead of 60fps)
        let animationFrame: number;
        let time = 0;
        let lastTime = performance.now();
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= frameInterval) {
                lastTime = currentTime - (deltaTime % frameInterval);
                time += 0.032; // ~30fps increment

                // Update all wave layers
                waveLayers.forEach(layer => {
                    const path = generateWavePath(layer, time * layer.speed * 30);
                    layer.pathElement.setAttribute('d', path);
                });

                // Update particles
                particles.forEach(particle => {
                    const newY = particle.y +
                        Math.sin(time * particle.speed * 100 + particle.phase) * particle.amplitude;
                    particle.element.setAttribute('cy', newY.toString());

                    // Subtle horizontal movement
                    const newX = particle.x + Math.sin(time * 0.5 + particle.phase) * 0.5;
                    particle.element.setAttribute('cx', newX.toString());

                    // Pulsing opacity
                    const opacity = 0.2 + Math.sin(time * 2 + particle.phase) * 0.15;
                    particle.element.setAttribute('opacity', opacity.toString());
                });
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        // Fade in animation
        const fadeInAnimation = svg.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 2000,
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
            className="fixed bottom-0 left-0 w-full h-[150px] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ filter: 'blur(0.5px)' }}
        />
    );
}
