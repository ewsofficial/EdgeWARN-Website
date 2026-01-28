import React, { useState, useCallback, memo, useMemo } from 'react';
import { List, ChevronDown, ChevronRight, Target, Search, Wind, Activity, Zap } from 'lucide-react';
import { Cell } from '@/types';

interface CellItemProps {
    cell: Cell;
    isExpanded: boolean;
    onToggle: (id: string | number, e: React.MouseEvent) => void;
    onLocate: (cell: Cell) => void;
}

const CellItem = memo(({ cell, isExpanded, onToggle, onLocate }: CellItemProps) => {
    // Attempt to extract some common interesting properties if they exist
    const probSevere = cell.properties?.['prob_severe'] as number | string | undefined;
    const maxZ = cell.properties?.['max_z'] as number | string | undefined; // Max Reflectivity?
    const vil = cell.properties?.['vil'] as number | string | undefined; // VIL

    const handleLocate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLocate(cell);
    };

    return (
        <div className="group rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm overflow-hidden hover:border-blue-500/30 transition-all duration-300">
            <div
                onClick={(e) => onToggle(cell.id, e)}
                className="p-3 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${probSevere && Number(probSevere) > 50 ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`} />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 font-mono tracking-wide">
                            #{cell.id}
                        </span>
                        {/* Mini stats row if available */}
                        {(probSevere || maxZ) && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                {probSevere && (
                                    <span className="flex items-center gap-1">
                                        <Zap size={10} className="text-yellow-400" />
                                        {probSevere}%
                                    </span>
                                )}
                                {maxZ && (
                                    <span className="flex items-center gap-1 border-l border-white/10 pl-2">
                                        <Activity size={10} className="text-blue-400" />
                                        {maxZ} dBZ
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleLocate}
                        className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Locate Cell"
                    >
                        <Target size={16} />
                    </button>
                    <div className="text-gray-500">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 py-3 bg-black/20 border-t border-white/5 space-y-2">
                    {/* Render Properties as a clean list instead of raw JSON */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(cell.properties).map(([key, value]) => {
                            if (key === 'modules' || key === 'bbox' || typeof value === 'object') return null;
                            return (
                                <div key={key} className="flex flex-col">
                                    <span className="text-gray-500 uppercase text-[10px] tracking-wider">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-gray-300 font-mono truncate" title={String(value)}>
                                        {String(value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
});
CellItem.displayName = 'CellItem';

interface CellListPanelProps {
    cells: Cell[];
    onCellClick: (cell: Cell) => void;
}

function CellListPanel({ cells, onCellClick }: CellListPanelProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const toggleExpand = useCallback((id: string | number, e: React.MouseEvent) => {
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
    }, []);

    const filteredCells = useMemo(() => {
        if (!searchQuery.trim()) return cells;
        const query = searchQuery.toLowerCase();
        return cells.filter(cell =>
            String(cell.id).toLowerCase().includes(query)
        );
    }, [cells, searchQuery]);

    return (
        <div className="h-full flex flex-col bg-zinc-950/95 backdrop-blur-md text-gray-200 w-full border-l border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <List className="text-blue-400" size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-none">Storm Cells</h2>
                        <span className="text-xs text-gray-500 mt-1 block">
                            {cells.length} Active System{cells.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {filteredCells.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
                        <Wind size={24} className="opacity-20" />
                        <span className="text-sm italic">
                            {cells.length === 0 ? "No active cells" : "No matches found"}
                        </span>
                    </div>
                ) : (
                    filteredCells.map((cell) => (
                        <CellItem
                            key={cell.id}
                            cell={cell}
                            isExpanded={expandedIds.has(String(cell.id))}
                            onToggle={toggleExpand}
                            onLocate={onCellClick}
                        />
                    ))
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3f3f46;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #52525b;
                }
            `}</style>
        </div>
    );
}

export default memo(CellListPanel);
