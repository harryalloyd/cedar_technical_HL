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
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  /**
   * Track pointer down to detect dragging
   */
  const handlePointerDown = (event: any) => {
    isDragging.current = false;
    dragStartPos.current = { x: event.clientX, y: event.clientY };
  };

  /**
   * Track pointer move to detect if user is dragging
   */
  const handlePointerMove = (event: any) => {
    if (dragStartPos.current) {
      const dx = event.clientX - dragStartPos.current.x;
      const dy = event.clientY - dragStartPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If moved more than 5 pixels, consider it a drag
      if (distance > 5) {
        isDragging.current = true;
      }
    }
  };

  /**
   * Handle clicks on the grid plane to add voxels
   * Only adds if user didn't drag (prevents placement after rotate/pan)
   */
  const handlePlaneClick = (event: any) => {
    event.stopPropagation();

    // Don't place voxel if user was dragging to rotate/pan
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    if (currentTool === 'remove') return;

    const point = event.point;

    // Floor to get grid cell, then add 0.5 to center in the cell
    // This makes voxels align with grid squares instead of intersections
    const gridPos: Position = {
      x: Math.floor(point.x) + 0.5,
      y: 0.5, // Start at 0.5 so voxel sits on grid
      z: Math.floor(point.z) + 0.5,
    };

    // Check bounds
    const maxBound = GRID_SIZE / 2;
    if (Math.abs(gridPos.x) <= maxBound && Math.abs(gridPos.z) <= maxBound) {
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
    <group onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
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

      {/* Grid Helper - double-sided so visible from below */}
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
        position={[0, 0, 0]}
        side={THREE.DoubleSide}
      />

      {/* Invisible ground plane for click detection - double-sided */}
      <mesh
        ref={gridPlaneRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
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
    </group>
  );
}
