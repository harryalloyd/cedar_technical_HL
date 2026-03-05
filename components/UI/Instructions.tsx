import React from 'react';

/**
 * Instructions overlay for users
 */
export function Instructions() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Controls</h3>
      <ul className="text-xs text-gray-600 space-y-1">
        <li><strong>Left Click:</strong> Place/Remove voxel</li>
        <li><strong>Right Click + Drag:</strong> Rotate camera</li>
        <li><strong>Scroll:</strong> Zoom in/out</li>
        <li><strong>Middle Click + Drag:</strong> Pan camera</li>
      </ul>
    </div>
  );
}
