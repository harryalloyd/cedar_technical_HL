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
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Tools</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onToolChange('add')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            currentTool === 'add'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Add Voxel
        </button>
        <button
          onClick={() => onToolChange('remove')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            currentTool === 'remove'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Remove Voxel
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mt-2"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
