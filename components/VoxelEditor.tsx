'use client';

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { ColorPicker } from './UI/ColorPicker';
import { Instructions } from './UI/Instructions';
import { HistoryControls } from './UI/HistoryControls';
import { useVoxelState } from '@/hooks/useVoxelState';

/**
 * Main Voxel Editor component
 * Manages state and renders both 3D canvas and UI controls
 */
export function VoxelEditor() {
  const {
    voxels,
    selectedColor,
    setSelectedColor,
    currentTool,
    setCurrentTool,
    addVoxel,
    removeVoxel,
    clearAll,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useVoxelState();

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl+Z: Undo
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl+Shift+Z: Redo (Mac style)
      else if (cmdOrCtrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl+Y: Redo (Windows style)
      else if (!isMac && e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="w-full h-screen relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [10, 10, 10],
          fov: 50,
        }}
        shadows
      >
        <Scene
          voxels={voxels}
          selectedColor={selectedColor}
          currentTool={currentTool}
          onAddVoxel={addVoxel}
          onRemoveVoxel={removeVoxel}
        />
      </Canvas>

      {/* Collapsible Sidebar Panel */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg w-[260px] flex flex-col">
          {/* Sidebar Header with Collapse Button */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Controls</h2>
            <button
              type="button"
              onClick={() => {
                const sidebar = document.getElementById('sidebar-content');
                const icon = document.getElementById('collapse-icon');
                if (sidebar && icon) {
                  sidebar.classList.toggle('hidden');
                  icon.style.transform = sidebar.classList.contains('hidden') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
              }}
              className="p-1 hover:bg-gray-200 rounded transition-all"
              title="Toggle sidebar"
            >
              <svg
                id="collapse-icon"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Collapsible Content */}
          <div id="sidebar-content" className="p-3 flex flex-col gap-6">
            {/* Tools Section */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-700">Tools</h3>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTool('add')}
                  className={`w-[220px] h-[36px] rounded font-medium transition-colors ${
                    currentTool === 'add'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Add Voxel
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTool('remove')}
                  className={`w-[220px] h-[36px] rounded font-medium transition-colors ${
                    currentTool === 'remove'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Remove Voxel
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="w-[220px] h-[36px] rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Color Section */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-700">Color</h3>
              <ColorPicker
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
              />
            </div>

            {/* History Section */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-700">History</h3>
              <HistoryControls
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Instructions />
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg pointer-events-none">
        <h1 className="text-xl font-bold text-gray-800">Voxel Editor</h1>
        <p className="text-xs text-gray-600">{voxels.size} voxels</p>
      </div>
    </div>
  );
}
