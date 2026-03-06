import React, { memo } from 'react';
import { Voxel as VoxelType } from '@/types/voxel';
import { VOXEL_SIZE } from '@/utils/constants';
import { positionToKey } from '@/utils/voxelHelpers';

interface VoxelProps {
  voxel: VoxelType;
  onClick?: (event: any) => void;
}

/**
 * Individual voxel component - memoized for performance
 * Only re-renders when voxel data changes
 */
export const Voxel = memo<VoxelProps>(({ voxel, onClick }) => {
  const { position, color } = voxel;
  const key = positionToKey(position);

  const handleClick = (event: any) => {
    event.stopPropagation(); // CRITICAL: prevent event from bubbling through multiple voxels
    onClick?.(event);
  };

  return (
    <mesh
      position={[position.x, position.y, position.z]}
      onClick={handleClick}
      userData={{ isVoxel: true, key }} // Mark for intersection filtering
    >
      <boxGeometry args={[VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

Voxel.displayName = 'Voxel';
