import React, { useRef, useState } from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import { VoxelGrid } from './VoxelGrid';
import { VoxelMap, Position, Tool } from '@/types/voxel';
import { GRID_SIZE } from '@/utils/constants';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  voxels: VoxelMap;
  selectedColor: string;
  currentTool: Tool;
  onAddVoxel: (position: Position) => void;
  onRemoveVoxel: (position: Position) => void;
}

/**
 * Main 3D scene containing voxels, grid, lighting, and controls
 */
export function Scene({ voxels, selectedColor, currentTool, onAddVoxel, onRemoveVoxel }: SceneProps) {
  const { camera, raycaster } = useThree();
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const gridPlaneRef = useRef<THREE.Mesh>(null);

  /**
   * Handle clicks on the grid plane to add voxels
   * Raycasts to find the intersection point and rounds to grid coordinates
   */
  const handlePlaneClick = (event: any) => {
    event.stopPropagation();

    if (currentTool === 'remove') return;

    const point = event.point;

    // Round to nearest grid position
    const gridPos: Position = {
      x: Math.round(point.x),
      y: 0, // Start at ground level
      z: Math.round(point.z),
    };

    // Check bounds
    if (Math.abs(gridPos.x) <= GRID_SIZE / 2 && Math.abs(gridPos.z) <= GRID_SIZE / 2) {
      onAddVoxel(gridPos);
    }
  };

  /**
   * Handle clicks on existing voxels to remove them
   */
  const handleVoxelClick = (key: string) => {
    if (currentTool === 'remove') {
      const voxel = voxels.get(key);
      if (voxel) {
        onRemoveVoxel(voxel.position);
      }
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -5]} intensity={0.5} />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />

      {/* Grid Helper */}
      <Grid
        args={[GRID_SIZE, GRID_SIZE]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={50}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />

      {/* Invisible ground plane for click detection */}
      <mesh
        ref={gridPlaneRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Voxels */}
      <VoxelGrid voxels={voxels} onVoxelClick={handleVoxelClick} />

      {/* Hover preview (optional - can add later) */}
      {hoverPosition && currentTool === 'add' && (
        <mesh position={[hoverPosition.x, hoverPosition.y, hoverPosition.z]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={selectedColor} opacity={0.5} transparent />
        </mesh>
      )}
    </>
  );
}
