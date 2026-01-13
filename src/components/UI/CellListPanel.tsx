import React, { useState } from 'react';
import { List, ChevronDown, ChevronRight } from 'lucide-react';
import { Cell } from '@/types';

interface CellListPanelProps {
    cells: Cell[];
    onCellClick: (cell: Cell) => void;
}

export default function CellListPanel({ cells, onCellClick }: CellListPanelProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string | number, e: React.MouseEvent) => {
        const idStr = String(id);
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(idStr)) {
                next.delete(idStr);
            } else {
                next.add(idStr);
            }
            return next;
        });
    };

    return (
        <div className="h-full flex flex-col bg-gray-800 text-gray-200 p-4 w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
                <List className="text-blue-400" size={20} />
                <h2 className="text-lg font-bold">Cell List</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {cells.length === 0 ? (
                    <div className="text-sm text-gray-500 italic text-center py-4">
                        No active cells
                    </div>
                ) : (
                    cells.map((cell) => {
                        const isExpanded = expandedIds.has(String(cell.id));
                        return (
                            <div
                                key={cell.id}
                                className="rounded-lg border border-gray-700 bg-gray-900/50 overflow-hidden"
                            >
                                <div
                                    onClick={() => onCellClick(cell)}
                                    className="p-3 flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer"
                                >
                                    <span className="text-sm font-mono text-gray-300">
                                        {cell.id}
                                    </span>
                                    <button
                                        onClick={(e) => toggleExpand(cell.id, e)}
                                        className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                                    >
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="p-3 bg-gray-950/50 border-t border-gray-800 text-xs font-mono text-gray-400 overflow-x-auto">
                                        <pre>{JSON.stringify(cell.properties, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
