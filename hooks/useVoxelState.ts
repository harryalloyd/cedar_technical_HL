import { useState, useCallback } from 'react';
import { Position, Voxel, VoxelMap, Tool } from '@/types/voxel';
import { positionToKey } from '@/utils/voxelHelpers';
import { DEFAULT_COLOR } from '@/utils/constants';

export function useVoxelState() {
  const [voxels, setVoxels] = useState<VoxelMap>(new Map());
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [currentTool, setCurrentTool] = useState<Tool>('add');

  const addVoxel = useCallback((position: Position, color?: string) => {
    const key = positionToKey(position);
    const voxelColor = color || selectedColor;

    setVoxels(prev => {
      const next = new Map(prev);
      next.set(key, { position, color: voxelColor });
      return next;
    });
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
