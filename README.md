# Voxel Editor

A browser-based 3D voxel editor built for Cedar's technical challenge.

**Live Demo:** https://cedar-technical-hl.vercel.app

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **3D Rendering:** React Three Fiber + Three.js
- **UI Helpers:** @react-three/drei (OrbitControls, Grid)
- **Color Picker:** react-colorful
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (auto-deploy from main branch)

## Features

### Core Features ✅
- **3D Voxel Grid:** Place and remove voxels with face-based stacking
- **Camera Controls:** Rotate (right-click drag), zoom (scroll), pan (middle-click drag)
- **Color Selection:** 7-color palette + custom color wheel picker
- **Tool Modes:** Add voxel, Remove voxel, Clear all
- **Undo/Redo:** Browser-style history with keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- **Collapsible Sidebar:** Toggle controls panel to maximize canvas space
- **Visual Grid:** Double-sided grid helper visible from all angles
- **Real-time Stats:** Live voxel count display

### UX Enhancements
- **Smart Placement:** Voxels snap to grid centers and stack on adjacent faces
- **Drag Detection:** Prevents accidental placement when rotating camera
- **Keyboard Shortcuts:** Full undo/redo support (Mac: Cmd+Z/Shift+Z, Windows: Ctrl+Z/Y)

### Architecture Highlights
- **Performance Optimized:** Map data structure for O(1) voxel lookups by position
- **Memoized Components:** Voxels only re-render when their data changes
- **Command Pattern:** Undo/redo system with browser-style history branching
- **Type-Safe:** Full TypeScript coverage with strict null checks
- **Clean Code:** Organized component structure with custom hooks


## How to Use

### Basic Controls
1. **Add Voxels:**
   - Click "Add Voxel" button (it's selected by default)
   - Choose a color from the palette (or click + for custom color)
   - Click on the grid to place voxels
   - Click on existing voxel faces to stack vertically

2. **Remove Voxels:**
   - Click "Remove Voxel" button
   - Click on existing voxels to delete them

3. **Camera Navigation:**
   - **Rotate:** Right-click + drag
   - **Zoom:** Scroll wheel
   - **Pan:** Middle-click + drag

4. **Other Actions:**
   - **Clear All:** Remove all voxels at once
   - **Undo:** Cmd/Ctrl+Z (or click back arrow in History section)
   - **Redo:** Cmd/Ctrl+Shift+Z or Ctrl+Y (or click forward arrow)
   - **Collapse Sidebar:** Click chevron (▼) in Controls header

### Tips
- Voxels place on the face you click (use different camera angles for precise placement)
- The color wheel expands below the palette when clicked
- Undo/redo works for add, remove, and clear all operations

## Project Structure

```
voxel-editor/
├── app/
│   ├── page.tsx              # Main page entry point
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles
├── components/
│   ├── VoxelEditor.tsx       # Main editor component (state container)
│   ├── Scene.tsx             # 3D scene with lighting, controls, raycasting
│   ├── VoxelGrid.tsx         # Renders all voxels efficiently
│   ├── Voxel.tsx             # Individual voxel component (memoized)
│   └── UI/
│       ├── ColorPicker.tsx   # 2×4 color grid + custom wheel
│       ├── HistoryControls.tsx  # Undo/redo buttons
│       └── Instructions.tsx  # Control reference (bottom-right)
├── hooks/
│   └── useVoxelState.ts      # Voxel state + history management
├── types/
│   └── voxel.ts              # TypeScript type definitions
└── utils/
    ├── constants.ts          # Grid size, color palette
    └── voxelHelpers.ts       # Position key helpers
```

## Technical Decisions

### Why React Three Fiber?
- Declarative React components for Three.js scenes
- Better developer experience for rapid prototyping
- Easy integration with Next.js and React state
- AI-friendly code structure for iterative development

### Why Map over Array for Voxel Storage?
- **O(1) lookups** by position key (e.g., "0.5,0.5,0.5") vs O(n) array search
- **Efficient operations:** Add/remove don't require filtering entire array
- **Sparse grid:** Only stores occupied cells (memory efficient for large grids)
- **Natural deduplication:** Map keys prevent duplicate positions

### Why Command Pattern for Undo/Redo?
- **Browser-style UX:** Users already understand back/forward navigation
- **Simple cursor model:** Single array + index vs managing two stacks
- **History branching:** Slice at cursor naturally discards forward history
- **Debuggable:** Easy to inspect command array in DevTools

### Performance Considerations
- **Memoized voxel components** prevent unnecessary re-renders (React.memo)
- **Mathematical raycasting** against ground plane (not per-voxel hit detection)
- **Shared materials** for voxels of the same color
- **Event propagation control** (stopPropagation on voxel clicks)
- **Drag detection** avoids processing clicks during camera manipulation
- Handles 1000+ voxels at 60fps on modern hardware

## Implementation Notes

### Key Features Implemented
1. **Voxel Stacking:** Face-normal-based placement allows building upward/sideways
2. **Grid-Centered Placement:** `Math.floor(point) + 0.5` ensures voxels fill grid squares
3. **Color Wheel Integration:** Expandable picker (react-colorful) alongside quick-pick swatches
4. **Undo/Redo System:** Command pattern with 100-entry history limit
5. **Collapsible UI:** Sidebar toggle via chevron button (DOM-based for simplicity)

### Bug Fixes Applied
- **Raycast cut-through:** Event propagation + intersection filtering
- **Edge/corner placement:** Grid-based math instead of world-space coordinates
- **Face normal detection:** Transform normal to world space, find specific voxel intersection
- **Color replacement:** Check `Map.has()` before adding voxel in Add mode
- **Drag prevention:** Track pointer movement distance, abort click if >5px drag

## Known Limitations

- **Desktop-focused:** Optimized for mouse/trackpad (touch controls not implemented)
- **No persistence:** Scene resets on page refresh (save/load feature not included)
- **Single undo branch:** Going back and making new edits discards forward history (intentional, matches browser UX)

## Approach

- **Approach:** AI-assisted development with Claude Code (documented in ai-notes/)


## Credits

Built by Harrison Lloyd for Cedar's summer internship technical challenge.

**Technologies:**
- Next.js, React, TypeScript
- Three.js, React Three Fiber, @react-three/drei
- react-colorful, Tailwind CSS
- Deployed on Vercel

**AI Assistance:**
Developed with extensive use of Claude Code (Anthropic) for:
- Architecture planning and trade-off analysis
- Implementation of complex features (undo/redo, raycasting)
- Debugging and bug fixing
- Documentation and code review

All AI interactions documented in `ai-notes/` folder (not committed to repo).
