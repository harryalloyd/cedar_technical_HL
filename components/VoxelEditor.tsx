'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { ColorPicker } from './UI/ColorPicker';
import { Toolbar } from './UI/Toolbar';
import { Instructions } from './UI/Instructions';
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
  } = useVoxelState();

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

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Toolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onClear={clearAll}
          />
        </div>
        <div className="pointer-events-auto">
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
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
