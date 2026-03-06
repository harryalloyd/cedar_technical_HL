import React from 'react';
import { Tool } from '@/types/voxel';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onClear: () => void;
}

/**
 * Toolbar for selecting tools and actions
 */
export function Toolbar({ currentTool, onToolChange, onClear }: ToolbarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg w-[280px]">
      <h3 className="text-base font-semibold mb-4 text-gray-700">Tools</h3>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => onToolChange('add')}
          className={`w-[140px] h-[44px] rounded font-medium transition-colors ${
            currentTool === 'add'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Add Voxel
        </button>
        <button
          onClick={() => onToolChange('remove')}
          className={`w-[140px] h-[44px] rounded font-medium transition-colors ${
            currentTool === 'remove'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Remove Voxel
        </button>
        <button
          onClick={onClear}
          className="w-[140px] h-[44px] rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
