'use client';

interface HistoryControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Undo/Redo history controls for the sidebar
 */
export function HistoryControls({ onUndo, onRedo, canUndo, canRedo }: HistoryControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-12 h-12 rounded transition-all ${
          canUndo
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
        }`}
        title={canUndo ? 'Undo (Cmd/Ctrl+Z)' : 'Nothing to undo'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`w-12 h-12 rounded transition-all ${
          canRedo
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
        }`}
        title={canRedo ? 'Redo (Cmd/Ctrl+Shift+Z)' : 'Nothing to redo'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
