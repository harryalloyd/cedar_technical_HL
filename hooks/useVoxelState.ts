import { useState, useCallback } from 'react';
import { Position, Voxel, VoxelMap, Tool, Command } from '@/types/voxel';
import { positionToKey } from '@/utils/voxelHelpers';
import { DEFAULT_COLOR } from '@/utils/constants';

const MAX_HISTORY = 100;

export function useVoxelState() {
  const [voxels, setVoxels] = useState<VoxelMap>(new Map());
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [currentTool, setCurrentTool] = useState<Tool>('add');

  // History state
  const [history, setHistory] = useState<Command[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number>(-1);

  /**
   * Add command to history and truncate forward history (browser-style branching)
   */
  const recordCommand = useCallback((command: Command) => {
    setHistory(prev => {
      // Discard any forward history after cursor (branching)
      const newHistory = prev.slice(0, historyCursor + 1);
      newHistory.push(command);

      // Limit to MAX_HISTORY entries (truncate from start)
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(newHistory.length - MAX_HISTORY);
      }

      return newHistory;
    });

    setHistoryCursor(prev => {
      const newCursor = prev + 1;
      return newCursor >= MAX_HISTORY ? MAX_HISTORY - 1 : newCursor;
    });
  }, [historyCursor]);

  /**
   * Apply a command (for redo)
   */
  const applyCommand = useCallback((command: Command) => {
    if (command.type === 'add' && command.position && command.color) {
      const key = positionToKey(command.position);
      setVoxels(prev => {
        const next = new Map(prev);
        next.set(key, { position: command.position!, color: command.color! });
        return next;
      });
    } else if (command.type === 'remove' && command.position) {
      const key = positionToKey(command.position);
      setVoxels(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    } else if (command.type === 'clear') {
      setVoxels(new Map());
    }
  }, []);

  /**
   * Reverse a command (for undo)
   */
  const reverseCommand = useCallback((command: Command) => {
    if (command.type === 'add' && command.position) {
      // Undo add = remove
      const key = positionToKey(command.position);
      setVoxels(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    } else if (command.type === 'remove' && command.position && command.color) {
      // Undo remove = add back
      const key = positionToKey(command.position);
      setVoxels(prev => {
        const next = new Map(prev);
        next.set(key, { position: command.position!, color: command.color! });
        return next;
      });
    } else if (command.type === 'clear' && command.snapshot) {
      // Undo clear = restore snapshot
      setVoxels(new Map(command.snapshot));
    }
  }, []);

  const addVoxel = useCallback((position: Position, color?: string): boolean => {
    const key = positionToKey(position);
    const voxelColor = color || selectedColor;

    // Check if cell is already occupied
    const exists = voxels.has(key);
    if (exists) {
      return false;
    }

    // Add voxel
    setVoxels(prev => {
      const next = new Map(prev);
      next.set(key, { position, color: voxelColor });
      return next;
    });

    // Record command for undo/redo
    recordCommand({
      type: 'add',
      position,
      color: voxelColor,
    });

    return true;
  }, [selectedColor, voxels, recordCommand]);

  const removeVoxel = useCallback((position: Position) => {
    const key = positionToKey(position);
    const voxel = voxels.get(key);

    if (!voxel) return; // Nothing to remove

    // Remove voxel
    setVoxels(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });

    // Record command with color for undo
    recordCommand({
      type: 'remove',
      position,
      color: voxel.color,
    });
  }, [voxels, recordCommand]);

  const clearAll = useCallback(() => {
    if (voxels.size === 0) return; // Nothing to clear

    // Record command with snapshot for undo
    recordCommand({
      type: 'clear',
      snapshot: new Map(voxels),
    });

    setVoxels(new Map());
  }, [voxels, recordCommand]);

  /**
   * Undo: Move cursor back and reverse command
   */
  const undo = useCallback(() => {
    if (historyCursor < 0) return; // Nothing to undo

    const command = history[historyCursor];
    reverseCommand(command);
    setHistoryCursor(prev => prev - 1);
  }, [history, historyCursor, reverseCommand]);

  /**
   * Redo: Move cursor forward and apply command
   */
  const redo = useCallback(() => {
    if (historyCursor >= history.length - 1) return; // Nothing to redo

    const command = history[historyCursor + 1];
    applyCommand(command);
    setHistoryCursor(prev => prev + 1);
  }, [history, historyCursor, applyCommand]);

  const canUndo = historyCursor >= 0;
  const canRedo = historyCursor < history.length - 1;

  return {
    voxels,
    selectedColor,
    setSelectedColor,
    currentTool,
    setCurrentTool,
    addVoxel,
    removeVoxel,
    clearAll,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
