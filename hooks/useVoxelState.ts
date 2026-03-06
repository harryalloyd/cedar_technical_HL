import { useState, useCallback } from 'react';
import { Position, Voxel, VoxelMap, Tool } from '@/types/voxel';
import { positionToKey } from '@/utils/voxelHelpers';
import { DEFAULT_COLOR } from '@/utils/constants';

export function useVoxelState() {
  const [voxels, setVoxels] = useState<VoxelMap>(new Map());
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [currentTool, setCurrentTool] = useState<Tool>('add');

  const addVoxel = useCallback((position: Position, color?: string): boolean => {
    const key = positionToKey(position);
    const voxelColor = color || selectedColor;

    let success = false;
    setVoxels(prev => {
      // Check if cell is already occupied
      if (prev.has(key)) {
        success = false;
        return prev; // Return unchanged state
      }

      const next = new Map(prev);
      next.set(key, { position, color: voxelColor });
      success = true;
      return next;
    });

    return success;
  }, [selectedColor]);

  const removeVoxel = useCallback((position: Position) => {
    const key = positionToKey(position);

    setVoxels(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setVoxels(new Map());
  }, []);

  return {
    voxels,
    selectedColor,
    setSelectedColor,
    currentTool,
    setCurrentTool,
    addVoxel,
    removeVoxel,
    clearAll,
  };
}
