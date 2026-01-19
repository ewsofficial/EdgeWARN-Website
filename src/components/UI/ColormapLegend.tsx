'use client';

import { Colormap } from '@/types';
import { useMemo } from 'react';

interface ColormapLegendProps {
    colormap: Colormap | null;
}

/**
 * ColormapLegend component displays a color gradient legend for the active map layer.
 * Positioned at the bottom-left of the map.
 */
export default function ColormapLegend({ colormap }: ColormapLegendProps) {
    // Generate gradient CSS or discrete blocks
    const gradientStyle = useMemo(() => {
        if (!colormap) return {};
        const { thresholds, range, interpolate } = colormap;
        if (thresholds.length === 0) return {};

        const [minVal, maxVal] = range;
        const rangeSpan = maxVal - minVal;

        if (interpolate) {
            // Create a smooth gradient
            const stops = thresholds.map(t => {
                const percent = ((t.value - minVal) / rangeSpan) * 100;
                return `rgb(${t.rgb[0]}, ${t.rgb[1]}, ${t.rgb[2]}) ${percent}%`;
            });
            return {
                background: `linear-gradient(to right, ${stops.join(', ')})`
            };
        } else {
            // Create discrete color blocks
            const stops: string[] = [];
            for (let i = 0; i < thresholds.length; i++) {
                const t = thresholds[i];
                const percent = ((t.value - minVal) / rangeSpan) * 100;
                const nextPercent = i < thresholds.length - 1 
                    ? ((thresholds[i + 1].value - minVal) / rangeSpan) * 100
                    : 100;
                stops.push(`rgb(${t.rgb[0]}, ${t.rgb[1]}, ${t.rgb[2]}) ${percent}%`);
                stops.push(`rgb(${t.rgb[0]}, ${t.rgb[1]}, ${t.rgb[2]}) ${nextPercent}%`);
            }
            return {
                background: `linear-gradient(to right, ${stops.join(', ')})`
            };
        }
    }, [colormap]);

    const displayTicks = useMemo(() => {
        if (!colormap) return [];
        const { thresholds, range } = colormap;
        const [minVal, maxVal] = range;
        const rangeSpan = maxVal - minVal;
        
        // Show at most ~5 ticks
        const maxTicks = 5;
        const step = Math.ceil(thresholds.length / maxTicks);
        
        const ticks: { value: number; percent: number }[] = [];
        for (let i = 0; i < thresholds.length; i += step) {
            const t = thresholds[i];
            ticks.push({
                value: t.value,
                percent: ((t.value - minVal) / rangeSpan) * 100
            });
        }
        
        // Ensure the last threshold is included
        const lastThreshold = thresholds[thresholds.length - 1];
        const lastTick = ticks[ticks.length - 1];
        if (lastTick && lastTick.value !== lastThreshold.value) {
            ticks.push({
                value: lastThreshold.value,
                percent: ((lastThreshold.value - minVal) / rangeSpan) * 100
            });
        }
        
        return ticks;
    }, [colormap]);

    if (!colormap) return null;
    const { units, name } = colormap;

    return (
        <div className="absolute bottom-32 left-4 md:bottom-6 md:left-6 z-[500] pointer-events-auto">
            <div className="bg-gray-900/85 backdrop-blur-md border border-gray-700/50 rounded-xl p-3 shadow-xl min-w-[200px] max-w-[280px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-200 tracking-wide uppercase truncate">
                        {name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {units}
                    </span>
                </div>

                {/* Gradient Bar */}
                <div 
                    className="h-4 w-full rounded-md shadow-inner"
                    style={gradientStyle}
                />

                {/* Tick Labels */}
                <div className="relative h-4 mt-1">
                    {displayTicks.map((tick, i) => (
                        <span 
                            key={i}
                            className="absolute text-[10px] text-gray-400 transform -translate-x-1/2"
                            style={{ left: `${tick.percent}%` }}
                        >
                            {Number.isInteger(tick.value) ? tick.value : tick.value.toFixed(1)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
