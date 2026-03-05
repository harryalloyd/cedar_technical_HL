export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Voxel {
  position: Position;
  color: string;
}

export type VoxelMap = Map<string, Voxel>;

export type Tool = 'add' | 'remove';
