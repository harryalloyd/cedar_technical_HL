import React from 'react';

/**
 * Instructions overlay for users
 */
export function Instructions() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[200px]">
      <h3 className="text-xs font-semibold mb-1.5 text-gray-700">Controls</h3>
      <ul className="text-[10px] text-gray-600 space-y-0.5">
        <li><strong>Left Click:</strong> Place/Remove voxel</li>
        <li><strong>Right Click + Drag:</strong> Rotate camera</li>
        <li><strong>Scroll:</strong> Zoom in/out</li>
        <li><strong>Middle Click + Drag:</strong> Pan camera</li>
      </ul>
    </div>
  );
}
