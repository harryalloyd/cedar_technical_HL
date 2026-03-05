import { Position } from '@/types/voxel';

/**
 * Converts a position object to a string key for Map storage
 * @param pos Position object
 * @returns String key in format "x,y,z"
 */
export function positionToKey(pos: Position): string {
  return `${pos.x},${pos.y},${pos.z}`;
}

/**
 * Converts a string key back to a Position object
 * @param key String key in format "x,y,z"
 * @returns Position object
 */
export function keyToPosition(key: string): Position {
  const [x, y, z] = key.split(',').map(Number);
  return { x, y, z };
}

/**
 * Rounds a position to the nearest grid point
 * @param pos Position to round
 * @returns Rounded position
 */
export function roundToGrid(pos: Position): Position {
  return {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
    z: Math.round(pos.z),
  };
}
