import React, { memo } from 'react';
import { Voxel as VoxelType } from '@/types/voxel';
import { VOXEL_SIZE } from '@/utils/constants';

interface VoxelProps {
  voxel: VoxelType;
  onClick?: () => void;
}

/**
 * Individual voxel component - memoized for performance
 * Only re-renders when voxel data changes
 */
export const Voxel = memo<VoxelProps>(({ voxel, onClick }) => {
  const { position, color } = voxel;

  return (
    <mesh
      position={[position.x, position.y, position.z]}
      onClick={onClick}
    >
      <boxGeometry args={[VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

Voxel.displayName = 'Voxel';
