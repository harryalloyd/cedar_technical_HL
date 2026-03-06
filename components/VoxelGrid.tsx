import React from 'react';
import { Voxel } from './Voxel';
import { VoxelMap } from '@/types/voxel';
import { positionToKey } from '@/utils/voxelHelpers';

interface VoxelGridProps {
  voxels: VoxelMap;
  onVoxelClick?: (key: string, event: any) => void;
}

/**
 * Renders all voxels in the scene
 * Uses Map keys for efficient React reconciliation
 */
export function VoxelGrid({ voxels, onVoxelClick }: VoxelGridProps) {
  return (
    <>
      {Array.from(voxels.entries()).map(([key, voxel]) => (
        <Voxel
          key={key}
          voxel={voxel}
          onClick={(event) => onVoxelClick?.(key, event)}
        />
      ))}
    </>
  );
}
