import React, { useRef, useState } from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import { VoxelGrid } from './VoxelGrid';
import { VoxelMap, Position, Tool } from '@/types/voxel';
import { GRID_SIZE, MAX_HEIGHT } from '@/utils/constants';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  voxels: VoxelMap;
  selectedColor: string;
  currentTool: Tool;
  onAddVoxel: (position: Position) => boolean;
  onRemoveVoxel: (position: Position) => void;
}

/**
 * Main 3D scene containing voxels, grid, lighting, and controls
 */
export function Scene({ voxels, selectedColor, currentTool, onAddVoxel, onRemoveVoxel }: SceneProps) {
  const { camera, raycaster } = useThree();
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const [occupiedFeedback, setOccupiedFeedback] = useState<Position | null>(null);
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
   * CRITICAL: Check if voxel was hit first to prevent placing through voxels
   */
  const handlePlaneClick = (event: any) => {
    event.stopPropagation();

    // Don't place voxel if user was dragging to rotate/pan
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    // Only allow in Add mode
    if (currentTool !== 'add') return;

    // CRITICAL: Check if we hit a voxel first (higher priority than grid)
    // This prevents "placing through" voxels when clicking them
    const voxelHit = event.intersections?.find((hit: any) =>
      hit.object.userData?.isVoxel === true
    );

    if (voxelHit) {
      // Don't place on grid if voxel was clicked
      // The voxel's onClick handler will handle this
      return;
    }

    // No voxel hit - place on empty grid
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
      const success = onAddVoxel(gridPos);

      // Show occupied feedback if placement failed
      if (!success) {
        setOccupiedFeedback(gridPos);
        // Clear feedback after animation
        setTimeout(() => setOccupiedFeedback(null), 300);
      }
    }
  };

  /**
   * Handle clicks on existing voxels
   * Remove mode: deletes the voxel
   * Add mode: places voxel adjacent to clicked face
   */
  const handleVoxelClick = (key: string, event: any) => {
    event.stopPropagation(); // Already called in Voxel.tsx but defensive

    // Don't act if user was dragging
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    if (currentTool === 'remove') {
      const voxel = voxels.get(key);
      if (voxel) {
        onRemoveVoxel(voxel.position);
      }
    } else if (currentTool === 'add') {
      // Get first intersection (nearest voxel hit)
      const hit = event.intersections?.[0];
      if (!hit || !hit.face) return;

      // Get the clicked voxel's position (grid-aligned, reliable)
      const clickedVoxel = voxels.get(key);
      if (!clickedVoxel) return;

      const { x, y, z } = clickedVoxel.position;
      const normal = hit.face.normal;

      // Calculate adjacent position (clicked voxel + face normal)
      // Normal is always (-1, 0, or 1) in each axis, so simple addition works
      const adjacentPos: Position = {
        x: x + normal.x,
        y: y + normal.y,
        z: z + normal.z,
      };

      // Check bounds
      const maxBound = GRID_SIZE / 2;
      if (
        Math.abs(adjacentPos.x - 0.5) <= maxBound &&
        Math.abs(adjacentPos.z - 0.5) <= maxBound &&
        adjacentPos.y >= 0.5 &&
        adjacentPos.y <= MAX_HEIGHT
      ) {
        const success = onAddVoxel(adjacentPos);

        // Show occupied feedback if placement failed
        if (!success) {
          setOccupiedFeedback(adjacentPos);
          setTimeout(() => setOccupiedFeedback(null), 300);
        }
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
        userData={{ isGridPlane: true }} // Mark for intersection filtering
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

      {/* Occupied feedback - red flash when trying to place on occupied cell */}
      {occupiedFeedback && (
        <mesh position={[occupiedFeedback.x, occupiedFeedback.y, occupiedFeedback.z]}>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial color="#ff0000" opacity={0.4} transparent />
        </mesh>
      )}
    </group>
  );
}
