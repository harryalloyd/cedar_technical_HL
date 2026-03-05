# Voxel Editor

A browser-based 3D voxel editor built for Cedar's technical challenge.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **3D Rendering:** React Three Fiber + Three.js
- **Helpers:** @react-three/drei (OrbitControls, Grid)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Features

### Core Features
- ✅ 3D voxel grid with place/remove functionality
- ✅ Rotate, zoom, and pan camera controls
- ✅ Color palette selector (8 colors)
- ✅ Tool selection (Add/Remove mode)
- ✅ Clear all functionality
- ✅ Visual grid helper
- ✅ Real-time voxel count display

### Architecture Highlights
- **Performance Optimized:** Uses `Map` data structure for O(1) voxel lookups
- **Memoized Components:** Voxels only re-render when their data changes
- **Type-Safe:** Full TypeScript coverage
- **Clean Code:** Organized component structure with custom hooks

## Development

### Prerequisites
- Node.js >= 18.17.0
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## How to Use

1. **Add Voxels:** Select "Add Voxel" tool, choose a color, click on the grid
2. **Remove Voxels:** Select "Remove Voxel" tool, click on existing voxels
3. **Navigate:**
   - Right-click + drag to rotate
   - Scroll to zoom
   - Middle-click + drag to pan
4. **Clear All:** Remove all voxels at once

## Project Structure

```
voxel-editor/
├── app/
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── VoxelEditor.tsx    # Main editor component
│   ├── Scene.tsx          # 3D scene with lighting and controls
│   ├── VoxelGrid.tsx      # Renders all voxels
│   ├── Voxel.tsx          # Individual voxel component
│   └── UI/
│       ├── ColorPicker.tsx   # Color selection UI
│       ├── Toolbar.tsx       # Tool selection UI
│       └── Instructions.tsx  # Control instructions
├── hooks/
│   └── useVoxelState.ts   # Voxel state management
├── types/
│   └── voxel.ts           # TypeScript type definitions
└── utils/
    ├── constants.ts       # Constants (grid size, colors)
    └── voxelHelpers.ts    # Helper functions
```

## Technical Decisions

### Why React Three Fiber?
- Declarative React components for Three.js
- Better developer experience for rapid prototyping
- Easy integration with Next.js
- AI-friendly code structure for debugging

### Why Map over Array?
- O(1) lookups by position key vs O(n) array search
- Efficient add/remove operations
- Natural fit for sparse 3D grid

### Performance Considerations
- Memoized voxel components prevent unnecessary re-renders
- Mathematical raycasting against ground plane (not per-voxel)
- Shared materials for voxels of the same color
- Can easily scale to 1000+ voxels

## Future Enhancements

Potential stretch features that could be added:
- Undo/Redo system
- Keyboard shortcuts
- Save/Load to localStorage
- Export to file formats
- AI-powered text-to-voxel generation
- Advanced drawing tools (paint, fill)
- Lighting and shadows
- Mobile touch controls

## Notes

This project was built as part of Cedar's internship technical challenge. The focus was on:
- Clean, readable code
- Performance optimization
- Good UX/UI design
- Effective use of AI tools during development

---

Built with ❤️ using Claude AI assistance
