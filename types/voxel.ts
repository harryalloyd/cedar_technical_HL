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

// History/Undo-Redo Commands
export type CommandType = 'add' | 'remove' | 'clear';

export interface Command {
  type: CommandType;
  position?: Position;
  color?: string;
  snapshot?: VoxelMap; // For clear command - stores entire grid state
}
