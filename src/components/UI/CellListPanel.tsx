import React from 'react';
import { List } from 'lucide-react';

interface CellListPanelProps {
    cells: any[];
    onCellClick: (cell: any) => void;
}

export default function CellListPanel({ cells, onCellClick }: CellListPanelProps) {
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
                    cells.map((cell) => (
                        <div 
                            key={cell.id} 
                            onClick={() => onCellClick(cell)}
                            className="p-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            <span className="text-sm font-mono text-gray-300">
                                {cell.id}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
